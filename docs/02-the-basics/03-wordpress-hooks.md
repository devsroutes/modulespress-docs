# Wordpress Hooks

## Introduction to Hookables

ModulesPress introduces **Hookables**, a better approach to managing WordPress actions and filters. By leveraging PHP attributes, Hookables replace traditional `add_action` and `add_filter` functions, enabling declarative hook registration within service provider classes.

### Core Principles

- **Declarative Registration**: Define hooks directly alongside method implementations
- **Lazy Loading**: Service providers instantiated only when specific hooks are triggered
- **Performance Optimization**: Minimal resource consumption
- **Clean, Maintainable Code**

## Evolution of Hook Registration: From Traditional to Modern

### Traditional WordPress Hook Registration Challenges

#### 1. Cluttered Constructor Approach

**Old Methodology:**
```php
class BookPlugin {
    public function __construct() {
        // Hook registrations scattered and hard to read
        add_action('init', [$this, 'initializePlugin']);
        add_action('admin_menu', [$this, 'registerAdminMenu']);
        add_filter('the_content', [$this, 'modifyContentDisplay']);
    }
}
```

**Problems:**
- Constructors become bloated
- Poor separation of concerns
- Immediate hook registration causing performance overhead
- Manual priority and condition management

#### 2. Global Function Approach

**Old Methodology:**
```php
function my_books_init() {
    // Initialization logic
}
add_action('init', 'my_books_init');
```

**Limitations:**
- Global namespace pollution
- Lack of object-oriented context
- Difficult dependency management
- Poor encapsulation

### ModulesPress: A Modern Solution

```php
class BookServiceProvider
{
    // Clean, declarative hook registration
    #[Add_Action('init', priority: 5)]
    public function earlyInit() {
        // Initialization logic
    }

    #[Add_Action('admin_menu')]
    public function registerAdminMenu() {
        // Admin menu registration
    }
}
```

## Detailed Hook Attribute Usage

### Action Hooks: `#[Add_Action]`

```php
#[Add_Action('wp_enqueue_scripts', priority: 10)] 
public function enqueueFrontendScripts() { 
    wp_enqueue_script('my-frontend-script', 'path/to/script.js', [], '1.0', true); 
}
```

### Filter Hooks: `#[Add_Filter]`

```php
#[Add_Filter('the_content')] 
public function filterContent($content) { 
    return $content . '<p>Enhanced by ModulesPress</p>'; 
}
```
## Benefits of ModulesPress Hookables

- **Clean, Readable Code**
- **Performance Optimization**
- **Seamless Dependency Injection**
- **Simplified Hook Management**
- **Explicit Intention Declaration**

## Best Practices

1. Keep hook methods focused and single-responsibility
2. Use meaningful method names
3. Leverage conditional hook registration
4. Minimize logic within hook methods
5. Utilize dependency injection for complex requirements

## Comparison: Traditional vs ModulesPress

| Aspect | Traditional WordPress | ModulesPress |
|--------|----------------------|--------------|
| Hook Registration | Manual, scattered | Declarative, centralized |
| Performance | Always loaded | Lazy loaded |
| Code Readability | Complex | Clean, intuitive |
| Dependency Management | Manual | Integrated |
| Priority Control | Manual | Built-in attributes |

## Example: Complete Service Provider

```php
namespace BookPlugin\Provider;

use ModulesPress\Foundation\Hookable\Attributes\Add_Action;
use ModulesPress\Foundation\Hookable\Attributes\Add_Filter;

class BookServiceProvider 
{
    #[Add_Action('init', priority: 5)]
    public function initializeBookSystem() {
        // Initialize book-related systems
    }

    #[Add_Action('admin_menu')]
    public function registerAdminPages() {
        // Register admin menu items
    }

    #[Add_Filter('the_content', priority: 10)]
    public function enhanceBookContent($content) {
        // Modify content display
        return $content;
    }
}
```

## Conclusion

ModulesPress Hookables represent a paradigm shift in WordPress plugin development, offering a more elegant, performant, and maintainable approach to hook management.