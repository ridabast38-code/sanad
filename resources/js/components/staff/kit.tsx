import type { ComponentType, ReactNode } from 'react';

/** Format a number as USD, no cents when whole-ish. */
export function money(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export const CARD = 'sanad-card rounded-2xl';

export function PageHeader({ title, subtitle, action, tight = false }: { title: string; subtitle?: string; action?: ReactNode; tight?: boolean }) {
    return (
        <div className={`flex flex-wrap items-end justify-between gap-4 ${tight ? 'mb-5 shrink-0' : 'mb-8'}`}>
            <div>
                <h1 className="font-display text-ashen-800 text-3xl tracking-tight md:text-4xl">{title}</h1>
                {subtitle && <p className="text-ashen-500 mt-2">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

/**
 * A single figure. `emphasis` gives it the landing's dark panel instead of the
 * light glass — that alternation is the whole reason the landing doesn't read as
 * a grid of boxes. One per row at most: the dark card's job is to make the light
 * ones around it read as light, which it can't do if they're all dark.
 *
 * It replaced an `accent` prop whose only real use was tinting the money stat,
 * which is exactly the stat that deserves the weight.
 */
export function StatCard({
    label,
    value,
    icon: Icon,
    emphasis = false,
}: {
    label: string;
    value: ReactNode;
    icon?: ComponentType<{ className?: string }>;
    emphasis?: boolean;
}) {
    return (
        <div className={`p-5 ${emphasis ? 'sanad-card-dark rounded-2xl' : CARD}`}>
            <div className="flex items-center justify-between">
                <p className={`text-[11px] font-semibold tracking-[0.16em] uppercase ${emphasis ? 'text-ashen-300' : 'text-ashen-400'}`}>{label}</p>
                {Icon && (
                    <span
                        className={`flex size-8 items-center justify-center rounded-full ${
                            emphasis ? 'bg-ashen-200/15 text-ashen-200' : 'bg-ashen-100 text-ashen-700'
                        }`}
                    >
                        <Icon className="size-4" />
                    </span>
                )}
            </div>
            <p className={`font-display mt-3 text-2xl tracking-tight md:text-3xl ${emphasis ? 'text-ashen-100' : 'text-ashen-800'}`}>{value}</p>
        </div>
    );
}

/**
 * `fill` makes the section take the height left over on a viewport-fitted page,
 * with its heading pinned.
 *
 * It deliberately does NOT scroll: its child owns that (a `fill` Table scrolls its
 * own rows under a sticky header). A scroll here as well would nest one scroller
 * inside another — grabbing the wrong one is exactly what makes a page feel broken.
 * For a child that can't scroll itself, use `scroll`.
 */
export function Section({
    title,
    action,
    children,
    fill = false,
    scroll = false,
}: {
    title: string;
    action?: ReactNode;
    children: ReactNode;
    fill?: boolean;
    scroll?: boolean;
}) {
    return (
        <section className={fill ? 'flex flex-col lg:min-h-0 lg:flex-1' : undefined}>
            <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
                <h2 className="font-display text-ashen-800 text-xl tracking-tight">{title}</h2>
                {action}
            </div>
            {scroll ? <div className="scrollbar-hide lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">{children}</div> : children}
        </section>
    );
}

/**
 * A clean table inside a card. Pass column headers and pre-rendered rows.
 *
 * `fill` is for viewport-fitted pages: the card takes the height that's left and
 * the rows scroll inside it, under a sticky header. A table is the one place an
 * internal scroll is right — you read down a list of rows, and the column names
 * are useless the moment they leave the screen. The header needs its own solid
 * backdrop because the card behind it is translucent glass; without one, the rows
 * would slide visibly underneath the column names.
 */
export function Table({ head, children, empty, fill = false }: { head: ReactNode[]; children: ReactNode; empty?: string; fill?: boolean }) {
    return (
        <div className={`${fill ? 'flex flex-col overflow-hidden lg:min-h-0 lg:flex-1' : 'overflow-hidden'} ${CARD}`}>
            <div className={`overflow-x-auto ${fill ? 'scrollbar-hide lg:min-h-0 lg:flex-1 lg:overflow-y-auto' : ''}`}>
                <table className="w-full text-left text-sm">
                    <thead className={fill ? 'sticky top-0 z-10' : undefined}>
                        <tr className="border-ashen-200/60 text-ashen-400 border-b text-[11px] font-semibold tracking-[0.14em] uppercase">
                            {head.map((h, i) => (
                                <th key={i} className={`px-5 py-3.5 font-semibold ${fill ? 'bg-ashen-100/95 backdrop-blur-sm' : ''}`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-ashen-200/50 divide-y">{children}</tbody>
                </table>
            </div>
            {empty && <p className="text-ashen-400 px-5 py-10 text-center text-sm">{empty}</p>}
        </div>
    );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <td className={`text-ashen-700 px-5 py-3.5 ${className}`}>{children}</td>;
}

/**
 * Status now separates by WEIGHT rather than by hue, because the palette is a
 * single warm gray: a live state is dark on a solid chip, a settled one is mid,
 * and anything void is pale enough to recede. Emergency goes heavier still (see
 * TypeBadge) — the palette has no hue left to signal with, only weight.
 */
const STATUS_TINTS: Record<string, string> = {
    confirmed: 'bg-ashen-800 text-ashen-50',
    approved: 'bg-ashen-800 text-ashen-50',
    paid: 'bg-ashen-800 text-ashen-50',
    completed: 'bg-ashen-200 text-ashen-800',
    pending: 'bg-ashen-100 text-ashen-600',
    unpaid: 'bg-ashen-100 text-ashen-600',
    rejected: 'bg-ashen-100 text-ashen-500',
    cancelled: 'bg-ashen-100 text-ashen-500',
    no_show: 'bg-ashen-100 text-ashen-500',
    refunded: 'bg-ashen-100 text-ashen-500',
};

export function Badge({ children }: { children: string }) {
    const tint = STATUS_TINTS[children] ?? 'bg-ashen-100 text-ashen-700';
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tint}`}>{children.replace('_', ' ')}</span>;
}

/**
 * Marks how a session came in — an emergency or the standard calm booking flow.
 * Staff have to tell these apart instantly, and the brand is a single warm gray
 * with no accent hue, so the emergency carries the heaviest weight in the palette
 * (near-black) rather than a colour. Do not soften it to match the other badges.
 */
export function TypeBadge({ type }: { type: string }) {
    const emergency = type === 'emergency';
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                emergency ? 'bg-ashen-950 text-ashen-50' : 'bg-ashen-100 text-ashen-600'
            }`}
        >
            {emergency ? 'Emergency' : 'Standard'}
        </span>
    );
}
