<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Models\CompanyDatabaseUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     *
     * @OA\Get(
     *     path="/api/companies",
     *     tags={"Companies"},
     *     summary="Get all companies",
     *     description="Retrieve a paginated list of all companies with optional search and status filters. Admin only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by company name, email, or license key",
     *         required=false,
     *         @OA\Schema(type="string", example="Acme")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by license status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"active", "inactive", "expired", "suspended"}, example="active")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", example=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Company")),
     *             @OA\Property(property="current_page", type="integer", example=1),
     *             @OA\Property(property="per_page", type="integer", example=15),
     *             @OA\Property(property="total", type="integer", example=50)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Admin access required")
     * )
     */
    public function index(Request $request)
    {
        $query = Company::with(['users', 'databaseUploads' => function($q) {
            $q->latest()->limit(1);
        }]);

        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('license_key', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('license_status', $request->input('status'));
        }

        // Backup status filters
        if ($request->has('backup_filter')) {
            $backupFilter = $request->input('backup_filter');

            switch($backupFilter) {
                case 'no_backup_week':
                    $query->whereDoesntHave('databaseUploads', function($q) {
                        $q->where('created_at', '>=', now()->subWeek());
                    });
                    break;
                case 'no_backup_month':
                    $query->whereDoesntHave('databaseUploads', function($q) {
                        $q->where('created_at', '>=', now()->subMonth());
                    });
                    break;
                case 'no_backup_year':
                    $query->whereDoesntHave('databaseUploads', function($q) {
                        $q->where('created_at', '>=', now()->subYear());
                    });
                    break;
                case 'never_uploaded':
                    $query->whereDoesntHave('databaseUploads');
                    break;
                case 'expiring_soon':
                    $query->where('license_status', 'active')
                        ->where('license_expires_at', '<=', now()->addDays(30))
                        ->where('license_expires_at', '>', now());
                    break;
            }
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $companies = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($companies);
    }

    /**
     * Store a newly created company.
     *
     * @OA\Post(
     *     path="/api/companies",
     *     tags={"Companies"},
     *     summary="Create a new company",
     *     description="Create a new company with auto-generated license key. Admin only.",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email"},
     *             @OA\Property(property="name", type="string", example="Acme Corporation"),
     *             @OA\Property(property="email", type="string", format="email", example="contact@acme.com"),
     *             @OA\Property(property="phone", type="string", example="+1-555-0123"),
     *             @OA\Property(property="address", type="string", example="123 Business St"),
     *             @OA\Property(property="city", type="string", example="New York"),
     *             @OA\Property(property="country", type="string", example="USA"),
     *             @OA\Property(property="license_expires_at", type="string", format="date", example="2025-12-31"),
     *             @OA\Property(property="notes", type="string", example="VIP customer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Company created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Company created successfully"),
     *             @OA\Property(property="company", ref="#/components/schemas/Company")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Admin access required")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'license_expires_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // Set license expiration if not provided
        if (empty($data['license_expires_at'])) {
            $expirationDays = config('app.license_expiration_days', 365);
            $data['license_expires_at'] = now()->addDays($expirationDays);
        }

        $data['license_status'] = 'active';

        $company = Company::create($data);
        $company->load(['users']);

        return response()->json([
            'message' => 'Company created successfully',
            'company' => $company
        ], 201);
    }

    /**
     * Display the specified company.
     *
     * @OA\Get(
     *     path="/api/companies/{id}",
     *     tags={"Companies"},
     *     summary="Get a specific company",
     *     description="Retrieve detailed information about a specific company. Admin only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Company ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(ref="#/components/schemas/Company")
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Admin access required"),
     *     @OA\Response(response=404, description="Company not found")
     * )
     */
    public function show(Company $company)
    {
        $company->load(['users.role']);

        return response()->json($company);
    }

    /**
     * Update the specified company.
     *
     * @OA\Put(
     *     path="/api/companies/{id}",
     *     tags={"Companies"},
     *     summary="Update a company",
     *     description="Update company information. Admin only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Company ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Acme Corporation Updated"),
     *             @OA\Property(property="email", type="string", format="email", example="contact@acme.com"),
     *             @OA\Property(property="phone", type="string", example="+1-555-0123"),
     *             @OA\Property(property="address", type="string", example="123 Business St"),
     *             @OA\Property(property="city", type="string", example="New York"),
     *             @OA\Property(property="country", type="string", example="USA"),
     *             @OA\Property(property="license_status", type="string", enum={"active", "inactive", "expired", "suspended"}, example="active"),
     *             @OA\Property(property="license_expires_at", type="string", format="date", example="2025-12-31"),
     *             @OA\Property(property="notes", type="string", example="Updated notes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Company updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Company updated successfully"),
     *             @OA\Property(property="company", ref="#/components/schemas/Company")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Admin access required"),
     *     @OA\Response(response=404, description="Company not found")
     * )
     */
    public function update(Request $request, Company $company)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'license_status' => 'sometimes|in:active,inactive,expired,suspended',
            'license_expires_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $company->update($validator->validated());
        $company->load(['users']);

        return response()->json([
            'message' => 'Company updated successfully',
            'company' => $company
        ]);
    }

    /**
     * Remove the specified company (soft delete).
     *
     * @OA\Delete(
     *     path="/api/companies/{id}",
     *     tags={"Companies"},
     *     summary="Delete a company",
     *     description="Soft delete a company. Cannot delete if company has active users. Admin only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Company ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Company deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Company deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Cannot delete company with active users",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Cannot delete company with active users. Please remove or reassign users first.")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Admin access required"),
     *     @OA\Response(response=404, description="Company not found")
     * )
     */
    public function destroy(Company $company)
    {
        // Check if company has users
        if ($company->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete company with active users. Please remove or reassign users first.'
            ], 422);
        }

        $company->delete();

        return response()->json([
            'message' => 'Company deleted successfully'
        ]);
    }

    /**
     * Activate a company license.
     *
     * @OA\Post(
     *     path="/api/companies/{id}/activate",
     *     tags={"Companies"},
     *     summary="Activate company license",
     *     description="Manually activate a company's license. Admin only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Company ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="License activated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Company license activated successfully"),
     *             @OA\Property(property="company", ref="#/components/schemas/Company")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Admin access required"),
     *     @OA\Response(response=404, description="Company not found")
     * )
     */
    public function activate(Company $company)
    {
        $company->update(['license_status' => 'active']);

        return response()->json([
            'message' => 'Company license activated successfully',
            'company' => $company
        ]);
    }

    /**
     * Deactivate a company license.
     *
     * @OA\Post(
     *     path="/api/companies/{id}/deactivate",
     *     tags={"Companies"},
     *     summary="Deactivate company license",
     *     description="Manually deactivate a company's license. Admin only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Company ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="License deactivated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Company license deactivated successfully"),
     *             @OA\Property(property="company", ref="#/components/schemas/Company")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Admin access required"),
     *     @OA\Response(response=404, description="Company not found")
     * )
     */
    public function deactivate(Company $company)
    {
        $company->update(['license_status' => 'inactive']);

        return response()->json([
            'message' => 'Company license deactivated successfully',
            'company' => $company
        ]);
    }

    /**
     * Renew a company license.
     *
     * @OA\Post(
     *     path="/api/companies/{id}/renew-license",
     *     tags={"Companies"},
     *     summary="Renew company license",
     *     description="Extend a company's license expiration date. If expired, renews from today. If active, extends from current expiration. Admin only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Company ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"days"},
     *             @OA\Property(property="days", type="integer", minimum=1, maximum=3650, example=365, description="Number of days to extend the license")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="License renewed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Company license renewed successfully"),
     *             @OA\Property(property="company", ref="#/components/schemas/Company")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Admin access required"),
     *     @OA\Response(response=404, description="Company not found")
     * )
     */
    public function renewLicense(Request $request, Company $company)
    {
        $validator = Validator::make($request->all(), [
            'days' => 'required|integer|min:1|max:3650',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $days = $request->input('days');

        // If license is expired, renew from today, otherwise extend from current expiration
        if ($company->license_expires_at && $company->license_expires_at->isFuture()) {
            $newExpiration = $company->license_expires_at->addDays($days);
        } else {
            $newExpiration = now()->addDays($days);
        }

        $company->update([
            'license_expires_at' => $newExpiration,
            'license_status' => 'active',
        ]);

        return response()->json([
            'message' => 'Company license renewed successfully',
            'company' => $company
        ]);
    }

    /**
     * Get admin dashboard statistics.
     */
    public function getAdminStatistics(Request $request)
    {
        // Total companies count
        $totalCompanies = Company::count();
        $activeCompanies = Company::where('license_status', 'active')->count();
        $inactiveCompanies = Company::where('license_status', 'inactive')->count();
        $expiredCompanies = Company::where('license_status', 'expired')->count();

        // Companies expiring soon (within 30 days)
        $expiringSoon = Company::where('license_status', 'active')
            ->where('license_expires_at', '<=', now()->addDays(30))
            ->where('license_expires_at', '>', now())
            ->count();

        // Get company users who logged in recently (last 7 days)
        $recentlyActiveUsers = User::whereHas('role', function($q) {
                $q->where('name', 'company_user');
            })
            ->whereNotNull('last_login_at')
            ->where('last_login_at', '>=', now()->subDays(7))
            ->count();

        // Get total company users
        $totalCompanyUsers = User::whereHas('role', function($q) {
            $q->where('name', 'company_user');
        })->count();

        // Get inactive users (not logged in for 30 days or never logged in)
        $inactiveUsers = User::whereHas('role', function($q) {
                $q->where('name', 'company_user');
            })
            ->where(function($q) {
                $q->whereNull('last_login_at')
                  ->orWhere('last_login_at', '<', now()->subDays(30));
            })
            ->count();

        // Companies without database upload in the last week
        $noBackupLastWeek = Company::whereDoesntHave('databaseUploads', function($q) {
            $q->where('created_at', '>=', now()->subWeek());
        })->count();

        // Companies without database upload in the last month
        $noBackupLastMonth = Company::whereDoesntHave('databaseUploads', function($q) {
            $q->where('created_at', '>=', now()->subMonth());
        })->count();

        // Companies without database upload in the last year
        $noBackupLastYear = Company::whereDoesntHave('databaseUploads', function($q) {
            $q->where('created_at', '>=', now()->subYear());
        })->count();

        // Companies that have never uploaded
        $neverUploaded = Company::whereDoesntHave('databaseUploads')->count();

        // Recent database uploads (last 7 days)
        $recentUploads = CompanyDatabaseUpload::where('created_at', '>=', now()->subDays(7))->count();

        // Total storage used
        $totalStorage = CompanyDatabaseUpload::selectRaw('company_id, MAX(created_at) as latest_upload')
            ->groupBy('company_id')
            ->get()
            ->map(function($upload) {
                return CompanyDatabaseUpload::where('company_id', $upload->company_id)
                    ->where('created_at', $upload->latest_upload)
                    ->first();
            })
            ->sum('file_size');

        return response()->json([
            'total_companies' => $totalCompanies,
            'active_companies' => $activeCompanies,
            'inactive_companies' => $inactiveCompanies,
            'expired_companies' => $expiredCompanies,
            'expiring_soon' => $expiringSoon,
            'total_company_users' => $totalCompanyUsers,
            'recently_active_users' => $recentlyActiveUsers,
            'inactive_users' => $inactiveUsers,
            'no_backup_last_week' => $noBackupLastWeek,
            'no_backup_last_month' => $noBackupLastMonth,
            'no_backup_last_year' => $noBackupLastYear,
            'never_uploaded' => $neverUploaded,
            'recent_uploads' => $recentUploads,
            'total_storage_bytes' => $totalStorage,
            'total_storage_formatted' => $this->formatBytes($totalStorage),
        ]);
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        if ($bytes === null || $bytes === 0) {
            return '0 Bytes';
        }

        $units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
