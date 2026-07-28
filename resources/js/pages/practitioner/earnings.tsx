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
        <StaffLayout title="Earnings" fitViewport>
            <PageHeader title="Earnings" subtitle="Every paid session, your share, and what's been paid out to you." tight />

            <div className="shrink-0">
                <DateFilter path="/practitioner/earnings" filters={filters} />
            </div>

            <div className="mb-5 grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
                {/* No rate in the label: this is a lifetime sum, and sessions sold
                before the rate changed keep the split they were sold under — so
                any single percentage here would be wrong for part of the total. */}
                <StatCard label="Total earned" value={money(totals.payout)} icon={Wallet} />
                <StatCard label="Paid out to you" value={money(totals.paid_out)} icon={Coins} />
                <StatCard label="Awaiting payout" value={money(totals.awaiting_payout)} icon={HandCoins} emphasis />
            </div>

            {monthly.length > 0 && (
                <div className="mb-5 shrink-0">
                    <Section title="By month">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            {monthly.map((m) => (
                                <div key={m.month} className="border-ashen-100 bg-ashen-50/80 rounded-2xl border p-4">
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

            <Section title={`Transactions (${totals.count})`} fill>
                <Table
                    head={['Date', 'Client', 'Service', 'Type', 'Billed', 'Fee', 'Your payout', 'Payout status']}
                    empty={transactions.length === 0 ? 'No transactions yet.' : undefined}
                    fill
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
                            <Td className="text-ashen-700 font-semibold">{money(t.payout)}</Td>
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
