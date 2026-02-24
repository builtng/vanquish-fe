<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientIntakeForm extends Model
{
    protected $fillable = [
        'client_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'age',
        'voicemail_ok',
        'currently_in_therapy',
        'gender',
        'ethnicity',
        'sexual_orientation',
        'service_type',
        'on_medication',
        'medication_details',
        'disabilities',
        'support_areas',
        'concerns_details',
        'risk_issues',
        'availability',
        'gender_preference',
        'age_preference',
        'ethnicity_preference',
        'orientation_preference',
        'hear_about_us',
        'referral_reason',
        'referrer_name',
        'referrer_phone',
        'referrer_org',
        'referrer_email',
        'card_name',
        'card_number',
        'expiry_date',
        'cvv',
        'postcode',
        'terms_accepted',
        'status',
        'whatsapp_agreement',
        'partner_email',
        'partner_phone',
        'working_with_another_reason',
        'location_of_residence',
        'referral_type',
        'core34_answers',
        'payment_status',
        'payment_reference',
        'payment_amount',
        'payment_method',
        'paid_at',
    ];

    protected $casts = [
        'voicemail_ok' => 'boolean',
        'currently_in_therapy' => 'boolean',
        'on_medication' => 'boolean',
        'terms_accepted' => 'boolean',
        'support_areas' => 'array',
        'availability' => 'array',
        'core34_answers' => 'array',
        'paid_at' => 'datetime',
        'payment_amount' => 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
