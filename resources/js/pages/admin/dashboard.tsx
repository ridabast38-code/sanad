import { CARD, money, PageHeader, Section, StatCard, Table, Td } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { Link } from '@inertiajs/react';
import { CalendarRange, Coins, PiggyBank, TrendingUp, UserCog, Users, Wallet } from 'lucide-react';

interface Recent {
    id: number;
    date: string | null;
    client: string;
    practitioner: string;
    amount: number;
    platform_fee: number;
}

interface Props {
    stats: {
        clients: number;
        practitioners: number;
        pending_approvals: number;
        bookings: number;
        gross: number;
        platform_profit: number;
        payouts: number;
        profit_month: number;
    };
    recent: Recent[];
}

export default function AdminDashboard({ stats, recent }: Props) {
    return (
        <StaffLayout title="Overview">
            <PageHeader title="Platform overview" subtitle="Everything across Sanad — people, sessions, and money." />

            {/* money */}
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Gross billed" value={money(stats.gross)} icon={Coins} />
                <StatCard label="Platform profit (20%)" value={money(stats.platform_profit)} icon={PiggyBank} />
                <StatCard label="Profit this month" value={money(stats.profit_month)} icon={TrendingUp} emphasis />
                <StatCard label="Practitioner payouts" value={money(stats.payouts)} icon={Wallet} />
            </div>

            {/* people */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Clients" value={stats.clients} icon={Users} />
                <StatCard label="Practitioners" value={stats.practitioners} icon={UserCog} />
                <StatCard label="Bookings" value={stats.bookings} icon={CalendarRange} />
                <Link href="/admin/practitioners" className={`block p-5 transition hover:-translate-y-0.5 ${CARD}`}>
                    <p className="text-ashen-400 text-[11px] font-semibold tracking-[0.16em] uppercase">Pending approvals</p>
                    <p
                        className={`font-display mt-3 text-2xl tracking-tight md:text-3xl ${stats.pending_approvals > 0 ? 'text-ashen-700' : 'text-ashen-800'}`}
                    >
                        {stats.pending_approvals}
                    </p>
                    <p className="text-ashen-700 mt-1 text-xs font-medium">Review →</p>
                </Link>
            </div>

            <Section
                title="Recent transactions"
                action={
                    <Link href="/admin/transactions" className="text-ashen-700 hover:text-ashen-900 text-sm font-medium">
                        Full ledger
                    </Link>
                }
            >
                <Table
                    head={['Date', 'Client', 'Practitioner', 'Amount', 'Platform cut']}
                    empty={recent.length === 0 ? 'No transactions yet.' : undefined}
                >
                    {recent.map((t) => (
                        <tr key={t.id}>
                            <Td className="whitespace-nowrap">{t.date}</Td>
                            <Td className="font-medium">{t.client}</Td>
                            <Td className="text-ashen-500">{t.practitioner}</Td>
                            <Td>{money(t.amount)}</Td>
                            <Td className="text-ashen-700 font-semibold">{money(t.platform_fee)}</Td>
                        </tr>
                    ))}
                </Table>
            </Section>
        </StaffLayout>
    );
}
