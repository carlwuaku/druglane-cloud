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
     * @param string|null $stockFilter
     * @return array
     */
    public function getProducts(int $companyId, int $page = 0, int $limit = 100, ?string $search = null, ?string $stockFilter = null): array
    {
        $offset = $page;
        $params = [];
        $whereClauses = [];

        // Build WHERE clause for search
        if ($search) {
            $whereClauses[] = "(name LIKE :search OR barcode LIKE :search OR category LIKE :search)";
            $params[':search'] = "%$search%";
        }

        // Build WHERE clause for stock filter
        if ($stockFilter) {
            switch ($stockFilter) {
                case 'below_min':
                    $whereClauses[] = "(current_stock > 0 AND current_stock <= min_stock)";
                    break;
                case 'above_max':
                    $whereClauses[] = "(max_stock > 0 AND current_stock > max_stock)";
                    break;
                case 'zero':
                    $whereClauses[] = "(current_stock <= 0)";
                    break;
                case 'all':
                    // No additional filter for 'all'
                    break;
            }
        }

        $whereClause = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

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
     * Get product statistics for a company.
     *
     * @param int $companyId
     * @return array
     */
    public function getProductStatistics(int $companyId): array
    {
        try {
            // Total stock value (selling price)
            $totalStockValueQuery = "SELECT COALESCE(SUM(price * current_stock), 0) as total FROM products WHERE current_stock > 0";
            $totalStockValue = $this->executeQuery($companyId, $totalStockValueQuery);

            // Total stock value (cost price)
            $totalCostValueQuery = "SELECT COALESCE(SUM(cost_price * current_stock), 0) as total FROM products WHERE current_stock > 0";
            $totalCostValue = $this->executeQuery($companyId, $totalCostValueQuery);

            // Products at or below minimum stock but not zero
            $belowMinStockQuery = "SELECT COUNT(*) as count FROM products WHERE current_stock > 0 AND current_stock <= min_stock";
            $belowMinStock = $this->executeCountQuery($companyId, $belowMinStockQuery);

            // Products above maximum stock
            $aboveMaxStockQuery = "SELECT COUNT(*) as count FROM products WHERE max_stock > 0 AND current_stock > max_stock";
            $aboveMaxStock = $this->executeCountQuery($companyId, $aboveMaxStockQuery);

            // Products with zero or negative stock
            $zeroStockQuery = "SELECT COUNT(*) as count FROM products WHERE current_stock <= 0";
            $zeroStock = $this->executeCountQuery($companyId, $zeroStockQuery);

            // Total number of products
            $totalProductsQuery = "SELECT COUNT(*) as count FROM products";
            $totalProducts = $this->executeCountQuery($companyId, $totalProductsQuery);

            return [
                'total_stock_value' => round($totalStockValue[0]['total'] ?? 0, 2),
                'total_cost_value' => round($totalCostValue[0]['total'] ?? 0, 2),
                'below_min_stock_count' => $belowMinStock,
                'above_max_stock_count' => $aboveMaxStock,
                'zero_stock_count' => $zeroStock,
                'total_products' => $totalProducts,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get product statistics', [
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get sales statistics for a company.
     *
     * @param int $companyId
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function getSalesStatistics(int $companyId, ?string $startDate = null, ?string $endDate = null): array
    {
        try {
            $params = [];
            $whereClause = '';

            // Build WHERE clause for date filtering
            if ($startDate && $endDate) {
                $whereClause = "WHERE s.date >= :start_date AND s.date <= :end_date";
                $params[':start_date'] = $startDate;
                $params[':end_date'] = $endDate;
            }

            // Total sales amount for period
            $totalSalesQuery = "SELECT COALESCE(SUM(sd.price * sd.quantity), 0) as total
                               FROM sales s
                               JOIN sales_details sd ON s.code = sd.code
                               $whereClause";
            $totalSales = $this->executeQuery($companyId, $totalSalesQuery, $params);

            // Today's sales
            $todayQuery = "SELECT COALESCE(SUM(sd.price * sd.quantity), 0) as total
                          FROM sales s
                          JOIN sales_details sd ON s.code = sd.code
                          WHERE s.date = date('now')";
            $todaySales = $this->executeQuery($companyId, $todayQuery);

            // Current month sales
            $currentMonthQuery = "SELECT COALESCE(SUM(sd.price * sd.quantity), 0) as total
                                 FROM sales s
                                 JOIN sales_details sd ON s.code = sd.code
                                 WHERE strftime('%Y-%m', s.date) = strftime('%Y-%m', 'now')";
            $currentMonthSales = $this->executeQuery($companyId, $currentMonthQuery);

            // Last month sales
            $lastMonthQuery = "SELECT COALESCE(SUM(sd.price * sd.quantity), 0) as total
                              FROM sales s
                              JOIN sales_details sd ON s.code = sd.code
                              WHERE strftime('%Y-%m', s.date) = strftime('%Y-%m', 'now', '-1 month')";
            $lastMonthSales = $this->executeQuery($companyId, $lastMonthQuery);

            // Top product by value
            $topProductValueQuery = "SELECT p.name, SUM(sd.price * sd.quantity) as total_value
                                    FROM sales_details sd
                                    JOIN products p ON sd.product = p.id
                                    JOIN sales s ON sd.code = s.code
                                    $whereClause
                                    GROUP BY sd.product, p.name
                                    ORDER BY total_value DESC
                                    LIMIT 1";
            $topProductValue = $this->executeQuery($companyId, $topProductValueQuery, $params);

            // Top product by quantity
            $topProductQuantityQuery = "SELECT p.name, SUM(sd.quantity) as total_quantity
                                       FROM sales_details sd
                                       JOIN products p ON sd.product = p.id
                                       JOIN sales s ON sd.code = s.code
                                       $whereClause
                                       GROUP BY sd.product, p.name
                                       ORDER BY total_quantity DESC
                                       LIMIT 1";
            $topProductQuantity = $this->executeQuery($companyId, $topProductQuantityQuery, $params);

            // Total number of transactions (unique sales)
            $transactionsQuery = "SELECT COUNT(DISTINCT s.code) as total
                                 FROM sales s
                                 $whereClause";
            $transactions = $this->executeQuery($companyId, $transactionsQuery, $params);

            // Current month transactions
            $currentMonthTransactionsQuery = "SELECT COUNT(DISTINCT s.code) as total
                                             FROM sales s
                                             WHERE strftime('%Y-%m', s.date) = strftime('%Y-%m', 'now')";
            $currentMonthTransactions = $this->executeQuery($companyId, $currentMonthTransactionsQuery);

            // Last month transactions
            $lastMonthTransactionsQuery = "SELECT COUNT(DISTINCT s.code) as total
                                          FROM sales s
                                          WHERE strftime('%Y-%m', s.date) = strftime('%Y-%m', 'now', '-1 month')";
            $lastMonthTransactions = $this->executeQuery($companyId, $lastMonthTransactionsQuery);

            // Total profit calculation (sales price - cost price)
            $currentMonthProfitQuery = "SELECT COALESCE(SUM((sd.price - p.cost_price) * sd.quantity), 0) as total
                                       FROM sales s
                                       JOIN sales_details sd ON s.code = sd.code
                                       JOIN products p ON sd.product = p.id
                                       WHERE strftime('%Y-%m', s.date) = strftime('%Y-%m', 'now')";
            $currentMonthProfit = $this->executeQuery($companyId, $currentMonthProfitQuery);

            // Last month profit
            $lastMonthProfitQuery = "SELECT COALESCE(SUM((sd.price - p.cost_price) * sd.quantity), 0) as total
                                    FROM sales s
                                    JOIN sales_details sd ON s.code = sd.code
                                    JOIN products p ON sd.product = p.id
                                    WHERE strftime('%Y-%m', s.date) = strftime('%Y-%m', 'now', '-1 month')";
            $lastMonthProfit = $this->executeQuery($companyId, $lastMonthProfitQuery);

            // Calculate metrics
            $currentMonthSalesValue = $currentMonthSales[0]['total'] ?? 0;
            $lastMonthSalesValue = $lastMonthSales[0]['total'] ?? 0;
            $currentMonthTransactionsValue = $currentMonthTransactions[0]['total'] ?? 0;
            $currentMonthProfitValue = $currentMonthProfit[0]['total'] ?? 0;
            $lastMonthProfitValue = $lastMonthProfit[0]['total'] ?? 0;

            // Calculate growth rate (current month vs last month)
            $growthRate = 0;
            if ($lastMonthSalesValue > 0) {
                $growthRate = (($currentMonthSalesValue - $lastMonthSalesValue) / $lastMonthSalesValue) * 100;
            }

            // Calculate average order value (AOV) for current month
            $averageOrderValue = 0;
            if ($currentMonthTransactionsValue > 0) {
                $averageOrderValue = $currentMonthSalesValue / $currentMonthTransactionsValue;
            }

            // Calculate profit margin percentage for current month
            $profitMarginPercentage = 0;
            if ($currentMonthSalesValue > 0) {
                $profitMarginPercentage = ($currentMonthProfitValue / $currentMonthSalesValue) * 100;
            }

            // Current week sales
            $currentWeekQuery = "SELECT COALESCE(SUM(sd.price * sd.quantity), 0) as total
                                FROM sales s
                                JOIN sales_details sd ON s.code = sd.code
                                WHERE strftime('%Y-%W', s.date) = strftime('%Y-%W', 'now')";
            $currentWeekSales = $this->executeQuery($companyId, $currentWeekQuery);

            // Last week sales
            $lastWeekQuery = "SELECT COALESCE(SUM(sd.price * sd.quantity), 0) as total
                             FROM sales s
                             JOIN sales_details sd ON s.code = sd.code
                             WHERE strftime('%Y-%W', s.date) = strftime('%Y-%W', 'now', '-7 days')";
            $lastWeekSales = $this->executeQuery($companyId, $lastWeekQuery);

            // Year to date sales
            $ytdQuery = "SELECT COALESCE(SUM(sd.price * sd.quantity), 0) as total
                        FROM sales s
                        JOIN sales_details sd ON s.code = sd.code
                        WHERE strftime('%Y', s.date) = strftime('%Y', 'now')";
            $ytdSales = $this->executeQuery($companyId, $ytdQuery);

            // Top 5 best selling products by value
            $top5ProductsQuery = "SELECT p.name, SUM(sd.price * sd.quantity) as total_value,
                                        SUM(sd.quantity) as total_quantity
                                 FROM sales_details sd
                                 JOIN products p ON sd.product = p.id
                                 JOIN sales s ON sd.code = s.code
                                 WHERE strftime('%Y-%m', s.date) = strftime('%Y-%m', 'now')
                                 GROUP BY sd.product, p.name
                                 ORDER BY total_value DESC
                                 LIMIT 5";
            $top5Products = $this->executeQuery($companyId, $top5ProductsQuery);

            // Calculate week-over-week growth
            $currentWeekSalesValue = $currentWeekSales[0]['total'] ?? 0;
            $lastWeekSalesValue = $lastWeekSales[0]['total'] ?? 0;
            $weekOverWeekGrowth = 0;
            if ($lastWeekSalesValue > 0) {
                $weekOverWeekGrowth = (($currentWeekSalesValue - $lastWeekSalesValue) / $lastWeekSalesValue) * 100;
            }

            return [
                'total_sales' => round($totalSales[0]['total'] ?? 0, 2),
                'today_sales' => round($todaySales[0]['total'] ?? 0, 2),
                'current_month_sales' => round($currentMonthSalesValue, 2),
                'last_month_sales' => round($lastMonthSalesValue, 2),
                'top_product_by_value' => [
                    'name' => $topProductValue[0]['name'] ?? 'N/A',
                    'total_value' => round($topProductValue[0]['total_value'] ?? 0, 2),
                ],
                'top_product_by_quantity' => [
                    'name' => $topProductQuantity[0]['name'] ?? 'N/A',
                    'total_quantity' => round($topProductQuantity[0]['total_quantity'] ?? 0, 2),
                ],
                'total_transactions' => $transactions[0]['total'] ?? 0,
                'current_month_transactions' => $currentMonthTransactionsValue,
                'last_month_transactions' => $lastMonthTransactions[0]['total'] ?? 0,
                'growth_rate' => round($growthRate, 2),
                'average_order_value' => round($averageOrderValue, 2),
                'current_month_profit' => round($currentMonthProfitValue, 2),
                'last_month_profit' => round($lastMonthProfitValue, 2),
                'profit_margin_percentage' => round($profitMarginPercentage, 2),
                'current_week_sales' => round($currentWeekSalesValue, 2),
                'last_week_sales' => round($lastWeekSalesValue, 2),
                'week_over_week_growth' => round($weekOverWeekGrowth, 2),
                'ytd_sales' => round($ytdSales[0]['total'] ?? 0, 2),
                'top_5_products' => array_map(function($product) {
                    return [
                        'name' => $product['name'],
                        'total_value' => round($product['total_value'], 2),
                        'total_quantity' => round($product['total_quantity'], 2),
                    ];
                }, $top5Products),
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get sales statistics', [
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get sales details (individual items sold).
     *
     * @param int $companyId
     * @param int $page
     * @param int $limit
     * @param string|null $search
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function getSalesDetails(int $companyId, int $page = 0, int $limit = 100, ?string $search = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $offset = $page;
        $params = [];
        $whereClauses = [];

        // Build WHERE clause for search
        if ($search) {
            $whereClauses[] = "(s.code LIKE :search OR p.name LIKE :search)";
            $params[':search'] = "%$search%";
        }

        // Build WHERE clause for date filtering
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
        $countQuery = "SELECT COUNT(*) FROM sales_details sd
                      JOIN sales s ON sd.code = s.code
                      JOIN products p ON sd.product = p.id
                      $whereClause";
        $total = $this->executeCountQuery($companyId, $countQuery, $params);

        // Data query
        $query = "SELECT sd.id, s.code, s.date, p.name as product_name, sd.quantity,
                         sd.price, (sd.price * sd.quantity) as total_amount,
                         s.customer, s.payment_method
                  FROM sales_details sd
                  JOIN sales s ON sd.code = s.code
                  JOIN products p ON sd.product = p.id
                  $whereClause
                  ORDER BY s.date DESC, s.code ASC
                  LIMIT :limit OFFSET :offset";

        $params[':limit'] = $limit;
        $params[':offset'] = $offset;

        $data = $this->executeQuery($companyId, $query, $params);

        return [
            'data' => $data,
            'total' => $total,
            'displayColumns' => ['code', 'date', 'product_name', 'quantity', 'price', 'total_amount', 'customer', 'payment_method'],
            'columnLabels' => [
                'id' => 'ID',
                'code' => 'Sale Code',
                'date' => 'Date',
                'product_name' => 'Product',
                'quantity' => 'Quantity',
                'price' => 'Unit Price',
                'total_amount' => 'Total Amount',
                'customer' => 'Customer',
                'payment_method' => 'Payment Method',
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
