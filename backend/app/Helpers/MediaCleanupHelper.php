<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaCleanupHelper
{
    /**
     * Delete a local storage file by its URL or relative path.
     */
    public static function deleteLocalFile(?string $url): void
    {
        if (empty($url)) {
            return;
        }

        try {
            // Check if the URL contains /storage/ (which points to public disk storage)
            if (Str::contains($url, '/storage/')) {
                // Extract the path after /storage/
                $relativePath = Str::after($url, '/storage/');
                
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                    \Log::info("Deleted local file: " . $relativePath);
                }
            } else {
                // If it is just a relative path on the public disk directly
                if (Storage::disk('public')->exists($url)) {
                    Storage::disk('public')->delete($url);
                    \Log::info("Deleted local file (by direct path): " . $url);
                }
            }
        } catch (\Exception $e) {
            \Log::error("Failed to delete local file {$url}: " . $e->getMessage());
        }
    }
}
