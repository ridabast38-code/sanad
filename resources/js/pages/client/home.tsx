import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Bell, BookOpen, CalendarCheck, CalendarHeart, Clock, Compass, FileText, Share2, Video } from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';

/** The portrait behind the left sanctuary column (compressed). Set to null to show the placeholder. */
const SANCTUARY_PHOTO: string | null = '/images/dashboard.jpg';

/** Soft tonal card — white surface, gentle diffused shadow, generous radius. */
const CARD = 'rounded-2xl bg-white shadow-[0_8px_30px_-14px_rgba(26,28,28,0.14)]';

/** Gentle affirmations in Sanad's voice — shown on the daily-intention card. */
const INTENTIONS = [
    'Today, I will permit myself to rest without guilt, and acknowledge my progress, no matter how small.',
    'Asking for support is not weakness — it is the first brave step toward myself.',
    'I have carried enough alone. Today, I am allowed to share the weight.',
    'Healing is not a straight line. Every small step still counts as forward.',
];

interface HomeProps {
    practitioners: { id: number }[];
    upcomingSession: UpcomingSession | null;
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
    meeting_link: string | null;
    status: string;
}

export default function ClientHome({ practitioners, upcomingSession, stats }: HomeProps) {
    const { auth } = usePage<SharedData>().props;
    const rawFirstName = auth.user.name.split(' ')[0];
    const firstName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1);

    // Hide the nav on the way down (revealing the full photo), bring it back on the way up.
    const [navHidden, setNavHidden] = useState(false);
    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            if (y < 120) {
                setNavHidden(false); // always show near the top
            } else if (y > last + 24) {
                setNavHidden(true); // hide only after a deliberate scroll down
                last = y;
            } else if (y < last - 24) {
                setNavHidden(false); // reveal on a deliberate scroll up
                last = y;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="Home" />

            <div className="bg-cream text-ashen-800 flex min-h-screen flex-col">
                <TopNav user={auth.user} isHidden={navHidden} />

                <div className="flex flex-1 flex-col lg:flex-row">
                    {/* ===== Left — narrow, tall, full-bleed portrait ===== */}
                    <aside className="lg:w-[18rem] lg:shrink-0 xl:w-[20rem]">
                        <div className="h-80 lg:sticky lg:top-0 lg:h-screen">
                            <SanctuaryColumn />
                        </div>
                    </aside>

                    {/* ===== Right — the working area, generously spaced ===== */}
                    <main className="flex-1 px-6 py-12 md:px-12 md:py-14 lg:px-16 lg:py-16 xl:px-24">
                        <header className="mb-16 md:mb-20">
                            <h1 className="font-display text-sage-800 text-4xl leading-tight tracking-tight md:text-5xl">
                                Welcome back, {firstName}
                            </h1>
                            <p className="text-ashen-500 mt-3 text-lg">Your sanctuary is ready. Take a breath before you begin.</p>
                        </header>

                        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-x-20 xl:gap-x-28">
                            {/* Find support — booking is the loud, primary action */}
                            <section className="space-y-8 md:space-y-10">
                                <ColumnHeader title="Find support" />
                                <BookNow count={practitioners.length} />
                                <div className="space-y-5">
                                    <SectionLabel>Daily intention</SectionLabel>
                                    <DailyIntention />
                                </div>
                            </section>

                            {/* Your Sanctuary */}
                            <section className="space-y-8 md:space-y-10">
                                <ColumnHeader
                                    title="Your Sanctuary"
                                    action={
                                        <Link
                                            href="/specialists"
                                            prefetch
                                            className="text-sage-700 hover:text-sage-900 text-sm font-medium transition"
                                        >
                                            View all
                                        </Link>
                                    }
                                />
                                <NextSessionCard session={upcomingSession} firstName={firstName} />
                                <div className="grid grid-cols-2 gap-6">
                                    <QuickTile
                                        icon={Compass}
                                        title="Find a specialist"
                                        subtitle={`${practitioners.length} available`}
                                        href="/specialists"
                                        progress={1}
                                    />
                                    <QuickTile
                                        icon={CalendarCheck}
                                        title="My sessions"
                                        subtitle={`${stats.completed} completed`}
                                        href="/dashboard"
                                        progress={stats.completed + stats.upcoming > 0 ? stats.completed / (stats.completed + stats.upcoming) : 0.1}
                                    />
                                </div>
                                <div className="space-y-5">
                                    <SectionLabel>Quick resources</SectionLabel>
                                    <ResourceRow icon={FileText} label="How Sanad works" href="/#support" />
                                    <ResourceRow icon={BookOpen} label="Preparing for your first session" href="/#approaches" />
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

/* ============================ Top navigation ============================ */

function TopNav({ user, isHidden }: { user: SharedData['auth']['user']; isHidden: boolean }) {
    const links = [
        { label: 'Find a specialist', href: '/specialists', active: false },
        { label: 'My sessions', href: '/dashboard', active: true },
        { label: 'Resources', href: '#resources', active: false },
    ];

    const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <header
            className={`border-ashen-300/30 bg-cream sticky top-0 z-40 flex h-20 items-center justify-between border-b px-6 transition-transform duration-300 ease-out md:px-12 lg:px-16 ${
                isHidden ? '-translate-y-full' : 'translate-y-0'
            }`}
        >
            <Link href="/dashboard" className="font-display text-sage-700 text-[1.65rem] tracking-tight">
                Sanad
            </Link>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
                {links.map((link) =>
                    link.href.startsWith('#') ? (
                        <a key={link.label} href={link.href} className="text-ashen-500 hover:text-sage-700 text-[15px] font-medium transition">
                            {link.label}
                        </a>
                    ) : (
                        <Link
                            key={link.label}
                            href={link.href}
                            prefetch
                            className={`relative text-[15px] font-medium transition ${link.active ? 'text-sage-700' : 'text-ashen-500 hover:text-sage-700'}`}
                        >
                            {link.label}
                            {link.active && <span className="bg-sage-600 absolute -bottom-[27px] left-0 h-0.5 w-full rounded-full" />}
                        </Link>
                    ),
                )}
            </nav>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="text-ashen-500 hover:text-sage-700 relative flex size-10 items-center justify-center rounded-full transition hover:bg-white"
                >
                    <Bell className="size-5" />
                    <span className="bg-sage-600 ring-cream absolute top-2.5 right-2.5 size-2 rounded-full ring-2" />
                </button>
                <Link
                    href="/settings/profile"
                    aria-label="Your profile"
                    className="ring-sage-200 hover:ring-sage-400 block size-10 overflow-hidden rounded-full ring-2 transition"
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="bg-sage-100 text-sage-700 flex h-full w-full items-center justify-center text-sm font-semibold">
                            {initials}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}

/* ============================ Left column ============================ */

function SanctuaryColumn() {
    return (
        <div className="from-ashen-700 to-ashen-900 relative h-full w-full overflow-hidden bg-gradient-to-b">
            {SANCTUARY_PHOTO && <img src={SANCTUARY_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" />}

            {/* readability grade */}
            <div className="from-ashen-950/80 via-ashen-950/20 absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="from-sage-900/25 absolute inset-0 bg-gradient-to-tr via-transparent to-transparent mix-blend-soft-light" />

            {/* empty-state hint */}
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

/* ============================ Center column ============================ */

function BookNow({ count }: { count: number }) {
    return (
        <div className="from-sage-700 to-sage-800 relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-white shadow-[0_22px_50px_-20px_rgba(63,88,65,0.6)]">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">Ready when you are</p>
            <h3 className="font-display mt-3 text-[1.8rem] leading-snug">Talk to someone who can help</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80">
                Book a private session with a licensed specialist — in Arabic, English, or French. It only takes a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                    href="/specialists"
                    prefetch
                    className="group text-sage-800 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    Find your specialist
                    <span className="bg-sage-100 rounded-full p-1 transition-transform group-hover:rotate-45">
                        <ArrowUpRight className="size-4" />
                    </span>
                </Link>
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
                    className="bg-ashen-800 hover:bg-ashen-700 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    Edit intention
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

/* ============================ Right column ============================ */

function NextSessionCard({ session, firstName }: { session: UpcomingSession | null; firstName: string }) {
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
                    <Link
                        href="/specialists"
                        prefetch
                        aria-label="Find a specialist"
                        className="bg-sage-700 hover:bg-sage-800 flex size-11 shrink-0 items-center justify-center rounded-full text-white transition hover:-translate-y-0.5 active:scale-95"
                    >
                        <ArrowUpRight className="size-5" />
                    </Link>
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
                {session.meeting_link && (
                    <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Join session"
                        className="bg-sage-700 hover:bg-sage-800 flex size-12 shrink-0 items-center justify-center rounded-full text-white transition hover:-translate-y-0.5 active:scale-95"
                    >
                        <Video className="size-5" />
                    </a>
                )}
            </div>
        </div>
    );
}

function QuickTile({
    icon: Icon,
    title,
    subtitle,
    href,
    progress,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
    href: string;
    progress: number;
}) {
    return (
        <Link href={href} prefetch className={`group hover:bg-sage-50/70 p-6 transition active:scale-[0.98] ${CARD}`}>
            <span className="bg-sage-100 text-sage-700 flex size-10 items-center justify-center rounded-full transition group-hover:scale-105">
                <Icon className="size-5" />
            </span>
            <p className="text-ashen-800 mt-4 text-sm font-semibold">{title}</p>
            <p className="text-ashen-400 truncate text-xs">{subtitle}</p>
            <div className="bg-sage-100 mt-4 h-1.5 w-full overflow-hidden rounded-full">
                <div className="bg-sage-500 h-full rounded-full" style={{ width: `${Math.round(Math.max(0.08, progress) * 100)}%` }} />
            </div>
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
