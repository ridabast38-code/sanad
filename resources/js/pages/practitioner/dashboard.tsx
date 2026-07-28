import { Badge, CARD, money, PageHeader, Section, StatCard } from '@/components/staff/kit';
import { MeetingLinkEditor } from '@/components/staff/meeting-link-editor';
import StaffLayout from '@/layouts/staff-layout';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarClock, CalendarHeart, TrendingUp, Users, Wallet } from 'lucide-react';

interface Upcoming {
    id: number;
    client: string;
    service: string;
    scheduled_label: string;
    status: string;
    meeting_link: string | null;
    payout: number;
}

interface Props {
    stats: { upcoming: number; completed: number; clients: number; earnings_total: number; earnings_month: number };
    upcoming: Upcoming[];
}

export default function PractitionerDashboard({ stats, upcoming }: Props) {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user.name.split(' ')[0];

    return (
        <StaffLayout title="Overview" fitViewport>
            <PageHeader title={`Welcome back, ${firstName}`} subtitle="Your sessions and earnings at a glance." tight />

            <div className="mb-5 grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Upcoming" value={stats.upcoming} icon={CalendarClock} />
                <StatCard label="Completed" value={stats.completed} icon={CalendarHeart} />
                <StatCard label="Clients" value={stats.clients} icon={Users} />
                <StatCard label="This month" value={money(stats.earnings_month)} icon={TrendingUp} emphasis />
            </div>

            <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-3">
                <div className="flex flex-col lg:col-span-2 lg:min-h-0">
                    <Section
                        title="Next sessions"
                        action={
                            <Link href="/practitioner/clients" className="text-ashen-700 hover:text-ashen-900 text-sm font-medium">
                                All clients
                            </Link>
                        }
                        fill
                        scroll
                    >
                        {upcoming.length > 0 ? (
                            <div className="space-y-3">
                                {upcoming.map((s) => (
                                    <div key={s.id} className={`p-4 ${CARD}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-ashen-100 text-ashen-700 flex size-11 shrink-0 items-center justify-center rounded-xl">
                                                <CalendarClock className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-ashen-800 truncate font-medium">{s.client}</p>
                                                <p className="text-ashen-500 truncate text-sm">
                                                    {s.service} · {s.scheduled_label}
                                                </p>
                                            </div>
                                            <Badge>{s.status}</Badge>
                                        </div>
                                        <div className="border-ashen-100 mt-3 flex items-center justify-end border-t pt-3">
                                            <MeetingLinkEditor bookingId={s.id} meetingLink={s.meeting_link} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`p-10 text-center ${CARD}`}>
                                <p className="text-ashen-500 text-sm">No upcoming sessions yet.</p>
                            </div>
                        )}
                    </Section>
                </div>

                <div className="flex flex-col lg:min-h-0">
                    <Section title="Earnings" fill>
                        <div className={`p-6 ${CARD}`}>
                            <div className="bg-ashen-100 text-ashen-700 flex size-11 items-center justify-center rounded-xl">
                                <Wallet className="size-5" />
                            </div>
                            <p className="text-ashen-400 mt-4 text-[11px] font-semibold tracking-[0.16em] uppercase">Total earned</p>
                            <p className="font-display text-ashen-800 mt-1 text-4xl tracking-tight">{money(stats.earnings_total)}</p>
                            <Link
                                href="/practitioner/earnings"
                                className="bg-ashen-700 hover:bg-ashen-800 mt-5 inline-flex w-full items-center justify-center rounded-full py-2.5 text-sm font-semibold text-white transition"
                            >
                                View accounting
                            </Link>
                        </div>
                    </Section>
                </div>
            </div>
        </StaffLayout>
    );
}
