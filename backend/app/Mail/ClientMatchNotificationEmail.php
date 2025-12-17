<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientMatchNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $tcName;
    public $modality;
    public $matchScore;
    public $allocatedDay;
    public $allocatedTime;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName, $tcName, $modality = null, $matchScore = null, $allocatedDay = null, $allocatedTime = null)
    {
        $this->clientName = $clientName;
        $this->tcName = $tcName;
        $this->modality = $modality;
        $this->matchScore = $matchScore;
        $this->allocatedDay = $allocatedDay;
        $this->allocatedTime = $allocatedTime;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Great News! You\'ve Been Matched with a Counsellor - Vanquish Therapies',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.client-match-notification',
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
