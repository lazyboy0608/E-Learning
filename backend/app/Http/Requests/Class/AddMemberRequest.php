<?php

namespace App\Http\Requests\Class;

use Illuminate\Foundation\Http\FormRequest;

class AddMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Vui long cung cap thong tin nguoi dung.',
            'user_id.exists' => 'Nguoi dung khong ton tai.',
        ];
    }
}
