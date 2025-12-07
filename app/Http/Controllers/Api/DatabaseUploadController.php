<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DatabaseUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DatabaseUploadController extends Controller
{
    protected DatabaseUploadService $uploadService;

    public function __construct(DatabaseUploadService $uploadService)
    {
        $this->uploadService = $uploadService;
    }

    /**
     * Receive file upload from desktop apps.
     * Maintains backward compatibility with existing API.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function receive_file(Request $request): JsonResponse
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'upload_file' => 'required|file|mimes:zip|max:102400', // Max 100MB
            'company_id' => 'required|integer|exists:companies,id',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => '0',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('upload_file');
            $companyId = $request->input('company_id');

            // Process the upload
            $upload = $this->uploadService->processUpload($file, $companyId, [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
            ]);

            // Generate URL for backward compatibility
            $path = url('storage/' . $upload->sqlite_path);

            // Optionally deactivate old uploads (keeping last 5 active)
            $this->uploadService->deactivateOldUploads($companyId, 5);

            return response()->json([
                'status' => '1',
                'path' => $path,
                'upload_id' => $upload->id,
                'message' => 'File uploaded successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => '0',
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the latest database info for a company.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getLatest(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required|integer|exists:companies,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => '0',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $companyId = $request->input('company_id');
        $databasePath = $this->uploadService->getLatestDatabasePath($companyId);

        if (!$databasePath) {
            return response()->json([
                'status' => '0',
                'message' => 'No database found for this company',
            ], 404);
        }

        return response()->json([
            'status' => '1',
            'database_path' => $databasePath,
        ]);
    }
}
