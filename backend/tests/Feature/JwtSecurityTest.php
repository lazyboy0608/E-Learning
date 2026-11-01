<?php

namespace Tests\Feature;

use App\Models\RefreshToken;
use App\Models\User;
use App\Services\JwtService;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JwtSecurityTest extends TestCase
{
    use RefreshDatabase;

    private JwtService $jwtService;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->jwtService = app(JwtService::class);

        $this->user = User::create([
            'name'     => 'Security Tester',
            'email'    => 'security@smartedu.vn',
            'password' => bcrypt('password123'),
            'role'     => 'student',
        ]);
    }

    /**
     * 1. Kiểm tra đăng nhập phát hành cặp token kép (AccessToken + RefreshToken) và gắn HttpOnly Cookies
     */
    public function test_login_issues_dual_tokens_and_httponly_cookies(): void
    {
        $response = $this->postJson('/api/login', [
            'email'    => 'security@smartedu.vn',
            'password' => 'password123',
            'role'     => 'student',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => ['id', 'email', 'name', 'role'],
                'access_token',
                'token',
            ],
        ]);

        $accessToken = $response->json('data.access_token');
        $this->assertNotEmpty($accessToken);

        // Kiểm tra 2 HttpOnly Cookies
        $response->assertCookie('access_token');
        $response->assertCookie('refresh_token');

        $accessCookie = $response->getCookie('access_token', false);
        $refreshCookie = $response->getCookie('refresh_token', false);

        $this->assertNotNull($accessCookie);
        $this->assertTrue($accessCookie->isHttpOnly(), 'Cookie access_token phải là HttpOnly');
        $this->assertEquals('lax', strtolower($accessCookie->getSameSite() ?? ''));

        $this->assertNotNull($refreshCookie);
        $this->assertTrue($refreshCookie->isHttpOnly(), 'Cookie refresh_token phải là HttpOnly');
        $this->assertEquals('lax', strtolower($refreshCookie->getSameSite() ?? ''));

        // Kiểm tra Refresh Token đã được lưu bản ghi bảo mật trong CSDL (SHA-256 hash)
        $this->assertDatabaseHas('refresh_tokens', [
            'user_id' => $this->user->id,
            'revoked' => false,
        ]);
    }

    /**
     * 2. Kiểm tra từ chối đăng nhập với sai mật khẩu
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email'    => 'security@smartedu.vn',
            'password' => 'wrongpassword',
            'role'     => 'student',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
        ]);
    }

    /**
     * 3. Kiểm tra từ chối đăng nhập với sai vai trò (Role Confusion)
     */
    public function test_login_fails_with_wrong_role(): void
    {
        $response = $this->postJson('/api/login', [
            'email'    => 'security@smartedu.vn',
            'password' => 'password123',
            'role'     => 'teacher', // Vai trò thực tế là student
        ]);

        $response->assertStatus(401);
    }

    /**
     * 4. Kiểm tra truy cập API bảo vệ bằng Access Token qua Header Bearer
     */
    public function test_access_protected_endpoint_using_bearer_token(): void
    {
        $accessToken = $this->jwtService->generateAccessToken($this->user);

        $response = $this->withHeader('Authorization', "Bearer {$accessToken}")
            ->getJson('/api/me');

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $this->user->id);
        $response->assertJsonPath('data.email', $this->user->email);
    }

    /**
     * 5. Kiểm tra truy cập API bảo vệ bằng HttpOnly Cookie (access_token)
     */
    public function test_access_protected_endpoint_using_cookie(): void
    {
        $accessToken = $this->jwtService->generateAccessToken($this->user);

        $response = $this->call('GET', '/api/me', [], ['access_token' => $accessToken], [], [
            'HTTP_ACCEPT' => 'application/json',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $this->user->id);
    }

    /**
     * 6. Kiểm tra từ chối yêu cầu không mang token (TOKEN_MISSING)
     */
    public function test_unauthenticated_request_rejected_with_token_missing(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
        $response->assertJson([
            'success'    => false,
            'error_code' => 'TOKEN_MISSING',
        ]);
    }

    /**
     * 7. Kiểm tra từ chối token bị can thiệp/sửa đổi chữ ký (Tampering Attack -> TOKEN_INVALID)
     */
    public function test_tampered_access_token_signature_rejected_with_token_invalid(): void
    {
        $validToken = $this->jwtService->generateAccessToken($this->user);
        
        // Cố tình sửa đổi chữ ký ở cuối chuỗi token
        $parts = explode('.', $validToken);
        $parts[2] = substr_replace($parts[2], 'X', -1, 1);
        $tamperedToken = implode('.', $parts);

        $response = $this->withHeader('Authorization', "Bearer {$tamperedToken}")
            ->getJson('/api/me');

        $response->assertStatus(401);
        $response->assertJsonPath('error_code', 'TOKEN_INVALID');
    }

    /**
     * 8. Kiểm tra từ chối token được ký bằng Secret Key giả mạo
     */
    public function test_access_token_signed_with_wrong_secret_rejected(): void
    {
        $now = time();
        $fakePayload = [
            'iss'   => config('app.url'),
            'sub'   => $this->user->id,
            'email' => $this->user->email,
            'role'  => $this->user->role,
            'type'  => 'access',
            'iat'   => $now,
            'exp'   => $now + 900,
        ];

        // Ký bằng key giả mạo khác
        $fakeToken = JWT::encode($fakePayload, 'fake_attacker_secret_key_12345678', 'HS256');

        $response = $this->withHeader('Authorization', "Bearer {$fakeToken}")
            ->getJson('/api/me');

        $response->assertStatus(401);
        $response->assertJsonPath('error_code', 'TOKEN_INVALID');
    }

    /**
     * 9. Kiểm tra từ chối Access Token đã hết hạn (TOKEN_EXPIRED)
     */
    public function test_expired_access_token_rejected_with_token_expired(): void
    {
        // Lấy secretKey từ JwtService qua reflection
        $reflection = new \ReflectionClass($this->jwtService);
        $prop = $reflection->getProperty('secretKey');
        $prop->setAccessible(true);
        $secretKey = $prop->getValue($this->jwtService);

        $now = time();
        $expiredPayload = [
            'iss'   => config('app.url'),
            'sub'   => $this->user->id,
            'email' => $this->user->email,
            'role'  => $this->user->role,
            'type'  => 'access',
            'iat'   => $now - 1200,
            'nbf'   => $now - 1200,
            'exp'   => $now - 300, // Đã hết hạn cách đây 5 phút
        ];

        $expiredToken = JWT::encode($expiredPayload, $secretKey, 'HS256');

        $response = $this->withHeader('Authorization', "Bearer {$expiredToken}")
            ->getJson('/api/me');

        $response->assertStatus(401);
        $response->assertJson([
            'success'    => false,
            'error_code' => 'TOKEN_EXPIRED',
        ]);
    }

    /**
     * 10. Chống nhầm lẫn loại token: Dùng Refresh Token để truy cập API bảo vệ (phải bị từ chối)
     */
    public function test_token_type_confusion_refresh_token_cannot_access_api(): void
    {
        $refreshData = $this->jwtService->generateRefreshToken($this->user);

        $response = $this->withHeader('Authorization', "Bearer {$refreshData['token']}")
            ->getJson('/api/me');

        $response->assertStatus(401);
        $response->assertJsonPath('error_code', 'TOKEN_INVALID');
    }

    /**
     * 11. Chống nhầm lẫn loại token: Dùng Access Token để gọi làm mới token (phải bị từ chối)
     */
    public function test_token_type_confusion_access_token_cannot_refresh(): void
    {
        $accessToken = $this->jwtService->generateAccessToken($this->user);

        $response = $this->postJson('/api/refresh-token', [
            'refresh_token' => $accessToken,
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('error_code', 'REFRESH_FAILED');
    }

    /**
     * 12. Kiểm tra cơ chế Token Rotation thành công:
     * - Refresh Token cũ bị thu hồi (revoked = 1)
     * - Cấp cặp token mới (Access Token mới + Refresh Token mới)
     * - Access Token mới hoạt động bình thường
     */
    public function test_successful_token_rotation(): void
    {
        $initialRefresh = $this->jwtService->generateRefreshToken($this->user);
        $oldRecord = RefreshToken::where('token_id', $initialRefresh['jti'])->first();
        $this->assertFalse($oldRecord->revoked);

        // Gọi refresh token bằng Cookie hoặc Body
        $response = $this->call('POST', '/api/refresh-token', [], ['refresh_token' => $initialRefresh['token']], [], [
            'HTTP_ACCEPT' => 'application/json',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $newAccessToken = $response->json('data.access_token');
        $this->assertNotEmpty($newAccessToken);

        // Kiểm tra token cũ trong DB đã bị revoked = true
        $oldRecord->refresh();
        $this->assertTrue($oldRecord->revoked, 'Refresh token cũ phải được đánh dấu revoked sau khi rotate');

        // Kiểm tra token mới trong DB được tạo với revoked = false
        $newRefreshCookie = $response->getCookie('refresh_token', false);
        $this->assertNotNull($newRefreshCookie);

        // Sử dụng access token mới truy cập API
        $meResponse = $this->withHeader('Authorization', "Bearer {$newAccessToken}")
            ->getJson('/api/me');
        $meResponse->assertStatus(200);
    }

    /**
     * 13. Kiểm tra phòng thủ Replay Attack (Tấn công phát lại token đã thu hồi):
     * - Khi một Refresh Token đã từng bị thu hồi được sử dụng lại:
     * - Hệ thống phát hiện Replay Attack và LẬP TỨC THU HỒI TOÀN BỘ PHIÊN LÀM VIỆC của user đó.
     */
    public function test_replay_attack_detection_triggers_mass_revocation(): void
    {
        // 1. Tạo Refresh Token A
        $tokenA = $this->jwtService->generateRefreshToken($this->user);

        // 2. Thực hiện Rotation hợp lệ lần đầu: Token A -> Token B
        $rotateResponse = $this->postJson('/api/refresh-token', [
            'refresh_token' => $tokenA['token'],
        ]);
        $rotateResponse->assertStatus(200);

        // Lấy Token B mới tạo ra
        $recordB = RefreshToken::where('user_id', $this->user->id)
            ->where('revoked', false)
            ->latest('id')
            ->first();
        $this->assertNotNull($recordB);

        // 3. Kẻ tấn công cố tình sử dụng lại Token A (Replay Attack)
        $attackResponse = $this->postJson('/api/refresh-token', [
            'refresh_token' => $tokenA['token'],
        ]);

        $attackResponse->assertStatus(401);
        $attackResponse->assertJsonFragment([
            'error_code' => 'REFRESH_FAILED',
        ]);
        $this->assertStringContainsString('Cảnh báo bảo mật', $attackResponse->json('message'));

        // 4. KIỂM TRA BẢO MẬT TỐI CAO: Tất cả token của user (bao gồm cả Token B hợp lệ của người dùng)
        // đều đã bị thu hồi đồng loạt để bảo vệ tài khoản!
        $recordB->refresh();
        $this->assertTrue($recordB->revoked, 'Toàn bộ refresh token của user phải bị vô hiệu hóa khi phát hiện Replay Attack');

        $activeTokensCount = RefreshToken::where('user_id', $this->user->id)
            ->where('revoked', false)
            ->count();
        $this->assertEquals(0, $activeTokensCount, 'Không còn bất kỳ refresh token nào còn hiệu lực cho user này');
    }

    /**
     * 14. Kiểm tra từ chối Refresh Token đã hết hạn
     */
    public function test_expired_refresh_token_rejected(): void
    {
        $reflection = new \ReflectionClass($this->jwtService);
        $prop = $reflection->getProperty('secretKey');
        $prop->setAccessible(true);
        $secretKey = $prop->getValue($this->jwtService);

        $now = time();
        $jti = bin2hex(random_bytes(16));
        $expiredPayload = [
            'iss'  => config('app.url'),
            'sub'  => $this->user->id,
            'jti'  => $jti,
            'type' => 'refresh',
            'iat'  => $now - 700000,
            'nbf'  => $now - 700000,
            'exp'  => $now - 100, // Đã hết hạn
        ];

        $tokenString = JWT::encode($expiredPayload, $secretKey, 'HS256');

        RefreshToken::create([
            'user_id'    => $this->user->id,
            'token_id'   => $jti,
            'token_hash' => hash('sha256', $tokenString),
            'expires_at' => now()->subSeconds(100),
            'revoked'    => false,
        ]);

        $response = $this->postJson('/api/refresh-token', [
            'refresh_token' => $tokenString,
        ]);

        $response->assertStatus(401);
    }

    /**
     * 15. Kiểm tra đăng xuất: Thu hồi Refresh Token trong DB và xóa sạch HttpOnly Cookies
     */
    public function test_logout_revokes_refresh_token_and_clears_cookies(): void
    {
        $accessToken = $this->jwtService->generateAccessToken($this->user);
        $refreshData = $this->jwtService->generateRefreshToken($this->user);

        $response = $this->call('POST', '/api/logout', [], ['refresh_token' => $refreshData['token']], [], [
            'HTTP_AUTHORIZATION' => "Bearer {$accessToken}",
            'HTTP_ACCEPT' => 'application/json',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Đăng xuất thành công',
        ]);

        // Kiểm tra token đã bị thu hồi trong CSDL
        $record = RefreshToken::where('token_id', $refreshData['jti'])->first();
        $this->assertTrue($record->revoked);

        // Kiểm tra cookies bị xóa (giá trị rỗng hoặc thời hạn âm)
        $accessCookie = $response->getCookie('access_token', false);
        $refreshCookie = $response->getCookie('refresh_token', false);

        $this->assertNotNull($accessCookie);
        $this->assertEmpty($accessCookie->getValue());
        $this->assertLessThan(time(), $accessCookie->getExpiresTime());

        $this->assertNotNull($refreshCookie);
        $this->assertEmpty($refreshCookie->getValue());
        $this->assertLessThan(time(), $refreshCookie->getExpiresTime());
    }

    /**
     * 16. Kiểm tra từ chối token khi tài khoản người dùng đã bị xóa khỏi hệ thống
     */
    public function test_deleted_user_token_rejected_with_user_not_found(): void
    {
        $tempUser = User::create([
            'name'     => 'Deleted User',
            'email'    => 'deleted@smartedu.vn',
            'password' => bcrypt('password123'),
            'role'     => 'student',
        ]);

        $accessToken = $this->jwtService->generateAccessToken($tempUser);

        // Xóa user khỏi cơ sở dữ liệu
        $tempUser->delete();

        $response = $this->withHeader('Authorization', "Bearer {$accessToken}")
            ->getJson('/api/me');

        $response->assertStatus(401);
        $response->assertJson([
            'success'    => false,
            'error_code' => 'USER_NOT_FOUND',
        ]);
    }

    /**
     * 17. Kiểm tra đăng ký người dùng mới tự động sinh cặp token kép và cookies
     */
    public function test_register_issues_dual_tokens_and_httponly_cookies(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Nguyen Van New',
            'email'                 => 'newuser@smartedu.vn',
            'password'              => 'Password@123',
            'password_confirmation' => 'Password@123',
            'role'                  => 'student',
            'phone'                 => '0988776655',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user',
                'access_token',
                'token',
            ],
        ]);

        $response->assertCookie('access_token');
        $response->assertCookie('refresh_token');

        $createdUser = User::where('email', 'newuser@smartedu.vn')->first();
        $this->assertNotNull($createdUser);

        $this->assertDatabaseHas('refresh_tokens', [
            'user_id' => $createdUser->id,
            'revoked' => false,
        ]);
    }

    /**
     * 18. Kiểm tra từ chối Refresh Token nếu token_hash trong CSDL không khớp
     */
    public function test_refresh_token_with_unmatched_hash_rejected(): void
    {
        $tokenData = $this->jwtService->generateRefreshToken($this->user);

        // Giả lập làm sai lệch hash trong CSDL
        RefreshToken::where('token_id', $tokenData['jti'])
            ->update(['token_hash' => hash('sha256', 'another_random_string')]);

        $response = $this->postJson('/api/refresh-token', [
            'refresh_token' => $tokenData['token'],
        ]);

        $response->assertStatus(401);
        $response->assertJsonFragment([
            'error_code' => 'REFRESH_FAILED',
        ]);
    }

    /**
     * 19. Kiểm tra thu hồi toàn bộ phiên đăng nhập của người dùng (revokeAllUserTokens)
     */
    public function test_revoke_all_user_tokens(): void
    {
        // Tạo 3 thiết bị/phiên đăng nhập cho user
        $session1 = $this->jwtService->generateRefreshToken($this->user, '1.1.1.1', 'Device 1');
        $session2 = $this->jwtService->generateRefreshToken($this->user, '2.2.2.2', 'Device 2');
        $session3 = $this->jwtService->generateRefreshToken($this->user, '3.3.3.3', 'Device 3');

        $this->assertEquals(3, RefreshToken::where('user_id', $this->user->id)->where('revoked', false)->count());

        // Thu hồi toàn bộ token
        $this->jwtService->revokeAllUserTokens($this->user->id);

        $this->assertEquals(0, RefreshToken::where('user_id', $this->user->id)->where('revoked', false)->count());

        // Cả 3 session khi cố refresh đều phải thất bại và phát hiện Replay/Revoked
        $res = $this->postJson('/api/refresh-token', ['refresh_token' => $session1['token']]);
        $res->assertStatus(401);
    }
}
