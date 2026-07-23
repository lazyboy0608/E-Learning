<?php

namespace App\Http\Requests\Test;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'subject_id' => 'required|exists:subjects,id',
            'test_code' => 'nullable|string|max:20|unique:tests,test_code',
            'access_type' => 'nullable|in:public_code,class_only,both',
            'is_active' => 'nullable|boolean',
            'expires_at' => 'nullable|date|after:now',
            'max_attempts' => 'nullable|integer|min:1',
            'duration' => 'nullable|integer|min:1',
            'class_ids' => [
                'nullable',
                'array',
            ],

            'class_ids.*' => [
                'exists:classes,id'
            ],
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'required|exists:questions,id',
            'question_scores' => 'nullable|array',
            'question_scores.*' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Vui long nhap tieu de bai kiem tra.',
            'subject_id.required' => 'Vui long chon mon hoc.',
            'subject_id.exists' => 'Mon hoc khong ton tai.',
            'class_ids.required_if'
            => 'Vui lòng chọn ít nhất một lớp học.',

            'class_ids.array'
            => 'Danh sách lớp học không hợp lệ.',

            'class_ids.*.exists'
            => 'Một trong các lớp học không tồn tại.',
            'question_ids.required' => 'Vui long chon it nhat mot cau hoi.',
            'question_ids.min' => 'Vui long chon it nhat mot cau hoi.',
            'question_ids.*.exists' => 'Mot cau hoi khong ton tai.',
        ];
    }
}
