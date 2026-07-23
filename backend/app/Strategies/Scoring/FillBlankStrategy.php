<?php

namespace App\Strategies\Scoring;

class FillBlankStrategy implements ScoringStrategyInterface
{
    public function calculateScore(array $questionData, mixed $answer): float
    {
        $data = $questionData['data'] ?? [];
        $correctAnswers = $data['correct_answers'] ?? [];
        $caseSensitive = $data['case_sensitive'] ?? false;

        if (!is_array($answer) || !is_array($correctAnswers) || count($answer) !== count($correctAnswers)) {
            return 0.0;
        }

        $correctCount = 0;
        foreach ($correctAnswers as $index => $correct) {
            $userAnswer = $answer[$index] ?? '';
            $userAnswer = $caseSensitive ? $userAnswer : mb_strtolower(trim($userAnswer));
            $correct = $caseSensitive ? $correct : mb_strtolower(trim($correct));

            if ($userAnswer === $correct) {
                $correctCount++;
            }
        }

        return count($correctAnswers) > 0 ? $correctCount / count($correctAnswers) : 0.0;
    }

    public function isCorrect(array $questionData, mixed $answer): bool
    {
        return $this->calculateScore($questionData, $answer) === 1.0;
    }

    public function getCorrectAnswer(array $questionData): mixed
    {
        return $questionData['data']['correct_answers'] ?? [];
    }
}
