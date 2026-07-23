<?php

namespace App\Builders\Question;

use InvalidArgumentException;
use App\Builders\Question\Contracts\QuestionBuilderInterface;

class FillBlankQuestionBuilder extends BaseQuestionBuilder implements QuestionBuilderInterface
{
    public function build(array $data): array
    {
        $questionData = $data['data'] ?? [];

        if (
            empty($questionData['correct_answers'])
        ) {
            throw new InvalidArgumentException(
                'FillBlank yêu cầu correct_answers'
            );
        }

        return [
            ...$this->buildCommonFields($data),

            'type' => 'fill_blank',

            'data' => [
                'correct_answers'
                    => $questionData['correct_answers']
            ]
        ];
    }
}