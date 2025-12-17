<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <!-- Email Container -->
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #6f1d56; color: #ffffff; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Vanquish Therapies</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Booking Confirmation</p>
        </div>
        
        <!-- Content -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-top: none;">
            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.7;">Dear {{ $clientName }},</p>
            
            <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.7;">Your {{ $bookingType === 'consultation' ? 'consultation' : 'therapy session' }} has been successfully confirmed. We look forward to seeing you!</p>
            
            <!-- Confirmation Badge -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 4px; text-align: center;">
                <p style="margin: 0; color: #22c55e; font-size: 48px; line-height: 1;">✓</p>
                <p style="margin: 10px 0 0 0; color: #333333; font-size: 16px; font-weight: 600;">Booking Confirmed</p>
            </div>
            
            <!-- Booking Details Card -->
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6f1d56;">
                <h3 style="margin: 0 0 15px 0; color: #6f1d56; font-size: 18px; font-weight: 600;">Your Appointment Details</h3>
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Type:</strong> {{ ucfirst($bookingType) }}</p>
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Counsellor:</strong> {{ $tcName }}</p>
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Date & Time:</strong> {{ \Carbon\Carbon::parse($scheduledAt)->format('l, F j, Y \a\t g:i A') }}</p>
                @if(isset($location) && $location)
                    <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Location:</strong> {{ $location }}</p>
                @endif
                @if(isset($duration) && $duration)
                    <p style="margin: 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Duration:</strong> {{ $duration }} minutes</p>
                @endif
            </div>
            
            <!-- Add to Calendar -->
            <div style="text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px;">Add this appointment to your calendar:</p>
                <div style="display: inline-block;">
                    <a href="{{ $calendarLink ?? '#' }}" 
                       style="display: inline-block; background-color: #6f1d56; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(111, 29, 86, 0.3); margin: 5px;">
                        📅 Add to Calendar
                    </a>
                </div>
            </div>
            
            <!-- Important Reminders -->
            <div style="background-color: #fef3c7; border-left: 4px solid #eab308; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">⏰ Important Reminders</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                    <li>Please arrive 5 minutes before your scheduled time</li>
                    <li>If you need to cancel or reschedule, please provide at least 24 hours notice</li>
                    <li>Bring any relevant documents or notes you'd like to discuss</li>
                    <li>You'll receive a reminder email 24 hours before your appointment</li>
                </ul>
            </div>
            
            <!-- Preparation Tips -->
            @if($bookingType === 'consultation')
            <div style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">💡 Preparing for Your First Consultation</p>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7;">
                    This initial consultation is an opportunity to discuss your goals, ask questions, and get to know your counsellor. Feel free to prepare any questions or topics you'd like to explore.
                </p>
            </div>
            @endif
            
            <!-- Cancellation Policy -->
            <div style="background-color: #fce7f3; border-left: 4px solid #ec4899; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">📋 Cancellation Policy</p>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7;">
                    If you need to cancel or reschedule, please contact us at least 24 hours in advance. Late cancellations may be subject to a fee.
                </p>
            </div>
            
            <!-- Support Section -->
            <div style="background-color: #f3f4f6; padding: 20px; margin: 25px 0; border-radius: 4px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">Need to Make Changes?</p>
                <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; line-height: 1.7;">
                    If you need to reschedule or have any questions, please contact us as soon as possible.
                </p>
            </div>
            
            <p style="margin: 30px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">We look forward to supporting you on your wellness journey.</p>
            
            <p style="margin: 25px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">Best regards,<br>
            <strong style="color: #6f1d56;">Vanquish Therapies Team</strong></p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
            <p style="margin: 0 0 8px 0; color: #666666; font-size: 12px; line-height: 1.5;">This is an automated email. Please do not reply to this message.</p>
            <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">If you have any questions or concerns, please contact us directly.</p>
        </div>
    </div>
</body>
</html>
