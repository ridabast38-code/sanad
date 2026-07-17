import { APPROACH_LABELS, type Specialist } from '@/components/specialist-card';
import { SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';

/**
 * The directory's filters: kind of therapy, time of day, and price.
 *
 * Everything is client-side on purpose. The whole directory already ships with
 * the page — a round trip per checkbox would be slower and would lose the
 * animation between states for nothing.
 */
export interface SpecialistFilters {
    approaches: string[];
    periods: string[];
    maxPrice: number | null;
}

export const EMPTY_FILTERS: SpecialistFilters = { approaches: [], periods: [], maxPrice: null };

export const PERIOD_LABELS: Record<string, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
};

/** Cheapest and dearest in the directory — the bounds the price slider works between. */
export function priceBounds(specialists: Specialist[]): { min: number; max: number } | null {
    const prices = specialists.map((s) => s.from_price).filter((p): p is number => p != null);

    if (prices.length === 0) {
        return null;
    }

    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));

    // A single price (or several identical ones) gives the slider no range to
    // travel, so there is nothing to filter and the control would be a dead stick.
    return min === max ? null : { min, max };
}

/**
 * An OR within each filter, an AND between them — pick "CBT" and "Evening" and you
 * mean someone who does CBT *and* has evening slots, which is what people expect.
 * A specialist with no listed price is never hidden by the price filter: that's
 * missing data, not an expensive session.
 */
export function applyFilters(specialists: Specialist[], filters: SpecialistFilters): Specialist[] {
    return specialists.filter((s) => {
        if (filters.approaches.length > 0 && !filters.approaches.some((a) => s.approaches.includes(a))) {
            return false;
        }
        if (filters.periods.length > 0 && !filters.periods.some((p) => (s.slot_periods ?? []).includes(p))) {
            return false;
        }
        if (filters.maxPrice != null && s.from_price != null && s.from_price > filters.maxPrice) {
            return false;
        }
        return true;
    });
}

export function activeFilterCount(filters: SpecialistFilters): number {
    return filters.approaches.length + filters.periods.length + (filters.maxPrice != null ? 1 : 0);
}

const SPRING = { type: 'spring', stiffness: 380, damping: 32 } as const;

/** A pill that fills in when chosen — the selected state slides between siblings. */
function FilterChip({ label, active, onClick, layoutId }: { label: string; active: boolean; onClick: () => void; layoutId: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                active ? 'text-ashen-50' : 'text-ashen-600 hover:text-ashen-900'
            }`}
        >
            {/* the filled pill is a shared layout element, so switching options slides
            the fill across instead of blinking it out and back in */}
            {active && <motion.span layoutId={layoutId} transition={SPRING} className="bg-ashen-800 absolute inset-0 -z-10 rounded-full" />}
            {!active && <span className="border-ashen-400/40 absolute inset-0 -z-10 rounded-full border" />}
            {label}
        </button>
    );
}

export function SpecialistFilterBar({
    specialists,
    filters,
    onChange,
}: {
    specialists: Specialist[];
    filters: SpecialistFilters;
    onChange: (next: SpecialistFilters) => void;
}) {
    const [open, setOpen] = useState(false);
    const bounds = useMemo(() => priceBounds(specialists), [specialists]);
    const count = activeFilterCount(filters);

    // Only offer what the directory actually contains — a filter that can only ever
    // return nothing is worse than no filter at all.
    const approaches = useMemo(() => [...new Set(specialists.flatMap((s) => s.approaches))], [specialists]);
    const periods = useMemo(
        () => ['morning', 'afternoon', 'evening'].filter((p) => specialists.some((s) => (s.slot_periods ?? []).includes(p))),
        [specialists],
    );

    const toggle = (key: 'approaches' | 'periods', value: string) =>
        onChange({
            ...filters,
            [key]: filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value],
        });

    if (approaches.length === 0 && periods.length === 0 && !bounds) {
        return null;
    }

    return (
        <div className="shrink-0">
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    className="border-ashen-400/40 text-ashen-700 hover:border-ashen-500 hover:text-ashen-900 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                >
                    <SlidersHorizontal className="size-3.5" />
                    Filter
                    <AnimatePresence>
                        {count > 0 && (
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={SPRING}
                                className="bg-ashen-800 text-ashen-50 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold"
                            >
                                {count}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                <AnimatePresence>
                    {count > 0 && (
                        <motion.button
                            type="button"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            onClick={() => onChange(EMPTY_FILTERS)}
                            className="text-ashen-500 hover:text-ashen-800 inline-flex items-center gap-1 text-xs font-medium transition"
                        >
                            <X className="size-3" /> Clear
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* height:auto animates cleanly here because the panel's content is a fixed
            set of rows — nothing inside it can reflow mid-animation */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="sanad-card mt-3 flex flex-col gap-3 rounded-2xl p-4">
                            {approaches.length > 0 && (
                                <FilterRow label="Kind of therapy">
                                    {approaches.map((a) => (
                                        <FilterChip
                                            key={a}
                                            label={APPROACH_LABELS[a] ?? a}
                                            active={filters.approaches.includes(a)}
                                            onClick={() => toggle('approaches', a)}
                                            layoutId={`fill-approach-${a}`}
                                        />
                                    ))}
                                </FilterRow>
                            )}

                            {periods.length > 0 && (
                                <FilterRow label="Time of day">
                                    {periods.map((p) => (
                                        <FilterChip
                                            key={p}
                                            label={PERIOD_LABELS[p]}
                                            active={filters.periods.includes(p)}
                                            onClick={() => toggle('periods', p)}
                                            layoutId={`fill-period-${p}`}
                                        />
                                    ))}
                                </FilterRow>
                            )}

                            {bounds && (
                                <FilterRow label={`Up to $${filters.maxPrice ?? bounds.max}`}>
                                    <input
                                        type="range"
                                        min={bounds.min}
                                        max={bounds.max}
                                        step={5}
                                        value={filters.maxPrice ?? bounds.max}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            // at the top of the range the filter is off, not "≤ max"
                                            onChange({ ...filters, maxPrice: value >= bounds.max ? null : value });
                                        }}
                                        aria-label="Maximum price"
                                        className="accent-ashen-800 h-1 w-full max-w-xs cursor-pointer"
                                    />
                                </FilterRow>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-ashen-500 w-32 shrink-0 text-[11px] font-semibold tracking-[0.14em] uppercase">{label}</span>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
    );
}
