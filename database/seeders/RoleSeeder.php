<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'System administrator with full access to all features and companies',
            ],
            [
                'name' => 'company_user',
                'display_name' => 'Company User',
                'description' => 'Company user with access to their company data only',
            ],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::firstOrCreate(
                ['name' => $role['name']],
                $role
            );
        }

        $this->command->info('Roles seeded successfully!');
    }
}
