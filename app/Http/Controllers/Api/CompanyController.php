<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index(Request $request)
    {
        $query = Company::with(['users']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_email', 'like', "%{$search}%")
                  ->orWhere('license_key', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('license_status', $request->input('status'));
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $companies = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($companies);
    }

    /**
     * Store a newly created company.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
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
     */
    public function show(Company $company)
    {
        $company->load(['users.role']);

        return response()->json($company);
    }

    /**
     * Update the specified company.
     */
    public function update(Request $request, Company $company)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'contact_email' => 'sometimes|required|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
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
}
