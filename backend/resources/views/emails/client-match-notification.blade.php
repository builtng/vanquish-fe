<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You've Been Matched with a Counsellor</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <!-- Email Container -->
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6f1d56 0%, #8b2469 100%); color: #ffffff; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">Great News!</h1>
            <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.95;">You've been matched with a counsellor</p>
        </div>
        
        <!-- Content -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-top: none;">
            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.7;">Dear {{ $clientName }},</p>
            
            <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.7;">We're pleased to inform you that you have been matched with a trainee counsellor who will be supporting you on your therapeutic journey.</p>
            
            <!-- Match Confirmation Badge -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 4px; text-align: center;">
                <p style="margin: 0; color: #22c55e; font-size: 48px; line-height: 1;">✓</p>
                <p style="margin: 10px 0 0 0; color: #333333; font-size: 16px; font-weight: 600;">Successfully Matched</p>
            </div>
            
            <!-- Counsellor Details Card -->
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6f1d56;">
                <h3 style="margin: 0 0 15px 0; color: #6f1d56; font-size: 18px; font-weight: 600;">Your Counsellor</h3>
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Name:</strong> {{ $tcName }}</p>
                @if(isset($modality) && $modality)
                    <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Modality:</strong> {{ $modality }}</p>
                @endif
                @if(isset($matchScore) && $matchScore)
                    <p style="margin: 0; color: #333333; font-size: 15px;"><strong style="color: #6f1d56;">Match Score:</strong> {{ $matchScore }}%</p>
                @endif
            </div>
            
            @if(isset($allocatedDay) && isset($allocatedTime))
            <!-- Allocated Session Time -->
            <div style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">📅 Your Allocated Session Time</p>
                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">
                    <strong style="color: #0ea5e9;">Day:</strong> {{ $allocatedDay }}<br>
                    <strong style="color: #0ea5e9;">Time:</strong> {{ $allocatedTime }}
                </p>
            </div>
            @endif
            
            <!-- Next Steps -->
            <h2 style="color: #6f1d56; margin: 35px 0 20px 0; font-size: 20px; font-weight: 600;">What Happens Next?</h2>
            
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 20px 0;">
                <div style="margin-bottom: 20px;">
                    <p style="margin: 0 0 8px 0; color: #6f1d56; font-size: 16px; font-weight: 600;">1. Initial Contact</p>
                    <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">Your counsellor will reach out to you shortly to introduce themselves and schedule your first session.</p>
                </div>
                
                <div style="margin-bottom: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 8px 0; color: #6f1d56; font-size: 16px; font-weight: 600;">2. First Session</p>
                    <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">During your first session, you'll discuss your goals, expectations, and create a plan for your therapeutic journey together.</p>
                </div>
                
                <div style="padding-top: 20px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 8px 0; color: #6f1d56; font-size: 16px; font-weight: 600;">3. Ongoing Support</p>
                    <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">Regular sessions will be scheduled based on your availability and therapeutic needs.</p>
                </div>
            </div>
            
            <!-- Important Information -->
            <div style="background-color: #fef3c7; border-left: 4px solid #eab308; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">📌 Important Information</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                    <li>All sessions are confidential and conducted in a safe, supportive environment</li>
                    <li>Your counsellor works under qualified supervision</li>
                    <li>If you have any concerns, please don't hesitate to contact us</li>
                </ul>
            </div>
            
            <!-- Support Section -->
            <div style="background-color: #fce7f3; border-left: 4px solid #ec4899; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">💬 Questions or Concerns?</p>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.7;">
                    If you have any questions about your match or need to discuss anything, our support team is here to help. Please contact us directly.
                </p>
            </div>
            
            <p style="margin: 30px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">We're excited for you to begin this journey and look forward to supporting your wellbeing.</p>
            
            <p style="margin: 25px 0 0 0; color: #333333; font-size: 16px; line-height: 1.7;">Warm regards,<br>
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
