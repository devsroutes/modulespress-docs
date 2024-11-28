# Execution Context

The Execution Context is a fundamental concept in ModulesPress that provides crucial information about the current execution state of your WordPress plugin. It serves as a central point for tracking and managing different types of contexts throughout the request lifecycle.

## Overview

When WordPress processes a request or executes a script, ModulesPress creates an Execution Context after the plugin bootstrap. This context maintains information about:

- REST API requests (REST Context)
- WordPress hooks being executed (Hook Contexts)
- Current execution state and environment

## Context Types

### REST Context

The REST Context is available when WordPress receives a REST API call and initializes the `WP_REST_Server`. It provides:

```php
// Example of accessing REST context
$restContext = $executionContext->switchToRESTContext();
if ($restContext) {
    $request = $restContext->getWPRequest();
    $response = $restContext->getWPResponse();
    $controller = $restContext->getController();
}
```

Key features:
- Access to WP_REST_Request and WP_REST_Response objects
- Route information
- Controller and method reflections
- Request/response manipulation capabilities

### Hook Context

Hook Contexts represent WordPress action and filter hooks. They're managed as a stack:

```php
// Example of working with hook context
$hookContext = $executionContext->switchToHookContext();
if ($hookContext) {
    $hookable = $hookContext->getHookable();
    $args = $hookContext->getArgs();
}
```

Key features:
- Stack-based hook tracking
- Access to hook arguments
- Hook type information (action/filter)
- Method and class reflections

## Context Stack Management

The Hook Context stack operates on a Last-In-First-Out (LIFO) principle:

1. When a hook executes, its context is pushed onto the stack
2. Nested hooks are added on top of the stack
3. As hooks complete, their contexts are popped from the stack
4. `switchToHookContext()` always returns the current (top) hook context

```php
// Internal stack management (handled automatically)
$executionContext->pushHookContext($newContext);
// ... hook execution ...
$executionContext->popHookContext();
```

## Practical Usage

### Checks

```php
class IsAdminMenuCheck implements CanActivate
{
    public function __construct(
        private readonly string $slug
    ) {}

    public function canActivate(ExecutionContext $executionContext): bool
    {
        $hookCtx =  $executionContext->switchToHookContext();

        if ($hookCtx?->getHookable()?->getHookName() === 'admin_enqueue_scripts') {
            [$hook] = $hookCtx->getArgs();
            if ($hook === $this->slug) {
                return true;
            }
        }

        return false;
    }
}
```

### Guards

```php
class MainGuard implements CanActivate
{
    public function canActivate(ExecutionContext $executionContext): bool
    {   return true;
        if (!isset($executionContext->switchToRESTContext()->getWPRequest()->get_json_params()["nonce"])) {
            throw new UnauthorizedHttpException("You are not authorized to access this resource due to missing nonce.");
        } else {
            return true;
        }
    }
}
```

### Interceptors

```php
class TimingInterceptor implements Interceptor {
    public function intercept(ExecutionContext $context, CallHandler $next): mixed {
        $start = microtime(true);
        $result = $next->handle();
        $duration = microtime(true) - $start;
        
        if ($context->switchToRESTContext()) {
            // Add timing information to REST response
            return array_merge($result, ['execution_time' => $duration]);
        }
        
        return $result;
    }
}
```

### Exception Filters

```php
#[CatchException]
class CustomExceptionFilter implements ExceptionFilter {
    public function catchException(
        BaseException $exception, 
        ExecutionContext $context
    ): mixed {
        if ($context->switchToRESTContext()) {
            // Handle REST API exceptions
            return new WP_REST_Response([
                'error' => $exception->getMessage()
            ], $exception->getCode());
        }
        
        // Handle regular exceptions
        return new HtmlResponse(
            '<h1>Error</h1>',
            $exception->getCode()
        );
    }
}
```

## Best Practices

1. **Context Switching**
   - Always check for null when switching contexts
   - Use optional chaining when accessing context properties
   - Don't assume a specific context type is available

2. **Hook Context Usage**
   - Remember that hook contexts are temporary
   - Don't store hook context references
   - Use the context immediately when needed

3. **REST Context**
   - Verify REST context availability before accessing REST-specific features
   - Use type-hinting for better IDE support
   - Leverage context information for proper response formatting

4. **Performance Considerations**
   - Context switching is lightweight
   - Hook context stack is memory-efficient
   - Context objects are immutable

## Integration with ModulesPress Features

The Execution Context integrates seamlessly with other ModulesPress features:

- **Checks**: Used for conditional add_action/add_filter
- **Guards**: Used for context-based access control
- **Interceptors**: Enables request/response manipulation
- **Exception Filters**: Provides context for error responses

## Conclusion

The Execution Context is a powerful feature that provides essential information about the current execution state. By understanding and properly utilizing the context system, you can create more robust and context-aware WordPress plugins with ModulesPress.