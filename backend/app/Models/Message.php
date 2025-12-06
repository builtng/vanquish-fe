<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'from_user_id',
        'to_tc_id',
        'to_user_id',
        'subject',
        'message',
        'type',
        'is_read',
        'read_at',
        'related_client_id',
        'related_consultation_id',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function toTrainingCounsellor(): BelongsTo
    {
        return $this->belongsTo(TrainingCounsellor::class, 'to_tc_id');
    }

    public function relatedClient(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'related_client_id');
    }

    public function relatedConsultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class, 'related_consultation_id');
    }
}

