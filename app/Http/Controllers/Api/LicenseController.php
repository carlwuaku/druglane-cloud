<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LicenseController extends Controller
{
    /**
     * Validate a license key (desktop app checks if license is valid).
     *
     * @OA\Post(
     *     path="/api/license/validate",
     *     tags={"License"},
     *     summary="Validate license key",
     *     description="Check if a license key is valid and active. Used by desktop applications.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"license_key"},
     *             @OA\Property(property="license_key", type="string", example="ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="License is valid",
     *         @OA\JsonContent(
     *             @OA\Property(property="valid", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="License is valid"),
     *             @OA\Property(
     *                 property="company",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Acme Corporation"),
     *                 @OA\Property(property="is_activated", type="boolean", example=true),
     *                 @OA\Property(property="license_status", type="string", example="active"),
     *                 @OA\Property(property="license_expires_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="License expired or suspended",
     *         @OA\JsonContent(
     *             @OA\Property(property="valid", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="License has expired")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Invalid license key",
     *         @OA\JsonContent(
     *             @OA\Property(property="valid", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid license key")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function validateLicense(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'license_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'message' => 'License key is required',
                'errors' => $validator->errors()
            ], 422);
        }

        $licenseKey = $request->input('license_key');

        // Find company by license key (indexed for performance)
        $company = Company::where('license_key', $licenseKey)->first();

        if (!$company) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid license key'
            ], 404);
        }

        // Check if license is expired
        if ($company->isLicenseExpired()) {
            return response()->json([
                'valid' => false,
                'message' => 'License has expired',
                'company' => [
                    'name' => $company->name,
                    'license_expires_at' => $company->license_expires_at,
                ]
            ], 403);
        }

        // Check if license is suspended
        if ($company->license_status === 'suspended') {
            return response()->json([
                'valid' => false,
                'message' => 'License has been suspended',
                'company' => [
                    'name' => $company->name,
                ]
            ], 403);
        }

        return response()->json([
            'valid' => true,
            'message' => 'License is valid',
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'is_activated' => $company->is_activated,
                'license_status' => $company->license_status,
                'license_expires_at' => $company->license_expires_at,
            ]
        ]);
    }

    /**
     * Activate a license (desktop app submits license key to activate).
     * This is a one-time activation. Once activated, the license cannot be activated on another machine.
     *
     * @OA\Post(
     *     path="/api/license/activate",
     *     tags={"License"},
     *     summary="Activate license",
     *     description="Activate a license on a specific machine. One-time activation only. Used by desktop applications.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"license_key", "machine_id"},
     *             @OA\Property(property="license_key", type="string", example="ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456"),
     *             @OA\Property(property="machine_id", type="string", maxLength=255, example="DESKTOP-ABC123-UUID-XYZ789", description="Unique machine identifier")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="License activated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="License activated successfully"),
     *             @OA\Property(
     *                 property="company",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Acme Corporation"),
     *                 @OA\Property(property="license_key", type="string"),
     *                 @OA\Property(property="email", type="string"),
     *                 @OA\Property(property="activated_at", type="string", format="date-time"),
     *                 @OA\Property(property="license_expires_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="License cannot be activated (suspended or expired)",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="License has been suspended")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Invalid license key",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid license key")
     *         )
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="License already activated on another machine",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="License has already been activated on another machine")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function activate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'license_key' => 'required|string',
            'machine_id' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $licenseKey = $request->input('license_key');
        $machineId = $request->input('machine_id');

        // Find company by license key (indexed for performance)
        $company = Company::where('license_key', $licenseKey)->first();

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid license key'
            ], 404);
        }

        // Check if already activated
        if ($company->is_activated) {
            // Check if it's the same machine
            if ($company->activated_by_machine_id === $machineId) {
                return response()->json([
                    'success' => true,
                    'message' => 'License already activated on this machine',
                    'company' => [
                        'id' => $company->id,
                        'name' => $company->name,
                        'license_key' => $company->license_key,
                        'activated_at' => $company->activated_at,
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'License has already been activated on another machine',
                'activated_at' => $company->activated_at,
            ], 409); // Conflict
        }

        // Check if license can be activated
        if (!$company->canActivate()) {
            $reason = 'License cannot be activated';

            if ($company->license_status === 'suspended') {
                $reason = 'License has been suspended';
            } elseif ($company->isLicenseExpired()) {
                $reason = 'License has expired';
            }

            return response()->json([
                'success' => false,
                'message' => $reason,
                'company' => [
                    'name' => $company->name,
                    'license_status' => $company->license_status,
                    'license_expires_at' => $company->license_expires_at,
                ]
            ], 403);
        }

        // Activate the license
        $company->activate($machineId);

        return response()->json([
            'success' => true,
            'message' => 'License activated successfully',
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'license_key' => $company->license_key,
                'email' => $company->email,
                'activated_at' => $company->activated_at,
                'license_expires_at' => $company->license_expires_at,
            ]
        ], 200);
    }

    /**
     * Check activation status (desktop app verifies if it's still activated).
     *
     * @OA\Post(
     *     path="/api/license/check-activation",
     *     tags={"License"},
     *     summary="Check activation status",
     *     description="Verify if a license is activated on a specific machine and still valid. Used by desktop applications.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"license_key", "machine_id"},
     *             @OA\Property(property="license_key", type="string", example="ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456"),
     *             @OA\Property(property="machine_id", type="string", example="DESKTOP-ABC123-UUID-XYZ789")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="License is activated and valid",
     *         @OA\JsonContent(
     *             @OA\Property(property="activated", type="boolean", example=true),
     *             @OA\Property(property="valid", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="License is activated and valid"),
     *             @OA\Property(
     *                 property="company",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Acme Corporation"),
     *                 @OA\Property(property="license_expires_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="License activated on different machine",
     *         @OA\JsonContent(
     *             @OA\Property(property="activated", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="License is activated on a different machine")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Invalid license key",
     *         @OA\JsonContent(
     *             @OA\Property(property="activated", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid license key")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function checkActivation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'license_key' => 'required|string',
            'machine_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'activated' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $licenseKey = $request->input('license_key');
        $machineId = $request->input('machine_id');

        $company = Company::where('license_key', $licenseKey)->first();

        if (!$company) {
            return response()->json([
                'activated' => false,
                'message' => 'Invalid license key'
            ], 404);
        }

        // Check if activated and on the same machine
        if (!$company->is_activated) {
            return response()->json([
                'activated' => false,
                'message' => 'License is not activated'
            ]);
        }

        if ($company->activated_by_machine_id !== $machineId) {
            return response()->json([
                'activated' => false,
                'message' => 'License is activated on a different machine'
            ], 403);
        }

        // Check if license is still valid
        if (!$company->isLicenseActive()) {
            return response()->json([
                'activated' => true,
                'valid' => false,
                'message' => 'License is activated but no longer valid (expired or suspended)',
                'license_status' => $company->license_status,
                'license_expires_at' => $company->license_expires_at,
            ]);
        }

        return response()->json([
            'activated' => true,
            'valid' => true,
            'message' => 'License is activated and valid',
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'license_expires_at' => $company->license_expires_at,
            ]
        ]);
    }

    /**
     * Backward compatibility endpoint for desktop apps (legacy endpoint).
     * Desktop apps will validate their license keys by calling /api_admin/findBranchByKey?k={key}
     *
     * @OA\Get(
     *     path="/api_admin/findBranchByKey",
     *     tags={"License"},
     *     summary="Find company by license key (Legacy)",
     *     description="Legacy endpoint for backward compatibility with desktop applications.",
     *     @OA\Parameter(
     *         name="k",
     *         in="query",
     *         description="License key",
     *         required=true,
     *         @OA\Schema(type="string", example="ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="License found and valid",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="1"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 description="Company data with all columns"
     *             ),
     *             @OA\Property(property="jwt_key", type="string", example="a1b2c3d4...", description="JWT signing key for the company")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="License key not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="0"),
     *             @OA\Property(property="message", type="string", example="License key not found")
     *         )
     *     )
     * )
     */
    public function findBranchByKey(Request $request)
    {
        $licenseKey = $request->query('k');

        if (!$licenseKey) {
            return response()->json([
                'status' => '0',
                'message' => 'License key parameter (k) is required'
            ], 400);
        }

        // Find company by license key
        $company = Company::where('license_key', $licenseKey)->first();

        if (!$company) {
            return response()->json([
                'status' => '0',
                'message' => 'License key not found'
            ], 404);
        }

        // Check if license is valid (not expired or suspended)
        if (!$company->isLicenseActive()) {
            $message = 'License is not active';

            if ($company->isLicenseExpired()) {
                $message = 'License has expired';
            } elseif ($company->license_status === 'suspended') {
                $message = 'License has been suspended';
            }

            return response()->json([
                'status' => '0',
                'message' => $message,
                'data' => $company->toArray()
            ], 403);
        }

        // Get or generate JWT key
        $jwtKey = $company->getJwtKey();

        // Return company data with jwt_key
        return response()->json([
            'status' => '1',
            'data' => $company->toArray(),
            'jwt_key' => $jwtKey
        ]);
    }
}
