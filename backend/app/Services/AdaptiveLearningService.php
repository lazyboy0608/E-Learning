<?php

namespace App\Services;

use App\Models\QuestionProgress;
use App\Models\Question;
use Illuminate\Support\Facades\DB;

class AdaptiveLearningService
{
    /**
     * Analyze student's weak areas based on question progress
     */
    public function analyzeWeakAreas($userId)
    {
        $progress = QuestionProgress::where('user_id', $userId)
            ->select('subject_id', DB::raw('COUNT(*) as attempt_count'), 
                     DB::raw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count'))
            ->groupBy('subject_id')
            ->get();

        $weakAreas = $progress->map(function ($item) {
            $successRate = $item->attempt_count > 0 
                ? ($item->correct_count / $item->attempt_count) * 100 
                : 0;

            return [
                'subject_id' => $item->subject_id,
                'attempts' => $item->attempt_count,
                'correct' => $item->correct_count,
                'success_rate' => round($successRate, 2),
                'weakness_level' => $successRate < 50 ? 'high' : ($successRate < 75 ? 'medium' : 'low'),
            ];
        })->sortBy('success_rate');

        return $weakAreas;
    }

    /**
     * Get next recommended question based on weak areas
     */
    public function getNextRecommendedQuestion($userId, $limit = 1)
    {
        $weakAreas = $this->analyzeWeakAreas($userId);

        if ($weakAreas->isEmpty()) {
            // If no history, return random question
            return Question::inRandomOrder()->limit($limit)->get();
        }

        // Get questions from weak areas
        $weakSubjects = $weakAreas->pluck('subject_id')->toArray();

        $recommendedQuestions = Question::whereIn('subject_id', $weakSubjects)
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        return $recommendedQuestions;
    }

    /**
     * Calculate frequency boost for weak topics
     * Higher frequency for frequently wrong questions
     */
    public function calculateQuestionFrequency($userId, $questionId)
    {
        $progress = QuestionProgress::where('user_id', $userId)
            ->where('question_id', $questionId)
            ->get();

        if ($progress->isEmpty()) {
            return 1; // Default frequency
        }

        $wrongCount = $progress->where('is_correct', 0)->count();
        $totalCount = $progress->count();
        $errorRate = $wrongCount / $totalCount;

        // Frequency boost: higher error rate = higher frequency
        return 1 + ($errorRate * 3); // Max 4x frequency
    }
}
