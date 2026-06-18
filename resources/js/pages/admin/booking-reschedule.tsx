import { CARD, PageHeader } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { type FormEvent } from 'react';

interface Slot {
    iso: string;
    label: string;
}

interface BookingSummary {
    id: number;
    client: string;
    practitioner: string;
    service: string;
    current_label: string;
}

interface Props {
    booking: BookingSummary;
    slots: Slot[];
}

const FIELD =
    'border-sage-200 focus:border-sage-400 focus:ring-sage-200 text-ashen-800 w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition outline-none focus:ring-2';

export default function AdminBookingReschedule({ booking, slots }: Props) {
    const { data, setData, patch, processing, errors } = useForm({ scheduled_at: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        patch(`/admin/bookings/${booking.id}/reschedule`);
    };

    return (
        <StaffLayout title="Reschedule session">
            <Link href="/admin/bookings" className="text-ashen-500 hover:text-sage-700 mb-4 inline-flex items-center gap-1.5 text-sm transition">
                <ArrowLeft className="size-4" /> Back to bookings
            </Link>

            <PageHeader title="Reschedule session" subtitle="Move this session to another free time on the same specialist." />

            <form onSubmit={submit} className={`max-w-2xl space-y-6 p-6 ${CARD}`}>
                <div className="bg-sage-50/60 rounded-xl p-4">
                    <p className="text-ashen-800 font-medium">
                        {booking.service} — {booking.client} <span className="text-ashen-400 font-normal">with</span> {booking.practitioner}
                    </p>
                    <p className="text-ashen-500 mt-1 text-sm">
                        Currently: <span className="font-medium">{booking.current_label}</span>
                    </p>
                </div>

                <div>
                    <label className="text-ashen-700 mb-1.5 block text-sm font-medium">New time</label>
                    <select className={FIELD} value={data.scheduled_at} onChange={(e) => setData('scheduled_at', e.target.value)}>
                        <option value="">Choose a new time…</option>
                        {slots.map((slot) => (
                            <option key={slot.iso} value={slot.iso}>
                                {slot.label}
                            </option>
                        ))}
                    </select>
                    {slots.length === 0 && (
                        <p className="text-ashen-400 mt-1 text-xs">No other free times — every upcoming slot for this specialist is taken.</p>
                    )}
                    {errors.scheduled_at && <p className="mt-1 text-xs text-red-600">{errors.scheduled_at}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.scheduled_at}
                    className="bg-sage-700 hover:bg-sage-800 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                    <CalendarClock className="size-4" /> Move session
                </button>
            </form>
        </StaffLayout>
    );
}
