<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CompanyUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if default company already exists
        $company = Company::where('email', 'demo@company.com')->first();

        if (!$company) {
            // Create a default company
            $company = Company::create([
                'name' => 'Demo Company',
                'email' => 'demo@company.com',
                'phone' => '+1-555-0100',
                'address' => '123 Demo Street',
                'city' => 'Demo City',
                'country' => 'USA',
                'license_status' => 'active',
                'license_issued_at' => now(),
                'license_expires_at' => now()->addYear(),
                'notes' => 'Default demo company for testing'
            ]);

            $this->command->info('Default company created successfully!');
            $this->command->info('Company Name: ' . $company->name);
            $this->command->info('License Key: ' . $company->license_key);
        } else {
            $this->command->info('Default company already exists.');
        }

        // Get company_user role
        $companyUserRole = Role::where('name', 'company_user')->first();

        if (!$companyUserRole) {
            $this->command->error('Company user role not found. Please run RoleSeeder first.');
            return;
        }

        // Check if default company user already exists
        $user = User::where('email', 'user@company.com')->first();

        if (!$user) {
            // Create a default company user
            $user = User::create([
                'name' => 'Demo User',
                'email' => 'user@company.com',
                'password' => Hash::make('password'),
                'role_id' => $companyUserRole->id,
                'company_id' => $company->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $this->command->info('Default company user created successfully!');
            $this->command->info('Email: user@company.com');
            $this->command->info('Password: password');
            $this->command->warn('IMPORTANT: Change the default password immediately in production!');
        } else {
            $this->command->info('Default company user already exists.');
        }
    }
}
