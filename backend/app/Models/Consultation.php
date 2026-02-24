<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consultation extends Model
{
    protected $fillable = [
        'consultation_id',
        'client_id',
        'tc_id',
        'scheduled_at',
        'completed_at',
        'status',
        'duration_minutes',
        'notes',
        'outcome',
        'recommended_service',
        'recommended_modality',
        'risk_notes',
        'next_steps',
        'send_confirmation',
        'payment_status',
        'payment_amount',
        'stripe_payment_intent_id',
        'stripe_customer_id',
        'paid_at',
        'payment_method',
        'is_fallback',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'send_confirmation' => 'boolean',
        'paid_at' => 'datetime',
        'payment_amount' => 'decimal:2',
        'is_fallback' => 'boolean',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function tc(): BelongsTo
    {
        return $this->belongsTo(TrainingCounsellor::class, 'tc_id');
    }
}
