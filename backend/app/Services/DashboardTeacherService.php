<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use App\Models\ClassModel;
use Illuminate\Support\Facades\DB;

class DashboardTeacherService
{
    public function getDashboardStats(int $teacherId): array
    {
        $stats = [
            'questions_count' => $this->getQuestionsCount($teacherId),
            'tests_count' => $this->getTestsCount($teacherId),
            'classes_count' => $this->getClassesCount($teacherId),
            'students_count' => $this->getStudentsCount($teacherId),
            'total_attempts' => $this->getTotalAttempts($teacherId),
            'average_score' => $this->getAverageScore($teacherId),
        ];

        return [
            'success' => true,
            'data' => $stats,
        ];
    }

    public function getRecentActivity(int $teacherId, int $limit = 10): array
    {
        $activities = [];

        $recentTests = Test::where('created_by', $teacherId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        foreach ($recentTests as $test) {
            $activities[] = [
                'type' => 'test_created',
                'title' => 'Tao bai kiem tra moi',
                'description' => $test->title,
                'timestamp' => $test->created_at,
            ];
        }

        $recentAttempts = TestAttempt::whereHas('test', function ($q) use ($teacherId) {
            $q->where('created_by', $teacherId);
        })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->with('user:id,name')
            ->get();

        foreach ($recentAttempts as $attempt) {
            $activities[] = [
                'type' => 'test_attempt',
                'title' => 'Hoc sinh lam bai',
                'description' => ($attempt->user->name ?? 'Unknown') . ' - ' . $attempt->score . ' diem',
                'timestamp' => $attempt->created_at,
            ];
        }

        usort($activities, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        return [
            'success' => true,
            'data' => array_slice($activities, 0, $limit),
        ];
    }

    public function getQuestionAnalytics(int $teacherId): array
    {
        $questions = Question::where('created_by', $teacherId)->get();

        $analytics = [
            'total' => $questions->count(),
            'by_type' => [
                'mcq' => $questions->where('type', 'mcq')->count(),
                'fill_blank' => $questions->where('type', 'fill_blank')->count(),
                'matching' => $questions->where('type', 'matching')->count(),
                'table_fill' => $questions->where('type', 'table_fill')->count(),
            ],
            'by_difficulty' => [
                'easy' => $questions->where('difficulty', 'easy')->count(),
                'medium' => $questions->where('difficulty', 'medium')->count(),
                'hard' => $questions->where('difficulty', 'hard')->count(),
            ],
            'most_used' => $this->getMostUsedQuestions($teacherId, 5),
        ];

        return [
            'success' => true,
            'data' => $analytics,
        ];
    }

    public function getStudentProgress(int $teacherId): array
    {
        $classIds = ClassModel::where('created_by', $teacherId)->pluck('id');

        $students = User::where('role', 'student')
            ->whereHas('classUsers', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            })
            ->with(['testAttempts' => function ($q) {
                $q->whereHas('test', function ($tq) use ($teacherId) {
                    $tq->where('created_by', $teacherId);
                });
            }])
            ->limit(20)
            ->get();

        $progress = $students->map(function ($student) {
            $attempts = $student->testAttempts;
            $avgScore = $attempts->isNotEmpty() ? $attempts->avg('score') : 0;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'total_attempts' => $attempts->count(),
                'average_score' => round($avgScore, 1),
                'last_activity' => $attempts->max('created_at'),
            ];
        });

        return [
            'success' => true,
            'data' => $progress,
        ];
    }

    private function getQuestionsCount(int $teacherId): int
    {
        return Question::where('created_by', $teacherId)->count();
    }

    private function getTestsCount(int $teacherId): int
    {
        return Test::where('created_by', $teacherId)->count();
    }

    private function getClassesCount(int $teacherId): int
    {
        return ClassModel::where('created_by', $teacherId)->count();
    }

    private function getStudentsCount(int $teacherId): int
    {
        $classIds = ClassModel::where('created_by', $teacherId)->pluck('id');

        return User::where('role', 'student')
            ->whereHas('classUsers', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            })
            ->count();
    }

    private function getTotalAttempts(int $teacherId): int
    {
        return TestAttempt::whereHas('test', function ($q) use ($teacherId) {
            $q->where('created_by', $teacherId);
        })->count();
    }

    private function getAverageScore(int $teacherId): float
    {
        $avg = TestAttempt::whereHas('test', function ($q) use ($teacherId) {
            $q->where('created_by', $teacherId);
        })->avg('score');

        return round($avg ?? 0, 1);
    }

    private function getMostUsedQuestions(int $teacherId, int $limit): array
    {
        return Question::where('created_by', $teacherId)
            ->withCount('testQuestions')
            ->orderBy('test_questions_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($q) => [
                'id' => $q->id,
                'content' => substr($q->content, 0, 50) . '...',
                'usage_count' => $q->test_questions_count,
            ])
            ->toArray();
    }
}
