<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
        ]);

        // Optionally seed test data in development
        // Uncomment the following lines to create test companies and users
        // if (app()->environment('local')) {
        //     $this->call([
        //         CompanySeeder::class,
        //         CompanyUserSeeder::class,
        //     ]);
        // }
    }
}
