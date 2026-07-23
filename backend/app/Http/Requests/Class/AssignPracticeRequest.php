<?php

namespace App\Http\Requests\Class;

use Illuminate\Foundation\Http\FormRequest;

class AssignPracticeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'practice_id' => 'required|integer|exists:practices,id',
        ];
    }

    public function messages(): array
    {
        return [
            'practice_id.required' => 'Vui long cung cap thong tin bai on tap.',
            'practice_id.exists' => 'Bai on tap khong ton tai.',
        ];
    }
}
