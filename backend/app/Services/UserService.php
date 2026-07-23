<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function getUsers(array $filters = []): LengthAwarePaginator
    {
        return $this->userRepository->getAll($filters);
    }

    public function getUser(int $id): ?User
    {
        return $this->userRepository->getById($id);
    }

    public function updateUser(int $id, array $data): array
    {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user = $this->userRepository->update($id, $data);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy người dùng.',
            ];
        }

        app(ActivityLogService::class)->log(
            'update_user',
            User::class,
            $id,
            "Admin updated user \"{$user->name}\" (ID: {$id})"
        );

        return [
            'success' => true,
            'user'    => $user,
        ];
    }

    public function deleteUser(int $id): array
    {
        $user = $this->userRepository->getById($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy người dùng.',
            ];
        }

        if ($user->role === 'admin') {
            return [
                'success' => false,
                'message' => 'Không thể xóa tài khoản quản trị.',
            ];
        }

        $name = $user->name;
        $this->userRepository->delete($id);

        app(ActivityLogService::class)->log(
            'delete_user',
            User::class,
            $id,
            "Admin deleted user \"{$name}\" (ID: {$id})"
        );

        return [
            'success' => true,
            'message' => 'Xóa người dùng thành công.',
        ];
    }

    public function getTeachers(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->userRepository->getByRole('teacher');
    }

    public function getStudents(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->userRepository->getByRole('student');
    }

    public function getCounts(): array
    {
        return $this->userRepository->getCounts();
    }
}
