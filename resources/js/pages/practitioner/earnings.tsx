import { DateFilter } from '@/components/staff/date-filter';
import { Badge, money, PageHeader, Section, StatCard, Table, Td, TypeBadge } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { Coins, HandCoins, Wallet } from 'lucide-react';

interface Tx {
    id: number;
    date: string | null;
    client: string;
    service: string;
    type: string;
    amount: number;
    platform_fee: number;
    payout: number;
    status: string;
    payout_status: string;
}

interface Props {
    totals: { gross: number; platform_fee: number; payout: number; paid_out: number; awaiting_payout: number; count: number };
    monthly: { month: string; payout: number; count: number }[];
    transactions: Tx[];
    filters: { from: string | null; to: string | null };
}

export default function PractitionerEarnings({ totals, monthly, transactions, filters }: Props) {
    return (
        <StaffLayout title="Earnings">
            <PageHeader title="Earnings" subtitle="Every paid session, your 80% share, and what's been paid out to you." />

            <DateFilter path="/practitioner/earnings" filters={filters} />

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total earned (80%)" value={money(totals.payout)} icon={Wallet} />
                <StatCard label="Paid out to you" value={money(totals.paid_out)} icon={Coins} accent="ashen" />
                <StatCard label="Awaiting payout" value={money(totals.awaiting_payout)} icon={HandCoins} accent="sand" />
            </div>

            {monthly.length > 0 && (
                <div className="mb-8">
                    <Section title="By month">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            {monthly.map((m) => (
                                <div key={m.month} className="border-sage-100 rounded-2xl border bg-white p-4">
                                    <p className="text-ashen-400 text-xs">{m.month}</p>
                                    <p className="font-display text-ashen-800 mt-1 text-xl">{money(m.payout)}</p>
                                    <p className="text-ashen-400 text-xs">
                                        {m.count} session{m.count === 1 ? '' : 's'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            )}

            <Section title={`Transactions (${totals.count})`}>
                <Table
                    head={['Date', 'Client', 'Service', 'Type', 'Billed', 'Fee', 'Your payout', 'Payout status']}
                    empty={transactions.length === 0 ? 'No transactions yet.' : undefined}
                >
                    {transactions.map((t) => (
                        <tr key={t.id}>
                            <Td className="whitespace-nowrap">{t.date}</Td>
                            <Td className="font-medium">{t.client}</Td>
                            <Td className="text-ashen-500">{t.service}</Td>
                            <Td>
                                <TypeBadge type={t.type} />
                            </Td>
                            <Td>{money(t.amount)}</Td>
                            <Td className="text-ashen-400">−{money(t.platform_fee)}</Td>
                            <Td className="text-sage-700 font-semibold">{money(t.payout)}</Td>
                            <Td>
                                <Badge>{t.payout_status === 'paid' ? 'paid' : 'pending'}</Badge>
                            </Td>
                        </tr>
                    ))}
                </Table>
            </Section>
        </StaffLayout>
    );
}
