---
sidebar_position: 4
---

# Middlewares

Middleware in ModulesPress provides a powerful mechanism to intercept, transform, and control the REST request-response lifecycle. Each middleware acts as a configurable checkpoint in your plugin's request processing pipeline.

## Key Middleware Characteristics

### Middleware Execution Logic

The core principle of middleware is simple yet powerful:
- If a middleware returns the `WP_REST_Request` object, processing continues to the next middleware or route handler
- If a middleware returns a `WP_REST_Response` object, request processing immediately stops, and that response is sent back to the client

### Middleware Configuration

Middlewares are configured within a module's `middlewares()` method using the `MiddlewareConsumer`:

```php
class BooksModule extends ModulesPressModule
{
    public function middlewares(MiddlewareConsumer $consumer): void 
    {
        $consumer->apply(/* Middleware configuration */)
    }
}
```

## Middleware Application Strategies

### 1. Route Method Filtering

You can apply middlewares to specific HTTP methods:

```php
$consumer->apply(AuthMiddleware::class)
    ->forRoutes([
        // Only apply to POST and PUT methods
        ['path' => '*' 'methods' => [RequestMethod::POST, RequestMethod::PUT]]
    ]);
```

### 2. Path-Based Routing

Apply middlewares to specific path patterns:

```php
$consumer->apply(AdminAuthMiddleware::class)
    ->forRoutes([
        // Apply only to admin routes
        ['path' => '#^admin/.*$#', 'methods' => ['*']]
    ]);
```

### 3. Combining Path and Method Filtering

```php
$consumer->apply(SecureMiddleware::class)
    ->forRoutes([
        // Only secure POST requests to book-related routes
        [
            'path' => '#^books/.*$#', 
            'methods' => [RequestMethod::POST]
        ]
    ]);
```

### 4. Global Middleware

Apply middleware to all routes:

```php
// Apply to all routes and all methods
$consumer->apply(LoggingMiddleware::class)
    ->forRoutes('*');
```

### 5. Regex-Based Route Matching

```php
$consumer->apply(ApiKeyMiddleware::class)
    ->forRoutes(
        // Match all routes starting with 'api/'
        '#^api/.*$#',
        // Exact route matching
        'books/special'
    );
```

## Route Exclusion Mechanisms

Exclude specific routes from middleware processing:

```php
$consumer->apply(AuthMiddleware::class)
    ->exclude([
        // Exclude public routes
        ['path' => '#^public/.*$#', 'methods' => ['*']],
        // Exclude specific method on a route
        ['path' => 'login', 'methods' => [RequestMethod::POST]]
    ]);
```

## Middleware Types

### 1. Functional Middleware

Inline, anonymous function-based middleware:

```php
$consumer->apply(
    function (WP_REST_Request $req, WP_REST_Response $res) {
        // Simple header manipulation
        $res->header('X-Processed', 'true');
        return $req; // Continue processing
    }
)->forRoutes('*');
```

### 2. Class-Based Middleware

Dependency-injectable, more structured middleware:

```php
#[Injectable]
class AuthMiddleware implements Middleware 
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function use(WP_REST_Request $req, WP_REST_Response $res): WP_REST_Request|WP_REST_Response 
    {
        if (!$this->authService->isAuthenticated($req)) {
            $res->set_status(401);
            $res->set_data(['error' => 'Unauthorized']);
            return $res; // Immediately terminate
            //or throw new UnauthorizedHttpException();
        }
        
        return $req; // Continue to next middleware
    }
}

//Usage
$consumer->apply(
    AuthMiddleware::class,
    new LoggingMiddleware("BooksModule") // A middleware instance without service dependencies
)->forRoutes('*');
```

## Advanced Middleware Patterns

### 1. Conditional Middleware

```php
$consumer->apply(
    function (WP_REST_Request $req, WP_REST_Response $res) {
        // Dynamic middleware logic
        if ($req->get_method() === 'POST') {
            $res->header('X-Request-Type', 'Create');
        }
        return $req;
    }
)->forRoutes([
    ['routes' => '*', 'methods' => [RequestMethod::POST, RequestMethod::PUT]]
]);
```

### 2. Chained Transformations

```php
$consumer->apply(
    function (WP_REST_Request $req) {
        // First transformation
        $req['timestamp'] = time();
        return $req;
    }
)->apply(
    function (WP_REST_Request $req) {
        // Second transformation
        $req['processed'] = true;
        return $req;
    }
)->forRoutes('*');
```

## Use Case Examples

### Authentication Middleware
```php
class JwtAuthMiddleware implements Middleware 
{
    public function use(WP_REST_Request $req, WP_REST_Response $res): WP_REST_Request|WP_REST_Response 
    {
        $token = $req->get_header('Authorization');
        
        if (!$this->tokenService->validate($token)) {
            $res->set_status(401);
            $res->set_data(['error' => 'Invalid token']);
            return $res; // Terminate request
        }
        
        return $req; // Continue processing
    }
}
```

### Rate Limiting Middleware
```php
class RateLimitMiddleware implements Middleware 
{
    public function use(WP_REST_Request $req, WP_REST_Response $res): WP_REST_Request|WP_REST_Response 
    {
        $clientIp = $req->get_remote_addr();
        
        if ($this->rateLimiter->isLimitExceeded($clientIp)) {
            $res->set_status(429);
            $res->set_data([
                'error' => 'Rate limit exceeded',
                'retry_after' => $this->rateLimiter->getRetryDelay()
            ]);
            return $res; // Immediately return error response
        }
        
        return $req; // Continue processing
    }
}
```

## Best Practices

:::tip Middleware Design Guidelines
- Keep middleware logic concise and focused
- Prefer immutable transformations
- Handle errors gracefully
- Use dependency injection for complex logic
- Minimize performance overhead
:::

:::warning Potential Pitfalls
- Avoid complex state management in middleware
- Don't perform heavy computations
- Be careful with request mutation
- Implement proper error handling
- Secure sensitive operations
:::

## Performance Considerations

- Middleware adds minimal processing overhead
- Prefer lightweight, stateless implementations
- Cache expensive operations when possible
- Use functional middlewares for simple transformations

## Conclusion

Middleware in ModulesPress offers a flexible, powerful mechanism for intercepting and processing HTTP requests. By understanding its configuration options and execution model, you can create robust, secure, and efficient REST API within your WP plugins.