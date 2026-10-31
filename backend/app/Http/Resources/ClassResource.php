<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'class_code' => $this->class_code,
            'description' => $this->description,
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'teacher' => new UserResource($this->teacher), // append attribute
            'users' => UserResource::collection($this->whenLoaded('users')),
            'students' => UserResource::collection($this->whenLoaded('students')),
            'teachers' => UserResource::collection($this->whenLoaded('teachers')),
            'materials' => ClassMaterialResource::collection($this->whenLoaded('materials')),
            'tests' => TestResource::collection($this->whenLoaded('tests')),
            'practices' => PracticeResource::collection($this->whenLoaded('practices')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
