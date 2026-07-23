<?php

namespace App\Services;

use App\Models\QuestionProgress;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProgressChartService
{
    /**
     * Get practice progress over time
     */
    public function getPracticeProgress($userId, $days = 30)
    {
        $startDate = Carbon::now()->subDays($days);

        $progress = QuestionProgress::where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_attempts'),
                DB::raw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return $progress->map(function ($item) {
            $successRate = $item->total_attempts > 0
                ? round(($item->correct_count / $item->total_attempts) * 100, 2)
                : 0;

            return [
                'date' => $item->date,
                'total_attempts' => $item->total_attempts,
                'correct' => $item->correct_count,
                'wrong' => $item->total_attempts - $item->correct_count,
                'success_rate' => $successRate,
            ];
        });
    }

    /**
     * Get test performance over time
     */
    public function getTestProgress($userId, $days = 30)
    {
        $startDate = Carbon::now()->subDays($days);

        $tests = TestAttempt::where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->where('status', 'completed')
            ->orderBy('submitted_at', 'asc')
            ->select('id', 'test_id', 'score', 'submitted_at')
            ->with('test:id,name')
            ->get();

        return $tests->map(function ($test) {
            return [
                'test_id' => $test->test_id,
                'test_name' => $test->test->name ?? 'Unknown Test',
                'score' => $test->score,
                'submitted_at' => $test->submitted_at,
            ];
        });
    }

    /**
     * Get overall statistics
     */
    public function getOverallStats($userId)
    {
        $totalAttempts = QuestionProgress::where('user_id', $userId)->count();
        $correctAttempts = QuestionProgress::where('user_id', $userId)
            ->where('is_correct', 1)
            ->count();

        $totalTests = TestAttempt::where('user_id', $userId)
            ->where('status', 'completed')
            ->count();

        $avgTestScore = TestAttempt::where('user_id', $userId)
            ->where('status', 'completed')
            ->avg('score') ?? 0;

        $overallSuccessRate = $totalAttempts > 0
            ? round(($correctAttempts / $totalAttempts) * 100, 2)
            : 0;

        return [
            'total_attempts' => $totalAttempts,
            'correct_attempts' => $correctAttempts,
            'wrong_attempts' => $totalAttempts - $correctAttempts,
            'overall_success_rate' => $overallSuccessRate,
            'total_tests_completed' => $totalTests,
            'avg_test_score' => round($avgTestScore, 2),
        ];
    }

    /**
     * Get progress by subject
     */
    public function getProgressBySubject($userId, $days = 30)
    {
        $startDate = Carbon::now()->subDays($days);

        $subjectProgress = DB::table('question_progress')
            ->where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->join('questions', 'question_progress.question_id', '=', 'questions.id')
            ->join('subjects', 'questions.subject_id', '=', 'subjects.id')
            ->select(
                'subjects.id',
                'subjects.name',
                DB::raw('COUNT(*) as total_attempts'),
                DB::raw('SUM(CASE WHEN question_progress.is_correct = 1 THEN 1 ELSE 0 END) as correct_count')
            )
            ->groupBy('subjects.id', 'subjects.name')
            ->get();

        return $subjectProgress->map(function ($subject) {
            $successRate = $subject->total_attempts > 0
                ? round(($subject->correct_count / $subject->total_attempts) * 100, 2)
                : 0;

            return [
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'total_attempts' => $subject->total_attempts,
                'correct' => $subject->correct_count,
                'wrong' => $subject->total_attempts - $subject->correct_count,
                'success_rate' => $successRate,
            ];
        })->sortByDesc('success_rate');
    }

    /**
     * Get trend analysis
     */
    public function getTrendAnalysis($userId, $days = 30)
    {
        $startDate = Carbon::now()->subDays($days);

        // First half period
        $midDate = Carbon::now()->subDays($days / 2);

        $firstHalf = QuestionProgress::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $midDate])
            ->where('is_correct', 1)
            ->count();

        $firstHalfTotal = QuestionProgress::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $midDate])
            ->count();

        // Second half period
        $secondHalf = QuestionProgress::where('user_id', $userId)
            ->whereBetween('created_at', [$midDate, now()])
            ->where('is_correct', 1)
            ->count();

        $secondHalfTotal = QuestionProgress::where('user_id', $userId)
            ->whereBetween('created_at', [$midDate, now()])
            ->count();

        $firstHalfRate = $firstHalfTotal > 0
            ? round(($firstHalf / $firstHalfTotal) * 100, 2)
            : 0;

        $secondHalfRate = $secondHalfTotal > 0
            ? round(($secondHalf / $secondHalfTotal) * 100, 2)
            : 0;

        $trend = $secondHalfRate - $firstHalfRate;
        $improving = $trend > 0;

        return [
            'first_half_rate' => $firstHalfRate,
            'second_half_rate' => $secondHalfRate,
            'trend' => round($trend, 2),
            'improving' => $improving,
            'trend_message' => $improving 
                ? "Great! Your score improved by {$trend}%"
                : "Your score decreased by " . abs($trend) . "%",
        ];
    }

    /**
     * Get comprehensive progress data
     */
    public function getCompleteProgress($userId, $days = 30)
    {
        return [
            'overall_stats' => $this->getOverallStats($userId),
            'practice_progress' => $this->getPracticeProgress($userId, $days),
            'test_progress' => $this->getTestProgress($userId, $days),
            'progress_by_subject' => $this->getProgressBySubject($userId, $days),
            'trend_analysis' => $this->getTrendAnalysis($userId, $days),
        ];
    }
}
