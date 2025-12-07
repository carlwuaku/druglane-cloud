# Swagger API Documentation Setup

## Overview

Swagger/OpenAPI documentation has been successfully added to the Druglane Cloud API using the `darkaonline/l5-swagger` package.

## Accessing Swagger Documentation

### Swagger UI (Interactive Documentation)

**URL:** `http://localhost:8000/api/documentation`

This provides an interactive interface where you can:
- View all API endpoints
- See request/response schemas
- Test endpoints directly from the browser
- Download OpenAPI JSON specification

### OpenAPI JSON Specification

**URL:** `http://localhost:8000/docs/api-docs.json`

Direct access to the OpenAPI 3.0 specification file.

## API Documentation Coverage

### Documented Endpoints

#### Authentication Endpoints
- `POST /api/login` - User login with email/password
- `POST /api/signup` - User registration (currently disabled)
- `POST /api/logout` - Logout and invalidate token

#### License Endpoints (Desktop App)
- `POST /api/license/validate` - Check if license key is valid
- `POST /api/license/activate` - One-time license activation with machine ID
- `POST /api/license/check-activation` - Verify activation status

#### Admin Endpoints
- Companies CRUD (requires admin role)
- Users CRUD (requires admin role)

## Using Swagger UI

### 1. Open Swagger UI

Navigate to: `http://localhost:8000/api/documentation`

### 2. Try Authentication

1. **Expand** `POST /api/login`
2. **Click** "Try it out"
3. **Enter** credentials:
   ```json
   {
     "email": "admin@druglane.com",
     "password": "password"
   }
   ```
4. **Click** "Execute"
5. **Copy** the `token` from the response

### 3. Authorize Swagger

1. **Click** the "Authorize" button (lock icon at top)
2. **Enter:** `Bearer YOUR_TOKEN_HERE`
3. **Click** "Authorize"
4. **Click** "Close"

Now all protected endpoints will include your authentication token automatically!

### 4. Test Protected Endpoints

Try any endpoint marked with a lock icon:
- `POST /api/logout`
- `GET /api/user`
- `GET /api/companies` (admin only)

## Regenerating Documentation

Whenever you update controller annotations, regenerate the docs:

```bash
php artisan l5-swagger:generate
```

This scans all controllers with `@OA\` annotations and generates the OpenAPI spec.

## Adding Documentation to New Endpoints

### Example: Document a New Endpoint

```php
/**
 * @OA\Get(
 *     path="/api/my-endpoint",
 *     tags={"MyTag"},
 *     summary="Short description",
 *     description="Longer description of what this endpoint does",
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Successful response",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="data", type="object")
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Not found",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Resource not found")
 *         )
 *     )
 * )
 */
public function myMethod(Request $request, $id) {
    // Your code here
}
```

### Key Annotation Elements

#### Basic Info
- `@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Delete` - HTTP method
- `path` - API endpoint path
- `tags` - Group endpoints together
- `summary` - Short description (appears in list)
- `description` - Detailed description

#### Security
- `security={{"sanctum":{}}}` - Requires Bearer token

#### Request Body
```php
@OA\RequestBody(
    required=true,
    @OA\JsonContent(
        required={"field1", "field2"},
        @OA\Property(property="field1", type="string", example="value1"),
        @OA\Property(property="field2", type="integer", example=123)
    )
)
```

#### Responses
```php
@OA\Response(
    response=200,
    description="Success message",
    @OA\JsonContent(
        @OA\Property(property="message", type="string"),
        @OA\Property(property="data", type="object")
    )
)
```

## Configuration

### Main Config File

**Location:** `config/l5-swagger.php`

Key settings:
```php
'defaults' => [
    'routes' => [
        'api' => 'api/documentation', // Swagger UI URL
    ],
    'paths' => [
        'docs' => storage_path('api-docs'), // Generated JSON location
        'annotations' => base_path('app'), // Where to scan for annotations
    ],
],
```

### Environment Variables

Add to `.env` if needed:
```env
L5_SWAGGER_GENERATE_ALWAYS=false
L5_SWAGGER_CONST_HOST=http://localhost:8000
```

## Common Tags Used

- **Authentication** - Login, logout, registration
- **License** - Desktop app license operations
- **Companies** - Company management (admin)
- **Users** - User management (admin)
- **Backups** - Backup operations (future)
- **Inventory** - Inventory data access (future)

## Security Scheme

The API uses **Bearer Token Authentication** (Laravel Sanctum):

```
Authorization: Bearer 1|xxxxxxxxxxxxxxxx
```

This is configured in [app/Http/Controllers/Controller.php](app/Http/Controllers/Controller.php):

```php
/**
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter token in format: Bearer {token}"
 * )
 */
```

## Annotation Reference

### Full OpenAPI 3.0 Spec

Swagger uses OpenAPI 3.0 specification. Full documentation:
- https://swagger.io/specification/
- https://zircote.github.io/swagger-php/

### Common Data Types

- `string` - Text
- `integer` - Whole numbers
- `number` - Decimals
- `boolean` - true/false
- `array` - Lists
- `object` - JSON objects

### Common Formats

- `email` - Email address
- `password` - Password field
- `date` - Date (YYYY-MM-DD)
- `date-time` - DateTime (ISO 8601)
- `uri` - URL

## Best Practices

### 1. Document All Public APIs

Every endpoint that external clients use should be documented.

### 2. Provide Examples

Always include example values:
```php
@OA\Property(property="email", type="string", example="user@example.com")
```

### 3. Document All Responses

Include success and all possible error responses:
- 200 - Success
- 201 - Created
- 204 - No content
- 400 - Bad request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not found
- 422 - Validation error
- 500 - Server error

### 4. Keep Descriptions Clear

Write from the perspective of the API consumer.

### 5. Tag Logically

Group related endpoints with tags for easy navigation.

### 6. Regenerate After Changes

Always run `php artisan l5-swagger:generate` after updating annotations.

## Troubleshooting

### Swagger UI Not Loading

1. Check server is running: `php artisan serve`
2. Clear cache: `php artisan l5-swagger:generate`
3. Visit: `http://localhost:8000/api/documentation`

### Documentation Not Updating

```bash
# Clear Laravel cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Regenerate Swagger docs
php artisan l5-swagger:generate
```

### Method Name Conflicts

If a controller method name conflicts with Laravel's built-in methods (like `validate`), rename it:

```php
// Bad
public function validate() { }

// Good
public function validateLicense() { }
```

### Annotations Not Being Found

Check these paths in `config/l5-swagger.php`:
```php
'annotations' => [
    base_path('app'),
]
```

Make sure your controllers are in the `app/` directory.

## Production Deployment

### Disable Auto-Generation

In production, set:
```env
L5_SWAGGER_GENERATE_ALWAYS=false
```

### Generate Before Deployment

```bash
php artisan l5-swagger:generate
```

Commit the generated files in `storage/api-docs/`.

### Security Considerations

The Swagger UI is publicly accessible by default. To restrict access:

1. **Add middleware** in `config/l5-swagger.php`:
```php
'routes' => [
    'middleware' => [
        'api' => ['auth:sanctum', 'admin'], // Require admin access
    ],
],
```

2. **Or use .htaccess** to restrict `/api/documentation`

3. **Or deploy separately** - serve docs on a different domain

## Examples from This Project

### Authentication Example

See [app/Http/Controllers/Api/AuthController.php](app/Http/Controllers/Api/AuthController.php) for examples of:
- Login endpoint with request/response schemas
- Protected endpoints (logout)
- Error responses

### License Example

See [app/Http/Controllers/Api/LicenseController.php](app/Http/Controllers/Api/LicenseController.php) for examples of:
- Public endpoints (no authentication)
- Multiple possible responses (success, conflict, error)
- Machine ID validation

## Next Steps

1. **Add more annotations** to Company and User controllers
2. **Document future endpoints** (backups, inventory)
3. **Export OpenAPI spec** for client SDK generation
4. **Generate client SDKs** using tools like:
   - OpenAPI Generator
   - Swagger Codegen

## Resources

- **L5-Swagger Package:** https://github.com/DarkaOnLine/L5-Swagger
- **Swagger-PHP:** https://zircote.github.io/swagger-php/
- **OpenAPI Spec:** https://swagger.io/specification/
- **Swagger UI:** https://swagger.io/tools/swagger-ui/

## Related Documentation

- [AUTH_SYSTEM_SETUP.md](AUTH_SYSTEM_SETUP.md) - Authentication system
- [LICENSE_ACTIVATION.md](LICENSE_ACTIVATION.md) - License activation workflow
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Overall project context
