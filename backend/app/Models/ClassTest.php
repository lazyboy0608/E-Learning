<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassTest extends Model
{
    use HasFactory;

    protected $table = 'class_tests';

    protected $fillable = [
        'class_id',
        'test_id',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }
}
