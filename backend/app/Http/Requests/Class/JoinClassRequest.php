<?php

namespace App\Http\Requests\Class;

use Illuminate\Foundation\Http\FormRequest;

class JoinClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'class_code' => 'required|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'class_code.required' => 'Vui long nhap ma lop.',
        ];
    }
}
