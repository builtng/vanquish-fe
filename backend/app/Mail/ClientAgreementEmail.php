<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ClientAgreementEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $clientEmail;
    public $clientUuid;
    public $agreementUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName, $clientEmail = null, $clientUuid = null)
    {
        $this->clientName = $clientName;
        $this->clientEmail = $clientEmail;
        $this->clientUuid = $clientUuid;
        
        // Build agreement URL with pre-filled fields for better matching
        $baseUrl = 'https://form.jotform.com/231635798225060';
        $params = [];
        
        if ($clientEmail) {
            $params['email'] = $clientEmail;
        }
        
        if ($clientUuid) {
            $params['client_id'] = $clientUuid;
        }
        
        $this->agreementUrl = !empty($params) 
            ? $baseUrl . '?' . http_build_query($params)
            : $baseUrl;
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
