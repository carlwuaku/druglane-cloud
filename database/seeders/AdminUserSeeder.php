<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = \App\Models\Role::where('name', 'admin')->first();

        if (!$adminRole) {
            $this->command->error('Admin role not found! Please run RoleSeeder first.');
            return;
        }

        $adminEmail = 'admin@druglane.com';
        $adminPassword = 'password'; // Change this in production!

        $admin = \App\Models\User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'role_id' => $adminRole->id,
                'company_id' => null,
                'name' => 'System Administrator',
                'password' => bcrypt($adminPassword),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        if ($admin->wasRecentlyCreated) {
            $this->command->info('Admin user created successfully!');
            $this->command->warn('Email: ' . $adminEmail);
            $this->command->warn('Password: ' . $adminPassword);
            $this->command->warn('IMPORTANT: Change the admin password immediately in production!');
        } else {
            $this->command->info('Admin user already exists.');
        }
    }
}
