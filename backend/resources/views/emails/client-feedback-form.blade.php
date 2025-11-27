<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Feedback Survey</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <!-- Email Container -->
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #6f1d56; color: #ffffff; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Vanquish Therapies</h1>
    </div>
    
        <!-- Content -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-top: none;">
            <h2 style="color: #6f1d56; margin-top: 0; margin-bottom: 20px; font-size: 22px; font-weight: 600;">We Value Your Feedback</h2>
        
            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.7;">Dear {{ $clientName }},</p>
        
            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.7;">Thank you for being a valued client of Vanquish Therapies. Your feedback is incredibly important to us as we continuously strive to improve our services and ensure the best possible experience for all our clients.</p>
        
            <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.7;">We would be grateful if you could take a few minutes to complete our client satisfaction survey. Your responses will help us:</p>
            <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
            <li>Understand how we're meeting your needs</li>
            <li>Identify areas for improvement</li>
            <li>Ensure we're providing the highest quality of care</li>
        </ul>
        
            <p style="margin: 25px 0 20px 0; color: #333333; font-size: 16px; line-height: 1.7;">Please click the button below to access the feedback form:</p>
        
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
            <a href="{{ $formUrl }}" 
                   style="display: inline-block; background-color: #6f1d56; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(111, 29, 86, 0.3);">
                Complete Feedback Form
            </a>
        </div>
        
            <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6f1d56; font-size: 13px; margin: 10px 0 25px 0; padding: 12px; background-color: #f9f9f9; border-radius: 4px; border: 1px solid #e5e5e5;">{{ $formUrl }}</p>
        
            <p style="margin: 25px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">The survey should take approximately 5-10 minutes to complete. All responses are confidential and will be used solely for the purpose of improving our services.</p>
        
            <p style="margin: 25px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">Thank you for your time and continued trust in Vanquish Therapies.</p>
        
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

