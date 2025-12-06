<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'training_counsellor_id',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'two_factor_recovery_codes' => 'array',
        ];
    }

    /**
     * Get the training counsellor associated with this user (for counsellor role)
     */
    public function trainingCounsellor(): BelongsTo
    {
        return $this->belongsTo(TrainingCounsellor::class, 'training_counsellor_id');
    }

    /**
     * Get the permissions for this user
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_permissions');
    }

    /**
     * Get messages sent by this user
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'from_user_id');
    }

    /**
     * Get messages received by this user
     */
    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'to_user_id');
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permissionName): bool
    {
        // Admins have all permissions
        if ($this->role === 'admin') {
            return true;
        }

        // Check if user has the specific permission
        return $this->permissions()->where('name', $permissionName)->exists();
    }

    /**
     * Check if user can perform an action based on role and permissions
     */
    public function canPerform(string $action): bool
    {
        // Admins can do everything
        if ($this->role === 'admin') {
            return true;
        }

        // Staff can do most things (unless restricted by permissions)
        if ($this->role === 'staff') {
            // Check for explicit denial permission
            if ($this->hasPermission('deny_' . $action)) {
                return false;
            }
            // If no explicit permission required, staff can do it
            return true;
        }

        // Counsellors have minimal permissions
        if ($this->role === 'counsellor') {
            // Only allow specific actions
            $allowedActions = ['view_own_clients', 'view_own_sessions', 'send_message'];
            return in_array($action, $allowedActions) || $this->hasPermission($action);
        }

        return false;
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is staff (admin or staff role)
     */
    public function isStaff(): bool
    {
        return in_array($this->role, ['admin', 'staff']);
    }

    /**
     * Check if user is counsellor
     */
    public function isCounsellor(): bool
    {
        return $this->role === 'counsellor';
    }
}
