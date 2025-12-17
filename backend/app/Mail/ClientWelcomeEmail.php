<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientWelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $clientId;
    public $clientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName, $clientId, $clientEmail)
    {
        $this->clientName = $clientName;
        $this->clientId = $clientId;
        $this->clientEmail = $clientEmail;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Vanquish Therapies - Your Journey Begins',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.client-welcome',
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
