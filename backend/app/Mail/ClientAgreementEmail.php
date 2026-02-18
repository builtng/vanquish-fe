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
    public $serviceType;

    /**
     * Create a new message instance.
     */
    public function __construct($clientName, $clientEmail = null, $clientUuid = null, $serviceType = null)
    {
        $this->clientName = $clientName;
        $this->clientEmail = $clientEmail;
        $this->clientUuid = $clientUuid;
        $this->serviceType = $serviceType;

        // Determine the correct agreement form URL based on service type
        $baseUrl = config('app.frontend_url', 'http://localhost:3000');
        $agreementPath = $this->getAgreementPath($serviceType);
        $fullUrl = rtrim($baseUrl, '/') . $agreementPath;

        $params = [];

        if ($clientEmail) {
            $params['email'] = $clientEmail;
        }

        if ($clientUuid) {
            $params['client_id'] = $clientUuid;
            $params['uuid'] = $clientUuid;
            $params['client_uuid'] = $clientUuid;
        }

        $this->agreementUrl = !empty($params)
            ? $fullUrl . '?' . http_build_query($params)
            : $fullUrl;
    }

    /**
     * Get the appropriate agreement path based on service type
     */
    private function getAgreementPath($serviceType)
    {
        // Normalize service type for comparison
        $normalizedType = strtolower(trim($serviceType ?? ''));

        // Check if it's a mid-range service
        if (
            strpos($normalizedType, 'mid') !== false ||
            strpos($normalizedType, 'medium') !== false ||
            $normalizedType === 'mid-range' ||
            $normalizedType === 'midrange'
        ) {
            return '/agreement/mid-range';
        }

        // Default to low-cost service agreement
        return '/agreement/low-cost';
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
