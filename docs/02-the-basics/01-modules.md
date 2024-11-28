# Modules: Building Blocks

At the heart of ModulesPress lies the concept of **modules** - self-contained units of functionality that encapsulate related components, services, and resources. These modules work together to form the backbone of your WordPress plugin, much like how Lego bricks assemble into larger, more complex structures.

```php title="src/Modules/Books/BooksModule.php"
#[Module(
    imports: [
        AuthModule::class,
        CategoriesModule::class
    ],
    providers: [
        BookService::class,
        BookRepository::class
    ],
    controllers: [
        BooksController::class
    ],
    entities: [
        Book::class
    ],
    exports: [
        BookRepository::class
    ]
)]
class BooksModule extends ModulesPressModule {}
```

In the example above, the `BooksModule` declares its dependencies, services, controllers, entities, and exported resources - all within a self-contained unit. This modular structure promotes better organization, testability, and scalability for your plugin.

## Navigating the Modular Landscape

### Imports
Modules can **import** other modules, allowing them to leverage functionality from their dependencies. This creates a hierarchical structure and helps manage complex plugin architectures.

```php title="src/Modules/Admin/AdminModule.php"
#[Module(
    imports: [
        new BooksDynamicModule(apiVersion: "v1"),
        AuthModule::class,
        CoreModule::class
    ]
)]
class AdminModule extends ModulesPressModule {}
```

### Dynamic Modules
Sometimes, you need modules that can adapt to the changing needs of your plugin. **Dynamic Modules** in ModulesPress allow you to configure module behavior at runtime, making your plugin more flexible and future-proof. Developers can even create the dynamic modules as a separate lib and distribute as a ready to use model for other plugins developers.

```php title="src/Modules/Books/BooksDynamicModule.php"
class BooksDynamicModule extends ModulesPressModule {
    public function __construct(
        private string $apiVersion
    ) {}

    public function register(): Module {
        return new Module(
            providers: [
                new Provider(
                    provide: "BOOKS_API_VERSION",
                    useValue: $this->apiVersion
                )
            ]
        );
    }
}
```

### Global Modules
While most modules are scoped to specific features, **Global Modules** in ModulesPress provide plugin-wide services and utilities, ensuring consistency and centralized control. The global modules are only required to imported once.

```php title="src/Modules/Core/CoreModule.php"
#[GlobalModule]
#[Module(
    providers: [
        LoggerService::class,
        ConfigurationService::class
    ],
    exports: [
        LoggerService::class
    ]
)]
class CoreModule extends ModulesPressModule {}
```

### Exports
Modules can **export** their providers, allowing other modules to consume them. This feature helps create clear boundaries and manage dependencies between different parts of your plugin.

```php title="src/Modules/Books/BooksModule.php"
#[Module(
    providers: [
        BookRepository::class,
        BookService::class
    ],
    exports: [
        BookRepository::class
    ]
)]
class BooksModule extends ModulesPressModule {}
```

### Root Module: The Orchestrator
At the top of the module hierarchy sits the **Root Module**, which orchestrates the entire plugin by importing all the necessary feature modules and setting up the plugin's overall structure. This root module is required by the ModulesPressPlugin class.

```php title="src/Modules/RootModule.php"
#[Module(
    imports: [
        BooksModule::class,
        AuthorsModule::class,
        UserModule::class
    ]
)]
class RootModule extends ModulesPressModule {}
```

## Feature Modules: Organizing Functionality
Modules in ModulesPress can also be used to group related features, keeping your codebase well-structured and maintainable.

```php
// CatsController.php
class CatsController {
    // Cats-specific controller logic
}

// CatsService.php 
class CatsService {
    // Cats-related business logic
}

// CatsModule.php
#[Module(
    providers: [
        CatsService::class
    ],
    controllers: [
        CatsController::class
    ]
)]
class CatsModule extends ModulesPressModule {}
```

By organizing your plugin into feature-specific modules, you can easily scale your plugin, introduce new capabilities, and ensure a clean separation of concerns.

## Mastering the Modular Mindset

Embracing the modular approach in your WordPress plugin development unlocks a world of benefits:

✨ **Improved Maintainability**: Modules help you keep your codebase organized and manageable, even as your plugin grows in complexity.

🧠 **Enhanced Testability**: With clear boundaries and dependencies, you can easily test individual modules in isolation.

🚀 **Seamless Scalability**: Adding new features or modifying existing ones becomes a breeze when your plugin is built on a modular foundation.

:::tip Modular Best Practices
- Keep modules focused and single-responsibility
- Use dependency injection to manage module relationships
- Minimize inter-module coupling for better flexibility
- Design modules for reusability across projects
:::

:::warning Modular Pitfalls to Avoid
- Overly complex module hierarchies
- Performance issues due to over-modularization
- Lack of clear separation of concerns
:::