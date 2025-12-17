<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrainingCounsellorWelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $tcName;
    public $tcId;
    public $tcEmail;
    public $modality;

    /**
     * Create a new message instance.
     */
    public function __construct($tcName, $tcId, $tcEmail, $modality = null)
    {
        $this->tcName = $tcName;
        $this->tcId = $tcId;
        $this->tcEmail = $tcEmail;
        $this->modality = $modality;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Vanquish Therapies - Join Our Team',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.tc-welcome',
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
