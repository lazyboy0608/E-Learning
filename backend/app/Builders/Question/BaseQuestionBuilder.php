<?php

namespace App\Builders\Question;

abstract class BaseQuestionBuilder
{
    protected function buildCommonFields(array $data): array
    {
        return [
            'subject_id' => $data['subject_id'],
            'content' => $data['content'],
            'media_image' => $data['media_image'] ?? null,
            'media_audio' => $data['media_audio'] ?? null,
            'explanation' => $data['explanation'] ?? null,
            'created_by' => $data['created_by'],
            'scope' => $data['scope'],
        ];
    }
}