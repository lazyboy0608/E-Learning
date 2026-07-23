<?php

namespace App\Builders\Question;

use InvalidArgumentException;
use App\Builders\Question\Contracts\QuestionBuilderInterface;

class QuestionBuilderFactory
{
    public function make(
        string $type
    ): QuestionBuilderInterface {

        return match ($type) {

            'mcq'
                => app(McqQuestionBuilder::class),

            'fill_blank'
                => app(FillBlankQuestionBuilder::class),

            'matching'
                => app(MatchingQuestionBuilder::class),

            'table_fill'
                => app(TableFillQuestionBuilder::class),

            default
                => throw new InvalidArgumentException(
                    'Unsupported question type'
                ),
        };
    }
}