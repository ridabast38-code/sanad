import { CARD, PageHeader } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { useMemo, type FormEvent } from 'react';

interface Service {
    id: number;
    name: string;
    price: number;
}

interface Slot {
    iso: string;
    label: string;
}

interface Practitioner {
    id: number;
    name: string;
    services: Service[];
    slots: Slot[];
}

interface ClientOption {
    id: number;
    name: string;
    email: string;
}

interface EmergencyCategory {
    key: string;
    label: string;
}

interface Props {
    practitioners: Practitioner[];
    clients: ClientOption[];
    emergencyCategories: EmergencyCategory[];
}

const FIELD =
    'border-ashen-200 focus:border-ashen-400 focus:ring-ashen-200 text-ashen-800 w-full rounded-xl border bg-ashen-50/80 px-4 py-2.5 text-sm transition outline-none focus:ring-2';
const LABEL = 'text-ashen-700 mb-1.5 block text-sm font-medium';

export default function AdminBookingCreate({ practitioners, clients, emergencyCategories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        practitioner_id: '',
        service_id: '',
        scheduled_at: '',
        type: 'standard',
        emergency_category: '',
        client_type: 'registered',
        client_id: '',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        client_note: '',
    });

    const isEmergency = data.type === 'emergency';

    const practitioner = useMemo(() => practitioners.find((p) => String(p.id) === data.practitioner_id), [practitioners, data.practitioner_id]);

    const choosePractitioner = (id: string) => {
        // Reset the dependent choices whenever the specialist changes.
        setData((current) => ({ ...current, practitioner_id: id, service_id: '', scheduled_at: '' }));
    };

    const isGuest = data.client_type === 'guest';

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/admin/bookings');
    };

    return (
        <StaffLayout title="New booking">
            <Link href="/admin/bookings" className="text-ashen-500 hover:text-ashen-700 mb-4 inline-flex items-center gap-1.5 text-sm transition">
                <ArrowLeft className="size-4" /> Back to bookings
            </Link>

            <PageHeader title="New booking" subtitle="Book on behalf of a client who reached you by phone or WhatsApp." />

            <form onSubmit={submit} className={`max-w-2xl space-y-6 p-6 ${CARD}`}>
                {/* Booking type */}
                <div>
                    <label className={LABEL}>Booking type</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setData((c) => ({ ...c, type: 'standard', emergency_category: '' }))}
                            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                                !isEmergency ? 'border-ashen-500 bg-ashen-50 text-ashen-800' : 'border-ashen-200 text-ashen-500 hover:bg-ashen-50'
                            }`}
                        >
                            Calm / ongoing
                        </button>
                        <button
                            type="button"
                            onClick={() => setData('type', 'emergency')}
                            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                                isEmergency ? 'border-ashen-950 bg-ashen-950 text-ashen-50' : 'border-ashen-300 text-ashen-500 hover:bg-ashen-50'
                            }`}
                        >
                            Emergency
                        </button>
                    </div>
                    {isEmergency && (
                        <div className="mt-4">
                            <label className={LABEL}>What kind of emergency?</label>
                            <select className={FIELD} value={data.emergency_category} onChange={(e) => setData('emergency_category', e.target.value)}>
                                <option value="">Choose a category…</option>
                                {emergencyCategories.map((category) => (
                                    <option key={category.key} value={category.key}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                            {errors.emergency_category && <p className="mt-1 text-xs text-red-600">{errors.emergency_category}</p>}
                        </div>
                    )}
                </div>

                {/* Specialist */}
                <div>
                    <label className={LABEL}>Specialist</label>
                    <select className={FIELD} value={data.practitioner_id} onChange={(e) => choosePractitioner(e.target.value)}>
                        <option value="">Choose a specialist…</option>
                        {practitioners.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    {errors.practitioner_id && <p className="mt-1 text-xs text-red-600">{errors.practitioner_id}</p>}
                </div>

                {/* Service + slot (once a specialist is chosen) */}
                {practitioner && (
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label className={LABEL}>Service</label>
                            <select className={FIELD} value={data.service_id} onChange={(e) => setData('service_id', e.target.value)}>
                                <option value="">Choose a service…</option>
                                {practitioner.services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} — ${s.price}
                                    </option>
                                ))}
                            </select>
                            {errors.service_id && <p className="mt-1 text-xs text-red-600">{errors.service_id}</p>}
                        </div>
                        <div>
                            <label className={LABEL}>Time</label>
                            <select className={FIELD} value={data.scheduled_at} onChange={(e) => setData('scheduled_at', e.target.value)}>
                                <option value="">Choose a time…</option>
                                {practitioner.slots.map((slot) => (
                                    <option key={slot.iso} value={slot.iso}>
                                        {slot.label}
                                    </option>
                                ))}
                            </select>
                            {practitioner.slots.length === 0 && (
                                <p className="text-ashen-400 mt-1 text-xs">No free slots — every upcoming time is already booked.</p>
                            )}
                            {errors.scheduled_at && <p className="mt-1 text-xs text-red-600">{errors.scheduled_at}</p>}
                        </div>
                    </div>
                )}

                {/* Who is this for? */}
                <div>
                    <label className={LABEL}>Who is this for?</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setData('client_type', 'registered')}
                            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                                !isGuest ? 'border-ashen-500 bg-ashen-50 text-ashen-800' : 'border-ashen-200 text-ashen-500 hover:bg-ashen-50'
                            }`}
                        >
                            Registered client
                        </button>
                        <button
                            type="button"
                            onClick={() => setData('client_type', 'guest')}
                            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                                isGuest ? 'border-ashen-500 bg-ashen-50 text-ashen-800' : 'border-ashen-200 text-ashen-500 hover:bg-ashen-50'
                            }`}
                        >
                            Walk-in / WhatsApp
                        </button>
                    </div>
                </div>

                {!isGuest ? (
                    <div>
                        <label className={LABEL}>Client</label>
                        <select className={FIELD} value={data.client_id} onChange={(e) => setData('client_id', e.target.value)}>
                            <option value="">Choose a registered client…</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.email})
                                </option>
                            ))}
                        </select>
                        {errors.client_id && <p className="mt-1 text-xs text-red-600">{errors.client_id}</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className={LABEL}>Name</label>
                            <input
                                className={FIELD}
                                value={data.guest_name}
                                onChange={(e) => setData('guest_name', e.target.value)}
                                placeholder="Their full name"
                            />
                            {errors.guest_name && <p className="mt-1 text-xs text-red-600">{errors.guest_name}</p>}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className={LABEL}>Email (optional)</label>
                                <input
                                    type="email"
                                    className={FIELD}
                                    value={data.guest_email}
                                    onChange={(e) => setData('guest_email', e.target.value)}
                                    placeholder="So they get confirmations"
                                />
                                {errors.guest_email && <p className="mt-1 text-xs text-red-600">{errors.guest_email}</p>}
                            </div>
                            <div>
                                <label className={LABEL}>Phone (optional)</label>
                                <input
                                    className={FIELD}
                                    value={data.guest_phone}
                                    onChange={(e) => setData('guest_phone', e.target.value)}
                                    placeholder="WhatsApp number"
                                />
                                {errors.guest_phone && <p className="mt-1 text-xs text-red-600">{errors.guest_phone}</p>}
                            </div>
                        </div>
                        <p className="text-ashen-400 text-xs">
                            No account is created. If you add an email, they'll receive booking confirmations there.
                        </p>
                    </div>
                )}

                {/* Note */}
                <div>
                    <label className={LABEL}>Note (optional)</label>
                    <textarea
                        className={`${FIELD} min-h-20`}
                        value={data.client_note}
                        onChange={(e) => setData('client_note', e.target.value)}
                        placeholder="Anything the specialist should know"
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                    <CalendarPlus className="size-4" /> Create booking
                </button>
            </form>
        </StaffLayout>
    );
}
