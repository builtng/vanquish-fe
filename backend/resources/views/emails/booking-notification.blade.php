<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">New Booking Notification</h1>
    </div>
    
    <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hello {{ $tcName }},</p>
        
        <p>You have a new {{ $bookingType === 'consultation' ? 'consultation' : 'session' }} booking:</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <p style="margin: 0 0 10px 0;"><strong>Client:</strong> {{ $clientName }}</p>
            <p style="margin: 0 0 10px 0;"><strong>Scheduled Date/Time:</strong> {{ \Carbon\Carbon::parse($scheduledAt)->format('l, F j, Y \a\t g:i A') }}</p>
            @if(isset($details['notes']) && $details['notes'])
                <p style="margin: 10px 0 0 0;"><strong>Notes:</strong> {{ $details['notes'] }}</p>
            @endif
        </div>
        
        <p>Please log into your counsellor portal to view full details and manage this booking.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/counsellor" 
               style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Portal
            </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            This is an automated notification from the Vanquish system. Please do not reply to this email.
        </p>
    </div>
</body>
</html>


