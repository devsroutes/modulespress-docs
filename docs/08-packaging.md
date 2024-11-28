# Packaging

ModulesPress provides robust tools and workflows for packaging your WordPress plugins. The framework includes built-in support for versioning, asset compilation via its vite plugin, and production-ready distribution through its CLI tools.

## Overview

When preparing your ModulesPress plugin for distribution, the framework handles:

- Production package creation
- Dependency optimization
- Version management
- Plugin packaging
- Release management

## Pre-packaging Steps

Before creating a production package, ensure you:

1. **Disable Development Mode**
   ```php
   // plugin.php
   protected bool $isDevelopment = false;
   protected bool $isDebug = false;
   ```

2. **Build Frontend Assets**
   ```bash
   # Build Vite assets
   npm run build
   ```

## ModulesPress CLI

The ModulesPress CLI provides the `pack` command for creating production-ready plugin packages:

```bash
# Create a production package
modulespress pack
```

:::tip Production Optimization
The `pack` command:
- Removes development files
- Install only production dependencies
- Optimizes Composer autoloader
- Creates a versioned ZIP package
- Maintains only production files
:::

## Production Package Structure

The final production package contains only necessary files:

```
your-plugin/
├── src/               # PHP source code
├── vendor/            # Production dependencies
├── views/             # Blade templates
├── build/             # Compiled vite assets
└── plugin.php         # Main plugin file
```

## Version Management

ModulesPress uses the version from your plugin header:

```php
/**
 * Plugin Name: Books Generator
 * Description: Generate books for your WordPress site.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL2
 * Text Domain: books-generator
 */
```

The version is used for package naming.

## Artifact Generation

When running `modulespress pack`:

1. **Version And Name Extraction**
   - Reads version from plugin header
   - Reads plugin name from plugin header
   - Creates versioned artifact name

2. **Package Creation**
   ```
   artifacts/
   └── books-generator-v1.0.0.zip
   ```

3. **File Selection**
   - Includes only production files
   - Removes development artifacts
   - Maintains proper structure

## Excluded Files

The following are automatically excluded from production packages:

```
Development Files:
✗ .cache/
✗ composer.*
✗ package.*
✗ vite.config.*
✗ tsconfig.*
✗ node_modules/
✗ resources/
✗ static/
✗ tests/
✗ .git/
✗ .github/
✗ README.md
```

## Production Optimization

The packaging process optimizes your plugin through:

1. **Composer Optimization**
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

2. **File Structure**
   - Maintains clean directory structure
   - Removes unnecessary files
   - Preserves build assets

## Distribution Best Practices

1. **Pre-packaging Checklist**
   - Disable development mode
   - Disable debug mode
   - Build frontend assets
   - Test production build

2. **Version Control**
   ```php
   // Always update version in plugin header
   /**
    * Version: 1.0.0
    */
   ```

3. **Asset Verification**
   - Check build directory
   - Verify asset loading
   - Test all features

4. **Documentation**
   - Update changelog
   - Document changes
   - Follow semantic versioning

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: Package Plugin
on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Dependencies
        run: |
          composer install
          npm install
      - name: Build Assets
        run: npm run build
      - name: Package Plugin
        run: modulespress pack
```

## Distribution Channels

After packaging, distribute through:

1. **WordPress.org**
   - Official plugin repository
   - Automatic updates
   - Version tracking

2. **Custom Distribution**
   - Self-hosted updates
   - License management
   - Client deployment

3. **Manual Installation**
   - Direct ZIP installation
   - Custom deployments
   - Development sites

## Conclusion

ModulesPress's packaging system provides a streamlined way to package WordPress plugins for production. By following the proper build steps and utilizing the CLI tools, you can create optimized, production-ready plugin packages.

:::tip Important
Always remember to:
1. Disable development mode
2. Build frontend assets
3. Test the production build
4. Create the package using `modulespress pack`
:::