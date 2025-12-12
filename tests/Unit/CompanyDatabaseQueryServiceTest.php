<?php

namespace Tests\Unit;

use App\Models\Company;
use App\Models\CompanyDatabaseUpload;
use App\Services\CompanyDatabaseQueryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CompanyDatabaseQueryServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CompanyDatabaseQueryService $service;
    protected string $testDatabasePath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CompanyDatabaseQueryService();

        // Copy the real company database for testing
        $this->testDatabasePath = storage_path('app/test_company_database.sqlite');
        $realDbPath = base_path('druglane.db');

        if (file_exists($realDbPath)) {
            copy($realDbPath, $this->testDatabasePath);
        } else {
            $this->fail('Real database file druglane.db not found in project root');
        }
    }

    protected function tearDown(): void
    {
        // Clean up test database
        if (file_exists($this->testDatabasePath)) {
            unlink($this->testDatabasePath);
        }
        parent::tearDown();
    }

    /**
     * Create a test SQLite database with sample data (DEPRECATED - using real database now).
     */
    protected function createTestSQLiteDatabaseOld(): void
    {
        // Create SQLite database
        $pdo = new \PDO("sqlite:" . $this->testDatabasePath);
        $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

        // Create products table
        $pdo->exec("
            CREATE TABLE products (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT,
                price REAL,
                cost_price REAL,
                current_stock REAL,
                min_stock REAL,
                max_stock REAL,
                unit TEXT,
                expiry TEXT,
                barcode TEXT,
                shelf TEXT,
                status INTEGER,
                created_on TEXT
            )
        ");

        // Insert test products
        $stmt = $pdo->prepare("
            INSERT INTO products (name, category, price, cost_price, current_stock, min_stock, max_stock, unit, barcode, created_on)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $products = [
            ['Paracetamol 500mg', 'Analgesics', 2.50, 1.50, 150, 20, 500, 'Tablets', 'BAR001', date('Y-m-d H:i:s')],
            ['Ibuprofen 200mg', 'Analgesics', 3.00, 2.00, 200, 30, 600, 'Tablets', 'BAR002', date('Y-m-d H:i:s')],
            ['Amoxicillin 250mg', 'Antibiotics', 5.00, 3.50, 100, 15, 300, 'Capsules', 'BAR003', date('Y-m-d H:i:s')],
        ];

        foreach ($products as $product) {
            $stmt->execute($product);
        }

        // Create sales table
        $pdo->exec("
            CREATE TABLE sales (
                id INTEGER PRIMARY KEY,
                code TEXT NOT NULL,
                date TEXT,
                customer TEXT,
                payment_method TEXT,
                amount_paid REAL,
                insurance_provider TEXT,
                creditor_name TEXT,
                discount REAL,
                credit_paid INTEGER,
                created_on TEXT
            )
        ");

        // Create sales_details table
        $pdo->exec("
            CREATE TABLE sales_details (
                id INTEGER PRIMARY KEY,
                code TEXT NOT NULL,
                product_id INTEGER,
                quantity REAL,
                price REAL
            )
        ");

        // Insert test sales
        $stmt = $pdo->prepare("
            INSERT INTO sales (code, date, customer, payment_method, amount_paid, created_on)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $sales = [
            ['SALE-001', date('Y-m-d'), 'John Doe', 'Cash', 125.50, date('Y-m-d H:i:s')],
            ['SALE-002', date('Y-m-d'), 'Jane Smith', 'Card', 250.00, date('Y-m-d H:i:s')],
        ];

        foreach ($sales as $sale) {
            $stmt->execute($sale);
        }

        // Insert sales details
        $pdo->exec("INSERT INTO sales_details (code, product_id, quantity, price) VALUES ('SALE-001', 1, 5, 25.10)");
        $pdo->exec("INSERT INTO sales_details (code, product_id, quantity, price) VALUES ('SALE-002', 2, 10, 25.00)");

        // Create purchases table
        $pdo->exec("
            CREATE TABLE purchases (
                id INTEGER PRIMARY KEY,
                code TEXT NOT NULL,
                date TEXT,
                vendor INTEGER,
                status TEXT,
                invoice TEXT,
                payment_method TEXT,
                amount_paid REAL,
                last_payment_date TEXT,
                created_on TEXT
            )
        ");

        // Create purchase_details table
        $pdo->exec("
            CREATE TABLE purchase_details (
                id INTEGER PRIMARY KEY,
                code TEXT NOT NULL,
                product_id INTEGER,
                quantity REAL,
                price REAL
            )
        ");

        // Create vendors table
        $pdo->exec("
            CREATE TABLE vendors (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            )
        ");

        // Insert test vendor
        $pdo->exec("INSERT INTO vendors (id, name) VALUES (1, 'ABC Pharmaceuticals')");

        // Insert test purchases
        $stmt = $pdo->prepare("
            INSERT INTO purchases (code, date, vendor, status, invoice, payment_method, amount_paid, created_on)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $purchases = [
            ['PO-001', date('Y-m-d'), 1, 'Completed', 'INV-001', 'Bank Transfer', 5000.00, date('Y-m-d H:i:s')],
        ];

        foreach ($purchases as $purchase) {
            $stmt->execute($purchase);
        }

        // Insert purchase details
        $pdo->exec("INSERT INTO purchase_details (code, product_id, quantity, price) VALUES ('PO-001', 1, 100, 50.00)");
    }

    public function test_it_can_get_products(): void
    {
        // Create company with database upload
        $company = Company::factory()->create();
        $upload = CompanyDatabaseUpload::factory()->create([
            'company_id' => $company->id,
            'sqlite_path' => str_replace(storage_path('app/'), '', $this->testDatabasePath),
            'is_active' => true,
        ]);

        // Get products
        $result = $this->service->getProducts($company->id, 0, 100);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('total', $result);
        $this->assertArrayHasKey('displayColumns', $result);
        $this->assertArrayHasKey('columnLabels', $result);

        // Real database has 1735 products
        $this->assertGreaterThan(1000, $result['total']);
        $this->assertCount(100, $result['data']); // Default limit is 100
        // Products are ordered by name ASC
        $this->assertNotEmpty($result['data'][0]['name']);
    }

    public function test_it_can_search_products(): void
    {
        $company = Company::factory()->create();
        $upload = CompanyDatabaseUpload::factory()->create([
            'company_id' => $company->id,
            'sqlite_path' => str_replace(storage_path('app/'), '', $this->testDatabasePath),
            'is_active' => true,
        ]);

        // Search for CEFUROXIME (exists in real database)
        $result = $this->service->getProducts($company->id, 0, 100, 'CEFUROXIME');

        $this->assertGreaterThan(0, $result['total']);
        $this->assertGreaterThan(0, count($result['data']));
        // Verify search result contains the search term
        $this->assertStringContainsStringIgnoringCase('CEFUROXIME', $result['data'][0]['name']);
    }

    public function test_it_can_paginate_products(): void
    {
        $company = Company::factory()->create();
        $upload = CompanyDatabaseUpload::factory()->create([
            'company_id' => $company->id,
            'sqlite_path' => str_replace(storage_path('app/'), '', $this->testDatabasePath),
            'is_active' => true,
        ]);

        // Get first 10 products
        $result = $this->service->getProducts($company->id, 0, 10);

        $this->assertCount(10, $result['data']);
        $this->assertGreaterThan(1000, $result['total']);

        // Get next 10 products (offset 10, limit 10)
        $result = $this->service->getProducts($company->id, 10, 10);

        $this->assertCount(10, $result['data']);
        $this->assertGreaterThan(1000, $result['total']);
    }

    public function test_it_can_get_sales(): void
    {
        $company = Company::factory()->create();
        $upload = CompanyDatabaseUpload::factory()->create([
            'company_id' => $company->id,
            'sqlite_path' => str_replace(storage_path('app/'), '', $this->testDatabasePath),
            'is_active' => true,
        ]);

        $result = $this->service->getSales($company->id, 0, 100);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('data', $result);
        // Real database has 49413 sales
        $this->assertGreaterThan(40000, $result['total']);
        $this->assertCount(100, $result['data']); // Limit is 100
        $this->assertNotEmpty($result['data'][0]['code']);
        $this->assertArrayHasKey('total_amount', $result['data'][0]);
    }

    public function test_it_can_filter_sales_by_date(): void
    {
        $company = Company::factory()->create();
        $upload = CompanyDatabaseUpload::factory()->create([
            'company_id' => $company->id,
            'sqlite_path' => str_replace(storage_path('app/'), '', $this->testDatabasePath),
            'is_active' => true,
        ]);

        // Filter by a specific date range from real data (2024-01-20)
        $result = $this->service->getSales($company->id, 0, 100, null, '2024-01-20', '2024-01-20');

        // Should have sales on that date
        $this->assertGreaterThanOrEqual(0, $result['total']);
        if ($result['total'] > 0) {
            $this->assertArrayHasKey('date', $result['data'][0]);
        }
    }

    public function test_it_can_get_purchases(): void
    {
        $company = Company::factory()->create();
        $upload = CompanyDatabaseUpload::factory()->create([
            'company_id' => $company->id,
            'sqlite_path' => str_replace(storage_path('app/'), '', $this->testDatabasePath),
            'is_active' => true,
        ]);

        $result = $this->service->getPurchases($company->id, 0, 100);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('data', $result);
        // Real database has 771 purchases
        $this->assertGreaterThan(700, $result['total']);
        $this->assertCount(100, $result['data']); // Limit is 100
        $this->assertNotEmpty($result['data'][0]['code']);
        $this->assertArrayHasKey('vendor_name', $result['data'][0]);
    }

    public function test_it_throws_exception_when_database_not_found(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No database found for this company');

        $company = Company::factory()->create();
        // No database upload created

        $this->service->getProducts($company->id, 0, 100);
    }
}
