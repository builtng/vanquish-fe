<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Client extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'client_id',
        'name',
        'age',
        'email',
        'photo',
        'phone',
        'address',
        'postcode',
        'gender',
        'ethnicity',
        'sexual_orientation',
        'stage',
        'status',
        'service_type',
        'primary_issues',
        'additional_details',
        'medication',
        'disabilities',
        'risk_flags',
        'substance_misuse',
        'availability',
        'submitted_date',
        'start_date',
        'sessions_completed',
        'matched_tc_id',
        'matched_date',
        'agreement_status',
        'agreement_sent_at',
        'agreement_signed_at',
        'agreement_jotform_id',
        'agreement_signature_url',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'last_feedback_sent_at',
        'last_feedback_date',
        'satisfaction_score',
        'feedback_count',
        'allocated_day',
        'allocated_time',
        'next_booking_deadline',
        'jotform_intake_data',
        'jotform_intake_submission_id',
        'jotform_intake_completed_at',
    ];

    protected $casts = [
        'primary_issues' => 'array',
        'availability' => 'array',
        'submitted_date' => 'date',
        'start_date' => 'date',
        'matched_date' => 'date',
        'agreement_sent_at' => 'datetime',
        'agreement_signed_at' => 'datetime',
        'last_feedback_sent_at' => 'date',
        'last_feedback_date' => 'date',
        'satisfaction_score' => 'decimal:2',
        'next_booking_deadline' => 'date',
        'jotform_intake_data' => 'array',
        'jotform_intake_completed_at' => 'datetime',
    ];

    public function matchedTc(): BelongsTo
    {
        return $this->belongsTo(TrainingCounsellor::class, 'matched_tc_id');
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function matches(): HasMany
    {
        return $this->hasMany(ClientTcMatch::class);
    }

    public function intakeForm(): HasMany
    {
        return $this->hasMany(ClientIntakeForm::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class);
    }

    /**
     * Get the next session that needs booking (for Low Cost clients)
     */
    public function getNextSessionNeedingBooking()
    {
        if ($this->service_type !== 'Low Cost') {
            return null;
        }

        // Find the next scheduled session that's 48+ hours away
        return $this->sessions()
            ->where('status', 'scheduled')
            ->where('scheduled_at', '>=', now()->addHours(48))
            ->whereNull('booking_deadline') // Not yet booked
            ->orderBy('scheduled_at')
            ->first();
    }

    /**
     * Get upcoming sessions for this client
     */
    public function getUpcomingSessions($limit = 10)
    {
        return $this->sessions()
            ->where('status', 'scheduled')
            ->where('scheduled_at', '>=', now())
            ->orderBy('scheduled_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    /**
     * Retrieve the model for bound value.
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $field = $field ?: $this->getRouteKeyName();
        
        // Try UUID first, then fall back to client_id for backward compatibility
        return $this->where($field, $value)
            ->orWhere('client_id', $value)
            ->first();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($client) {
            if (empty($client->uuid)) {
                $client->uuid = Str::uuid()->toString();
            }
        });
    }
}
