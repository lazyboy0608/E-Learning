<?php

namespace App\Strategies\Scoring;

interface ScoringStrategyInterface
{
    public function calculateScore(array $questionData, mixed $answer): float;
    public function isCorrect(array $questionData, mixed $answer): bool;
    public function getCorrectAnswer(array $questionData): mixed;
}
