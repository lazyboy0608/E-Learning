<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'subject' => $this->whenLoaded('subject', function () {
                return [
                    'id' => $this->subject->id,
                    'name' => $this->subject->name,
                    'class_level' => $this->subject->class_level,
                ];
            }),
            'type' => $this->type,
            'content' => $this->content,
            'media_image' => $this->media_image,
            'media_audio' => $this->media_audio,
            'data' => $this->data,
            'explanation' => $this->explanation,
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'scope' => $this->scope,
            'pivot' => $this->when($this->pivot, function () {
                return $this->pivot;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
