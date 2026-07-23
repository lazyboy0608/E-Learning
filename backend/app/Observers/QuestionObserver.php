<?php

namespace App\Observers;

use App\Models\Question;
use App\Helpers\MediaCleanupHelper;

class QuestionObserver
{
    /**
     * Handle the Question "updating" event.
     */
    public function updating(Question $question): void
    {
        if ($question->isDirty('media_image')) {
            $oldImage = $question->getOriginal('media_image');
            if ($oldImage !== $question->media_image) {
                MediaCleanupHelper::deleteLocalFile($oldImage);
            }
        }

        if ($question->isDirty('media_audio')) {
            $oldAudio = $question->getOriginal('media_audio');
            if ($oldAudio !== $question->media_audio) {
                MediaCleanupHelper::deleteLocalFile($oldAudio);
            }
        }
    }

    /**
     * Handle the Question "force deleted" event.
     */
    public function forceDeleted(Question $question): void
    {
        MediaCleanupHelper::deleteLocalFile($question->media_image);
        MediaCleanupHelper::deleteLocalFile($question->media_audio);
    }
}
