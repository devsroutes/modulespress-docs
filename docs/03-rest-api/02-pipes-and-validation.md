---
sidebar_position: 3
---

# Pipes and Validation

ModulesPress provides a robust validation system built on top of Symfony's Validator component, offering comprehensive data validation, transformation, and sanitization capabilities through DTOs (Data Transfer Objects) and custom validation pipes.

## Data Transfer Objects (DTOs)

DTOs serve as a powerful way to validate, type-check, and structure incoming request data. They provide compile-time type safety and runtime validation.

### Basic DTO Implementation

Here's a comprehensive example of a DTO with various validation constraints:

```php title="src/Modules/BooksModule/DTOs/CreateBookDTO.php"
use Symfony\Component\Validator\Constraints;

class CreateBookDTO 
{
    #[Constraints\Length(
        min: 1, 
        max: 255,
        minMessage: 'Book name must be at least {{ limit }} character long',
        maxMessage: 'Book name cannot be longer than {{ limit }} characters'
    )]
    #[Constraints\NotBlank(message: 'Book name is required')]
    public string $name;

    #[Constraints\Length(
        min: 5, 
        max: 255,
        minMessage: 'Author name must be at least {{ limit }} characters long'
    )]
    #[Constraints\NotBlank(message: 'Author name is required')]
    public string $author;

    #[Constraints\All([
        new Constraints\Choice(
            choices: ['facebook', 'twitter', 'instagram'],
            message: 'Invalid social media platform. Valid options are: facebook, twitter, instagram'
        )
    ])]
    #[Constraints\NotBlank(message: 'At least one social media platform is required')]
    #[Constraints\Count(
        min: 1,
        max: 3,
        minMessage: 'At least {{ limit }} social media platform must be selected',
        maxMessage: 'No more than {{ limit }} social media platforms can be selected'
    )]
    public array $socialMedia;

    #[Constraints\All([
        new Constraints\Choice([
            'choices' => ['fantasy', 'horror', 'mystery'],
            'message' => 'Invalid genre selected'
        ])
    ])]
    #[Constraints\NotBlank(message: 'At least one genre is required')]
    public array $genres;

    #[Constraints\Type('numeric')]
    #[Constraints\Range(
        min: 0,
        max: 1000,
        notInRangeMessage: 'Price must be between {{ min }} and {{ max }}'
    )]
    public float $price;
}
```

### Using DTOs in Controllers

```php title="src/Modules/BooksModule/Controllers/BookController.php"
class BookController
{
    #[Post('/books')]
    public function createBook(#[Body] CreateBookDTO $book): Book 
    {
        // DTO is automatically validated before reaching this point
        // If validation fails, UnprocessableEntityHttpException is thrown
        return $this->bookService->create($book);
    }
}
```

### Nested DTOs

ModulesPress supports complex nested data structures using the `ClassTransformer` library:

```php title="src/Modules/BooksModule/DTOs/LibraryDTO.php"
use ClassTransformer\Attributes\ConvertArray;
use Symfony\Component\Validator\Constraints;

class LocationDTO 
{
    #[Constraints\NotBlank]
    #[Constraints\Type('string')]
    public string $country;

    #[Constraints\NotBlank]
    #[Constraints\Type('string')]
    public string $city;
}

class LibraryDTO 
{
    #[Constraints\Length(min: 5)]
    #[Constraints\NotBlank]
    public string $name;

    #[Constraints\Valid]
    public LocationDTO $location;

    #[Constraints\Type('boolean')]
    public bool $isOpen;
}

class CreateBookDTO 
{
    // ... other properties

    #[ConvertArray(LibraryDTO::class)]
    #[Constraints\All([
        new Constraints\Type(LibraryDTO::class),
        new Constraints\Valid()
    ])]
    #[Constraints\Count(
        exactly: 1,
        exactMessage: 'Exactly {{ limit }} library must be specified'
    )]
    #[Constraints\NotBlank]
    public array $libraries;
}
```

## Validation Pipes

Pipes provide a powerful way to transform or validate data before it reaches your handlers.

### Custom Validation Pipe

The `IsbnValidationPipe` is a custom validation pipe that ensures the input value is a string and adheres to the ISBN-13 format. It removes hyphens or spaces from the valid input, throwing a ValidationException for invalid data.

```php title="src/Modules/BooksModule/Pipes/IsbnValidationPipe.php"
#[Injectable]
class IsbnValidationPipe implements PipeTransform 
{
    public function transform(mixed $value): string 
    {
        if (!is_string($value)) {
            throw new ValidationException('ISBN must be a string');
        }

        // ISBN-13 format validation
        if (!preg_match('/^(?:ISBN(?:-13)?:? )?(?=[0-9]{13}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)97[89][- ]?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9]$/', $value)) {
            throw new ValidationException('Invalid ISBN-13 format');
        }

        // Remove any hyphens or spaces
        return preg_replace('/[- ]/', '', $value);
    }
}
```

### Data Transformation Pipe

The `TitleTransformPipe` validates that the input is a string and transforms it by trimming whitespace, converting it to lowercase, and capitalizing the first letter of each word. It throws a ValidationException if the input is not a string.

```php title="src/Modules/BooksModule/Pipes/TitleTransformPipe.php"
#[Injectable]
class TitleTransformPipe implements PipeTransform 
{
    public function transform(mixed $value): string 
    {
        if (!is_string($value)) {
            throw new ValidationException('Title must be a string');
        }

        // Capitalize first letter of each word
        return ucwords(strtolower(trim($value)));
    }
}
```

### Pipe Scopes and UsePipes Attribute

ModulesPress provides the `#[UsePipes]` attribute to apply pipes at different levels:

1. **Parameter Level**: Apply pipes directly on a single parameter with pipes property
```php
class BookController 
{
    #[Post('/books')]
    public function createBook(
        #[Body('isbn', pipes: [IsbnValidationPipe::class])] string $isbn,
        #[Body('title', pipes: [TitleTransformPipe::class])] string $title
    ): Book {
        return $this->bookService->create([
            'isbn' => $isbn,  // Validated ISBN
            'title' => $title // Transformed title
        ]);
    }
}
```

2. **Method Level**: Apply pipes to specific method parameters
```php
class BookController 
{
    #[UsePipes(UppercasePipe::class, new ValueJoinPipe("prefixed"))]
    #[Post('/books')]
    public function createBook(
        #[Body('isbn')] string $isbn,
        #[Body('title')] string $title
    ): Book {
        return $this->bookService->create([
            'isbn' => $isbn,  // Validated ISBN
            'title' => $title // Transformed title
        ]);
    }
}
```

3. **Class Level**: Apply pipes to all methods in a class
```php
#[UsePipes(UppercasePipe::class, new ValueJoinPipe("prefixed"))]
#[RestController("/books")]
class BooksController
{
    // Pipes will be applied to all methods in this controller
}
```

4. **Global Plugin Level**: Apply pipes across the entire plugin
```php
class BooksModule extends ModulesPressModule 
{
    public function pluginPipes(): array 
    {
        return [
            new ValueJoinPipe("prefixed"),
            UppercasePipe::class, 
            // Other global pipes
        ];
    }
}
```

### Pipe Execution Order
- Pipes are executed in the order they are defined
- Global plugin pipes run first
- Class-level pipes run next
- Method-level pipes run last
- Within each level, pipes are executed in the order specified

## Direct Attribute Validation

You can apply validation rules directly on controller method parameters with `rules` property:

```php title="src/Modules/BooksModule/Controllers/VideoController.php"
class VideoController 
{
    #[Post('/videos/reorder')]
    public function reorderVideos(
        #[Body(rules: [
            new Constraints\All([
                new Constraints\Collection([
                    'fields' => [
                        'id' => [
                            new Constraints\Type('string'),
                            new Constraints\NotBlank(message: 'Video ID is required')
                        ],
                        'order' => [
                            new Constraints\Type('integer'),
                            new Constraints\Range(
                                min: 0,
                                minMessage: 'Order must be a positive number'
                            )
                        ]
                    ],
                    'allowExtraFields' => false,
                    'allowMissingFields' => false
                ])
            ])
        ])] array $videosOrder
    ): array {
        // Process video reordering
        return $this->videoService->reorder($videosOrder);
    }
}
```

## Validation Error Handling

When validation fails, ModulesPress throws an `UnprocessableEntityHttpException` with a structured error response:

```json
{
  "message": "Validation Exception",
  "statusCode": 422,
  "errors": {
    "name": "This value should not be blank.",
    "socialMedia[0]": "The value you selected is not a valid choice.",
    "libraries[0].location.country": "This value should not be blank."
  },
  "reason": ""
}
```

### Custom Exception Filter

Create custom exception filters to handle validation errors, this filter can be applied on plugin global level or on method or class. More later in exception handlers chapter.

```php title="src/Modules/BooksModule/Filters/ValidationExceptionFilter.php"
#[CatchException(ValidationException::class)]
class ValidationExceptionFilter implements ExceptionFilter 
{
    public function catchException(
        BaseException $exception, 
        ExecutionContext $context
    ):  WP_REST_Response | HtmlResponse | JsonResponse {
        $errors = $exception->getErrors();
        
        return new WP_REST_Response([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $this->formatValidationErrors($errors),
            'timestamp' => (new DateTime())->format(DateTime::ISO8601)
        ], 422);
    }

    private function formatValidationErrors(array $errors): array 
    {
        // Format nested validation errors into a flat structure
        $formatted = [];
        foreach ($errors as $path => $messages) {
            if (is_array($messages)) {
                foreach ($messages as $message) {
                    $formatted[$path] = $message;
                }
            } else {
                $formatted[$path] = $messages;
            }
        }
        return $formatted;
    }
}
```

## Best Practices

### Validation
1. **Use DTOs for Complex Objects**: Always use DTOs for validating complex request bodies rather than handling individual parameters.
2. **Nested Validation**: Utilize nested DTOs for hierarchical data structures to maintain clean and organized validation logic.
3. **Custom Messages**: Provide clear, user-friendly validation error messages that guide the API consumer on how to fix the issue.
4. **Consistent Error Format**: Maintain a consistent error response format across your plugin.

### Pipes
1. **Single Responsibility**: Each pipe should handle one specific transformation or validation concern.
2. **Reusability**: Design pipes to be reusable across different endpoints and modules.
3. **Chain of Responsibility**: When multiple transformations are needed, chain pipes together rather than creating complex monolithic pipes.

### Performance
1. **Early Returns**: In pipes, validate preconditions early and return as soon as possible.

:::tip Pro Tips
- Always validate data at the edge of your plugin using DTOs or pipes
- Use type hints and return types for better static analysis
- Keep validation logic separate from business logic
- Document your validation constraints and error messages
- Test your validation logic with both valid and invalid inputs
:::

:::warning Common Pitfalls
1. Avoid mixing validation logic with business logic
2. Don't skip validation for "trusted" sources
3. Never expose internal error messages to API consumers
4. Don't forget to handle nested validation errors
:::