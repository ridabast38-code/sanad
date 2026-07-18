import { Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarClock, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export interface Specialist {
    id: number;
    /** Set for public (guest) links — see BuildsSpecialistDirectory. */
    slug?: string;
    name: string;
    headline: string | null;
    /** Set on directory records, for the preview modal. */
    bio?: string | null;
    photo_path: string | null;
    approaches: string[];
    languages: string[];
    gender: string | null;
    years_experience: number | null;
    from_price: number | null;
    next_available_label: string | null;
    next_available_at: string | null;
    next_slots: string[];
    /** Which parts of the day this specialist has slots in — see BuildsSpecialistDirectory. */
    slot_periods?: string[];
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

const GRADIENTS = ['from-ashen-400 to-ashen-700', 'from-ashen-300 to-ashen-600', 'from-ashen-500 to-ashen-800', 'from-ashen-300 to-ashen-500'];

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

/**
 * Compact directory card: warm frosted glass with an inset "album" photo — works
 * in a carousel or a grid.
 *
 * `fitHeight` is for the viewport-locked rail. Normally the photo holds a fixed
 * 5:4 ratio, which means the card has a hard minimum height; drop that card into
 * a container shorter than that and `overflow-hidden` silently eats the footer —
 * taking the "View & book" button with it. With `fitHeight` the photo becomes the
 * flexible part and the name and button are pinned, so the card survives any
 * height instead of quietly losing the one control that matters.
 */
export function SpecialistCard({
    specialist: p,
    matched = false,
    fitHeight = false,
}: {
    specialist: Specialist;
    matched?: boolean;
    fitHeight?: boolean;
}) {
    return (
        <div className="sanad-card group flex h-full flex-col overflow-hidden rounded-[1.6rem] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(20,21,15,0.5)]">
            {/* photo set inside the glass like a photo in an album */}
            <div className={`p-2.5 pb-0 ${fitHeight ? 'min-h-0 flex-1' : ''}`}>
                <div
                    className={`bg-ashen-200/70 relative w-full overflow-hidden rounded-[1.1rem] ${
                        fitHeight ? 'h-full min-h-[7rem]' : 'aspect-[5/4]'
                    }`}
                >
                    {p.photo_path ? (
                        <img
                            src={p.photo_path}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover object-[center_25%] grayscale-[45%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        />
                    ) : (
                        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientFor(p.name)}`}>
                            <span className="font-display text-5xl text-white/85">{initials(p.name)}</span>
                        </div>
                    )}
                    <span className="bg-ashen-50/90 text-ashen-700 absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur">
                        Licensed Psychologist
                    </span>
                    {matched && (
                        <span className="bg-ashen-600 absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm">
                            ✦ Matches you
                        </span>
                    )}
                </div>
            </div>

            {/* body */}
            <div className={`flex flex-col gap-3 p-5 ${fitHeight ? 'shrink-0 gap-2 p-4' : 'flex-1'}`}>
                <div>
                    <h3 className="font-display text-ashen-800 text-xl">{p.name}</h3>
                    {p.headline && <p className="text-ashen-500 mt-0.5 line-clamp-1 text-sm">{p.headline}</p>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {p.approaches.map((a) => (
                        <span key={a} className="bg-ashen-100 text-ashen-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {APPROACH_LABELS[a] ?? a}
                        </span>
                    ))}
                    {p.languages.map((l) => (
                        <span key={l} className="border-ashen-200 text-ashen-500 rounded-full border px-2.5 py-0.5 text-xs">
                            {LANGUAGE_LABELS[l] ?? l}
                        </span>
                    ))}
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    {p.years_experience != null && <span className="text-ashen-500 text-sm">{p.years_experience} years of experience</span>}
                    {p.next_slots.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <CalendarClock className="text-ashen-600 size-4 shrink-0" />
                            {p.next_slots.slice(0, 2).map((slot) => (
                                <span
                                    key={slot}
                                    className="border-ashen-200 bg-ashen-50 text-ashen-800 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                                >
                                    {slot}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* footer */}
            <div className={`border-ashen-200/50 flex shrink-0 items-center justify-between border-t px-5 ${fitHeight ? 'py-3' : 'py-4'}`}>
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
                    <span className="bg-ashen-50 text-ashen-600 rounded-full px-4 py-2 text-sm font-medium">Coming soon</span>
                ) : (
                    <Link
                        href={`/therapists/${p.id}`}
                        prefetch
                        className="group/btn bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-2 rounded-full py-2 pr-2 pl-4 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                    >
                        View &amp; book
                        <span className="bg-ashen-50/20 rounded-full p-1 transition-transform group-hover/btn:rotate-45">
                            <ArrowUpRight className="size-4" />
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
}

/**
 * The landing's team-card treatment, for the client directory: the photo IS the
 * card, with the name resting on it rather than on a frame below.
 *
 * The whole card is the link, which also removes the failure mode of the boxed
 * variant above — there is no separate footer button left to clip when the card
 * is squeezed. `fitHeight` fills its container instead of holding a 4:5 ratio, so
 * inside the viewport-locked rail the photo simply crops rather than overflowing.
 */
export function SpecialistPortraitCard({
    specialist: p,
    matched = false,
    fitHeight = false,
    href,
    onSelect,
}: {
    specialist: Specialist;
    matched?: boolean;
    fitHeight?: boolean;
    /**
     * Where the card leads. Defaults to the in-app profile, which is role:client
     * gated — send a guest there and they just bounce to the login screen, so the
     * public directory passes the guest booking page instead.
     */
    href?: string;
    /**
     * When given, the card opens a preview instead of navigating — the directories
     * want a "read their qualifications first" step before booking. Takes priority
     * over `href`.
     */
    onSelect?: (specialist: Specialist) => void;
}) {
    const target = href ?? `/therapists/${p.id}`;

    const inner = (
        <>
            {p.photo_path ? (
                // NOT lazy. These cards live in horizontal rails inside viewport-locked,
                // overflow-hidden layouts, where the browser reads the images as never
                // intersecting and a lazy image simply never loads — which read as "the
                // cards lost their photos". The landing's cards load eagerly for the same
                // reason. A directory is a handful of faces, so the cost is trivial.
                <img
                    src={p.photo_path}
                    alt={p.name}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-[center_20%] grayscale-[45%] transition duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                />
            ) : (
                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientFor(p.name)}`}>
                    <span className="font-display text-5xl text-white/85">{initials(p.name)}</span>
                </div>
            )}

            {matched && (
                <span className="bg-ashen-50/90 text-ashen-800 absolute top-4 left-4 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur">
                    ✦ Matches you
                </span>
            )}
            {p.from_price != null && (
                <span className="bg-ashen-950/55 text-ashen-100 absolute top-4 right-4 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                    from ${p.from_price}
                </span>
            )}

            {/* the name rests on the photo instead of on a frame below it */}
            <div className="from-ashen-950/90 via-ashen-950/25 absolute inset-0 bg-gradient-to-t to-transparent transition-opacity duration-700 group-hover:opacity-90" />

            <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-ashen-100 text-xl md:text-2xl">{p.name}</h3>
                <p className="text-ashen-300 mt-1 text-xs">Licensed clinical psychologist</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {p.approaches.map((a) => (
                        <span key={a} className="bg-ashen-100/15 text-ashen-100 rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                            {APPROACH_LABELS[a] ?? a}
                        </span>
                    ))}
                </div>

                {p.next_slots.length > 0 && (
                    <p className="text-ashen-300 mt-2.5 flex items-center gap-1.5 text-[11px]">
                        <CalendarClock className="size-3.5 shrink-0" />
                        {p.next_slots[0]}
                    </p>
                )}
            </div>
        </>
    );

    // `w-full` is load-bearing, not cosmetic. Every child of the card is
    // absolutely positioned, so nothing contributes in-flow height — the card's
    // whole height comes from aspect-[4/5], which only resolves against a definite
    // WIDTH. This card is a <button>, and a block button does NOT fill its parent's
    // width the way a div does (form controls size to their content). Without
    // w-full the button collapsed to ~0 wide, aspect gave ~0 tall, and the card
    // vanished — present in the DOM, zero pixels on screen. The landing's card
    // never hit this because it carries its own width class.
    //
    // The gradient base shows only when there's no photo (the photo is object-cover
    // on top), so a slow or missing image never leaves an empty hole either.
    const shape = `group from-ashen-400 to-ashen-700 relative block w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br shadow-[0_30px_60px_-30px_rgba(20,21,15,0.75)] ${
        fitHeight ? 'h-full min-h-[16rem]' : 'aspect-[4/5]'
    }`;

    if (p.isVirtual) {
        return (
            <div className={shape}>
                {inner}
                <span className="bg-ashen-950/60 text-ashen-100 absolute top-4 right-4 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                    Coming soon
                </span>
            </div>
        );
    }

    const hoverArrow = (
        <span className="bg-ashen-100/20 text-ashen-100 absolute right-5 bottom-5 flex size-9 items-center justify-center rounded-full opacity-0 backdrop-blur transition duration-500 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
        </span>
    );

    // opens the preview modal rather than navigating — the "see qualifications first" path
    if (onSelect) {
        return (
            <button
                type="button"
                onClick={() => onSelect(p)}
                className={`${shape} text-left transition-transform duration-500 hover:-translate-y-1.5`}
                aria-label={`View ${p.name}'s profile`}
            >
                {inner}
                {hoverArrow}
            </button>
        );
    }

    return (
        <Link
            href={target}
            prefetch
            className={`${shape} transition-transform duration-500 hover:-translate-y-1.5`}
            aria-label={`View and book ${p.name}`}
        >
            {inner}
            {hoverArrow}
        </Link>
    );
}

/**
 * A quick look at a specialist before committing to booking — the "read their
 * qualifications first" step the directories were missing.
 *
 * The same modal the landing has always used, made reusable. `bookHref` is where
 * "Book a session" leads, so the caller decides between the in-app profile and the
 * guest flow (the card can't be gated the way a page is).
 */
export function SpecialistPreviewModal({
    specialist,
    bookHref,
    onClose,
}: {
    specialist: Specialist | null;
    bookHref: (specialist: Specialist) => string;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            {specialist && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="bg-ashen-950/70 fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        // opaque gradient, not glass: it sits over a dark scrim, so a
                        // translucent panel would pull that darkness up through the text
                        className="from-ashen-50 to-ashen-200 relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-gradient-to-br shadow-2xl md:flex-row"
                    >
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="text-ashen-900 bg-ashen-100/90 hover:bg-ashen-100 absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="relative h-52 w-full shrink-0 sm:h-64 md:h-auto md:w-2/5">
                            {specialist.photo_path ? (
                                <img src={specialist.photo_path} alt={specialist.name} className="h-full w-full object-cover grayscale-[15%]" />
                            ) : (
                                <div className={`h-full w-full bg-gradient-to-br ${gradientFor(specialist.name)}`} />
                            )}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                            <span className="bg-ashen-100 text-ashen-600 rounded-full px-3 py-1 text-xs font-medium">
                                Licensed Clinical Psychologist
                            </span>
                            <h3 className="font-display text-ashen-900 mt-4 text-3xl">{specialist.name}</h3>
                            {specialist.headline && <p className="text-ashen-600 mt-1 text-sm">{specialist.headline}</p>}

                            <p className="text-ashen-700 mt-5 leading-relaxed">
                                {specialist.bio ||
                                    specialist.headline ||
                                    `${specialist.name.split(' ')[0]} is a licensed clinical psychologist offering warm, confidential care across CBT, EMDR and psychoanalytic approaches.`}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                                {specialist.approaches.length > 0 && (
                                    <div>
                                        <p className="text-ashen-600 text-xs tracking-wider uppercase">Approaches</p>
                                        <p className="text-ashen-700 mt-1 text-sm">
                                            {specialist.approaches.map((a) => APPROACH_LABELS[a] ?? a).join(' · ')}
                                        </p>
                                    </div>
                                )}
                                {specialist.languages.length > 0 && (
                                    <div>
                                        <p className="text-ashen-600 text-xs tracking-wider uppercase">Languages</p>
                                        <p className="text-ashen-700 mt-1 text-sm">
                                            {specialist.languages.map((l) => LANGUAGE_LABELS[l] ?? l).join(' · ')}
                                        </p>
                                    </div>
                                )}
                                {specialist.years_experience != null && (
                                    <div>
                                        <p className="text-ashen-600 text-xs tracking-wider uppercase">Experience</p>
                                        <p className="text-ashen-700 mt-1 text-sm">{specialist.years_experience} years</p>
                                    </div>
                                )}
                                {specialist.from_price != null && (
                                    <div>
                                        <p className="text-ashen-600 text-xs tracking-wider uppercase">From</p>
                                        <p className="text-ashen-700 mt-1 text-sm">${specialist.from_price} / session</p>
                                    </div>
                                )}
                            </div>

                            <Link
                                href={bookHref(specialist)}
                                className="group bg-ashen-800 hover:bg-ashen-900 text-ashen-200 mt-8 inline-flex items-center gap-2 rounded-full py-3 pr-6 pl-3 text-sm font-medium transition"
                            >
                                <span className="bg-ashen-200/30 rounded-full p-1 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="size-4" />
                                </span>
                                Book a session with {specialist.name.split(' ')[0]}
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
