<?php

namespace App\Builders\Question;

use InvalidArgumentException;
use App\Builders\Question\Contracts\QuestionBuilderInterface;

class MatchingQuestionBuilder extends BaseQuestionBuilder
    implements QuestionBuilderInterface
{
    public function build(array $data): array
    {
        $questionData = $data['data'] ?? [];

        $left = $questionData['left'] ?? null;
        $right = $questionData['right'] ?? null;
        $correctMatches = $questionData['correct_matches'] ?? null;

        if (
            empty($left) ||
            !is_array($left)
        ) {
            throw new InvalidArgumentException(
                'Matching yêu cầu mảng left'
            );
        }

        if (
            empty($right) ||
            !is_array($right)
        ) {
            throw new InvalidArgumentException(
                'Matching yêu cầu mảng right'
            );
        }

        if (
            empty($correctMatches) ||
            !is_array($correctMatches)
        ) {
            throw new InvalidArgumentException(
                'Matching yêu cầu mảng correct_matches'
            );
        }

        if (
            count($left) !== count($correctMatches)
        ) {
            throw new InvalidArgumentException(
                'Số lượng left phải bằng số lượng correct_matches'
            );
        }

        foreach ($correctMatches as $leftIdx => $index) {

            if (!is_numeric($leftIdx) || (int) $leftIdx < 0 || (int) $leftIdx >= count($left)) {
                throw new InvalidArgumentException(
                    "Khóa '{$leftIdx}' của correct_matches phải là index hợp lệ của mảng left"
                );
            }

            if (!is_int($index)) {
                throw new InvalidArgumentException(
                    'correct_matches phải chứa index dạng số nguyên'
                );
            }

            if (
                $index < 0 ||
                $index >= count($right)
            ) {
                throw new InvalidArgumentException(
                    'correct_matches chứa index không hợp lệ'
                );
            }
        }

        return [
            ...$this->buildCommonFields($data),

            'type' => 'matching',

            'data' => [
                'left' => $left,
                'right' => $right,
                'correct_matches' => $correctMatches,
            ]
        ];
    }
}