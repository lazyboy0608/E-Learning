<?php

namespace App\Services;

use App\Models\TestAttempt;
use Illuminate\Support\Facades\DB;

class ReviewAnswerService
{
    /**
     * Get detailed review of test answers
     */
    public function getTestReview($attemptId, $userId)
    {
        $attempt = TestAttempt::where('id', $attemptId)
            ->where('user_id', $userId)
            ->first();

        if (!$attempt) {
            return null;
        }

        $answers = DB::table('test_answers')
            ->where('test_attempt_id', $attemptId)
            ->join('questions', 'test_answers.question_id', '=', 'questions.id')
            ->select(
                'test_answers.id as answer_id',
                'questions.id',
                'questions.content',
                'questions.correct_answer',
                'questions.explanation',
                'questions.question_type',
                'questions.option_a',
                'questions.option_b',
                'questions.option_c',
                'questions.option_d',
                'test_answers.student_answer',
                'test_answers.is_correct'
            )
            ->get();

        $reviewData = [
            'attempt_id' => $attempt->id,
            'test_id' => $attempt->test_id,
            'score' => $attempt->score,
            'submitted_at' => $attempt->submitted_at,
            'created_at' => $attempt->created_at,
            'answers' => $answers->map(function ($answer) {
                return [
                    'answer_id' => $answer->answer_id,
                    'question_id' => $answer->id,
                    'question_content' => $answer->content,
                    'question_type' => $answer->question_type,
                    'student_answer' => $answer->student_answer,
                    'correct_answer' => $answer->correct_answer,
                    'is_correct' => (bool)$answer->is_correct,
                    'explanation' => $answer->explanation,
                    'options' => $this->getQuestionOptions($answer),
                ];
            }),
        ];

        return $reviewData;
    }

    /**
     * Get question options based on type
     */
    private function getQuestionOptions($answer)
    {
        if ($answer->question_type !== 'multiple_choice') {
            return [];
        }

        return [
            'A' => $answer->option_a,
            'B' => $answer->option_b,
            'C' => $answer->option_c,
            'D' => $answer->option_d,
        ];
    }

    /**
     * Get statistics for an answer review
     */
    public function getReviewStatistics($attemptId)
    {
        $answers = DB::table('test_answers')
            ->where('test_attempt_id', $attemptId)
            ->get();

        $totalQuestions = $answers->count();
        $correctAnswers = $answers->where('is_correct', 1)->count();
        $wrongAnswers = $answers->where('is_correct', 0)->count();

        $correctPercentage = $totalQuestions > 0 
            ? round(($correctAnswers / $totalQuestions) * 100, 2)
            : 0;

        return [
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctAnswers,
            'wrong_answers' => $wrongAnswers,
            'correct_percentage' => $correctPercentage,
            'wrong_percentage' => 100 - $correctPercentage,
        ];
    }

    /**
     * Get comparison with class average
     */
    public function getClassComparison($attemptId, $testId)
    {
        $attempt = TestAttempt::find($attemptId);
        
        // Get average score for this test in the class
        $classAverage = DB::table('test_attempts')
            ->where('test_id', $testId)
            ->avg('score');

        // Get student's percentile rank
        $betterScores = DB::table('test_attempts')
            ->where('test_id', $testId)
            ->where('score', '>', $attempt->score)
            ->count();

        $totalAttempts = DB::table('test_attempts')
            ->where('test_id', $testId)
            ->count();

        $percentileRank = $totalAttempts > 0 
            ? round((($totalAttempts - $betterScores) / $totalAttempts) * 100, 2)
            : 0;

        return [
            'student_score' => $attempt->score,
            'class_average' => round($classAverage ?? 0, 2),
            'above_average' => $attempt->score > ($classAverage ?? 0),
            'score_difference' => round($attempt->score - ($classAverage ?? 0), 2),
            'percentile_rank' => $percentileRank,
        ];
    }

    /**
     * Get weak areas from this test
     */
    public function getWeakAreas($attemptId)
    {
        $wrongAnswers = DB::table('test_answers')
            ->where('test_attempt_id', $attemptId)
            ->where('is_correct', 0)
            ->join('questions', 'test_answers.question_id', '=', 'questions.id')
            ->select('questions.subject_id', 'questions.content')
            ->get();

        $weakAreas = $wrongAnswers->groupBy('subject_id')
            ->map(function ($items) {
                return [
                    'subject_id' => $items[0]->subject_id,
                    'wrong_count' => $items->count(),
                    'questions' => $items->pluck('content')->toArray(),
                ];
            });

        return $weakAreas;
    }
}
