<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassMaterial extends Model
{
    use HasFactory;

    protected $table = 'class_materials';

    protected $fillable = [
        'class_id',
        'title',
        'description',
        'file_url',
        'type',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
}
