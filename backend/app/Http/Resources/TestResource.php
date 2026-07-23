<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subject_id' => $this->subject_id,
            'subject' => $this->whenLoaded('subject', function () {
                return [
                    'id' => $this->subject->id,
                    'name' => $this->subject->name,
                    'class_level' => $this->subject->class_level,
                ];
            }),
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'test_code' => $this->test_code,
            'access_type' => $this->access_type,
            'scope' => $this->scope,
            'is_active' => $this->is_active,
            'expires_at' => $this->expires_at ? $this->expires_at->toIso8601String() : null,
            'max_attempts' => $this->max_attempts,
            'duration' => $this->duration,
            'questions_count' => $this->questions_count ?? $this->whenLoaded('questions', function () {
                return $this->questions->count();
            }),
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
