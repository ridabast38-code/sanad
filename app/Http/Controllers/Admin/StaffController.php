<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class StaffController extends Controller
{
    /**
     * Create a specialist or admin account with login credentials. Specialists
     * also get a profile (approved, since an admin is adding them) so they
     * appear in the directory once they fill it in.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'in:practitioner,admin'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => UserRole::from($validated['role']),
            'onboarded_at' => now(),
            'email_verified_at' => now(),
        ]);

        if ($user->isPractitioner()) {
            $user->practitionerProfile()->create([
                'type' => 'support',
                'approval_status' => 'approved',
                'approaches' => [],
                'languages' => [],
            ]);
        }

        return to_route($user->isPractitioner() ? 'admin.practitioners' : 'admin.dashboard');
    }
}
