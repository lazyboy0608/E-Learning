<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name'     => 'sometimes|required|string|max:255',
            'email'    => "sometimes|required|email|unique:users,email,{$userId}",
            'phone'    => "sometimes|nullable|string|max:20|unique:users,phone,{$userId}",
            'role'     => 'sometimes|required|in:student,teacher,admin',
            'password' => 'sometimes|nullable|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Tên không được để trống.',
            'email.required'   => 'Email không được để trống.',
            'email.email'      => 'Email không hợp lệ.',
            'email.unique'     => 'Email này đã được sử dụng.',
            'phone.unique'     => 'Số điện thoại này đã được sử dụng.',
            'role.in'          => 'Vai trò không hợp lệ.',
            'password.min'     => 'Mật khẩu phải có ít nhất 6 ký tự.',
        ];
    }
}
