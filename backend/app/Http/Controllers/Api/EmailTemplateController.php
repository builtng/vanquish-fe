<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ensure default templates exist
        $this->ensureDefaultTemplatesExist();

        return response()->json(EmailTemplate::orderBy('created_at', 'desc')->get());
    }

    /**
     * Display the specified resource.
     */
    public function show($type)
    {
        $template = EmailTemplate::where('type', $type)->first();

        if (!$template) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        return response()->json($template);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $type)
    {
        $template = EmailTemplate::where('type', $type)->first();

        if (!$template) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        // Optional: Version control
        $template->version = $template->version + 1;
        $template->subject = $validated['subject'];
        $template->body = $validated['body'];
        $template->save();

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $template
        ]);
    }

    /**
     * Resets a template to its default.
     */
    public function reset($type)
    {
        $defaults = $this->getDefaults();

        if (!isset($defaults[$type])) {
            return response()->json(['message' => 'Default not found for this type'], 404);
        }

        $template = EmailTemplate::where('type', $type)->first();
        if ($template) {
            $template->update([
                'subject' => $defaults[$type]['subject'],
                'body' => $defaults[$type]['body'],
                'version' => $template->version + 1
            ]);
        } else {
            $template = EmailTemplate::create(array_merge(['type' => $type], $defaults[$type]));
        }

        return response()->json([
            'message' => 'Template reset to default',
            'template' => $template
        ]);
    }

    private function ensureDefaultTemplatesExist()
    {
        $defaults = $this->getDefaults();

        foreach ($defaults as $type => $data) {
            EmailTemplate::firstOrCreate(
                ['type' => $type],
                [
                    'subject' => $data['subject'],
                    'body' => $data['body'],
                    'placeholders' => $data['placeholders']
                ]
            );
        }
    }

    private function getDefaults()
    {
        return [
            'intake_submission' => [
                'subject' => 'We have received your intake form',
                'body' => '<h1>Hello {{client_name}},</h1><p>Thank you for submitting your intake form. We will review it and get back to you soon.</p><p>Best regards,<br>Vanquish Therapies Team</p>',
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

            // ── Trainee Placement Emails ─────────────────────────────────────
            'trainee_application_received' => [
                'subject' => 'Stage 1 Application Received – Vanquish Therapies Trainee Placement',
                'body' => '<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;"><div style="background: linear-gradient(135deg, #6f1d56 0%, #9b2c7e 100%); padding: 36px 32px; border-radius: 12px 12px 0 0; text-align: center;"><h1 style="color: white; margin: 0; font-size: 24px;">Application Received</h1><p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Vanquish Therapies — Trainee Counsellor Placement</p></div><div style="background: #ffffff; padding: 32px; border: 1px solid #e8e8e8; border-top: none;"><p style="font-size: 16px; margin-top: 0;">Dear <strong>{{first_name}} {{last_name}}</strong>,</p><p>Thank you for submitting your Stage 1 placement application to <strong>Vanquish Therapies</strong>. We are pleased to confirm that we have <strong>successfully received your application</strong>, including all personal information, course details, and any supporting documents you uploaded.</p><div style="background: #f9f4f8; border-left: 4px solid #6f1d56; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;"><p style="margin: 0; font-size: 14px; color: #555;"><strong>Submission Email:</strong> {{email}}</p><p style="margin: 6px 0 0; font-size: 14px; color: #555;">Please keep this email for your records. A copy of the submitted form is not separately provided.</p></div><h2 style="color: #6f1d56; font-size: 18px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">Review Process &amp; Timeline</h2><p>Our <strong>Compliance Team</strong> and clinical lead review every application carefully and personally. Here is what to expect:</p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 16px 0;"><tr><td style="padding: 12px 16px; background: #f9f4f8; font-weight: bold; color: #6f1d56; width: 30%; vertical-align: top; font-size: 14px;">⏱ 48–72 hours</td><td style="padding: 12px 16px; font-size: 14px; vertical-align: top;">Initial review of your application, documents, and course information by our clinical lead.</td></tr><tr><td style="padding: 12px 16px; background: #f0e6ed; font-weight: bold; color: #6f1d56; font-size: 14px; vertical-align: top;">📧 Stage 2 Invitation</td><td style="padding: 12px 16px; font-size: 14px; vertical-align: top;">If your application meets our placement criteria, you will receive a <strong>Stage 2 Video Interview invitation</strong> within 48 hours of this email.</td></tr><tr><td style="padding: 12px 16px; background: #f9f4f8; font-weight: bold; color: #6f1d56; font-size: 14px; vertical-align: top;">🎥 Stage 2: Video</td><td style="padding: 12px 16px; font-size: 14px; vertical-align: top;">Complete a structured asynchronous video interview (approx. 15–20 minutes) from home.</td></tr><tr><td style="padding: 12px 16px; background: #f0e6ed; font-weight: bold; color: #6f1d56; font-size: 14px; vertical-align: top;">🤝 Stage 3: Interview</td><td style="padding: 12px 16px; font-size: 14px; vertical-align: top;">Successful Stage 2 candidates are invited for a final face-to-face (online) interview.</td></tr></table><h2 style="color: #6f1d56; font-size: 18px; border-bottom: 2px solid #f0e6ed; padding-bottom: 8px;">What Happens Next</h2><ul style="padding-left: 20px; line-height: 1.8; font-size: 14px; color: #444;"><li>You do not need to take any action at this stage — we will contact you directly.</li><li>If progressed to Stage 2, you will receive a separate email with a personal video interview link.</li><li>Please ensure emails from <strong>no-reply@vanquishtherapies.co.uk</strong> are not going to your spam folder.</li><li>To update application information, email <a href="mailto:compliance@vanquishtherapies.co.uk" style="color:#6f1d56;">compliance@vanquishtherapies.co.uk</a>.</li></ul><div style="background: #fffbf0; border: 1px solid #f0d080; border-radius: 8px; padding: 16px 20px; margin: 24px 0;"><p style="margin: 0; font-size: 13px; color: #7a6000;"><strong>⚠️ Important:</strong> If you have not received a Stage 2 invitation within <strong>72 hours</strong>, please check your spam folder before contacting us.</p></div><p style="font-size: 15px; font-weight: bold; color: #6f1d56; margin-top: 24px;">The Compliance Team<br><span style="font-weight: normal; color: #777; font-size: 13px;">Vanquish Therapies</span></p></div><div style="background: #f5f5f5; padding: 16px 32px; text-align: center; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 12px 12px;"><p style="font-size: 11px; color: #aaa; margin: 0;">© Vanquish Therapies Ltd. All rights reserved.</p></div></div>',
                'placeholders' => ['first_name', 'last_name', 'email']
            ],
            'trainee_stage_two_invite' => [
                'subject' => 'Congratulations! You Have Progressed to Stage 2 – Video Interview',
                'body' => '<h1>Congratulations, {{first_name}}!</h1><p>We are pleased to inform you that you have successfully progressed to Stage 2 of our trainee recruitment process.</p><p><strong>Complete your video interview by: {{deadline_date}}</strong> (3 working days from this email).</p><h3>Interview Details:</h3><ul><li>5 structured questions</li><li>Approx. 15–20 minutes</li><li>English language only</li><li>Must use a laptop or desktop computer</li><li>Working webcam and microphone required</li></ul><p><a href="{{interview_url}}" style="display:inline-block;padding:14px 28px;background:#6f1d56;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Start My Video Interview</a></p><p>If you experience technical difficulties, contact compliance@vanquishtherapies.co.uk immediately.</p>',
                'placeholders' => ['first_name', 'full_name', 'interview_url', 'deadline_date']
            ],
            'trainee_video_interview_received' => [
                'subject' => 'Stage 2 Video Interview Received – Next Steps',
                'body' => '<h1>Video Interview Received</h1><p>Dear {{first_name}},</p><p>Thank you for completing your Stage 2 video interview. We have successfully received all of your responses.</p><p>A member of our team will review your video interview — this typically takes 3–5 working days. If successful, you will receive a Stage 3 invitation to book a face-to-face interview.</p><p>The Compliance Team<br>Vanquish Therapies</p>',
                'placeholders' => ['first_name', 'full_name']
            ],
            'admin_video_review_notification' => [
                'subject' => 'Action Required: Stage 2 Video Ready for Review – {{applicant_name}}',
                'body' => '<h2>Stage 2 Video Submission Ready</h2><p>A trainee applicant has completed their Stage 2 HireVire video interview.</p><table><tr><th>Applicant</th><td>{{applicant_name}}</td></tr><tr><th>Email</th><td>{{applicant_email}}</td></tr><tr><th>Submitted At</th><td>{{submitted_at}}</td></tr></table><p><a href="{{dashboard_url}}" style="padding:10px 20px;background:#6f1d56;color:white;text-decoration:none;border-radius:6px;">Review in Dashboard</a></p>',
                'placeholders' => ['applicant_name', 'applicant_email', 'submitted_at', 'dashboard_url']
            ],
            'trainee_stage_three_invite' => [
                'subject' => 'Stage 3 Interview Invitation',
                'body' => '<h1>Great progress, {{first_name}}!</h1><p>We are delighted to invite you for a face-to-face interview (Stage 3) at Vanquish Therapies.</p><p><a href="{{booking_link}}" style="display:inline-block;padding:12px 24px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Book My Interview</a></p>',
                'placeholders' => ['first_name', 'booking_link']
            ],
            'trainee_interview_confirmed' => [
                'subject' => 'Interview Scheduled Successfully',
                'body' => '<h1>Interview Confirmed</h1><p>Hi {{first_name}},</p><p>Your Placement Interview has been scheduled.</p><p><strong>Date:</strong> {{date}}</p><p><strong>Time:</strong> {{time}}</p><p><strong>Zoom Link:</strong> <a href="{{zoom_link}}">Join Meeting</a></p><p><strong>Meeting ID:</strong> {{meeting_id}}</p><p>Please join 5 minutes early.</p>',
                'placeholders' => ['first_name', 'date', 'time', 'zoom_link', 'meeting_id']
            ],
            'trainee_placement_acceptance' => [
                'subject' => 'Congratulations – Placement Acceptance',
                'body' => '<h1>Congratulations, {{first_name}}!</h1><p>We are delighted to offer you a trainee placement at Vanquish Therapies.</p><p><strong>Induction Date:</strong> {{induction_date}}</p><p>You will receive a separate email containing your onboarding documents and Practitioner Handbook shortly.</p><p>Welcome to the team!</p>',
                'placeholders' => ['first_name', 'induction_date']
            ],
            'trainee_placement_rejection' => [
                'subject' => 'Update on your application',
                'body' => '<h1>Application Update</h1><p>Hello {{first_name}},</p><p>Thank you for your interest in joining Vanquish Therapies. After careful consideration, we regret to inform you that we will not be moving forward with your placement at this time.</p><p>We wish you the very best in your future clinical career.</p>',
                'placeholders' => ['first_name']
            ],
        ];
    }
}
