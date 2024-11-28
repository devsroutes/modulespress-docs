# Custom Post Type Entities

ModulesPress provides a powerful and type-safe way to work with WordPress Custom Post Types through its Entity system. This guide covers everything you need to know about creating and working with CPT Entities.

## Overview

CPT Entities are PHP classes that represent WordPress custom post types with additional meta fields and taxonomies. They provide a modern, object-oriented approach to working with WordPress data, eliminating the need for manual post type registration and meta field handling.

:::tip Why Use CPT Entities?
- Type-safe data handling
- Automatic WordPress registration
- Built-in validation
- Clean, declarative syntax
- Seamless taxonomy integration
:::

## Entity Registration

CPT Entities (custom post types) are automatically registered when included in a module's entity array:

```php
#[Module(
    imports: [],
    providers: [],
    controllers: [],
    exports: [],
    entities: [Book::class]
)]
class BooksModule extends ModulesPressModule {}
```

When ModulesPress boots, it automatically:
- Registers all Custom Post Types
- Sets up associated taxonomies

## Basic Structure

Every CPT Entity extends the base `CPTEntity` class, which provides core WordPress post functionality:

```php
use ModulesPress\Foundation\Entity\CPT\CPTEntity;
use ModulesPress\Foundation\Entity\CPT\Attributes\CustomPostType;

#[CustomPostType(
    name: 'book',
    singular: 'Book',
    plural: 'Books'
)]
class Book extends CPTEntity
{
    // Built-in properties from CPTEntity:
    // - title: Post title
    // - content: Post content
    // - excerpt: Post excerpt
    // - id: Post ID (managed internally)
    
    public string $title = 'New Book'; // Override default title
}
```

## Core Attributes

### CustomPostType

The `#[CustomPostType]` attribute defines the WordPress custom post type configuration. ModulesPress automatically handles the registration process.

```php
#[CustomPostType(
    name: 'book',          // Post type name (required)
    singular: 'Book',      // Singular label
    plural: 'Books',       // Plural label
    args: [               // WordPress register_post_type() arguments
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-book-alt',
        'supports' => ['title', 'editor', 'thumbnail']
    ]
)]
```

:::tip Post Type Arguments
The `args` parameter accepts all standard WordPress `register_post_type()` arguments, giving you full control over the post type's behavior while maintaining a clean, attribute-based syntax.
:::

### MetaField

The `#[MetaField]` attribute transforms class properties into WordPress meta fields, handling all the storage and retrieval logic automatically.

```php
use ModulesPress\Foundation\Entity\CPT\Attributes\MetaField;

#[MetaField]
public string $edition;

#[MetaField(
    key: 'book_author',     // Custom meta key (optional)
    default: 'Unknown',     // Default value (optional)
    serialize: 'json_encode',   // Serialization function (optional)
    deserialize: 'json_decode'  // Deserialization function (optional)
)]
public string $author;
```

ModulesPress automatically:
- Writes into those meta keys in the WordPress database
- Handles serialization of complex data types
- Manages default values
- Provides type-safe access to meta data

#### MetaField Options

| Option | Description | Example | Default |
|--------|-------------|---------|---------|
| key | Custom meta key | `'book_author'` | Property name |
| default | Default value | `'Jonathan Swift'` | - |
| serialize | Serialization function | `'json_encode'` | - |
| deserialize | Deserialization function | `'json_decode'` | - |

### TaxonomyField

The `#[TaxonomyField]` attribute creates a seamless connection between your post type and taxonomies:

```php
use ModulesPress\Foundation\Entity\CPT\Attributes\TaxonomyField;

/** @var string[] */
#[TaxonomyField(GenreTaxonomy::class)]
public array $genres;
```

This automatically:
- Registers the taxonomy-post type relationship
- Handles term assignment and retrieval
- Maintains type safety with arrays of terms

## Custom Taxonomies

Define custom taxonomies using the `#[Taxonomy]` attribute. ModulesPress handles the WordPress registration automatically:

```php
use ModulesPress\Foundation\Entity\CPT\Attributes\Taxonomy;

#[Taxonomy(
    slug: 'genre',
    singular: 'Genre',
    plural: 'Genres',
    args: [
        'hierarchical' => true,
        'show_in_rest' => true,
        'show_admin_column' => true
    ]
)]
class GenreTaxonomy {}
```

## Symfony Validation

ModulesPress leverages Symfony's validation component for robust entity validation. Validation is automatically performed when saving entities through repositories.

### Basic Validation

```php
use Symfony\Component\Validator\Constraints;

#[Constraints\NotBlank(message: "Title cannot be empty")]
#[Constraints\Length(min: 3, max: 100)]
#[MetaField]
public string $title;

#[Constraints\Email(message: "Invalid email address")]
#[MetaField]
public string $authorEmail;
```

### Array Validation

Perfect for handling multiple values:

```php
/** @var string[] */
#[Constraints\All([
    new Constraints\Length(min: 5, max: 255),
    new Constraints\NotBlank()
])]
#[Constraints\Count(min: 1, max: 5)]
#[MetaField]
public array $tags;
```

### Nested Object Validation

For complex data structures:

```php
#[Constraints\Valid]
#[MetaField(
    serialize: 'json_encode',
    deserialize: [self::class, 'deserializePublisher']
)]
public Publisher $publisher;
```

:::tip
On failed validations, the `ValidationException` is thrown, which can be caught using the `#[CatchException(ValidationException::class)]` attribute. This allows for more targeted exception handling.
:::

## Working with Repositories

While CPT Repositories deserve their own detailed guide, here's how they work with entities:

```php
class BookController
{
    public function __construct(
        private BookRepository $bookRepository
    ) {}

    #[Post]
    public function createBook(#[Body] CreateBookDTO $body)
    {
        // Create a new book entity
        $book = new Book();
        $book->name = $body->name;
        $book->author = $body->author;
        $book->genres = $body->genres;
        
        // Save using repository
        $this->bookRepository->save($book);
    }

    #[Get(':id')]
    public function getBook(#[Param('id')] int $id)
    {
        // Find existing book
        $book = $this->bookRepository->find($id);
        return $book;
    }
}
```

The repository pattern provides:
- Clean separation of concerns
- Type-safe CRUD operations
- Automatic validation
- Simplified data access

## Advanced Features

### Custom Serialization

Handle complex data types with custom serialization:

```php
class Book extends CPTEntity
{
    #[MetaField(
        serialize: [self::class, 'serializeLibrary'],
        deserialize: [self::class, 'deserializeLibrary']
    )]
    public Library $library;

    public static function serializeLibrary(Library $library): string
    {
        return json_encode($library);
    }

    public static function deserializeLibrary($libraryJson): Library
    {
        if ($libraryJson instanceof Library) {
            return $libraryJson;
        }
        // In real-world use, you'll likely use a Hydrator
        return new Library(json_decode($libraryJson, true)); 
    }
}
```

### Default Values

You can provide default values for meta fields in various ways:

```php
// using the default attribute
#[MetaField(default: 'Lorem ipsum')]
public string $description;

// or directly assign a value
#[MetaField]
public string $description = 'Lorem ipsum';

// or mark them as nullable, ModulesPress will automatically set them to null if not provided
#[MetaField]
public ?string $description;

//or dynamically generate default values using the default attribute and a callable
#[MetaField(default: [self::class, 'generateDescription'])]
public string $description;

public static function generateDescription(): string
{
    return sprintf('Created on %s', date('Y-m-d'));
}

```

## Serialization and Deserialization: Deep Dive

### The WordPress Serialization Challenge

WordPress uses PHP's native `serialize()` and `unserialize()` functions for storing complex objects in meta fields. However, this approach comes with significant risks:

#### The `__PHP_Incomplete_Class` Problem

When an object is serialized and then deserialized, but the original class definition is no longer available (due to:
- Class name changes
- Namespace modifications
- Autoloader path alterations
- Class file deletion or moved

WordPress will create an `__PHP_Incomplete_Class` object, which:
- Loses all method functionality
- Retains only public property values
- Prevents proper object reconstruction

Example of the problem:
```php
class OriginalClass {
    public $data = 'original';
}

// Serialize and save to meta
$object = new OriginalClass();
update_post_meta($postId, 'complex_data', serialize($object));

// Later, if class is renamed/moved
class RenamedClass {
    public $data = 'modified';
}

// Retrieval will create an __PHP_Incomplete_Class
$retrieved = unserialize(get_post_meta($postId, 'complex_data', true));
// $retrieved is now an __PHP_Incomplete_Class instance
```

### ModulesPress Serialization Solution

ModulesPress provides a robust serialization mechanism using JSON and Hydration. ModulesPress uses this wonderful lightweight package [plain-to-class](https://github.com/yzen-dev/plain-to-class) to create objects from plain data.

:::info
ModulePress also uses this package internally to transform the payload into DTOs for validations.
:::

```php
class Book extends CPTEntity
{
    #[MetaField(
        // Custom JSON serialization
        serialize: "json_encode",
        
        // Custom deserialization with hydration
        deserialize: [self::class, 'deserializeLibrary']
    )]
    public Library $library;

    public static function deserializeLibrary($libraryJson): Library
    {
        // Handle different input types
        if ($libraryJson instanceof Library) {
            return $libraryJson;
        } 

        // Parse JSON 
        $parsed = json_decode($libraryJson, true);
        
        // Use Hydrator to create object
        $library = (new Hydrator())->create(Library::class, $parsed);
        return $library;
    }
}
```

#### Key Serialization Benefits

1. **JSON Serialization**
   - Human-readable
   - Language-agnostic
   - Immune to class relocation issues
   - Lightweight

2. **Hydration Process**
   - Reconstructs objects from plain data
   - Supports type conversion
   - Handles nested objects
   - Provides flexibility in object creation

### Advanced Serialization Techniques

#### Custom Serialization Methods

```php
class ComplexEntity extends CPTEntity
{
    #[MetaField(
        serialize: [self::class, 'customSerialize'],
        deserialize: [self::class, 'customDeserialize']
    )]
    public ComplexObject $data;

    public static function customSerialize(ComplexObject $obj): string
    {
        // Custom serialization logic
        return json_encode([
            'id' => $obj->getId(),
            'name' => $obj->getName(),
            'metadata' => $obj->getMetadata()
        ]);
    }

    public static function customDeserialize($data): ComplexObject
    {
        $parsed = is_string($data) ? json_decode($data, true) : $data;
        
        // Efficient deserialization and recommended for simpler objects.
        return (new ComplexObjectFactory())->recreate( 
            $parsed['id'], 
            $parsed['name'], 
            $parsed['metadata']
        );
    }
}
```

#### Handling Polymorphic Objects

```php
class DocumentEntity extends CPTEntity
{
    #[MetaField(
        serialize: "json_encode",
        deserialize: [self::class, 'deserializeDocument']
    )]
    public DocumentInterface $document;

    public static function deserializeDocument($documentJson): DocumentInterface
    {
        $parsed = json_decode($documentJson, true);
        
        // Polymorphic deserialization
        switch ($parsed['type']) {
            case 'pdf':
                return PDFDocument::fromArray($parsed);
            case 'word':
                return WordDocument::fromArray($parsed);
            default:
                throw new \InvalidArgumentException('Unknown document type');
        }
    }
}
```

### Repository Customization Hooks

ModulesPress repositories provide several customization points:

```php
class BookRepository extends CPTRepository
{
    // Stabilize entity before saving
    protected function stabilizeEntityBeforeSave(CPTEntity $entity, array $postData): CPTEntity
    {
        // Add default values, normalize data
        return parent::stabilizeEntityBeforeSave($entity, $postData);
    }

    // Transform entity before saving
    protected function transformEntityBeforeSave(CPTEntity $entity, array $postData): CPTEntity
    {
        // Modify entity before persistence
        // Useful for:
        // - Setting timestamps
        // - Generating slugs
        // - Adding computed properties
        return $entity;
    }

    // Validate entity before saving
    protected function validateEntityBeforeSave(CPTEntity $entity, array $postData): CPTEntity
    {
        // Additional custom validation
        // Can complement Symfony validation
        return parent::validateEntityBeforeSave($entity, $postData);
    }

    // Customize metadata mapping
    protected function mapMetaToEntity(WP_Post $post, CPTEntity $entity): CPTEntity
    {
        // Custom metadata handling
        return parent::mapMetaToEntity($post, $entity);
    }
}
```

#### Customization Hooks Overview

1. `stabilizeEntityBeforeSave()`: Ensure entity has all required data
2. `transformEntityBeforeSave()`: Modify entity before saving
3. `validateEntityBeforeSave()`: Add repository-level validation
4. `mapMetaToEntity()`: Custom metadata mapping
5. `mapTaxonomyToEntity()`: Custom taxonomy mapping

These hooks provide extensive flexibility in entity management, allowing you to:
- Normalize data
- Add computed properties
- Implement complex validation
- Handle special serialization scenarios

## Complete Example

Here's a comprehensive example showcasing various features:

```php
#[CustomPostType(
    name: 'book',
    singular: 'Book',
    plural: 'Books',
    args: [
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
    ]
)]
class Book extends CPTEntity
{
    public string $title = 'New Book';

    #[Constraints\Length(min: 5, max: 255)]
    #[Constraints\NotNull]
    #[MetaField]
    public string $name;

    #[Constraints\Length(min: 5, max: 255)]
    #[Constraints\NotNull]
    #[MetaField]
    public string $author;

    #[MetaField(default: [self::class, 'generateDescription'])]
    #[Constraints\NotNull]
    public string $description;

    /** @var string[] */
    #[Constraints\All([
        new Constraints\Length(min: 5, max: 255),
        new Constraints\NotBlank()
    ])]
    #[Constraints\Count(min: 1, max: 5)]
    #[MetaField]
    public array $socialMedia;

    #[Constraints\Valid]
    #[Constraints\NotNull]
    #[MetaField(
        default: new Library(),
        key: "lib",
        serialize: "json_encode",
        deserialize: [self::class, 'deserializeLibrary']
    )]
    public Library $library;

    /** @var string[] */
    #[Constraints\All([
        new Constraints\Length(min: 5, max: 255),
        new Constraints\NotBlank()
    ])]
    #[Constraints\Count(min: 1, max: 5)]
    #[TaxonomyField(GenreTaxonomy::class)]
    public array $genres;

    public function getTitleWithDesc(): string
    {
        return $this->title . " - " . $this->description;
    }
}
```

## Best Practices

1. **Type Safety**
   - Always use proper type hints
   - Include PHPDoc annotations for arrays
   - Leverage PHP 8.0+ features

2. **Validation**
   - Add appropriate Symfony constraints
   - Use custom messages for better UX
   - Validate nested objects

3. **Documentation**
   - Document complex serialization logic
   - Explain non-obvious default values
   - Add PHPDoc for public methods

4. **Architecture**
   - Keep entities focused on data structure
   - Use repositories for data access
   - Separate business logic

5. **Performance**
   - Use appropriate serialization methods
   - Consider caching for complex queries
   - Monitor meta query performance

:::tip Pro Tip
Use the built-in properties (`title`, `content`, `excerpt`) when possible instead of creating custom meta fields for these standard WordPress fields.
:::

## Common Pitfalls

- **Registration Order**: Ensure taxonomies are registered before being used in entities
- **Serialization**: Handle edge cases in custom serialization methods
- **Validation**: Don't forget to validate nested objects
- **Default Values**: Be careful with dynamic defaults that might change
- **Meta Queries**: Consider performance with complex meta field searches

## Conclusion

CPT Entities in ModulesPress provide a modern, type-safe way to work with WordPress custom post types. By combining PHP 8 attributes, Symfony validation, and automatic WordPress integration, they offer a powerful foundation for building scalable WordPress plugins.