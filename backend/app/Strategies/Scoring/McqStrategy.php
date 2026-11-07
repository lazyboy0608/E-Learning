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
        $correctAnswers = $questionData['data']['correct_answers']
            ?? (isset($questionData['data']['correct_answer']) ? (array) $questionData['data']['correct_answer'] : []);

        if (!is_array($correctAnswers)) {
            $correctAnswers = [$correctAnswers];
        }

        if (!is_array($answer)) {
            $answer = $answer !== null && $answer !== '' ? [$answer] : [];
        }

        $normalizedCorrect = array_values(array_filter(array_map(fn($v) => trim((string)$v), $correctAnswers)));
        $normalizedAnswer = array_values(array_filter(array_map(fn($v) => trim((string)$v), $answer)));

        sort($normalizedCorrect);
        sort($normalizedAnswer);

        return $normalizedCorrect === $normalizedAnswer;
    }

    public function getCorrectAnswer(array $questionData): mixed
    {
        return $questionData['data']['correct_answers']
            ?? (isset($questionData['data']['correct_answer']) ? (array) $questionData['data']['correct_answer'] : null);
    }
}
