<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CompanyDatabaseQueryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyDataController extends Controller
{
    protected CompanyDatabaseQueryService $queryService;

    public function __construct(CompanyDatabaseQueryService $queryService)
    {
        $this->queryService = $queryService;
    }

    /**
     * Get paginated products for the authenticated user's company.
     *
     * @OA\Get(
     *     path="/api/company-data/products",
     *     tags={"Company Data"},
     *     summary="Get company products",
     *     description="Retrieve paginated list of products from the company's SQLite database. Company users only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page offset (not page number)",
     *         required=false,
     *         @OA\Schema(type="integer", example=0)
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", example=100, default=100)
     *     ),
     *     @OA\Parameter(
     *         name="param",
     *         in="query",
     *         description="Search query for product name, barcode, or category",
     *         required=false,
     *         @OA\Schema(type="string", example="Paracetamol")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Paracetamol 500mg"),
     *                     @OA\Property(property="category", type="string", example="Analgesics"),
     *                     @OA\Property(property="price", type="number", format="float", example=2.50),
     *                     @OA\Property(property="cost_price", type="number", format="float", example=1.50),
     *                     @OA\Property(property="current_stock", type="number", format="float", example=150),
     *                     @OA\Property(property="min_stock", type="number", format="float", example=20),
     *                     @OA\Property(property="expiry", type="string", format="date-time", nullable=true),
     *                     @OA\Property(property="barcode", type="string", nullable=true)
     *                 )
     *             ),
     *             @OA\Property(property="total", type="integer", example=250),
     *             @OA\Property(property="displayColumns", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="columnLabels", type="object"),
     *             @OA\Property(property="columnFilters", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="No company associated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="No company associated with this account")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=500, description="Failed to retrieve products")
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getProducts(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'message' => 'No company associated with this account',
            ], 403);
        }

        try {
            $page = (int) $request->query('page', 0);
            $limit = (int) $request->query('limit', 100);
            $search = $request->query('param');
            $stockFilter = $request->query('stock_filter');

            $result = $this->queryService->getProducts(
                $user->company_id,
                $page,
                $limit,
                $search,
                $stockFilter
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve products: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get paginated sales for the authenticated user's company.
     *
     * @OA\Get(
     *     path="/api/company-data/sales",
     *     tags={"Company Data"},
     *     summary="Get company sales",
     *     description="Retrieve paginated list of sales transactions from the company's SQLite database. Company users only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page offset",
     *         required=false,
     *         @OA\Schema(type="integer", example=0)
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", example=100, default=100)
     *     ),
     *     @OA\Parameter(
     *         name="param",
     *         in="query",
     *         description="Search query for sale code, customer, or creditor name",
     *         required=false,
     *         @OA\Schema(type="string", example="SALE-001")
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Filter sales from this date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2025-01-01")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="Filter sales until this date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2025-12-31")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="code", type="string", example="SALE-001"),
     *                     @OA\Property(property="date", type="string", format="date", example="2025-12-09"),
     *                     @OA\Property(property="customer", type="string", nullable=true, example="John Doe"),
     *                     @OA\Property(property="total_amount", type="number", format="float", example=125.50),
     *                     @OA\Property(property="amount_paid", type="number", format="float", example=125.50),
     *                     @OA\Property(property="payment_method", type="string", example="Cash"),
     *                     @OA\Property(property="credit_paid", type="integer", example=0)
     *                 )
     *             ),
     *             @OA\Property(property="total", type="integer", example=500),
     *             @OA\Property(property="displayColumns", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="columnLabels", type="object"),
     *             @OA\Property(property="columnFilters", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="No company associated"),
     *     @OA\Response(response=500, description="Failed to retrieve sales")
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSales(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'message' => 'No company associated with this account',
            ], 403);
        }

        try {
            $page = (int) $request->query('page', 0);
            $limit = (int) $request->query('limit', 100);
            $search = $request->query('param');
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $result = $this->queryService->getSales(
                $user->company_id,
                $page,
                $limit,
                $search,
                $startDate,
                $endDate
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve sales: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get paginated purchases for the authenticated user's company.
     *
     * @OA\Get(
     *     path="/api/company-data/purchases",
     *     tags={"Company Data"},
     *     summary="Get company purchases",
     *     description="Retrieve paginated list of purchase orders from the company's SQLite database. Company users only.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page offset",
     *         required=false,
     *         @OA\Schema(type="integer", example=0)
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", example=100, default=100)
     *     ),
     *     @OA\Parameter(
     *         name="param",
     *         in="query",
     *         description="Search query for purchase code, invoice, or vendor name",
     *         required=false,
     *         @OA\Schema(type="string", example="PO-001")
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Filter purchases from this date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2025-01-01")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="Filter purchases until this date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2025-12-31")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="code", type="string", example="PO-001"),
     *                     @OA\Property(property="date", type="string", format="date", example="2025-12-09"),
     *                     @OA\Property(property="vendor_name", type="string", example="ABC Pharmaceuticals"),
     *                     @OA\Property(property="total_amount", type="number", format="float", example=5000.00),
     *                     @OA\Property(property="amount_paid", type="number", format="float", nullable=true, example=2500.00),
     *                     @OA\Property(property="payment_method", type="string", nullable=true, example="Bank Transfer"),
     *                     @OA\Property(property="status", type="string", nullable=true, example="Completed"),
     *                     @OA\Property(property="invoice", type="string", nullable=true, example="INV-123")
     *                 )
     *             ),
     *             @OA\Property(property="total", type="integer", example=150),
     *             @OA\Property(property="displayColumns", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="columnLabels", type="object"),
     *             @OA\Property(property="columnFilters", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="No company associated"),
     *     @OA\Response(response=500, description="Failed to retrieve purchases")
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getPurchases(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'message' => 'No company associated with this account',
            ], 403);
        }

        try {
            $page = (int) $request->query('page', 0);
            $limit = (int) $request->query('limit', 100);
            $search = $request->query('param');
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $result = $this->queryService->getPurchases(
                $user->company_id,
                $page,
                $limit,
                $search,
                $startDate,
                $endDate
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve purchases: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get product statistics for the authenticated user's company.
     *
     * @OA\Get(
     *     path="/api/company-data/product-statistics",
     *     tags={"Company Data"},
     *     summary="Get product statistics",
     *     description="Retrieve statistics about products including stock values and counts. Company users only.",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(property="total_stock_value", type="number", format="float", example=125000.50, description="Total stock value based on selling price"),
     *             @OA\Property(property="total_cost_value", type="number", format="float", example=87500.25, description="Total stock value based on cost price"),
     *             @OA\Property(property="below_min_stock_count", type="integer", example=42, description="Number of products at or below minimum stock but not zero"),
     *             @OA\Property(property="above_max_stock_count", type="integer", example=8, description="Number of products above maximum stock"),
     *             @OA\Property(property="zero_stock_count", type="integer", example=15, description="Number of products with zero or negative stock"),
     *             @OA\Property(property="total_products", type="integer", example=1247, description="Total number of products")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="No company associated"),
     *     @OA\Response(response=500, description="Failed to retrieve statistics")
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getProductStatistics(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'message' => 'No company associated with this account',
            ], 403);
        }

        try {
            $statistics = $this->queryService->getProductStatistics($user->company_id);
            return response()->json($statistics);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve product statistics: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sales statistics for the authenticated user's company.
     */
    public function getSalesStatistics(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'message' => 'No company associated with this account',
            ], 403);
        }

        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $statistics = $this->queryService->getSalesStatistics($user->company_id, $startDate, $endDate);
            return response()->json($statistics);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve sales statistics: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sales details for the authenticated user's company.
     */
    public function getSalesDetails(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'message' => 'No company associated with this account',
            ], 403);
        }

        try {
            $page = (int) $request->query('page', 0);
            $limit = (int) $request->query('limit', 100);
            $search = $request->query('param');
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $result = $this->queryService->getSalesDetails(
                $user->company_id,
                $page,
                $limit,
                $search,
                $startDate,
                $endDate
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve sales details: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getPurchaseStatistics(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'message' => 'No company associated with this account',
            ], 403);
        }

        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $statistics = $this->queryService->getPurchaseStatistics(
                $user->company_id,
                $startDate,
                $endDate
            );

            return response()->json($statistics);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve purchase statistics: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getPurchaseDetails(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'message' => 'No company associated with this account',
            ], 403);
        }

        try {
            $page = (int) $request->query('page', 0);
            $limit = (int) $request->query('limit', 100);
            $search = $request->query('param');
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $result = $this->queryService->getPurchaseDetails(
                $user->company_id,
                $page,
                $limit,
                $search,
                $startDate,
                $endDate
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve purchase details: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get database upload information for the authenticated user's company.
     */
    public function getDatabaseInfo(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json(['message' => 'No company associated with this account'], 403);
        }

        try {
            $upload = \App\Models\CompanyDatabaseUpload::getLatestForCompany($user->company_id);

            if (!$upload) {
                return response()->json([
                    'message' => 'No database upload found',
                    'upload_date' => null,
                    'file_size' => null,
                    'original_filename' => null,
                ]);
            }

            return response()->json([
                'upload_date' => $upload->created_at->toIso8601String(),
                'upload_date_formatted' => $upload->created_at->format('M d, Y h:i A'),
                'upload_date_relative' => $upload->created_at->diffForHumans(),
                'file_size' => $upload->file_size,
                'file_size_formatted' => $this->formatBytes($upload->file_size),
                'original_filename' => $upload->original_filename,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to retrieve database info: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Format bytes to human-readable format.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
