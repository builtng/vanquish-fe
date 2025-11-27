<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Client;

class ClientPolicy
{
    /**
     * Determine if the user can view any clients.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine if the user can view the client.
     */
    public function view(User $user, Client $client): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine if the user can create clients.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine if the user can update the client.
     */
    public function update(User $user, Client $client): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine if the user can delete the client.
     */
    public function delete(User $user, Client $client): bool
    {
        return $user->role === 'admin';
    }
}

