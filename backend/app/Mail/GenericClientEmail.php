<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericClientEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $emailSubject;
    public $emailMessage;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName, $subject, $message)
    {
        $this->clientName = $clientName;
        $this->emailSubject = $subject;
        $this->emailMessage = $message;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->emailSubject)
            ->view('emails.generic-client')
            ->with([
                'clientName' => $this->clientName,
                'subject' => $this->emailSubject,
                'message' => $this->emailMessage,
            ]);
    }
}
