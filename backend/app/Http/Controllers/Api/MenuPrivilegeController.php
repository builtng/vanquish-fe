<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuPrivilege;
use Illuminate\Http\Request;

class MenuPrivilegeController extends Controller
{
    /**
     * Get all menu privileges
     */
    public function index()
    {
        return response()->json(MenuPrivilege::all());
    }

    /**
     * Update menu privilege for a specific menu item
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|string|exists:menu_privileges,menu_id',
            'roles' => 'present|array',
            'roles.*' => 'in:admin,staff,counsellor',
        ]);

        $privilege = MenuPrivilege::where('menu_id', $validated['menu_id'])->first();
        $privilege->update(['roles' => $validated['roles']]);

        return response()->json($privilege);
    }

    /**
     * Get menu privileges for a specific role
     */
    public function getForRole(string $role)
    {
        if (!in_array($role, ['admin', 'staff', 'counsellor'])) {
            return response()->json(['message' => 'Invalid role'], 400);
        }

        $privileges = MenuPrivilege::all()->filter(function ($p) use ($role) {
            return in_array($role, $p->roles);
        })->pluck('menu_id')->values();

        return response()->json($privileges);
    }
}
