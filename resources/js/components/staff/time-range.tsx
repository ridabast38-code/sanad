import { ChevronDown } from 'lucide-react';

/**
 * A start/end time picker for availability windows.
 *
 * Native `<input type="time">` was doing this job and doing it badly: every browser
 * draws it differently, it demands typing digits into little segments, and it lets
 * you land on 17:07. Availability is not that precise — practitioners think in whole
 * and half hours ("2 to 3", "2:30 to 3:30"), so the choices here are exactly those.
 */
const STEP_MINUTES = 30;
const DAY_END = 24 * 60;

function toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return (hours || 0) * 60 + (minutes || 0);
}

function toValue(minutes: number): string {
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** 13:30 → "1:30 PM". */
export function formatTime(time: string): string {
    const minutes = toMinutes(time);
    const hour = Math.floor(minutes / 60);
    const suffix = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return `${hour12}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
}

/** 90 → "1h 30m". */
function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return [hours ? `${hours}h` : '', rest ? `${rest}m` : ''].filter(Boolean).join(' ');
}

/**
 * Every half hour in the range, with any off-grid value already saved (an old
 * 17:15, say) folded in so editing one window never silently rewrites another.
 */
function options(from: number, to: number, keep: number): number[] {
    const slots: number[] = [];

    for (let minutes = from; minutes <= to; minutes += STEP_MINUTES) {
        slots.push(minutes);
    }

    if (keep >= from && keep <= to && !slots.includes(keep)) {
        slots.push(keep);
        slots.sort((a, b) => a - b);
    }

    return slots;
}

function Select({ value, children, onChange }: { value: string; children: React.ReactNode; onChange: (value: string) => void }) {
    return (
        <div className="relative min-w-0 flex-1">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border-ashen-300/60 text-ashen-800 hover:border-ashen-400 focus:border-ashen-500 focus:ring-ashen-200 w-full appearance-none rounded-lg border bg-white/70 py-1.5 pr-7 pl-3 text-sm font-medium transition outline-none focus:ring-2"
            >
                {children}
            </select>
            <ChevronDown className="text-ashen-400 pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2" />
        </div>
    );
}

export default function TimeRange({
    start,
    end,
    onChange,
    compact = false,
}: {
    start: string;
    end: string;
    onChange: (start: string, end: string) => void;
    /** Drops the "· 2h" hint, for the narrow day cards on the practitioner's own schedule. */
    compact?: boolean;
}) {
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);
    const duration = Math.max(STEP_MINUTES, endMinutes - startMinutes);

    /** Moving the start drags the end along, so a window never inverts itself. */
    const changeStart = (value: string) => {
        const next = toMinutes(value);

        onChange(value, toValue(Math.min(next + duration, DAY_END - STEP_MINUTES)));
    };

    return (
        <div className={`flex min-w-0 flex-1 items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
            <Select value={start} onChange={changeStart}>
                {options(0, DAY_END - 2 * STEP_MINUTES, startMinutes).map((minutes) => (
                    <option key={minutes} value={toValue(minutes)}>
                        {formatTime(toValue(minutes))}
                    </option>
                ))}
            </Select>

            <span className="text-ashen-400 text-sm">to</span>

            <Select value={end} onChange={(value) => onChange(start, value)}>
                {options(startMinutes + STEP_MINUTES, DAY_END - STEP_MINUTES, endMinutes).map((minutes) => (
                    <option key={minutes} value={toValue(minutes)}>
                        {formatTime(toValue(minutes))}
                        {compact ? '' : ` · ${formatDuration(minutes - startMinutes)}`}
                    </option>
                ))}
            </Select>
        </div>
    );
}
