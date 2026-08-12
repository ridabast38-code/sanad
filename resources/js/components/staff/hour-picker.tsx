import { OliveHorizon, OliveTree } from '@/components/olive';
import { Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/** Every half hour of the day, as the `HH:MM` the server stores. */
export const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

/** 13:00 → "1 PM", 13:30 → "1:30 PM". The ":00" is noise on a whole hour. */
export function hourLabel(time: string): string {
    const hour = Number(time.slice(0, 2));
    const minutes = time.slice(3);
    const suffix = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return minutes === '00' ? `${hour12} ${suffix}` : `${hour12}:${minutes} ${suffix}`;
}

function pad(hour: number): string {
    return String(hour).padStart(2, '0');
}

/**
 * The day split into readable runs.
 *
 * The hours are listed explicitly rather than filtered out of a 0-23 range,
 * because night wraps midnight: filtering returned it in clock order — 12 AM,
 * 1 AM … 10 PM, 11 PM — which put the small hours before the late evening they
 * follow. Written out, night reads the way it is lived.
 */
const BANDS: { label: string; hours: number[] }[] = [
    { label: 'Morning', hours: [5, 6, 7, 8, 9, 10, 11] },
    { label: 'Afternoon', hours: [12, 13, 14, 15, 16] },
    { label: 'Evening', hours: [17, 18, 19, 20, 21] },
    { label: 'Night', hours: [22, 23, 0, 1, 2, 3, 4] },
];

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
 * It renders through a PORTAL. The sheet lives inside `<main>`, which the staff
 * layout gives its own stacking context — so no z-index on the sheet could ever
 * beat the sticky header, and the nav sat on top of the blur. Mounted on the
 * body it is finally above everything.
 *
 * The panel is the brand's dark half with the olive planted behind it, because
 * this is the one screen a practitioner opens on purpose, and it should feel
 * like being asked rather than like filling in a form.
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

        // The page behind a full-screen sheet must not scroll under a thumb.
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previous;
        };
    }, [onClose]);

    // An hour saved before this screen existed (17:15, say) still belongs to its
    // day — show it as its own chip rather than dropping it silently.
    const offGrid = selected.filter((time) => !TIMES.includes(time));

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="bg-ashen-950/50 fixed inset-0 z-[200] flex items-end justify-center backdrop-blur-md sm:items-center sm:p-4"
            >
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Hours for ${dayName}`}
                    onClick={(event) => event.stopPropagation()}
                    initial={{ y: 24, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    className="sanad-card-dark relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:max-h-[88vh] sm:rounded-3xl"
                >
                    {/* The tree is desktop-only by design — a whole specimen is wider
                    than a phone. The sheet keeps the same planting on a phone with
                    the treeline instead, which is drawn to sit low and be cropped. */}
                    <OliveTree className="-bottom-32" opacity="opacity-[0.13]" />
                    <div aria-hidden className="pointer-events-none absolute inset-0 md:hidden">
                        <OliveHorizon tone="bg-ashen-950" opacity="opacity-[0.22]" />
                    </div>

                    <div className="relative z-[2] flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
                        <div className="min-w-0">
                            <h3 className="font-display text-ashen-100 text-2xl tracking-tight">{dayName}</h3>
                            <p className="text-ashen-300/80 mt-1 text-sm">Tap the times you're free. Each one is a session someone can book.</p>
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

                    <div className="scrollbar-hide relative z-[2] min-h-0 flex-1 overflow-y-auto px-5 pb-2 sm:px-6">
                        {BANDS.map((band) => (
                            <div key={band.label} className="mb-4">
                                <p className="text-ashen-400 mb-2 text-[10px] font-semibold tracking-[0.16em] uppercase">{band.label}</p>
                                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                                    {band.hours.map((hour) => (
                                        <HourCell
                                            key={hour}
                                            hour={hour}
                                            onHour={selected.includes(`${pad(hour)}:00`)}
                                            onHalf={selected.includes(`${pad(hour)}:30`)}
                                            onToggle={onToggle}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {offGrid.length > 0 && (
                            <div className="mb-4">
                                <p className="text-ashen-400 mb-2 text-[10px] font-semibold tracking-[0.16em] uppercase">Already saved</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {offGrid.map((time) => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => onToggle(time)}
                                            className="bg-ashen-100 text-ashen-900 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium"
                                        >
                                            <Check className="size-3" />
                                            {hourLabel(time)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-ashen-200/15 relative z-[2] flex shrink-0 items-center justify-between gap-4 border-t px-5 py-4 sm:px-6">
                        <p className="text-ashen-400 text-xs">
                            {selected.length === 0 ? 'No times yet' : `${selected.length} session${selected.length === 1 ? '' : 's'} on ${dayName}`}
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
        </AnimatePresence>,
        document.body,
    );
}

/**
 * One hour, as two stacked choices: the hour itself and its half past.
 *
 * Half hours had to be bookable without turning 24 chips into 48 — a flat grid
 * of "2 PM, 2:30 PM, 3 PM, 3:30 PM…" is twice as long and reads as one
 * undifferentiated wall. Keeping the hour as the headline and the half as a
 * quieter strip beneath it means the grid stays 24 cells wide, and the eye
 * still scans by hour the way a person thinks about a day.
 */
function HourCell({ hour, onHour, onHalf, onToggle }: { hour: number; onHour: boolean; onHalf: boolean; onToggle: (time: string) => void }) {
    const base = 'w-full transition-colors flex items-center justify-center gap-1';

    return (
        <div className="border-ashen-200/15 overflow-hidden rounded-xl border">
            <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggle(`${pad(hour)}:00`)}
                aria-pressed={onHour}
                aria-label={`${hourLabel(`${pad(hour)}:00`)}`}
                className={`${base} py-1.5 text-xs font-semibold ${
                    onHour ? 'bg-ashen-100 text-ashen-900' : 'bg-ashen-200/10 text-ashen-200 hover:bg-ashen-200/20'
                }`}
            >
                {onHour && <Check className="size-3" />}
                {hourLabel(`${pad(hour)}:00`)}
            </motion.button>
            <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggle(`${pad(hour)}:30`)}
                aria-pressed={onHalf}
                aria-label={`${hourLabel(`${pad(hour)}:30`)}`}
                className={`${base} border-ashen-200/15 border-t py-1 text-[10px] font-medium ${
                    onHalf ? 'bg-ashen-100 text-ashen-900' : 'bg-ashen-200/5 text-ashen-400 hover:bg-ashen-200/15'
                }`}
            >
                {onHalf && <Check className="size-2.5" />}:30
            </motion.button>
        </div>
    );
}

/**
 * The same times as a plain select, for the admin's availability rows.
 *
 * The admin edits a whole practitioner in one long form — name, photo, prices,
 * then the hours — so a sheet that takes over the screen per day would be the
 * wrong shape there. Any time already saved off the half hour stays selectable.
 */
export function HourSelect({ value, onChange, className = '' }: { value: string; onChange: (time: string) => void; className?: string }) {
    const options = TIMES.includes(value) ? TIMES : [value, ...TIMES];

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
