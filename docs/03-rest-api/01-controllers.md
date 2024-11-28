---
sidebar_position: 1
---

# Controllers

Controllers in ModulesPress handle incoming requests and return appropriate responses to clients. They utilize a clean, decorator-based approach for building REST APIs, based on the underlying WP REST API for all registrations and callbacks.

## Basic Controller

To create a controller, utilize the `#[RestController]` attribute which takes a `namespace` as a parameter

```php title="src/Modules/BooksModule/Controllers/BooksController.php"
#[RestController(namespace: "/books")]
class BooksController {
    public function __construct(
        #[Inject("bookService")] 
        private readonly BooksServiceProvider $booksService
    ) {}

    #[Get]
    public function getBooks(): array {
        return $this->booksService->getBooks();
    }

    #[Post]
    public function createBook(
        #[Body] CreateBookDTO $book
    ): array {
        return [
            "message" => "Book created",
            "book" => $book
        ];
    }
}
```

## HTTP Methods and Routing

ModulesPress supports standard HTTP methods for routing, all these attributes are repeatable.

```php title="src/Modules/BooksModule/Controllers/BooksController.php"
use ModulesPress\Foundation\Http\Attributes\{ 
    RestController, Get, Post, Put, Patch, Delete, Param, Body 
};

#[RestController("/books")]
class BooksController {

    public function __construct(
        private readonly BookService $bookService
    ){}

    #[Get]
    public function getBooks() {
        return $this->bookService->findAll();
    }

    #[Get("/:id")]
    public function getBook(#[Param("id")] int $id) {
        return $this->bookService->findById($id);
    }

    #[Post]
    public function createBook(#[Body] CreateBookDTO $book) {
        return $this->bookService->create($book);
    }

    #[Put("/:id")]
    public function updateBook(
        #[Param("id")] int $id,
        #[Body] UpdateBookDTO $book
    ) {
        return $this->bookService->update($id, $book);
    }

    #[Patch("/:id")]
    public function patchBook(
        #[Param("id")] int $id,
        #[Body] PatchBookDTO $book
    ) {
        return $this->bookService->patch($id, $book);
    }

    #[Delete("/:id")]
    public function deleteBook(#[Param("id")] int $id) {
        return $this->bookService->delete($id);
    }
}
```

## Request Data Extraction

ModulesPress provides powerful tools for parameter extraction, validation, and transformation.

### Route Parameters

Access route parameters using the `#[Param]` attribute:

```php title="src/Modules/BooksModule/Controllers/BooksController.php"
#[Get("/category/:category/author/:author")]
public function getBooksByCategory(
    #[Param("category")] string $category,
    #[Param("author")] string $author
): array {
    return $this->bookService->findByCategoryAndAuthor($category, $author);
}
```

### Query Parameters

Handle query parameters with the `#[Query]` attribute:

```php title="src/Modules/BooksModule/Controllers/BooksController.php"
#[Get]
public function searchBooks(
    #[Query("search")] string $searchTerm,
    #[Query("page", default: 1)] int $page,
    #[Query("limit", default: 10)] int $limit
): array {
    return $this->bookService->search($searchTerm, $page, $limit);
}
```

### Body Parameter

Process request body using the `#[Body]` attribute:

```php title="src/Modules/BooksModule/Controllers/BooksController.php"
#[Post]
public function createBook(
    #[Body] CreateBookDTO $book,
    #[WP_REST_Req] WP_REST_Request $request
): array {
    // Access raw request if needed
    $headers = $request->get_headers();
    
    return $this->bookService->create($book);
}
```
### Key Extraction and Casting

- **Key**: Keys help identify specific data. For instance, if you want to extract nested data such as an author's details from a JSON object submitted as a request body, you can specify a key using dot notation. For example, to get the name of the author from an incoming structure:

    ```php title="src/Modules/BooksModule/Controllers/BooksController.php"
    #[Post]
    public function createBook(
        #[Body("author.name")] string $authorName,
    ): array {
        // Assuming the structure is:
        // {
        //     "bookTitle": "Example Book",
        //     "author": {
        //         "name": "Jane Doe",
        //         "age": 35
        //     }
        // }
        return [
            "message" => "Book created",
            "title" => $data['bookTitle'],
            "author" => $authorName
        ];
    }
    ```

    This allows you to directly access nested properties while keeping your code cleaner.

- **Casting**: PHP is a typed language, so we can leverage types declarations. ModulesPress allows for type casting to enforce type safety. If casting is enabled, the framework attempts to convert incoming data to the specified types. If no type is provided, no casting will occur by default. Casting is enabled by default for typed parameters.

    ```php title="src/Modules/BooksModule/Controllers/BooksController.php"
    #[Get]
    public function getBook(#[Param("id", casting: true)] int $id) {
        // Here, if the incoming "id" is a string representation of an integer, it will be cast to int
        return $this->bookService->findById($id);
    }
    ```

:::info
Key and casting property is available for all three attributes, `#[Param]`, `#[Query]` and `#[Body]`.
:::


### Accessing WordPress Request/Response Objects

You can extract underlying WordPress-specific REST Request and Response objects with `#[WP_REST_Req]` and `#[WP_REST_Res]` respectively:

```php title="src/Controllers/BooksController.php"
#[Get]
public function getBooks(
    #[WP_REST_Req] WP_REST_Request $req,
    #[WP_REST_Res] WP_REST_Response $res
): WP_REST_Response {
    $res->header('X-Custom-Header', '1.0.0');
    $res->set_status(200);
    
    return $res;
}
```

:::tip Controller Best Practices
1. Keep controllers focused solely on request/response handling.
2. Utilize DTOs for request validation to ensure data integrity.
3. Implement proper error handling using exception filters to manage failures gracefully.
4. Move business logic into dedicated service classes to maintain separation of concerns.
:::