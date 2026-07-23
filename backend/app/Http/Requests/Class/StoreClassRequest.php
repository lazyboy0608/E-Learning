<?php

namespace App\Http\Requests\Class;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && in_array($user->role, ['teacher', 'admin']);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'class_code' => 'nullable|string|max:20|unique:classes,class_code',
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui long nhap ten lop.',
            'name.max' => 'Ten lop qua dai.',
            'class_code.unique' => 'Ma lop da ton tai.',
        ];
    }
}
