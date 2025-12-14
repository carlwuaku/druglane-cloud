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
     * @OA\Post(
     *     path="/api/receive-file",
     *     tags={"Database Upload"},
     *     summary="Upload database backup",
     *     description="Upload a database backup ZIP file from desktop application. The ZIP should contain SQLite database file.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"upload_file", "company_id"},
     *                 @OA\Property(property="upload_file", type="string", format="binary", description="ZIP file containing SQLite database (max 100MB)"),
     *                 @OA\Property(property="company_id", type="integer", example=1, description="Company ID"),
     *                 @OA\Property(property="name", type="string", maxLength=255, example="John Doe", description="Optional uploader name"),
     *                 @OA\Property(property="email", type="string", format="email", example="john@example.com", description="Optional uploader email"),
     *                 @OA\Property(property="phone", type="string", maxLength=20, example="+1-555-0123", description="Optional uploader phone")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="File uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="1"),
     *             @OA\Property(property="path", type="string", example="http://example.com/storage/company_uploads/1/12345/database.sqlite"),
     *             @OA\Property(property="upload_id", type="integer", example=42),
     *             @OA\Property(property="message", type="string", example="File uploaded successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="0"),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Upload failed",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="0"),
     *             @OA\Property(property="message", type="string", example="Upload failed: error details")
     *         )
     *     )
     * )
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
            'name' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => '0',
                'message' => 'Validation failed',
                'errors' => implode(', ', $validator->errors()->all()),
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
     * @OA\Post(
     *     path="/api/get-latest-database",
     *     tags={"Database Upload"},
     *     summary="Get latest database info",
     *     description="Retrieve the path to the latest active database backup for a company. Used by desktop applications.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"company_id"},
     *             @OA\Property(property="company_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Database path retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="1"),
     *             @OA\Property(property="database_path", type="string", example="/path/to/storage/company_uploads/1/12345/database.sqlite")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No database found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="0"),
     *             @OA\Property(property="message", type="string", example="No database found for this company")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="0"),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
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
                'errors' => implode(', ', $validator->errors()->all()),
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
