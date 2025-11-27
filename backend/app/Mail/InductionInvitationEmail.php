<?php

namespace App\Mail;

use App\Models\Induction;
use App\Models\InductionAttendee;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InductionInvitationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $induction;
    public $attendee;
    public $acceptanceUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Induction $induction, InductionAttendee $attendee)
    {
        $this->induction = $induction;
        $this->attendee = $attendee;
        $this->acceptanceUrl = url("/induction/accept/{$attendee->acceptance_token}");
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Induction Invitation - ' . $this->induction->trainingCounsellor->name)
            ->view('emails.induction-invitation')
            ->with([
                'induction' => $this->induction,
                'attendee' => $this->attendee,
                'acceptanceUrl' => $this->acceptanceUrl,
            ]);
    }
}

