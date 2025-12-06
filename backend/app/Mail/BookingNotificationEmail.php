<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $tcName;
    public $clientName;
    public $bookingType;
    public $scheduledAt;
    public $details;

    /**
     * Create a new message instance.
     */
    public function __construct($tcName, $clientName, $bookingType, $scheduledAt, $details = [])
    {
        $this->tcName = $tcName;
        $this->clientName = $clientName;
        $this->bookingType = $bookingType; // 'consultation' or 'session'
        $this->scheduledAt = $scheduledAt;
        $this->details = $details;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->bookingType === 'consultation' 
            ? "New Consultation Booking: {$this->clientName}"
            : "New Session Booking: {$this->clientName}";

        return $this->subject($subject)
            ->view('emails.booking-notification')
            ->with([
                'tcName' => $this->tcName,
                'clientName' => $this->clientName,
                'bookingType' => $this->bookingType,
                'scheduledAt' => $this->scheduledAt,
                'details' => $this->details,
            ]);
    }
}

