# Renderer (Blade Templates)

ModulesPress brings the power of Laravel's Blade templating engine to WordPress plugin development, offering a modern and elegant way to handle views. This integration allows developers to leverage familiar Blade syntax while maintaining WordPress compatibility.

## Overview

The ModulesPress Renderer service provides a seamless integration of BladeOne (a lightweight version of Laravel's Blade engine) into the WordPress ecosystem. It supports dependency injection, view composition, and custom directives - making your plugin development more organized and maintainable.

## Getting Started

### Basic Setup

To use the Renderer in your service, inject it through the constructor:

```php
use ModulesPress\Core\Renderer\Renderer;

class ExampleService {
    public function __construct(
        private readonly Renderer $renderer
    ) {}
}
```

### Rendering Views

To render a Blade view, use the `render` method:

```php
$this->renderer->render('view-name', [
    'user' => $currentUser,
    'settings' => $pluginSettings
]);
```

To return a string, use the `renderAsString` method:
```php
$viewHtml = $renderer->renderAsString('view-name', [
    'user' => $currentUser,
    'settings' => $pluginSettings
]); // return string

echo $viewHtml;
```

## View Attributes

ModulesPress introduces powerful attributes for view manipulation and composition. These attributes
can be registered in the provider class.

### ViewCompose Attribute

The `#[ViewCompose]` attribute allows you to inject data into views before rendering. This is particularly useful for reusable components or layouts.

#### Syntax
```php
#[ViewCompose('view-name')]
public function composeView(BladeOne $view)
{
    $view->with('data', $this->getData());
}
```

#### Example: Adding Data to Admin Menu
```php
#[ViewCompose('network-admin-menu')]
public function composeAdminMenu(BladeOne $view)
{
    $view->with([
        'books' => $this->bookRepository->getAllBooks(),
        'categories' => $this->categoryService->getCategories(),
        'lastUpdated' => current_time('mysql')
    ]);
}
```

### ViewDirective Attribute

The `#[ViewDirective]` attribute enables custom Blade directives, extending Blade's functionality with your own shortcuts.

#### Syntax
```php
#[ViewDirective("directiveName", "onRuntime")]
public function customDirective($parameter = null)
{
    // Directive logic here
}
```

#### Examples

1. **Current Time Directive**
```php
#[ViewDirective("currentTime", "onRuntime")]
public function currentTimeDirective()
{
    echo date("Y-m-d H:i:s");
}

// Usage in Blade:
// @currentTime
```

2. **Asset Image Directive**
```php
#[ViewDirective("image", "onRuntime")]
public function imageDirective(string $imgPath)
{
    echo $this->enquerer->static('imgs/' . $imgPath)->getUrl();
}

// Usage in Blade:
// @image('logo.png')
```

## WordPress Integration

### Adding Admin Pages

Integrate Blade views into WordPress admin pages seamlessly:

```php
#[Add_Action('admin_menu')]
public function addPluginAdminMenu()
{
    add_menu_page(
        'My Plugin',
        'My Plugin',
        'manage_options',
        'my-plugin-slug',
        function () {
            $this->renderer->render('admin/dashboard', [
                'pluginVersion' => PLUGIN_VERSION,
                'settings' => $this->settingsService->getAll()
            ]);
        },
        'dashicons-admin-plugins',
        20
    );
}
```

## Best Practices

### 1. View Organization

Structure your Blade views in a logical hierarchy:
```
views/
├── admin/
│   ├── dashboard.blade.php
│   └── settings.blade.php
├── components/
│   ├── header.blade.php
│   └── footer.blade.php
└── layouts/
    └── main.blade.php
```

### 2. Data Injection

Always use view composition for data that's shared across multiple views:

```php
#[ViewCompose('layouts.main')]
public function composeMainLayout(BladeOne $view)
{
    $view->with([
        'siteName' => get_bloginfo('name'),
        'currentUser' => wp_get_current_user(),
        'notifications' => $this->notificationService->getAll()
    ]);
}
```

### 3. Custom Directives

Create directives for commonly used WordPress functions:

```php
#[ViewDirective("wpNonce", "onRuntime")]
public function nonceDirective(string $action)
{
    echo wp_nonce_field($action, '_wpnonce', true, false);
}

// Usage: @wpNonce('my-action')
```

## Performance Considerations

- Views are automatically cached for optimal performance
- Use view composition to prevent redundant database queries
- Leverage custom directives for frequently used operations

## Common Issues and Solutions

### Issue: Views Not Updating
**Solution**: Clear the view cache by deleting files in your plugin's cache directory

### Issue: Undefined Variables in Views
**Solution**: Always check if variables exist before using them:
```php
{{ $variable ?? 'default value' }}
```

### Issue: WordPress Functions Not Available
**Solution**: Ensure WordPress is loaded before rendering views:
```php
#[ViewCompose('admin-view')]
public function composeAdminView(BladeOne $view)
{
    if (!function_exists('get_current_user_id')) {
        throw new \RuntimeException('WordPress not loaded');
    }
    // Your code here
}
```

## Conclusion

ModulesPress's Blade integration provides a powerful, flexible way to handle views in WordPress plugins. By following these patterns and best practices, you can create maintainable, efficient plugins with elegant templating.