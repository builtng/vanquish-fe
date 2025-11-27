<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericClientEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $subject;
    public $message;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName, $subject, $message)
    {
        $this->clientName = $clientName;
        $this->subject = $subject;
        $this->message = $message;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->subject)
            ->view('emails.generic-client')
            ->with([
                'clientName' => $this->clientName,
                'message' => $this->message,
            ]);
    }
}

