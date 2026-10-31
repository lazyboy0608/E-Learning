<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassAnnouncement extends Model
{
    use HasFactory;

    protected $table = 'class_announcements';

    protected $fillable = [
        'class_id',
        'author_id',
        'type',
        'title',
        'content',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}

