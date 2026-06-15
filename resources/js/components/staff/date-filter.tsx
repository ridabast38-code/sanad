import { router } from '@inertiajs/react';

interface Filters {
    from: string | null;
    to: string | null;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Date-range filter that drives a list via ?from=&to= query params. */
export function DateFilter({ path, filters }: { path: string; filters: Filters }) {
    const go = (from: string | null, to: string | null) => {
        const params: Record<string, string> = {};
        if (from) params.from = from;
        if (to) params.to = to;
        router.get(path, params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const today = new Date();
    const presets: { label: string; from: string | null; to: string | null }[] = [
        { label: 'Today', from: iso(today), to: iso(today) },
        { label: 'Last 7 days', from: iso(new Date(today.getTime() - 6 * 86_400_000)), to: iso(today) },
        { label: 'This month', from: iso(new Date(today.getFullYear(), today.getMonth(), 1)), to: iso(today) },
        { label: 'This year', from: iso(new Date(today.getFullYear(), 0, 1)), to: iso(today) },
    ];

    const active = !!(filters.from || filters.to);

    return (
        <div className="border-sage-100 mb-6 flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-3 shadow-[0_6px_24px_-14px_rgba(26,28,28,0.1)]">
            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={filters.from ?? ''}
                    max={filters.to ?? undefined}
                    onChange={(e) => go(e.target.value || null, filters.to)}
                    className="border-sage-200 text-ashen-800 rounded-lg border bg-white px-3 py-1.5 text-sm"
                    aria-label="From date"
                />
                <span className="text-ashen-400 text-sm">→</span>
                <input
                    type="date"
                    value={filters.to ?? ''}
                    min={filters.from ?? undefined}
                    onChange={(e) => go(filters.from, e.target.value || null)}
                    className="border-sage-200 text-ashen-800 rounded-lg border bg-white px-3 py-1.5 text-sm"
                    aria-label="To date"
                />
            </div>

            <div className="ml-1 flex flex-wrap items-center gap-1.5">
                {presets.map((p) => (
                    <button
                        key={p.label}
                        type="button"
                        onClick={() => go(p.from, p.to)}
                        className="text-ashen-500 hover:bg-sage-50 hover:text-sage-700 rounded-full px-3 py-1.5 text-xs font-medium transition"
                    >
                        {p.label}
                    </button>
                ))}
                {active && (
                    <button
                        type="button"
                        onClick={() => go(null, null)}
                        className="text-ashen-400 hover:text-ashen-700 rounded-full px-3 py-1.5 text-xs font-medium transition"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
