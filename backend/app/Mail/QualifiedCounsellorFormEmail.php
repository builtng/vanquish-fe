<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class QualifiedCounsellorFormEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $tcName;
    public $tcUuid;
    public $formUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($tcName, $tcUuid)
    {
        $this->tcName = $tcName;
        $this->tcUuid = $tcUuid;
        $this->formUrl = config('app.frontend_url', 'http://localhost:3000') . '/qualified-counsellor-form?tc_id=' . $tcUuid;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Action Required: Complete Your Qualified Counsellor Form')
            ->view('emails.qualified-counsellor-form')
            ->with([
                'tcName' => $this->tcName,
                'tcUuid' => $this->tcUuid,
                'formUrl' => $this->formUrl,
            ]);
    }
}
