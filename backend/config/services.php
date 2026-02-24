<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'mode' => env('STRIPE_MODE', 'test'),
        'test' => [
            'key' => env('STRIPE_TEST_PUBLIC_KEY'),
            'secret' => env('STRIPE_TEST_SECRET_KEY'),
        ],
        'live' => [
            'key' => env('STRIPE_LIVE_PUBLIC_KEY'),
            'secret' => env('STRIPE_LIVE_SECRET_KEY'),
        ],
        'key' => env('STRIPE_MODE', 'test') === 'live' ? env('STRIPE_LIVE_PUBLIC_KEY', env('STRIPE_PUBLIC_KEY', env('STRIPE_KEY'))) : env('STRIPE_TEST_PUBLIC_KEY', env('STRIPE_PUBLIC_KEY', env('STRIPE_KEY'))),
        'secret_key' => env('STRIPE_MODE', 'test') === 'live' ? env('STRIPE_LIVE_SECRET_KEY', env('STRIPE_SECRET_KEY', env('STRIPE_SECRET'))) : env('STRIPE_TEST_SECRET_KEY', env('STRIPE_SECRET_KEY', env('STRIPE_SECRET'))),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

];
