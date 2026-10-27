<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly JwtService $jwtService
    ) {}

    public function login(string $email, string $password, string $role, ?string $ip = null, ?string $userAgent = null): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password) || $user->role !== $role) {
            return [
                'success' => false,
                'message' => 'Thông tin đăng nhập không chính xác hoặc vai trò không hợp lệ.',
                'status'  => 401,
            ];
        }

        // Sinh cặp token kép (AccessToken 15m + RefreshToken 7d)
        $accessToken = $this->jwtService->generateAccessToken($user);
        $refreshTokenData = $this->jwtService->generateRefreshToken($user, $ip, $userAgent);

        app(ActivityLogService::class)->log(
            'login',
            User::class,
            $user->id,
            "User \"{$user->name}\" (ID: {$user->id}, Role: {$user->role}) logged in"
        );

        return [
            'success'       => true,
            'message'       => 'Đăng nhập thành công',
            'user'          => $this->formatUser($user),
            'access_token'  => $accessToken,
            'refresh_token' => $refreshTokenData['token'],
            'token'         => $accessToken, // Backward compatibility
            'status'        => 200,
        ];
    }

    public function refreshToken(string $rawRefreshToken, ?string $ip = null, ?string $userAgent = null): array
    {
        try {
            $result = $this->jwtService->rotateRefreshToken($rawRefreshToken, $ip, $userAgent);

            return [
                'success'       => true,
                'message'       => 'Làm mới token thành công',
                'user'          => $this->formatUser($result['user']),
                'access_token'  => $result['access_token'],
                'refresh_token' => $result['refresh_token'],
                'token'         => $result['access_token'],
                'status'        => 200,
            ];
        } catch (\Throwable $e) {
            return [
                'success'    => false,
                'message'    => $e->getMessage(),
                'error_code' => 'REFRESH_FAILED',
                'status'     => 401,
            ];
        }
    }

    public function logout(?User $user, ?string $rawRefreshToken = null): void
    {
        if ($user) {
            app(ActivityLogService::class)->log(
                'logout',
                User::class,
                $user->id,
                "User \"{$user->name}\" (ID: {$user->id}) logged out"
            );
        }

        if ($rawRefreshToken) {
            $this->jwtService->revokeRefreshToken($rawRefreshToken);
        } elseif ($user) {
            $this->jwtService->revokeAllUserTokens($user->id);
        }
    }

    public function getCurrentUser(User $user): array
    {
        return [
            'success' => true,
            'user'    => $this->formatUser($user),
        ];
    }

    public function register(array $data, ?string $ip = null, ?string $userAgent = null): array
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

        $accessToken = $this->jwtService->generateAccessToken($user);
        $refreshTokenData = $this->jwtService->generateRefreshToken($user, $ip, $userAgent);

        app(ActivityLogService::class)->log(
            'register',
            User::class,
            $user->id,
            "New user \"{$user->name}\" (ID: {$user->id}, Role: {$user->role}) registered"
        );

        return [
            'success'       => true,
            'message'       => 'Đăng ký thành công.',
            'user'          => $this->formatUser($user),
            'access_token'  => $accessToken,
            'refresh_token' => $refreshTokenData['token'],
            'token'         => $accessToken,
            'status'        => 201,
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
