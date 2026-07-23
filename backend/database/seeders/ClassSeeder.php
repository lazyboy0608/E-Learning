<?php

namespace Database\Seeders;

use App\Models\ClassModel;
use App\Models\ClassUser;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('role', 'teacher')->first();
        $students = User::where('role', 'student')->get();

        // Class 1: Toán Lớp 1
        $class1 = ClassModel::create([
            'name' => 'Lớp Toán 1A',
            'created_by' => $teacher->id,
        ]);

        // Add teacher to class
        ClassUser::create([
            'class_id' => $class1->id,
            'user_id' => $teacher->id,
            'role' => 'teacher',
        ]);

        // Add all students to class 1
        foreach ($students as $student) {
            ClassUser::create([
                'class_id' => $class1->id,
                'user_id' => $student->id,
                'role' => 'student',
            ]);
        }

        // Class 2: Tiếng Việt Lớp 1
        $class2 = ClassModel::create([
            'name' => 'Lớp Tiếng Việt 1B',
            'created_by' => $teacher->id,
        ]);

        ClassUser::create([
            'class_id' => $class2->id,
            'user_id' => $teacher->id,
            'role' => 'teacher',
        ]);

        // Add 2 students to class 2
        foreach ($students->take(2) as $student) {
            ClassUser::create([
                'class_id' => $class2->id,
                'user_id' => $student->id,
                'role' => 'student',
            ]);
        }
    }
}
