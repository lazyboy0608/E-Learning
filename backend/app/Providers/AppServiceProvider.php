<?php

namespace App\Providers;

use App\Models\ClassPractice;
use App\Models\ClassTest;
use App\Models\ClassUser;
use App\Observers\ClassPracticeObserver;
use App\Observers\ClassTestObserver;
use App\Observers\ClassUserObserver;
use App\Repositories\ClassRepository;
use App\Repositories\Interfaces\ClassRepositoryInterface;
use App\Repositories\Interfaces\FeedbackRepositoryInterface;
use App\Repositories\Interfaces\PracticeRepositoryInterface;
use App\Repositories\Interfaces\TestRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\FeedbackRepository;
use App\Repositories\PracticeRepository;
use App\Repositories\TestRepository;
use App\Repositories\UserRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ClassRepositoryInterface::class, ClassRepository::class);
        $this->app->bind(TestRepositoryInterface::class, TestRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(PracticeRepositoryInterface::class, PracticeRepository::class);
        $this->app->bind(FeedbackRepositoryInterface::class, FeedbackRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ClassUser::observe(ClassUserObserver::class);
        ClassTest::observe(ClassTestObserver::class);
        ClassPractice::observe(ClassPracticeObserver::class);
        \App\Models\Question::observe(\App\Observers\QuestionObserver::class);

        $this->configureRateLimiting();
    }

    /**
     * Configure named rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // 1. Chống brute-force mật khẩu khi đăng nhập (tối đa 15 lần/phút)
        RateLimiter::for('login', function (Request $request) {
            $key = 'login.' . ($request->input('email') ?: 'guest') . '|' . $request->ip();
            return Limit::perMinute(15)->by($key)->response(function () {
                return response()->json([
                    'success'    => false,
                    'message'    => 'Quá nhiều lần thử đăng nhập không thành công. Vui lòng thử lại sau 1 phút.',
                    'error_code' => 'RATE_LIMIT_EXCEEDED',
                ], 429);
            });
        });

        // 2. Chống spam đăng ký tài khoản (tối đa 10 lần/phút)
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip())->response(function () {
                return response()->json([
                    'success'    => false,
                    'message'    => 'Quá nhiều yêu cầu đăng ký từ địa chỉ IP này. Vui lòng thử lại sau 1 phút.',
                    'error_code' => 'RATE_LIMIT_EXCEEDED',
                ], 429);
            });
        });

        // 3. Giới hạn tần suất refresh token (tối đa 60 lần/phút)
        RateLimiter::for('refresh-token', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip())->response(function () {
                return response()->json([
                    'success'    => false,
                    'message'    => 'Tần suất làm mới phiên làm việc quá cao. Vui lòng thử lại sau.',
                    'error_code' => 'RATE_LIMIT_EXCEEDED',
                ], 429);
            });
        });

        // 4. Rate limiter chung cho toàn bộ API hệ thống
        // Ứng dụng SPA tải nhiều tài nguyên song song (dashboard, widget, notifications, classes),
        // mức phù hợp: 600 req/phút cho User đã đăng nhập, 300 req/phút cho Guest/IP
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();
            return $user
                ? Limit::perMinute(600)->by($user->id)
                : Limit::perMinute(300)->by($request->ip());
        });

        // 5. Bảo vệ API làm bài thi, nộp bài, lưu đáp án (tối đa 120 req/phút hỗ trợ auto-save)
        RateLimiter::for('assessment', function (Request $request) {
            $identifier = $request->user()?->id ?: $request->ip();
            return Limit::perMinute(120)->by('assessment.' . $identifier)->response(function () {
                return response()->json([
                    'success'    => false,
                    'message'    => 'Thao tác nộp bài quá nhanh. Vui lòng đợi trong giây lát.',
                    'error_code' => 'RATE_LIMIT_EXCEEDED',
                ], 429);
            });
        });
    }
}
