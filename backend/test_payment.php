<?php
$client = new GuzzleHttp\Client();
try {
    $res = $client->request('POST', 'http://localhost:8000/api/payments/create-intent', [
        'json' => [
            'client_id' => 1,
            'amount' => 13.00,
            'payment_type' => 'consultation'
        ]
    ]);
    echo $res->getBody();
} catch (\Exception $e) {
    if (method_exists($e, 'getResponse') && $e->getResponse()) {
        echo $e->getResponse()->getBody();
    } else {
        echo $e->getMessage();
    }
}
