import { AmbientBackground } from '@/components/ambient-background';
import { DUST_QUIET, DustField, EDGE_DROPS, OliveDrops, OliveHorizon } from '@/components/olive';
import { SpecialistPortraitCard, SpecialistPreviewModal, type Specialist } from '@/components/specialist-card';
import { applyFilters, EMPTY_FILTERS, SpecialistFilterBar, type SpecialistFilters } from '@/components/specialist-filters';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, BellRing, CalendarHeart, ShieldCheck, Sparkles, UserPlus, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState, type ComponentType } from 'react';

/**
 * The public specialist directory — the landing page's "View all".
 *
 * Built to the same shape as the signed-in directory on purpose: viewport-locked
 * on desktop, a portrait panel down the left, and the specialists in a drag rail
 * beside it. The one swap is what fills that portrait slot — the daily intention
 * belongs to someone's own space, so out here it's the reason to have one.
 *
 * Cards link to the guest booking page rather than the in-app profile: that route
 * is role:client gated and would bounce a visitor to the login screen. Booking
 * without an account stays a real path, not a trick to force a signup.
 */
export default function PublicSpecialists({ practitioners }: { practitioners: Specialist[] }) {
    const [filters, setFilters] = useState<SpecialistFilters>(EMPTY_FILTERS);
    const visible = useMemo(() => applyFilters(practitioners, filters), [practitioners, filters]);
    // clicking a card opens a preview of their qualifications first, then books
    const [preview, setPreview] = useState<Specialist | null>(null);

    return (
        <div className="sanad-split text-ashen-800 relative flex min-h-screen flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden">
            <Head title="Our psychologists" />

            {/* atmosphere on the shell, so it runs behind the header rather than
            starting below it and leaving a seam across the page */}
            <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
                <AmbientBackground />
                <DustField motes={DUST_QUIET} />
            </div>

            {/* ===== minimal public top bar ===== */}
            <header className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between px-6 py-4 md:px-10">
                <Link href="/" className="font-display text-ashen-800 text-xl tracking-tight">
                    Sanad
                </Link>
                {/* Pills, like every other control in the app. These were bare text links
                — the only two things on the page not speaking the landing's language. */}
                <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/#team"
                            className="group border-ashen-600/40 text-ashen-700 hover:border-ashen-700 hover:text-ashen-900 inline-flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-2 text-sm transition md:py-2"
                        >
                            <span className="bg-ashen-900/10 rounded-full p-1 transition-transform group-hover:-translate-x-0.5">
                                <ArrowLeft className="h-4 w-4" />
                            </span>
                            Back
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/login"
                            className="group bg-ashen-800 hover:bg-ashen-900 text-ashen-200 inline-flex items-center gap-2 rounded-full py-1.5 pr-5 pl-2 text-sm transition md:py-2"
                        >
                            <span className="bg-ashen-200/30 rounded-full p-1 transition-transform group-hover:rotate-45">
                                <ArrowUpRight className="h-4 w-4" />
                            </span>
                            Log in
                        </Link>
                    </motion.div>
                </div>
            </header>

            <div className="relative z-10 flex flex-1 flex-col gap-6 px-6 pb-14 md:px-10 lg:min-h-0 lg:flex-row lg:gap-0 lg:px-0 lg:pb-0">
                {/* The reason to have an account, standing where the dashboard keeps its
                daily intention — same slot, same portrait shape. It's what stops this
                page reading as a wall of faces with nothing said around it. */}
                <aside className="hidden shrink-0 lg:block lg:w-[14rem] lg:py-5 lg:pl-5 xl:w-[16rem]">
                    <JoinPanel portrait />
                </aside>

                <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col lg:min-h-0 lg:px-8 lg:py-5 xl:px-10">
                    <header className="shrink-0">
                        <span className="border-ashen-300/60 text-ashen-700 bg-ashen-50/70 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
                            <Users className="size-3.5" />
                            {/* counts what's actually on screen, so the number never contradicts the rail */}
                            {visible.length === practitioners.length
                                ? `${practitioners.length} available`
                                : `${visible.length} of ${practitioners.length}`}
                        </span>
                        <h1 className="font-display text-ashen-800 mt-3 text-3xl leading-tight tracking-tight sm:text-4xl lg:text-4xl">
                            Our <span className="italic">psychologists</span>
                        </h1>
                        <p className="text-ashen-500 mt-2.5 flex max-w-2xl items-start gap-2 text-[15px] leading-relaxed">
                            <ShieldCheck className="text-ashen-600 mt-0.5 size-4 shrink-0" />
                            Every Sanad psychologist is a licensed clinical psychologist, trained across CBT, EMDR and psychoanalysis — real,
                            confidential care.
                        </p>
                    </header>

                    {practitioners.length > 0 && (
                        <div className="mt-4 mb-4 shrink-0">
                            <SpecialistFilterBar specialists={practitioners} filters={filters} onChange={setFilters} />
                        </div>
                    )}

                    {/* the pitch inline on phones — the aside is desktop-only, and this is
                    the one thing a visitor shouldn't have to hunt for */}
                    <div className="mb-6 lg:hidden">
                        <JoinPanel />
                    </div>

                    {practitioners.length === 0 ? (
                        <EmptyState title="Our psychologists are on their way" body="We’re carefully selecting the right people. Check back soon." />
                    ) : visible.length === 0 ? (
                        <EmptyState
                            title="No one matches those filters"
                            body="Try widening your search — a different approach, another time of day, or a higher price."
                            action={
                                <button
                                    type="button"
                                    onClick={() => setFilters(EMPTY_FILTERS)}
                                    className="text-ashen-700 hover:text-ashen-900 mt-1 text-sm font-medium underline underline-offset-4 transition"
                                >
                                    Clear filters
                                </button>
                            }
                        />
                    ) : (
                        <>
                            {/* Mobile/tablet: ONE horizontal snap rail (the landing team's
                            recipe — cards hold their own 4:5 aspect, never depending on a flex
                            parent resolving a height). Laptop (lg+): the rail becomes a 3-per-row
                            grid that scrolls vertically inside the viewport-locked column, so it
                            reads the same as the signed-in /specialists directory. */}
                            <div className="scrollbar-hide -mx-6 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-2 md:-mx-10 md:gap-5 md:px-10 lg:mx-0 lg:min-h-0 lg:flex-1 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-x-visible lg:overflow-y-auto lg:px-0.5">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {visible.map((specialist) => (
                                        <motion.div
                                            key={specialist.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            className="w-[72%] shrink-0 snap-center self-start sm:w-[45%] lg:w-auto lg:shrink"
                                        >
                                            <SpecialistPortraitCard specialist={specialist} onSelect={setPreview} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <p className="text-ashen-500 mt-2 flex shrink-0 items-center gap-2 text-xs lg:hidden">
                                <Sparkles className="size-3.5 shrink-0" />
                                Swipe sideways to meet everyone — or book any of them without an account.
                            </p>
                        </>
                    )}
                </main>
            </div>

            <SpecialistPreviewModal specialist={preview} bookHref={(s) => `/book/${s.slug}`} onClose={() => setPreview(null)} />
        </div>
    );
}

const PERKS: { icon: ComponentType<{ className?: string }>; text: string }[] = [
    { icon: CalendarHeart, text: 'Every session in one calm place' },
    { icon: BellRing, text: 'Reminders before each session' },
    { icon: Sparkles, text: 'Specialists matched to how you feel' },
];

/**
 * The invitation to create an account.
 *
 * Deliberately an invitation, not a gate: booking as a guest works, and the copy
 * says so. Uses the landing's dark panel because it sits in the same slot as the
 * dashboard's intention, and the split needs one anchor of weight to read against.
 */
function JoinPanel({ portrait = false }: { portrait?: boolean }) {
    return (
        <div className={`sanad-card-dark relative flex flex-col overflow-hidden ${portrait ? 'h-full rounded-[1.75rem] p-6' : 'rounded-2xl p-6'}`}>
            {portrait && (
                <>
                    <OliveHorizon opacity="opacity-[0.12]" />
                    <OliveDrops drops={EDGE_DROPS} tone="light" />
                </>
            )}

            <div className={`relative z-10 flex flex-col ${portrait ? 'h-full' : ''}`}>
                <p className="text-ashen-400 shrink-0 text-[11px] font-semibold tracking-[0.2em] uppercase">Free account</p>

                <h2 className={`font-display text-ashen-100 mt-3 leading-snug ${portrait ? 'text-xl' : 'text-2xl'}`}>Keep your care in one place</h2>

                <ul className={`flex flex-col gap-3 ${portrait ? 'mt-5 flex-1' : 'mt-4'}`}>
                    {PERKS.map((perk) => (
                        <li key={perk.text} className="text-ashen-300 flex items-start gap-2.5 text-xs leading-relaxed">
                            <span className="bg-ashen-100/10 mt-px flex size-6 shrink-0 items-center justify-center rounded-full">
                                <perk.icon className="text-ashen-200 size-3.5" />
                            </span>
                            {perk.text}
                        </li>
                    ))}
                </ul>

                <div className="mt-5 shrink-0">
                    <Link
                        href="/register"
                        className="group bg-ashen-100 text-ashen-900 hover:bg-ashen-50 inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                        <span className="bg-ashen-900/10 rounded-full p-1 transition-transform group-hover:rotate-45">
                            <UserPlus className="size-3.5" />
                        </span>
                        Create free account
                    </Link>
                    {/* says the quiet part out loud — the account is an offer, not a toll */}
                    <p className="text-ashen-400 mt-2.5 text-center text-[11px] leading-relaxed">Or book any psychologist without one.</p>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
    return (
        <div className="border-ashen-300/60 bg-ashen-50/40 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-12 text-center lg:min-h-0 lg:flex-1">
            <p className="font-display text-ashen-700 text-xl">{title}</p>
            <p className="text-ashen-500 max-w-sm text-sm">{body}</p>
            {action}
        </div>
    );
}
