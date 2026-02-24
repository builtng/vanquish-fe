<?php

namespace App\Services;

use App\Models\EmailLog;
use App\Models\Client;
use Illuminate\Support\Facades\Mail;
use App\Mail\DynamicEmail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    /**
     * Send email and log the result
     */
    public function sendAndLog(Client $client, string $templateName, array $placeholders): bool
    {
        $log = EmailLog::create([
            'client_id' => $client->id,
            'email' => $client->email,
            'template_name' => $templateName,
            'payload' => $placeholders,
            'status' => 'pending',
        ]);

        try {
            Mail::to($client->email)->send(new DynamicEmail($templateName, $placeholders));

            $log->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send email to {$client->email}: " . $e->getMessage());

            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Retry a specific failed email log
     */
    public function retry(EmailLog $log): bool
    {
        if (!$log->payload) {
            $log->update(['error_message' => 'Cannot retry: payload missing']);
            return false;
        }

        try {
            Mail::to($log->email)->send(new DynamicEmail($log->template_name, $log->payload));

            $log->update([
                'status' => 'sent',
                'sent_at' => now(),
                'error_message' => null
            ]);

            return true;
        } catch (\Exception $e) {
            $log->update([
                'error_message' => 'Retry failed: ' . $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Retry failed emails
     */
    public function retryFailedEmails($limit = 10)
    {
        $failedLogs = EmailLog::where('status', 'failed')
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get();

        $successCount = 0;
        foreach ($failedLogs as $log) {
            if ($this->retry($log)) {
                $successCount++;
            }
        }
        return $successCount;
    }
}
