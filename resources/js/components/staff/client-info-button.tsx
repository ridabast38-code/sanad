import { APPROACH_LABELS, LANGUAGE_LABELS } from '@/components/specialist-card';
import { InfoModal, InfoRow } from '@/components/staff/info-modal';
import { Info } from 'lucide-react';
import { useState } from 'react';

export interface ClientProfile {
    date_of_birth: string | null;
    gender: string | null;
    preferred_language: string | null;
    preferred_approach: string | null;
    support_reason: string | null;
    emergency_contact: string | null;
}

export interface ClientDetail {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    sessions: number;
    spent: number;
    joined: string | null;
    profile: ClientProfile | null;
}

const label = (map: Record<string, string>, value: string | null): string | null => {
    if (!value) {
        return null;
    }
    if (value === 'unsure') {
        return 'Unsure / open to guidance';
    }
    return map[value] ?? value;
};

const cap = (value: string | null): string | null => (value ? value.charAt(0).toUpperCase() + value.slice(1) : null);

/**
 * The "Info" affordance on the admin clients list. Opens a panel with everything
 * the client shared at onboarding — how to reach them, and what they came for.
 */
export function ClientInfoButton({ client }: { client: ClientDetail }) {
    const [open, setOpen] = useState(false);
    const p = client.profile;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="border-ashen-300 text-ashen-700 hover:bg-ashen-100 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
            >
                <Info className="size-3.5" /> Info
            </button>

            {open && (
                <InfoModal title={client.name} subtitle={client.email} onClose={() => setOpen(false)}>
                    <InfoRow label="Email" value={client.email} />
                    <InfoRow label="Phone" value={client.phone} />
                    <InfoRow label="Reason" value={p?.support_reason} />
                    <InfoRow label="Approach" value={label(APPROACH_LABELS, p?.preferred_approach ?? null)} />
                    <InfoRow label="Language" value={label(LANGUAGE_LABELS, p?.preferred_language ?? null)} />
                    <InfoRow label="Gender" value={cap(p?.gender ?? null)} />
                    <InfoRow label="Born" value={p?.date_of_birth} />
                    <InfoRow label="Emergency" value={p?.emergency_contact} />
                    <InfoRow label="Sessions" value={client.sessions} />
                    <InfoRow label="Joined" value={client.joined} />
                </InfoModal>
            )}
        </>
    );
}
