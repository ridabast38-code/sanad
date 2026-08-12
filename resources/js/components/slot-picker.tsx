import { Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export interface Slot {
    iso: string;
    label: string;
    day: string;
    day_label: string;
    date_label: string;
    time_label: string;
}

/**
 * The client's "pick a time" control.
 *
 * It replaced a single flat wrap of pills, every one of them reading
 * "Thu, Aug 14 · 5:00 PM" — the same date repeated on every chip, which is what
 * made the founder call it a spreadsheet. Times only mean something under a day,
 * so the day is said once, as a heading, and the times sit under it as the only
 * thing left to choose.
 *
 * The palette has no accent hue to lean on (see the ashen scale), so the
 * selected time separates by WEIGHT instead: solid dark chip, cream text. The
 * highlight behind it is one shared `layoutId`, so choosing a different time
 * slides the selection there rather than blinking it on and off — the one bit
 * of motion that carries meaning, not decoration.
 *
 * It owns its own scroller so it can own the "there is more below" hint too.
 */
export default function SlotPicker({ slots, value, onSelect }: { slots: Slot[]; value: string; onSelect: (iso: string) => void }) {
    const end = useRef<HTMLDivElement>(null);
    const [atEnd, setAtEnd] = useState(true);

    // A sentinel against the VIEWPORT, not against a named scroll root: the list
    // scrolls inside its own column on a desktop and with the whole page on a
    // phone, and an observer with a null root reports both, because being
    // clipped by a scrolling ancestor counts as not intersecting.
    useEffect(() => {
        const sentinel = end.current;

        if (!sentinel) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => setAtEnd(entry.isIntersecting), { threshold: 1 });
        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [slots.length]);

    if (slots.length === 0) {
        return (
            <div className="border-ashen-300/50 bg-ashen-50/40 rounded-2xl border border-dashed px-4 py-6 text-center">
                <p className="text-ashen-600 text-sm font-medium">No open times this week</p>
                <p className="text-ashen-400 mt-1 text-xs">Your specialist adds their hours weekly — please check back soon.</p>
            </div>
        );
    }

    const days = Array.from(new Set(slots.map((slot) => slot.day)));

    return (
        <div className="scrollbar-hide relative flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
            {days.map((day, index) => {
                const daySlots = slots.filter((slot) => slot.day === day);
                const { day_label, date_label } = daySlots[0];

                return (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col gap-2"
                    >
                        <div className="flex items-baseline gap-2">
                            <span className="text-ashen-700 text-sm font-semibold">{day_label}</span>
                            <span className="bg-ashen-300/50 h-px flex-1" />
                            <span className="text-ashen-400 text-[11px] font-medium tracking-[0.12em] uppercase">{date_label}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {daySlots.map((slot) => {
                                const selected = value === slot.iso;

                                return (
                                    <motion.button
                                        type="button"
                                        key={slot.iso}
                                        onClick={() => onSelect(slot.iso)}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.96 }}
                                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                                        aria-pressed={selected}
                                        className={`relative isolate h-fit rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                            selected
                                                ? 'border-ashen-800 text-ashen-50'
                                                : 'border-ashen-300/60 bg-ashen-50/60 text-ashen-700 hover:border-ashen-400 hover:bg-ashen-50'
                                        }`}
                                    >
                                        {selected && (
                                            <motion.span
                                                layoutId="slot-selection"
                                                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                                className="from-ashen-700 to-ashen-900 absolute inset-0 -z-10 rounded-full bg-gradient-to-br shadow-sm"
                                            />
                                        )}
                                        <span className="flex items-center gap-1.5">
                                            {selected && <Check className="size-3.5" />}
                                            {slot.time_label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            })}

            <div ref={end} aria-hidden className="h-px shrink-0" />

            {/* Sticky, not absolute: it rides the bottom of whichever thing is
                doing the scrolling. Nothing else tells a client that a week they
                cannot see is sitting under the fold. */}
            <AnimatePresence>
                {!atEnd && (
                    <motion.div
                        key="more"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        aria-hidden
                        className="pointer-events-none sticky bottom-0 -mt-8 flex justify-center pb-1"
                    >
                        <motion.span
                            animate={{ y: [0, 3, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                            className="bg-ashen-800/90 text-ashen-50 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium shadow-lg backdrop-blur-sm"
                        >
                            More times below <ChevronDown className="size-3.5" />
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
