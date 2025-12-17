<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Client Assignment</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <!-- Email Container -->
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #6f1d56; color: #ffffff; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Vanquish Therapies</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">New Client Assignment</p>
        </div>
        
        <!-- Content -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-top: none;">
            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.7;">Dear {{ $tcName }},</p>
            
            <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.7;">You have been assigned a new client. Please review the details below and prepare for your initial contact.</p>
            
            <!-- Assignment Badge -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 4px; text-align: center;">
                <p style="margin: 0; color: #22c55e; font-size: 48px; line-height: 1;">👤</p>
                <p style="margin: 10px 0 0 0; color: #333333; font-size: 16px; font-weight: 600;">New Client Assigned</p>
            </div>
            
            <!-- Client Details Card -->
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6f1d56;">
                <h3 style="margin: 0 0 15px 0; color: #6f1d56; font-size: 18px; font-weight: 600;">Client Information</h3>
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Name:</strong> {{ $clientName }}</p>
                @if(isset($clientAge) && $clientAge)
                    <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Age:</strong> {{ $clientAge }}</p>
                @endif
                @if(isset($serviceType) && $serviceType)
                    <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Service Type:</strong> {{ $serviceType }}</p>
                @endif
                @if(isset($matchScore) && $matchScore)
                    <p style="margin: 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Match Score:</strong> {{ $matchScore }}%</p>
                @endif
            </div>
            
            @if(isset($assignmentNotes) && $assignmentNotes)
            <!-- Assignment Notes -->
            <div style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">📝 Assignment Notes</p>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7;">{{ $assignmentNotes }}</p>
            </div>
            @endif
            
            @if(isset($allocatedDay) && isset($allocatedTime))
            <!-- Allocated Session Time -->
            <div style="background-color: #fef3c7; border-left: 4px solid #eab308; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">📅 Allocated Session Time</p>
                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">
                    <strong style="color: #eab308;">Day:</strong> {{ $allocatedDay }}<br>
                    <strong style="color: #eab308;">Time:</strong> {{ $allocatedTime }}
                </p>
            </div>
            @endif
            
            <!-- Next Steps -->
            <h2 style="color: #6f1d56; margin: 35px 0 20px 0; font-size: 20px; font-weight: 600;">Your Next Steps</h2>
            
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 20px 0;">
                <div style="margin-bottom: 20px;">
                    <p style="margin: 0 0 8px 0; color: #6f1d56; font-size: 16px; font-weight: 600;">1. Review Client Information</p>
                    <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">Log into your counsellor portal to access the full client profile, intake form, and any relevant background information.</p>
                </div>
                
                <div style="margin-bottom: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 8px 0; color: #6f1d56; font-size: 16px; font-weight: 600;">2. Make Initial Contact</p>
                    <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">Reach out to the client within 48 hours to introduce yourself and schedule your first session.</p>
                </div>
                
                <div style="margin-bottom: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 8px 0; color: #6f1d56; font-size: 16px; font-weight: 600;">3. Prepare for First Session</p>
                    <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">Review the client's intake form and prepare for your initial assessment and goal-setting session.</p>
                </div>
                
                <div style="padding-top: 20px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 8px 0; color: #6f1d56; font-size: 16px; font-weight: 600;">4. Document Everything</p>
                    <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">Remember to document all sessions and communications in the counsellor portal within 24 hours.</p>
                </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/counsellor" 
                   style="display: inline-block; background-color: #6f1d56; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(111, 29, 86, 0.3);">
                    Access Counsellor Portal
                </a>
            </div>
            
            <!-- Important Reminders -->
            <div style="background-color: #fce7f3; border-left: 4px solid #ec4899; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">⚠️ Important Reminders</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                    <li>Maintain professional boundaries at all times</li>
                    <li>All client information is confidential</li>
                    <li>Contact your supervisor if you have any concerns</li>
                    <li>Report any safeguarding issues immediately</li>
                </ul>
            </div>
            
            <p style="margin: 30px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">Thank you for your dedication to providing quality care to our clients.</p>
            
            <p style="margin: 25px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">Best regards,<br>
            <strong style="color: #6f1d56;">The Vanquish Therapies Team</strong></p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
            <p style="margin: 0 0 8px 0; color: #666666; font-size: 12px; line-height: 1.5;">This is an automated email. Please do not reply to this message.</p>
            <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">If you have any questions or concerns, please contact us directly.</p>
        </div>
    </div>
</body>
</html>
