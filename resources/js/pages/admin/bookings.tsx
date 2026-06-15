import { DateFilter } from '@/components/staff/date-filter';
import { Badge, CARD, money, PageHeader, Section, Table, Td } from '@/components/staff/kit';
import { MeetingLinkEditor } from '@/components/staff/meeting-link-editor';
import StaffLayout from '@/layouts/staff-layout';
import { router } from '@inertiajs/react';
import { Check, X } from 'lucide-react';

interface BookingRow {
    id: number;
    client: string;
    practitioner: string;
    service: string;
    scheduled_label: string;
    status: string;
    payment_status: string;
    price: number;
    meeting_link: string | null;
}

interface Props {
    pending: BookingRow[];
    confirmed: BookingRow[];
    bookings: BookingRow[];
    filters: { from: string | null; to: string | null };
}

export default function AdminBookings({ pending, confirmed, bookings, filters }: Props) {
    const act = (id: number, action: 'paid' | 'cancelled') => router.patch(`/admin/bookings/${id}`, { action }, { preserveScroll: true });

    return (
        <StaffLayout title="Bookings">
            <PageHeader title="Bookings" subtitle="Accept paid requests, reject unpaid ones, and review every session." />

            {/* ===== Awaiting your decision ===== */}
            <div className="mb-10">
                <Section title={`Awaiting payment (${pending.length})`}>
                    {pending.length > 0 ? (
                        <div className="space-y-3">
                            {pending.map((b) => (
                                <div key={b.id} className={`flex flex-wrap items-center gap-4 p-4 ${CARD}`}>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-ashen-800 font-medium">
                                            {b.client} <span className="text-ashen-400 font-normal">with</span> {b.practitioner}
                                        </p>
                                        <p className="text-ashen-500 text-sm">
                                            {b.service} · {b.scheduled_label} · {money(b.price)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => act(b.id, 'paid')}
                                        className="bg-sage-700 hover:bg-sage-800 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition"
                                    >
                                        <Check className="size-4" /> Accept (paid)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => act(b.id, 'cancelled')}
                                        className="border-ashen-300 text-ashen-600 hover:bg-ashen-100 inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm font-medium transition"
                                    >
                                        <X className="size-4" /> Reject (unpaid)
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`p-8 text-center ${CARD}`}>
                            <p className="text-ashen-400 text-sm">No requests awaiting payment. You're all caught up.</p>
                        </div>
                    )}
                </Section>
            </div>

            {/* ===== Confirmed sessions needing a meeting link ===== */}
            <div className="mb-10">
                <Section title={`Upcoming sessions — meeting links (${confirmed.length})`}>
                    {confirmed.length > 0 ? (
                        <div className="space-y-3">
                            {confirmed.map((b) => (
                                <div key={b.id} className={`flex flex-wrap items-center gap-4 p-4 ${CARD}`}>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-ashen-800 font-medium">
                                            {b.client} <span className="text-ashen-400 font-normal">with</span> {b.practitioner}
                                        </p>
                                        <p className="text-ashen-500 text-sm">
                                            {b.service} · {b.scheduled_label}
                                        </p>
                                    </div>
                                    <MeetingLinkEditor bookingId={b.id} meetingLink={b.meeting_link} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`p-8 text-center ${CARD}`}>
                            <p className="text-ashen-400 text-sm">No upcoming confirmed sessions yet.</p>
                        </div>
                    )}
                </Section>
            </div>

            {/* ===== Full list ===== */}
            <Section title="All bookings">
                <DateFilter path="/admin/bookings" filters={filters} />
                <Table
                    head={['When', 'Client', 'Practitioner', 'Service', 'Price', 'Status', 'Payment']}
                    empty={bookings.length === 0 ? 'No bookings yet.' : undefined}
                >
                    {bookings.map((b) => (
                        <tr key={b.id}>
                            <Td className="whitespace-nowrap">{b.scheduled_label}</Td>
                            <Td className="font-medium">{b.client}</Td>
                            <Td className="text-ashen-500">{b.practitioner}</Td>
                            <Td className="text-ashen-500">{b.service}</Td>
                            <Td>{money(b.price)}</Td>
                            <Td>
                                <Badge>{b.status}</Badge>
                            </Td>
                            <Td>
                                <Badge>{b.payment_status}</Badge>
                            </Td>
                        </tr>
                    ))}
                </Table>
            </Section>
        </StaffLayout>
    );
}
