<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericTrainingCounsellorEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $tcName;
    public $subject;
    public $message;

    /**
     * Create a new message instance.
     */
    public function __construct($tcName, $subject, $message)
    {
        $this->tcName = $tcName;
        $this->subject = $subject;
        $this->message = $message;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->subject)
            ->view('emails.generic-training-counsellor')
            ->with([
                'tcName' => $this->tcName,
                'message' => $this->message,
            ]);
    }
}

