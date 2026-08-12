import { EDGE_DROPS, OliveDrops, OliveHorizon } from '@/components/olive';
import SanadLogo from '@/components/sanad-logo';
import { SpecialistPortraitCard, SpecialistPreviewModal, type Specialist } from '@/components/specialist-card';
import { applyFilters, EMPTY_FILTERS, SpecialistFilterBar, type SpecialistFilters } from '@/components/specialist-filters';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Bell,
    BookOpen,
    CalendarHeart,
    ChevronLeft,
    ChevronRight,
    Clock,
    Compass,
    CreditCard,
    FileText,
    LifeBuoy,
    Lock,
    LogOut,
    Share2,
    ShieldCheck,
    Sparkles,
    UserRound,
    Users,
    Video,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState, type ComponentType } from 'react';

/** Soft tonal card — frosted rather than solid, so the page split reads through. */
const CARD = 'sanad-card rounded-2xl';

/** Gentle affirmations in OurSanad's voice — shown on the daily-intention card. */
const INTENTIONS = [
    'Today, I will permit myself to rest without guilt, and acknowledge my progress, no matter how small.',
    'Asking for support is not weakness — it is the first brave step toward myself.',
    'I have carried enough alone. Today, I am allowed to share the weight.',
    'Healing is not a straight line. Every small step still counts as forward.',
];

const VIEWS = ['sessions', 'specialists', 'notifications', 'profile'] as const;
type View = (typeof VIEWS)[number];
const isView = (v: string | null): v is View => !!v && (VIEWS as readonly string[]).includes(v);

interface HomeProps {
    practitioners: Specialist[];
    upcomingSession: UpcomingSession | null;
    upcomingSessions: UpcomingSession[];
    stats: { upcoming: number; completed: number };
}

interface UpcomingSession {
    id: number;
    practitioner_name: string;
    service_name: string;
    scheduled_label: string;
    scheduled_month: string;
    scheduled_day: string;
    scheduled_time: string;
    scheduled_iso: string;
    duration_minutes: number | null;
    meeting_link: string | null;
    status: string;
}

export default function ClientHome({ practitioners, upcomingSessions }: HomeProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const rawFirstName = auth.user.name.split(' ')[0];
    const firstName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1);

    const initialView = new URLSearchParams(page.url.includes('?') ? page.url.split('?')[1] : '').get('view');
    const [view, setView] = useState<View>(isView(initialView) ? initialView : 'sessions');

    const navigate = (next: View) => {
        setView(next);
        window.history.replaceState({}, '', next === 'sessions' ? '/dashboard' : `/dashboard?view=${next}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Hide the nav only on a deliberate scroll deep down; reveal on the way up,
    // near the top, or when the pointer reaches the top edge.
    const [navHidden, setNavHidden] = useState(false);
    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            if (y < 280) {
                setNavHidden(false);
            } else if (y > last + 48) {
                setNavHidden(true);
                last = y;
            } else if (y < last - 10) {
                setNavHidden(false);
                last = y;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title={view.charAt(0).toUpperCase() + view.slice(1)} />

            {/* Locked to the viewport on desktop, exactly like the ongoing menu: the
            page itself never scrolls, and each view scrolls its own body if it has
            to. Below lg it flows and scrolls normally — a phone has no viewport to
            fit anything into. */}
            <div className="sanad-split text-ashen-800 flex min-h-screen flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden">
                {/* hovering the top edge always brings the nav back */}
                <div aria-hidden onMouseEnter={() => setNavHidden(false)} className="fixed inset-x-0 top-0 z-30 h-5" />

                <TopNav user={auth.user} isHidden={navHidden} view={view} onNavigate={navigate} onReveal={() => setNavHidden(false)} />

                {/* The max-width container is on <main> alone, not out here. Wrapping both
                columns in it pushed the intention inward off the screen edge and made it
                eat width the dashboard needed. */}
                <div className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-28 md:px-10 lg:min-h-0 lg:flex-row lg:gap-0 lg:px-0 lg:pt-0 lg:pb-0">
                    {/* The intention stands where the dashboard photo used to — same slot,
                    same portrait shape, but it says something instead of being decoration.
                    Flush to the very left edge and deliberately narrow: it's an anchor of
                    weight for the split to read against, not a second column of content.
                    Desktop only — on a phone it belongs inline with the rest, not as a
                    banner you have to scroll past to reach your sessions. */}
                    <aside className="hidden shrink-0 lg:block lg:w-[12.5rem] lg:py-5 lg:pl-5 xl:w-[14rem]">
                        <DailyIntention portrait />
                    </aside>

                    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col lg:min-h-0 lg:px-8 lg:py-6 xl:px-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className="flex flex-1 flex-col lg:min-h-0"
                            >
                                {view === 'sessions' && (
                                    <SessionsView
                                        firstName={firstName}
                                        sessions={upcomingSessions}
                                        specialistCount={practitioners.length}
                                        onFindSpecialist={() => navigate('specialists')}
                                    />
                                )}
                                {view === 'specialists' && <SpecialistsView practitioners={practitioners} />}
                                {view === 'notifications' && <NotificationsView sessions={upcomingSessions} />}
                                {view === 'profile' && <ProfileView user={auth.user} />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {/* familiar back/forth control to move between the four sections */}
                <ViewPager current={view} onNavigate={navigate} />
            </div>
        </>
    );
}

const VIEW_LABELS: Record<View, string> = {
    sessions: 'My sessions',
    specialists: 'Specialists',
    notifications: 'Notifications',
    profile: 'Profile',
};

function ViewPager({ current, onNavigate }: { current: View; onNavigate: (view: View) => void }) {
    const idx = VIEWS.indexOf(current);
    const go = (dir: -1 | 1) => onNavigate(VIEWS[(idx + dir + VIEWS.length) % VIEWS.length]);

    return (
        <div className="border-ashen-300/30 bg-ashen-50/85 fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border p-1.5 shadow-[0_10px_30px_-10px_rgba(26,28,28,0.3)] backdrop-blur-md">
            <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous section"
                className="text-ashen-500 hover:text-ashen-700 hover:bg-ashen-50/70 flex size-9 items-center justify-center rounded-full transition active:scale-90"
            >
                <ChevronLeft className="size-5" />
            </button>
            <span className="text-ashen-600 min-w-[7rem] text-center text-sm font-medium">{VIEW_LABELS[current]}</span>
            <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next section"
                className="text-ashen-500 hover:text-ashen-700 hover:bg-ashen-50/70 flex size-9 items-center justify-center rounded-full transition active:scale-90"
            >
                <ChevronRight className="size-5" />
            </button>
        </div>
    );
}

/* ============================ Sessions view ============================ */

function SessionsView({
    firstName,
    sessions,
    specialistCount,
    onFindSpecialist,
}: {
    firstName: string;
    sessions: UpcomingSession[];
    specialistCount: number;
    onFindSpecialist: () => void;
}) {
    const [featured, ...rest] = sessions;

    return (
        <div className="flex flex-1 flex-col lg:min-h-0">
            {/* shrink-0: the greeting holds its size and the columns below absorb
            whatever height is left, instead of pushing the page taller */}
            <header className="mb-8 shrink-0 md:mb-12 lg:mb-6">
                <h1 className="font-display text-ashen-800 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-4xl">
                    Welcome back, {firstName}
                </h1>
                <p className="text-ashen-500 mt-3 text-base sm:text-lg lg:mt-2 lg:text-base">
                    Your sanctuary is ready. Take a breath before you begin.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-10 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-0 xl:gap-x-20">
                <section className="space-y-8 md:space-y-10 lg:min-h-0 lg:space-y-4">
                    <ColumnHeader title="Find support" />
                    <BookNow count={specialistCount} onFind={onFindSpecialist} />
                    <Link
                        href="/emergency"
                        className="border-ashen-200/70 bg-ashen-50/60 hover:bg-ashen-50 group flex items-center gap-4 rounded-2xl border p-5 transition active:scale-[0.99]"
                    >
                        <span className="bg-ashen-100 text-ashen-700 flex size-11 shrink-0 items-center justify-center rounded-full">
                            <LifeBuoy className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="text-ashen-800 block text-sm font-semibold">Going through something right now?</span>
                            <span className="text-ashen-500 block text-xs">Get gentle, immediate support — one step at a time.</span>
                        </span>
                        <ArrowUpRight className="text-ashen-500 size-4 transition group-hover:translate-x-0.5" />
                    </Link>
                    {/* Phones only — on desktop this lives in the portrait column beside
                    the whole dashboard, so showing it here too would just repeat it. */}
                    <div className="space-y-5 lg:hidden">
                        <SectionLabel>Daily intention</SectionLabel>
                        <DailyIntention />
                    </div>
                </section>

                <section className="scrollbar-hide space-y-8 md:space-y-10 lg:min-h-0 lg:space-y-4 lg:overflow-y-auto lg:pr-1">
                    <ColumnHeader
                        title="Your Sanctuary"
                        action={
                            <button
                                type="button"
                                onClick={onFindSpecialist}
                                className="text-ashen-700 hover:text-ashen-900 text-sm font-medium transition"
                            >
                                View all
                            </button>
                        }
                    />
                    <NextSessionCard session={featured ?? null} firstName={firstName} onFind={onFindSpecialist} />
                    {rest.length > 0 && (
                        <div className="space-y-3">
                            <SectionLabel>
                                Also upcoming · {rest.length} {rest.length === 1 ? 'session' : 'sessions'}
                            </SectionLabel>
                            {rest.map((session) => (
                                <UpcomingSessionRow key={session.id} session={session} />
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-6">
                        <QuickTile
                            icon={Compass}
                            title="Find a specialist"
                            subtitle={`${specialistCount} available`}
                            onClick={onFindSpecialist}
                            progress={1}
                        />
                        <QuickTile icon={UserRound} title="Your profile" subtitle="Edit your details" href="/settings/profile" />
                    </div>
                    <div className="space-y-5">
                        <SectionLabel>Quick resources</SectionLabel>
                        <ResourceRow icon={FileText} label="How OurSanad works" href="/how-it-works" />
                        <ResourceRow icon={BookOpen} label="Preparing for your first session" href="/how-it-works#first-session" />
                    </div>
                </section>
            </div>
        </div>
    );
}

/* ============================ Specialists view ============================ */

function SpecialistsView({ practitioners }: { practitioners: Specialist[] }) {
    const [filters, setFilters] = useState<SpecialistFilters>(EMPTY_FILTERS);
    const visible = useMemo(() => applyFilters(practitioners, filters), [practitioners, filters]);
    // a look at their qualifications before the booking page
    const [preview, setPreview] = useState<Specialist | null>(null);

    return (
        <div className="flex flex-1 flex-col lg:min-h-0">
            <header className="mb-5 shrink-0 md:mb-7 lg:mb-4">
                <span className="border-ashen-300/60 text-ashen-700 bg-ashen-50/70 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
                    <Users className="size-3.5" />
                    {/* counts what you can actually see, so the number never contradicts the rail */}
                    {visible.length === practitioners.length ? `${practitioners.length} available` : `${visible.length} of ${practitioners.length}`}
                </span>
                <h1 className="font-display text-ashen-800 mt-3 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-4xl">
                    Find your <span className="italic">specialist</span>
                </h1>
                <p className="text-ashen-500 mt-2.5 flex max-w-2xl items-start gap-2 text-[15px] leading-relaxed">
                    <ShieldCheck className="text-ashen-600 mt-0.5 size-4 shrink-0" />
                    Every OurSanad psychologist is a licensed clinical psychologist — real, confidential care.
                </p>
            </header>

            {practitioners.length > 0 && (
                <div className="mb-4 shrink-0">
                    <SpecialistFilterBar specialists={practitioners} filters={filters} onChange={setFilters} />
                </div>
            )}

            {practitioners.length === 0 ? (
                <EmptyDirectory title="Our specialists are on their way" body="We’re carefully selecting the right people. Check back soon." />
            ) : visible.length === 0 ? (
                <EmptyDirectory
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
                    {/* ONE horizontal rail at every size — the landing team's exact recipe,
                    which never breaks. The cards hold their own 4:5 aspect (NOT fitHeight),
                    so their height is intrinsic: it does not depend on the flex parent
                    resolving a height, which is what left the old viewport-filling rail
                    collapsed to zero — visible markup, invisible cards. Cards grow a little
                    with the screen but never rely on it to exist. */}
                    <div className="scrollbar-hide -mx-6 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-2 md:-mx-10 md:gap-5 md:px-10">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {visible.map((specialist) => (
                                <motion.div
                                    key={specialist.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="w-[72%] shrink-0 snap-center sm:w-[45%] lg:w-[16rem] xl:w-[18rem]"
                                >
                                    <SpecialistPortraitCard specialist={specialist} onSelect={setPreview} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <p className="text-ashen-500 mt-2 flex shrink-0 items-center gap-2 text-xs">
                        <Sparkles className="size-3.5 shrink-0" />
                        Swipe sideways to meet everyone.
                    </p>
                </>
            )}

            {/* signed-in clients get the richer in-app profile as the booking step */}
            <SpecialistPreviewModal specialist={preview} bookHref={(s) => `/therapists/${s.id}`} onClose={() => setPreview(null)} />
        </div>
    );
}

function EmptyDirectory({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
    return (
        <div className="border-ashen-300/60 bg-ashen-50/40 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-12 text-center lg:min-h-0 lg:flex-1">
            <p className="font-display text-ashen-700 text-xl">{title}</p>
            <p className="text-ashen-500 max-w-sm text-sm">{body}</p>
            {action}
        </div>
    );
}

/* ============================ Notifications view ============================ */

interface NotificationItem {
    key: string;
    icon: ComponentType<{ className?: string }>;
    title: string;
    body: string;
    time: string;
    tone: 'calm' | 'urgent';
    action?: React.ReactNode;
}

function NotificationsView({ sessions }: { sessions: UpcomingSession[] }) {
    const now = useNow();
    const quote = INTENTIONS[Math.floor(Date.now() / 86_400_000) % INTENTIONS.length];

    const items: NotificationItem[] = [];

    // One set of updates per session, soonest first — so several bookings each
    // get their own payment / starting-soon / reminder notes.
    sessions.forEach((session) => {
        const t = sessionTiming(session, now);
        const withWhom = `${session.service_name} with ${session.practitioner_name}`;

        if (t.isOpen) {
            items.push({
                key: `soon-${session.id}`,
                icon: Video,
                title: t.isLive ? 'Your session is live now' : 'Your session starts soon',
                body: t.isLive ? `${withWhom} is in progress — join when you’re ready.` : `${withWhom} begins ${formatCountdown(t.msUntilStart)}.`,
                time: t.isLive ? 'Now' : formatCountdown(t.msUntilStart).replace('in ', ''),
                tone: 'urgent',
                action: session.meeting_link ? (
                    <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition"
                    >
                        <Video className="size-3.5" /> Join now
                    </a>
                ) : (
                    <span className="text-ashen-400 text-xs">Your meeting link is being prepared…</span>
                ),
            });
        }

        if (session.status === 'confirmed') {
            items.push({
                key: `paid-${session.id}`,
                icon: ShieldCheck,
                title: 'Payment received',
                body: `Your payment was received and ${withWhom} is confirmed.`,
                time: 'Confirmed',
                tone: 'calm',
            });
        }

        if (session.status === 'pending') {
            items.push({
                key: `pending-${session.id}`,
                icon: CreditCard,
                title: 'Awaiting payment',
                body: `Finish your transfer to confirm ${withWhom}.`,
                time: 'Action needed',
                tone: 'urgent',
                action: (
                    <Link
                        href={`/bookings/${session.id}/pay`}
                        className="bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition"
                    >
                        <CreditCard className="size-3.5" /> Payment instructions
                    </Link>
                ),
            });
        }

        // A gentle reminder for sessions that aren't in the join window yet.
        if (!t.isOpen && !t.hasEnded) {
            items.push({
                key: `upcoming-${session.id}`,
                icon: CalendarHeart,
                title: 'Upcoming session',
                body: `${withWhom} · ${session.scheduled_label}`,
                time: `Starts ${formatCountdown(t.msUntilStart)}`,
                tone: 'calm',
            });
        }
    });

    if (sessions.length === 0) {
        items.push({
            key: 'first-step',
            icon: Compass,
            title: 'Take your first step',
            body: 'Whenever you’re ready, a licensed specialist is here to help. Booking only takes a minute.',
            time: 'Tip',
            tone: 'calm',
        });
    }

    // The daily reflection always closes the list.
    items.push({ key: 'reflection', icon: Sparkles, title: 'Your daily reflection', body: quote, time: 'Today', tone: 'calm' });

    const tones: Record<NotificationItem['tone'], string> = {
        calm: 'bg-ashen-100 text-ashen-700',
        urgent: 'bg-ashen-800 text-ashen-50',
    };

    return (
        <div className="flex flex-1 flex-col lg:min-h-0">
            <header className="mb-8 shrink-0 md:mb-12 lg:mb-5">
                <h1 className="font-display text-ashen-800 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-4xl">
                    Notifications
                </h1>
                <p className="text-ashen-500 mt-3 text-lg lg:mt-2 lg:text-base">Your session updates and a daily reflection, all in one place.</p>
            </header>

            <div className="scrollbar-hide max-w-2xl space-y-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                {items.map((n) => (
                    <div key={n.key} className={`flex items-start gap-4 p-6 ${CARD}`}>
                        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tones[n.tone]}`}>
                            <n.icon className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-display text-ashen-800 text-base">{n.title}</p>
                                <span className="text-ashen-400 shrink-0 text-xs">{n.time}</span>
                            </div>
                            <p className="text-ashen-600 mt-1.5 text-sm leading-relaxed">{n.body}</p>
                            {n.action && <div className="mt-3">{n.action}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ============================ Profile view ============================ */

function ProfileView({ user }: { user: SharedData['auth']['user'] }) {
    const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="flex flex-1 flex-col lg:min-h-0">
            <header className="mb-8 shrink-0 md:mb-12 lg:mb-5">
                <h1 className="font-display text-ashen-800 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-4xl">
                    Your account
                </h1>
                <p className="text-ashen-500 mt-3 text-lg lg:mt-2 lg:text-base">Manage your details and how OurSanad works for you.</p>
            </header>

            <div className="scrollbar-hide max-w-2xl space-y-6 lg:min-h-0 lg:flex-1 lg:space-y-4 lg:overflow-y-auto lg:pr-1">
                <div className={`flex items-center gap-5 p-6 ${CARD}`}>
                    <div className="ring-ashen-200 size-16 shrink-0 overflow-hidden rounded-full ring-2">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="bg-ashen-100 text-ashen-700 font-display flex h-full w-full items-center justify-center text-xl">
                                {initials}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-display text-ashen-800 truncate text-xl">{user.name}</p>
                        <p className="text-ashen-500 truncate text-sm">{user.email}</p>
                    </div>
                </div>

                <div className={`overflow-hidden ${CARD}`}>
                    <ProfileRow icon={UserRound} label="Edit profile" hint="Name & email address" href="/settings/profile" />
                    <div className="border-ashen-300/20 mx-6 border-t" />
                    <ProfileRow icon={Lock} label="Password" hint="Update your password" href="/settings/password" />
                </div>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="border-ashen-300/50 text-ashen-600 hover:border-ashen-300 hover:text-ashen-800 bg-ashen-50/60 flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-medium transition active:scale-[0.99]"
                >
                    <LogOut className="size-4" />
                    Log out
                </Link>
            </div>
        </div>
    );
}

function ProfileRow({ icon: Icon, label, hint, href }: { icon: ComponentType<{ className?: string }>; label: string; hint: string; href: string }) {
    return (
        <Link href={href} prefetch className="group hover:bg-ashen-50/70 flex items-center gap-4 px-6 py-4 transition">
            <span className="bg-ashen-100 text-ashen-700 flex size-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="text-ashen-800 block text-sm font-semibold">{label}</span>
                <span className="text-ashen-400 block text-xs">{hint}</span>
            </span>
            <ArrowUpRight className="text-ashen-300 size-4 transition group-hover:translate-x-0.5" />
        </Link>
    );
}

/* ============================ Top navigation ============================ */

function TopNav({
    user,
    isHidden,
    view,
    onNavigate,
    onReveal,
}: {
    user: SharedData['auth']['user'];
    isHidden: boolean;
    view: View;
    onNavigate: (view: View) => void;
    onReveal: () => void;
}) {
    const tabs: { label: string; view: View }[] = [
        { label: 'My sessions', view: 'sessions' },
        { label: 'Specialists', view: 'specialists' },
    ];

    const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <header
            onMouseEnter={onReveal}
            className={`border-ashen-300/25 sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b px-5 backdrop-blur-xl transition-transform duration-300 ease-out md:px-12 lg:px-16 ${
                isHidden ? '-translate-y-full' : 'translate-y-0'
            }`}
        >
            <button type="button" onClick={() => onNavigate('sessions')} className="text-ashen-700">
                <SanadLogo markClassName="h-8 w-auto" wordClassName="text-2xl sm:text-[1.65rem]" />
            </button>

            <nav className="hidden flex-1 items-center justify-center gap-5 sm:flex sm:gap-9">
                {tabs.map((tab) => {
                    const active = view === tab.view;
                    return (
                        <button
                            key={tab.view}
                            type="button"
                            onClick={() => onNavigate(tab.view)}
                            className={`relative text-[15px] font-medium transition ${active ? 'text-ashen-700' : 'text-ashen-500 hover:text-ashen-700'}`}
                        >
                            {tab.label}
                            {active && (
                                <motion.span
                                    layoutId="nav-underline"
                                    className="bg-ashen-600 absolute -bottom-[27px] left-0 h-0.5 w-full rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="flex items-center gap-2">
                <Link
                    href="/emergency"
                    className="border-ashen-300/70 text-ashen-700 hover:bg-ashen-50 bg-ashen-50/60 mr-1 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition active:scale-95"
                >
                    <LifeBuoy className="size-4" />
                    <span className="hidden sm:inline">Urgent help</span>
                </Link>
                <button
                    type="button"
                    onClick={() => onNavigate('notifications')}
                    aria-label="Notifications"
                    className={`hover:bg-ashen-50/70 relative flex size-10 items-center justify-center rounded-full transition ${
                        view === 'notifications' ? 'text-ashen-700 bg-ashen-50/80' : 'text-ashen-500 hover:text-ashen-700'
                    }`}
                >
                    <Bell className="size-5" />
                    <span className="bg-ashen-600 ring-ashen-50 absolute top-2.5 right-2.5 size-2 rounded-full ring-2" />
                </button>
                <button
                    type="button"
                    onClick={() => onNavigate('profile')}
                    aria-label="Your profile"
                    className={`block size-10 overflow-hidden rounded-full ring-2 transition ${
                        view === 'profile' ? 'ring-ashen-500' : 'ring-ashen-200 hover:ring-ashen-400'
                    }`}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="bg-ashen-100 text-ashen-700 flex h-full w-full items-center justify-center text-sm font-semibold">
                            {initials}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}

/* ============================ Cards ============================ */

function BookNow({ count, onFind }: { count: number; onFind: () => void }) {
    return (
        <div className="from-ashen-700 to-ashen-800 relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-white shadow-[0_22px_50px_-20px_rgba(56,57,53,0.6)] lg:p-6">
            <div aria-hidden className="bg-ashen-50/10 pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full blur-3xl" />
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">Ready when you are</p>
            <h3 className="font-display mt-3 text-[1.8rem] leading-snug lg:mt-2 lg:text-[1.45rem]">Talk to someone who can help</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80 lg:mt-2 lg:text-sm">
                Book a private session with a licensed specialist — in Arabic, English, or French. It only takes a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                    type="button"
                    onClick={onFind}
                    className="group text-ashen-800 bg-ashen-50/80 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    Find your specialist
                    <span className="bg-ashen-100 rounded-full p-1 transition-transform group-hover:rotate-45">
                        <ArrowUpRight className="size-4" />
                    </span>
                </button>
                {count > 0 && <span className="text-xs font-medium text-white/70">{count} available now</span>}
            </div>
        </div>
    );
}

/**
 * The affirmation, standing where the dashboard photo used to.
 *
 * It takes the removed portrait's slot and shape: a tall dark panel down the side
 * of the page. The panel is dark for the same reason the photo was — the split
 * needs one anchor of weight to read against, and a page of light glass alone
 * goes flat. It was previously a tan card (`bg-beige`), the last of the warm
 * palette in the client app.
 */
function DailyIntention({ portrait = false }: { portrait?: boolean }) {
    const [index, setIndex] = useState(0);

    return (
        <div
            className={`sanad-card-dark relative flex flex-col overflow-hidden ${
                portrait ? 'h-full rounded-[1.75rem] p-6 xl:p-7' : 'rounded-2xl p-8 lg:p-5'
            }`}
        >
            {/* the olive, quietly — the same treeline that stands behind the team */}
            {portrait && (
                <>
                    <OliveHorizon opacity="opacity-[0.12]" />
                    <OliveDrops drops={EDGE_DROPS} tone="light" />
                </>
            )}

            <div className={`relative z-10 flex flex-col ${portrait ? 'h-full' : ''}`}>
                {portrait && <p className="text-ashen-400 shrink-0 text-[11px] font-semibold tracking-[0.2em] uppercase">Daily intention</p>}

                <p
                    className={`font-display text-ashen-100 leading-relaxed italic ${
                        portrait ? 'mt-5 flex-1 text-base leading-relaxed xl:text-lg' : 'text-xl md:text-2xl lg:text-lg'
                    }`}
                >
                    “{INTENTIONS[index]}”
                </p>

                <div className={`flex shrink-0 items-center gap-2.5 ${portrait ? 'mt-5' : 'mt-8 lg:mt-4'}`}>
                    <button
                        type="button"
                        onClick={() => setIndex((i) => (i + 1) % INTENTIONS.length)}
                        className="border-ashen-300/40 text-ashen-100 hover:bg-ashen-100/10 inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-xs font-medium transition hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                        New intention
                    </button>
                    <button
                        type="button"
                        aria-label="Share intention"
                        onClick={() => navigator.clipboard?.writeText(INTENTIONS[index])}
                        className="border-ashen-300/30 text-ashen-300 hover:text-ashen-100 hover:bg-ashen-100/10 flex size-9 shrink-0 items-center justify-center rounded-full border transition hover:-translate-y-0.5 active:scale-95"
                    >
                        <Share2 className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function NextSessionCard({ session, firstName, onFind }: { session: UpcomingSession | null; firstName: string; onFind: () => void }) {
    if (!session) {
        return (
            <div className={`p-6 ${CARD}`}>
                <SectionLabel>Next session</SectionLabel>
                <div className="mt-4 flex items-center gap-4">
                    <div className="bg-ashen-100 text-ashen-700 flex size-14 shrink-0 items-center justify-center rounded-xl">
                        <CalendarHeart className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-display text-ashen-800 text-base leading-snug">No sessions yet, {firstName}</p>
                        <p className="text-ashen-400 text-sm">Booking takes under a minute.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onFind}
                        aria-label="Find a specialist"
                        className="bg-ashen-700 hover:bg-ashen-800 flex size-11 shrink-0 items-center justify-center rounded-full text-white transition hover:-translate-y-0.5 active:scale-95"
                    >
                        <ArrowUpRight className="size-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-6 ${CARD}`}>
            <SectionLabel>Next session</SectionLabel>
            <div className="mt-4 flex items-center gap-4">
                <div className="bg-ashen-100 text-ashen-700 flex size-16 shrink-0 flex-col items-center justify-center rounded-xl leading-none">
                    <span className="text-[10px] font-semibold tracking-wide uppercase">{session.scheduled_month}</span>
                    <span className="font-display mt-1 text-2xl">{session.scheduled_day}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-display text-ashen-800 text-lg leading-snug">
                        {session.service_name} with {session.practitioner_name}
                    </p>
                    <p className="text-ashen-400 mt-1.5 flex items-center gap-1.5 text-sm">
                        <Clock className="size-4" />
                        {session.scheduled_time}
                    </p>
                </div>
            </div>

            {session.status === 'confirmed' && <SessionJoin session={session} />}

            {session.status === 'pending' && (
                <div className="border-ashen-200/60 mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-ashen-500 inline-flex items-center gap-1.5 text-xs font-medium">
                        <span className="bg-ashen-500 size-1.5 rounded-full" /> Awaiting payment
                    </span>
                    <Link
                        href={`/bookings/${session.id}/pay`}
                        className="bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5 active:scale-95"
                    >
                        <CreditCard className="size-3.5" /> Payment instructions
                    </Link>
                </div>
            )}
        </div>
    );
}

/**
 * The "Join your session" control. The link is one tap and always in the same
 * place, but the button only wakes up 15 minutes before the session and stays
 * live until it ends — before that, a calm live countdown sets expectations.
 */
const JOIN_OPENS_MINUTES_BEFORE = 15;

/** A clock that re-renders every second so countdowns and join windows stay live. */
function useNow(): number {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);
    return now;
}

interface SessionTiming {
    isOpen: boolean;
    isLive: boolean;
    hasEnded: boolean;
    msUntilStart: number;
}

/** Where a session sits relative to its 15-min-before → end join window. */
function sessionTiming(session: UpcomingSession, now: number): SessionTiming {
    const start = new Date(session.scheduled_iso).getTime();
    const opensAt = start - JOIN_OPENS_MINUTES_BEFORE * 60_000;
    const endsAt = start + (session.duration_minutes ?? 60) * 60_000;
    return {
        isOpen: now >= opensAt && now <= endsAt,
        isLive: now >= start && now <= endsAt,
        hasEnded: now > endsAt,
        msUntilStart: start - now,
    };
}

function SessionJoin({ session }: { session: UpcomingSession }) {
    const now = useNow();
    const { isOpen, isLive, hasEnded, msUntilStart } = sessionTiming(session, now);

    if (hasEnded) {
        return <div className="border-ashen-200/60 text-ashen-400 mt-4 border-t pt-4 text-xs font-medium">This session has ended.</div>;
    }

    // The join window is open — wake the button up (or, if the specialist hasn't
    // added the room yet, reassure the client it's on its way).
    if (isOpen) {
        if (!session.meeting_link) {
            return (
                <div className="border-ashen-200/60 text-ashen-500 mt-4 flex items-center gap-2 border-t pt-4 text-xs font-medium">
                    <span className="bg-ashen-500 size-1.5 animate-pulse rounded-full" />
                    Your meeting link is being prepared — it’ll appear here any moment.
                </div>
            );
        }

        return (
            <a
                href={session.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-ashen-700 hover:bg-ashen-800 mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(99,128,101,0.5)] transition hover:-translate-y-0.5 active:scale-[0.99]"
                style={{ animation: 'joinPulse 2.4s ease-in-out infinite' }}
            >
                <Video className="size-4" />
                {isLive ? 'Join now — your session is live' : 'Join now'}
                <style>{`@keyframes joinPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(99,128,101,0.45); }
                    50% { box-shadow: 0 0 0 10px rgba(99,128,101,0); }
                }`}</style>
            </a>
        );
    }

    // Before the window: a calm, locked state with a live countdown.
    return (
        <div className="border-ashen-200/60 mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-ashen-500 inline-flex items-center gap-1.5 text-xs font-medium">
                <Lock className="size-3.5" /> Join opens {JOIN_OPENS_MINUTES_BEFORE} min before
            </span>
            <span className="text-ashen-700 inline-flex items-center gap-1.5 text-xs font-semibold">
                <Clock className="size-3.5" /> Starts {formatCountdown(msUntilStart)}
            </span>
        </div>
    );
}

/** Turn a millisecond gap into a soft, human countdown: "in 3 days", "in 2h 14m". */
function formatCountdown(ms: number): string {
    if (ms <= 0) {
        return 'now';
    }
    const totalMinutes = Math.floor(ms / 60_000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days >= 1) {
        return `in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
    if (hours >= 1) {
        return `in ${hours}h ${minutes}m`;
    }
    if (minutes >= 1) {
        return `in ${minutes}m`;
    }
    return 'in less than a minute';
}

/** A compact row for an additional upcoming session, with a live, status-aware control. */
function UpcomingSessionRow({ session }: { session: UpcomingSession }) {
    const now = useNow();
    const { isOpen, msUntilStart } = sessionTiming(session, now);

    return (
        <div className={`flex items-center gap-3.5 p-4 ${CARD}`}>
            <div className="bg-ashen-100 text-ashen-700 flex size-12 shrink-0 flex-col items-center justify-center rounded-xl leading-none">
                <span className="text-[9px] font-semibold tracking-wide uppercase">{session.scheduled_month}</span>
                <span className="font-display mt-0.5 text-xl">{session.scheduled_day}</span>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-ashen-800 truncate text-sm font-semibold">
                    {session.service_name} with {session.practitioner_name}
                </p>
                <p className="text-ashen-400 mt-0.5 flex items-center gap-1.5 text-xs">
                    <Clock className="size-3.5" />
                    {session.scheduled_time}
                </p>
            </div>

            {session.status === 'pending' ? (
                <Link
                    href={`/bookings/${session.id}/pay`}
                    className="border-ashen-300 text-ashen-700 hover:bg-ashen-50 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
                >
                    <CreditCard className="size-3.5" /> Pay
                </Link>
            ) : isOpen && session.meeting_link ? (
                <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Join session"
                    className="bg-ashen-700 hover:bg-ashen-800 flex size-9 shrink-0 items-center justify-center rounded-full text-white transition"
                >
                    <Video className="size-4" />
                </a>
            ) : (
                <span className="text-ashen-400 shrink-0 text-xs font-medium whitespace-nowrap">{formatCountdown(msUntilStart)}</span>
            )}
        </div>
    );
}

function QuickTile({
    icon: Icon,
    title,
    subtitle,
    href,
    onClick,
    progress,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
    href?: string;
    onClick?: () => void;
    progress?: number;
}) {
    const inner = (
        <>
            <span className="bg-ashen-100 text-ashen-700 flex size-10 items-center justify-center rounded-full transition group-hover:scale-105">
                <Icon className="size-5" />
            </span>
            <p className="text-ashen-800 mt-4 text-sm font-semibold">{title}</p>
            <p className="text-ashen-400 truncate text-xs">{subtitle}</p>
            {progress != null && (
                <div className="bg-ashen-100 mt-4 h-1.5 w-full overflow-hidden rounded-full">
                    <div className="bg-ashen-500 h-full rounded-full" style={{ width: `${Math.round(Math.max(0.08, progress) * 100)}%` }} />
                </div>
            )}
        </>
    );
    const className = `group hover:bg-ashen-50/70 block p-6 text-left transition active:scale-[0.98] ${CARD}`;

    return onClick ? (
        <button type="button" onClick={onClick} className={className}>
            {inner}
        </button>
    ) : (
        <Link href={href!} prefetch className={className}>
            {inner}
        </Link>
    );
}

function ResourceRow({ icon: Icon, label, href }: { icon: ComponentType<{ className?: string }>; label: string; href: string }) {
    return (
        <a href={href} className="group border-ashen-300/25 hover:border-ashen-300/50 flex items-center gap-4 border-b py-4 transition lg:py-2.5">
            <span className="bg-ashen-100 text-ashen-700 flex size-10 items-center justify-center rounded-full">
                <Icon className="size-5" />
            </span>
            <span className="text-ashen-700 flex-1 text-[15px] font-medium">{label}</span>
            <ArrowUpRight className="text-ashen-300 size-4 transition group-hover:translate-x-0.5" />
        </a>
    );
}

/* ============================ Small shared bits ============================ */

function ColumnHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <h2 className="font-display text-ashen-700 text-[1.7rem] tracking-tight lg:text-[1.35rem]">{title}</h2>
            {action}
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-ashen-400 text-[11px] font-semibold tracking-[0.2em] uppercase">{children}</p>;
}
