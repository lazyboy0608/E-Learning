<?php

namespace App\Http\Requests\Test;

use Illuminate\Foundation\Http\FormRequest;

class SubmitTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attempt_id' => 'required|exists:test_attempts,id',
            'answers' => 'array',
            'answers.*' => 'nullable',
        ];
    }

    public function messages(): array
    {
        return [
            'attempt_id.required' => 'Thong tin buoc thi khong hop le.',
            'attempt_id.exists' => 'Buoc thi khong ton tai.',
            'answers.array' => 'Dap an phai la mot danh sach hop le.',
        ];
    }
}
