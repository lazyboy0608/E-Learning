<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Test;
use App\Models\TestQuestion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('role', 'teacher')->first();

        $tests = [
            [
                'title' => 'Kiểm tra Toán Lớp 1 - Phép cộng',
                'subject_id' => 1,
                'test_code' => strtoupper(Str::random(6)),
                'access_type' => 'public_code',
                'is_active' => true,
                'max_attempts' => 2,
                'duration' => 15,
                'questions' => [1, 2], // question IDs
            ],
            [
                'title' => 'Kiểm tra Toán Lớp 1 - Phép trừ',
                'subject_id' => 1,
                'test_code' => strtoupper(Str::random(6)),
                'access_type' => 'public_code',
                'is_active' => true,
                'max_attempts' => 2,
                'duration' => 15,
                'questions' => [3, 5],
            ],
            [
                'title' => 'Kiểm tra Tiếng Việt Lớp 1',
                'subject_id' => 3,
                'test_code' => strtoupper(Str::random(6)),
                'access_type' => 'public_code',
                'is_active' => true,
                'max_attempts' => 1,
                'duration' => 20,
                'questions' => [4, 7],
            ],
            [
                'title' => 'Kiểm tra Toán Lớp 2 - Phép cộng',
                'subject_id' => 2,
                'test_code' => strtoupper(Str::random(6)),
                'access_type' => 'public_code',
                'is_active' => true,
                'max_attempts' => 2,
                'duration' => 20,
                'questions' => [8, 9],
            ],
            [
                'title' => 'Kiểm tra Tiếng Anh Lớp 1',
                'subject_id' => 6,
                'test_code' => strtoupper(Str::random(6)),
                'access_type' => 'public_code',
                'is_active' => true,
                'max_attempts' => 3,
                'duration' => 15,
                'questions' => [10],
            ],
        ];

        foreach ($tests as $testData) {
            $questions = $testData['questions'];
            unset($testData['questions']);

            $test = Test::create(array_merge($testData, [
                'created_by' => $teacher->id,
            ]));

            foreach ($questions as $index => $questionId) {
                TestQuestion::create([
                    'test_id' => $test->id,
                    'question_id' => $questionId,
                    'order_index' => $index + 1,
                    'score' => 10,
                ]);
            }
        }
    }
}
