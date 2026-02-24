<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ClientAgreementController extends Controller
{
    /**
     * Handle agreement submission from custom form
     */
    public function submitAgreement(Request $request)
    {
        try {
            // Log the incoming request for debugging
            Log::info('Client Agreement Submission Received', [
                'email' => $request->input('email'),
                'service_type' => $request->input('service_type'),
            ]);

            // Validate the request
            $validated = $request->validate([
                'email' => 'required|email',
                'client_uuid' => 'nullable|string',
                'full_name' => 'required|string|max:255',
                'case_study_consent' => 'nullable|string|in:yes,no',
                'emergency_contact_name' => 'required|string|max:255',
                'emergency_contact_relationship' => 'required|string|max:255',
                'emergency_contact_phone' => 'required|string|max:50',
                'gp_name' => 'required|string|max:255',
                'gp_practice_name' => 'required|string|max:255',
                'gp_practice_phone' => 'required|string|max:50',
                'current_address' => 'required|string|max:1000',
                'signature_data' => 'required|string',
                'signature_date' => 'required|date',
                'service_type' => 'nullable|string|max:50',
            ]);

            // Find client by email or UUID
            $client = null;
            $clientEmail = strtolower(trim($validated['email']));

            if (!empty($validated['client_uuid'])) {
                $client = Client::where('uuid', $validated['client_uuid'])
                    ->orWhere('client_id', $validated['client_uuid'])
                    ->first();
            }

            if (!$client) {
                $client = Client::where('email', $clientEmail)->first();
            }

            if (!$client) {
                Log::warning('Client Agreement: Client not found', [
                    'email' => $clientEmail,
                    'uuid' => $validated['client_uuid'] ?? null,
                ]);

                return response()->json([
                    'message' => 'Client not found. Please ensure you are using the correct email address.',
                ], 404);
            }

            // Save signature image to storage
            $signatureUrl = null;
            if (!empty($validated['signature_data'])) {
                try {
                    // Extract base64 data
                    $signatureData = $validated['signature_data'];
                    if (strpos($signatureData, 'data:image') === 0) {
                        $signatureData = substr($signatureData, strpos($signatureData, ',') + 1);
                    }

                    $signatureImage = base64_decode($signatureData);

                    // Generate unique filename
                    $filename = 'signatures/' . $client->uuid . '_' . time() . '.png';

                    // Store in public storage
                    Storage::disk('public')->put($filename, $signatureImage);

                    $signatureUrl = $filename;

                    Log::info('Signature saved successfully', [
                        'client_id' => $client->id,
                        'filename' => $filename,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to save signature', [
                        'client_id' => $client->id,
                        'error' => $e->getMessage(),
                    ]);
                    // Continue anyway - signature URL will be null
                }
            }

            // Update client record
            $updateData = [
                'agreement_status' => 'signed',
                'agreement_signed_at' => now(),
                'agreement_signature_url' => $signatureUrl,
                'emergency_contact_name' => $validated['emergency_contact_name'],
                'emergency_contact_relationship' => $validated['emergency_contact_relationship'],
                'emergency_contact_phone' => $validated['emergency_contact_phone'],
                'gp_name' => $validated['gp_name'],
                'gp_practice_name' => $validated['gp_practice_name'],
                'gp_practice_phone' => $validated['gp_practice_phone'],
                'current_address' => $validated['current_address'],
            ];

            // Add case study consent for low-cost clients
            if (isset($validated['case_study_consent'])) {
                $updateData['case_study_consent'] = $validated['case_study_consent'];
            }

            // Update client stage if not already active
            if ($client->stage !== 'Active Therapy' && $client->matched_tc_id) {
                $updateData['stage'] = 'Agreement Signed';
            }

            $client->update($updateData);

            // Log activity
            ActivityLog::create([
                'user_id' => null, // System action
                'action' => 'agreement_signed',
                'model_type' => Client::class,
                'model_id' => $client->id,
                'description' => "Agreement signed via custom form for {$client->name}",
                'changes' => [
                    'agreement_status' => 'signed',
                    'signature_saved' => !empty($signatureUrl),
                    'service_type' => $validated['service_type'] ?? null,
                    'emergency_contact' => [
                        'name' => $validated['emergency_contact_name'],
                        'phone' => $validated['emergency_contact_phone'],
                        'relationship' => $validated['emergency_contact_relationship'],
                    ],
                    'gp_details' => [
                        'name' => $validated['gp_name'],
                        'practice' => $validated['gp_practice_name'],
                        'phone' => $validated['gp_practice_phone'],
                    ],
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            Log::info('Client Agreement: Successfully processed', [
                'client_id' => $client->id,
                'client_uuid' => $client->uuid,
                'email' => $client->email,
                'signature_saved' => !empty($signatureUrl),
            ]);

            $baseUrl = rtrim(config('app.frontend_url'), '/');
            $redirectUrl = $baseUrl . '/client-booking?uuid=' . $client->uuid . '&email=' . urlencode($client->email);

            return response()->json([
                'message' => 'Agreement submitted successfully',
                'client_uuid' => $client->uuid,
                'client_id' => $client->client_id,
                'signed' => true,
                'redirect_url' => $redirectUrl,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Client Agreement Validation Error', [
                'errors' => $e->errors(),
                'data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Client Agreement Submission Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Error processing agreement submission',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal error',
            ], 500);
        }
    }
}
