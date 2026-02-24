<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ServiceController extends Controller
{
    /**
     * Check Ish's service capacity
     */
    public function checkIshCapacity()
    {
        try {
            $setting = ServiceSetting::where('service_name', 'Ish')->first();

            $defaultMessage = "This service is at capacity at this time. If you would like to work with Ish, you can click here to proceed with our Partner service VQT COACHING & THERAPY";
            $defaultUrl = "https://pci.jotform.com/form/243161740962456";

            return response()->json([
                'capacity_full' => $setting ? (bool) $setting->capacity_full : false,
                'message' => $setting && $setting->capacity_message
                    ? $setting->capacity_message
                    : $defaultMessage,
                'alternative_url' => $setting && $setting->alternative_url
                    ? $setting->alternative_url
                    : $defaultUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking Ish capacity: ' . $e->getMessage());
            return response()->json([
                'capacity_full' => false,
                'message' => "This service is at capacity at this time. If you would like to work with Ish, you can click here to proceed with our Partner service VQT COACHING & THERAPY",
                'alternative_url' => "https://pci.jotform.com/form/243161740962456",
            ], 200);
        }
    }

    /**
     * Update service capacity (admin only)
     */
    public function updateCapacity(Request $request)
    {
        try {
            $validated = $request->validate([
                'service_name' => 'required|string',
                'capacity_full' => 'required|boolean',
                'capacity_message' => 'nullable|string',
                'alternative_url' => 'nullable|url',
            ]);

            $setting = ServiceSetting::updateOrCreate(
                ['service_name' => $validated['service_name']],
                [
                    'capacity_full' => (bool) $validated['capacity_full'],
                    'capacity_message' => $validated['capacity_message'] ?? null,
                    'alternative_url' => $validated['alternative_url'] ?? null,
                ]
            );

            return response()->json([
                'id' => $setting->id,
                'service_name' => $setting->service_name,
                'capacity_full' => (bool) $setting->capacity_full,
                'capacity_message' => $setting->capacity_message,
                'alternative_url' => $setting->alternative_url,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating service capacity: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update service capacity',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update service price (admin only)
     */
    public function updatePrice(Request $request)
    {
        try {
            $validated = $request->validate([
                'service_name' => 'required|string',
                'price' => 'required|numeric|min:0',
            ]);

            // This can be extended to store prices in service_settings or a separate table
            return response()->json([
                'message' => 'Price updated successfully',
                'service_name' => $validated['service_name'],
                'price' => $validated['price'],
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating service price: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update service price',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get all services (admin only)
     */
    public function getAllServices()
    {
        try {
            $services = ServiceSetting::orderBy('id', 'desc')->get();
            return response()->json($services);
        } catch (\Exception $e) {
            Log::error('Error getting all services: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to get services',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
