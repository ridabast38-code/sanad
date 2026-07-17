import { CARD, PageHeader } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { useForm } from '@inertiajs/react';
import { Check, Plus, X } from 'lucide-react';

type Slot = {
    day_of_week: number;
    start_time: string;
    end_time: string;
    [key: string]: number | string;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PractitionerSchedule({ windows }: { windows: Slot[] }) {
    const { data, setData, put, processing, recentlySuccessful } = useForm<{ windows: Slot[] }>({
        windows: windows.map((w) => ({ day_of_week: w.day_of_week, start_time: w.start_time, end_time: w.end_time })),
    });

    const addWindow = (day: number) => setData('windows', [...data.windows, { day_of_week: day, start_time: '17:00', end_time: '20:00' }]);

    const removeWindow = (index: number) =>
        setData(
            'windows',
            data.windows.filter((_, i) => i !== index),
        );

    const updateWindow = (index: number, field: 'start_time' | 'end_time', value: string) =>
        setData(
            'windows',
            data.windows.map((w, i) => (i === index ? { ...w, [field]: value } : w)),
        );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/practitioner/schedule', { preserveScroll: true });
    };

    return (
        <StaffLayout title="Schedule" fitViewport>
            <form onSubmit={submit} className="flex flex-1 flex-col lg:min-h-0">
                <PageHeader
                    title="Your schedule"
                    subtitle="Set the weekly windows when clients can book you. They repeat every week."
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

                <div className="scrollbar-hide grid gap-4 md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:content-start lg:overflow-y-auto lg:pr-1">
                    {DAYS.map((dayName, day) => {
                        const dayWindows = data.windows.map((w, i) => ({ ...w, index: i })).filter((w) => w.day_of_week === day);

                        return (
                            <div key={day} className={`p-5 ${CARD}`}>
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="font-display text-ashen-800 text-lg">{dayName}</h2>
                                    <button
                                        type="button"
                                        onClick={() => addWindow(day)}
                                        className="text-ashen-700 hover:bg-ashen-50 flex size-7 items-center justify-center rounded-full transition"
                                        aria-label={`Add window to ${dayName}`}
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>

                                {dayWindows.length === 0 ? (
                                    <p className="text-ashen-400 text-sm">Unavailable</p>
                                ) : (
                                    <div className="space-y-2">
                                        {dayWindows.map((w) => (
                                            <div key={w.index} className="bg-ashen-50 flex items-center gap-2 rounded-xl px-3 py-2">
                                                <input
                                                    type="time"
                                                    value={w.start_time}
                                                    onChange={(e) => updateWindow(w.index, 'start_time', e.target.value)}
                                                    className="border-ashen-200 text-ashen-800 bg-ashen-50/80 rounded-lg border px-2 py-1 text-sm"
                                                />
                                                <span className="text-ashen-400 text-sm">–</span>
                                                <input
                                                    type="time"
                                                    value={w.end_time}
                                                    onChange={(e) => updateWindow(w.index, 'end_time', e.target.value)}
                                                    className="border-ashen-200 text-ashen-800 bg-ashen-50/80 rounded-lg border px-2 py-1 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeWindow(w.index)}
                                                    className="text-ashen-400 hover:text-ashen-700 ml-auto flex size-6 items-center justify-center rounded-full transition"
                                                    aria-label="Remove window"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </form>
        </StaffLayout>
    );
}
