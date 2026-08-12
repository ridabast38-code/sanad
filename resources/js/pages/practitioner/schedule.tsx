import HourPicker, { hourLabel } from '@/components/staff/hour-picker';
import { CARD, PageHeader } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { useForm } from '@inertiajs/react';
import { Check, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

type Slot = {
    day_of_week: number;
    start_time: string;
    [key: string]: number | string;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Opens the day's sheet. It sits in two places per row — see the row comment. */
function AddHoursButton({ day, onOpen, className }: { day: number; onOpen: (day: number) => void; className: string }) {
    return (
        <button
            type="button"
            onClick={() => onOpen(day)}
            aria-label={`Choose times for ${DAYS[day]}`}
            className={`border-ashen-300/60 text-ashen-600 hover:border-ashen-500 hover:text-ashen-900 size-8 shrink-0 items-center justify-center rounded-full border transition ${className}`}
        >
            <Plus className="mx-auto size-4" />
        </button>
    );
}

/** Rows read Monday → Sunday; the stored `day_of_week` numbering is untouched. */
const WEEK = [1, 2, 3, 4, 5, 6, 0];

/**
 * A practitioner's weekly hours.
 *
 * One hour is one bookable session, which is the whole model: there is no
 * start-and-end to fill in, because a range never meant anything here — the
 * booking page only ever offered the time a window began. Saying "5 PM" and
 * meaning one session at 5 PM is what the founder and the software already
 * agreed on; the form was the only thing still asking for more.
 *
 * Seven tall cards of dropdowns became seven rows, and picking hours moved into
 * a sheet over a blurred page (see HourPicker). The whole week now fits a phone
 * screen without scrolling, which is where practitioners actually set this.
 */
export default function PractitionerSchedule({ windows }: { windows: Slot[] }) {
    const { data, setData, put, processing, recentlySuccessful } = useForm<{ windows: Slot[] }>({
        windows: windows.map((w) => ({ day_of_week: w.day_of_week, start_time: w.start_time })),
    });

    const [openDay, setOpenDay] = useState<number | null>(null);

    const hoursFor = (day: number) =>
        data.windows
            .filter((w) => w.day_of_week === day)
            .map((w) => String(w.start_time))
            .sort();

    /** Adding and removing are the same gesture — the chip is either on or off. */
    const toggleHour = (day: number, time: string) => {
        const exists = data.windows.some((w) => w.day_of_week === day && w.start_time === time);

        setData(
            'windows',
            exists
                ? data.windows.filter((w) => !(w.day_of_week === day && w.start_time === time))
                : [...data.windows, { day_of_week: day, start_time: time }],
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/practitioner/schedule', { preserveScroll: true });
    };

    const total = data.windows.length;

    return (
        <StaffLayout title="Schedule" fitViewport>
            <form onSubmit={submit} className="flex flex-1 flex-col lg:min-h-0">
                <PageHeader
                    title="Your hours"
                    subtitle="Pick the hours you're free each week. Each one is a single session a client can book, and it repeats every week — clients are shown the coming seven days."
                    action={
                        <div className="flex items-center gap-3">
                            {recentlySuccessful && (
                                <span className="text-ashen-700 inline-flex items-center gap-1 text-sm font-medium">
                                    <Check className="size-4" /> Saved
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-ashen-700 hover:bg-ashen-800 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                            >
                                Save schedule
                            </button>
                        </div>
                    }
                    tight
                />

                <div className={`scrollbar-hide overflow-hidden lg:min-h-0 lg:flex-1 lg:overflow-y-auto ${CARD}`}>
                    {WEEK.map((day, index) => {
                        const hours = hoursFor(day);

                        return (
                            <motion.div
                                key={day}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                                className="border-ashen-200/50 flex flex-col gap-2 border-b px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-3 sm:px-5"
                            >
                                {/* On a phone the day and its + button take the first line
                                and the times wrap full-width underneath; squeezing all
                                three onto one line left the chips about two words wide. */}
                                <div className="flex items-center justify-between gap-3 sm:w-24 sm:shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setOpenDay(day)}
                                        className="text-ashen-800 hover:text-ashen-950 text-left text-sm font-semibold transition"
                                    >
                                        {DAYS[day]}
                                    </button>
                                    <AddHoursButton day={day} onOpen={setOpenDay} className="sm:hidden" />
                                </div>

                                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                                    {hours.length === 0 ? (
                                        <span className="text-ashen-300 text-sm">Not available</span>
                                    ) : (
                                        hours.map((time) => (
                                            <motion.button
                                                type="button"
                                                key={time}
                                                layout
                                                onClick={() => toggleHour(day, time)}
                                                whileTap={{ scale: 0.94 }}
                                                title="Remove this time"
                                                className="bg-ashen-100 text-ashen-700 hover:bg-ashen-200 hover:text-ashen-900 group inline-flex items-center gap-1 rounded-full py-1 pr-2 pl-2.5 text-xs font-medium transition"
                                            >
                                                {hourLabel(time)}
                                                <X className="size-3 opacity-40 transition group-hover:opacity-100" />
                                            </motion.button>
                                        ))
                                    )}
                                </div>

                                <AddHoursButton day={day} onOpen={setOpenDay} className="hidden sm:flex" />
                            </motion.div>
                        );
                    })}
                </div>

                <p className="text-ashen-400 mt-3 shrink-0 text-xs">
                    {total === 0
                        ? 'No hours yet — clients cannot book you until you add some.'
                        : `${total} bookable hour${total === 1 ? '' : 's'} a week.`}
                </p>
            </form>

            {openDay !== null && (
                <HourPicker
                    dayName={DAYS[openDay]}
                    selected={hoursFor(openDay)}
                    onToggle={(time) => toggleHour(openDay, time)}
                    onClose={() => setOpenDay(null)}
                />
            )}
        </StaffLayout>
    );
}
