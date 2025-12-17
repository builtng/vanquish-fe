<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericTrainingCounsellorEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $tcName;
    public $emailSubject;
    public $emailMessage;

    /**
     * Create a new message instance.
     */
    public function __construct($tcName, $subject, $message)
    {
        $this->tcName = $tcName;
        $this->emailSubject = $subject;
        $this->emailMessage = $message;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->emailSubject)
            ->view('emails.generic-training-counsellor')
            ->with([
                'tcName' => $this->tcName,
                'subject' => $this->emailSubject,
                'emailBody' => $this->emailMessage,
            ]);
    }
}
