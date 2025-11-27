<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule feedback form emails to be sent monthly (checks for clients eligible every month)
Schedule::command('clients:send-feedback-forms')
    ->monthly()
    ->description('Send feedback form emails to eligible clients (every 3 months)');
