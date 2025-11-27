<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceSetting extends Model
{
    protected $fillable = [
        'service_name',
        'capacity_full',
        'capacity_message',
        'alternative_url',
    ];

    protected $casts = [
        'capacity_full' => 'boolean',
    ];
}

