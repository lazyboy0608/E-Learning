<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function login(string $email, string $password, string $role): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password) || $user->role !== $role) {
            return [
                'success' => false,
                'message' => 'Invalid credentials',
                'status'  => 401,
            ];
        }

        $token = $user->createToken('api-token')->plainTextToken;

        app(ActivityLogService::class)->log(
            'login',
            User::class,
            $user->id,
            "User \"{$user->name}\" (ID: {$user->id}, Role: {$user->role}) logged in"
        );

        return [
            'success' => true,
            'message' => 'Login successful',
            'user'    => $this->formatUser($user),
            'token'   => $token,
            'status'  => 200,
        ];
    }

    public function logout(User $user): void
    {
        app(ActivityLogService::class)->log(
            'logout',
            User::class,
            $user->id,
            "User \"{$user->name}\" (ID: {$user->id}) logged out"
        );

        $user->tokens()->delete();
    }

    public function getCurrentUser(User $user): array
    {
        return [
            'success' => true,
            'user'    => $this->formatUser($user),
        ];
    }

    public function register(array $data): array
    {
        $existingUser = User::where('email', $data['email'])
            ->orWhere('phone', $data['phone'])
            ->first();

        if ($existingUser) {
            if ($existingUser->email === $data['email']) {
                return [
                    'success' => false,
                    'message' => 'Email đã được sử dụng.',
                    'status'  => 422,
                ];
            }
            return [
                'success' => false,
                'message' => 'Số điện thoại đã được sử dụng.',
                'status'  => 422,
            ];
        }

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'phone'    => $data['phone'],
            'role'     => $data['role'],
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        app(ActivityLogService::class)->log(
            'register',
            User::class,
            $user->id,
            "New user \"{$user->name}\" (ID: {$user->id}, Role: {$user->role}) registered"
        );

        return [
            'success' => true,
            'message' => 'Đăng ký thành công.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
            'status'  => 201,
        ];
    }

    private function formatUser(User $user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ];
    }
}
