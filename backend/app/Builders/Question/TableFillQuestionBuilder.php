<?php

namespace App\Builders\Question;

use InvalidArgumentException;
use App\Builders\Question\Contracts\QuestionBuilderInterface;

class TableFillQuestionBuilder extends BaseQuestionBuilder
    implements QuestionBuilderInterface
{
    public function build(array $data): array
    {
        $questionData = $data['data'] ?? [];

        $headers = $questionData['headers'] ?? null;
        $rows = $questionData['rows'] ?? null;
        $cols = $questionData['cols'] ?? null;

        if (
            empty($headers) ||
            !is_array($headers)
        ) {
            throw new InvalidArgumentException(
                'Table Fill yêu cầu headers'
            );
        }

        if (
            empty($rows) ||
            !is_array($rows)
        ) {
            throw new InvalidArgumentException(
                'Table Fill yêu cầu rows'
            );
        }

        if (
            $cols === null ||
            !is_numeric($cols)
        ) {
            throw new InvalidArgumentException(
                'Table Fill yêu cầu cols'
            );
        }

        $cols = (int) $cols;

        if ($cols <= 0) {
            throw new InvalidArgumentException(
                'cols phải lớn hơn 0'
            );
        }

        if (
            count($headers) !== $cols
        ) {
            throw new InvalidArgumentException(
                'Số lượng headers phải bằng cols'
            );
        }

        foreach ($rows as $rowIndex => $row) {

            if (!is_array($row)) {
                throw new InvalidArgumentException(
                    "Row {$rowIndex} không hợp lệ"
                );
            }

            if (
                count($row) !== $cols
            ) {
                throw new InvalidArgumentException(
                    "Row {$rowIndex} phải có {$cols} cột"
                );
            }
        }

        $leftColumn = array_column($rows, 0);
        $rightColumn = array_column($rows, $cols - 1);
        $correctAnswers = [];
        foreach ($rows as $rowIndex => $row) {
            $correctAnswers[$rowIndex] = $row[$cols - 1];
        }

        return [
            ...$this->buildCommonFields($data),

            'type' => 'table_fill',

            'data' => [
                'headers' => $headers,
                'rows' => $rows,
                'cols' => $cols,
                'left_column' => $leftColumn,
                'right_column' => $rightColumn,
                'correct_answers' => $correctAnswers,
            ]
        ];
    }
}