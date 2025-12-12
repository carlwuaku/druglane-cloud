<?php

namespace App\Services;

use App\Models\Company;
use App\Models\CompanyDatabaseUpload;
use Illuminate\Support\Facades\Log;
use PDO;
use PDOException;

class CompanyDatabaseQueryService
{
    /**
     * Execute a SELECT query against a company's SQLite database.
     *
     * @param int $companyId
     * @param string $query
     * @param array $params
     * @return array
     * @throws \Exception
     */
    public function executeQuery(int $companyId, string $query, array $params = []): array
    {
        $dbPath = $this->getDatabasePath($companyId);

        if (!$dbPath || !file_exists($dbPath)) {
            throw new \Exception('No database found for this company');
        }

        try {
            $pdo = new PDO("sqlite:$dbPath");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            Log::error('SQLite query failed', [
                'company_id' => $companyId,
                'error' => $e->getMessage(),
                'query' => $query,
            ]);
            throw new \Exception('Database query failed: ' . $e->getMessage());
        }
    }

    /**
     * Execute a COUNT query against a company's SQLite database.
     *
     * @param int $companyId
     * @param string $query
     * @param array $params
     * @return int
     * @throws \Exception
     */
    public function executeCountQuery(int $companyId, string $query, array $params = []): int
    {
        $dbPath = $this->getDatabasePath($companyId);

        if (!$dbPath || !file_exists($dbPath)) {
            throw new \Exception('No database found for this company');
        }

        try {
            $pdo = new PDO("sqlite:$dbPath");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);

            return (int) $stmt->fetchColumn();
        } catch (PDOException $e) {
            Log::error('SQLite count query failed', [
                'company_id' => $companyId,
                'error' => $e->getMessage(),
                'query' => $query,
            ]);
            throw new \Exception('Database query failed: ' . $e->getMessage());
        }
    }

    /**
     * Get paginated products for a company.
     *
     * @param int $companyId
     * @param int $page
     * @param int $limit
     * @param string|null $search
     * @return array
     */
    public function getProducts(int $companyId, int $page = 0, int $limit = 100, ?string $search = null): array
    {
        $offset = $page;
        $params = [];

        // Build WHERE clause for search
        $whereClause = '';
        if ($search) {
            $whereClause = "WHERE name LIKE :search OR barcode LIKE :search OR category LIKE :search";
            $params[':search'] = "%$search%";
        }

        // Count query
        $countQuery = "SELECT COUNT(*) FROM products $whereClause";
        $total = $this->executeCountQuery($companyId, $countQuery, $params);

        // Data query
        $query = "SELECT id, name, category, price, cost_price, current_stock, min_stock, max_stock,
                         unit, expiry, barcode, shelf, status, created_on
                  FROM products
                  $whereClause
                  ORDER BY name ASC
                  LIMIT :limit OFFSET :offset";

        $params[':limit'] = $limit;
        $params[':offset'] = $offset;

        $data = $this->executeQuery($companyId, $query, $params);

        return [
            'data' => $data,
            'total' => $total,
            'displayColumns' => ['name', 'category', 'price', 'cost_price', 'current_stock', 'min_stock', 'expiry', 'barcode'],
            'columnLabels' => [
                'id' => 'ID',
                'name' => 'Product Name',
                'category' => 'Category',
                'price' => 'Selling Price',
                'cost_price' => 'Cost Price',
                'current_stock' => 'Stock',
                'min_stock' => 'Min Stock',
                'max_stock' => 'Max Stock',
                'unit' => 'Unit',
                'expiry' => 'Expiry Date',
                'barcode' => 'Barcode',
                'shelf' => 'Shelf',
                'status' => 'Status',
                'created_on' => 'Created On',
            ],
            'columnFilters' => [],
        ];
    }

    /**
     * Get paginated sales for a company.
     *
     * @param int $companyId
     * @param int $page
     * @param int $limit
     * @param string|null $search
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function getSales(int $companyId, int $page = 0, int $limit = 100, ?string $search = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $offset = $page;
        $params = [];

        // Build WHERE clause
        $whereClauses = [];
        if ($search) {
            $whereClauses[] = "(s.code LIKE :search OR s.customer LIKE :search OR s.creditor_name LIKE :search)";
            $params[':search'] = "%$search%";
        }
        if ($startDate) {
            $whereClauses[] = "s.date >= :start_date";
            $params[':start_date'] = $startDate;
        }
        if ($endDate) {
            $whereClauses[] = "s.date <= :end_date";
            $params[':end_date'] = $endDate;
        }

        $whereClause = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

        // Count query
        $countQuery = "SELECT COUNT(*) FROM sales s $whereClause";
        $total = $this->executeCountQuery($companyId, $countQuery, $params);

        // Data query - calculate total from sales_details
        $query = "SELECT s.id, s.code, s.date, s.customer, s.payment_method, s.amount_paid,
                         s.insurance_provider, s.creditor_name, s.discount, s.credit_paid,
                         s.created_on,
                         (SELECT SUM(sd.price * sd.quantity) FROM sales_details sd WHERE sd.code = s.code) as total_amount
                  FROM sales s
                  $whereClause
                  ORDER BY s.date DESC, s.created_on DESC
                  LIMIT :limit OFFSET :offset";

        $params[':limit'] = $limit;
        $params[':offset'] = $offset;

        $data = $this->executeQuery($companyId, $query, $params);

        return [
            'data' => $data,
            'total' => $total,
            'displayColumns' => ['code', 'date', 'customer', 'total_amount', 'amount_paid', 'payment_method', 'credit_paid'],
            'columnLabels' => [
                'id' => 'ID',
                'code' => 'Sale Code',
                'date' => 'Date',
                'customer' => 'Customer',
                'total_amount' => 'Total Amount',
                'amount_paid' => 'Amount Paid',
                'payment_method' => 'Payment Method',
                'insurance_provider' => 'Insurance Provider',
                'creditor_name' => 'Creditor Name',
                'discount' => 'Discount',
                'credit_paid' => 'Credit Paid',
                'created_on' => 'Created On',
            ],
            'columnFilters' => [
                [
                    'name' => 'start_date',
                    'label' => 'Start Date',
                    'type' => 'date',
                    'value' => null,
                    'required' => false,
                ],
                [
                    'name' => 'end_date',
                    'label' => 'End Date',
                    'type' => 'date',
                    'value' => null,
                    'required' => false,
                ],
            ],
        ];
    }

    /**
     * Get paginated purchases for a company.
     *
     * @param int $companyId
     * @param int $page
     * @param int $limit
     * @param string|null $search
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function getPurchases(int $companyId, int $page = 0, int $limit = 100, ?string $search = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $offset = $page;
        $params = [];

        // Build WHERE clause
        $whereClauses = [];
        if ($search) {
            $whereClauses[] = "(p.code LIKE :search OR p.invoice LIKE :search OR v.name LIKE :search)";
            $params[':search'] = "%$search%";
        }
        if ($startDate) {
            $whereClauses[] = "p.date >= :start_date";
            $params[':start_date'] = $startDate;
        }
        if ($endDate) {
            $whereClauses[] = "p.date <= :end_date";
            $params[':end_date'] = $endDate;
        }

        $whereClause = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

        // Count query
        $countQuery = "SELECT COUNT(*) FROM purchases p
                       LEFT JOIN vendors v ON p.vendor = v.id
                       $whereClause";
        $total = $this->executeCountQuery($companyId, $countQuery, $params);

        // Data query - calculate total from purchase_details
        $query = "SELECT p.id, p.code, p.date, p.status, p.invoice, p.payment_method,
                         p.amount_paid, p.last_payment_date, p.created_on,
                         v.name as vendor_name,
                         (SELECT SUM(pd.price * pd.quantity) FROM purchase_details pd WHERE pd.code = p.code) as total_amount
                  FROM purchases p
                  LEFT JOIN vendors v ON p.vendor = v.id
                  $whereClause
                  ORDER BY p.date DESC, p.created_on DESC
                  LIMIT :limit OFFSET :offset";

        $params[':limit'] = $limit;
        $params[':offset'] = $offset;

        $data = $this->executeQuery($companyId, $query, $params);

        return [
            'data' => $data,
            'total' => $total,
            'displayColumns' => ['code', 'date', 'vendor_name', 'total_amount', 'amount_paid', 'payment_method', 'status', 'invoice'],
            'columnLabels' => [
                'id' => 'ID',
                'code' => 'Purchase Code',
                'date' => 'Date',
                'vendor_name' => 'Vendor',
                'total_amount' => 'Total Amount',
                'amount_paid' => 'Amount Paid',
                'payment_method' => 'Payment Method',
                'status' => 'Status',
                'invoice' => 'Invoice',
                'last_payment_date' => 'Last Payment Date',
                'created_on' => 'Created On',
            ],
            'columnFilters' => [
                [
                    'name' => 'start_date',
                    'label' => 'Start Date',
                    'type' => 'date',
                    'value' => null,
                    'required' => false,
                ],
                [
                    'name' => 'end_date',
                    'label' => 'End Date',
                    'type' => 'date',
                    'value' => null,
                    'required' => false,
                ],
            ],
        ];
    }

    /**
     * Get the path to the latest database for a company.
     *
     * @param int $companyId
     * @return string|null
     */
    protected function getDatabasePath(int $companyId): ?string
    {
        $upload = CompanyDatabaseUpload::getLatestForCompany($companyId);
        return $upload ? $upload->getFullSqlitePath() : null;
    }
}
