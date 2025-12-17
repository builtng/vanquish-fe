<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TcMatchNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $tcName;
    public $clientName;
    public $clientAge;
    public $serviceType;
    public $matchScore;
    public $assignmentNotes;
    public $allocatedDay;
    public $allocatedTime;

    /**
     * Create a new message instance.
     */
    public function __construct($tcName, $clientName, $clientAge = null, $serviceType = null, $matchScore = null, $assignmentNotes = null, $allocatedDay = null, $allocatedTime = null)
    {
        $this->tcName = $tcName;
        $this->clientName = $clientName;
        $this->clientAge = $clientAge;
        $this->serviceType = $serviceType;
        $this->matchScore = $matchScore;
        $this->assignmentNotes = $assignmentNotes;
        $this->allocatedDay = $allocatedDay;
        $this->allocatedTime = $allocatedTime;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Client Assignment - Vanquish Therapies',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.tc-match-notification',
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
