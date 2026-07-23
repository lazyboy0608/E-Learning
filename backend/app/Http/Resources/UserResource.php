<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'xp' => $this->xp ?? 0,
            'level' => $this->level ?? 1,
            'school' => $this->school,
            'avatar' => $this->avatar,
            'pivot' => $this->when($this->pivot, function () {
                return $this->pivot;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
