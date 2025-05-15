# Directory Structure

ModulesPress follows a modern and organized directory structure that separates source code, assets, and compiled files. Here's a detailed breakdown of each directory and its purpose.

## Core Directories

```
books-generator/
├── .cache/              # Cache storage (views, compiled templates)
├── artifacts/           # Compiled and packaged plugin versions as zip files
├── build/               # Compiled Vite assets
├── resources/           # Source assets requiring compilation
├── src/                 # PHP source code
├── static/              # Uncompiled/raw assets
├── vendor/              # Composer dependencies
├── node_modules/        # NPM dependencies
└── views/               # Blade template files
└── plugin.php           # Plugin main file
```

## Source Code (`src/`)

The `src` directory contains your PHP source code that will be autoloaded via Composer:

```
src/
└── Modules/           # Plugin modules
    ├── Books/         # Example module
    └── Users/         # Example module
```

## Resource Files (`resources/`)

The `resources` directory contains source files that require compilation:

```
resources/
├── apps/              # React applications
│   ├── admin/         # Admin panel app
│   │   └── app.tsx    # TSX file with React app
│   │   └── app.scss   # SCSS file for this React app
│   └── frontend/      # Frontend apps
├── scripts/           # TypeScript files
│   └── form-submit.ts # TS file to execute logic on form submission
├── styles/            # SCSS files
└── types/             # TypeScript type definitions
```

## Static Assets (`static/`)

The `static` directory contains assets that don't require compilation, they are copied in the build folder:

```
static/
├── fonts/           # Font files
├── imgs/            # Images
└── js/              # Pre-compiled JavaScript
└── css/             # Pre-compiled CSS
```

## Additional Directories

### `.cache/`
- Stores temporary files
- Compiled Blade templates
- Plugin-specific cache

### `artifacts/`
- Contains packaged plugin versions
- Created by `modulespress pack` command
- Version-controlled releases

### `build/`
- Compiled Vite assets
- Production-ready files
- Generated during build process

### `views/`
- Blade template files
- Used for rendering UI components
- Cached in `.cache` directory

## Configuration Files

```
books-generator/
├── composer.json      # PHP dependencies
├── package.json       # Node.js dependencies
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite build configuration
└── .gitignore         # Git ignore rules
```

:::tip Hot Module Replacement
The build system supports HMR (Hot Module Replacement) during development. Changes to files in the `resources` directory will automatically trigger recompilation and updates in the browser.
:::