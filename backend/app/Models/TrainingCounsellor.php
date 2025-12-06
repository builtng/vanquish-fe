<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class TrainingCounsellor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'tc_id',
        'name',
        'email',
        'photo',
        'phone',
        'modality',
        'status',
        'counsellor_type',
        'current_clients',
        'availability',
        'topics_with_experience',
        'topics_not_ready_for',
        'course',
        'institution',
        'joined_date',
        'last_activity',
        // Qualified Counsellor fields
        'legal_first_name',
        'legal_last_name',
        'registered_address',
        'registered_city',
        'registered_postcode',
        'has_supervisor',
        'previous_vanquish_work',
        'areas_to_improve',
        'unique_trait',
        'counsellor_training_details',
        'qualified_to_work_with',
        'challenging_cases',
        'qualification_document',
        'dbs_certificate_qualified',
        'insurance_qualified',
        'self_employment_proof',
        'professional_membership',
        'signature',
        'signature_date',
        'qualified_form_completed',
    ];

    protected $casts = [
        'availability' => 'array',
        'topics_with_experience' => 'array',
        'topics_not_ready_for' => 'array',
        'qualified_to_work_with' => 'array',
        'joined_date' => 'date',
        'signature_date' => 'date',
        'last_activity' => 'datetime',
        'qualified_form_completed' => 'boolean',
    ];

    public function clients(): HasMany
    {
        return $this->hasMany(Client::class, 'matched_tc_id');
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class, 'tc_id');
    }

    public function matches(): HasMany
    {
        return $this->hasMany(ClientTcMatch::class, 'tc_id');
    }

    public function intakeForm(): HasMany
    {
        return $this->hasMany(TcIntakeForm::class, 'tc_id');
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
        
        // Try UUID first, then fall back to tc_id for backward compatibility
        return $this->where($field, $value)
            ->orWhere('tc_id', $value)
            ->first();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tc) {
            if (empty($tc->uuid)) {
                $tc->uuid = Str::uuid()->toString();
            }
        });
    }
}
