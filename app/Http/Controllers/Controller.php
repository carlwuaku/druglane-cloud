<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     title="Druglane Cloud API",
 *     version="1.0.0",
 *     description="Cloud-based management system for offline desktop inventory management applications. This API handles license management, backup storage, and provides online access to inventory data.",
 *     @OA\Contact(
 *         email="admin@druglane.com"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter token in format: Bearer {token}"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication and authorization endpoints"
 * )
 *
 * @OA\Tag(
 *     name="License",
 *     description="Desktop app license activation and validation"
 * )
 *
 * @OA\Tag(
 *     name="Companies",
 *     description="Company management (Admin only)"
 * )
 *
 * @OA\Tag(
 *     name="Users",
 *     description="User management (Admin only)"
 * )
 *
 * @OA\Tag(
 *     name="Database Upload",
 *     description="Database backup upload from desktop applications"
 * )
 *
 * @OA\Tag(
 *     name="Company Data",
 *     description="Company-specific data access (Products, Sales, Purchases)"
 * )
 *
 * @OA\Schema(
 *     schema="Company",
 *     type="object",
 *     title="Company",
 *     description="Company model with license information",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Acme Corporation"),
 *     @OA\Property(property="license_key", type="string", example="ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456"),
 *     @OA\Property(property="is_activated", type="boolean", example=true),
 *     @OA\Property(property="activated_at", type="string", format="date-time", example="2025-01-15T10:30:00Z"),
 *     @OA\Property(property="activated_by_machine_id", type="string", example="MACHINE-UUID-1234"),
 *     @OA\Property(property="license_status", type="string", enum={"active", "inactive", "expired", "suspended"}, example="active"),
 *     @OA\Property(property="license_issued_at", type="string", format="date-time", example="2025-01-01T00:00:00Z"),
 *     @OA\Property(property="license_expires_at", type="string", format="date-time", example="2026-01-01T00:00:00Z"),
 *     @OA\Property(property="email", type="string", format="email", example="contact@acme.com"),
 *     @OA\Property(property="phone", type="string", example="+1-555-0123"),
 *     @OA\Property(property="address", type="string", example="123 Business St"),
 *     @OA\Property(property="city", type="string", example="New York"),
 *     @OA\Property(property="country", type="string", example="USA"),
 *     @OA\Property(property="notes", type="string", example="VIP customer"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T00:00:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-15T10:30:00Z"),
 *     @OA\Property(property="deleted_at", type="string", format="date-time", nullable=true, example=null)
 * )
 *
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     title="User",
 *     description="User model with role and company relationships",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="role_id", type="integer", example=2),
 *     @OA\Property(property="company_id", type="integer", nullable=true, example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="last_login_at", type="string", format="date-time", nullable=true, example="2025-12-05T14:30:00Z"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true, example="2025-01-01T00:00:00Z"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T00:00:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-12-05T14:30:00Z"),
 *     @OA\Property(
 *         property="role",
 *         type="object",
 *         @OA\Property(property="id", type="integer", example=2),
 *         @OA\Property(property="name", type="string", example="company_user"),
 *         @OA\Property(property="display_name", type="string", example="Company User")
 *     ),
 *     @OA\Property(
 *         property="company",
 *         type="object",
 *         nullable=true,
 *         @OA\Property(property="id", type="integer", example=1),
 *         @OA\Property(property="name", type="string", example="Acme Corporation"),
 *         @OA\Property(property="license_key", type="string", example="ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456")
 *     )
 * )
 */
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
