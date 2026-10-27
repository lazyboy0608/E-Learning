<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Cookie as SymfonyCookie;

class JwtService
{
    private string $secretKey;
    private int $accessTokenTtl; // seconds (15 minutes)
    private int $refreshTokenTtl; // seconds (7 days)

    public function __construct()
    {
        $rawSecret = env('JWT_SECRET') ?: config('app.key');

        if (str_starts_with($rawSecret, 'base64:')) {
            $this->secretKey = base64_decode(substr($rawSecret, 7));
        } else {
            $this->secretKey = $rawSecret;
        }

        $this->accessTokenTtl = (int) env('JWT_ACCESS_TTL', 900); // 15 phút
        $this->refreshTokenTtl = (int) env('JWT_REFRESH_TTL', 604800); // 7 ngày
    }

    /**
     * Tạo Access Token (thời hạn ngắn, 15 phút)
     */
    public function generateAccessToken(User $user): string
    {
        $now = time();

        $payload = [
            'iss'   => config('app.url'),
            'sub'   => $user->id,
            'email' => $user->email,
            'role'  => $user->role,
            'name'  => $user->name,
            'type'  => 'access',
            'iat'   => $now,
            'nbf'   => $now,
            'exp'   => $now + $this->accessTokenTtl,
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    /**
     * Tạo Refresh Token (thời hạn dài, 7 ngày) và lưu hash vào database
     */
    public function generateRefreshToken(User $user, ?string $ip = null, ?string $userAgent = null): array
    {
        $now = time();
        $jti = bin2hex(random_bytes(16)); // ID định danh duy nhất của token

        $payload = [
            'iss'  => config('app.url'),
            'sub'  => $user->id,
            'jti'  => $jti,
            'type' => 'refresh',
            'iat'  => $now,
            'nbf'  => $now,
            'exp'  => $now + $this->refreshTokenTtl,
        ];

        $tokenString = JWT::encode($payload, $this->secretKey, 'HS256');

        // Lưu bản ghi vào CSDL phục vụ quản lý, rotation và revocation
        RefreshToken::create([
            'user_id'    => $user->id,
            'token_id'   => $jti,
            'token_hash' => hash('sha256', $tokenString),
            'expires_at' => now()->addSeconds($this->refreshTokenTtl),
            'revoked'    => false,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
        ]);

        return [
            'token'      => $tokenString,
            'jti'        => $jti,
            'expires_at' => $now + $this->refreshTokenTtl,
        ];
    }

    /**
     * Xác thực và giải mã token (kiểm tra chữ ký, thời hạn, loại token)
     *
     * @throws ExpiredException
     * @throws SignatureInvalidException
     * @throws \InvalidArgumentException
     */
    public function verifyToken(string $token, string $expectedType = 'access'): object
    {
        $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));

        if (!isset($decoded->type) || $decoded->type !== $expectedType) {
            throw new \InvalidArgumentException("Token type không hợp lệ. Mong đợi: {$expectedType}");
        }

        return $decoded;
    }

    /**
     * Thực hiện Token Rotation: Thu hồi Refresh Token cũ và phát hành cặp token mới.
     * Tích hợp cơ chế phát hiện Replay Attack.
     *
     * @throws \InvalidArgumentException
     * @throws ExpiredException
     */
    public function rotateRefreshToken(string $rawRefreshToken, ?string $ip = null, ?string $userAgent = null): array
    {
        $decoded = $this->verifyToken($rawRefreshToken, 'refresh');
        $jti = $decoded->jti ?? null;
        $userId = $decoded->sub ?? null;

        if (!$jti || !$userId) {
            throw new \InvalidArgumentException('Payload Refresh Token thiếu thông tin bắt buộc.');
        }

        $record = RefreshToken::where('token_id', $jti)->first();

        if (!$record) {
            throw new \InvalidArgumentException('Refresh Token không tồn tại hoặc đã bị xóa.');
        }

        // Kiểm tra Replay Attack: Token này đã bị thu hồi nhưng vẫn cố tình dùng lại
        if ($record->revoked) {
            // Nghi ngờ bị đánh cắp -> Thu hồi toàn bộ token của user để bảo vệ an toàn
            RefreshToken::where('user_id', $userId)->update(['revoked' => true]);
            throw new \InvalidArgumentException('Cảnh báo bảo mật: Token đã từng được sử dụng. Tất cả các phiên đăng nhập đã bị vô hiệu hóa.');
        }

        if ($record->isExpired()) {
            throw new ExpiredException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        if (!hash_equals($record->token_hash, hash('sha256', $rawRefreshToken))) {
            throw new \InvalidArgumentException('Chữ ký Refresh Token không khớp.');
        }

        // Thu hồi token cũ
        $record->update(['revoked' => true]);

        $user = User::find($userId);
        if (!$user) {
            throw new \InvalidArgumentException('Người dùng không còn tồn tại trên hệ thống.');
        }

        // Cấp phát token mới
        $newAccessToken = $this->generateAccessToken($user);
        $newRefreshData = $this->generateRefreshToken($user, $ip, $userAgent);

        return [
            'user'          => $user,
            'access_token'  => $newAccessToken,
            'refresh_token' => $newRefreshData['token'],
        ];
    }

    /**
     * Thu hồi một Refresh Token cụ thể (khi người dùng đăng xuất)
     */
    public function revokeRefreshToken(string $rawRefreshToken): void
    {
        try {
            $decoded = $this->verifyToken($rawRefreshToken, 'refresh');
            if (isset($decoded->jti)) {
                RefreshToken::where('token_id', $decoded->jti)->update(['revoked' => true]);
            }
        } catch (\Throwable $e) {
            // Bỏ qua lỗi nếu token đã hết hạn hoặc không hợp lệ khi logout
        }
    }

    /**
     * Thu hồi toàn bộ Refresh Token của người dùng (khi đổi mật khẩu hoặc đăng xuất tất cả thiết bị)
     */
    public function revokeAllUserTokens(int $userId): void
    {
        RefreshToken::where('user_id', $userId)->update(['revoked' => true]);
    }

    /**
     * Tạo HttpOnly Cookie cho Access Token (15 phút)
     */
    public function makeAccessTokenCookie(string $token): SymfonyCookie
    {
        $minutes = (int) ceil($this->accessTokenTtl / 60);
        $isSecure = config('app.env') === 'production';

        return Cookie::make(
            'access_token',
            $token,
            $minutes,
            '/',
            null,
            $isSecure,
            true, // HttpOnly
            false,
            'Lax'
        );
    }

    /**
     * Tạo HttpOnly Cookie cho Refresh Token (7 ngày)
     */
    public function makeRefreshTokenCookie(string $token): SymfonyCookie
    {
        $minutes = (int) ceil($this->refreshTokenTtl / 60);
        $isSecure = config('app.env') === 'production';

        return Cookie::make(
            'refresh_token',
            $token,
            $minutes,
            '/',
            null,
            $isSecure,
            true, // HttpOnly
            false,
            'Lax'
        );
    }

    /**
     * Tạo Cookies xóa trạng thái đăng nhập (đặt Max-Age=0)
     *
     * @return SymfonyCookie[]
     */
    public function forgetAuthCookies(): array
    {
        $isSecure = config('app.env') === 'production';

        return [
            Cookie::make('access_token', '', -2628000, '/', null, $isSecure, true, false, 'Lax'),
            Cookie::make('refresh_token', '', -2628000, '/', null, $isSecure, true, false, 'Lax'),
        ];
    }
}
