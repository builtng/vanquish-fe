<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <!-- Email Container -->
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #6f1d56; color: #ffffff; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Vanquish Therapies</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">New Booking Notification</p>
        </div>
        
        <!-- Content -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-top: none;">
            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.7;">Hello {{ $tcName }},</p>
            
            <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.7;">You have received a new {{ $bookingType === 'consultation' ? 'consultation' : 'session' }} booking. Please review the details below:</p>
            
            <!-- Booking Details Card -->
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6f1d56;">
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Client Name:</strong> {{ $clientName }}</p>
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Booking Type:</strong> {{ ucfirst($bookingType) }}</p>
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Scheduled Date & Time:</strong> {{ \Carbon\Carbon::parse($scheduledAt)->format('l, F j, Y \a\t g:i A') }}</p>
                @if(isset($details['notes']) && $details['notes'])
                    <p style="margin: 12px 0 0 0; color: #333333; font-size: 15px; padding-top: 12px; border-top: 1px solid #e5e5e5;"><strong style="color: #6f1d56;">Client Notes:</strong> {{ $details['notes'] }}</p>
                @endif
            </div>
            
            <div style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;"><strong>📅 Action Required:</strong> Please log into your counsellor portal to confirm this booking and view complete session details.</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/counsellor" 
                   style="display: inline-block; background-color: #6f1d56; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(111, 29, 86, 0.3);">
                    Access Counsellor Portal
                </a>
            </div>
            
            <p style="margin: 25px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                If you have any questions about this booking, please contact the administration team.
            </p>
            
            <p style="margin: 30px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">Best regards,<br>
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


