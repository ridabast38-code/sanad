import { DateFilter } from '@/components/staff/date-filter';
import { Badge, money, PageHeader, Section, StatCard, Table, Td, TypeBadge } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { router } from '@inertiajs/react';
import { Coins, HandCoins, PiggyBank, RotateCcw, Wallet } from 'lucide-react';

interface Tx {
    id: number;
    date: string | null;
    client: string;
    practitioner: string;
    type: string;
    amount: number;
    refunded: number;
    platform_fee: number;
    payout: number;
    status: string;
    payout_status: string;
}

interface Props {
    totals: { gross: number; refunded: number; platform_profit: number; payouts: number; pending_payout: number; count: number };
    transactions: Tx[];
    filters: { from: string | null; to: string | null };
}

export default function AdminTransactions({ totals, transactions, filters }: Props) {
    const setPayout = (id: number, payout_status: 'paid' | 'pending') =>
        router.patch(`/admin/transactions/${id}/payout`, { payout_status }, { preserveScroll: true });

    return (
        <StaffLayout title="Transactions">
            <PageHeader title="Accounting" subtitle="The full ledger — every payment, the 80 / 20 split, and what you still owe specialists." />

            <DateFilter path="/admin/transactions" filters={filters} />

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Platform profit (20%)" value={money(totals.platform_profit)} icon={PiggyBank} />
                <StatCard label="Net kept (after refunds)" value={money(totals.gross)} icon={Coins} accent="ashen" />
                <StatCard label="Paid to specialists" value={money(totals.payouts)} icon={Wallet} accent="ashen" />
                {totals.refunded > 0 ? (
                    <StatCard label="Refunded to clients" value={money(totals.refunded)} icon={RotateCcw} accent="sand" />
                ) : (
                    <StatCard label="Owed (pending payout)" value={money(totals.pending_payout)} icon={HandCoins} accent="sand" />
                )}
            </div>

            <Section title={`Transactions (${totals.count})`}>
                <Table
                    head={[
                        'Date',
                        'Client',
                        'Practitioner',
                        'Type',
                        'Amount',
                        'Refunded',
                        'Platform cut',
                        'Payout',
                        'Payment',
                        'Payout to specialist',
                    ]}
                    empty={transactions.length === 0 ? 'No transactions yet.' : undefined}
                >
                    {transactions.map((t) => (
                        <tr key={t.id}>
                            <Td className="whitespace-nowrap">{t.date}</Td>
                            <Td className="font-medium">{t.client}</Td>
                            <Td className="text-ashen-500">{t.practitioner}</Td>
                            <Td>
                                <TypeBadge type={t.type} />
                            </Td>
                            <Td>{money(t.amount)}</Td>
                            <Td className="text-ashen-400">{t.refunded > 0 ? money(t.refunded) : '—'}</Td>
                            <Td className="text-sage-700 font-semibold">{money(t.platform_fee)}</Td>
                            <Td className="text-ashen-500">{money(t.payout)}</Td>
                            <Td>
                                <Badge>{t.status}</Badge>
                            </Td>
                            <Td>
                                {t.payout_status === 'paid' ? (
                                    <button
                                        type="button"
                                        onClick={() => setPayout(t.id, 'pending')}
                                        className="text-sage-700 hover:bg-sage-50 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                                        title="Mark as not yet paid out"
                                    >
                                        <Badge>paid</Badge>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setPayout(t.id, 'paid')}
                                        className="border-sage-300 text-sage-700 hover:bg-sage-50 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition"
                                    >
                                        Mark paid out
                                    </button>
                                )}
                            </Td>
                        </tr>
                    ))}
                </Table>
            </Section>
        </StaffLayout>
    );
}
