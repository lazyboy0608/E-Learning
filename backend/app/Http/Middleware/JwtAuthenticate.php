<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticate
{
    public function __construct(
        private readonly JwtService $jwtService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        // 1. Đọc token từ HttpOnly Cookie (ưu tiên) hoặc Header Authorization Bearer (fallback)
        $token = $request->cookie('access_token') ?: $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success'    => false,
                'message'    => 'Yêu cầu chưa được xác thực. Vui lòng đăng nhập.',
                'error_code' => 'TOKEN_MISSING',
            ], 401);
        }

        try {
            // 2. Xác thực token và kiểm tra loại token
            $decoded = $this->jwtService->verifyToken($token, 'access');

            // 3. Tìm user trong cơ sở dữ liệu
            $user = User::find($decoded->sub);

            if (!$user) {
                return response()->json([
                    'success'    => false,
                    'message'    => 'Tài khoản người dùng không tồn tại hoặc đã bị khóa.',
                    'error_code' => 'USER_NOT_FOUND',
                ], 401);
            }

            // 4. Gắn user vào Request và Auth Facade
            $request->setUserResolver(fn() => $user);
            auth()->setUser($user);

            return $next($request);

        } catch (ExpiredException $e) {
            return response()->json([
                'success'    => false,
                'message'    => 'Phiên làm việc đã hết hạn. Vui lòng làm mới token.',
                'error_code' => 'TOKEN_EXPIRED',
            ], 401);
        } catch (SignatureInvalidException $e) {
            return response()->json([
                'success'    => false,
                'message'    => 'Chữ ký Token không hợp lệ.',
                'error_code' => 'TOKEN_INVALID',
            ], 401);
        } catch (\Throwable $e) {
            return response()->json([
                'success'    => false,
                'message'    => 'Xác thực token thất bại: ' . $e->getMessage(),
                'error_code' => 'TOKEN_INVALID',
            ], 401);
        }
    }
}
