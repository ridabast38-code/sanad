<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PractitionerApprovalController extends Controller
{
    /**
     * Approve or reject a practitioner — controls whether they appear in the
     * client directory and can take bookings.
     */
    public function update(Request $request, User $practitioner): RedirectResponse
    {
        abort_unless($practitioner->role === UserRole::Practitioner, 404);

        $validated = $request->validate([
            'approval_status' => ['required', 'in:approved,pending,rejected'],
        ]);

        $practitioner->practitionerProfile()->update([
            'approval_status' => $validated['approval_status'],
        ]);

        return to_route('admin.practitioners');
    }
}
