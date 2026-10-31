<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassMaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'class_id' => $this->class_id,
            'title' => $this->title,
            'description' => $this->description,
            'file_url' => $this->file_url,
            'type' => $this->type,
            'file_size' => $this->file_size,
            'formatted_size' => $this->formatted_size,
            'original_name' => $this->original_name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

