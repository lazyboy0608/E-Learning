<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogService
{
    /**
     * Record an activity log entry.
     */
    public function log(
        string $action,
        ?string $modelType = null,
        ?int $modelId = null,
        string $description = '',
        ?array $payload = null
    ): void {
        try {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => $modelId,
                'description' => $description,
                'payload' => $payload,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        } catch (\Exception $e) {
            // Đảm bảo lỗi ghi log không làm ngắt quãng luồng xử lý chính
            \Log::error("Failed to write activity log: " . $e->getMessage());
        }
    }
}
