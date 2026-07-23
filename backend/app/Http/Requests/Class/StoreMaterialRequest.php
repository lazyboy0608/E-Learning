<?php

namespace App\Http\Requests\Class;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'file_url' => 'required|string|max:500',
            'type' => 'required|in:pdf,video,link,document,other',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Vui long nhap tieu de tai lieu.',
            'file_url.required' => 'Vui long cung cap duong dan tai lieu.',
            'type.required' => 'Vui long chon loai tai lieu.',
            'type.in' => 'Loai tai lieu khong hop le.',
        ];
    }
}
