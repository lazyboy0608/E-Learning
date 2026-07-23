<?php

namespace App\Strategies\Scoring;

class McqStrategy implements ScoringStrategyInterface
{
    public function calculateScore(array $questionData, mixed $answer): float
    {
        return $this->isCorrect($questionData, $answer) ? 1.0 : 0.0;
    }

    public function isCorrect(array $questionData, mixed $answer): bool
    {
        $correctAnswers = $questionData['data']['correct_answers'] ?? [];

        if (!is_array($correctAnswers)) {
            return false;
        }

        if (!is_array($answer)) {
            $answer = [$answer];
        }

        sort($correctAnswers);
        sort($answer);

        return $correctAnswers === $answer;
    }

    public function getCorrectAnswer(array $questionData): mixed
    {
        return $questionData['data']['correct_answers'] ?? null;
    }
}
