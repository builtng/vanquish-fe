<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\TrainingCounsellorController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\IntakeFormController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\InductionController;
use Illuminate\Support\Facades\Route;

// Public routes with stricter rate limiting
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Service routes (public)
Route::get('/services/ish-capacity', [\App\Http\Controllers\Api\ServiceController::class, 'checkIshCapacity']);

// Payment routes (public for client intake)
Route::post('/payments/create-intent', [PaymentController::class, 'createPaymentIntent']);
Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
// Webhook endpoint - no rate limiting but signature verification required
Route::post('/payments/webhook', [PaymentController::class, 'handleWebhook'])->withoutMiddleware(['throttle:api']);

// Intake Forms (public - clients need to submit without auth)
// Rate limited to prevent abuse
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/client-intake', [IntakeFormController::class, 'clientIntake']);
    Route::post('/tc-intake', [IntakeFormController::class, 'tcIntake']);
});

// Induction acceptance (public - TCs need to accept without auth)
Route::post('/induction/accept/{token}', [InductionController::class, 'acceptInvitation']);
Route::post('/induction/decline/{token}', [InductionController::class, 'declineInvitation']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);
    
    // 2FA routes
    Route::post('/2fa/initiate', [AuthController::class, 'initiate2FASetup']);
    Route::post('/2fa/verify', [AuthController::class, 'verify2FASetup']);
    Route::post('/2fa/disable', [AuthController::class, 'disable2FA']);
    Route::post('/2fa/regenerate', [AuthController::class, 'regenerate2FACode']);
    
    // Clients (staff and admin only)
    Route::middleware('staff')->group(function () {
        Route::apiResource('clients', ClientController::class);
        Route::get('/clients/{client}/details', [ClientController::class, 'details']);
        Route::post('/clients/{client}/progress-stage', [ClientController::class, 'progressStage']);
        Route::post('/clients/{client}/send-email', [ClientController::class, 'sendEmail']);
        Route::post('/clients/{client}/send-feedback-form', [ClientController::class, 'sendFeedbackForm']);
        Route::post('/clients/{client}/resend-agreement', [ClientController::class, 'resendAgreement']);
        Route::post('/clients/{client}/update-satisfaction', [ClientController::class, 'updateSatisfactionScore']);
        Route::get('/clients/eligible-for-feedback', [ClientController::class, 'getEligibleForFeedback']);
    });
    
    // Training Counsellors (staff and admin only)
    Route::middleware('staff')->group(function () {
        Route::apiResource('training-counsellors', TrainingCounsellorController::class);
        Route::get('/training-counsellors/{tc}/details', [TrainingCounsellorController::class, 'details']);
        Route::post('/training-counsellors/{tc}/transition-to-qualified', [TrainingCounsellorController::class, 'transitionToQualified']);
        Route::post('/training-counsellors/{tc}/send-email', [TrainingCounsellorController::class, 'sendEmail']);
    });
    
    // Qualified Counsellor Form (staff and admin only - TCs submit through public form)
    Route::middleware('staff')->group(function () {
        Route::post('/qualified-counsellor/submit', [TrainingCounsellorController::class, 'submitQualifiedForm']);
        Route::post('/qualified-counsellor/upload-document', [TrainingCounsellorController::class, 'uploadDocument']);
        Route::post('/training-counsellors/{tc}/send-qualified-form-email', [TrainingCounsellorController::class, 'sendQualifiedFormEmail']);
    });
    
    // Consultations (staff and admin only)
    Route::middleware('staff')->group(function () {
        Route::get('/consultation-stats', [ConsultationController::class, 'stats']);
        Route::apiResource('consultations', ConsultationController::class);
        Route::post('/consultations/{consultation}/complete', [ConsultationController::class, 'complete']);
        Route::post('/consultations/{consultation}/cancel', [ConsultationController::class, 'cancel']);
        Route::post('/consultations/{consultation}/reschedule', [ConsultationController::class, 'reschedule']);
    });
    
    // Pending Matches (staff and admin only)
    Route::middleware('staff')->group(function () {
        Route::get('/pending-matches', [ClientController::class, 'pendingMatches']);
        Route::get('/pending-matches/count', [ClientController::class, 'pendingMatchesCount']);
        Route::post('/matches', [ClientController::class, 'assignMatch']);
    });
    
    // Activity Logs (staff and admin only)
    Route::middleware('staff')->group(function () {
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::post('/activity-logs', [ActivityLogController::class, 'store']);
        Route::put('/activity-logs/{id}', [ActivityLogController::class, 'update']);
        Route::delete('/activity-logs/{id}', [ActivityLogController::class, 'destroy']);
    });
    
    // Service Management (admin only)
    Route::middleware('admin')->group(function () {
        Route::post('/services/update-capacity', [ServiceController::class, 'updateCapacity']);
        Route::post('/services/update-price', [ServiceController::class, 'updatePrice']);
        Route::get('/services/all', [ServiceController::class, 'getAllServices']);
    });
    
    // Inductions (staff and admin only)
    Route::middleware('staff')->group(function () {
        Route::apiResource('inductions', InductionController::class);
        Route::post('/inductions/{id}/add-attendees', [InductionController::class, 'addAttendees']);
    });
});

