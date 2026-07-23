<?php

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['teacher', 'admin']);
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'type' => ['sometimes', 'in:mcq,fill_blank,matching,table_fill'],
            'content' => ['sometimes', 'string', 'max:1000'],
            'media_image' => ['nullable', 'string', 'max:500'],
            'media_audio' => ['nullable', 'string', 'max:500'],
            'data' => ['sometimes', 'array'],
            'explanation' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
