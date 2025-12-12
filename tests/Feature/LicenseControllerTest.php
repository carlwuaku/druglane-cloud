<?php

namespace Tests\Feature;

use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LicenseControllerTest extends TestCase
{
    use RefreshDatabase;

    protected Company $activeCompany;
    protected Company $expiredCompany;
    protected Company $suspendedCompany;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a company with active license
        $this->activeCompany = Company::factory()->create([
            'name' => 'Test Company',
            'email' => 'test@testcompany.com',
            'license_status' => 'active',
            'license_issued_at' => now(),
            'license_expires_at' => now()->addYear(),
            'is_activated' => false,
        ]);

        // Create a company with expired license
        $this->expiredCompany = Company::factory()->create([
            'name' => 'Expired License Company',
            'email' => 'expired@testcompany.com',
            'license_status' => 'active',
            'license_issued_at' => now()->subYear(),
            'license_expires_at' => now()->subDay(),
            'is_activated' => false,
        ]);

        // Create a company with suspended license
        $this->suspendedCompany = Company::factory()->create([
            'name' => 'Suspended License Company',
            'email' => 'suspended@testcompany.com',
            'license_status' => 'suspended',
            'license_issued_at' => now(),
            'license_expires_at' => now()->addYear(),
            'is_activated' => false,
        ]);
    }

    /** @test */
    public function it_returns_valid_response_for_active_license()
    {
        $response = $this->getJson("/api/api_admin/findBranchByKey?k={$this->activeCompany->license_key}");

        $response->assertStatus(200)
            ->assertJson([
                'status' => '1',
            ])
            ->assertJsonStructure([
                'status',
                'data' => [
                    'id',
                    'name',
                    'license_key',
                    'jwt_key',
                    'is_activated',
                    'activated_at',
                    'activated_by_machine_id',
                    'license_status',
                    'license_issued_at',
                    'license_expires_at',
                    'email',
                    'phone',
                    'address',
                    'city',
                    'country',
                    'notes',
                    'created_at',
                    'updated_at',
                    'deleted_at',
                ],
                'jwt_key',
            ]);

        // Verify that the data matches the company
        $this->assertEquals($this->activeCompany->id, $response->json('data.id'));
        $this->assertEquals($this->activeCompany->name, $response->json('data.name'));
        $this->assertEquals($this->activeCompany->license_key, $response->json('data.license_key'));

        // Verify JWT key is returned and is 64 characters hex string
        $jwtKey = $response->json('jwt_key');
        $this->assertNotNull($jwtKey);
        $this->assertEquals(64, strlen($jwtKey));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $jwtKey);

        // Verify jwt_key is also in data
        $this->assertEquals($jwtKey, $response->json('data.jwt_key'));
    }

    /** @test */
    public function it_returns_error_for_invalid_license_key()
    {
        $response = $this->getJson('/api/api_admin/findBranchByKey?k=INVALID-KEY');

        $response->assertStatus(404)
            ->assertJson([
                'status' => '0',
                'message' => 'License key not found',
            ]);
    }

    /** @test */
    public function it_returns_error_when_license_key_parameter_is_missing()
    {
        $response = $this->getJson('/api/api_admin/findBranchByKey');

        $response->assertStatus(400)
            ->assertJson([
                'status' => '0',
                'message' => 'License key parameter (k) is required',
            ]);
    }

    /** @test */
    public function it_returns_error_for_expired_license()
    {
        $response = $this->getJson("/api/api_admin/findBranchByKey?k={$this->expiredCompany->license_key}");

        $response->assertStatus(403)
            ->assertJson([
                'status' => '0',
                'message' => 'License has expired',
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'name',
                    'license_key',
                ],
            ]);

        // Verify company data is still returned even for expired license
        $this->assertEquals($this->expiredCompany->id, $response->json('data.id'));
        $this->assertEquals($this->expiredCompany->name, $response->json('data.name'));
    }

    /** @test */
    public function it_returns_error_for_suspended_license()
    {
        $response = $this->getJson("/api/api_admin/findBranchByKey?k={$this->suspendedCompany->license_key}");

        $response->assertStatus(403)
            ->assertJson([
                'status' => '0',
                'message' => 'License has been suspended',
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'data',
            ]);

        $this->assertEquals($this->suspendedCompany->id, $response->json('data.id'));
    }

    /** @test */
    public function it_generates_jwt_key_on_first_request()
    {
        // Ensure JWT key is null before request
        $this->assertNull($this->activeCompany->jwt_key);

        // First request
        $response = $this->getJson("/api/api_admin/findBranchByKey?k={$this->activeCompany->license_key}");

        $response->assertStatus(200);
        $firstJwtKey = $response->json('jwt_key');
        $this->assertNotNull($firstJwtKey);

        // Refresh the company model from database
        $this->activeCompany->refresh();
        $this->assertNotNull($this->activeCompany->jwt_key);
        $this->assertEquals($firstJwtKey, $this->activeCompany->jwt_key);

        // Second request should return the same JWT key
        $response2 = $this->getJson("/api/api_admin/findBranchByKey?k={$this->activeCompany->license_key}");
        $secondJwtKey = $response2->json('jwt_key');

        $this->assertEquals($firstJwtKey, $secondJwtKey);
    }

    /** @test */
    public function it_validates_license_endpoint_returns_valid_for_active_license()
    {
        $response = $this->postJson('/api/license/validate', [
            'license_key' => $this->activeCompany->license_key,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'valid' => true,
                'message' => 'License is valid',
            ])
            ->assertJsonStructure([
                'valid',
                'message',
                'company' => [
                    'id',
                    'name',
                    'is_activated',
                    'license_status',
                    'license_expires_at',
                ],
            ]);
    }

    /** @test */
    public function it_validates_license_endpoint_returns_invalid_for_expired_license()
    {
        $response = $this->postJson('/api/license/validate', [
            'license_key' => $this->expiredCompany->license_key,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'valid' => false,
                'message' => 'License has expired',
            ]);
    }

    /** @test */
    public function it_activates_license_successfully()
    {
        $machineId = 'TEST-MACHINE-' . uniqid();

        $response = $this->postJson('/api/license/activate', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $machineId,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'License activated successfully',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'company' => [
                    'id',
                    'name',
                    'license_key',
                    'email',
                    'activated_at',
                    'license_expires_at',
                ],
            ]);

        // Verify activation in database
        $this->activeCompany->refresh();
        $this->assertTrue($this->activeCompany->is_activated);
        $this->assertEquals($machineId, $this->activeCompany->activated_by_machine_id);
        $this->assertNotNull($this->activeCompany->activated_at);
    }

    /** @test */
    public function it_prevents_license_activation_on_different_machine()
    {
        $firstMachineId = 'MACHINE-1-' . uniqid();
        $secondMachineId = 'MACHINE-2-' . uniqid();

        // Activate on first machine
        $this->postJson('/api/license/activate', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $firstMachineId,
        ])->assertStatus(200);

        // Try to activate on second machine
        $response = $this->postJson('/api/license/activate', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $secondMachineId,
        ]);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'License has already been activated on another machine',
            ]);
    }

    /** @test */
    public function it_allows_reactivation_on_same_machine()
    {
        $machineId = 'MACHINE-1-' . uniqid();

        // Activate on first machine
        $this->postJson('/api/license/activate', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $machineId,
        ])->assertStatus(200);

        // Try to activate again on same machine
        $response = $this->postJson('/api/license/activate', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $machineId,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'License already activated on this machine',
            ]);
    }

    /** @test */
    public function it_checks_activation_status_correctly()
    {
        $machineId = 'TEST-MACHINE-' . uniqid();

        // Activate license
        $this->postJson('/api/license/activate', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $machineId,
        ])->assertStatus(200);

        // Check activation status
        $response = $this->postJson('/api/license/check-activation', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $machineId,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'activated' => true,
                'valid' => true,
                'message' => 'License is activated and valid',
            ])
            ->assertJsonStructure([
                'activated',
                'valid',
                'message',
                'company' => [
                    'id',
                    'name',
                    'license_expires_at',
                ],
            ]);
    }

    /** @test */
    public function it_returns_different_machine_error_when_checking_activation_on_different_machine()
    {
        $firstMachineId = 'MACHINE-1-' . uniqid();
        $secondMachineId = 'MACHINE-2-' . uniqid();

        // Activate on first machine
        $this->postJson('/api/license/activate', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $firstMachineId,
        ])->assertStatus(200);

        // Check activation on different machine
        $response = $this->postJson('/api/license/check-activation', [
            'license_key' => $this->activeCompany->license_key,
            'machine_id' => $secondMachineId,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'activated' => false,
                'message' => 'License is activated on a different machine',
            ]);
    }
}
