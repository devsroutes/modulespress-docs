# Plugin Configuration

## Environment and Debugging Configuration

### WordPress Environment Detection

The ModulesPress framework provides flexible ways to manage plugin environments using WordPress's built-in environment detection and custom configuration options.

:::tip Environment Flexibility
ModulesPress allows dynamic configuration based on the WordPress environment type, making it easy to adapt your plugin's behavior across different deployment stages.
:::

#### Environment Type Detection

Use `wp_get_environment_type()` to dynamically configure your plugin:

```php title="my-modulespress-plugin.php"
final class MyPlugin extends ModulesPressPlugin {
    public function __construct() {
        // Automatically set development and debug modes based on environment
        $this->configureEnvironmentSettings();
        
        parent::__construct(
            rootModule: RootModule::class,
            rootDir: __DIR__,
            rootFile: __FILE__
        );
    }

    private function configureEnvironmentSettings(): void {
        $environment = wp_get_environment_type();
        
        switch ($environment) {
            case 'local':
            case 'development':
                $this->isDevelopment = true;
                $this->isDebug = true;
                break;
            
            case 'staging':
                $this->isDevelopment = false;
                $this->isDebug = true;
                break;
            
            case 'production':
                $this->isDevelopment = false;
                $this->isDebug = defined(WP_DEBUG) && WP_DEBUG
                break;
        }
    }
}
```

### Dependency Injection and Plugin Accessibility

:::info Dependency Injection
The ModulesPress framework uses dependency injection, making the plugin instance globally accessible throughout your providers.
:::

#### Plugin Instance Access

```php title="src/Modules/BooksModule/Services/BookService.php"
#[Injectable]
class BookService {

    public function __construct(
        private readonly ModulesPressPlugin $plugin
    ) {}

    public function enqueue() {
        $rootUrl = $this->plugin->getRootDirUrl();
        // Enqueue combining with plugin root url
    }
}
```

## Plugin Lifecycle Methods

### Activation and Deactivation Hooks

The ModulesPress framework provides robust methods for handling plugin activation and deactivation:

```php title="my-plugin.php"
class MyPlugin extends ModulesPressPlugin {
    public function onActivate(bool $networkWide): void {
        // Custom activation logic
        if ($networkWide) {
            // Network-wide activation handling
        }

        // Fires a custom action hook
        do_action(self::SLUG . '/activate', $networkWide);
    }

    public function onDeactivate(): void {
        // Custom deactivation logic
        do_action(self::SLUG . '/deactivate');
    }
}
```

```php title="src/Modules/ActivatorModule/Services/ActivationService.php"

use ModulesPress\Foundation\Hookable\Attributes\Add_Action;

class ActivationService {
   #[Add_Action(MyPlugin::SLUG . '/activate')]
    public function onActivate(bool $networkWide) { 
        /*Your Activation Logic*/ 
    }
}
```

:::warning Hook Usage
Always use action hooks for maximum extensibility. Your plugin itself can then hook into your activation/deactivation processes, allowing you to use the injected services. If you don't override these two functions, the hooks are automatically fired.
:::

### Plugin Ready Lifecycle

The `onPluginReady()` method is called after all dependencies are resolved:

```php
protected function onPluginReady(ModulesPressPlugin $plugin): void {
    // This method is called when:
    // 1. Core framework is initialized
    // 2. All dependencies are resolved
    // 3. Before the plugin is fully bootstrapped

    if ($plugin->isDebugMode()) {
        // Debug-specific initialization
        $this->setupDebugTools();
    }
}
```

## Directory Management

### Built-in Path Accessors

ModulesPress provides convenient methods to access plugin directories:

```php
// Retrieve various plugin directory paths
$rootDir = $plugin->getRootDirPath();     // Plugin root directory
$rootUrl = $plugin->getRootDirUrl();      // Plugin root URL
$viewsDir = $plugin->getViewsDirPath();   // Views directory
$cacheDir = $plugin->getCacheDirPath();   // Cache directory
```

:::tip Directory Security
Always create `.htaccess` files or use WordPress's built-in directory protection mechanisms for sensitive directories like cache and views.
:::

### Securing Plugin Directories

```php
private function secureCacheDirectory(): void {
    $cacheDir = $this->getCacheDirPath();
    $htAccessPath = trailingslashit($cacheDir) . '.htaccess';
    
    if (!file_exists($htAccessPath)) {
        file_put_contents($htAccessPath, "Deny from all");
    }
}
```

## Best Practices

1. **Use Environment-Specific Configurations**
2. **Implement Comprehensive Logging**
3. **Utilize Dependency Injection**
4. **Leverage WordPress Hook System**
5. **Secure Sensitive Directories**

:::danger Production Readiness
- Disable `WP_DEBUG` in production
- Implement proper error handling
- Log errors without exposing sensitive information
:::

## Advanced Configuration Example

```php title="advanced-plugin.php"
final class AdvancedPlugin extends ModulesPressPlugin {
    public const NAME = "Advanced ModulesPress Plugin";
    public const SLUG = "advanced-modulespress";
    public const PREFIX = "amp_";

    protected string $version = "1.2.0";
    protected string $restNamespace = "advanced-plugin/v1";

    public function __construct() {
        $this->configureEnvironmentSettings();
        
        parent::__construct(
            rootModule: AdvancedRootModule::class,
            rootDir: __DIR__,
            rootFile: __FILE__
        );
    }

    // Implement custom lifecycle methods
    protected function onPluginReady(ModulesPressPlugin $plugin): void {
        // Advanced initialization logic
    }
}

(new AdvancedPlugin())->bootstrap()
```

By following these guidelines, you'll create robust, flexible, and maintainable WordPress plugins using the ModulesPress framework.