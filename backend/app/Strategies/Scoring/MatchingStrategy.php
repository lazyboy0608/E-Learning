<?php

namespace App\Strategies\Scoring;

class MatchingStrategy implements ScoringStrategyInterface
{
    public function calculateScore(array $questionData, mixed $answer): float
    {
        $correctMatches = $questionData['data']['correct_matches'] ?? [];

        if (!is_array($answer) || !is_array($correctMatches) || count($answer) !== count($correctMatches)) {
            return 0.0;
        }

        $correctCount = 0;
        foreach ($correctMatches as $leftId => $rightId) {
            if (isset($answer[$leftId]) && (string)$answer[$leftId] === (string)$rightId) {
                $correctCount++;
            }
        }

        return count($correctMatches) > 0 ? $correctCount / count($correctMatches) : 0.0;
    }

    public function isCorrect(array $questionData, mixed $answer): bool
    {
        return $this->calculateScore($questionData, $answer) === 1.0;
    }

    public function getCorrectAnswer(array $questionData): mixed
    {
        return $questionData['data']['correct_matches'] ?? [];
    }
}
