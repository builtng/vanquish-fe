<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JotFormWebhookController extends Controller
{
    /**
     * Handle agreement submission from JotForm
     * Webhook URL: https://form.jotform.com/231635798225060
     */
    public function handleAgreementSubmission(Request $request)
    {
        try {
            // Log the incoming webhook for debugging
            Log::info('JotForm Agreement Webhook Received', [
                'payload' => $request->all(),
                'headers' => $request->headers->all(),
            ]);

            // JotForm sends data in different formats depending on configuration
            // Common formats: JSON body or form data
            
            $data = $request->all();
            
            // Extract client identifier (could be email, client_id, or UUID)
            $clientIdentifier = null;
            $clientEmail = null;
            
            // Try to find client by email (most common identifier)
            if (isset($data['email']) || isset($data['q3_email']) || isset($data['q4_email'])) {
                $clientEmail = $data['email'] ?? $data['q3_email'] ?? $data['q4_email'];
                $clientEmail = strtolower(trim($clientEmail));
            }
            
            // Try to find client by client_id or UUID if provided
            if (isset($data['client_id']) || isset($data['clientId']) || isset($data['uuid'])) {
                $clientIdentifier = $data['client_id'] ?? $data['clientId'] ?? $data['uuid'];
            }

            // Find client
            $client = null;
            if ($clientEmail) {
                $client = Client::where('email', $clientEmail)->first();
            }
            
            if (!$client && $clientIdentifier) {
                $client = Client::where('uuid', $clientIdentifier)
                    ->orWhere('client_id', $clientIdentifier)
                    ->first();
            }

            if (!$client) {
                Log::warning('JotForm Agreement: Client not found', [
                    'email' => $clientEmail,
                    'identifier' => $clientIdentifier,
                    'data' => $data,
                ]);
                
                return response()->json([
                    'message' => 'Client not found',
                    'received' => true,
                ], 200); // Return 200 to prevent JotForm retries
            }

            // Extract emergency contact information
            $emergencyContactName = $data['emergency_contact_name'] 
                ?? $data['q5_emergencyContactName'] 
                ?? $data['emergencyContactName'] 
                ?? null;
                
            $emergencyContactPhone = $data['emergency_contact_phone'] 
                ?? $data['q6_emergencyContactPhone'] 
                ?? $data['emergencyContactPhone'] 
                ?? null;
                
            $emergencyContactRelationship = $data['emergency_contact_relationship'] 
                ?? $data['q7_emergencyContactRelationship'] 
                ?? $data['emergencyContactRelationship'] 
                ?? null;

            // Check for signature upload - JotForm sends file uploads as URLs
            // Try multiple possible field names for signature
            $signatureUrl = $this->extractSignatureField($data);
            $hasSignature = !empty($signatureUrl);

            // Only mark as signed if signature is present
            if (!$hasSignature) {
                Log::warning('JotForm Agreement: No signature found in submission', [
                    'client_id' => $client->id,
                    'client_email' => $client->email,
                    'submission_id' => $data['submissionID'] ?? $data['submission_id'] ?? null,
                    'available_fields' => array_keys($data),
                ]);
                
                // Log as submitted but not signed
                ActivityLog::create([
                    'user_id' => null,
                    'action' => 'agreement_submitted',
                    'model_type' => Client::class,
                    'model_id' => $client->id,
                    'description' => "Agreement form submitted (without signature) via JotForm for {$client->name}",
                    'changes' => [
                        'note' => 'Form submitted but signature not detected',
                    ],
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'message' => 'Agreement form received but signature not detected',
                    'client_uuid' => $client->uuid,
                    'signed' => false,
                    'note' => 'Please ensure signature field is properly configured in JotForm',
                ], 200);
            }

            // Update client record - only if signature is present
            $updateData = [
                'agreement_status' => 'signed',
                'agreement_signed_at' => now(),
                'agreement_jotform_id' => $data['submissionID'] ?? $data['submission_id'] ?? null,
                'agreement_signature_url' => $signatureUrl,
            ];

            if ($emergencyContactName) {
                $updateData['emergency_contact_name'] = $emergencyContactName;
            }
            if ($emergencyContactPhone) {
                $updateData['emergency_contact_phone'] = $emergencyContactPhone;
            }
            if ($emergencyContactRelationship) {
                $updateData['emergency_contact_relationship'] = $emergencyContactRelationship;
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
                'description' => "Agreement signed via JotForm for {$client->name}",
                'changes' => [
                    'agreement_status' => 'signed',
                    'signature_detected' => true,
                    'signature_url' => $signatureUrl,
                    'emergency_contact' => [
                        'name' => $emergencyContactName,
                        'phone' => $emergencyContactPhone,
                        'relationship' => $emergencyContactRelationship,
                    ],
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            Log::info('JotForm Agreement: Successfully processed with signature', [
                'client_id' => $client->id,
                'client_uuid' => $client->uuid,
                'email' => $client->email,
                'signature_url' => $signatureUrl,
            ]);

            return response()->json([
                'message' => 'Agreement processed successfully',
                'client_uuid' => $client->uuid,
                'client_id' => $client->client_id,
                'signed' => true,
                'signature_detected' => true,
            ], 200);

        } catch (\Exception $e) {
            Log::error('JotForm Agreement Webhook Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all(),
            ]);

            // Return 200 to prevent JotForm from retrying excessively
            // But log the error for investigation
            return response()->json([
                'message' => 'Error processing agreement',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal error',
            ], 200);
        }
    }

    /**
     * Extract signature field from JotForm webhook data
     * JotForm sends file uploads as URLs in various field name formats
     * 
     * @param array $data Webhook data from JotForm
     * @return string|null Signature URL if found, null otherwise
     */
    private function extractSignatureField(array $data)
    {
        // Common JotForm signature field names (adjust based on your form)
        $possibleFieldNames = [
            'signature',
            'signature_upload',
            'signature_file',
            'client_signature',
            'agreement_signature',
            // JotForm question format (qX_fieldname)
            'q8_signature',
            'q9_signature',
            'q10_signature',
            'q11_signature',
            'q12_signature',
            'q13_signature',
            'q14_signature',
            'q15_signature',
            // Alternative formats
            'q8_signature_upload',
            'q9_signature_upload',
            'signatureImage',
            'signature_image',
        ];

        foreach ($possibleFieldNames as $fieldName) {
            if (isset($data[$fieldName]) && !empty($data[$fieldName])) {
                $value = $data[$fieldName];
                
                // Check if it's a URL (JotForm sends file uploads as URLs)
                if (is_string($value) && (filter_var($value, FILTER_VALIDATE_URL) || strpos($value, 'http') === 0)) {
                    return $value;
                }
                
                // Check if it's a file path
                if (is_string($value) && (strpos($value, '/') !== false || strpos($value, '\\') !== false)) {
                    return $value;
                }
            }
        }

        // Also check for any field containing "signature" in the key name
        foreach ($data as $key => $value) {
            if (stripos($key, 'signature') !== false && !empty($value)) {
                if (is_string($value) && (filter_var($value, FILTER_VALIDATE_URL) || strpos($value, 'http') === 0)) {
                    return $value;
                }
                if (is_string($value) && (strpos($value, '/') !== false || strpos($value, '\\') !== false)) {
                    return $value;
                }
            }
        }

        return null;
    }

    /**
     * Handle intake form submission from JotForm
     * Webhook URL: https://form.jotform.com/231631669909062
     * Important questions: 6, 9, 16, 22, 24, 34
     */
    public function handleIntakeSubmission(Request $request)
    {
        try {
            // Log the incoming webhook for debugging
            Log::info('JotForm Intake Webhook Received', [
                'payload' => $request->all(),
                'headers' => $request->headers->all(),
            ]);

            $data = $request->all();
            
            // Extract client identifier (email or UUID)
            $clientIdentifier = null;
            $clientEmail = null;
            
            // Try to find client by email
            if (isset($data['email']) || isset($data['q3_email']) || isset($data['q4_email'])) {
                $clientEmail = $data['email'] ?? $data['q3_email'] ?? $data['q4_email'];
                $clientEmail = strtolower(trim($clientEmail));
            }
            
            // Try to find client by UUID if provided
            if (isset($data['client_uuid']) || isset($data['clientUuid']) || isset($data['uuid'])) {
                $clientIdentifier = $data['client_uuid'] ?? $data['clientUuid'] ?? $data['uuid'];
            }

            // Find client
            $client = null;
            if ($clientEmail) {
                $client = Client::where('email', $clientEmail)->first();
            }
            
            if (!$client && $clientIdentifier) {
                $client = Client::where('uuid', $clientIdentifier)->first();
            }

            if (!$client) {
                Log::warning('JotForm Intake: Client not found', [
                    'email' => $clientEmail,
                    'identifier' => $clientIdentifier,
                    'data' => $data,
                ]);
                
                return response()->json([
                    'message' => 'Client not found',
                    'received' => true,
                    'redirect_url' => 'https://vanquishtherapiesvqt.trafft.com/',
                ], 200);
            }

            // Extract important questions: 6, 9, 16, 22, 24, 34
            // JotForm uses question numbers like q6, q9, q16, q22, q24, q34
            $importantQuestions = [
                'question_6' => $this->extractFieldValue($data, ['q6', 'question6', 'question_6']),
                'question_9' => $this->extractFieldValue($data, ['q9', 'question9', 'question_9']),
                'question_16' => $this->extractFieldValue($data, ['q16', 'question16', 'question_16']),
                'question_22' => $this->extractFieldValue($data, ['q22', 'question22', 'question_22']),
                'question_24' => $this->extractFieldValue($data, ['q24', 'question24', 'question_24']),
                'question_34' => $this->extractFieldValue($data, ['q34', 'question34', 'question_34']),
            ];

            // Store all form data plus important questions
            $jotformData = [
                'all_data' => $data,
                'important_questions' => $importantQuestions,
                'submission_id' => $data['submissionID'] ?? $data['submission_id'] ?? null,
            ];

            // Update client record
            $client->update([
                'jotform_intake_data' => $jotformData,
                'jotform_intake_submission_id' => $data['submissionID'] ?? $data['submission_id'] ?? null,
                'jotform_intake_completed_at' => now(),
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => null, // System action
                'action' => 'jotform_intake_submitted',
                'model_type' => Client::class,
                'model_id' => $client->id,
                'description' => "JotForm intake form submitted for {$client->name}",
                'changes' => [
                    'submission_id' => $data['submissionID'] ?? $data['submission_id'] ?? null,
                    'important_questions' => $importantQuestions,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            Log::info('JotForm Intake: Successfully processed', [
                'client_id' => $client->id,
                'client_uuid' => $client->uuid,
                'email' => $client->email,
                'submission_id' => $data['submissionID'] ?? $data['submission_id'] ?? null,
            ]);

            // Return redirect URL for JotForm to redirect client to booking system
            return response()->json([
                'message' => 'Intake form processed successfully',
                'client_uuid' => $client->uuid,
                'client_id' => $client->client_id,
                'redirect_url' => 'https://vanquishtherapiesvqt.trafft.com/',
            ], 200);

        } catch (\Exception $e) {
            Log::error('JotForm Intake Webhook Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all(),
            ]);

            // Return 200 to prevent JotForm from retrying excessively
            return response()->json([
                'message' => 'Error processing intake form',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal error',
                'redirect_url' => 'https://vanquishtherapiesvqt.trafft.com/',
            ], 200);
        }
    }

    /**
     * Extract field value from JotForm webhook data
     * Tries multiple possible field name formats
     * 
     * @param array $data Webhook data from JotForm
     * @param array $possibleNames Array of possible field names to try
     * @return mixed Field value if found, null otherwise
     */
    private function extractFieldValue(array $data, array $possibleNames)
    {
        foreach ($possibleNames as $fieldName) {
            if (isset($data[$fieldName]) && !empty($data[$fieldName])) {
                return $data[$fieldName];
            }
        }

        return null;
    }
}
