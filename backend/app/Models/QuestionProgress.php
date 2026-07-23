<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionProgress extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'question_id',
        'is_correct',
        'last_answer',
        'attempt_count',
        'last_attempt_at',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'last_answer' => 'array',
        'last_attempt_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
