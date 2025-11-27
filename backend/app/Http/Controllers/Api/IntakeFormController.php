<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientIntakeForm;
use App\Models\TcIntakeForm;
use App\Models\Client;
use App\Models\TrainingCounsellor;
use Illuminate\Http\Request;

class IntakeFormController extends Controller
{
    public function clientIntake(Request $request)
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:255',
                'age' => 'nullable|integer|min:1|max:120',
                'voicemail_ok' => 'nullable|boolean',
                'currently_in_therapy' => 'nullable|boolean',
                'gender' => 'nullable|string|max:255',
                'ethnicity' => 'nullable|string|max:255',
                'sexual_orientation' => 'nullable|string|max:255',
                'service_type' => 'nullable|string|max:255',
                'on_medication' => 'nullable|boolean',
                'medication_details' => 'nullable|string',
                'disabilities' => 'nullable|string',
                'support_areas' => 'nullable|array',
                'concerns_details' => 'nullable|string',
                'risk_issues' => 'nullable|string',
                'availability' => 'nullable|array',
                'gender_preference' => 'nullable|string|max:255',
                'age_preference' => 'nullable|string|max:255',
                'ethnicity_preference' => 'nullable|string|max:255',
                'orientation_preference' => 'nullable|string|max:255',
                'hear_about_us' => 'nullable|string|max:255',
                'referral_reason' => 'nullable|string',
                'referrer_name' => 'nullable|string|max:255',
                'referrer_phone' => 'nullable|string|max:255',
                'referrer_org' => 'nullable|string|max:255',
                'referrer_email' => 'nullable|email|max:255',
                'terms_accepted' => 'required|boolean|accepted',
                'create_client' => 'nullable|boolean',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        try {
            $form = ClientIntakeForm::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'age' => $validated['age'] ?? null,
                'voicemail_ok' => $validated['voicemail_ok'] ?? false,
                'currently_in_therapy' => $validated['currently_in_therapy'] ?? false,
                'gender' => $validated['gender'] ?? null,
                'ethnicity' => $validated['ethnicity'] ?? null,
                'sexual_orientation' => $validated['sexual_orientation'] ?? null,
                'service_type' => $validated['service_type'] ?? null,
                'on_medication' => $validated['on_medication'] ?? false,
                'medication_details' => $validated['medication_details'] ?? null,
                'disabilities' => $validated['disabilities'] ?? null,
                'support_areas' => $validated['support_areas'] ?? [],
                'concerns_details' => $validated['concerns_details'] ?? null,
                'risk_issues' => $validated['risk_issues'] ?? null,
                'availability' => $validated['availability'] ?? [],
                'gender_preference' => $validated['gender_preference'] ?? 'No preference',
                'age_preference' => $validated['age_preference'] ?? 'No preference',
                'ethnicity_preference' => $validated['ethnicity_preference'] ?? 'No preference',
                'orientation_preference' => $validated['orientation_preference'] ?? 'No preference',
                'hear_about_us' => $validated['hear_about_us'] ?? null,
                'referral_reason' => $validated['referral_reason'] ?? null,
                'referrer_name' => $validated['referrer_name'] ?? null,
                'referrer_phone' => $validated['referrer_phone'] ?? null,
                'referrer_org' => $validated['referrer_org'] ?? null,
                'referrer_email' => $validated['referrer_email'] ?? null,
                'terms_accepted' => $validated['terms_accepted'],
                'status' => 'submitted',
            ]);

            $clientId = null;
            
            // Optionally create client from intake form
            if ($request->has('create_client') && $request->create_client) {
                $client = Client::create([
                    'client_id' => 'CL' . str_pad(Client::count() + 1, 3, '0', STR_PAD_LEFT),
                    'name' => "{$validated['first_name']} {$validated['last_name']}",
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'age' => $validated['age'] ?? null,
                    'gender' => $validated['gender'] ?? null,
                    'service_type' => $validated['service_type'] ?? null,
                    'primary_issues' => $validated['support_areas'] ?? [],
                    'availability' => $validated['availability'] ?? [],
                    'submitted_date' => now(),
                    'stage' => 'Application',
                ]);

                $form->update(['client_id' => $client->id]);
                $clientId = $client->id;
            }

            return response()->json([
                'message' => 'Intake form submitted successfully',
                'form' => $form,
                'client_id' => $clientId ?? $form->client_id,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create intake form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function tcIntake(Request $request)
    {
        try {
            // Validate form fields
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:255',
                'modality' => 'nullable|string|max:255',
                'course' => 'nullable|string|max:255',
                'institution' => 'nullable|string|max:255',
                'topics_with_experience' => 'nullable|array',
                'topics_not_ready_for' => 'nullable|array',
                'availability' => 'nullable|array',
                'additional_info' => 'nullable|string',
                // Training provider details
                'training_org_name' => 'nullable|string|max:255',
                'training_org_address' => 'nullable|string|max:500',
                'course_title' => 'nullable|string|max:255',
                'tutor_name' => 'nullable|string|max:255',
                'tutor_email' => 'nullable|email|max:255',
                'tutor_phone' => 'nullable|string|max:255',
                'placement_lead_name' => 'nullable|string|max:255',
                'placement_lead_email' => 'nullable|email|max:255',
                'placement_lead_phone' => 'nullable|string|max:255',
                // Document validations
                'fitnessTopractice' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
                'qualifications' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
                'dbs' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
                'cv' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
                'validId' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
                'insurance' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
                'create_tc' => 'nullable|boolean',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        try {
            // Prepare training provider details as JSON
            $trainingProviderDetails = [];
            if (!empty($validated['training_org_name'])) $trainingProviderDetails['training_org_name'] = $validated['training_org_name'];
            if (!empty($validated['training_org_address'])) $trainingProviderDetails['training_org_address'] = $validated['training_org_address'];
            if (!empty($validated['course_title'])) $trainingProviderDetails['course_title'] = $validated['course_title'];
            if (!empty($validated['tutor_name'])) $trainingProviderDetails['tutor_name'] = $validated['tutor_name'];
            if (!empty($validated['tutor_email'])) $trainingProviderDetails['tutor_email'] = $validated['tutor_email'];
            if (!empty($validated['tutor_phone'])) $trainingProviderDetails['tutor_phone'] = $validated['tutor_phone'];
            if (!empty($validated['placement_lead_name'])) $trainingProviderDetails['placement_lead_name'] = $validated['placement_lead_name'];
            if (!empty($validated['placement_lead_email'])) $trainingProviderDetails['placement_lead_email'] = $validated['placement_lead_email'];
            if (!empty($validated['placement_lead_phone'])) $trainingProviderDetails['placement_lead_phone'] = $validated['placement_lead_phone'];
            
            // Merge with existing additional_info if it exists
            $existingAdditionalInfo = $validated['additional_info'] ?? null;
            if ($existingAdditionalInfo) {
                try {
                    $existingData = json_decode($existingAdditionalInfo, true);
                    if (is_array($existingData)) {
                        $trainingProviderDetails = array_merge($existingData, $trainingProviderDetails);
                    }
                } catch (\Exception $e) {
                    // If additional_info is not JSON, keep it as is
                }
            }
            
            // Prepare form data
            $formData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'modality' => $validated['modality'] ?? null,
                'course' => $validated['course_title'] ?? $validated['course'] ?? null,
                'institution' => $validated['training_org_name'] ?? $validated['institution'] ?? null,
                'topics_with_experience' => $validated['topics_with_experience'] ?? [],
                'topics_not_ready_for' => $validated['topics_not_ready_for'] ?? [],
                'availability' => $validated['availability'] ?? [],
                'additional_info' => !empty($trainingProviderDetails) ? json_encode($trainingProviderDetails) : null,
                'status' => 'submitted',
            ];

            // Handle document uploads
            $documentFields = [
                'fitnessTopractice' => 'fitness_to_practice',
                'qualifications' => 'qualifications',
                'dbs' => 'dbs_certificate',
                'cv' => 'cv',
                'validId' => 'valid_id',
                'insurance' => 'insurance_certificate',
            ];

            foreach ($documentFields as $requestField => $dbField) {
                if ($request->hasFile($requestField)) {
                    $file = $request->file($requestField);
                    
                    // Additional security checks
                    $originalName = $file->getClientOriginalName();
                    $extension = strtolower($file->getClientOriginalExtension());
                    $mimeType = $file->getMimeType();
                    
                    // Validate file extension
                    $allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
                    if (!in_array($extension, $allowedExtensions)) {
                        return response()->json([
                            'message' => 'Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG',
                        ], 422);
                    }
                    
                    // Validate MIME type
                    $allowedMimeTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'image/jpeg',
                        'image/png',
                    ];
                    if (!in_array($mimeType, $allowedMimeTypes)) {
                        return response()->json([
                            'message' => 'Invalid file MIME type.',
                        ], 422);
                    }
                    
                    // Sanitize filename
                    $sanitizedName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
                    $sanitizedName = substr($sanitizedName, 0, 255); // Limit filename length
                    
                    // Generate unique filename to prevent overwrites
                    $filename = time() . '_' . uniqid() . '_' . $sanitizedName;
                    
                    $path = $file->storeAs("tc_intake_forms/documents/{$dbField}", $filename, 'public');
                    $formData[$dbField] = $path;
                }
            }

            // Create the intake form
            $form = TcIntakeForm::create($formData);

            // Optionally create TC from intake form
            if ($request->has('create_tc') && $request->create_tc) {
                $tc = TrainingCounsellor::create([
                    'tc_id' => 'TC' . str_pad(TrainingCounsellor::count() + 1, 3, '0', STR_PAD_LEFT),
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'modality' => $validated['modality'] ?? null,
                    'course' => $validated['course'] ?? null,
                    'institution' => $validated['institution'] ?? null,
                    'topics_with_experience' => $validated['topics_with_experience'] ?? [],
                    'topics_not_ready_for' => $validated['topics_not_ready_for'] ?? [],
                    'availability' => $validated['availability'] ?? [],
                    'joined_date' => now(),
                    'last_activity' => now(),
                    'status' => 'Active',
                ]);

                $form->update(['tc_id' => $tc->id]);
            }

            return response()->json([
                'message' => 'Intake form submitted successfully',
                'form' => $form,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create intake form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
