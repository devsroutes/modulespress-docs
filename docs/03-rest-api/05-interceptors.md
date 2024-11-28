---
sidebar_position: 5
---

# Interceptors

Interceptors are powerful middleware components that allow you to intercept and modify the execution flow of method handlers across your plugin. They provide an elegant way to add cross-cutting functionality such as logging, caching, response transformation, and performance monitoring.

## Overview

Interceptors can:
- Transform request/response data
- Add additional logic before/after method execution
- Measure execution time
- Handle errors
- Implement caching
- Add headers or metadata
- Modify the execution flow

## Basic Structure

Every interceptor must implement the `Interceptor` interface:

```php title="src/Interceptors/BaseInterceptor.php"
use ModulesPress\Foundation\Interceptor\Contracts\Interceptor;
use ModulesPress\Foundation\Interceptor\CallHandler;
use ModulesPress\Core\ExecutionContext\ExecutionContext;

class BaseInterceptor implements Interceptor 
{
    public function intercept(
        ExecutionContext $context, 
        CallHandler $next
    ): mixed {
        // Pre-execution logic
        
        $result = $next->handle();
        
        // Post-execution logic
        
        return $result;
    }
}
```

### Execution Order

Interceptors follow a "Russian Doll" model of execution:

```text
FirstInterceptor
  └─ SecondInterceptor
      └─ ThirdInterceptor
          └─ Handler Execution
      └─ ThirdInterceptor (post-execution)
  └─ SecondInterceptor (post-execution)
└─ FirstInterceptor (post-execution)
```

### Discovery Order of Interceptors

Interceptors are executed in a specific order of discovery:  
1. **Global Plugin Interceptors** – Applied globally across the plugin.  
2. **Class-Level Interceptors** – Applied to a specific controller.  
3. **Method-Level Interceptors** – Applied to individual methods, offering the highest level of specificity.  

This hierarchical execution ensures that broader rules are applied before more specific ones.
:::tip Understanding Execution Order
Think of interceptors like layers of an onion. The request travels through each layer from outside to inside, then the response travels back through the same layers from inside to outside.
:::

## Common Use Cases

Let's explore some powerful real-world applications of interceptors that can immediately enhance your plugin's capabilities.

### Performance Monitoring

One of the most valuable applications of interceptors is performance monitoring. This interceptor automatically tracks execution time and memory usage for any endpoint, making it perfect for identifying bottlenecks and optimizing performance.

:::tip Pro Tip
Consider combining this interceptor with a logging service to track performance metrics over time and set up alerts for slow endpoints.
:::

```php title="src/Interceptors/PerformanceInterceptor.php"
class PerformanceInterceptor implements Interceptor 
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed 
    {
        $start = microtime(true);
        
        try {
            $result = $next->handle();
            
            $executionTime = microtime(true) - $start;
            
            // Add performance data to response
            if (is_array($result)) {
                $result['metrics'] = [
                    'executionTime' => round($executionTime * 1000, 2) . 'ms',
                    'memoryUsage' => memory_get_peak_usage(true)
                ];
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Execution failed after " . (microtime(true) - $start) . " seconds");
            throw $e;
        }
    }
}
```

### Response Transformation

Transform and standardize your API responses with ease. This pattern ensures consistent response structures across your entire plugin, making it easier for frontend teams to work with your API. However, MP by default always gives a structured output.

:::info
This is particularly useful when working with multiple teams or maintaining backwards compatibility while evolving your API.
:::

```php title="src/Interceptors/ResponseTransformInterceptor.php"
class ResponseTransformInterceptor implements Interceptor 
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed 
    {
        $result = $next->handle();
        
        return [
            'status' => 'success',
            'data' => $result,
            'timestamp' => time(),
            'version' => '1.0'
        ];
    }
}
```

### Caching

Implement sophisticated caching strategies without cluttering your business logic. This interceptor seamlessly integrates with WordPress's caching system while maintaining clean controller code.

:::tip Performance Boost
Remember to adjust cache duration based on your data's volatility. High-traffic endpoints with relatively static data can benefit from longer cache times.
:::

```php title="src/Interceptors/CacheInterceptor.php"
class CacheInterceptor implements Interceptor 
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed 
    {
        $key = $this->generateCacheKey($context);
        
        if ($cachedValue = wp_cache_get($key, MyPlugin::SLUG)) {
            return $cachedValue;
        }
        
        $result = $next->handle();
        wp_cache_set($key, $result, MyPlugin::SLUG, 3600);
        
        return $result;
    }
    
    private function generateCacheKey(ExecutionContext $context): string 
    {
        $restContext = $context->switchToRESTContext();
        return MyPlugin::SLUG . md5($restContext->getWPRequest()->get_route());
    }
}
```

## Using Interceptors

Interceptors can be applied at different levels of your plugin. Here's how to choose the right level for your use case.

### Method Level

Perfect for specific endpoint behavior. Use this when you need fine-grained control over interceptor application.

```php title="src/Controllers/ProductsController.php"
class ProductsController 
{
    #[UseInterceptors(CacheInterceptor::class)]
    #[Get("featured")]
    public function getFeaturedProducts(): array 
    {
        return $this->productService->getFeatured();
    }
}
```

### Controller Level

Ideal for related endpoints that share common behavior. This approach reduces code duplication and ensures consistent handling across all controller methods.

```php title="src/Controllers/OrdersController.php"
#[UseInterceptors(AuthInterceptor::class, LoggingInterceptor::class)]
#[RestController("/orders")]
class OrdersController 
{
    // All methods inherit these interceptors
}
```

### Global Level

The broadest scope for interceptors. Use this for plugin-wide concerns like metrics, logging, or error boundaries.

```php title="src/Modules/Shop/ShopModule.php"
class ShopModule extends ModulesPressModule 
{
    public function pluginInterceptors(): array 
    {
        return [
            new MetricsInterceptor(),
            LoggingInterceptor::class,
            new ErrorHandlingInterceptor('shop')
        ];
    }
}
```

## Advanced Patterns

These sophisticated patterns demonstrate the true power of interceptors in handling complex cross-cutting concerns.

### Blog Information Interceptor

A perfect example of enriching responses with contextual data. This pattern is especially useful in multisite WordPress installations where blog-specific information is crucial.

:::info Use Case
This interceptor is particularly valuable for headless WordPress implementations where the frontend needs quick access to blog metadata.
:::

```php title="src/Interceptors/BlogInfoInterceptor.php"
class BlogInfoInterceptor implements Interceptor 
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed 
    {
        $result = $next->handle();
        
        $restContext = $context->switchToRESTContext();
        $params = $restContext->getWPRequest()->get_json_params();
        
        if (isset($params['blog_id']) && is_array($result)) {
            $blog = get_blog_details($params['blog_id']);
            if ($blog) {
                $result['blog'] = [
                    'name' => $blog->blogname,
                    'url' => $blog->siteurl,
                ];
            }
        }
        
        return $result;
    }
}
```

### Blog Switch Interceptor

Another example is in a multisite installation, This interceptor is designed for WordPress multisite 
installations. It ensures that the appropriate blog context is switched to before the request 
handler processes the logic. The interceptor reads the Blog-Id from the request header, 
switches to the corresponding blog using switch_to_blog($blogId), and restores the 
original blog context after execution. This guarantees that database operations are 
performed on the correct tables for the specified blog. If the Blog-Id header is missing, 
it throws a BadRequestHttpException.

```php title="src/Interceptors/BlogInfoInterceptor.php"
class BlogInfoInterceptor implements Interceptor 
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed 
    {
        $restContext = $context->switchToRESTContext();
        $blogId = $restContext->getWPRequest()->get_header("Blog-Id");
        if (!$blogId){
            throw new BadRequestHttpException("Blog-Id header is missing.");
        }
        switch_to_blog($blogId);
        $result = $next->handle();
        restore_current_blog();
        return $result;
    }
}
```

### Error Boundary Interceptor

Create a safety net for your plugin by standardizing error handling. This pattern ensures consistent error responses across your entire API.

:::tip Error Handling
Consider using the Exception Filters for more better error handling.
:::

```php title="src/Interceptors/ErrorBoundaryInterceptor.php"
class ErrorBoundaryInterceptor implements Interceptor 
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed 
    {
        try {
            return $next->handle();
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'code' => $e->getCode()
            ];
        }
    }
}
```

## Best Practices

:::tip Key Principles
1. **Single Responsibility**: Each interceptor should focus on one specific concern
2. **Performance First**: Keep interceptors lightweight
3. **Error Handling**: Always consider error cases
4. **Order Matters**: Consider the execution order when combining interceptors
:::

### DO ✅

- Use interceptors for cross-cutting concerns
- Keep interceptors focused and small
- Handle errors appropriately
- Consider the performance impact
- Document interceptor behavior

### DON'T ❌

- Implement complex business logic in interceptors
- Modify the original request unnecessarily
- Ignore error handling
- Chain too many interceptors
- Create interceptors with side effects

## Debugging Tips

1. **Logging Interceptor**
```php
class DebugInterceptor implements Interceptor 
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed 
    {
        error_log("⬇️ Entering " . $this->getHandlerInfo($context));
        
        $result = $next->handle();
        
        error_log("⬆️ Exiting " . $this->getHandlerInfo($context));
        
        return $result;
    }
    
    private function getHandlerInfo(ExecutionContext $context): string 
    {
        $restContext = $context->switchToRESTContext();
        return $restContext->getClassReflection()->getName() . 
               '::' . 
               $restContext->getMethodReflection()->getName();
    }
}
```

2. **Chain Visualization**
```php
#[UseInterceptors(
    DebugInterceptor::class,
    TimingInterceptor::class,
    CacheInterceptor::class
)]
```

## Additional Resources

For more information on advanced interceptor patterns and best practices, refer to:
- Execution Context documentation
- Error Handling strategies using Exception Filters

Remember that interceptors are powerful tools but should be used judiciously to maintain clean, performant code.