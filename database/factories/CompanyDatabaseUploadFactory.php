<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\CompanyDatabaseUpload;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CompanyDatabaseUpload>
 */
class CompanyDatabaseUploadFactory extends Factory
{
    protected $model = CompanyDatabaseUpload::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => fake()->name(),
            'email' => fake()->email(),
            'phone' => fake()->phoneNumber(),
            'sqlite_path' => 'company_uploads/test/database.sqlite',
            'json_path' => null,
            'original_filename' => 'backup.zip',
            'file_size' => 1024000,
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the upload is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
