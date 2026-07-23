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
    }
}
