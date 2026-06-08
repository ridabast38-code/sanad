import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * A calm, animated date-of-birth calendar in the Sanad palette.
 * Emits the chosen date as a YYYY-MM-DD string; future dates are disabled.
 */
export function BirthCalendar({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
    const today = new Date();
    const selected = value ? new Date(value + 'T00:00:00') : null;
    const [view, setView] = useState<Date>(() => selected ?? new Date(today.getFullYear() - 20, today.getMonth(), 1));
    const [dir, setDir] = useState(0);

    const year = view.getFullYear();
    const month = view.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const shift = (months: number, dirSign: number) => {
        setDir(dirSign);
        setView(new Date(year, month + months, 1));
    };

    const isFuture = (day: number) => new Date(year, month, day) > today;
    const isSelected = (day: number) => !!selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
    const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    const navBtn = 'rounded-full p-1.5 text-stone-500 transition hover:bg-sage-100 hover:text-sage-700 disabled:opacity-40';

    return (
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white/90 p-5 shadow-[0_18px_50px_-30px_rgba(79,111,82,0.5)]">
            {/* glowing sides */}
            <div aria-hidden className="pointer-events-none absolute -left-12 top-1/3 h-40 w-40 rounded-full bg-sage-300/40 blur-3xl animate-breathe" />
            <div aria-hidden className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl animate-breathe [animation-delay:-3s]" />

            <div className="relative z-10">
                {/* header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-1">
                        <button type="button" disabled={disabled} onClick={() => shift(-12, -1)} className={navBtn} aria-label="Previous year">
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button type="button" disabled={disabled} onClick={() => shift(-1, -1)} className={navBtn} aria-label="Previous month">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                    <span className="font-display text-base text-stone-800">
                        {monthNames[month]} {year}
                    </span>
                    <div className="flex gap-1">
                        <button type="button" disabled={disabled} onClick={() => shift(1, 1)} className={navBtn} aria-label="Next month">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button type="button" disabled={disabled} onClick={() => shift(12, 1)} className={navBtn} aria-label="Next year">
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* weekday labels */}
                <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wide text-stone-400">
                    {weekdays.map((w) => (
                        <span key={w} className="py-1">
                            {w}
                        </span>
                    ))}
                </div>

                {/* days — slide/fade when the month changes */}
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={`${year}-${month}`}
                        initial={{ opacity: 0, x: dir * 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: dir * -24 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="grid grid-cols-7 gap-1"
                    >
                        {cells.map((day, idx) =>
                            day === null ? (
                                <span key={`b${idx}`} />
                            ) : (
                                <motion.button
                                    key={day}
                                    type="button"
                                    disabled={disabled || isFuture(day)}
                                    onClick={() => onChange(toISO(new Date(year, month, day)))}
                                    whileTap={{ scale: 0.9 }}
                                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent ${
                                        isSelected(day)
                                            ? 'bg-sage-700 text-white shadow-[0_6px_16px_-6px_rgba(79,111,82,0.9)]'
                                            : isToday(day)
                                              ? 'text-stone-700 ring-1 ring-sage-400 hover:bg-sage-100'
                                              : 'text-stone-700 hover:bg-sage-100'
                                    }`}
                                >
                                    {day}
                                </motion.button>
                            ),
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* selected summary */}
                <p className="mt-4 text-center text-xs text-stone-500">
                    {selected ? selected.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Choose your date of birth'}
                </p>
            </div>
        </div>
    );
}
