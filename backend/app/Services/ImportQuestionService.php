<?php

namespace App\Services;

use App\Models\Question;
use App\Repositories\QuestionRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportQuestionService
{
    public function __construct(
        private readonly QuestionRepository $questionRepository
    ) {}

    public function importFromArray(array $data, int $creatorId): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        foreach ($data as $index => $item) {
            try {
                $this->validateQuestionData($item, $index);

                $questionData = [
                    'content' => $item['content'],
                    'type' => $item['type'] ?? 'mcq',
                    'difficulty' => $item['difficulty'] ?? 'medium',
                    'subject_id' => $item['subject_id'] ?? null,
                    'data' => $this->prepareQuestionData($item),
                    'explanation' => $item['explanation'] ?? null,
                    'created_by' => $creatorId,
                ];

                $this->questionRepository->create($questionData);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'row' => $index + 1,
                    'message' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    public function importFromCsv(string $filePath, int $creatorId): array
    {
        $data = $this->parseCsv($filePath);
        return $this->importFromArray($data, $creatorId);
    }

    public function importFromExcel(string $filePath, int $creatorId): array
    {
        $data = $this->parseExcel($filePath);
        return $this->importFromArray($data, $creatorId);
    }

    public function bulkImport(array $questions, int $creatorId): array
    {
        return DB::transaction(function () use ($questions, $creatorId) {
            return $this->importFromArray($questions, $creatorId);
        });
    }

    private function validateQuestionData(array $item, int $index): void
    {
        if (empty($item['content'])) {
            throw new \InvalidArgumentException("Row {$index}: Content is required");
        }

        $validTypes = ['mcq', 'fill_blank', 'matching', 'table_fill'];
        if (!empty($item['type']) && !in_array($item['type'], $validTypes)) {
            throw new \InvalidArgumentException("Row {$index}: Invalid question type");
        }
    }

    private function prepareQuestionData(array $item): array
    {
        $type = $item['type'] ?? 'mcq';

        return match ($type) {
            'mcq' => [
                'options' => $item['options'] ?? [],
                'correct_answer' => $item['correct_answer'] ?? 0,
            ],
            'fill_blank' => [
                'correct_answers' => $item['correct_answers'] ?? [],
            ],
            'matching' => [
                'left' => $item['left'] ?? [],
                'right' => $item['right'] ?? [],
                'correct_matches' => $item['correct_matches'] ?? [],
            ],
            'table_fill' => [
                'headers' => $item['headers'] ?? [],
                'rows' => $item['rows'] ?? [],
                'correct_answers' => $item['correct_answers'] ?? [],
            ],
            default => [],
        };
    }

    private function parseCsv(string $filePath): array
    {
        $data = [];
        $handle = fopen($filePath, 'r');

        if ($handle === false) {
            throw new \RuntimeException('Cannot open file: ' . $filePath);
        }

        $headers = fgetcsv($handle);
        while (($row = fgetcsv($handle)) !== false) {
            $item = array_combine($headers, $row);
            $data[] = $item;
        }

        fclose($handle);
        return $data;
    }

    private function parseExcel(string $filePath): array
    {
        throw new \RuntimeException('Excel parsing not implemented. Please use CSV format.');
    }
}
