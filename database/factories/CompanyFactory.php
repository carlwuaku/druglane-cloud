<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    protected $model = Company::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'license_key' => $this->generateLicenseKey(),
            'is_activated' => false,
            'activated_at' => null,
            'activated_by_machine_id' => null,
            'license_status' => 'active',
            'license_issued_at' => now(),
            'license_expires_at' => now()->addYear(),
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'notes' => null,
        ];
    }

    /**
     * Indicate that the company is activated.
     */
    public function activated(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_activated' => true,
            'activated_at' => now(),
            'activated_by_machine_id' => 'TEST-MACHINE-' . Str::random(10),
        ]);
    }

    /**
     * Indicate that the company license is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'license_status' => 'expired',
            'license_expires_at' => now()->subDays(30),
        ]);
    }

    /**
     * Indicate that the company license is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'license_status' => 'inactive',
        ]);
    }

    /**
     * Generate a license key in the format XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX.
     */
    protected function generateLicenseKey(): string
    {
        $segments = [];
        for ($i = 0; $i < 8; $i++) {
            $segments[] = strtoupper(Str::random(4));
        }
        return implode('-', $segments);
    }
}
