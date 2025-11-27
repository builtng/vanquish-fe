<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ClientAgreementEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $agreementUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName)
    {
        $this->clientName = $clientName;
        $this->agreementUrl = 'https://form.jotform.com/231635798225060';
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Action Required: Complete Your Service Agreement')
            ->view('emails.client-agreement')
            ->with([
                'clientName' => $this->clientName,
                'agreementUrl' => $this->agreementUrl,
            ]);
    }
}
