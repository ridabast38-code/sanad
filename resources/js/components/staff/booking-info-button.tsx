import { InfoModal, InfoRow } from '@/components/staff/info-modal';
import { money } from '@/components/staff/kit';
import { Info } from 'lucide-react';
import { useState } from 'react';

export interface BookingDetail {
    id: number;
    client: string;
    practitioner: string;
    service: string;
    type: string;
    emergency_category: string | null;
    scheduled_label: string;
    status: string;
    payment_status: string;
    price: number;
    is_guest: boolean;
    email: string | null;
    phone: string | null;
    client_note: string | null;
}

/**
 * The "Info" affordance on the admin bookings views. Opens a panel with the
 * booker's contact details and whatever note they left — the only place an admin
 * can reach a walk-in guest, who has no account to look up.
 */
export function BookingInfoButton({ booking }: { booking: BookingDetail }) {
    const [open, setOpen] = useState(false);

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
                <InfoModal
                    title={booking.client}
                    subtitle={booking.is_guest ? 'Guest — no account' : 'Registered client'}
                    onClose={() => setOpen(false)}
                >
                    <InfoRow label="Email" value={booking.email} />
                    <InfoRow label="Phone" value={booking.phone} />
                    <InfoRow label="Note" value={booking.client_note} />
                    <InfoRow label="Practitioner" value={booking.practitioner} />
                    <InfoRow label="Service" value={booking.service} />
                    <InfoRow label="Type" value={booking.type === 'emergency' ? 'Emergency' : 'Standard'} />
                    {booking.emergency_category && <InfoRow label="Category" value={booking.emergency_category} />}
                    <InfoRow label="When" value={booking.scheduled_label} />
                    <InfoRow label="Price" value={money(booking.price)} />
                </InfoModal>
            )}
        </>
    );
}
