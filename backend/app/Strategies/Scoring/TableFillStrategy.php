<?php

namespace App\Strategies\Scoring;

class TableFillStrategy implements ScoringStrategyInterface
{
    public function calculateScore(array $questionData, mixed $answer): float
    {
        $correctAnswers = $questionData['data']['correct_answers'] ?? [];

        if (!is_array($answer) || !is_array($correctAnswers)) {
            return 0.0;
        }

        $correctCount = 0;
        $totalCells = 0;

        foreach ($correctAnswers as $rowIndex => $colData) {
            $totalCells++;
            $userAnswer = $answer[$rowIndex] ?? '';
            $correctValues = is_array($colData) ? array_values($colData) : [$colData];
            $correct = $correctValues[0] ?? '';
            if (mb_strtolower(trim($userAnswer)) === mb_strtolower(trim($correct))) {
                $correctCount++;
            }
        }

        return $totalCells > 0 ? $correctCount / $totalCells : 0.0;
    }

    public function isCorrect(array $questionData, mixed $answer): bool
    {
        $correctAnswers = $questionData['data']['correct_answers'] ?? [];
        if (!is_array($answer) || !is_array($correctAnswers)) {
            return false;
        }
        foreach ($correctAnswers as $rowIndex => $colData) {
            $userAnswer = $answer[$rowIndex] ?? '';
            $correctValues = is_array($colData) ? array_values($colData) : [$colData];
            $correct = $correctValues[0] ?? '';
            if (mb_strtolower(trim($userAnswer)) !== mb_strtolower(trim($correct))) {
                return false;
            }
        }
        return true;
    }

    public function getCorrectAnswer(array $questionData): mixed
    {
        return $questionData['data']['correct_answers'] ?? [];
    }
}
