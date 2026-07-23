<?php

namespace App\Http\Requests\Class;

use Illuminate\Foundation\Http\FormRequest;

class AssignTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'test_id' => 'required|integer|exists:tests,id',
        ];
    }

    public function messages(): array
    {
        return [
            'test_id.required' => 'Vui long cung cap thong tin bai kiem tra.',
            'test_id.exists' => 'Bai kiem tra khong ton tai.',
        ];
    }
}
