<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@school.edu',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Teachers
        User::create([
            'name' => 'Nguyễn Văn A',
            'email' => 'teacher@school.edu',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        User::create([
            'name' => 'Trần Thị B',
            'email' => 'teacher2@school.edu',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        // Students
        User::create([
            'name' => 'Lê Minh C',
            'email' => 'student@school.edu',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        User::create([
            'name' => 'Phạm Thị D',
            'email' => 'student2@school.edu',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        User::create([
            'name' => 'Hoàng Văn E',
            'email' => 'student3@school.edu',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);
    }
}
