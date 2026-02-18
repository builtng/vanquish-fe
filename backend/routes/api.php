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
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ClientBookingController;
use App\Http\Controllers\Api\JotFormWebhookController;
use App\Http\Controllers\Api\ClientAgreementController;
use Illuminate\Support\Facades\Route;

// Public routes with stricter rate limiting
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/register', [AuthController::class, 'register']);
});

// Service routes (public)
Route::get('/services/ish-capacity', [\App\Http\Controllers\Api\ServiceController::class, 'checkIshCapacity']);
Route::post('/coupons/verify', [\App\Http\Controllers\Api\CouponController::class, 'verify']);

// Client booking routes (public - clients book without auth)
Route::prefix('client-booking')->group(function () {
    Route::post('/authenticate', [ClientBookingController::class, 'authenticate']);
    Route::get('/{clientUuid}/status', [ClientBookingController::class, 'getBookingStatus']);
    Route::get('/{clientUuid}/available-slots', [ClientBookingController::class, 'getAvailableSlots']);
    Route::post('/book-session', [ClientBookingController::class, 'bookSession']);
    Route::post('/book-block', [ClientBookingController::class, 'bookBlock']);
});

// Payment routes (public for client intake)
Route::post('/payments/create-intent', [PaymentController::class, 'createPaymentIntent']);
Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
// Webhook endpoint - no rate limiting but signature verification required
Route::post('/payments/webhook', [PaymentController::class, 'handleWebhook'])->withoutMiddleware(['throttle:api']);

// JotForm webhooks (public - no auth required)
Route::post('/jotform/agreement-webhook', [JotFormWebhookController::class, 'handleAgreementSubmission'])->withoutMiddleware(['throttle:api']);
Route::post('/jotform/intake-webhook', [JotFormWebhookController::class, 'handleIntakeSubmission'])->withoutMiddleware(['throttle:api']);

// Intake Forms (public - clients need to submit without auth)
// Rate limited to prevent abuse
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/client-intake', [IntakeFormController::class, 'clientIntake']);
    Route::post('/tc-intake', [IntakeFormController::class, 'tcIntake']);
    Route::post('/client-agreement/submit', [ClientAgreementController::class, 'submitAgreement']);
});

// Induction acceptance (public - TCs need to accept without auth)
Route::post('/induction/accept/{token}', [InductionController::class, 'acceptInvitation']);
Route::post('/induction/decline/{token}', [InductionController::class, 'declineInvitation']);

// Protected routes - higher rate limit for authenticated users
Route::middleware(['auth:sanctum', 'throttle:200,1'])->group(function () {
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
        Route::get('/clients/{client}/download-report', [ClientController::class, 'downloadReport']);
        Route::post('/clients/{client}/progress-stage', [ClientController::class, 'progressStage']);
        Route::post('/clients/{client}/send-email', [ClientController::class, 'sendEmail']);
        Route::post('/clients/{client}/send-feedback-form', [ClientController::class, 'sendFeedbackForm']);
        Route::post('/clients/{client}/resend-agreement', [ClientController::class, 'resendAgreement']);
        Route::post('/clients/{client}/update-satisfaction', [ClientController::class, 'updateSatisfactionScore']);
        Route::get('/clients/eligible-for-feedback', [ClientController::class, 'getEligibleForFeedback']);
    });

    // Client photo upload (admin only)
    Route::middleware('admin')->group(function () {
        Route::post('/clients/{client}/upload-photo', [ClientController::class, 'uploadPhoto']);
        Route::delete('/clients/{client}/delete-photo', [ClientController::class, 'deletePhoto']);
    });

    // Trainee Counsellors (staff and admin only)
    Route::middleware('staff')->group(function () {
        Route::apiResource('training-counsellors', TrainingCounsellorController::class);
        Route::get('/training-counsellors/{tc}/details', [TrainingCounsellorController::class, 'details']);
        Route::get('/training-counsellors/{tc}/download-report', [TrainingCounsellorController::class, 'downloadReport']);
        Route::post('/training-counsellors/{tc}/transition-to-qualified', [TrainingCounsellorController::class, 'transitionToQualified']);
        Route::post('/training-counsellors/{tc}/send-email', [TrainingCounsellorController::class, 'sendEmail']);
    });

    // Counsellor portal endpoints (counsellors can access their own data)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/counsellor/my-data', [TrainingCounsellorController::class, 'getOwnData']);
    });

    // TC photo upload (admin only)
    Route::middleware('admin')->group(function () {
        Route::post('/training-counsellors/{tc}/upload-photo', [TrainingCounsellorController::class, 'uploadPhoto']);
        Route::delete('/training-counsellors/{tc}/delete-photo', [TrainingCounsellorController::class, 'deletePhoto']);
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
        Route::post('/unassign-match', [ClientController::class, 'unassignMatch']);
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

        // Coupons
        Route::apiResource('coupons', \App\Http\Controllers\Api\CouponController::class);
    });

    // User Management (admin only)
    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('/users-count', [UserController::class, 'count']);
    });

    // Inductions (staff and admin only)
    Route::middleware('staff')->group(function () {
        Route::apiResource('inductions', InductionController::class);
        Route::post('/inductions/{id}/add-attendees', [InductionController::class, 'addAttendees']);
    });

    // Messages (all authenticated users)
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::get('/unread-count', [MessageController::class, 'unreadCount']);
        Route::get('/{id}', [MessageController::class, 'show']);
        Route::post('/{id}/mark-read', [MessageController::class, 'markAsRead']);

        // Staff/admin can send to counsellors
        Route::middleware('staff')->group(function () {
            Route::post('/send-to-counsellor', [MessageController::class, 'sendToCounsellor']);
        });

        // Counsellors can send to staff
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/send-to-staff', [MessageController::class, 'sendToStaff']);
        });
    });
});
