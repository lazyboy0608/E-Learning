<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('role', 'teacher')->first();

        $questions = [
            // MCQ - Toán Lớp 1
            [
                'subject_id' => 1,
                'type' => 'mcq',
                'content' => '1 + 1 = ?',
                'data' => json_encode([
                    'options' => [
                        ['id' => 'a', 'text' => '1'],
                        ['id' => 'b', 'text' => '2'],
                        ['id' => 'c', 'text' => '3'],
                        ['id' => 'd', 'text' => '4'],
                    ],
                    'correct_answer' => 'b',
                ]),
                'explanation' => '1 + 1 = 2. Đây là phép cộng cơ bản.',
                'created_by' => $teacher->id,
            ],
            [
                'subject_id' => 1,
                'type' => 'mcq',
                'content' => '3 + 2 = ?',
                'data' => json_encode([
                    'options' => [
                        ['id' => 'a', 'text' => '4'],
                        ['id' => 'b', 'text' => '5'],
                        ['id' => 'c', 'text' => '6'],
                        ['id' => 'd', 'text' => '3'],
                    ],
                    'correct_answer' => 'b',
                ]),
                'explanation' => '3 + 2 = 5',
                'created_by' => $teacher->id,
            ],
            [
                'subject_id' => 1,
                'type' => 'mcq',
                'content' => '5 - 2 = ?',
                'data' => json_encode([
                    'options' => [
                        ['id' => 'a', 'text' => '2'],
                        ['id' => 'b', 'text' => '3'],
                        ['id' => 'c', 'text' => '4'],
                        ['id' => 'd', 'text' => '1'],
                    ],
                    'correct_answer' => 'b',
                ]),
                'explanation' => '5 - 2 = 3',
                'created_by' => $teacher->id,
            ],

            // MCQ - Tiếng Việt Lớp 1
            [
                'subject_id' => 3,
                'type' => 'mcq',
                'content' => 'Từ nào có chữ "a" đầu tiên?',
                'data' => json_encode([
                    'options' => [
                        ['id' => 'a', 'text' => 'Bàn'],
                        ['id' => 'b', 'text' => 'Áo'],
                        ['id' => 'c', 'text' => 'Cà'],
                        ['id' => 'd', 'text' => 'Danh'],
                    ],
                    'correct_answer' => 'b',
                ]),
                'explanation' => 'Từ "Áo" bắt đầu bằng chữ "A" hoa.',
                'created_by' => $teacher->id,
            ],

            // Fill Blank - Toán Lớp 1
            [
                'subject_id' => 1,
                'type' => 'fill_blank',
                'content' => 'Điền số thích hợp: 4 + ___ = 7',
                'data' => json_encode([
                    'correct_answers' => ['3'],
                    'case_sensitive' => false,
                ]),
                'explanation' => '4 + 3 = 7, vì 7 - 4 = 3',
                'created_by' => $teacher->id,
            ],
            [
                'subject_id' => 1,
                'type' => 'fill_blank',
                'content' => 'Điền số thích hợp: 10 - ___ = 6',
                'data' => json_encode([
                    'correct_answers' => ['4'],
                    'case_sensitive' => false,
                ]),
                'explanation' => '10 - 4 = 6, vì 10 - 6 = 4',
                'created_by' => $teacher->id,
            ],

            // Fill Blank - Tiếng Việt Lớp 1
            [
                'subject_id' => 3,
                'type' => 'fill_blank',
                'content' => 'Điền từ còn thiếu: "Con mèo đi bằng ___ chân"',
                'data' => json_encode([
                    'correct_answers' => ['bốn', '4'],
                    'case_sensitive' => false,
                ]),
                'explanation' => 'Con mèo đi bằng bốn chân.',
                'created_by' => $teacher->id,
            ],

            // Matching - Toán Lớp 2
            [
                'subject_id' => 2,
                'type' => 'matching',
                'content' => 'Nối phép tính với kết quả đúng:',
                'data' => json_encode([
                    'left'  => ['2 + 3', '5 + 4', '10 - 3'],
                    'right' => ['5', '7', '9'],
                    // Index 0 (2+3) nối với index 0 (5)
                    // Index 1 (5+4) nối với index 2 (9)
                    // Index 2 (10-3) nối với index 1 (7)
                    'correct_matches' => [0, 2, 1],
                ]),
                'explanation' => '2+3=5, 5+4=9, 10-3=7',
                'created_by' => $teacher->id,
            ],

            // Table Fill - Toán Lớp 2
            // Quy ước: cột cuối cùng là đáp án học sinh cần điền vào
            [
                'subject_id' => 2,
                'type' => 'table_fill',
                'content' => 'Điền tổng còn thiếu vào bảng cộng:',
                'data' => json_encode([
                    'headers' => ['Số hạng 1', 'Số hạng 2', 'Tổng'],
                    'rows' => [
                        ['5', '3', '8'],
                        ['7', '2', '9'],
                        ['4', '6', '10'],
                    ],
                    'cols' => 3,
                ]),
                'explanation' => '5+3=8, 7+2=9, 4+6=10',
                'created_by' => $teacher->id,
            ],

            // MCQ - Tiếng Anh Lớp 1
            [
                'subject_id' => 6,
                'type' => 'mcq',
                'content' => 'What number is "Three"?',
                'data' => json_encode([
                    'options' => [
                        ['id' => 'a', 'text' => '1'],
                        ['id' => 'b', 'text' => '2'],
                        ['id' => 'c', 'text' => '3'],
                        ['id' => 'd', 'text' => '4'],
                    ],
                    'correct_answer' => 'c',
                ]),
                'explanation' => '"Three" có nghĩa là số 3.',
                'created_by' => $teacher->id,
            ],
        ];

        foreach ($questions as $question) {
            Question::create($question);
        }
    }
}
