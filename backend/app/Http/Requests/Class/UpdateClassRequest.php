<?php

namespace App\Http\Requests\Class;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $classId = $this->route('class');

        return [
            'name' => 'sometimes|required|string|max:255',
            'class_code' => 'sometimes|nullable|string|max:20|unique:classes,class_code,' . $classId,
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
