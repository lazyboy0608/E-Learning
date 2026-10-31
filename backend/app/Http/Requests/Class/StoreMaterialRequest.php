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
            'type' => 'required|in:pdf,video,link,document,other',
            'file' => 'nullable|file|mimes:pdf|max:20480', // 20MB
            'file_url' => 'nullable|string|max:500',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $type = $this->input('type');
            $hasFile = $this->hasFile('file');
            $hasUrl = !empty($this->input('file_url'));

            if ($type === 'pdf' && !$hasFile && !$hasUrl) {
                $validator->errors()->add('file', 'Vui lòng tải lên tệp PDF hoặc cung cấp đường dẫn tài liệu.');
            }

            if ($type !== 'pdf' && !$hasFile && !$hasUrl) {
                $validator->errors()->add('file_url', 'Vui lòng cung cấp đường dẫn tài liệu.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Vui lòng nhập tiêu đề tài liệu.',
            'type.required' => 'Vui lòng chọn loại tài liệu.',
            'type.in' => 'Loại tài liệu không hợp lệ.',
            'file.mimes' => 'Tệp tải lên phải có định dạng PDF.',
            'file.max' => 'Dung lượng tệp PDF không được vượt quá 20MB.',
        ];
    }
}
