<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ClientFeedbackFormEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $formUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName)
    {
        $this->clientName = $clientName;
        $this->formUrl = 'https://form.jotform.com/240253970371050';
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('We Value Your Feedback - Client Satisfaction Survey')
            ->view('emails.client-feedback-form')
            ->with([
                'clientName' => $this->clientName,
                'formUrl' => $this->formUrl,
            ]);
    }
}
