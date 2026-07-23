<?php

namespace App\Builders\Question;

use InvalidArgumentException;
use App\Builders\Question\Contracts\QuestionBuilderInterface;

class McqQuestionBuilder extends BaseQuestionBuilder implements QuestionBuilderInterface
{
    public function build(array $data): array
    {
        $questionData = $data['data'] ?? [];

        if (
            empty($questionData['options']) ||
            !is_array($questionData['options'])
        ) {
            throw new InvalidArgumentException(
                'MCQ yêu cầu options'
            );
        }

        if (
            empty($questionData['correct_answers']) ||
            !is_array($questionData['correct_answers'])
        ) {
            throw new InvalidArgumentException(
                'MCQ yêu cầu correct_answers'
            );
        }

        return [
            ...$this->buildCommonFields($data),

            'type' => 'mcq',

            'data' => [
                'options' => $questionData['options'],
                'correct_answers' => $questionData['correct_answers'],
            ]
        ];
    }
}