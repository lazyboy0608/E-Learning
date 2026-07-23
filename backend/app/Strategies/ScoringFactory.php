<?php

namespace App\Strategies;

use App\Strategies\Scoring\McqStrategy;
use App\Strategies\Scoring\FillBlankStrategy;
use App\Strategies\Scoring\MatchingStrategy;
use App\Strategies\Scoring\TableFillStrategy;

class ScoringFactory
{
    private array $strategies = [
        'mcq' => McqStrategy::class,
        'fill_blank' => FillBlankStrategy::class,
        'matching' => MatchingStrategy::class,
        'table_fill' => TableFillStrategy::class,
    ];

    public function make(string $type): object
    {
        $strategyClass = $this->strategies[$type] ?? null;

        if (!$strategyClass) {
            throw new \InvalidArgumentException("Unknown question type: {$type}");
        }

        return new $strategyClass();
    }

    public function calculateScore(string $type, array $questionData, mixed $answer): float
    {
        return $this->make($type)->calculateScore($questionData, $answer);
    }

    public function isCorrect(string $type, array $questionData, mixed $answer): bool
    {
        return $this->make($type)->isCorrect($questionData, $answer);
    }

    public function getCorrectAnswer(string $type, array $questionData): mixed
    {
        return $this->make($type)->getCorrectAnswer($questionData);
    }
}
