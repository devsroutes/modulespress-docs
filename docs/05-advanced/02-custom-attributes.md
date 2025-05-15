# Custom Attributes

Custom Attributes provide a powerful way to extend ModulesPress functionality by leveraging PHP 8's attribute system alongside execution context reflection capabilities. This enables metadata-driven programming patterns that integrate seamlessly with ModulesPress's checks, guard, interceptor, and filter systems.

## Overview

The power of custom attributes in ModulesPress comes from their ability to:
- Define metadata that can be accessed through execution context reflection
- Create declarative APIs that integrate with guards and interceptors
- Implement aspect-oriented programming patterns
- Enable dynamic behavior based on runtime context

## Creating and Reading Custom Attributes

Custom attributes in ModulesPress follow a three-step pattern: definition, enforcement, and usage. This pattern allows for clean separation of concerns while maintaining type safety and IDE support. The following example demonstrates implementing permission-based access control:

### Basic Pattern

```php
// 1. Define the attribute
#[Attribute(Attribute::TARGET_METHOD)]
class RequirePermission
{
    public function __construct(
        private readonly string $permission
    ) {}

    public function getPermission(): string
    {
        return $this->permission;
    }
}

// 2. Create a guard to enforce it
class PermissionGuard implements CanActivate
{
    public function canActivate(ExecutionContext $context): bool
    {
        // Get REST context to access method reflection
        $restContext = $context->switchToRESTContext();
        if (!$restContext) return false;

        // Extract attributes using reflection
        $attributes = $restContext->getMethodReflection()
            ->getAttributes(RequirePermission::class);

        if (empty($attributes)) return true;

        // Get the required permission
        $permission = $attributes[0]->newInstance()->getPermission();
        
        // Check user permission
        return current_user_can($permission);
    }
}

// 3. Use in controllers
class PostController
{
    #[RequirePermission('edit_posts')]
    public function updatePost(int $id): array
    {
        // Only users with 'edit_posts' can access this
    }
}
```

## Integration with ModulesPress Features

ModulesPress provides several integration points for custom attributes, each serving a specific purpose in the plugin lifecycle. Let's explore how attributes can enhance each feature:

### Guards with Custom Attributes

Guards provide a powerful way to implement cross-cutting concerns like rate limiting. The following example shows how to implement rate limiting using custom attributes and the execution context:

```php
#[Attribute(Attribute::TARGET_METHOD)]
class RateLimit
{
    public function __construct(
        private readonly int $maxRequests,
        private readonly int $timeWindow
    ) {}

    public function getMaxRequests(): int 
    {
        return $this->maxRequests;
    }

    public function getTimeWindow(): int
    {
        return $this->timeWindow;
    }
}

#[Injectable]
class RateLimitGuard implements CanActivate
{
    public function __construct(
        private readonly CacheInterface $cache
    ) {}

    public function canActivate(ExecutionContext $context): bool
    {
        $restContext = $context->switchToRESTContext();
        if (!$restContext) return true;

        // Get RateLimit attributes
        $attributes = $restContext->getMethodReflection()
            ->getAttributes(RateLimit::class);
        
        if (empty($attributes)) return true;

        $rateLimit = $attributes[0]->newInstance();
        $key = $this->getCacheKey($restContext);
        
        return $this->checkRateLimit(
            $key,
            $rateLimit->getMaxRequests(),
            $rateLimit->getTimeWindow()
        );
    }
}
```

### Interceptors with Custom Attributes

Interceptors allow you to transform data before or after method execution. This example demonstrates how to implement response transformation using attributes:

```php
#[Attribute(Attribute::TARGET_METHOD)]
class Transform
{
    public function __construct(
        private readonly string $transformer
    ) {}

    public function getTransformer(): string
    {
        return $this->transformer;
    }
}

class TransformInterceptor implements Interceptor
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed
    {
        $result = $next->handle();
        
        $restContext = $context->switchToRESTContext();
        if (!$restContext) return $result;

        $attributes = $restContext->getMethodReflection()
            ->getAttributes(Transform::class);
            
        if (empty($attributes)) return $result;
        
        $transformerClass = $attributes[0]->newInstance()->getTransformer();
        return (new $transformerClass)->transform($result);
    }
}

// Usage
class PostController
{
    #[Transform(PostTransformer::class)]
    public function getPosts(): array
    {
        return $this->postRepository->findAll();
    }
}
```

### Exception Filters with Custom Attributes

Exception filters can be enhanced with attributes to provide custom error handling based on controller or method metadata:

```php
#[Attribute(Attribute::TARGET_CLASS)]
class ErrorResponse
{
    public function __construct(
        private readonly string $template
    ) {}

    public function getTemplate(): string
    {
        return $this->template;
    }
}

#[CatchException]
class CustomExceptionFilter implements ExceptionFilter
{
    public function catchException(
        BaseException $exception,
        ExecutionContext $context
    ): mixed {
        $restContext = $context->switchToRESTContext();
        if (!$restContext) throw $exception;

        $attributes = $restContext->getClassReflection()
            ->getAttributes(ErrorResponse::class);

        if (empty($attributes)) {
            return new WP_REST_Response([
                'error' => $exception->getMessage()
            ], $exception->getCode());
        }

        $template = $attributes[0]->newInstance()->getTemplate();
        return $this->renderer->render($template, [
            'error' => $exception->getMessage()
        ]);
    }
}
```

### Checks with Custom Attributes

Checks provide a way to conditionally execute code based on the current WordPress hook context:

```php
#[Attribute(Attribute::TARGET_METHOD)]
class RequireHook
{
    public function __construct(
        private readonly string $hookName
    ) {}

    public function getHookName(): string
    {
        return $this->hookName;
    }
}

class HookCheck implements CanActivate
{
    public function canActivate(ExecutionContext $context): bool
    {
        $hookContext = $context->switchToHookContext();
        if (!$hookContext) return false;

        $methodReflection = $hookContext->getMethodReflection();
        $attributes = $methodReflection->getAttributes(RequireHook::class);

        if (empty($attributes)) return true;

        $requiredHook = $attributes[0]->newInstance()->getHookName();
        return $hookContext->getHookable()->getHookName() === $requiredHook;
    }
}
```

## Best Practices

When working with custom attributes in ModulesPress, following these best practices will help ensure maintainable and performant code:

### 1. Attribute Design
Custom attributes should be designed with clarity and maintainability in mind:
- Keep attributes focused and single-purpose
- Use meaningful constructor parameters
- Provide getter methods for all properties
- Consider immutability for thread safety

### 2. Context Usage
Proper handling of execution context is crucial:
- Always check for null when switching contexts
- Use the appropriate context type for your needs
- Cache reflection results when possible
- Handle cases where attributes might not exist

### 3. Integration Patterns
Leverage ModulesPress's features effectively:
- Combine attributes with guards for access control
- Use interceptors for cross-cutting concerns
- Leverage exception filters for consistent error handling
- Implement checks for conditional execution

### 4. Performance Optimization
Consider performance implications:
- Cache attribute reflection results
- Avoid unnecessary context switches
- Keep attribute logic lightweight
- Use appropriate scoping for attributes

## Conclusion

Custom Attributes in ModulesPress provide a powerful way to implement metadata-driven functionality that integrates deeply with the framework's features. By leveraging execution context and reflection capabilities, you can create clean, declarative APIs that enhance your WordPress plugins while maintaining good separation of concerns and maintainability.

The combination of PHP 8 attributes and ModulesPress's execution context system enables powerful patterns for:
- Access control and authorization
- Request/response transformation
- Error handling
- Conditional execution
- Cross-cutting concerns

This approach results in more maintainable, testable, and type-safe WordPress plugins that leverage modern PHP features while maintaining compatibility with WordPress patterns