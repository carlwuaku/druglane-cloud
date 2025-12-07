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
                'contact_email' => $company->contact_email,
                'activated_at' => $company->activated_at,
                'license_expires_at' => $company->license_expires_at,
            ]
        ], 200);
    }

    /**
     * Check activation status (desktop app verifies if it's still activated).
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
}
