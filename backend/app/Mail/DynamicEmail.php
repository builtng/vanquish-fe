<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Blade;

class DynamicEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $template;
    public $data;

    /**
     * Create a new message instance.
     * 
     * @param string $type The template type
     * @param array $data Data for placeholders
     */
    public function __construct($type, $data = [])
    {
        $this->template = EmailTemplate::where('type', $type)->first();

        // Fallback to default if not in DB
        if (!$this->template) {
            $defaults = $this->getDefaults();
            if (isset($defaults[$type])) {
                $this->template = (object) array_merge(['type' => $type], $defaults[$type]);
            } else {
                // Last resort fallback
                $this->template = (object) [
                    'subject' => 'Notification from Vanquish Therapies',
                    'body' => '<p>This is an automated notification.</p>',
                    'placeholders' => []
                ];
            }
        }

        $this->data = $data;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->renderString($this->template->subject);

        // Determine category based on template type
        $type = $this->template->type ?? collect(array_keys($this->getDefaults()))->first(fn($key) => $this->getDefaults()[$key]['subject'] == $this->template->subject);
        $category = $this->determineCategory($type);

        $sender = app(\App\Services\DynamicMailSenderService::class)->resolve($category);

        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address($sender['email'], $sender['name'] ?? config('mail.from.name')),
            subject: $subject,
        );
    }

    /**
     * Determine sender category based on email type
     */
    private function determineCategory($type): string
    {
        if (!$type) return 'general';

        $counsellorTypes = [
            'booking_notification',
            'tc_welcome',
            'tc_match_notification',
            'induction_invitation',
            'qualified_form',
            'generic_tc_email',
            'trainee_initial_invite',
            'trainee_application_received',
            'trainee_stage_two_invite',
            'trainee_video_interview_received',
            'trainee_stage_three_invite',
            'trainee_interview_reminder',
            'trainee_placement_acceptance',
            'trainee_placement_rejection',
            'trainee_portal_invite',
            'counsellor_portal_invite'
        ];

        $generalTypes = [
            // Any system level emails here if applicable
        ];

        if (in_array($type, $counsellorTypes)) {
            return 'counsellor';
        }

        if (in_array($type, $generalTypes)) {
            return 'general';
        }

        // Default to client since most emails are for clients
        return 'client';
    }

    /**
     * Email types that include their own styled header in the body HTML.
     * These should not show the outer layout header to avoid duplicates.
     */
    private array $selfHeaderedTypes = [
        'trainee_video_interview_received',
        'admin_video_review_notification',
        'trainee_stage_three_invite',
        'trainee_interview_confirmed',
        'trainee_interview_reminder',
        'trainee_placement_acceptance',
        'trainee_portal_invite',
        'counsellor_portal_invite',
    ];

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $type = $this->template->type ?? null;
        $hasOwnHeader = $type && in_array($type, $this->selfHeaderedTypes);

        // We use a base email layout and inject the rendered body
        return new Content(
            view: 'emails.dynamic-layout',
            with: [
                'body'         => $this->renderString($this->template->body),
                'hasOwnHeader' => $hasOwnHeader,
            ],
        );
    }

    /**
     * Render a string with placeholders.
     */
    private function renderString($string)
    {
        foreach ($this->data as $key => $value) {
            $string = str_replace('{{' . $key . '}}', $value, $string);
        }

        // Also support Blade-style if needed, but str_replace is safer for user-input templates
        return $string;
    }

    private function getDefaults()
    {
        return [
            'intake_submission' => [
                'subject' => 'We have received your intake form',
                'body' => '<h1>Hello {{client_name}},</h1><p>Thank thank you for submitting your intake form. We will review it and get back to you soon.</p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'email']
            ],
            'payment_confirmation' => [
                'subject' => 'Payment Confirmation - Vanquish Therapies',
                'body' => '<h1>Payment Received</h1><p>Hi {{client_name}},</p><p>We have successfully received your payment. Thank you for choosing Vanquish Therapies.</p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'email']
            ],

            'match_assigned' => [
                'subject' => 'You have been matched with a practitioner',
                'body' => '<h1>Great news!</h1><p>Hi {{client_name}},</p><p>You have been matched with {{tc_name}}.</p><p>The next step is to sign your service agreement. Please use the link below to review and sign your agreement. Once signed, you will be able to select your session slots and book your sessions directly.</p><p><a href="{{agreement_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Sign Service Agreement</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'tc_name', 'email', 'agreement_url']
            ],


            'agreement_sent' => [
                'subject' => 'Action Required: Service Agreement',
                'body' => '<h1>Service Agreement</h1><p>Hi {{client_name}},</p><p>Please review and sign the service agreement sent to your email.</p><p><a href="{{agreement_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Sign Agreement</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'email', 'agreement_url']
            ],
            'booking_confirmation' => [
                'subject' => 'Booking Confirmation - Vanquish Therapies',
                'body' => '<h1>Your Booking is Confirmed</h1><p>Hi {{client_name}},</p><p>Your {{booking_type}} with {{counsellor_name}} has been scheduled.</p><p><strong>Date:</strong> {{date}}</p><p><strong>Time:</strong> {{time}}</p><p><strong>Details:</strong> {{booking_details}}</p><p><strong>Location:</strong> {{location}}</p><p><strong>Duration:</strong> {{duration}} minutes</p><p><strong>Link:</strong> <a href="{{consultation_link}}">Join Session</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'booking_type', 'counsellor_name', 'booking_details', 'location', 'duration', 'consultation_link', 'date', 'time']
            ],
            'booking_notification' => [
                'subject' => 'New Booking Notification',
                'body' => '<h1>New Booking</h1><p>Hi {{tc_name}},</p><p>A new {{booking_type}} has been scheduled with you.</p><p><strong>Client:</strong> {{client_name}}</p><p><strong>Date/Time:</strong> {{scheduled_at}}</p><p><strong>Notes:</strong> {{notes}}</p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['tc_name', 'client_name', 'booking_type', 'scheduled_at', 'notes']
            ],
            'consultation_follow_up' => [
                'subject' => 'Consultation Update - Vanquish Therapies',
                'body' => '<h1>Consultation Completed</h1><p>Hi {{client_name}},</p><p>Thank you for attending your consultation. Your outcome is: <strong>{{outcome}}</strong>.</p><p>{{next_steps}}</p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'outcome', 'next_steps']
            ],
            'consultation_booking_link' => [
                'subject' => 'Book sessions - Vanquish Therapies',
                'body' => '<h1>Book sessions</h1><p>Hi {{client_name}},</p><p>Please use the button below to select a preferred date and time for your sessions.</p><p><a href="{{booking_link}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Book sessions</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'booking_link', 'tc_name', 'session_date']
            ],
            'feedback_form' => [
                'subject' => 'How are we doing? - Vanquish Therapies',
                'body' => '<h1>We value your feedback</h1><p>Hi {{client_name}},</p><p>We hope you are finding your sessions helpful. Could you please take a moment to provide us with some feedback?</p><p><a href="{{feedback_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Give Feedback</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'feedback_url']
            ],
            'tc_welcome' => [
                'subject' => 'Welcome to Vanquish Therapies',
                'body' => '<h1>Welcome, {{tc_name}}!</h1><p>We are excited to have you join our team. Your Practitioner ID is {{tc_id}}.</p><p><strong>Modality:</strong> {{modality}}</p><p>We will be in touch soon with next steps.</p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['tc_name', 'tc_id', 'email', 'modality']
            ],
            'tc_match_notification' => [
                'subject' => 'New Client Match - Action Required',
                'body' => '<h1>New Client Match</h1><p>Hi {{tc_name}},</p><p>You have been matched with a new client: {{client_name}}.</p><p><strong>Client Age:</strong> {{client_age}}</p><p><strong>Service Type:</strong> {{service_type}}</p><p><strong>Match Score:</strong> {{match_score}}%</p><p><strong>Notes:</strong> {{notes}}</p><p><a href="{{dashboard_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">View Client Details</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['tc_name', 'client_name', 'client_age', 'service_type', 'match_score', 'notes', 'dashboard_url']
            ],

            'induction_invitation' => [
                'subject' => 'Induction Session Invitation',
                'body' => '<h1>Induction Invitation</h1><p>Hi {{tc_name}},</p><p>You have been invited to an induction session on {{induction_date}}.</p><p><strong>Location:</strong> {{location}}</p><p><strong>Notes:</strong> {{notes}}</p><p><a href="{{acceptance_url}}" style="padding:10px 20px;background-color:green;color:white;text-decoration:none;border-radius:5px;">Accept Invitation</a> <a href="{{decline_url}}" style="padding:10px 20px;background-color:red;color:white;text-decoration:none;border-radius:5px;">Decline</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['tc_name', 'induction_date', 'location', 'notes', 'acceptance_url', 'decline_url']
            ],
            'qualified_form' => [
                'subject' => 'Action Required: Qualified Practitioner Form',
                'body' => '<h1>Transition to Qualified Practitioner</h1><p>Hi {{tc_name}},</p><p>Congratulations on becoming a qualified practitioner! Please complete the mandatory form to update your status.</p><p><a href="{{form_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Complete Form</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['tc_name', 'form_url']
            ],
            'session_reminder' => [
                'subject' => 'Upcoming Session Reminder',
                'body' => '<h1>Session Reminder</h1><p>Hi {{client_name}},</p><p>This is a reminder for your upcoming session with {{counsellor_name}} on {{scheduled_at}}.</p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'scheduled_at', 'counsellor_name']
            ],
            'booking_deadline_reminder' => [
                'subject' => 'Action Required: Session Booking Deadline',
                'body' => '<h1>Booking Deadline Reminder</h1><p>Hi {{client_name}},</p><p>Your next booking deadline is {{deadline_date}}. Please book your next block of sessions to avoid penalties.</p><p><a href="{{booking_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Book Now</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'deadline_date', 'booking_url']
            ],
            'generic_client_email' => [
                'subject' => 'Message from Vanquish Therapies',
                'body' => '<h1>Hello {{client_name}},</h1><div style="white-space: pre-wrap;">{{message}}</div>',
                'placeholders' => ['client_name', 'message']
            ],
            'generic_tc_email' => [
                'subject' => 'Message from Vanquish Therapies Admin',
                'body' => '<h1>Hello {{tc_name}},</h1><div style="white-space: pre-wrap;">{{message}}</div>',
                'placeholders' => ['tc_name', 'message']
            ],
            'auto_deduction_applied' => [
                'subject' => 'Booking Update - Auto-Deduction Applied',
                'body' => '<h1>Important Update</h1><p>Hi {{client_name}},</p><p>Your booking deadline has passed. As per our policy, you have been automatically allocated 3 sessions instead of 4 (same price).</p><p>Your sessions have been scheduled. Please check your booking portal for details.</p><p><a href="{{booking_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">View Bookings</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'booking_url']
            ],
            'booking_rescheduled' => [
                'subject' => 'Booking Rescheduled - Vanquish Therapies',
                'body' => '<h1>Your Booking has been Rescheduled</h1><p>Hi {{client_name}},</p><p>Your {{booking_type}} with {{counsellor_name}} has been scheduled.</p><p><strong>New Date/Time:</strong> {{new_scheduled_at}}</p><p><strong>Notes:</strong> {{notes}}</p><p><strong>Link:</strong> <a href="{{consultation_link}}">Join Session</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'booking_type', 'counsellor_name', 'new_scheduled_at', 'notes', 'consultation_link']
            ],
            'trainee_initial_invite' => [
                'subject' => 'Trainee Counsellor Placement Application',
                'body' => '
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p>Dear {{first_name}},</p>
    <p>Thank you for your email.</p>
    <p>We greatly appreciate your interest in our placement programme. To apply, please complete the Placement Application form provided below:</p>
    <p><a href="{{trainee_application_url}}" style="color: #6f1d56; font-weight: bold; text-decoration: underline;">Vanquish Therapies │ Trainee Counsellor Placement Application</a></p>
    <p><strong>We require the following mandatory documents to be uploaded to the application:</strong></p>
    <ul>
        <li>CV</li>
        <li>Evidence of fitness to practice.</li>
        <li>Prior Counselling Qualification Certificates (e.g., Level 3/Level 4)</li>
        <li>Recent enhanced DBS certificate – Adult workforce (if you do not have a DBS, this can be arranged).</li>
        <li>Valid ID (Driver’s license or Passport)</li>
    </ul>
    <p>Thank you again for your interest in our placement programme. We look forward to receiving your application.</p>
    <p>Kind regards,</p>
    <p><strong>Nicole McLaren</strong><br>
    SAR and Compliance Team | Vanquish Therapies<br>
    Integrative Life Coaching & Counselling<br>
    E: <a href="mailto:sar.compliance@vanquishtherapies.co.uk">sar.compliance@vanquishtherapies.co.uk</a><br>
    W: <a href="http://www.vanquishtherapies.co.uk/">www.vanquishtherapies.co.uk</a></p>
</div>',
                'placeholders' => ['first_name', 'trainee_application_url']
            ],

            'trainee_application_received' => [
                'subject' => 'Placement Application',
                'body' => '
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p>Dear {{first_name}},</p>
    <p>We hope this email finds you well.</p>
    <p>Thank you for expressing your interest in our placement programme. We greatly appreciate the time and effort you have put into your application.</p>
    <p>We will review your application soon, and if we require any further information, we will let you know promptly. Should your application be successful, you will be invited to the second stage of the process, which is a short video interview answering 5 easy questions. We will notify you accordingly once our evaluations are complete.</p>
    <p>Thank you again for your interest in our Placement Programme. We look forward to potentially working with you.</p>
    <p>Kind regards,</p>
    <p><strong>Nicole McLaren</strong><br>
    SAR and Compliance Team | Vanquish Therapies<br>
    Integrative Life Coaching & Counselling<br>
    E: <a href="mailto:sar.compliance@vanquishtherapies.co.uk">sar.compliance@vanquishtherapies.co.uk</a><br>
    W: <a href="http://www.vanquishtherapies.co.uk/">www.vanquishtherapies.co.uk</a></p>
</div>',
                'placeholders' => ['first_name']
            ],

            'trainee_stage_two_invite' => [
                'subject' => 'Congratulations! You Have Progressed to Stage 2 – Video Interview',
                'body' => '
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p>Dear {{first_name}},</p>
    <p>We hope this email finds you well.</p>
    <p>Congratulations on making it to the <strong>2nd stage out of 3</strong> of our vetting and interview process!</p>
    <p>This video interview process will take approximately <strong>15-20 minutes</strong> to complete. Please ensure you are in a quiet, private environment, and free from distractions before beginning, as your full attention is important. We appreciate your time and thoughtful responses.</p>
    <p><strong>We are inviting you to answer five simple questions - there are no trick questions. We are simply hoping to learn more about you and hear from your authentic, genuine self.</strong></p>
    <p><strong>Please note the following below:</strong></p>
    <ul>
        <li>You will have <strong>3 working days</strong> to begin this interview. If you do not begin the interview within this time frame, the link will expire, and you will need to reapply for the placement.</li>
        <li>Connect to the interview using your <strong>Computer/Laptop</strong>.</li>
        <li>You should <strong>respond to all questions in English</strong></li>
        <li>Please ensure that you <strong>grant permission to access your camera and microphone</strong>, as this is required to progress through the interview.</li>
        <li>If you have any issues with recording your videos, try using your mobile data connection.</li>
        <li>The recording will start automatically when you click on each question. Each question will have a time limit.</li>
    </ul>
    <p><strong>To begin,</strong> please click here - <a href="{{interview_url}}" style="color: #6f1d56; font-weight: bold; text-decoration: underline;">Video Interview - Vanquish Therapies Placement</a></p>
    <p>Best of luck! If you clear this stage, you will be invited for an online face-to-face interview.</p>
    <p>Kind regards,</p>
    <p><strong>Nicole McLaren</strong><br>
    SAR and Compliance Team | Vanquish Therapies<br>
    Integrative Life Coaching & Counselling<br>
    E: <a href="mailto:sar.compliance@vanquishtherapies.co.uk">sar.compliance@vanquishtherapies.co.uk</a><br>
    W: <a href="http://www.vanquishtherapies.co.uk/">www.vanquishtherapies.co.uk</a></p>
</div>',
                'placeholders' => ['first_name', 'interview_url']
            ],
            'trainee_video_interview_received' => [
                'subject' => 'Stage 2 Video Interview Received – Next Steps',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">

  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 36px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Video Interview Received</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Vanquish Therapies — Trainee Counsellor Placement</p>
  </div>

  <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e8e8; border-top: none;">

    <p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}}</strong>,</p>

    <p>Thank you for completing your Stage 2 video interview. We have <strong>successfully received all of your responses</strong> and your submission has been securely recorded.</p>

    <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 18px 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #166534;"><strong>What happens now?</strong><br>A member of our team will review your video interview — this typically takes <strong>3–5 working days</strong>.</p>
    </div>

    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">The Full Process</h2>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 8px 0 20px;">
      <tr>
        <td style="padding: 10px 14px; background: #e8f5e9; border-radius: 8px 0 0 0; font-weight: bold; color: #2e7d32; width: 30%; vertical-align: top; font-size: 13px;">✅ Stage 1</td>
        <td style="padding: 10px 14px; font-size: 14px; vertical-align: top; color: #555;">Application submitted and reviewed — <em>Completed</em></td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background: #e8f5e9; font-weight: bold; color: #2e7d32; font-size: 13px; vertical-align: top;">✅ Stage 2</td>
        <td style="padding: 10px 14px; font-size: 14px; vertical-align: top; color: #555;">Video interview submitted — <em>Under review</em></td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background: #f9f4f8; font-weight: bold; color: #6f1d56; font-size: 13px; vertical-align: top;">⏳ Stage 3</td>
        <td style="padding: 10px 14px; font-size: 14px; vertical-align: top;">Face-to-face placement interview — <em>Pending Stage 2 outcome</em></td>
      </tr>
    </table>

    <p style="font-size: 14px; color: #555;">If your video interview is successful, you will receive a <strong>Stage 3 invitation</strong> to book a face-to-face (online) interview with a member of the Vanquish leadership team. We will not contact you during the review period, so there is nothing further you need to do right now.</p>

    <div style="background: #f9f4f8; border-left: 4px solid #6f1d56; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #555;">If you have any concerns or need to make us aware of something, please contact us at <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a>.</p>
    </div>

    <p style="font-size: 14px;">Thank you again for your time and effort — we appreciate the dedication and vulnerability it takes to complete a video interview.</p>

    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 20px;">The Compliance Team<br>
    <span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>

  </div>

  <div style="background: #f5f5f5; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e8; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #aaa; margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
    <p style="font-size: 11px; color: #aaa; margin: 4px 0 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>

</div>',
                'placeholders' => ['first_name', 'full_name']
            ],
            'admin_video_review_notification' => [
                'subject' => '🎬 Action Required: Stage 2 Video Ready for Review – {{applicant_name}}',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 24px 28px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 18px;">🎬 Stage 2 Video Submission Ready</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">Vanquish Therapies — Admin Notification</p>
  </div>
  <div style="background: #fff; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0; font-size: 14px;">A trainee applicant has completed their <strong>Stage 2 HireVire video interview</strong> and their responses are now ready for your review.</p>
    <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 14px; margin: 16px 0;">
      <tr style="background: #f8fafc;"><td style="padding: 10px 14px; font-weight: bold; width: 35%; color: #64748b; border: 1px solid #e2e8f0;">Applicant</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">{{applicant_name}}</td></tr>
      <tr><td style="padding: 10px 14px; font-weight: bold; color: #64748b; border: 1px solid #e2e8f0;">Email</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">{{applicant_email}}</td></tr>
      <tr style="background: #f8fafc;"><td style="padding: 10px 14px; font-weight: bold; color: #64748b; border: 1px solid #e2e8f0;">Submitted At</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">{{submitted_at}}</td></tr>
    </table>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{dashboard_url}}" style="display:inline-block;padding:12px 28px;background:#6f1d56;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">Review Application in Dashboard →</a>
    </div>
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">After reviewing the video, update the status to <em>Stage 2 Approved</em> or <em>Rejected</em> in the dashboard to trigger the corresponding email to the applicant.</p>
  </div>
</div>',
                'placeholders' => ['applicant_name', 'applicant_email', 'submitted_at', 'dashboard_url']
            ],
            'trainee_stage_three_invite' => [
                'subject' => 'Congratulations! Stage 2 Passed – Book Your Placement Interview',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 36px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">🌟</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Stage 3 — Placement Interview</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Vanquish Therapies — Trainee Counsellor Placement</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e8e8; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}}</strong>,</p>
    <p>Excellent news! We are thrilled to inform you that you have <strong>successfully passed Stage 2</strong> of the Vanquish Therapies Trainee Counsellor Placement process. Your video interview was impressive, and we look forward to meeting you in person.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{booking_link}}" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#6f1d56,#9b2c7e);color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:16px;">📅 Book My Placement Interview</a>
      <p style="margin: 10px 0 0; font-size: 12px; color: #888;">Powered by Trafft — select a date and time that suits you</p>
    </div>
    <div style="background: #f9f4f8; border-left: 4px solid #6f1d56; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: bold; color: #6f1d56;">Upcoming Induction Date (for reference):</p>
      <p style="margin: 6px 0 0; font-size: 16px; font-weight: bold; color: #333;">{{induction_date}}</p>
      <p style="margin: 4px 0 0; font-size: 12px; color: #777;">Successful candidates will be invited to attend this induction session.</p>
    </div>
    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">What to Expect</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 8px 0 20px;">
      <tr><td style="padding: 10px 14px; background: #f9f4f8; width: 30%; font-weight: bold; color: #6f1d56; font-size: 13px;">💻 Format</td><td style="padding: 10px 14px; font-size: 14px;">Online via Zoom (link sent after booking)</td></tr>
      <tr><td style="padding: 10px 14px; background: #f0e6ed; font-weight: bold; color: #6f1d56; font-size: 13px;">⏱ Duration</td><td style="padding: 10px 14px; font-size: 14px;">Approximately 30–45 minutes</td></tr>
      <tr><td style="padding: 10px 14px; background: #f9f4f8; font-weight: bold; color: #6f1d56; font-size: 13px;">📝 Focus</td><td style="padding: 10px 14px; font-size: 14px;">Placement suitability, clinical experience, and personal development</td></tr>
      <tr><td style="padding: 10px 14px; background: #f0e6ed; font-weight: bold; color: #6f1d56; font-size: 13px;">📎 Bring</td><td style="padding: 10px 14px; font-size: 14px;">A working camera & microphone, and a quiet environment</td></tr>
    </table>
    <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #713f12;"><strong>⚠️ Important:</strong> Please book your interview as soon as possible. Slots are limited and fill up quickly. If you have any difficulty booking, contact us at <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a>.</p>
    </div>
    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 20px;">The Compliance Team<br><span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>
  </div>
  <div style="background: #f5f5f5; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e8; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #aaa; margin: 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>
</div>',
                'placeholders' => ['first_name', 'full_name', 'booking_link', 'induction_date']
            ],
            'trainee_interview_confirmed' => [
                'subject' => '📊 Interview Confirmed – Vanquish Therapies Placement',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 36px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">📅</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Interview Confirmed</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Vanquish Therapies — Placement Interview</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e8e8; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}}</strong>,</p>
    <p>Great news! Your placement interview has been <strong>successfully booked</strong>. Please keep the details below safe — a reminder will be sent 48 hours before your interview.</p>
    <div style="background: #f9f4f8; border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid #e8d5e4;">
      <h2 style="color: #6f1d56; margin: 0 0 16px; font-size: 18px; text-align: center;">Your Interview Details</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding: 8px 0; font-size: 13px; color: #888; width: 120px;">DATE</td><td style="padding: 8px 0; font-size: 15px; font-weight: bold; color: #333;">{{date}}</td></tr>
        <tr><td style="padding: 8px 0; font-size: 13px; color: #888;">TIME</td><td style="padding: 8px 0; font-size: 15px; font-weight: bold; color: #333;">{{time}}</td></tr>
        <tr><td style="padding: 8px 0; font-size: 13px; color: #888;">HOST</td><td style="padding: 8px 0; font-size: 14px; color: #333;">{{host_name}}</td></tr>
        <tr><td style="padding: 8px 0; font-size: 13px; color: #888;">MEETING ID</td><td style="padding: 8px 0; font-size: 14px; color: #333; font-family: monospace;">{{meeting_id}}</td></tr>
      </table>
      <div style="text-align: center; margin-top: 20px;">
        <a href="{{zoom_link}}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6f1d56,#9b2c7e);color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;">🔗 Join via Zoom</a>
      </div>
    </div>
    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">Before Your Interview</h2>
    <ul style="padding-left: 20px; line-height: 2.2; font-size: 14px; color: #444;">
      <li>✅ Join the Zoom call <strong>5 minutes early</strong></li>
      <li>✅ Ensure you are in a <strong>quiet, private location</strong></li>
      <li>✅ Test your <strong>camera and microphone</strong> beforehand</li>
      <li>✅ Have a <strong>valid photo ID</strong> ready to present</li>
      <li>✅ Dress <strong>professionally</strong> — treat this as a formal interview</li>
      <li>✅ Have a copy of your <strong>application and CV</strong> nearby for reference</li>
    </ul>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #7f1d1d;"><strong>⚠️ Need to reschedule?</strong> If you need to change your interview date, please contact us immediately at <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a> and we will do our best to accommodate you.</p>
    </div>
    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 20px;">The Compliance Team<br><span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>
  </div>
  <div style="background: #f5f5f5; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e8; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #aaa; margin: 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>
</div>',
                'placeholders' => ['first_name', 'full_name', 'date', 'time', 'zoom_link', 'meeting_id', 'host_name', 'service_name', 'scheduled_at']
            ],
            'trainee_interview_reminder' => [
                'subject' => '⏰ 48-Hour Reminder: Your Placement Interview Tomorrow',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 36px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">⏰</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Interview Reminder</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Vanquish Therapies — Placement Interview</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e8e8; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}}</strong>,</p>
    <p>This is a <strong>friendly reminder</strong> that your Vanquish Therapies Placement Interview is coming up soon. We look forward to speaking with you!</p>
    <div style="background: #f0e6ed; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; border: 2px solid #d8b4d0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #6f1d56; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Your Interview</p>
      <p style="margin: 0; font-size: 22px; font-weight: bold; color: #4a0d3a;">{{scheduled_at}}</p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{zoom_link}}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6f1d56,#9b2c7e);color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;">🔗 Join via Zoom</a>
      <p style="margin: 8px 0 0; font-size: 12px; color: #888;">Click this link at the time of your interview</p>
    </div>
    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">Last-Minute Checklist</h2>
    <ul style="padding-left: 20px; line-height: 2.2; font-size: 14px; color: #444;">
      <li>✅ Test your <strong>camera and microphone</strong> now</li>
      <li>✅ Find a <strong>quiet, well-lit location</strong></li>
      <li>✅ Charge your device or plug it in</li>
      <li>✅ Have your <strong>photo ID</strong> ready</li>
      <li>✅ Join the call <strong>5 minutes early</strong></li>
      <li>✅ Close unnecessary browser tabs and apps</li>
    </ul>
    <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #713f12;"><strong>💡 Tip:</strong> If you have any technical issues on the day, contact us immediately at <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a> before your scheduled time.</p>
    </div>
    <p style="font-size: 14px;">Good luck, {{first_name}} — we look forward to meeting you!</p>
    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 20px;">The Compliance Team<br><span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>
  </div>
  <div style="background: #f5f5f5; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e8; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #aaa; margin: 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>
</div>',
                'placeholders' => ['first_name', 'scheduled_at', 'zoom_link', 'date', 'time', 'host_name']
            ],
            'trainee_placement_acceptance' => [
                'subject' => '🎉 Congratulations! You’ve been accepted for Placement at Vanquish Therapies',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 12px;">🎊</div>
    <h1 style="color: white; margin: 0; font-size: 26px;">Welcome to the Team!</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px;">Official Placement Offer — Vanquish Therapies</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}}</strong>,</p>
    <p>Following your interview, our clinical team was highly impressed with your approach and potential. We are delighted to officially offer you a <strong>Trainee Counsellor Placement</strong> at Vanquish Therapies.</p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 28px 0; border: 1px solid #e2e8f0;">
      <h2 style="color: #6f1d56; margin: 0 0 16px; font-size: 18px;">Induction Details</h2>
      <p style="margin: 0; font-size: 14px; color: #64748b;">Your mandatory online induction is scheduled for:</p>
      <p style="margin: 8px 0 0; font-size: 18px; font-weight: bold; color: #6f1d56;">{{induction_date}}</p>
      <p style="margin: 12px 0 0; font-size: 13px; color: #475569;"><strong>Zoom Link:</strong> <a href="{{induction_zoom_link}}" style="color:#6f1d56;text-decoration:none;">Join Induction Meeting ➡️</a></p>
    </div>

    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">Action Required: Onboarding Paperwork</h2>
    <p style="font-size: 14px; color: #475569;">To finalize your placement, please complete the two items below <strong>before</strong> your induction date:</p>

    <div style="margin: 20px 0;">
      <div style="padding: 16px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0; font-size: 14px;"><strong>1. Sign the 4-Way Agreement</strong></p>
        <p style="margin: 4px 0 12px; font-size: 12px; color: #92400e;">Please download the attached agreement, obtain signatures from your Tutor and Clinical Supervisor, and return it to us.</p>
        <a href="{{agreement_download_link}}" style="font-size:13px; font-weight:bold; color:#b45309; text-decoration:underline;">📥 Download 4-Way Agreement (.docx)</a>
      </div>

      <div style="padding: 16px; background: #fdf2f8; border: 1px solid #e8d5e4; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px;"><strong>2. Confirm Personal Therapy</strong></p>
        <p style="margin: 4px 0 12px; font-size: 12px; color: #6f1d56;">As per clinical standards, please confirm your therapy hours via the form below.</p>
        <a href="{{therapy_form_url}}" target="_blank" style="display:inline-block;padding:10px 20px;background:#6f1d56;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:13px;">📝 Complete Therapy Form</a>
      </div>
    </div>

    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 32px;">Welcome to the Vanquish family!<br><span style="font-weight: normal; color: #777; font-size: 13px;">Compliance & Clinical Lead</span></p>
  </div>
  <div style="background: #f8fafc; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>
</div>',
                'placeholders' => ['first_name', 'induction_date', 'induction_zoom_link', 'agreement_download_link', 'therapy_form_url']
            ],
            'trainee_portal_invite' => [
                'subject' => '🔐 Your Vanquish Therapies Practitioner Portal Access',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 12px;">🔐</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Portal Access Granted</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px;">Practitioner Onboarding — Vanquish Therapies</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hello <strong>{{first_name}}</strong>,</p>
    <p>We are excited to grant you access to the <strong>Vanquish Practitioner Portal</strong>. This will be your hub for client matching, session notes, policy documents, and clinical oversight.</p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin: 24px 0;">
      <h2 style="color: #6f1d56; margin: 0 0 14px; font-size: 16px;">🔑 Your Login Credentials</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 130px;">Login Email</td><td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #6f1d56; font-family: monospace;">{{email}}</td></tr>
        <tr><td style="padding: 6px 0; font-size: 13px; color: #64748b;">Temporary Password</td><td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #6f1d56; font-family: monospace;">{{temporary_password}}</td></tr>
      </table>
      <p style="margin: 12px 0 0; font-size: 12px; color: #94a3b8;">⚠️ Please change your password after your first login for security.</p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="{{portal_link}}" style="display:inline-block;padding:16px 36px;background:#6f1d56;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:16px;">🚀 Access My Portal Now</a>
      <p style="margin: 10px 0 0; font-size: 12px; color: #888;">Sign in with the credentials above</p>
    </div>

    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Onboarding Checklist</h2>
    <p style="font-size: 14px; color: #475569;">Once inside your portal, please complete these induction steps:</p>
    <ul style="padding-left: 20px; line-height: 2; font-size: 14px; color: #333;">
      <li>📖 Read the <strong>Welcome Guide &amp; Practitioner Handbook</strong></li>
      <li>✍️ Sign the <strong>Induction Disclosure Form</strong></li>
      <li>📂 Upload your <strong>Professional Certificates</strong> &amp; <strong>Insurance</strong></li>
      <li>🔒 Change your <strong>temporary password</strong> immediately</li>
      <li>📞 Confirm the <strong>Emergency WhatsApp line: +44 0800 008 6556</strong></li>
    </ul>

    <div style="background: #fdf2f8; border: 1px solid #fce7f3; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #9d174d;"><strong>💡 Need Help?</strong> Contact our team at <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a> and we will be happy to assist you.</p>
    </div>

    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 20px;">The Compliance Team<br><span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>
  </div>
  <div style="background: #f8fafc; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>
</div>',
                'placeholders' => ['first_name', 'portal_link', 'email', 'temporary_password']
            ],
            'counsellor_portal_invite' => [
                'subject' => '🔐 Your Vanquish Therapies Practitioner Portal Access',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 12px;">🔐</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Portal Access Granted</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px;">Practitioner Portal Access — Vanquish Therapies</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hello <strong>{{first_name}}</strong>,</p>
    <p>We are pleased to invite you to the <strong>Vanquish Practitioner Portal</strong>. This portal will serve as your primary platform for managing your client roster, submitting session notes, and accessing important clinical documents.</p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin: 24px 0;">
      <h2 style="color: #6f1d56; margin: 0 0 14px; font-size: 16px;">🔑 Your Login Credentials</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 130px;">Login Email</td><td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #6f1d56; font-family: monospace;">{{email}}</td></tr>
        <tr><td style="padding: 6px 0; font-size: 13px; color: #64748b;">Temporary Password</td><td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #6f1d56; font-family: monospace;">{{temporary_password}}</td></tr>
      </table>
      <p style="margin: 12px 0 0; font-size: 12px; color: #94a3b8;">⚠️ For security, you will be prompted to change your password upon your first login.</p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="{{portal_link}}" style="display:inline-block;padding:16px 36px;background:#6f1d56;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:16px;">🚀 Access Practitioner Portal</a>
      <p style="margin: 10px 0 0; font-size: 12px; color: #888;">Log in with the credentials provided above</p>
    </div>

    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Getting Started</h2>
    <p style="font-size: 14px; color: #475569;">To ensure a smooth transition to the portal, please complete the following steps:</p>
    <ul style="padding-left: 20px; line-height: 2; font-size: 14px; color: #333;">
      <li>🔐 Update your <strong>temporary password</strong> to a secure personal one</li>
      <li>📂 Review your <strong>Active Clients</strong> list for accuracy</li>
      <li>📖 Access the <strong>Practitioner Handbook</strong> in the shared documents section</li>
      <li>📞 Save the <strong>Emergency Clinical Support Line</strong> to your contacts</li>
    </ul>

    <div style="background: #fdf2f8; border: 1px solid #fce7f3; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #9d174d;"><strong>💡 Support Needed?</strong> If you encounter any technical issues, please contact <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a>.</p>
    </div>

    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 20px;">The Compliance Team<br><span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>
  </div>
  <div style="background: #f8fafc; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>
</div>',
                'placeholders' => ['first_name', 'portal_link', 'email', 'temporary_password']
            ],
            'trainee_placement_rejection' => [
                'subject' => 'Update on your application',
                'body' => '<h1>Application Update</h1><p>Hello {{first_name}},</p><p>Thank you for your interest in joining Vanquish Therapies and for taking the time to attend the interview process.</p><p>After careful consideration, we regret to inform you that we will not be moving forward with your placement at this time.</p><p>We wish you the very best in your future clinical career.</p>',
                'placeholders' => ['first_name']
            ],
        ];
    }
}
