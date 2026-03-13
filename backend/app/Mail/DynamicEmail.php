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
                $this->template = (object) $defaults[$type];
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
            'trainee_application_received',
            'trainee_stage_two_invite',
            'trainee_video_interview_received',
            'trainee_stage_three_invite',
            'trainee_interview_reminder',
            'trainee_placement_acceptance',
            'trainee_placement_rejection',
            'trainee_portal_invite'
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
     * Get the message content definition.
     */
    public function content(): Content
    {
        // We use a base email layout and inject the rendered body
        return new Content(
            view: 'emails.dynamic-layout',
            with: [
                'body' => $this->renderString($this->template->body)
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
                'body' => '<h1>Hello {{client_name}},</h1><p>Thank you for submitting your intake form. We will review it and get back to you soon.</p>',
                'placeholders' => ['client_name', 'email']
            ],
            'payment_confirmation' => [
                'subject' => 'Payment Confirmation - Vanquish Therapies',
                'body' => '<h1>Payment Received</h1><p>Hi {{client_name}},</p><p>We have successfully received your payment. Thank you for choosing Vanquish Therapies.</p>',
                'placeholders' => ['client_name', 'email']
            ],

            'match_assigned' => [
                'subject' => 'You have been matched with a practitioner',
                'body' => '<h1>Great news!</h1><p>Hi {{client_name}},</p><p>You have been matched with {{tc_name}}.</p><p>The next step is to sign your service agreement. Please use the link below to review and sign your agreement. Once signed, you will be able to select your session slots and book your sessions directly.</p><p><a href="{{agreement_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Sign Service Agreement</a></p><p>Warm regards,<br>The Vanquish Therapies Team</p>',
                'placeholders' => ['client_name', 'tc_name', 'email', 'agreement_url']
            ],


            'agreement_sent' => [
                'subject' => 'Action Required: Service Agreement',
                'body' => '<h1>Service Agreement</h1><p>Hi {{client_name}},</p><p>Please review and sign the service agreement sent to your email.</p><p><a href="{{agreement_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Sign Agreement</a></p>',
                'placeholders' => ['client_name', 'email', 'agreement_url']
            ],
            'booking_confirmation' => [
                'subject' => 'Booking Confirmation - Vanquish Therapies',
                'body' => '<h1>Your Booking is Confirmed</h1><p>Hi {{client_name}},</p><p>Your {{booking_type}} with {{counsellor_name}} has been scheduled.</p><p><strong>Date:</strong> {{date}}</p><p><strong>Time:</strong> {{time}}</p><p><strong>Details:</strong> {{booking_details}}</p><p><strong>Location:</strong> {{location}}</p><p><strong>Duration:</strong> {{duration}} minutes</p><p><strong>Link:</strong> <a href="{{consultation_link}}">Join Session</a></p>',
                'placeholders' => ['client_name', 'booking_type', 'counsellor_name', 'booking_details', 'location', 'duration', 'consultation_link', 'date', 'time']
            ],
            'booking_notification' => [
                'subject' => 'New Booking Notification',
                'body' => '<h1>New Booking</h1><p>Hi {{tc_name}},</p><p>A new {{booking_type}} has been scheduled with you.</p><p><strong>Client:</strong> {{client_name}}</p><p><strong>Date/Time:</strong> {{scheduled_at}}</p><p><strong>Notes:</strong> {{notes}}</p>',
                'placeholders' => ['tc_name', 'client_name', 'booking_type', 'scheduled_at', 'notes']
            ],
            'consultation_follow_up' => [
                'subject' => 'Consultation Update - Vanquish Therapies',
                'body' => '<h1>Consultation Completed</h1><p>Hi {{client_name}},</p><p>Thank you for attending your consultation. Your outcome is: <strong>{{outcome}}</strong>.</p><p>{{next_steps}}</p>',
                'placeholders' => ['client_name', 'outcome', 'next_steps']
            ],
            'consultation_booking_link' => [
                'subject' => 'Book sessions - Vanquish Therapies',
                'body' => '<h1>Book sessions</h1><p>Hi {{client_name}},</p><p>Please use the button below to select a preferred date and time for your sessions.</p><p><a href="{{booking_link}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Book sessions</a></p>',
                'placeholders' => ['client_name', 'booking_link', 'tc_name', 'session_date']
            ],
            'feedback_form' => [
                'subject' => 'How are we doing? - Vanquish Therapies',
                'body' => '<h1>We value your feedback</h1><p>Hi {{client_name}},</p><p>We hope you are finding your sessions helpful. Could you please take a moment to provide us with some feedback?</p><p><a href="{{feedback_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Give Feedback</a></p>',
                'placeholders' => ['client_name', 'feedback_url']
            ],
            'tc_welcome' => [
                'subject' => 'Welcome to Vanquish Therapies',
                'body' => '<h1>Welcome, {{tc_name}}!</h1><p>We are excited to have you join our team. Your Practitioner ID is {{tc_id}}.</p><p><strong>Modality:</strong> {{modality}}</p><p>We will be in touch soon with next steps.</p>',
                'placeholders' => ['tc_name', 'tc_id', 'email', 'modality']
            ],
            'tc_match_notification' => [
                'subject' => 'New Client Match - Action Required',
                'body' => '<h1>New Client Match</h1><p>Hi {{tc_name}},</p><p>You have been matched with a new client: {{client_name}}.</p><p><strong>Client Age:</strong> {{client_age}}</p><p><strong>Service Type:</strong> {{service_type}}</p><p><strong>Match Score:</strong> {{match_score}}%</p><p><strong>Notes:</strong> {{notes}}</p><p><a href="{{dashboard_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">View Client Details</a></p>',
                'placeholders' => ['tc_name', 'client_name', 'client_age', 'service_type', 'match_score', 'notes', 'dashboard_url']
            ],

            'induction_invitation' => [
                'subject' => 'Induction Session Invitation',
                'body' => '<h1>Induction Invitation</h1><p>Hi {{tc_name}},</p><p>You have been invited to an induction session on {{induction_date}}.</p><p><strong>Location:</strong> {{location}}</p><p><strong>Notes:</strong> {{notes}}</p><p><a href="{{acceptance_url}}" style="padding:10px 20px;background-color:green;color:white;text-decoration:none;border-radius:5px;">Accept Invitation</a> <a href="{{decline_url}}" style="padding:10px 20px;background-color:red;color:white;text-decoration:none;border-radius:5px;">Decline</a></p>',
                'placeholders' => ['tc_name', 'induction_date', 'location', 'notes', 'acceptance_url', 'decline_url']
            ],
            'qualified_form' => [
                'subject' => 'Action Required: Qualified Practitioner Form',
                'body' => '<h1>Transition to Qualified Practitioner</h1><p>Hi {{tc_name}},</p><p>Congratulations on becoming a qualified practitioner! Please complete the mandatory form to update your status.</p><p><a href="{{form_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Complete Form</a></p>',
                'placeholders' => ['tc_name', 'form_url']
            ],
            'session_reminder' => [
                'subject' => 'Upcoming Session Reminder',
                'body' => '<h1>Session Reminder</h1><p>Hi {{client_name}},</p><p>This is a reminder for your upcoming session with {{counsellor_name}} on {{scheduled_at}}.</p>',
                'placeholders' => ['client_name', 'scheduled_at', 'counsellor_name']
            ],
            'booking_deadline_reminder' => [
                'subject' => 'Action Required: Session Booking Deadline',
                'body' => '<h1>Booking Deadline Reminder</h1><p>Hi {{client_name}},</p><p>Your next booking deadline is {{deadline_date}}. Please book your next block of sessions to avoid penalties.</p><p><a href="{{booking_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Book Now</a></p>',
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
                'body' => '<h1>Important Update</h1><p>Hi {{client_name}},</p><p>Your booking deadline has passed. As per our policy, you have been automatically allocated 3 sessions instead of 4 (same price).</p><p>Your sessions have been scheduled. Please check your booking portal for details.</p><p><a href="{{booking_url}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">View Bookings</a></p>',
                'placeholders' => ['client_name', 'booking_url']
            ],
            'booking_rescheduled' => [
                'subject' => 'Booking Rescheduled - Vanquish Therapies',
                'body' => '<h1>Your Booking has been Rescheduled</h1><p>Hi {{client_name}},</p><p>Your {{booking_type}} with {{counsellor_name}} has been rescheduled.</p><p><strong>New Date/Time:</strong> {{new_scheduled_at}}</p><p><strong>Notes:</strong> {{notes}}</p><p><strong>Link:</strong> <a href="{{consultation_link}}">Join Session</a></p>',
                'placeholders' => ['client_name', 'booking_type', 'counsellor_name', 'new_scheduled_at', 'notes', 'consultation_link']
            ],
            'trainee_application_received' => [
                'subject' => 'Stage 1 Application Received – Vanquish Therapies Trainee Placement',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">

  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 36px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Application Received</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Vanquish Therapies — Trainee Counsellor Placement</p>
  </div>

  <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e8e8; border-top: none;">

    <p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}} {{last_name}}</strong>,</p>

    <p>Thank you for submitting your Stage 1 placement application to <strong>Vanquish Therapies</strong>. We are pleased to confirm that we have <strong>successfully received your application</strong>, including all personal information, course details, and any supporting documents you uploaded.</p>

    <div style="background: #f9f4f8; border-left: 4px solid #6f1d56; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #555;"><strong>Submission Email:</strong> {{email}}</p>
      <p style="margin: 6px 0 0; font-size: 14px; color: #555;">Please keep this email for your records. A copy of the submitted form is not separately provided.</p>
    </div>

    <h2 style="color: #6f1d56; font-size: 18px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">Review Process &amp; Timeline</h2>

    <p>Our <strong>Compliance Team</strong> and clinical lead review every application carefully and personally. Here is what to expect:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 12px 16px; background: #f9f4f8; border-radius: 8px 0 0 0; font-weight: bold; color: #6f1d56; width: 30%; vertical-align: top; font-size: 14px;">⏱ 48–72 hours</td>
        <td style="padding: 12px 16px; font-size: 14px; vertical-align: top;">Initial review of your application, documents, and course information by our clinical lead.</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; background: #f0e6ed; font-weight: bold; color: #6f1d56; font-size: 14px; vertical-align: top;">📧 Stage 2 Invitation</td>
        <td style="padding: 12px 16px; font-size: 14px; vertical-align: top;">If your application meets our placement criteria, you will receive a <strong>Stage 2 Video Interview invitation</strong> within 48 hours of this email.</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; background: #f9f4f8; border-radius: 0 0 0 8px; font-weight: bold; color: #6f1d56; font-size: 14px; vertical-align: top;">🎥 Stage 2: Video</td>
        <td style="padding: 12px 16px; font-size: 14px; vertical-align: top;">You will complete a structured asynchronous video interview (approx. 15–20 minutes) from the comfort of your home.</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; background: #f0e6ed; border-radius: 0 0 8px 0; font-weight: bold; color: #6f1d56; font-size: 14px; vertical-align: top;">🤝 Stage 3: Interview</td>
        <td style="padding: 12px 16px; font-size: 14px; vertical-align: top;">Successful Stage 2 candidates are invited to a final face-to-face (online) interview with a member of the Vanquish leadership team.</td>
      </tr>
    </table>

    <h2 style="color: #6f1d56; font-size: 18px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">What Happens Next</h2>

    <ul style="padding-left: 20px; line-height: 1.8; font-size: 14px; color: #444;">
      <li>You do not need to take any action at this stage — we will contact you directly.</li>
      <li>If you are progressed to Stage 2, you will receive a separate email with a personal video interview link.</li>
      <li>Please ensure your emails from <strong>no-reply@vanquishtherapies.co.uk</strong> are not going to your spam folder.</li>
      <li>Should you need to update any information in your application, please email <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a>.</li>
    </ul>

    <div style="background: #fffbf0; border: 1px solid #f0d080; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #7a6000;"><strong>⚠️ Important:</strong> If you have not received a Stage 2 invitation within <strong>72 hours</strong>, please check your spam folder before contacting us. Due to high application volumes, we are unable to provide individual updates on the status of your application during the review period.</p>
    </div>

    <p style="font-size: 14px;">We appreciate your interest in joining our team and the commitment and effort you have put into this application. We look forward to reviewing your work.</p>

    <p style="font-size: 14px;">Warm regards,</p>
    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 4px;">The Compliance Team<br>
    <span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>

  </div>

  <div style="background: #f5f5f5; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e8; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #aaa; margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
    <p style="font-size: 11px; color: #aaa; margin: 4px 0 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>

</div>',
                'placeholders' => ['first_name', 'last_name', 'email']
            ],
            'trainee_stage_two_invite' => [
                'subject' => 'Congratulations! You Have Progressed to Stage 2 – Video Interview',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">

  <div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 36px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Stage 2 — Video Interview</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Vanquish Therapies — Trainee Counsellor Placement</p>
  </div>

  <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e8e8; border-top: none;">

    <p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}}</strong>,</p>

    <p>We are delighted to inform you that, following our review of your Stage 1 application, you have been selected to progress to <strong>Stage 2</strong> of the Vanquish Therapies Trainee Counsellor Placement process.</p>

    <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 18px 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 16px; font-size: 15px; font-weight: bold; color: #166534;">Complete your video interview by:</p>
      <p style="margin: 0; font-size: 22px; font-weight: bold; color: #15803d;">{{deadline_date}}</p>
      <p style="margin: 6px 0 0; font-size: 12px; color: #166534;">(3 working days from receipt of this email)</p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="{{interview_url}}" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#6f1d56,#9b2c7e);color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:16px;letter-spacing:0.3px;">🎬 Start My Video Interview</a>
      <p style="margin: 10px 0 0; font-size: 12px; color: #888;">Powered by HireVire</p>
    </div>

    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">What to Expect</h2>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 8px 0 20px;">
      <tr>
        <td style="padding: 10px 14px; background: #f9f4f8; border-radius: 8px 0 0 0; font-weight: bold; color: #6f1d56; width: 30%; vertical-align: top; font-size: 13px;">📋 Questions</td>
        <td style="padding: 10px 14px; font-size: 14px; vertical-align: top;">5 structured questions relating to your counselling background, approach, and suitability for the placement.</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background: #f0e6ed; font-weight: bold; color: #6f1d56; font-size: 13px; vertical-align: top;">⏱ Duration</td>
        <td style="padding: 10px 14px; font-size: 14px; vertical-align: top;">Approximately <strong>15–20 minutes</strong> to complete all 5 responses.</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background: #f9f4f8; font-weight: bold; color: #6f1d56; font-size: 13px; vertical-align: top;">📅 Deadline</td>
        <td style="padding: 10px 14px; font-size: 14px; vertical-align: top;">You must submit your video interview within <strong>3 working days</strong> of receiving this email.</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background: #f0e6ed; font-weight: bold; color: #6f1d56; font-size: 13px; vertical-align: top;">🌍 Language</td>
        <td style="padding: 10px 14px; font-size: 14px; vertical-align: top;">All responses must be given in <strong>English</strong>.</td>
      </tr>
    </table>

    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">Technical Requirements</h2>

    <p style="font-size: 14px; color: #555; margin-bottom: 12px;">Before starting, please ensure your setup meets the following requirements:</p>

    <ul style="padding-left: 20px; line-height: 2; font-size: 14px; color: #444;">
      <li>✅ A <strong>laptop or desktop computer</strong> (not a mobile phone or tablet)</li>
      <li>✅ A <strong>working webcam</strong> with camera permissions enabled in your browser</li>
      <li>✅ A <strong>working microphone</strong> with microphone permissions enabled</li>
      <li>✅ A <strong>stable internet connection</strong> (wired or strong Wi-Fi recommended)</li>
      <li>✅ A <strong>quiet, private environment</strong> with good lighting</li>
      <li>✅ An up-to-date browser: <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> (recommended)</li>
    </ul>

    <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #713f12;"><strong>💡 Tips before you begin:</strong> Run a quick webcam/mic test on your browser. Find a well-lit spot. You will be able to re-record each answer once before submission. Dress professionally and treat this as a formal interview.</p>
    </div>

    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #7f1d1d;"><strong>⚠️ Important:</strong> If you experience technical difficulties accessing HireVire, please contact us immediately at <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a> — do not let the deadline pass without notifying us.</p>
    </div>

    <p style="font-size: 14px;">We look forward to reviewing your responses. Good luck, {{first_name}}!</p>

    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 20px;">The Compliance Team<br>
    <span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>

  </div>

  <div style="background: #f5f5f5; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e8; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #aaa; margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
    <p style="font-size: 11px; color: #aaa; margin: 4px 0 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>

</div>',
                'placeholders' => ['first_name', 'full_name', 'interview_url', 'deadline_date']
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
  <div style="background: #1e293b; padding: 24px 28px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 18px;">🎬 Stage 2 Video Submission Ready</h1>
    <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Vanquish Therapies — Admin Notification</p>
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
        <a href="{{zoom_link}}" style="display:inline-block;padding:14px 32px;background:#2d8cff;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;">📦 Join via Zoom</a>
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
      <a href="{{zoom_link}}" style="display:inline-block;padding:14px 32px;background:#2d8cff;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;">📦 Join via Zoom</a>
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
  <div style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 12px;">🎊</div>
    <h1 style="color: white; margin: 0; font-size: 26px;">Welcome to the Team!</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px;">Official Placement Offer — Vanquish Therapies</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}}</strong>,</p>
    <p>Following your interview, our clinical team was highly impressed with your approach and potential. We are delighted to officially offer you a <strong>Trainee Counsellor Placement</strong> at Vanquish Therapies.</p>
    
    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 28px 0; border: 1px solid #e2e8f0;">
      <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 18px;">Induction Details</h2>
      <p style="margin: 0; font-size: 14px; color: #64748b;">Your mandatory online induction is scheduled for:</p>
      <p style="margin: 8px 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">{{induction_date}}</p>
      <p style="margin: 12px 0 0; font-size: 13px; color: #475569;"><strong>Zoom Link:</strong> <a href="{{induction_zoom_link}}" style="color:#2563eb;text-decoration:none;">Join Induction Meeting ➡️</a></p>
    </div>

    <h2 style="color: #0f172a; font-size: 17px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Action Required: Onboarding Paperwork</h2>
    <p style="font-size: 14px; color: #475569;">To finalize your placement, please complete the two items below <strong>before</strong> your induction date:</p>
    
    <div style="margin: 20px 0;">
      <div style="padding: 16px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0; font-size: 14px;"><strong>1. Sign the 4-Way Agreement</strong></p>
        <p style="margin: 4px 0 12px; font-size: 12px; color: #92400e;">Please download the attached agreement, obtain signatures from your Tutor and Clinical Supervisor, and return it to us.</p>
        <a href="{{agreement_download_link}}" style="font-size:13px; font-weight:bold; color:#b45309; text-decoration:underline;">📥 Download 4-Way Agreement (.docx)</a>
      </div>

      <div style="padding: 16px; background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px;"><strong>2. Confirm Personal Therapy</strong></p>
        <p style="margin: 4px 0 12px; font-size: 12px; color: #166534;">As per clinical standards, please confirm your therapy hours via the JotForm below.</p>
        <a href="https://form.jotform.com/241002800146035" target="_blank" style="display:inline-block;padding:10px 20px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:13px;">📝 Complete Therapy Form</a>
      </div>
    </div>

    <p style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 32px;">Welcome to the Vanquish family!<br><span style="font-weight: normal; color: #64748b; font-size: 13px;">Compliance & Clinical Lead</span></p>
  </div>
  <div style="background: #f8fafc; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">© Vanquish Therapies Ltd. All rights reserved.</p>
  </div>
</div>',
                'placeholders' => ['first_name', 'induction_date', 'induction_zoom_link', 'agreement_download_link']
            ],
            'trainee_portal_invite' => [
                'subject' => '🔐 Access Granted: Vanquish Therapies Practitioner Portal (SuiteDash)',
                'body' => '
<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
  <div style="background: #6f1d56; padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 12px;">🔐</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Portal Access & Policies</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px;">Practitioner Onboarding — SuiteDash</p>
  </div>
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hello <strong>{{first_name}}</strong>,</p>
    <p>We are excited to grant you access to the <strong>Vanquish Practitioner Portal</strong>. This will be your hub for all client matching, policy documents, and clinical oversight.</p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{portal_link}}" style="display:inline-block;padding:16px 36px;background:#6f1d56;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:16px;">🚀 Access My Portal Now</a>
      <p style="margin: 10px 0 0; font-size: 12px; color: #888;">Follow the instructions to set your password and profile</p>
    </div>

    <h2 style="color: #6f1d56; font-size: 17px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Onboarding Checklist</h2>
    <p style="font-size: 14px; color: #475569;">Once inside your portal, please complete these induction steps:</p>
    <ul style="padding-left: 20px; line-height: 2; font-size: 14px; color: #333;">
      <li>📖 Read the <strong>Welcome Guide & Practitioner Handbook</strong></li>
      <li>✍️ Sign the <strong>Induction Disclosure Form</strong></li>
      <li>📂 Upload your <strong>Professional Certificates</strong> & <strong>Insurance</strong></li>
      <li>📞 Confirm the <strong>Emergency WhatsApp line: +44 0800 008 6556</strong></li>
    </ul>

    <div style="background: #fdf2f8; border: 1px solid #fce7f3; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #9d174d;"><strong>💡 Need Help?</strong> Coordinators <strong>Jae & Rooshan</strong> have been added to your portal contacts. You can message them directly for any support.</p>
    </div>

    <p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 20px;">The Compliance Team<br><span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p>
  </div>
</div>',
                'placeholders' => ['first_name', 'portal_link']
            ],
            'trainee_placement_rejection' => [
                'subject' => 'Update on your application',
                'body' => '<h1>Application Update</h1><p>Hello {{first_name}},</p><p>Thank you for your interest in joining Vanquish Therapies and for taking the time to attend the interview process.</p><p>After careful consideration, we regret to inform you that we will not be moving forward with your placement at this time.</p><p>We wish you the very best in your future clinical career.</p>',
                'placeholders' => ['first_name']
            ],
        ];
    }
}
