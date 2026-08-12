import { OliveHorizon, OliveTree } from '@/components/olive';
import { Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';

/** Every whole hour of the day, as the `HH:MM` the server stores. */
const HOURS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`);

/** 13:00 → "1 PM". No ":00" — every choice here is on the hour. */
export function hourLabel(time: string): string {
    const hour = Number(time.slice(0, 2));
    const minutes = time.slice(3);
    const suffix = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return minutes === '00' ? `${hour12} ${suffix}` : `${hour12}:${minutes} ${suffix}`;
}

/** Which third of the day an hour belongs to, so 24 chips arrive in readable groups. */
const BANDS: { label: string; from: number; to: number }[] = [
    { label: 'Morning', from: 5, to: 11 },
    { label: 'Afternoon', from: 12, to: 16 },
    { label: 'Evening', from: 17, to: 21 },
    { label: 'Night', from: 22, to: 4 },
];

function inBand(time: string, band: { from: number; to: number }): boolean {
    const hour = Number(time.slice(0, 2));

    return band.from <= band.to ? hour >= band.from && hour <= band.to : hour >= band.from || hour <= band.to;
}

/**
 * "Which hours are you free on Monday?" — asked one day at a time, in a sheet
 * over a blurred page.
 *
 * The schedule used to be seven tall cards of paired dropdowns, all open at
 * once. On a phone that is a column you scroll for a while and never see whole,
 * and the founder was right that it looked like a spreadsheet. Choosing hours is
 * a moment, not a page: the day is the question, the hours are the answer, and
 * everything else gets out of the way until it's done.
 *
 * The panel is the brand's dark half with the olive tree behind it — the same
 * pairing the landing closes on — because this is the one screen a practitioner
 * comes to on purpose, and it should feel like being asked rather than like
 * filling in a form.
 */
export default function HourPicker({
    dayName,
    selected,
    onToggle,
    onClose,
}: {
    dayName: string;
    /** the `HH:MM` values already chosen for this day */
    selected: string[];
    onToggle: (time: string) => void;
    onClose: () => void;
}) {
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);

        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    // An hour saved before this screen existed (17:30, say) still belongs to its
    // day — show it as its own chip rather than dropping it silently.
    const offGrid = selected.filter((time) => !HOURS.includes(time));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="bg-ashen-950/50 fixed inset-0 z-[80] flex items-end justify-center backdrop-blur-md sm:items-center sm:p-4"
            >
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Hours for ${dayName}`}
                    onClick={(event) => event.stopPropagation()}
                    initial={{ y: 24, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    className="sanad-card-dark relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl"
                >
                    {/* The tree is desktop-only by design — a whole specimen is wider
                    than a phone. The sheet keeps the same planting on a phone with
                    the treeline instead, which is drawn to sit low and be cropped. */}
                    <OliveTree className="-bottom-32" opacity="opacity-[0.13]" />
                    <div aria-hidden className="pointer-events-none absolute inset-0 md:hidden">
                        <OliveHorizon tone="bg-ashen-950" opacity="opacity-[0.22]" />
                    </div>

                    <div className="relative z-[2] flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                        <div className="min-w-0">
                            <h3 className="font-display text-ashen-100 text-2xl tracking-tight">{dayName}</h3>
                            <p className="text-ashen-300/80 mt-1 text-sm">Tap the hours you're free. Each one is a session someone can book.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="text-ashen-300 hover:bg-ashen-200/15 hover:text-ashen-100 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-full transition"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="scrollbar-hide relative z-[2] min-h-0 flex-1 overflow-y-auto px-6 pb-2">
                        {BANDS.map((band) => {
                            const hours = HOURS.filter((time) => inBand(time, band));

                            return (
                                <div key={band.label} className="mb-4">
                                    <p className="text-ashen-400 mb-2 text-[10px] font-semibold tracking-[0.16em] uppercase">{band.label}</p>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {hours.map((time) => (
                                            <HourChip key={time} time={time} active={selected.includes(time)} onClick={() => onToggle(time)} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {offGrid.length > 0 && (
                            <div className="mb-4">
                                <p className="text-ashen-400 mb-2 text-[10px] font-semibold tracking-[0.16em] uppercase">Already saved</p>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {offGrid.map((time) => (
                                        <HourChip key={time} time={time} active onClick={() => onToggle(time)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-ashen-200/15 relative z-[2] flex shrink-0 items-center justify-between gap-4 border-t px-6 py-4">
                        <p className="text-ashen-400 text-xs">
                            {selected.length === 0 ? 'No hours yet' : `${selected.length} hour${selected.length === 1 ? '' : 's'} on ${dayName}`}
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-ashen-100 text-ashen-900 rounded-full px-6 py-2 text-sm font-semibold transition hover:bg-white"
                        >
                            Done
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * The same hours as a plain select, for the admin's availability rows.
 *
 * The admin edits a whole practitioner in one long form — name, photo, prices,
 * then the hours — so a sheet that takes over the screen per day would be the
 * wrong shape there. Any hour already saved off the hour stays selectable.
 */
export function HourSelect({ value, onChange, className = '' }: { value: string; onChange: (time: string) => void; className?: string }) {
    const options = HOURS.includes(value) ? HOURS : [value, ...HOURS];

    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`border-ashen-300/60 text-ashen-800 bg-ashen-50/80 rounded-lg border px-3 py-1.5 text-sm ${className}`}
        >
            {options.map((time) => (
                <option key={time} value={time}>
                    {hourLabel(time)}
                </option>
            ))}
        </select>
    );
}

function HourChip({ time, active, onClick }: { time: string; active: boolean; onClick: () => void }) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            aria-pressed={active}
            className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition-colors ${
                active ? 'bg-ashen-100 text-ashen-900 shadow-sm' : 'bg-ashen-200/10 text-ashen-200 hover:bg-ashen-200/20 border-ashen-200/15 border'
            }`}
        >
            {active && <Check className="size-3" />}
            {hourLabel(time)}
        </motion.button>
    );
}
