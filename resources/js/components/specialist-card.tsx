import { Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarClock } from 'lucide-react';

export interface Specialist {
    id: number;
    name: string;
    headline: string | null;
    photo_path: string | null;
    approaches: string[];
    languages: string[];
    gender: string | null;
    years_experience: number | null;
    from_price: number | null;
    next_available_label: string | null;
    next_available_at: string | null;
    next_slots: string[];
    isVirtual?: boolean;
}

export interface MatchPreferences {
    language: string | null;
    approach: string | null;
}

/** Does this specialist match the client's onboarding preferences? */
export function matchesPreferences(p: Specialist, preferences: MatchPreferences): boolean {
    return (
        (!!preferences.language && p.languages.includes(preferences.language)) ||
        (!!preferences.approach && preferences.approach !== 'unsure' && p.approaches.includes(preferences.approach))
    );
}

export const APPROACH_LABELS: Record<string, string> = { cbt: 'CBT', emdr: 'EMDR', psychoanalysis: 'Psychoanalysis' };
export const LANGUAGE_LABELS: Record<string, string> = { arabic: 'Arabic', english: 'English', french: 'French' };

const GRADIENTS = [
    'from-sage-400 to-sage-700',
    'from-sand to-beige',
    'from-ashen-400 to-ashen-700',
    'from-sage-300 to-sage-600',
    'from-beige to-sand',
];

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function gradientFor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash + name.charCodeAt(i)) % GRADIENTS.length;
    }
    return GRADIENTS[hash];
}

/** Compact directory card: warm frosted glass with an inset "album" photo — works in a carousel or a grid. */
export function SpecialistCard({ specialist: p, matched = false }: { specialist: Specialist; matched?: boolean }) {
    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/60 bg-white/55 shadow-[0_20px_50px_-32px_rgba(58,59,55,0.45)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(79,111,82,0.45)]">
            {/* photo set inside the glass like a photo in an album */}
            <div className="p-2.5 pb-0">
                <div className="bg-ashen-200/70 relative aspect-[5/4] w-full overflow-hidden rounded-[1.1rem]">
                    {p.photo_path ? (
                        <img
                            src={p.photo_path}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover object-[center_25%] transition duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientFor(p.name)}`}>
                            <span className="font-display text-5xl text-white/85">{initials(p.name)}</span>
                        </div>
                    )}
                    <span className="bg-cream/90 text-ashen-700 absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur">
                        Licensed Psychologist
                    </span>
                    {matched && (
                        <span className="bg-sage-600 absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm">
                            ✦ Matches you
                        </span>
                    )}
                </div>
            </div>

            {/* body */}
            <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                    <h3 className="font-display text-ashen-800 text-xl">{p.name}</h3>
                    {p.headline && <p className="text-ashen-500 mt-0.5 line-clamp-1 text-sm">{p.headline}</p>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {p.approaches.map((a) => (
                        <span key={a} className="bg-sage-100 text-sage-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {APPROACH_LABELS[a] ?? a}
                        </span>
                    ))}
                    {p.languages.map((l) => (
                        <span key={l} className="border-sage-200 text-ashen-500 rounded-full border px-2.5 py-0.5 text-xs">
                            {LANGUAGE_LABELS[l] ?? l}
                        </span>
                    ))}
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    {p.years_experience != null && <span className="text-ashen-500 text-sm">{p.years_experience} years of experience</span>}
                    {p.next_slots.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <CalendarClock className="text-sage-600 size-4 shrink-0" />
                            {p.next_slots.slice(0, 2).map((slot) => (
                                <span
                                    key={slot}
                                    className="border-sage-200 bg-sage-50 text-sage-800 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                                >
                                    {slot}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* footer */}
            <div className="border-sage-200/50 flex items-center justify-between border-t px-5 py-4">
                <span className="text-sm">
                    {p.from_price != null ? (
                        <>
                            <span className="text-ashen-500">from </span>
                            <span className="text-ashen-800 font-semibold">${p.from_price}</span>
                        </>
                    ) : (
                        <span className="text-ashen-500">Contact for pricing</span>
                    )}
                </span>
                {p.isVirtual ? (
                    <span className="bg-sage-50 text-sage-600 rounded-full px-4 py-2 text-sm font-medium">Coming soon</span>
                ) : (
                    <Link
                        href={`/therapists/${p.id}`}
                        prefetch
                        className="group/btn bg-sage-700 hover:bg-sage-800 inline-flex items-center gap-2 rounded-full py-2 pr-2 pl-4 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                    >
                        View &amp; book
                        <span className="rounded-full bg-white/20 p-1 transition-transform group-hover/btn:rotate-45">
                            <ArrowUpRight className="size-4" />
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
}
