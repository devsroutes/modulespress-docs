# Checks

## The Problem with Traditional WordPress Conditional Checks

WordPress developers have long struggled with messy, inline conditional logic within hook methods. Imagine you're building a plugin that should only load scripts on a specific admin page. Traditionally, this would look something like this:

```php
public function enqueue_scripts($hook) {
    // Verbose, scattered conditional logic
    if ($hook !== 'toplevel_page_my_plugin') {
        return; // Early return buried in method body
    }

    // Actual script enqueuing logic
    wp_enqueue_script('my-script');
}
```

**The Pain Points:**
- Methods become cluttered with validation logic
- Mixing of concerns: validation and execution in the same place
- Repetitive conditional checks across multiple methods
- Difficult to test and maintain
- Reduced code readability and modularity

## ModulesPress Checks: A Paradigm Shift

ModulesPress introduces a better approach to conditional hook execution. Instead of scattering checks throughout your code, you can now declaratively define conditions using the `UseChecks` attribute.

### Simple Check Example

Let's look at a practical scenario of loading admin scripts only for a specific page:

```php
class BooksServiceProvider {
    // Declarative check for admin page
    #[UseChecks([new AdminPageCheck('generate-books')])]
    #[Add_Action('admin_enqueue_scripts')]
    public function onAdminEnqueueScripts() {
        // This code runs ONLY if the check passes
        wp_enqueue_script('books-admin-script', [
            'src' => plugin_dir_url(__FILE__) . 'assets/books-admin.js',
            'deps' => ['jquery'],
            'version' => '1.0.0'
        ]);
    }
}
```

### Creating a Custom Check

Writing a custom check is straightforward. Here's an example of a check that validates the current admin page:

```php
class AdminPageCheck implements CanActivate {
    public function __construct(private string $pageSlug) {}

    public function canActivate(ExecutionContext $context): bool {
        //Context switching
        $hookCtx = $context->switchToHookContext();
        if (!$hookCtx){
            return false
        }
        // Extract first parameter from action callback
        [$slug] = $hookCtx->getArgs();
        // Clean, declarative condition check
        return $slug === "toplevel_page_{$this->pageSlug}";
    }
}
```

**What Makes This Powerful?**
- Separates validation logic from execution
- Provides a clear, single-responsibility implementation
- Easily reusable across different hooks and methods

## Advanced Conditional Scenarios

### User Role-Based Restrictions

Imagine you want to restrict certain admin actions to specific user roles:

```php
class UserRoleCheck implements CanActivate {
    public function __construct(private array $allowedRoles) {}

    public function canActivate(ExecutionContext $context): bool {
        // Get current user
        $currentUser = wp_get_current_user();
        
        // Check if user has any of the allowed roles
        return !empty(array_intersect($this->allowedRoles, $currentUser->roles));
    }
}

class AdminSettingsProvider {
    #[UseChecks([
        new UserRoleCheck(['administrator', 'editor']),
    ])]
    #[Add_Action('admin_init')]
    public function initAdvancedSettings() {
        // This method only runs for admins and editors on the advanced settings page
        register_setting('advanced_settings_group', 'advanced_option');
    }
}
```

### Composing Multiple Checks

The beauty of ModulesPress Checks is the ability to compose multiple conditions effortlessly:

```php
#[UseChecks([
    new UserRoleCheck(['administrator']),
    new PluginActiveCheck('woocommerce'),
    new ServerEnvironmentCheck('production')
])]
#[Add_Action('init')]
public function criticalSystemOperation() {
    // Runs only if ALL checks pass
    // - User is an administrator
    // - WooCommerce is active
    // - Environment is production
}
```

### Usage With Multiple hooks

It is also possible to use the single check with multiple hooks at the same time with the help of
`Execution Context`, it means you can attach the same check to different hooks and handle them gracefully:

```php
class AdminPageCheck implements CanActivate {
    public function __construct(private string $pageSlug) {}

    public function canActivate(ExecutionContext $context): bool {
        $hookCtx =  $executionContext->switchToHookContext();

        if ($hookCtx?->getHookable()?->getHookName() === 'admin_enqueue_scripts') {
            [$hook] = $hookCtx->getArgs();
            if ($hook === $this->slug) {
                return true;
            }
        }

        if ($hookCtx?->getHookable()?->getHookName() === 'admin_head') {
              /* always return true for this hook only, 
                 however you most likely gonna do some checking here as 
                 it makes no sense to return true always */
             return true;
        }

        return false;
    }
}
```

## Filter Hook Special Handling

For filter hooks, `UseChecks` provides intelligent default return mechanisms:

```php
#[UseChecks(
    checks: [new UserPermissionCheck()], 
    defaultReturnArgNo: 1  // Return first argument if check fails
)]
#[Add_Filter('the_content')]
public function enhanceContent($content) {
    // Will gracefully handle permission scenarios
    return "<enhanced-content>$content</enhanced-content>";
}
```

## Key Philosophical Advantages

1. **Separation of Concerns**
   - Validation logic is completely decoupled from method execution
   - Each component has a single, clear responsibility

2. **Extreme Flexibility**
   - Create complex, multi-condition checks
   - Reuse checks across different hooks and methods
   - Easily extend and compose validation logic

3. **Performance Optimization**
   - Checks are executed before method invocation
   - Prevents unnecessary function calls and resource consumption

## Real-World Implementation Patterns

```php
class AdvancedPluginFeatures {
    #[UseChecks([
        new LicenseValidCheck(),
        new FeatureFlagCheck('advanced_reporting')
    ])]
    #[Add_Action('admin_init')]
    public function initReportingModule() {
        // Advanced feature with multiple gate checks
    }
}
```

## Conclusion

ModulesPress Checks represent a transformative approach to WordPress plugin development, addressing the long-standing challenges of conditional logic implementation. By introducing a robust, declarative framework for intelligent validation, the system eliminates the complexity and redundancy inherent in traditional WordPress plugin architecture.