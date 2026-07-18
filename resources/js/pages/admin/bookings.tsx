import { BookingInfoButton, type BookingDetail } from '@/components/staff/booking-info-button';
import { DateFilter } from '@/components/staff/date-filter';
import { Badge, CARD, money, PageHeader, Section, Table, Td, TypeBadge } from '@/components/staff/kit';
import { MeetingLinkEditor } from '@/components/staff/meeting-link-editor';
import StaffLayout from '@/layouts/staff-layout';
import { Link, router } from '@inertiajs/react';
import { CalendarClock, CalendarPlus, Check, CheckCheck, RotateCcw, UserX, X } from 'lucide-react';

type BookingAction = 'paid' | 'cancelled' | 'completed' | 'no_show';

interface BookingRow extends BookingDetail {
    meeting_link: string | null;
}

interface Props {
    pending: BookingRow[];
    confirmed: BookingRow[];
    bookings: BookingRow[];
    filters: { from: string | null; to: string | null };
}

export default function AdminBookings({ pending, confirmed, bookings, filters }: Props) {
    // Ask for a refund amount (0 to the full price). Returns the amount, or
    // null if the admin backed out. The 80/20 split recalculates on what's kept.
    const askRefund = (price: number, message: string, fallback: string): number | null => {
        const input = window.prompt(message, fallback);
        if (input === null) {
            return null;
        }
        const amount = Number(input);
        if (!Number.isFinite(amount) || amount < 0 || amount > price) {
            window.alert(`Please enter an amount between 0 and ${price}.`);
            return null;
        }
        return amount;
    };

    const act = (id: number, action: BookingAction, price?: number) => {
        let refund_amount: number | undefined;

        if (action === 'cancelled') {
            if (price === undefined) {
                // Rejecting a request that was never paid — nothing to refund.
                if (!window.confirm('Reject this unpaid request?')) {
                    return;
                }
            } else {
                const amount = askRefund(
                    price,
                    `Refund how much to the client? Up to $${price}. Leave the full amount for a full refund — the 80/20 split recalculates on what's kept.`,
                    String(price),
                );
                if (amount === null) {
                    return;
                }
                refund_amount = amount;
            }
        }

        if (action === 'no_show' && price !== undefined) {
            const amount = askRefund(price, `No-show. Keep the full payment (enter 0) or refund up to $${price} as goodwill?`, '0');
            if (amount === null) {
                return;
            }
            refund_amount = amount;
        }

        router.patch(`/admin/bookings/${id}`, { action, refund_amount }, { preserveScroll: true });
    };

    return (
        <StaffLayout title="Bookings">
            <PageHeader
                title="Bookings"
                subtitle="Accept paid requests, reject unpaid ones, and review every session."
                action={
                    <Link
                        href="/admin/bookings/create"
                        className="bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition"
                    >
                        <CalendarPlus className="size-4" /> New booking
                    </Link>
                }
            />

            {/* ===== Awaiting your decision ===== */}
            <div className="mb-10">
                <Section title={`Awaiting payment (${pending.length})`}>
                    {pending.length > 0 ? (
                        <div className="space-y-3">
                            {pending.map((b) => (
                                <div key={b.id} className={`flex flex-wrap items-center gap-4 p-4 ${CARD}`}>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-ashen-800 flex flex-wrap items-center gap-2 font-medium">
                                            <span>
                                                {b.client} <span className="text-ashen-400 font-normal">with</span> {b.practitioner}
                                            </span>
                                            {b.type === 'emergency' && <TypeBadge type={b.type} />}
                                        </p>
                                        <p className="text-ashen-500 text-sm">
                                            {b.service} · {b.scheduled_label} · {money(b.price)}
                                            {b.emergency_category ? ` · ${b.emergency_category}` : ''}
                                        </p>
                                    </div>
                                    <BookingInfoButton booking={b} />
                                    <button
                                        type="button"
                                        onClick={() => act(b.id, 'paid')}
                                        className="bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition"
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
                                <div key={b.id} className={`p-4 ${CARD}`}>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-ashen-800 font-medium">
                                                {b.client} <span className="text-ashen-400 font-normal">with</span> {b.practitioner}
                                            </p>
                                            <p className="text-ashen-500 text-sm">
                                                {b.service} · {b.scheduled_label} · {money(b.price)}
                                            </p>
                                        </div>
                                        <MeetingLinkEditor bookingId={b.id} meetingLink={b.meeting_link} />
                                    </div>
                                    <div className="border-ashen-100 mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                                        <BookingInfoButton booking={b} />
                                        <Link
                                            href={`/admin/bookings/${b.id}/reschedule`}
                                            className="border-ashen-300 text-ashen-700 hover:bg-ashen-50 mr-auto inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                                        >
                                            <CalendarClock className="size-3.5" /> Reschedule
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => act(b.id, 'completed')}
                                            className="border-ashen-300 text-ashen-700 hover:bg-ashen-50 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                                        >
                                            <CheckCheck className="size-3.5" /> Mark completed
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => act(b.id, 'no_show', b.price)}
                                            className="border-ashen-300 text-ashen-600 hover:bg-ashen-100 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                                        >
                                            <UserX className="size-3.5" /> No-show
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => act(b.id, 'cancelled', b.price)}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            <RotateCcw className="size-3.5" /> Cancel & refund
                                        </button>
                                    </div>
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
                    head={['When', 'Client', 'Practitioner', 'Service', 'Type', 'Price', 'Status', 'Payment', '']}
                    empty={bookings.length === 0 ? 'No bookings yet.' : undefined}
                >
                    {bookings.map((b) => (
                        <tr key={b.id}>
                            <Td className="whitespace-nowrap">{b.scheduled_label}</Td>
                            <Td className="font-medium">{b.client}</Td>
                            <Td className="text-ashen-500">{b.practitioner}</Td>
                            <Td className="text-ashen-500">{b.service}</Td>
                            <Td>
                                <TypeBadge type={b.type} />
                            </Td>
                            <Td>{money(b.price)}</Td>
                            <Td>
                                <Badge>{b.status}</Badge>
                            </Td>
                            <Td>
                                <Badge>{b.payment_status}</Badge>
                            </Td>
                            <Td>
                                <BookingInfoButton booking={b} />
                            </Td>
                        </tr>
                    ))}
                </Table>
            </Section>
        </StaffLayout>
    );
}
