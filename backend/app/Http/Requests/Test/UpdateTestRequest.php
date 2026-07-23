<?php

namespace App\Http\Requests\Test;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $testId = $this->route('id');

        return [
            'title' => 'sometimes|string|max:255',
            'subject_id' => 'sometimes|exists:subjects,id',
            'test_code' => 'nullable|string|max:20|unique:tests,test_code,' . $testId,
            'access_type' => 'nullable|in:public_code,class_only,both',
            'is_active' => 'nullable|boolean',
            'expires_at' => 'nullable|date',
            'max_attempts' => 'nullable|integer|min:1',
            'duration' => 'nullable|integer|min:1',
            'class_ids' => [
                'nullable',
                'array',
            ],
            'class_ids.*' => [
                'exists:classes,id'
            ],
            'question_ids' => 'sometimes|array|min:1',
            'question_ids.*' => 'required|exists:questions,id',
            'question_scores' => 'nullable|array',
            'question_scores.*' => 'nullable|numeric|min:0',
        ];
    }
}
