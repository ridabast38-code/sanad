import { matchesPreferences, SpecialistCard, type MatchPreferences, type Specialist } from '@/components/specialist-card';
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
import { useEffect, useState, type ComponentType } from 'react';

/** The portrait behind the sanctuary panel (compressed). Set to null to show the placeholder. */
const SANCTUARY_PHOTO: string | null = '/images/dashboard.jpg';

/** Soft tonal card — white surface, gentle diffused shadow, generous radius. */
const CARD = 'rounded-2xl bg-white shadow-[0_8px_30px_-14px_rgba(26,28,28,0.14)]';

/** Spring used for the photo's glide between views. */
const SLIDE = { type: 'spring', stiffness: 220, damping: 32 } as const;

/** Gentle affirmations in Sanad's voice — shown on the daily-intention card. */
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
    preferences: MatchPreferences;
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

export default function ClientHome({ practitioners, upcomingSessions, preferences }: HomeProps) {
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

    // Photo sits on the left for sessions/notifications, right for specialists/profile —
    // always a clean full-height column (never a cropped banner).
    const photoSecond = view === 'specialists' || view === 'profile';

    return (
        <>
            <Head title={view.charAt(0).toUpperCase() + view.slice(1)} />

            <div className="bg-cream text-ashen-800 flex min-h-screen flex-col">
                {/* hovering the top edge always brings the nav back */}
                <div aria-hidden onMouseEnter={() => setNavHidden(false)} className="fixed inset-x-0 top-0 z-30 h-5" />

                <TopNav user={auth.user} isHidden={navHidden} view={view} onNavigate={navigate} onReveal={() => setNavHidden(false)} />

                <div className="flex flex-1 flex-col lg:flex-row">
                    {/* Portrait — glides left↔right between views */}
                    <motion.aside
                        layout
                        transition={SLIDE}
                        className={`${photoSecond ? 'lg:order-2' : 'lg:order-1'} lg:w-[18rem] lg:shrink-0 xl:w-[20rem]`}
                    >
                        <div className="h-52 sm:h-72 lg:sticky lg:top-0 lg:h-screen">
                            <SanctuaryColumn />
                        </div>
                    </motion.aside>

                    {/* Working area */}
                    <motion.main
                        layout
                        transition={SLIDE}
                        className={`${photoSecond ? 'lg:order-1' : 'lg:order-2'} relative flex-1 px-6 pt-10 pb-28 md:px-12 md:py-14 lg:px-16 lg:py-16 xl:px-24`}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                            >
                                {view === 'sessions' && (
                                    <SessionsView
                                        firstName={firstName}
                                        sessions={upcomingSessions}
                                        specialistCount={practitioners.length}
                                        onFindSpecialist={() => navigate('specialists')}
                                    />
                                )}
                                {view === 'specialists' && <SpecialistsView practitioners={practitioners} preferences={preferences} />}
                                {view === 'notifications' && <NotificationsView sessions={upcomingSessions} />}
                                {view === 'profile' && <ProfileView user={auth.user} />}
                            </motion.div>
                        </AnimatePresence>
                    </motion.main>
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
        <div className="border-ashen-300/30 bg-cream/95 fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border p-1.5 shadow-[0_10px_30px_-10px_rgba(26,28,28,0.3)] backdrop-blur">
            <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous section"
                className="text-ashen-500 hover:text-sage-700 flex size-9 items-center justify-center rounded-full transition hover:bg-white active:scale-90"
            >
                <ChevronLeft className="size-5" />
            </button>
            <span className="text-ashen-600 min-w-[7rem] text-center text-sm font-medium">{VIEW_LABELS[current]}</span>
            <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next section"
                className="text-ashen-500 hover:text-sage-700 flex size-9 items-center justify-center rounded-full transition hover:bg-white active:scale-90"
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
        <>
            <header className="mb-8 md:mb-12">
                <h1 className="font-display text-sage-800 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
                    Welcome back, {firstName}
                </h1>
                <p className="text-ashen-500 mt-3 text-base sm:text-lg">Your sanctuary is ready. Take a breath before you begin.</p>
            </header>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-20 xl:gap-x-28">
                <section className="space-y-8 md:space-y-10">
                    <ColumnHeader title="Find support" />
                    <BookNow count={specialistCount} onFind={onFindSpecialist} />
                    <Link
                        href="/emergency"
                        className="border-sage-200/70 bg-sage-50/60 hover:bg-sage-50 group flex items-center gap-4 rounded-2xl border p-5 transition active:scale-[0.99]"
                    >
                        <span className="bg-sage-100 text-sage-700 flex size-11 shrink-0 items-center justify-center rounded-full">
                            <LifeBuoy className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="text-ashen-800 block text-sm font-semibold">Going through something right now?</span>
                            <span className="text-ashen-500 block text-xs">Get gentle, immediate support — one step at a time.</span>
                        </span>
                        <ArrowUpRight className="size-4 text-amber-400 transition group-hover:translate-x-0.5" />
                    </Link>
                    <div className="space-y-5">
                        <SectionLabel>Daily intention</SectionLabel>
                        <DailyIntention />
                    </div>
                </section>

                <section className="space-y-8 md:space-y-10">
                    <ColumnHeader
                        title="Your Sanctuary"
                        action={
                            <button
                                type="button"
                                onClick={onFindSpecialist}
                                className="text-sage-700 hover:text-sage-900 text-sm font-medium transition"
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
                        <ResourceRow icon={FileText} label="How Sanad works" href="/how-it-works" />
                        <ResourceRow icon={BookOpen} label="Preparing for your first session" href="/how-it-works#first-session" />
                    </div>
                </section>
            </div>
        </>
    );
}

/* ============================ Specialists view ============================ */

function SpecialistsView({ practitioners, preferences }: { practitioners: Specialist[]; preferences: MatchPreferences }) {
    return (
        <>
            <header className="mb-8 md:mb-12">
                <span className="border-sage-200 text-sage-700 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
                    <Users className="size-3.5" /> {practitioners.length} available
                </span>
                <h1 className="font-display text-sage-800 mt-4 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
                    Find your <span className="italic">specialist</span>
                </h1>
                <p className="text-ashen-500 mt-4 flex max-w-2xl items-start gap-2 text-[15px] leading-relaxed">
                    <ShieldCheck className="text-sage-600 mt-0.5 size-4 shrink-0" />
                    Every Sanad psychologist is a licensed clinical psychologist — real, confidential care.
                </p>
            </header>

            {practitioners.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {practitioners.map((specialist) => (
                        <SpecialistCard key={specialist.id} specialist={specialist} matched={matchesPreferences(specialist, preferences)} />
                    ))}
                </div>
            ) : (
                <div className="border-sage-300/60 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white/40 p-12 text-center">
                    <p className="font-display text-ashen-700 text-xl">Our specialists are on their way</p>
                    <p className="text-ashen-500 max-w-sm text-sm">We’re carefully selecting the right people. Check back soon.</p>
                </div>
            )}
        </>
    );
}

/* ============================ Notifications view ============================ */

interface NotificationItem {
    key: string;
    icon: ComponentType<{ className?: string }>;
    title: string;
    body: string;
    time: string;
    tone: 'sage' | 'amber';
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
                tone: 'amber',
                action: session.meeting_link ? (
                    <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-sage-700 hover:bg-sage-800 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition"
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
                tone: 'sage',
            });
        }

        if (session.status === 'pending') {
            items.push({
                key: `pending-${session.id}`,
                icon: CreditCard,
                title: 'Awaiting payment',
                body: `Finish your transfer to confirm ${withWhom}.`,
                time: 'Action needed',
                tone: 'amber',
                action: (
                    <Link
                        href={`/bookings/${session.id}/pay`}
                        className="bg-sage-700 hover:bg-sage-800 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition"
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
                tone: 'sage',
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
            tone: 'sage',
        });
    }

    // The daily reflection always closes the list.
    items.push({ key: 'reflection', icon: Sparkles, title: 'Your daily reflection', body: quote, time: 'Today', tone: 'sage' });

    const tones: Record<NotificationItem['tone'], string> = {
        sage: 'bg-sage-100 text-sage-700',
        amber: 'bg-amber-100 text-amber-600',
    };

    return (
        <>
            <header className="mb-8 md:mb-12">
                <h1 className="font-display text-sage-800 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">Notifications</h1>
                <p className="text-ashen-500 mt-3 text-lg">Your session updates and a daily reflection, all in one place.</p>
            </header>

            <div className="max-w-2xl space-y-4">
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
        </>
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
        <>
            <header className="mb-8 md:mb-12">
                <h1 className="font-display text-sage-800 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">Your account</h1>
                <p className="text-ashen-500 mt-3 text-lg">Manage your details and how Sanad works for you.</p>
            </header>

            <div className="max-w-2xl space-y-6">
                <div className={`flex items-center gap-5 p-6 ${CARD}`}>
                    <div className="ring-sage-200 size-16 shrink-0 overflow-hidden rounded-full ring-2">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="bg-sage-100 text-sage-700 font-display flex h-full w-full items-center justify-center text-xl">
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
                    className="border-ashen-300/50 text-ashen-600 hover:border-ashen-300 hover:text-ashen-800 flex w-full items-center justify-center gap-2 rounded-2xl border bg-white/60 py-3.5 text-sm font-medium transition active:scale-[0.99]"
                >
                    <LogOut className="size-4" />
                    Log out
                </Link>
            </div>
        </>
    );
}

function ProfileRow({ icon: Icon, label, hint, href }: { icon: ComponentType<{ className?: string }>; label: string; hint: string; href: string }) {
    return (
        <Link href={href} prefetch className="group hover:bg-sage-50/70 flex items-center gap-4 px-6 py-4 transition">
            <span className="bg-sage-100 text-sage-700 flex size-10 shrink-0 items-center justify-center rounded-full">
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
            className={`border-ashen-300/30 bg-cream sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b px-5 transition-transform duration-300 ease-out md:px-12 lg:px-16 ${
                isHidden ? '-translate-y-full' : 'translate-y-0'
            }`}
        >
            <button
                type="button"
                onClick={() => onNavigate('sessions')}
                className="font-display text-sage-700 text-2xl tracking-tight sm:text-[1.65rem]"
            >
                Sanad
            </button>

            <nav className="hidden flex-1 items-center justify-center gap-5 sm:flex sm:gap-9">
                {tabs.map((tab) => {
                    const active = view === tab.view;
                    return (
                        <button
                            key={tab.view}
                            type="button"
                            onClick={() => onNavigate(tab.view)}
                            className={`relative text-[15px] font-medium transition ${active ? 'text-sage-700' : 'text-ashen-500 hover:text-sage-700'}`}
                        >
                            {tab.label}
                            {active && (
                                <motion.span
                                    layoutId="nav-underline"
                                    className="bg-sage-600 absolute -bottom-[27px] left-0 h-0.5 w-full rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="flex items-center gap-2">
                <Link
                    href="/emergency"
                    className="border-sage-300/70 text-sage-700 hover:bg-sage-50 mr-1 inline-flex items-center gap-1.5 rounded-full border bg-white/60 px-3.5 py-2 text-sm font-semibold transition active:scale-95"
                >
                    <LifeBuoy className="size-4" />
                    <span className="hidden sm:inline">Urgent help</span>
                </Link>
                <button
                    type="button"
                    onClick={() => onNavigate('notifications')}
                    aria-label="Notifications"
                    className={`relative flex size-10 items-center justify-center rounded-full transition hover:bg-white ${
                        view === 'notifications' ? 'text-sage-700 bg-white' : 'text-ashen-500 hover:text-sage-700'
                    }`}
                >
                    <Bell className="size-5" />
                    <span className="bg-sage-600 ring-cream absolute top-2.5 right-2.5 size-2 rounded-full ring-2" />
                </button>
                <button
                    type="button"
                    onClick={() => onNavigate('profile')}
                    aria-label="Your profile"
                    className={`block size-10 overflow-hidden rounded-full ring-2 transition ${
                        view === 'profile' ? 'ring-sage-500' : 'ring-sage-200 hover:ring-sage-400'
                    }`}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="bg-sage-100 text-sage-700 flex h-full w-full items-center justify-center text-sm font-semibold">
                            {initials}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}

/* ============================ Left/banner photo ============================ */

function SanctuaryColumn() {
    return (
        <div className="from-ashen-700 to-ashen-900 relative h-full w-full overflow-hidden bg-gradient-to-b">
            {SANCTUARY_PHOTO && <img src={SANCTUARY_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_30%]" />}

            <div className="from-ashen-950/80 via-ashen-950/20 absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="from-sage-900/25 absolute inset-0 bg-gradient-to-tr via-transparent to-transparent mix-blend-soft-light" />

            {!SANCTUARY_PHOTO && (
                <div className="absolute inset-6 flex items-start justify-center rounded-2xl border border-dashed border-white/20 pt-10">
                    <span className="text-[11px] font-medium tracking-[0.2em] text-white/45 uppercase">Portrait photo</span>
                </div>
            )}

            <span
                className="absolute top-8 right-5 text-[11px] font-medium tracking-[0.4em] text-white/60 uppercase"
                style={{ writingMode: 'vertical-rl' }}
            >
                Stillness
            </span>

            <div className="absolute inset-x-0 bottom-0 p-8">
                <h2 className="font-display text-3xl leading-[1.15] text-white">
                    Quiet the mind,
                    <br />
                    find the path.
                </h2>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">
                    Your progress is a journey of a thousand small steps. Today is one of them.
                </p>
            </div>
        </div>
    );
}

/* ============================ Cards ============================ */

function BookNow({ count, onFind }: { count: number; onFind: () => void }) {
    return (
        <div className="from-sage-700 to-sage-800 relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-white shadow-[0_22px_50px_-20px_rgba(63,88,65,0.6)]">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">Ready when you are</p>
            <h3 className="font-display mt-3 text-[1.8rem] leading-snug">Talk to someone who can help</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80">
                Book a private session with a licensed specialist — in Arabic, English, or French. It only takes a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                    type="button"
                    onClick={onFind}
                    className="group text-sage-800 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    Find your specialist
                    <span className="bg-sage-100 rounded-full p-1 transition-transform group-hover:rotate-45">
                        <ArrowUpRight className="size-4" />
                    </span>
                </button>
                {count > 0 && <span className="text-xs font-medium text-white/70">{count} available now</span>}
            </div>
        </div>
    );
}

function DailyIntention() {
    const [index, setIndex] = useState(0);

    return (
        <div className="bg-beige/35 rounded-2xl p-8">
            <p className="font-display text-ashen-700 text-xl leading-relaxed italic md:text-2xl">“{INTENTIONS[index]}”</p>

            <div className="mt-8 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setIndex((i) => (i + 1) % INTENTIONS.length)}
                    className="border-sage-300 text-sage-700 hover:bg-sage-50 inline-flex items-center gap-2 rounded-full border bg-white/70 px-6 py-3 text-sm font-medium transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    New intention
                </button>
                <button
                    type="button"
                    aria-label="Share intention"
                    onClick={() => navigator.clipboard?.writeText(INTENTIONS[index])}
                    className="border-ashen-300/60 text-ashen-500 hover:text-sage-700 flex size-11 items-center justify-center rounded-full border bg-white/60 transition hover:-translate-y-0.5 active:scale-95"
                >
                    <Share2 className="size-4" />
                </button>
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
                    <div className="bg-sage-100 text-sage-700 flex size-14 shrink-0 items-center justify-center rounded-xl">
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
                        className="bg-sage-700 hover:bg-sage-800 flex size-11 shrink-0 items-center justify-center rounded-full text-white transition hover:-translate-y-0.5 active:scale-95"
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
                <div className="bg-sage-100 text-sage-700 flex size-16 shrink-0 flex-col items-center justify-center rounded-xl leading-none">
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
                <div className="border-sage-200/60 mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-ashen-500 inline-flex items-center gap-1.5 text-xs font-medium">
                        <span className="size-1.5 rounded-full bg-amber-400" /> Awaiting payment
                    </span>
                    <Link
                        href={`/bookings/${session.id}/pay`}
                        className="bg-sage-700 hover:bg-sage-800 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5 active:scale-95"
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
        return <div className="border-sage-200/60 text-ashen-400 mt-4 border-t pt-4 text-xs font-medium">This session has ended.</div>;
    }

    // The join window is open — wake the button up (or, if the specialist hasn't
    // added the room yet, reassure the client it's on its way).
    if (isOpen) {
        if (!session.meeting_link) {
            return (
                <div className="border-sage-200/60 text-ashen-500 mt-4 flex items-center gap-2 border-t pt-4 text-xs font-medium">
                    <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
                    Your meeting link is being prepared — it’ll appear here any moment.
                </div>
            );
        }

        return (
            <a
                href={session.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-sage-700 hover:bg-sage-800 mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(99,128,101,0.5)] transition hover:-translate-y-0.5 active:scale-[0.99]"
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
        <div className="border-sage-200/60 mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-ashen-500 inline-flex items-center gap-1.5 text-xs font-medium">
                <Lock className="size-3.5" /> Join opens {JOIN_OPENS_MINUTES_BEFORE} min before
            </span>
            <span className="text-sage-700 inline-flex items-center gap-1.5 text-xs font-semibold">
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
            <div className="bg-sage-100 text-sage-700 flex size-12 shrink-0 flex-col items-center justify-center rounded-xl leading-none">
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
                    className="border-sage-300 text-sage-700 hover:bg-sage-50 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
                >
                    <CreditCard className="size-3.5" /> Pay
                </Link>
            ) : isOpen && session.meeting_link ? (
                <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Join session"
                    className="bg-sage-700 hover:bg-sage-800 flex size-9 shrink-0 items-center justify-center rounded-full text-white transition"
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
            <span className="bg-sage-100 text-sage-700 flex size-10 items-center justify-center rounded-full transition group-hover:scale-105">
                <Icon className="size-5" />
            </span>
            <p className="text-ashen-800 mt-4 text-sm font-semibold">{title}</p>
            <p className="text-ashen-400 truncate text-xs">{subtitle}</p>
            {progress != null && (
                <div className="bg-sage-100 mt-4 h-1.5 w-full overflow-hidden rounded-full">
                    <div className="bg-sage-500 h-full rounded-full" style={{ width: `${Math.round(Math.max(0.08, progress) * 100)}%` }} />
                </div>
            )}
        </>
    );
    const className = `group hover:bg-sage-50/70 block p-6 text-left transition active:scale-[0.98] ${CARD}`;

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
        <a href={href} className="group border-ashen-300/25 hover:border-ashen-300/50 flex items-center gap-4 border-b py-4 transition">
            <span className="bg-sage-100 text-sage-700 flex size-10 items-center justify-center rounded-full">
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
            <h2 className="font-display text-sage-700 text-[1.7rem] tracking-tight">{title}</h2>
            {action}
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-ashen-400 text-[11px] font-semibold tracking-[0.2em] uppercase">{children}</p>;
}
