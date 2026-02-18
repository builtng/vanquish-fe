<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientBookingConfirmationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $bookingType;
    public $tcName;
    public $scheduledAt;
    public $location;
    public $duration;
    public $calendarLink;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName, $bookingType, $tcName, $scheduledAt, $location = null, $duration = 50, $calendarLink = null)
    {
        $this->clientName = $clientName;
        $this->bookingType = $bookingType;
        $this->tcName = $tcName;
        $this->scheduledAt = $scheduledAt; // Can be string or array
        $this->location = $location;
        $this->duration = $duration;
        $this->calendarLink = $calendarLink;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Confirmed - Vanquish Therapies',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.client-booking-confirmation',
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
