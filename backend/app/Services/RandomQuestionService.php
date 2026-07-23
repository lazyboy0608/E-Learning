<?php

namespace App\Services;

use App\Models\Question;
use Illuminate\Support\Facades\DB;

class RandomQuestionService
{
    /**
     * Shuffle questions for a test
     * Each student gets a different order
     */
    public function shuffleQuestions($testId)
    {
        $questions = DB::table('test_question')
            ->where('test_id', $testId)
            ->join('questions', 'test_question.question_id', '=', 'questions.id')
            ->get();

        // Shuffle questions
        $shuffled = $questions->shuffle();

        return $shuffled;
    }

    /**
     * Shuffle answers for a question
     * Prevent memorizing answer positions
     */
    public function shuffleAnswers($question)
    {
        if ($question->question_type === 'multiple_choice') {
            $answers = [
                $question->correct_answer,
                $question->option_a,
                $question->option_b,
                $question->option_c,
            ];
            
            shuffle($answers);
            
            return $answers;
        }

        return [$question->correct_answer];
    }

    /**
     * Get randomized questions with shuffled answers for a test attempt
     */
    public function getRandomizedTest($testId)
    {
        $questions = $this->shuffleQuestions($testId);

        return $questions->map(function ($question) {
            return [
                'id' => $question->id,
                'content' => $question->content,
                'type' => $question->question_type,
                'answers' => $this->shuffleAnswers($question),
                'explanation' => $question->explanation,
            ];
        });
    }
}
