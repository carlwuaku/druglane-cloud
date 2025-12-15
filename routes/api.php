<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/signup', [\App\Http\Controllers\Api\AuthController::class,'signup']);
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class,'login']);

// Password reset routes
Route::post('/password/forgot', [\App\Http\Controllers\Api\PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [\App\Http\Controllers\Api\PasswordResetController::class, 'resetPassword']);
Route::post('/password/verify-token', [\App\Http\Controllers\Api\PasswordResetController::class, 'verifyToken']);

// Backward compatibility routes for desktop apps (legacy endpoints)
Route::get('/api_admin/findBranchByKey', [\App\Http\Controllers\Api\LicenseController::class, 'findBranchByKey']);
Route::post('/api_admin/receive_file', [\App\Http\Controllers\Api\DatabaseUploadController::class, 'receive_file']);
Route::post('/api_admin/sendBulkMail', [\App\Http\Controllers\Api\EmailController::class, 'sendBulkMail']);

// License activation routes (for desktop app - no authentication required)
Route::prefix('license')->group(function () {
    Route::post('/validate', [\App\Http\Controllers\Api\LicenseController::class, 'validateLicense']);
    Route::post('/activate', [\App\Http\Controllers\Api\LicenseController::class, 'activate']);
    Route::post('/check-activation', [\App\Http\Controllers\Api\LicenseController::class, 'checkActivation']);
});

// Database upload routes (for desktop app - no authentication required)
Route::post('/receive-file', [\App\Http\Controllers\Api\DatabaseUploadController::class, 'receive_file']);
Route::post('/get-latest-database', [\App\Http\Controllers\Api\DatabaseUploadController::class, 'getLatest']);

// Protected routes - require authentication, active account, and valid license
Route::middleware(['auth:sanctum', 'active', 'license.active'])->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class,'logout']);
    Route::get('/profile', [\App\Http\Controllers\Api\AuthController::class,'profile']);

    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->load(['role', 'company']);
        return response()->json([
            'user' => $user,
            'role' => $user->role->name,
            'company' => $user->company,
        ]);
    });

    // Admin-only routes
    Route::middleware(['admin'])->group(function () {
        Route::apiResource('/users', UserController::class);
        Route::apiResource('/companies', \App\Http\Controllers\Api\CompanyController::class);

        // Admin actions for companies
        Route::post('/companies/{company}/activate', [\App\Http\Controllers\Api\CompanyController::class, 'activate']);
        Route::post('/companies/{company}/deactivate', [\App\Http\Controllers\Api\CompanyController::class, 'deactivate']);
        Route::post('/companies/{company}/renew-license', [\App\Http\Controllers\Api\CompanyController::class, 'renewLicense']);

        // Admin statistics
        Route::get('/admin/statistics', [\App\Http\Controllers\Api\CompanyController::class, 'getAdminStatistics']);
    });

    // Company users can view their own company
    Route::get('/my-company', function (Request $request) {
        $user = $request->user();
        if ($user->isCompanyUser() && $user->company) {
            return response()->json($user->company);
        }
        return response()->json(['message' => 'No company associated with this account'], 404);
    });

    // Company data routes - for company users to access their SQLite data
    Route::prefix('company-data')->group(function () {
        Route::get('/products', [\App\Http\Controllers\Api\CompanyDataController::class, 'getProducts']);
        Route::get('/sales', [\App\Http\Controllers\Api\CompanyDataController::class, 'getSales']);
        Route::get('/purchases', [\App\Http\Controllers\Api\CompanyDataController::class, 'getPurchases']);
        Route::get('/product-statistics', [\App\Http\Controllers\Api\CompanyDataController::class, 'getProductStatistics']);
        Route::get('/sales-statistics', [\App\Http\Controllers\Api\CompanyDataController::class, 'getSalesStatistics']);
        Route::get('/sales-details', [\App\Http\Controllers\Api\CompanyDataController::class, 'getSalesDetails']);
        Route::get('/purchase-statistics', [\App\Http\Controllers\Api\CompanyDataController::class, 'getPurchaseStatistics']);
        Route::get('/purchase-details', [\App\Http\Controllers\Api\CompanyDataController::class, 'getPurchaseDetails']);
        Route::get('/database-info', [\App\Http\Controllers\Api\CompanyDataController::class, 'getDatabaseInfo']);
    });
});
