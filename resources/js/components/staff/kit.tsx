import type { ComponentType, ReactNode } from 'react';

/** Format a number as USD, no cents when whole-ish. */
export function money(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export const CARD = 'rounded-2xl border border-sage-100 bg-white shadow-[0_6px_24px_-14px_rgba(26,28,28,0.12)]';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="font-display text-ashen-800 text-3xl tracking-tight md:text-4xl">{title}</h1>
                {subtitle && <p className="text-ashen-500 mt-2">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export function StatCard({
    label,
    value,
    icon: Icon,
    accent = 'sage',
}: {
    label: string;
    value: ReactNode;
    icon?: ComponentType<{ className?: string }>;
    accent?: 'sage' | 'sand' | 'ashen';
}) {
    const tints: Record<string, string> = {
        sage: 'bg-sage-100 text-sage-700',
        sand: 'bg-beige/50 text-ashen-700',
        ashen: 'bg-ashen-100 text-ashen-700',
    };
    return (
        <div className={`p-5 ${CARD}`}>
            <div className="flex items-center justify-between">
                <p className="text-ashen-400 text-[11px] font-semibold tracking-[0.16em] uppercase">{label}</p>
                {Icon && (
                    <span className={`flex size-8 items-center justify-center rounded-full ${tints[accent]}`}>
                        <Icon className="size-4" />
                    </span>
                )}
            </div>
            <p className="font-display text-ashen-800 mt-3 text-2xl tracking-tight md:text-3xl">{value}</p>
        </div>
    );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
    return (
        <section>
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-display text-ashen-800 text-xl tracking-tight">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

/** A clean table inside a card. Pass column headers and pre-rendered rows. */
export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: string }) {
    return (
        <div className={`overflow-hidden ${CARD}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-sage-100 text-ashen-400 border-b text-[11px] font-semibold tracking-[0.14em] uppercase">
                            {head.map((h, i) => (
                                <th key={i} className="px-5 py-3.5 font-semibold">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-sage-100 divide-y">{children}</tbody>
                </table>
            </div>
            {empty && <p className="text-ashen-400 px-5 py-10 text-center text-sm">{empty}</p>}
        </div>
    );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <td className={`text-ashen-700 px-5 py-3.5 ${className}`}>{children}</td>;
}

const STATUS_TINTS: Record<string, string> = {
    confirmed: 'bg-sage-100 text-sage-700',
    completed: 'bg-sage-50 text-sage-600',
    pending: 'bg-beige/50 text-ashen-600',
    approved: 'bg-sage-100 text-sage-700',
    rejected: 'bg-ashen-100 text-ashen-500',
    cancelled: 'bg-ashen-100 text-ashen-500',
    no_show: 'bg-ashen-100 text-ashen-500',
    paid: 'bg-sage-100 text-sage-700',
    unpaid: 'bg-beige/50 text-ashen-600',
    refunded: 'bg-ashen-100 text-ashen-500',
};

export function Badge({ children }: { children: string }) {
    const tint = STATUS_TINTS[children] ?? 'bg-sage-50 text-sage-700';
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tint}`}>{children.replace('_', ' ')}</span>;
}

/**
 * Marks how a session came in — an urgent emergency (amber) or the standard
 * calm booking flow (muted). Lets staff tell the two apart at a glance.
 */
export function TypeBadge({ type }: { type: string }) {
    const emergency = type === 'emergency';
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                emergency ? 'bg-amber-100 text-amber-700' : 'bg-sage-50 text-sage-600'
            }`}
        >
            {emergency ? 'Emergency' : 'Standard'}
        </span>
    );
}
