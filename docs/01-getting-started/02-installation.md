# Installation

ModulesPress is a modern PHP framework for developing WordPress plugins, inspired by the architectural patterns of NestJS. It leverages PHP 8+ attributes for decorators, offers built-in Vite integration with Hot Module Replacement (HMR), and includes a CLI tool for streamlined plugin development. This guide will walk you through creating your first ModulesPress plugin using the CLI.

## Prerequisites

Before getting started, ensure you have these tools installed:

- **WordPress**
  - A running WordPress installation (locally or on a server)

- **Composer**
  - Installed globally on your system
  - Used to manage the ModulesPress framework and plugin dependencies

- **Node.js and NPM**
  - Both installed globally
  - Required for Vite's frontend tooling

- **PHP 8.1+**
  - ModulesPress requires PHP 8.1 or later

- **Git**
  - For version control

## Installation

### 1. Install the ModulesPress CLI

Use Composer to install the CLI tool globally:

```bash
composer global require modulespress/cli
```

:::caution
After installation, you may need to add the ModulesPress CLI's bin directory to your system's PATH environment variable. Consult the Composer documentation for instructions specific to your operating system.
:::

### 2. Create a New Plugin

Navigate to the directory where you want to create your plugin and run:

```bash
modulespress new
```

The CLI will guide you through these steps:

#### Configuration Prompts
- Plugin name
- Plugin slug
- Description
- Author information
- Additional options

#### Automatic Setup
The CLI will automatically:
- Create plugin directory structure
- Install Composer dependencies
- Install npm packages
- Generate configuration files
- Create main plugin file
- Set up root module
- Configure autoloading

### 3. Activate the Plugin

Once the CLI completes the setup process:

1. Navigate to your WordPress admin dashboard
2. Go to the Plugins page
3. Locate your newly created plugin
4. Click "Activate" to enable it

## Next Steps

The CLI has generated a complete plugin structure. Here's what you can do next:

### Add Modules
- Create new modules to organize your plugin's code
- Separate concerns and maintain clean architecture

### Define Providers
- Register services and dependencies
- Set up dependency injection

### Create Controllers
- Build REST API endpoints
- Handle HTTP requests

### Develop Entities
- Create custom post types
- Define taxonomies
- Set up database schemas

:::tip
For detailed instructions on these features and more advanced topics, refer to the complete ModulesPress documentation.
:::