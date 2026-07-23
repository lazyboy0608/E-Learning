<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'class_code',
        'description',
        'created_by',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'class_users',
            'class_id',
            'user_id'
        )->withPivot('role');
    }

    public function students(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'student');
    }

    public function teachers(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'teacher');
    }

    protected $appends = [
        'teacher',
    ];

    public function getTeacherAttribute()
    {
        // ưu tiên giáo viên được thêm vào lớp
        $teacher = $this->teachers->first();

        if ($teacher) {
            return $teacher;
        }

        // nếu chưa có thì lấy người tạo lớp
        return $this->creator;
    }

    public function materials(): HasMany
    {
        return $this->hasMany(ClassMaterial::class, 'class_id');
    }

    public function tests(): BelongsToMany
    {
        return $this->belongsToMany(
            Test::class,
            'class_tests',
            'class_id',
            'test_id'
        );
    }

    public function practices(): BelongsToMany
    {
        return $this->belongsToMany(
            Practice::class,
            'class_practices',
            'class_id',
            'practice_id'
        );
    }

}
