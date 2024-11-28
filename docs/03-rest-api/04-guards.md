# Guards

Guards are a powerful feature in ModulesPress that provide a robust way to handle authentication, authorization, and other request validations. Similar to NestJS guards, they determine whether a request should be handled by the route handler or blocked based on certain conditions.

## Overview

Guards are classes that implement the `CanActivate` interface and can be used at different levels:
- Method level
- Controller level
- Global level (plugin guards)

They are executed **before** the route handler, making them perfect for:
- Authentication validation
- Role-based access control
- Custom permission systems
- Request validation
- JWT token verification
- Rate limiting

## Basic Guard Structure

Here's the basic structure of a guard:

```php
use ModulesPress\Foundation\Guard\Contracts\CanActivate;
use ModulesPress\Foundation\DI\Attributes\Injectable;
use ModulesPress\Core\ExecutionContext\ExecutionContext;

#[Injectable]
class MyGuard implements CanActivate
{
    public function canActivate(ExecutionContext $ctx): bool
    {
        // Your guard logic here
        return true; // or false
    }
}
```

## Using Guards

Guards are executed in the order they are defined, making the execution order critical. Global guards run first, followed by class-level guards, and finally method-level guards.

### Global/Plugin Guards
You can apply guards to all routes of the entire plugin by overriding the pluginGuards method of any module.

```php
#[Module(
    imports: [],
    providers: [
        BookRepository::class,
        new Provider(
            provide: "bookService",
            useClass: BooksServiceProvider::class,
        ),
    ],
    controllers: [BooksController::class],
    entities: [Book::class],
    exports: []
)]
class BooksModule extends ModulesPressModule
{
    public function pluginGuards(): array
    {
        return [
            MainGuard::class,
            new AnotherGuard()
        ];
    }
}
```

### Controller Level Guards

You can apply guards to an entire controller using the `UseGuards` attribute:

```php
#[UseGuards(new MainGuard())]
#[RestController("/books")]
class BooksController
{
    // Controller methods...
}
```

### Method Level Guards

Guards can also be applied to specific methods:

```php
#[UseGuards(AdminGuard::class)]
#[Get("protected-route")]
public function protectedMethod()
{
    // Only accessible if AdminGuard returns true
}
```

### Multiple Guards

You can chain multiple guards. All guards must return true for the request to proceed:

```php
#[UseGuards(AuthGuard::class, new RoleGuard("ADMIN"), RateLimitGuard::class)]
public function secureMethod()
{
    // This method requires authentication, admin role, and respects rate limiting
}
```

## Error Handling

When a guard returns `false`, ModulesPress automatically throws a `401 UnauthorizedHttpException`. You can customize this behavior by throwing your own exceptions.

```php
public function canActivate(ExecutionContext $ctx): bool
{
    if (!$this->isAuthenticated()) {
        throw new UnauthorizedHttpException('Invalid credentials');
    }
    
    if (!$this->hasRequiredRole()) {
        throw new ForbiddenHttpException('Insufficient permissions');
    }
    
    return true;
}
```
:::tip
You can also leverage exception filters to customize the default exceptions.
:::

## Role-Based Authorization

ModulesPress provides a powerful way to implement role-based access control using guards and attributes. Here's a complete example:

```php
// Define roles using an enum
enum UserRole: string
{
    case SUPER_ADMIN = "cm_super_admin";
    case CHAPTER_ADMIN = "cm_chapter_admin";
    case CHAPTER_MEMBER = "cm_chapter_member";
}

// Create a roles attribute
#[Attribute(Attribute::TARGET_METHOD | Attribute::TARGET_CLASS)]
class Roles
{
    private array $roles = [];

    public function __construct(...$roles)
    {
        $this->roles = $roles;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }
}

// Implement the roles guard
#[Injectable]
class RolesGuard implements CanActivate
{
    public function canActivate(ExecutionContext $ctx): bool
    {
        $restContext = $ctx->switchToRESTContext();
        $roles = $restContext->getMethodReflection()->getAttributes(Roles::class);
        
        if (empty($roles)) {
            return false;
        }

        $requiredRoles = $roles[0]->newInstance()->getRoles();
        return $this->checkUserRoles($requiredRoles);
    }

    private function checkUserRoles(array $roles): bool
    {
        $user = wp_get_current_user();
        foreach ($roles as $role) {
            if ($role === UserRole::SUPER_ADMIN && is_super_admin()) {
                return true;
            }
            if ($user && in_array($role->value, (array) $user->roles)) {
                return true;
            }
        }
        return false;
    }
}
```

Usage in controllers:

```php
#[UseGuards(RolesGuard::class)]
#[Roles(UserRole::CHAPTER_ADMIN, UserRole::SUPER_ADMIN)]
public function adminOnlyMethod()
{
    // Only accessible by chapter admins and super admins
}
```

## Execution Context

Guards have access to the `ExecutionContext`, which provides powerful reflection capabilities:

```php
public function canActivate(ExecutionContext $ctx): bool
{
    $restContext = $ctx->switchToRESTContext();
    
    // Access method reflection
    $method = $restContext->getMethodReflection();
    
    // Access class reflection
    $class = $restContext->getClassReflection();
    
    // Get custom attributes
    $attributes = $method->getAttributes(MyAttribute::class);
    
    // Access WP request object
    $request = $restContext->getWPRequest();
    
    return true;
}
```

## Custom JWT Implementation

Instead of using WordPress nonces, you can implement your own JWT system:

```php
#[Injectable]
class JwtGuard implements CanActivate
{
    public function canActivate(ExecutionContext $ctx): bool
    {
        $request = $ctx->switchToRESTContext()->getWPRequest();
        $token = $request->get_header('Authorization');
        
        if (!$token) {
            return false;
        }
        
        try {
            // Verify JWT token (using your preferred JWT library)
            $decoded = JWT::decode($token, new Key(YOUR_SECRET_KEY, 'HS256'));
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
```

## Best Practices

1. **Single Responsibility**: Each guard should focus on one specific aspect (authentication, roles, rate limiting, etc.).

2. **Guard Order**: When using multiple guards, order them from most general to most specific:
   ```php
   #[UseGuards(AuthGuard::class, RolesGuard::class, SpecificCheckGuard::class)]
   ```

3. **Dependency Injection**: Use constructor injection to access services in guards:
   ```php
   #[Injectable]
   class AuthGuard implements CanActivate
   {
       public function __construct(
           private readonly AuthService $authService
       ) {}
   }
   ```

4. **Reusability**: Design guards to be reusable across different controllers and methods.

5. **Performance**: Keep guard logic lightweight since they execute on every request.

## Common Use Cases

### Rate Limiting Guard

```php
#[Injectable]
class RateLimitGuard implements CanActivate
{
    public function canActivate(ExecutionContext $ctx): bool
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $key = "rate_limit_$ip";
        
        $attempts = get_transient($key) ?: 0;
        if ($attempts >= 100) { // 100 requests per hour
            return false;
        }
        
        set_transient($key, $attempts + 1, HOUR_IN_SECONDS);
        return true;
    }
}
```

### API Key Guard

```php
#[Injectable]
class ApiKeyGuard implements CanActivate
{
    public function canActivate(ExecutionContext $ctx): bool
    {
        $request = $ctx->switchToRESTContext()->getWPRequest();
        $apiKey = $request->get_header('X-API-Key');
        
        return $this->validateApiKey($apiKey);
    }
}
```

## Guards with WordPress Actions and Filters

ModulesPress extends the guard concept to WordPress actions and filters, providing an additional layer of security and control. However, it's crucial to use these guards judiciously, as they can potentially interrupt the WordPress execution flow.

### Basic Implementation

```php
class CrashWP implements CanActivate
{
    public function canActivate(ExecutionContext $ctx): bool
    {
        // Condition to potentially crash WordPress
        $criticalCondition = $this->checkCriticalCondition();
        
        if ($criticalCondition) {
            // This will throw an UnauthorizedHttpException
            return false;
        }
        
        return true;
    }
}

class ProtectThisAction implements CanActivate
{
    public function canActivate(ExecutionContext $ctx): bool
    {
        // Implement access control logic
        return $this->hasSpecialPermission();
    }
}

class MySecretService
{
    // Example of a guard on WordPress init action
    #[UseGuards(new CrashWP())]
    #[Add_Action('init')]
    public function init()
    {
        // This method will be protected by the CrashWP guard
        // If the guard returns false, it will throw an UnauthorizedHttpException
    }

    // Example of a guard on a specific hook
    #[UseGuards(new ProtectThisAction())]
    #[Add_Action('someSpecificHookFired')]
    public function doSecretWork()
    {
        // This method will only execute if ProtectThisAction allows it
    }
}
```

### Potential Risks and Considerations

When using guards with WordPress actions and filters, be aware of the following risk:

1. **Page Crashes**: Throwing an `UnauthorizedHttpException` during critical WordPress actions can lead to:
   - White screen of death
   - Complete site unavailability
   - Disruption of core WordPress functionality

### Best Practices
For Regular WordPress Hooks Prefer `UseChecks` over `UseGuards`. UseChecks also acts like guards but they are not aggressive as guards, they do not throw exceptions but also does not execute the handler. You can learn more about UseChecks in its own chapter.

   ```php
   #[UseChecks(new AdminOnlyCheck())]
   #[Add_Action('save_post')]
   public function onPostSave() {}
   ```

:::warning
`UseGuards` with WordPress hooks can crash your site if not used carefully. Always prefer `UseChecks` unless you specifically need to throw exceptions.

Both `UseChecks` and `UseGuards` implement the same `CanActivate` interface, making them interchangeable but with different execution behaviors.
:::

## Conclusion

Guards in ModulesPress provide a flexible and powerful way to implement various authentication and authorization strategies. By combining guards with attributes and the execution context, you can create sophisticated access control systems that are both maintainable and efficient.

For more information about the execution context and its capabilities, refer to the Execution Context chapter in the documentation.