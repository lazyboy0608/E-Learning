<?php

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;

class CreateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['teacher', 'admin']);
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'type' => ['required', 'in:mcq,fill_blank,matching,table_fill'],
            'content' => ['required', 'string', 'max:1000'],
            'media_image' => ['nullable', 'string', 'max:500'],
            'media_audio' => ['nullable', 'string', 'max:500'],
            'data' => ['required', 'array'],
            'explanation' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.in' => 'Loại câu hỏi không hợp lệ. Chỉ chấp nhận: mcq, fill_blank, matching, table_fill',
            'subject_id.exists' => 'Môn học không tồn tại',
            'data.required' => 'Vui lòng cung cấp dữ liệu câu hỏi',
        ];
    }
}
