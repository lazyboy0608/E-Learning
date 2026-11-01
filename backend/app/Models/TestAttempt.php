<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'test_id',
        'attempt_no',
        'started_at',
        'submitted_at',
        'expired_at',
        'status',
        'score',
        'earned_points',
        'total_points',
        'tab_switch_count',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'expired_at' => 'datetime',
        'score' => 'float',
        'earned_points' => 'float',
        'total_points' => 'float',
        'tab_switch_count' => 'integer',
    ];

    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_EXPIRED = 'expired';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class)->withTrashed();
    }

    public function answers(): HasMany
    {
        return $this->hasMany(TestAnswer::class, 'attempt_id');
    }

    public function isExpired(): bool
    {
        return $this->expired_at && $this->expired_at->isPast();
    }

    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Kiểm tra người dùng có quyền truy cập / xem kết quả của lượt làm bài này hay không.
     * Cho phép:
     * 1. Chính thí sinh làm bài thi ($this->user_id === $user->id)
     * 2. Giáo viên tạo bài test này ($this->test->created_by === $user->id)
     * 3. Quản trị viên hệ thống ($user->role === 'admin')
     */
    public function canAccess(User $user): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($this->user_id === $user->id) {
            return true;
        }

        if ($this->test && $this->test->created_by === $user->id) {
            return true;
        }

        return false;
    }
}
