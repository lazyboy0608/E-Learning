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
        'file_size',
        'original_name',
    ];

    protected $appends = [
        'formatted_size',
    ];

    public function getFormattedSizeAttribute(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($this->file_size, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, 1) . ' ' . $units[$pow];
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
}
