<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        // Insert the default subjects (without truncating to keep foreign keys)
        $subjects = [
            ['name' => 'Toán', 'class_level' => 'Tiểu học'],
            ['name' => 'Toán', 'class_level' => 'THCS'],
            ['name' => 'Toán', 'class_level' => 'THPT'],
            ['name' => 'Tiếng Việt', 'class_level' => 'Tiểu học'],
            ['name' => 'Ngữ Văn', 'class_level' => 'THCS'],
            ['name' => 'Ngữ Văn', 'class_level' => 'THPT'],
            ['name' => 'Tiếng Anh', 'class_level' => 'Tiểu học'],
            ['name' => 'Tiếng Anh', 'class_level' => 'THCS'],
            ['name' => 'Tiếng Anh', 'class_level' => 'THPT'],
            ['name' => 'Khoa học', 'class_level' => 'Tiểu học'],
            ['name' => 'Khoa học Tự nhiên', 'class_level' => 'THCS'],
            ['name' => 'Vật lý', 'class_level' => 'THPT'],
            ['name' => 'Hóa học', 'class_level' => 'THPT'],
            ['name' => 'Sinh học', 'class_level' => 'THPT'],
            ['name' => 'Lịch sử', 'class_level' => 'THCS'],
            ['name' => 'Lịch sử', 'class_level' => 'THPT'],
            ['name' => 'Địa lý', 'class_level' => 'THCS'],
            ['name' => 'Địa lý', 'class_level' => 'THPT'],
            ['name' => 'Giáo dục công dân', 'class_level' => 'THCS'],
            ['name' => 'Giáo dục công dân', 'class_level' => 'THPT'],
            ['name' => 'Tin học', 'class_level' => 'THCS'],
            ['name' => 'Tin học', 'class_level' => 'THPT'],
            ['name' => 'Công nghệ', 'class_level' => 'THCS'],
            ['name' => 'Công nghệ', 'class_level' => 'THPT'],
            ['name' => 'Nghệ thuật', 'class_level' => 'Tiểu học'],
            ['name' => 'Âm nhạc', 'class_level' => 'Tiểu học'],
            ['name' => 'Thể dục', 'class_level' => 'Tiểu học'],
            ['name' => 'GDCD', 'class_level' => 'THCS'],
        ];

        foreach ($subjects as $subject) {
            DB::table('subjects')->updateOrInsert(
                ['name' => $subject['name']],
                $subject
            );
        }

        $this->command->info('Subjects seeded successfully!');
    }
}
