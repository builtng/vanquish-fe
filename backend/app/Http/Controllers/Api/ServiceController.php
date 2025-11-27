<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceSetting;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Check Ish's service capacity
     */
    public function checkIshCapacity()
    {
        $setting = ServiceSetting::where('service_name', 'Ish')->first();
        
        return response()->json([
            'capacity_full' => $setting ? $setting->capacity_full : false,
            'message' => $setting ? $setting->capacity_message : null,
            'alternative_url' => $setting ? $setting->alternative_url : null,
        ]);
    }

    /**
     * Update service capacity (admin only)
     */
    public function updateCapacity(Request $request)
    {
        $validated = $request->validate([
            'service_name' => 'required|string',
            'capacity_full' => 'required|boolean',
            'capacity_message' => 'nullable|string',
            'alternative_url' => 'nullable|url',
        ]);

        $setting = ServiceSetting::updateOrCreate(
            ['service_name' => $validated['service_name']],
            [
                'capacity_full' => $validated['capacity_full'],
                'capacity_message' => $validated['capacity_message'] ?? null,
                'alternative_url' => $validated['alternative_url'] ?? null,
            ]
        );

        return response()->json($setting);
    }
}

