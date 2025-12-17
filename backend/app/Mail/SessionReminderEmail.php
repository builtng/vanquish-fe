<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SessionReminderEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $bookingType;
    public $tcName;
    public $scheduledAt;
    public $location;
    public $duration;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName, $bookingType, $tcName, $scheduledAt, $location = null, $duration = 50)
    {
        $this->clientName = $clientName;
        $this->bookingType = $bookingType;
        $this->tcName = $tcName;
        $this->scheduledAt = $scheduledAt;
        $this->location = $location;
        $this->duration = $duration;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reminder: Your Session Tomorrow - Vanquish Therapies',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.session-reminder',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
