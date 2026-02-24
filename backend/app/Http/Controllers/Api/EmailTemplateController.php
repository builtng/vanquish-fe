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
                'subject' => 'Book Your Consultation - Vanquish Therapies',
                'body' => '<h1>Book Your Consultation</h1><p>Hi {{client_name}},</p><p>Please use the button below to select a preferred date and time for your consultation.</p><p><a href="{{booking_link}}" style="display:inline-block;padding:10px 20px;background-color:#6f1d56;color:white;text-decoration:none;border-radius:5px;">Book Consultation</a></p>',
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
        ];
    }
}
