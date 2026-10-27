<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly JwtService $jwtService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $result = $this->authService->login(
            $credentials['email'],
            $credentials['password'],
            $credentials['role'],
            $request->ip(),
            $request->userAgent()
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        // Tạo 2 HttpOnly Cookies cho AccessToken và RefreshToken
        $accessCookie = $this->jwtService->makeAccessTokenCookie($result['access_token']);
        $refreshCookie = $this->jwtService->makeRefreshTokenCookie($result['refresh_token']);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data'    => [
                'user'          => $result['user'],
                'token'         => $result['token'], // Cho Echo/Reverb hoặc client không hỗ trợ cookie
                'access_token'  => $result['access_token'],
            ],
        ], 200)
        ->withCookie($accessCookie)
        ->withCookie($refreshCookie);
    }

    public function refreshToken(Request $request): JsonResponse
    {
        // Đọc refresh token từ HttpOnly Cookie hoặc request body
        $rawRefreshToken = $request->cookie('refresh_token') ?: $request->input('refresh_token');

        if (!$rawRefreshToken) {
            return response()->json([
                'success'    => false,
                'message'    => 'Không tìm thấy Refresh Token. Vui lòng đăng nhập lại.',
                'error_code' => 'REFRESH_TOKEN_MISSING',
            ], 401);
        }

        $result = $this->authService->refreshToken(
            $rawRefreshToken,
            $request->ip(),
            $request->userAgent()
        );

        if (!$result['success']) {
            $response = response()->json([
                'success'    => false,
                'message'    => $result['message'],
                'error_code' => $result['error_code'] ?? 'REFRESH_FAILED',
            ], $result['status']);

            // Xóa cookies nếu refresh thất bại
            foreach ($this->jwtService->forgetAuthCookies() as $cookie) {
                $response->withCookie($cookie);
            }

            return $response;
        }

        // Cập nhật cặp cookies mới (Token Rotation)
        $accessCookie = $this->jwtService->makeAccessTokenCookie($result['access_token']);
        $refreshCookie = $this->jwtService->makeRefreshTokenCookie($result['refresh_token']);

        return response()->json([
            'success' => true,
            'message' => 'Làm mới phiên làm việc thành công',
            'data'    => [
                'user'          => $result['user'],
                'token'         => $result['token'],
                'access_token'  => $result['access_token'],
            ],
        ], 200)
        ->withCookie($accessCookie)
        ->withCookie($refreshCookie);
    }

    public function logout(Request $request): JsonResponse
    {
        $rawRefreshToken = $request->cookie('refresh_token') ?: $request->input('refresh_token');

        $this->authService->logout($request->user(), $rawRefreshToken);

        $response = response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công',
        ], 200);

        // Xóa hoàn toàn 2 cookies HttpOnly trên trình duyệt
        foreach ($this->jwtService->forgetAuthCookies() as $cookie) {
            $response->withCookie($cookie);
        }

        return $response;
    }

    public function me(Request $request): JsonResponse
    {
        $result = $this->authService->getCurrentUser($request->user());

        return response()->json([
            'success' => true,
            'data'    => $result['user'],
        ], 200);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = $this->authService->register(
            $data,
            $request->ip(),
            $request->userAgent()
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        $accessCookie = $this->jwtService->makeAccessTokenCookie($result['access_token']);
        $refreshCookie = $this->jwtService->makeRefreshTokenCookie($result['refresh_token']);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data'    => [
                'user'          => $result['user'],
                'token'         => $result['token'],
                'access_token'  => $result['access_token'],
            ],
        ], $result['status'])
        ->withCookie($accessCookie)
        ->withCookie($refreshCookie);
    }
}
