---
sidebar_position: 3
---

# CLI Tool

ModulesPress comes with a powerful CLI tool that helps you scaffold various components of your plugin. This command-line interface accelerates development by generating boilerplate code while following ModulesPress best practices.

## Installation

Use Composer to install the CLI tool globally:

```bash
composer global require modulespress/cli
```

:::caution
After installation, you may need to add the ModulesPress CLI's bin directory to your system's PATH environment variable. Consult the Composer documentation for instructions specific to your operating system.
:::

## Available Commands

### Creating a New Plugin

```bash
modulespress new plugin-name
```

Creates a new ModulesPress plugin with the basic structure and necessary configuration files.
You can learn more about directory structure in its own [Directory Structure](directory-structure) chapter.

### Artifact and Zip Management

```bash
modulespress pack
```

Package the plugin for distribution and optimize dependencies.
You can learn more about packaging and distribution in its own chapter [Packaging](../08-packaging.md).

### Module Generation

```bash
modulespress make:module ModuleName
```

Generates a new module with the following structure:
```
ModuleName/
└── ModuleName.php
```

Options:
- `--dir, -d`: Create in a dedicated directory

### Repository Generation

```bash
modulespress make:repository RepositoryName EntityName
```

Creates a new repository class for managing entity operations:
- Extends `CPTRepository`
- Implements type-safe find methods

Options:
- `--dir, -d`: Create in Repositories directory

### Custom Post Type Generation

```bash
modulespress make:cpt EntityName
```

Generates a new Custom Post Type entity:
```php
#[CustomPostType(
    name: 'cpt_name',
    singular: 'Name',
    plural: 'Names'
)]
class EntityName extends CPTEntity
```

Options:
- `--dir, -d`: Create in Entities directory
- `--singular, -s`: Singular name
- `--plural, -p`: Plural name
- `--post-type, -t`: Custom post type slug

### Taxonomy Generation

```bash
modulespress make:taxonomy TaxonomyName
```

Creates a new WordPress taxonomy:
```php
#[Taxonomy(
    slug: 'taxonomy',
    singular: 'Name',
    plural: 'Names'
)]
class TaxonomyName
```

Options:
- `--dir, -d`: Create in Taxonomies directory
- `--singular, -s`: Singular name
- `--plural, -p`: Plural name
- `--slug, -t`: Taxonomy slug

### Controller Generation

```bash
modulespress make:controller ControllerName
```

Generates a RESTful controller with CRUD operations:
```php
#[Injectable]
#[RestController("/namespace")]
class ControllerName
{
    #[Get(':id')]
    public function get(#[Param('id')] string $id): array {}

    #[Post]
    public function create(#[Body] array $body): array {}
}
```

Options:
- `--dir, -d`: Create in Controllers directory

### Service Provider Generation

```bash
modulespress make:provider ProviderName
```

Creates a new service provider:
```php
#[Injectable]
class ProviderName
{
    public function __construct() {}
}
```

Options:
- `--dir, -d`: Create in Providers directory

### Interceptor Generation

```bash
modulespress make:interceptor InterceptorName
```

Generates an interceptor for request/response handling:
```php
class InterceptorName implements Interceptor
{
    public function intercept(ExecutionContext $context, CallHandler $next): mixed {}
}
```

Options:
- `--dir, -d`: Create in Interceptors directory

### Guard Generation

```bash
modulespress make:guard GuardName
```

Creates a guard for route protection:
```php
class GuardName implements CanActivate
{
    public function canActivate(ExecutionContext $context): bool {}
}
```

Options:
- `--dir, -d`: Create in Guards directory

### Middleware Generation

```bash
modulespress make:middleware MiddlewareName
```

Generates middleware for request processing:
```php
class MiddlewareName implements Middleware
{
    public function use(WP_REST_Request $req, WP_REST_Response $res): WP_REST_Request|WP_REST_Response {}
}
```

Options:
- `--dir, -d`: Create in Middleware directory

### Pipe Generation

```bash
modulespress make:pipe PipeName
```

Creates a transformation pipe:
```php
class PipeName implements PipeTransform
{
    public function transform(mixed $value): mixed {}
}
```

Options:
- `--dir, -d`: Create in Pipes directory

### Filter Generation

```bash
modulespress make:filter FilterName
```

Generates an exception filter:
```php
#[CatchException(ExceptionType::class)]
class FilterName implements ExceptionFilter
{
     public function catchException(
        BaseException $exception,
        ExecutionContext $executionContext
    ): WP_REST_Response | HtmlResponse | JsonResponse {}
}
```

Options:
- `--dir, -d`: Create in Filters directory

## Directory Structure

When using the `--dir` option, components are organized in dedicated directories:

```
my-plugin/
├── src/
|   ├── Modules/
|   |   ├── RootModule/
|   |   |   ├── Entities/
|   |   |   ├── Controllers/
|   |   |   ├── Filters/
|   |   |   ├── Guards/
|   |   |   ├── Interceptors/
|   |   |   ├── Middleware/
|   |   |   ├── Pipes/
|   |   |   ├── Providers/
|   |   |   ├── Repositories/
|   |   |   └── Taxonomies/
|   |   |   └── RootModule.php
|   |   └── CatsModule/
|   |       ├── Entities/
|   |       ├── Controllers/
|   |       ├── Filters/
|   |       ├── Guards/
|   |       ├── Interceptors/
|   |       ├── Middleware/
|   |       ├── Pipes/
|   |       ├── Providers/
|   |       ├── Repositories/
|   |       └── Taxonomies/
|   |       └── CatsModule.php
└── plugin.php
```

## Best Practices

1. **Use Directory Organization**: Always use the `--dir` option to keep your code organized in appropriate directories.

2. **Follow Naming Conventions**:
   - Controllers: `UserController`
   - Repositories: `UserRepository`
   - Entities: `User`
   - Taxonomies: `CategoryTaxonomy`

3. **Leverage Type Safety**: The generated code includes proper type hints and PHPDoc blocks for better IDE support.

4. **Keep Modules Focused**: Create new modules when functionality grows beyond a single responsibility.

## Tips & Tricks

- Use `modulespress list` to see all available commands
- Commands support the `--help` flag for detailed usage information
- Generated code follows PSR-4 autoloading standards automatically

## Common Issues

### Command Not Found
Ensure the CLI tool is properly installed and the `modulespress` command is in your PATH.

### Permission Errors
Make sure you have write permissions in the target directories.

### Namespace Issues
Verify your `composer.json` has the correct PSR-4 autoloading configuration.
