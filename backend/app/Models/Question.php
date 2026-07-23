<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'subject_id',
        'type',
        'content',
        'media_image',
        'media_audio',
        'data',
        'explanation',
        'created_by',
        'scope',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(QuestionProgress::class);
    }

    public function practiceQuestions(): HasMany
    {
        return $this->hasMany(PracticeQuestion::class);
    }
}
