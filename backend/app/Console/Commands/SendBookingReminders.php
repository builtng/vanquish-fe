<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\GenericClientEmail;

class SendBookingReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send booking reminders to Low Cost clients 48 hours before their booking deadline';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for clients needing booking reminders...');

        // Find Low Cost clients with booking deadlines in 48 hours
        $deadlineDate = Carbon::now()->addHours(48)->format('Y-m-d');
        
        $clients = Client::where('service_type', 'Low Cost')
            ->where('next_booking_deadline', $deadlineDate)
            ->whereNotNull('matched_tc_id')
            ->where('agreement_status', 'signed')
            ->get();

        $reminderCount = 0;

        foreach ($clients as $client) {
            // Check if reminder already sent
            $nextSession = $client->getNextSessionNeedingBooking();
            
            if ($nextSession && !$nextSession->booking_reminder_sent) {
                // Send reminder email
                if ($client->email) {
                    try {
                        $message = "Dear {$client->name},\n\n";
                        $message .= "This is a reminder that your next booking deadline is in 48 hours.\n\n";
                        $message .= "Please book your next block of sessions before {$client->next_booking_deadline}.\n\n";
                        $message .= "If you don't book in time, you will automatically receive 3 sessions instead of 4 (same price).\n\n";
                        $message .= "Book now: " . config('app.frontend_url', 'http://localhost:3000') . "/client-booking?uuid={$client->uuid}\n\n";
                        $message .= "Best regards,\nVanquish Therapies";

                        Mail::to($client->email)->send(new GenericClientEmail(
                            $client->name,
                            'Booking Reminder - Action Required',
                            $message
                        ));

                        // Mark reminder as sent
                        $nextSession->update(['booking_reminder_sent' => true]);
                        $reminderCount++;

                        $this->info("Reminder sent to {$client->name} ({$client->email})");
                    } catch (\Exception $e) {
                        $this->error("Failed to send reminder to {$client->email}: " . $e->getMessage());
                    }
                }
            }
        }

        $this->info("Sent {$reminderCount} booking reminders.");
        return 0;
    }
}

