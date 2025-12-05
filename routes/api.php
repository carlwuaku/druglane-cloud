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

// Protected routes - require authentication, active account, and valid license
Route::middleware(['auth:sanctum', 'active', 'license.active'])->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class,'logout']);

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
    });

    // Company users can view their own company
    Route::get('/my-company', function (Request $request) {
        $user = $request->user();
        if ($user->isCompanyUser() && $user->company) {
            return response()->json($user->company);
        }
        return response()->json(['message' => 'No company associated with this account'], 404);
    });
});
