# Providers

## Imports and Namespaces

Before diving into providers, ensure you note the necessary attributes and classes:

```php
use ModulesPress\Foundation\DI\Attributes\Injectable;
use ModulesPress\Foundation\DI\Attributes\Inject;
use ModulesPress\Common\Provider\Provider;
use ModulesPress\Foundation\DI\Enums\Scope;
```

## Provider Types and Use Cases

### 1. Class-Based Providers

When a class has dependencies in its constructor, it can be automatically resolved if the provider is available in module context:

```php
class EmailService {
    public function sendEmail($to, $subject, $body) {
        // Email sending logic
    }
}

#[Injectable]
class UserService {
    public function __construct(
        private EmailService $emailService,
        private UserRepository $userRepository
    ) {}

    public function registerUser(User $user) {
        // Register user logic
        $this->emailService->sendEmail(
            $user->email, 
            'Welcome', 
            'Thank you for registering'
        );
    }
}
```

In this example, `UserService` will automatically have its dependencies injected.

### 2. Provider Class (Advanced Configuration)

The `Provider` class offers more flexible dependency management:

```php
#[Module(
    providers: [
        // Class-based provider
        UserRepository::class,

        // Named service provider
        new Provider(
            provide: "notificationService",
            useClass: EmailNotificationService::class
        ),

        // Static value provider
        new Provider(
            provide: "emailApiKey",
            useValue: "your-api-key-here"
        ),

        // Factory-based provider
        new Provider(
            provide: "configManager",
            useFactory: [ConfigurationModule::class, "createConfigManager"]
        )
    ]
)]
class UserModule extends ModulesPressModule {
    // Factory method example
    public static function createConfigManager() {
        return new ConfigManager(
            environment: wp_get_environment_type(),
            basePath: WP_CONTENT_DIR
        );
    }
}
```

#### Provider Configuration Types

1. **useClass**: Bind an interface or token to a specific class implementation
2. **useValue**: Provide a static value
3. **useFactory**: Create dependencies dynamically

### 3. Dependency Scopes

```php
#[Module(
    providers: [
        // Singleton: Same instance throughout the request lifecycle
        new Provider(
            provide: UserRepository::class,
            useClass: UserRepository::class,
            scope: Scope::SINGLETON
        ),

        // Transient: New instance on every injection
        new Provider(
            provide: LoggerService::class,
            useClass: LoggerService::class,
            scope: Scope::TRANSIENT
        )
    ]
)]
class CoreModule extends ModulesPressModule {}
```

#### Scope Explanation

- `Scope::SINGLETON`: 
  - Single instance created and reused throughout the WordPress request lifecycle
  - Ideal for services that should maintain state or have expensive initialization
  - Examples: Database connections, configuration managers

- `Scope::TRANSIENT`: 
  - New instance created every time the dependency is requested
  - Useful for stateless services or when you need fresh object instances
  - Examples: Temporary calculators, one-time use utilities

### 4. Injectable Attribute

The `#[Injectable]` attribute allows a class to have constructor-injected dependencies:

```php
#[Injectable]
class AnalyticsService {
    public function __construct(
        private HttpClient $httpClient,
        private ConfigService $configService
    ) {}

    public function trackEvent($eventName) {
        // Tracking logic
    }
}
```

**Important Note**: 
- Use `#[Injectable]` only for classes with constructor dependencies
- Classes without constructor dependencies don't require this attribute

### 5. Specific Injection with `#[Inject]`

```php
#[Injectable]
class NotificationManager {
    public function __construct(
        #[Inject("emailService")] private $emailService,
        #[Inject("smsService")] private $smsService,
        #[Inject("API_KEY")] private string $apiKey
    ) {}
}
```

## WordPress-Specific Providers

### Practical WordPress Example

```php
#[Injectable]
class WordPressSettingsService {
    public function __construct(
        #[Inject("Options")] private array $pluginOptions
    ) {}
    public function getSettingsPageTheme() {
        return $this->pluginOptions["themeColor"];
    }
}

#[Module(
    providers: [
        WordPressSettingsService::class,
        new Provider(
            provide: "Options",
            useFactory: [WordPressIntegrationModule::class, "pluginOptions"]
        )
    ]
)]
class WordPressIntegrationModule extends ModulesPressModule {
     public static function pluginOptions() {
        $options = array();
        $options["themeColor"] = get_option("themeColor");
        return $options;
    }
}
```

## Best Practices

1. Use constructor injection for dependencies
2. Leverage `Provider` for complex configurations
3. Choose appropriate scopes
4. Keep providers focused and single-responsibility
5. Export only necessary providers for module interoperability

## Common Use Cases

- Database repositories
- External service integrations
- Configuration management
- Utility services
- WordPress-specific service abstractions

## Performance Considerations

- Singleton scope reduces object creation overhead
- Lazy loading of dependencies
- Efficient dependency resolution mechanism

## Potential Pitfalls

- Avoid circular dependencies
- Be mindful of performance with complex provider graphs
- Use transient scope judiciously to prevent unnecessary object creation