---
sidebar_position: 1
---

# Introduction

ModulesPress is a powerful WordPress plugin development framework that brings modern development practices to the WordPress ecosystem. Inspired by NestJS, Angular, and Laravel, it provides a robust foundation for building scalable and maintainable WordPress plugins.

## Why ModulesPress?

:::tip What makes it special?
ModulesPress combines the best practices from modern frameworks while staying true to WordPress development patterns.
:::

### Key Features

- 🎯 **Modern Architecture** - NestJS-inspired modular design
- 🚀 **TypeScript & React** - First-class support for modern frontend
- 🛠️ **PHP 8+ Attributes** - Use decorators for clean, declarative code
- 📦 **Dependency Injection** - Powerful DI container for better testing
- 🔒 **Type Safety** - Full TypeScript and PHP type support
- ⚡ **Vite Integration** - HMR and modern build tools
- 🎨 **Blade Templates** - Elegant templating with Laravel's Blade
- 🔄 **Hot Module Replacement** - Instant feedback during development

## Framework Philosophy

ModulesPress follows these core principles:

1. **Modularity First**
   - Everything is a module
   - Clear separation of concerns
   - Reusable components
   - SOLID principles

2. **Developer Experience**
   - Modern tooling
   - Type safety
   - Hot reloading

3. **WordPress Integration**
   - Seamless WordPress hooks
   - Native REST API support
   - WordPress coding standards

## Plugin File

The generated `plugin-name.php` file extends the `ModulesPressPlugin` class and is crucial for bootstrapping your plugin. It will look something like this (replace placeholders):


```php title="my-modulespress-plugin.php"
<?php 
/**
 * Plugin Name: My ModulesPress Plugin
 * ... other plugin header details ...
 */

use MyPlugin\Modules\RootModule\RootModule; // Replace with your namespace
use ModulesPress\Foundation\ModulesPressPlugin;

if (!defined('ABSPATH')) exit;

final class MyPlugin extends ModulesPressPlugin {
    public const NAME = "My ModulesPress Plugin";
    public const SLUG = "my-modulespress-plugin";

    public function __construct() {
        parent::__construct(
            rootModule: RootModule::class,
            rootDir: __DIR__,
            rootFile: __FILE__
        );
    }
}

(new MyPlugin())->bootstrap();
?>
```

:::info Live Development
ModulesPress provides instant feedback during development with Vite's HMR support!
:::