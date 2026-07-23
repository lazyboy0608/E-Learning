<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassPractice extends Model
{
    protected $table = 'class_practices';

    protected $fillable = [
        'class_id',
        'practice_id',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function practice(): BelongsTo
    {
        return $this->belongsTo(Practice::class);
    }
}
