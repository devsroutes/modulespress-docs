---
sidebar_position: 2
---

# CPT Repositories

# Custom Post Type Repositories in ModulesPress

CPT Repositories provide a powerful abstraction layer for working with WordPress custom post types. They handle all the complexity of data persistence, validation, and retrieval while maintaining type safety and clean architecture.

## Overview

CPT Repositories act as a bridge between your plugin's business logic and WordPress's database layer, providing a clean, object-oriented interface for working with Custom Post Types.

:::tip Why Use CPT Repositories?
- Type-safe CRUD operations
- Automatic validation
- Clean separation of concerns
- Simplified data access patterns
- Extensible query methods
:::

## Basic Structure

Every repository extends the base `CPTRepository` class and is typically associated with a specific CPT Entity:

```php
use ModulesPress\Foundation\Entity\CPT\Repositories\CPTRepository;
use ModulesPress\Foundation\DI\Attributes\Injectable;

#[Injectable]
class BookRepository extends CPTRepository
{
    public function __construct()
    {
        parent::__construct(Book::class);
    }
}
```

:::note
The `#[Injectable]` attribute allows the repository to be automatically injected through ModulesPress's dependency injection system.
:::

## Core Features

### Built-in CRUD Operations

Every CPT Repository comes with essential CRUD operations:

```php
class BookController
{
    public function __construct(
        private BookRepository $repository
    ) {}

    public function examples()
    {
        // Find by ID
        $book = $this->repository->find(123);

        // Find all
        $allBooks = $this->repository->findAll();

        // Find by criteria
        $books = $this->repository->findBy([
            'post_status' => 'publish',
            'orderby' => 'title'
        ]);

        // Save (create or update)
        $book = new Book();
        $book->title = 'New Book';
        $this->repository->save($book);

        // Remove
        $this->repository->remove($book);
    }
}
```

### Automatic Meta Handling

The repository automatically manages meta fields defined in your entity:

```php
// Repository handles all meta field operations transparently
$book = new Book();
$book->author = 'John Doe';     // Meta field
$book->genres = ['Fiction'];    // Taxonomy field
$book->library = new Library(); // Complex object

// Single save operation handles everything
$this->repository->save($book);
```

## Advanced Features

### Custom Query Methods

Extend the repository with custom query methods for specific business needs:

```php
class BookRepository extends CPTRepository
{
    /**
     * Find books by author
     * 
     * @param string $author
     * @return Book[]
     */
    public function findByAuthor(string $author): array
    {
        return $this->findBy([
            'meta_key' => 'author',
            'meta_value' => $author
        ]);
    }

    /**
     * Find featured books
     * 
     * @return Book[]
     */
    public function findFeatured(): array
    {
        return $this->findBy([
            'meta_query' => [
                [
                    'key' => 'featured',
                    'value' => true,
                    'type' => 'BOOLEAN'
                ]
            ]
        ]);
    }
}
```

### Complex Meta Queries

Handle sophisticated search patterns:

```php
public function findByComplexCriteria(
    string $genre,
    int $minPrice,
    string $publishedAfter
): array {
    return $this->findBy([
        'tax_query' => [
            [
                'taxonomy' => 'genre',
                'field' => 'slug',
                'terms' => $genre
            ]
        ],
        'meta_query' => [
            'relation' => 'AND',
            [
                'key' => 'price',
                'value' => $minPrice,
                'type' => 'NUMERIC',
                'compare' => '>='
            ],
            [
                'key' => 'published_date',
                'value' => $publishedAfter,
                'type' => 'DATE',
                'compare' => '>'
            ]
        ]
    ]);
}
```

### Custom Entity Transformation

Override transformation methods for special handling:

```php
class BookRepository extends CPTRepository
{
    protected function transformEntityBeforeSave(
        CPTEntity $entity,
        array $postData
    ): CPTEntity {
        /** @var Book $entity */
        // Add a timestamp before saving
        $entity->lastModified = new DateTime();
        
        // Generate a slug if not set
        if (empty($entity->slug)) {
            $entity->slug = sanitize_title($entity->title);
        }

        return $entity;
    }

    protected function mapMetaToEntity(
        WP_Post $post,
        CPTEntity $entity
    ): CPTEntity {
        $entity = parent::mapMetaToEntity($post, $entity);
        
        // Custom mapping logic
        if (isset($entity->legacyField)) {
            $entity->newField = $this->transformLegacyData(
                $entity->legacyField
            );
        }

        return $entity;
    }
}
```

## Advanced Use Cases

### Caching Integration

Implement caching for better performance:

```php
class CachedBookRepository extends BookRepository
{
    private CacheInterface $cache;

    public function find(int $id): ?Book
    {
        $cacheKey = "book_{$id}";
        
        return $this->cache->get($cacheKey, function() use ($id) {
            return parent::find($id);
        });
    }

    public function save(CPTEntity $entity): CPTEntity
    {
        $entity = parent::save($entity);
        $this->cache->delete("book_{$entity->getId()}");
        return $entity;
    }
}
```

### Event Dispatching

Add event dispatching for complex workflows:

```php
class EventAwareBookRepository extends BookRepository
{
    private EventDispatcherInterface $dispatcher;

    public function save(CPTEntity $entity): CPTEntity
    {
        $isNew = !$entity->getId();
        
        $entity = parent::save($entity);
        
        $event = $isNew 
            ? new BookCreatedEvent($entity)
            : new BookUpdatedEvent($entity);
            
        $this->dispatcher->dispatch($event);
        
        return $entity;
    }
}
```

### Custom Validation

Implement domain-specific validation:

```php
class BookRepository extends CPTRepository
{
    protected function validateEntityBeforeSave(
        CPTEntity $entity,
        array $postData
    ): CPTEntity {
        /** @var Book $entity */
        // First run standard validation
        $entity = parent::validateEntityBeforeSave($entity, $postData);
        
        // Custom domain validation
        if ($entity->isPublished() && empty($entity->isbn)) {
            throw new ValidationException(
                'Published books must have an ISBN'
            );
        }
        
        return $entity;
    }
}
```

## Best Practices

### 1. Repository Design

```php
class BookRepository extends CPTRepository
{
    // ✅ Good: Specific, meaningful method names
    public function findPublishedInSeries(string $series): array
    
    // ❌ Bad: Generic, unclear methods
    public function findCustom(array $args): array
}
```

### 2. Query Optimization

```php
class BookRepository extends CPTRepository
{
    public function findPopularBooks(): array
    {
        // ✅ Good: Optimized query with specific fields
        return $this->findBy([
            'fields' => 'ids',  // Only get IDs if that's all you need
            'meta_query' => [
                [
                    'key' => 'views',
                    'value' => 1000,
                    'compare' => '>',
                    'type' => 'NUMERIC'
                ]
            ],
            'no_found_rows' => true  // Skip counting if pagination not needed
        ]);
    }
}
```

## Performance Tips

:::tip Performance Optimization
1. **Use Specific Queries**
   - Request only needed fields
   - Utilize `fields => 'ids'` when possible
   - Set `no_found_rows => true` when not paginating

2. **Optimize Meta Queries**
   - Index frequently queried meta fields
   - Combine related meta queries
   - Use appropriate meta value types

3. **Implement Caching**
   - Cache frequently accessed entities
   - Clear cache on updates
   - Use transients for temporary data
:::

## Integration Examples

### With Controllers

```php
class BookController
{
    public function __construct(
        private BookRepository $books,
        private AuthorRepository $authors
    ) {}

    #[Post('/books')]
    public function createBook(#[Body] CreateBookDTO $data)
    {
        $author = $this->authors->find($data->authorId);
        if (!$author) {
            throw new NotFoundHttpException('Author not found');
        }

        $book = new Book();
        $book->title = $data->title;
        $book->author = $author->name;
        
        return $this->books->save($book);
    }
}
```

### With Services

```php
class BookService
{
    public function __construct(
        private BookRepository $books,
        private EventDispatcher $events
    ) {}

    public function publishBook(int $bookId): Book
    {
        $book = $this->books->find($bookId);
        if (!$book) {
            throw new NotFoundHttpException('Book not found');
        }

        $book->status = 'published';
        $book->publishedAt = new DateTime();
        
        $book = $this->books->save($book);
        $this->events->dispatch(new BookPublishedEvent($book));
        
        return $book;
    }
}
```

## Conclusion

CPT Repositories in ModulesPress provide a robust foundation for working with WordPress custom post types. They offer:

- Clean, object-oriented data access
- Type-safe operations
- Extensible architecture
- Performance optimization opportunities
- Integration with modern PHP practices

By leveraging repositories, you can build maintainable, scalable WordPress plugins while keeping your business logic clean and testable.