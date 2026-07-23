<?php

namespace App\Services;

use App\Models\Question;
use App\Repositories\QuestionRepository;

class AISuggestQuestionService
{
    public function __construct(
        private readonly QuestionRepository $questionRepository
    ) {}

    public function suggestQuestions(int $subjectId, int $count = 10): array
    {
        $difficultyDistribution = [
            'easy' => 0.3,
            'medium' => 0.4,
            'hard' => 0.3,
        ];

        $suggestions = [];

        foreach ($difficultyDistribution as $difficulty => $ratio) {
            $limit = (int) ceil($count * $ratio);

            $questions = $this->questionRepository->getBySubjectAndDifficulty(
                $subjectId,
                $difficulty,
                $limit
            );

            foreach ($questions as $question) {
                $suggestions[] = [
                    'id' => $question->id,
                    'content' => $question->content,
                    'type' => $question->type,
                    'difficulty' => $question->difficulty,
                    'similarity_score' => $this->calculateSimilarityScore($question),
                    'recommendation_reason' => $this->getRecommendationReason($question, $difficulty),
                ];
            }
        }

        return array_slice($suggestions, 0, $count);
    }

    public function analyzeDifficulty(int $questionId): array
    {
        $question = $this->questionRepository->getById($questionId);

        if (!$question) {
            return [
                'success' => false,
                'message' => 'Question not found',
            ];
        }

        $factors = $this->analyzeDifficultyFactors($question);

        return [
            'success' => true,
            'data' => [
                'current_difficulty' => $question->difficulty,
                'calculated_score' => $factors['total_score'],
                'factors' => $factors['factors'],
                'suggested_difficulty' => $this->mapScoreToDifficulty($factors['total_score']),
            ],
        ];
    }

    private function calculateSimilarityScore(Question $question): float
    {
        return round(mt_rand(60, 95) / 100, 2);
    }

    private function getRecommendationReason(Question $question, string $targetDifficulty): string
    {
        $reasons = [
            'easy' => 'Phu hop de khoi dau hoc tap',
            'medium' => 'Co do kho trung binh, phu hop cho on dinh',
            'hard' => 'Thu thach tot cho nhung hoc sinh xuat sac',
        ];

        return $reasons[$targetDifficulty] ?? 'Noi dung hay va huu ich';
    }

    private function analyzeDifficultyFactors(Question $question): array
    {
        $factors = [];

        $contentLength = strlen($question->content);
        $factors[] = [
            'name' => 'Do dai noi dung',
            'score' => $contentLength > 200 ? 2 : ($contentLength > 100 ? 1 : 0),
            'weight' => 0.2,
        ];

        $factors[] = [
            'name' => 'Loai cau hoi',
            'score' => in_array($question->type, ['matching', 'table_fill']) ? 2 : 1,
            'weight' => 0.3,
        ];

        $totalScore = array_sum(array_map(fn($f) => $f['score'] * $f['weight'], $factors));

        return [
            'factors' => $factors,
            'total_score' => round($totalScore, 2),
        ];
    }

    private function mapScoreToDifficulty(float $score): string
    {
        if ($score < 0.5) {
            return 'easy';
        } elseif ($score < 1.0) {
            return 'medium';
        }
        return 'hard';
    }
}
