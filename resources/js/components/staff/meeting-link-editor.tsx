import { router } from '@inertiajs/react';
import { Check, Link2, Pencil, Video, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Add, edit, or open the video meeting link for a confirmed session. Used by
 * both the admin bookings screen and the practitioner dashboard — it PATCHes
 * /bookings/{id}/meeting-link, which both roles are authorised to call.
 */
export function MeetingLinkEditor({ bookingId, meetingLink }: { bookingId: number; meetingLink: string | null }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(meetingLink ?? '');
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        router.patch(
            `/bookings/${bookingId}/meeting-link`,
            { meeting_link: value.trim() },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSaving(false);
                    setEditing(false);
                },
            },
        );
    };

    if (editing) {
        return (
            <div className="flex w-full items-center gap-2">
                <span className="text-ashen-400 flex size-9 shrink-0 items-center justify-center">
                    <Link2 className="size-4" />
                </span>
                <input
                    type="url"
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                    placeholder="https://meet.google.com/…"
                    className="border-ashen-200 focus:border-ashen-400 focus:ring-ashen-200 text-ashen-800 bg-ashen-50/80 min-w-0 flex-1 rounded-full border px-4 py-2 text-sm transition outline-none focus:ring-2"
                />
                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    aria-label="Save link"
                    className="bg-ashen-700 hover:bg-ashen-800 flex size-9 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-60"
                >
                    <Check className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setValue(meetingLink ?? '');
                        setEditing(false);
                    }}
                    aria-label="Cancel"
                    className="border-ashen-300 text-ashen-500 hover:bg-ashen-100 flex size-9 shrink-0 items-center justify-center rounded-full border transition"
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    if (meetingLink) {
        return (
            <div className="flex shrink-0 items-center gap-2">
                <a
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white transition"
                >
                    <Video className="size-3.5" /> Open link
                </a>
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    aria-label="Edit link"
                    className="border-ashen-300 text-ashen-500 hover:bg-ashen-100 flex size-9 items-center justify-center rounded-full border transition"
                >
                    <Pencil className="size-3.5" />
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            className="border-ashen-300 text-ashen-700 hover:bg-ashen-50 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed px-3.5 py-2 text-xs font-medium transition"
        >
            <Link2 className="size-3.5" /> Add meeting link
        </button>
    );
}
