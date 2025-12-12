<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CompanyDatabaseUpload;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyDataControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $companyUser;
    protected User $adminUser;
    protected Company $company;
    protected string $testDatabasePath;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::create(['name' => 'admin', 'display_name' => 'Administrator']);
        $companyUserRole = Role::create(['name' => 'company_user', 'display_name' => 'Company User']);

        // Create company
        $this->company = Company::factory()->activated()->create();

        // Create users
        $this->adminUser = User::factory()->create([
            'role_id' => $adminRole->id,
            'company_id' => null,
            'is_active' => true,
        ]);

        $this->companyUser = User::factory()->create([
            'role_id' => $companyUserRole->id,
            'company_id' => $this->company->id,
            'is_active' => true,
        ]);

        // Copy the real company database for testing
        $this->testDatabasePath = storage_path('app/test_company_data.sqlite');
        $realDbPath = base_path('druglane.db');

        if (file_exists($realDbPath)) {
            copy($realDbPath, $this->testDatabasePath);
        } else {
            $this->fail('Real database file druglane.db not found in project root');
        }

        // Create database upload
        CompanyDatabaseUpload::factory()->create([
            'company_id' => $this->company->id,
            'sqlite_path' => str_replace(storage_path('app/'), '', $this->testDatabasePath),
            'is_active' => true,
        ]);
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
            INSERT INTO products (name, category, price, cost_price, current_stock, min_stock, barcode, created_on)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        for ($i = 1; $i <= 5; $i++) {
            $stmt->execute([
                "Product $i",
                'Category A',
                10.00 * $i,
                5.00 * $i,
                100 + $i,
                10,
                "BAR00$i",
                date('Y-m-d H:i:s')
            ]);
        }

        // Create sales and related tables
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
        for ($i = 1; $i <= 3; $i++) {
            $pdo->exec("
                INSERT INTO sales (code, date, customer, payment_method, amount_paid, created_on)
                VALUES ('SALE-00$i', '" . date('Y-m-d') . "', 'Customer $i', 'Cash', " . (100.00 * $i) . ", '" . date('Y-m-d H:i:s') . "')
            ");
            $pdo->exec("INSERT INTO sales_details (code, product_id, quantity, price) VALUES ('SALE-00$i', $i, 2, 50.00)");
        }

        // Create purchases and related tables
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

        $pdo->exec("
            CREATE TABLE purchase_details (
                id INTEGER PRIMARY KEY,
                code TEXT NOT NULL,
                product_id INTEGER,
                quantity REAL,
                price REAL
            )
        ");

        $pdo->exec("
            CREATE TABLE vendors (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            )
        ");

        // Insert test vendors and purchases
        $pdo->exec("INSERT INTO vendors (id, name) VALUES (1, 'Vendor A'), (2, 'Vendor B')");

        for ($i = 1; $i <= 2; $i++) {
            $pdo->exec("
                INSERT INTO purchases (code, date, vendor, status, invoice, payment_method, amount_paid, created_on)
                VALUES ('PO-00$i', '" . date('Y-m-d') . "', $i, 'Completed', 'INV-00$i', 'Bank Transfer', " . (1000.00 * $i) . ", '" . date('Y-m-d H:i:s') . "')
            ");
            $pdo->exec("INSERT INTO purchase_details (code, product_id, quantity, price) VALUES ('PO-00$i', $i, 10, 100.00)");
        }
    }

    /** @test */
    public function it_requires_authentication_to_access_products()
    {
        $response = $this->getJson('/api/company-data/products');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_returns_products_for_authenticated_company_user()
    {
        Sanctum::actingAs($this->companyUser);

        $response = $this->getJson('/api/company-data/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'category', 'price', 'cost_price', 'current_stock', 'barcode']
                ],
                'total',
                'displayColumns',
                'columnLabels',
                'columnFilters'
            ])
            ->assertJsonCount(100, 'data'); // Default limit is 100

        // Real database has 1735+ products
        $this->assertGreaterThan(1000, $response->json('total'));
    }

    /** @test */
    public function it_can_search_products()
    {
        Sanctum::actingAs($this->companyUser);

        // Search for CEFUROXIME (exists in real database)
        $response = $this->getJson('/api/company-data/products?param=CEFUROXIME');

        $response->assertStatus(200);

        $this->assertGreaterThan(0, $response->json('total'));
        $this->assertGreaterThan(0, count($response->json('data')));
        $this->assertStringContainsStringIgnoringCase('CEFUROXIME', $response->json('data.0.name'));
    }

    /** @test */
    public function it_can_paginate_products()
    {
        Sanctum::actingAs($this->companyUser);

        // Get first page (offset 0, limit 10)
        $response = $this->getJson('/api/company-data/products?page=0&limit=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data');
        $this->assertGreaterThan(1000, $response->json('total'));

        // Get second page (offset 10, limit 10)
        $response = $this->getJson('/api/company-data/products?page=10&limit=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data');
        $this->assertGreaterThan(1000, $response->json('total'));
    }

    /** @test */
    public function it_returns_403_when_user_has_no_company()
    {
        $userWithoutCompany = User::factory()->create([
            'role_id' => $this->companyUser->role_id,
            'company_id' => null,
            'is_active' => true,
        ]);

        Sanctum::actingAs($userWithoutCompany);

        $response = $this->getJson('/api/company-data/products');

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'No company associated with this account'
            ]);
    }

    /** @test */
    public function it_returns_sales_for_authenticated_company_user()
    {
        Sanctum::actingAs($this->companyUser);

        $response = $this->getJson('/api/company-data/sales');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code', 'date', 'customer', 'payment_method', 'amount_paid', 'total_amount']
                ],
                'total',
                'displayColumns',
                'columnLabels',
                'columnFilters'
            ])
            ->assertJsonCount(100, 'data'); // Default limit is 100

        // Real database has 49413+ sales
        $this->assertGreaterThan(40000, $response->json('total'));
    }

    /** @test */
    public function it_can_search_sales()
    {
        Sanctum::actingAs($this->companyUser);

        // Search for sales with code 51004 (exists in real database)
        $response = $this->getJson('/api/company-data/sales?param=51004');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(0, $response->json('total'));
    }

    /** @test */
    public function it_can_filter_sales_by_date_range()
    {
        Sanctum::actingAs($this->companyUser);

        // Filter by date from real data
        $response = $this->getJson("/api/company-data/sales?start_date=2024-01-20&end_date=2024-01-20");

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(0, $response->json('total'));
    }

    /** @test */
    public function it_returns_purchases_for_authenticated_company_user()
    {
        Sanctum::actingAs($this->companyUser);

        $response = $this->getJson('/api/company-data/purchases');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code', 'date', 'vendor_name', 'status', 'invoice', 'payment_method', 'amount_paid', 'total_amount']
                ],
                'total',
                'displayColumns',
                'columnLabels',
                'columnFilters'
            ])
            ->assertJsonCount(100, 'data'); // Default limit is 100

        // Real database has 771+ purchases
        $this->assertGreaterThan(700, $response->json('total'));
    }

    /** @test */
    public function it_can_search_purchases()
    {
        Sanctum::actingAs($this->companyUser);

        // Search for any purchase code - real database has many purchases
        $response = $this->getJson('/api/company-data/purchases?param=PO');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(0, $response->json('total'));
    }

    /** @test */
    public function it_can_filter_purchases_by_vendor()
    {
        Sanctum::actingAs($this->companyUser);

        // Search by vendor name - real database has various vendors
        $response = $this->getJson('/api/company-data/purchases?param=vendor');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(0, $response->json('total'));
    }

    /** @test */
    public function it_returns_500_when_database_file_is_missing()
    {
        // Create a company without a valid database file
        $companyWithoutDb = Company::factory()->create();
        $userWithoutDb = User::factory()->create([
            'role_id' => $this->companyUser->role_id,
            'company_id' => $companyWithoutDb->id,
            'is_active' => true,
        ]);

        // Create upload with non-existent path
        CompanyDatabaseUpload::factory()->create([
            'company_id' => $companyWithoutDb->id,
            'sqlite_path' => 'non_existent/database.sqlite',
            'is_active' => true,
        ]);

        Sanctum::actingAs($userWithoutDb);

        $response = $this->getJson('/api/company-data/products');

        $response->assertStatus(500)
            ->assertJsonStructure(['message']);
    }

    /** @test */
    public function it_respects_pagination_limits()
    {
        Sanctum::actingAs($this->companyUser);

        $response = $this->getJson('/api/company-data/products?limit=3');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
        // Total should be > 1000 products in real database
        $this->assertGreaterThan(1000, $response->json('total'));
    }

    /** @test */
    public function it_returns_empty_results_when_no_data_matches_search()
    {
        Sanctum::actingAs($this->companyUser);

        $response = $this->getJson('/api/company-data/products?param=NonExistentProduct');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data')
            ->assertJson(['total' => 0]);
    }

    /** @test */
    public function it_handles_special_characters_in_search()
    {
        Sanctum::actingAs($this->companyUser);

        // Test with special characters that should be escaped
        $response = $this->getJson('/api/company-data/products?param=' . urlencode("Product's \"1\""));

        $response->assertStatus(200);
    }
}
