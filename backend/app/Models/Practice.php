<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Practice extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subject_id',
        'created_by',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(PracticeQuestion::class);
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(
            ClassModel::class,
            'class_practices',
            'practice_id',
            'class_id'
        );
    }

    protected $appends = ['question_ids', 'class_ids'];

    public function getQuestionIdsAttribute(): array
    {
        return $this->questions->map(fn($pq) => $pq->question_id)->values()->toArray();
    }

    public function getClassIdsAttribute(): array
    {
        return $this->classes->map(fn($c) => $c->id)->values()->toArray();
    }
}
