import { APPROACH_LABELS, LANGUAGE_LABELS } from '@/components/specialist-card';
import {
    ArrowUpRight,
    ChevronDown,
    ChevronRight,
    Clock,
    Globe,
    LifeBuoy,
    MapPin,
    MessageCircle,
    Play,
    Plus,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';

/** An approved psychologist, as shown on the landing team cards (from the DB). */
interface LandingSpecialist {
    name: string;
    slug: string;
    photo_path: string | null;
    headline: string | null;
    bio: string | null;
    approaches: string[];
    languages: string[];
}

// A gentle ease used across every reveal so the whole page shares one feel.
const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Reveals a line of text word-by-word with a soft blur-up — our signature
 * heading entrance (borrowed from the Steno reference). Drop it inside any
 * heading element; it keeps the element's own typography classes.
 */
function RevealText({ text, delay = 0, stagger = 0.07 }: { text: string; delay?: number; stagger?: number }) {
    return (
        <>
            {text.split(' ').map((word, i) => (
                <motion.span
                    key={`${word}-${i}`}
                    className="inline-block"
                    style={{ marginRight: '0.25em' }}
                    initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.55, delay: delay + i * stagger, ease: SOFT_EASE }}
                >
                    {word}
                </motion.span>
            ))}
        </>
    );
}

/**
 * An image/content card that rests at a perspective tilt — the editorial
 * "angled card" motif. Always visible: it enters from a slightly deeper angle
 * and straightens on hover. Never hides content behind the scroll.
 */
function TiltCard({
    children,
    className = '',
    tilt = -6,
    from = 'right',
}: {
    children: React.ReactNode;
    className?: string;
    tilt?: number;
    from?: 'left' | 'right';
}) {
    const dir = from === 'right' ? 1 : -1;
    return (
        <motion.div
            className={className}
            style={{ transformPerspective: 1200 }}
            // Always visible: rests at a tilt, enters with a small extra angle, straightens on hover.
            initial={{ rotateY: tilt - dir * 8 }}
            whileInView={{ rotateY: tilt }}
            whileHover={{ rotateY: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: SOFT_EASE }}
        >
            {children}
        </motion.div>
    );
}

export default function Home({ whatsappUrl, specialists = [] }: { whatsappUrl: string; specialists?: LandingSpecialist[] }) {
    const mouseX = useMotionValue(50);
    const mouseY = useMotionValue(50);
    const spotlight = useMotionTemplate`radial-gradient(circle 450px at ${mouseX}% ${mouseY}%, rgba(232,217,191,0.22), rgba(212,180,131,0.08) 35%, transparent 70%)`;

    // Throttle the spotlight to one update per animation frame. Mouse-move fires
    // far more often than the screen refreshes; without this cap we repaint the
    // full-canvas radial gradient dozens of extra times per second for nothing.
    const spotlightRaf = useRef<number | null>(null);
    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (spotlightRaf.current !== null) {
            return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        spotlightRaf.current = requestAnimationFrame(() => {
            mouseX.set(x);
            mouseY.set(y);
            spotlightRaf.current = null;
        });
    };

    const [open, setOpen] = useState<number | null>(0);

    // cinematic showpiece — a full-bleed photo (always visible) with a gentle
    // parallax: the background drifts and the two headline halves slide toward
    // each other as you scroll past. No content is hidden behind the scroll.
    const showcaseRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: showcaseRef, offset: ['start end', 'end start'] });
    const showcaseBgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
    const showcaseLeftX = useTransform(scrollYProgress, [0, 1], ['-14%', '6%']);
    const showcaseRightX = useTransform(scrollYProgress, [0, 1], ['14%', '-6%']);

    const approaches = [
        {
            abbr: 'CBT',
            summary: 'Notice and reshape unhelpful thought patterns.',
            body: 'CBT helps you spot the thoughts that fuel stress or low mood, understand how they shape your feelings, and gently practise healthier patterns. Practical, structured, and focused on the present.',
            best: 'Anxiety · low mood · stress',
        },
        {
            abbr: 'EMDR',
            summary: 'Process difficult memories so they lose their grip.',
            body: 'EMDR uses gentle, guided eye movements to help your mind reprocess distressing experiences, so the memory of a shock feels less overwhelming over time. Delivered only by our licensed clinical psychologists.',
            best: 'Trauma · shock · painful memories',
        },
        {
            abbr: 'Psychoanalysis',
            summary: 'Explore the deeper roots beneath how you feel.',
            body: 'A reflective, longer-term approach exploring how past experiences and unconscious patterns shape your present — a space to understand yourself more deeply, at your own pace.',
            best: 'Self-understanding · recurring patterns',
        },
    ];

    // every specialist is trained across the same approaches — used as a gentle
    // fallback for the modal when a practitioner hasn't listed their own yet.
    const sharedApproaches = ['CBT', 'EMDR', 'Psychoanalysis'];

    const [selected, setSelected] = useState<LandingSpecialist | null>(null);

    const faqs = [
        {
            q: 'Is Sanad real therapy?',
            a: 'Yes. Sanad connects you with licensed clinical psychologists for real, confidential sessions — a professional space to feel heard and genuinely supported. (For a medical emergency, please contact your local emergency number.)',
        },
        {
            q: 'How do sessions work?',
            a: 'Everything is online and on your schedule. You’re matched with a specialist who listens first, then gently guides you using evidence-based approaches — CBT, EMDR or psychoanalysis — at a pace that feels right for you.',
        },
        {
            q: 'Is everything confidential?',
            a: 'Yes. Your sessions and anything you share are private and confidential. Your trust is the foundation of the support we offer.',
        },
        {
            q: 'How do I book a session?',
            a: 'Create an account, choose the specialist you feel drawn to, and pick a time that suits you. You can book your first session in just a couple of minutes.',
        },
        {
            q: 'Which languages are available?',
            a: 'Our specialists offer support in Arabic, English and French, so you can express yourself in the language you feel most at home in.',
        },
        {
            q: 'What if I need help right now?',
            a: 'Sanad isn’t an emergency service. If you’re in danger or in crisis, please contact your local emergency number. For a fresh shock, our self-guided Emergency First Aid grounding tool can help you feel steadier in the moment.',
        },
    ];
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        // One page-wide light→dark split: warm light gray on the left flowing into
        // a deep warm gray on the right, behind every section from hero to footer.
        // The final color goes flat from 76% so the hero's notched corner card can
        // match it exactly at any common viewport width.
        <div className="min-h-screen bg-[linear-gradient(to_right,#f6f4ed_0%,#e6e5dd_28%,#b8b9b1_55%,#90918a_76%,#90918a_100%)]">
            {/* Always-present crisis fast lane for visitors in distress — one tap to
            a real person on WhatsApp, no sign-up needed. */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ashen-200 fixed bottom-5 left-5 z-[70] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 active:scale-95"
            >
                <LifeBuoy className="size-4" />
                <span className="hidden sm:inline">Need help now?</span>
            </a>

            {/* FILM GRAIN — cinematic texture over the whole page */}
            <div
                aria-hidden
                className="pointer-events-none fixed top-1/2 left-1/2 z-[60] h-[250%] w-[250%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06] will-change-transform"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    animation: 'grain 0.7s steps(3) infinite',
                }}
            />

            {/* hero wrapper — centers the floating video card */}
            <div className="flex justify-center p-3 md:p-5">
                {/* floating rounded card (all corners + margin, like the reference) */}
                <section className="bg-ashen-800 relative flex h-[calc(100vh-1.5rem)] w-full max-w-[1536px] flex-col items-center overflow-hidden rounded-[1.5rem] md:h-[calc(100vh-2.5rem)] md:rounded-[3rem]">
                    {/* slight blur softens low-bitrate compression artifacts. transform-gpu
                    forces the video onto its own compositor layer so the blur is
                    rasterised cleanly instead of fighting the rest of the page. */}
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/images/hero.jpg"
                        className="absolute inset-0 z-0 h-full w-full scale-110 transform-gpu object-cover blur-[2px]"
                    >
                        <source src="/videos/hero.mp4" type="video/mp4" />
                    </video>

                    {/* gentle scrim — calms the brightness + keeps text readable */}
                    <div className="from-ashen-950/45 via-ashen-950/25 to-ashen-950/55 absolute inset-0 z-0 bg-gradient-to-b" />

                    <div className="relative z-10 flex h-full w-full flex-col items-center">
                        {/* centered nav (no left logo, to match the reference) */}
                        <nav className="flex w-full items-center justify-between px-6 py-6 md:px-12">
                            <div className="hidden flex-1 md:block" />
                            <ul className="text-ashen-200/90 hidden items-center gap-8 text-sm md:flex">
                                {[
                                    { label: 'Services', href: '#support' },
                                    { label: 'Our team', href: '#team' },
                                    { label: 'Approach', href: '#approaches' },
                                    { label: 'Contact', href: '#contact' },
                                ].map((item) => (
                                    <li key={item.href}>
                                        <a href={item.href} className="group relative inline-block py-1 transition hover:text-ashen-400">
                                            {item.label}
                                            <span className="bg-ashen-200 absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <div className="text-ashen-200 text-xl md:hidden">Sanad</div>
                            <div className="flex flex-1 justify-end">
                                <motion.a
                                    href="/register"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-ashen-800 hover:bg-ashen-900 text-ashen-200 flex items-center gap-2 rounded-full py-1.5 pr-5 pl-2 text-sm transition md:gap-3 md:py-2"
                                >
                                    <span className="bg-ashen-200/30 rounded-full p-1 md:p-1.5">
                                        <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                                    </span>
                                    Book a session
                                </motion.a>
                            </div>
                        </nav>

                        {/* centered text — clean SANS, regular weight (matches reference) */}
                        <div className="flex w-full max-w-4xl flex-col items-center px-6 pt-8 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="border-ashen-200/40 bg-ashen-200/15 mb-3 flex w-fit items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md"
                            >
                                <Sparkles className="text-ashen-200 h-4 w-4" />
                                <span className="text-ashen-200 text-sm">Licensed clinical psychologists</span>
                            </motion.div>

                            <h1 className="text-ashen-200 hover:text-ashen-400 mb-2 text-4xl leading-[1.05] font-normal tracking-tight transition-colors duration-300 sm:text-5xl md:text-6xl lg:text-[80px]">
                                <RevealText text="A safe space for your mind" delay={0.25} stagger={0.09} />
                            </h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-ashen-200/85 max-w-xl text-sm leading-relaxed sm:text-base md:text-lg"
                            >
                                Real, confidential sessions with licensed clinical psychologists — online, on your schedule, guided with care.
                            </motion.p>
                        </div>

                        {/* bottom-left glass card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="border-ashen-200/30 bg-ashen-200/10 absolute bottom-6 left-6 hidden min-w-[170px] flex-col gap-3 rounded-[2rem] border p-5 backdrop-blur-xl sm:flex md:bottom-10 md:left-10"
                        >
                            <div>
                                <p className="text-ashen-200 text-3xl font-normal tracking-tight">{specialists.length}</p>
                                <p className="text-ashen-200/70 text-[11px] tracking-wider uppercase">Caring specialists</p>
                            </div>
                            <motion.a
                                href="#team"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="text-ashen-900 bg-ashen-200 hover:bg-ashen-300 flex w-fit items-center gap-2 self-start rounded-full py-1.5 pr-5 pl-1.5 text-sm transition"
                            >
                                <span className="bg-ashen-700/10 rounded-full p-1">
                                    <ArrowUpRight className="text-ashen-600 h-4 w-4" />
                                </span>
                                Meet the team
                            </motion.a>
                        </motion.div>

                        {/* bottom-right CUT-OUT card (notched into the corner, like the reference) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="absolute right-0 bottom-0 flex items-center gap-4 rounded-tl-[2.5rem] bg-[#90918a] p-6 pl-10 md:gap-6 md:pl-12"
                        >
                            {/* concave corner masks — make the notch blend smoothly into the card */}
                            <div className="pointer-events-none absolute -top-[2.5rem] right-0 h-[2.5rem] w-[2.5rem]">
                                <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#90918a" />
                                </svg>
                            </div>
                            <div className="pointer-events-none absolute bottom-0 -left-[2.5rem] h-[2.5rem] w-[2.5rem]">
                                <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#90918a" />
                                </svg>
                            </div>

                            {/* content */}
                            <div className="border-ashen-900/30 bg-ashen-900/10 flex h-12 w-12 items-center justify-center rounded-full border md:h-14 md:w-14">
                                <ArrowUpRight className="text-ashen-900 h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-ashen-900 text-base md:text-xl">Our approach</p>
                                <div className="text-ashen-900/70 hover:text-ashen-900 flex cursor-pointer items-center gap-1 transition">
                                    <span className="text-xs md:text-[15px]">How support works</span>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>

            {/* ===== CONTINUOUS CANVAS — transparent, so the page-wide light→dark
            split shows through beneath the auroras and every section ===== */}
            <div onMouseMove={handleMouseMove} className="relative overflow-hidden">
                {/* always-on aurora spanning the WHOLE canvas (both sections) */}
                <div
                    className="bg-sage-400/40 pointer-events-none absolute top-[4%] -left-40 h-[38rem] w-[38rem] rounded-full blur-3xl"
                    style={{ animation: 'aurora-1 22s ease-in-out infinite' }}
                />
                <div
                    className="bg-sage-300/25 pointer-events-none absolute top-[26%] -right-40 h-[42rem] w-[42rem] rounded-full blur-3xl"
                    style={{ animation: 'aurora-2 26s ease-in-out infinite' }}
                />
                <div
                    className="bg-beige/45 pointer-events-none absolute top-[52%] left-1/4 h-[34rem] w-[34rem] rounded-full blur-3xl"
                    style={{ animation: 'aurora-3 28s ease-in-out infinite' }}
                />
                <div
                    className="bg-sage-300/35 pointer-events-none absolute top-[78%] -left-32 h-[34rem] w-[34rem] rounded-full blur-3xl"
                    style={{ animation: 'aurora-2 30s ease-in-out infinite' }}
                />

                {/* mouse spotlight across the whole canvas */}
                <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />

                {/* drifting dust across the whole canvas */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {[
                        { l: 8, t: 12, s: 2, d: 18, delay: -2 },
                        { l: 22, t: 8, s: 1, d: 16, delay: -14 },
                        { l: 35, t: 42, s: 1, d: 24, delay: -11 },
                        { l: 52, t: 38, s: 1, d: 21, delay: -1 },
                        { l: 70, t: 48, s: 1.5, d: 23, delay: -13 },
                        { l: 86, t: 30, s: 2, d: 20, delay: -16 },
                        { l: 30, t: 70, s: 1, d: 24, delay: -19 },
                        { l: 82, t: 72, s: 1.5, d: 20, delay: -12 },
                    ].map((p, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-amber-100"
                            style={{
                                left: `${p.l}%`,
                                top: `${p.t}%`,
                                width: `${p.s * 2.5}px`,
                                height: `${p.s * 2.5}px`,
                                animation: `dust-drift ${p.d}s ease-in-out infinite`,
                                animationDelay: `${p.delay}s`,
                                filter: 'blur(1px)',
                                boxShadow: '0 0 8px 2px rgba(232,217,191,0.6)',
                            }}
                        />
                    ))}
                </div>

                {/* ===== HOW ARE YOU FEELING — dark glowing panel ===== */}
                <section id="support" className="relative z-10 pt-8 pb-12 md:pt-10 md:pb-16">
                    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
                        <div className="sanad-border from-ashen-500 to-ashen-700 border-ashen-300/25 relative overflow-hidden rounded-[2.5rem] border bg-gradient-to-br px-6 py-12 md:px-12 md:py-14">
                            {/* animating light glows inside the panel */}
                            <div className="bg-sage-500/40 animate-breathe pointer-events-none absolute top-10 -left-10 h-72 w-72 rounded-full blur-3xl" />
                            <div className="bg-beige/40 animate-breathe pointer-events-none absolute -right-10 bottom-10 h-80 w-80 rounded-full blur-3xl [animation-delay:-4s]" />
                            <div className="bg-sage-500/30 animate-breathe pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 rounded-full blur-3xl [animation-delay:-7s]" />

                            {/* content above the glows */}
                            <div className="relative z-10">
                                {/* header: heading left, button right */}
                                <div className="mb-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
                                    <div>
                                        <span className="text-ashen-300 text-sm font-medium tracking-[0.2em] uppercase">In-the-moment support</span>
                                        <h2 className="font-display text-ashen-200 mt-3 text-4xl tracking-tight md:text-5xl">
                                            Let's start where you are
                                        </h2>
                                    </div>
                                    <a
                                        href="#faq"
                                        className="group text-ashen-900 bg-ashen-200 hover:bg-ashen-300 inline-flex items-center gap-2.5 rounded-full py-2 pr-5 pl-2 text-sm font-medium transition"
                                    >
                                        <span className="bg-ashen-900/10 group-hover:bg-ashen-900/20 flex h-6 w-6 items-center justify-center rounded-full transition">
                                            <Play className="fill-ashen-900 text-ashen-900 h-3 w-3" />
                                        </span>
                                        How it works
                                    </a>
                                </div>

                                {/* two entry doors — compact stacked cards on phone, editorial rows on desktop */}
                                <div className="space-y-6 md:space-y-16">
                                    {/* Emergency First Aid — text left, photo right */}
                                    <a
                                        href="/emergency"
                                        className="group flex flex-col-reverse items-stretch gap-5 md:flex-row md:items-center md:gap-14"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, x: -40 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: '-80px' }}
                                            transition={{ duration: 0.7, ease: 'easeOut' }}
                                            className="w-full md:w-1/2"
                                        >
                                            <div className="mb-4 flex items-center gap-2.5">
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="bg-ashen-200 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                                                    <span className="bg-ashen-200 relative inline-flex h-2.5 w-2.5 rounded-full" />
                                                </span>
                                                <span className="text-ashen-300 text-xs font-medium tracking-[0.15em] uppercase">
                                                    If it just happened
                                                </span>
                                            </div>
                                            <h3 className="font-display group-hover:text-ashen-400 text-ashen-200 text-4xl tracking-tight transition-colors md:text-5xl">
                                                Emergency First Aid
                                            </h3>
                                            <p className="text-ashen-300 mt-4 max-w-md leading-relaxed">
                                                For a shock that's still fresh — within the last hours. Immediate, guided grounding to help you feel
                                                safe right now.
                                            </p>
                                            <ul className="mt-6 hidden space-y-2.5 md:block">
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-ashen-200/20 text-ashen-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        1
                                                    </span>
                                                    Find safety
                                                </li>
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-ashen-200/20 text-ashen-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        2
                                                    </span>
                                                    Full-body reset
                                                </li>
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-ashen-200/20 text-ashen-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        3
                                                    </span>
                                                    Steady your focus
                                                </li>
                                            </ul>
                                            <p className="text-ashen-400 mt-5 hidden items-center gap-1.5 text-sm md:flex">
                                                <Clock className="h-4 w-4" /> Available now · ~3 minutes
                                            </p>
                                            <span className="text-ashen-200 mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-3">
                                                Start now →
                                            </span>
                                        </motion.div>
                                        <TiltCard
                                            from="right"
                                            tilt={-5}
                                            className="bg-ashen-900 relative h-44 w-full overflow-hidden rounded-3xl sm:h-56 md:h-[28rem] md:w-1/2"
                                        >
                                            <img
                                                src="/images/support/emergency.jpg"
                                                alt=""
                                                decoding="async"
                                                fetchPriority="high"
                                                className="absolute inset-0 h-full w-full object-cover grayscale-[45%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        </TiltCard>
                                    </a>

                                    {/* Ongoing Support — photo left, text right. Sends visitors to the
                                    methods section so they understand the approaches before choosing
                                    a specialist to book with. */}
                                    <a href="#approaches" className="group flex flex-col items-stretch gap-5 md:flex-row md:items-center md:gap-14">
                                        <TiltCard
                                            from="left"
                                            tilt={5}
                                            className="bg-ashen-900 relative h-44 w-full overflow-hidden rounded-3xl sm:h-56 md:h-[28rem] md:w-1/2"
                                        >
                                            <img
                                                src="/images/support/ongoing.jpg"
                                                alt=""
                                                decoding="async"
                                                className="absolute inset-0 h-full w-full object-cover grayscale-[45%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        </TiltCard>
                                        <motion.div
                                            initial={{ opacity: 0, x: 40 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: '-80px' }}
                                            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                                            className="w-full md:w-1/2"
                                        >
                                            <div className="mb-4 flex items-center gap-2.5">
                                                <span className="bg-ashen-300 h-2.5 w-2.5 rounded-full" />
                                                <span className="text-ashen-300 text-xs font-medium tracking-[0.15em] uppercase">
                                                    If it's been a while
                                                </span>
                                            </div>
                                            <h3 className="font-display group-hover:text-ashen-400 text-ashen-200 text-4xl tracking-tight transition-colors md:text-5xl">
                                                Ongoing Support
                                            </h3>
                                            <p className="text-ashen-300 mt-4 max-w-md leading-relaxed">
                                                For something from days, weeks, or longer ago — gentle support to process what happened, at your own
                                                pace.
                                            </p>
                                            <ul className="mt-6 hidden space-y-2.5 md:block">
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-ashen-200/20 text-ashen-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        1
                                                    </span>
                                                    Talk it through
                                                </li>
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-ashen-200/20 text-ashen-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        2
                                                    </span>
                                                    Guided sessions over time
                                                </li>
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-ashen-200/20 text-ashen-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        3
                                                    </span>
                                                    At your own pace
                                                </li>
                                            </ul>
                                            <p className="text-ashen-400 mt-5 hidden items-center gap-1.5 text-sm md:flex">
                                                <Clock className="h-4 w-4" /> Whenever you're ready
                                            </p>
                                            <span className="text-ashen-200 mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-3">
                                                Explore support →
                                            </span>
                                        </motion.div>
                                    </a>
                                </div>

                                <p className="text-ashen-400/80 mx-auto mt-12 max-w-xl text-center text-sm">
                                    These are self-guided grounding tools, not a substitute for professional or emergency care. If you're in danger or
                                    in crisis, please contact your local emergency number.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== CINEMATIC SHOWPIECE — full-bleed photo + parallax split headline ===== */}
                <section ref={showcaseRef} className="bg-ashen-950 relative z-10 h-[68vh] min-h-[420px] overflow-hidden">
                    {/* full-bleed background photo — always visible, drifts on scroll */}
                    <motion.div style={{ y: showcaseBgY }} className="absolute inset-0 scale-110">
                        <img
                            src="/images/support/ongoing.jpg"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover grayscale-[65%]"
                        />
                        <div className="bg-ashen-950/55 absolute inset-0" />
                        <div className="from-ashen-950/80 to-ashen-950/30 absolute inset-0 bg-gradient-to-t via-transparent" />
                    </motion.div>

                    {/* the emotional line — two halves drift toward each other on scroll */}
                    <div className="relative z-10 flex h-full items-center">
                        <div className="mx-auto w-full max-w-6xl px-6">
                            <p className="text-ashen-300 mb-4 text-sm font-medium tracking-[0.25em] uppercase">However you arrived here</p>
                            <h2 className="font-display text-ashen-200 hover:text-ashen-400 flex flex-col text-4xl leading-[1.05] transition-colors duration-300 sm:text-5xl md:text-7xl lg:text-8xl">
                                <motion.span style={{ x: showcaseLeftX }} className="self-start">
                                    You don't have to
                                </motion.span>
                                <motion.span style={{ x: showcaseRightX }} className="self-end text-right">
                                    carry it alone.
                                </motion.span>
                            </h2>
                        </div>
                    </div>
                </section>

                {/* ===== OUR METHODS — editorial collapsible rows ===== */}
                <section id="approaches" className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-8 md:px-8 md:pt-16 md:pb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6, ease: SOFT_EASE }}
                        className="mb-6 max-w-2xl md:mb-8"
                    >
                        <span className="text-ashen-600 text-sm font-medium tracking-[0.2em] uppercase">Our approaches</span>
                        <h2 className="font-display text-ashen-900 mt-3 text-3xl tracking-tight md:text-5xl">
                            <RevealText text="Methods, guided by specialists" delay={0.1} />
                        </h2>
                        <p className="text-ashen-700 mt-4 max-w-xl leading-relaxed">
                            Evidence-based approaches, explained simply. Your licensed psychologist will help choose what fits you.
                        </p>
                    </motion.div>

                    {/* defined panel with an animated, on-brand glowing border (cinematic).
                    Translucent cream glass — lets the page split glow through. */}
                    <div className="sanad-border bg-ashen-100/50 relative overflow-hidden rounded-[1.5rem] px-6 backdrop-blur-sm md:rounded-[2rem] md:px-10">
                        <div className="divide-ashen-700/15 divide-y">
                            {approaches.map((a, i) => {
                                const isOpen = open === i;
                                return (
                                    <motion.div
                                        key={a.abbr}
                                        initial={{ opacity: 0, y: 22 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.55, ease: SOFT_EASE, delay: i * 0.1 }}
                                    >
                                        <button
                                            onClick={() => setOpen(isOpen ? null : i)}
                                            className="group flex w-full items-center gap-5 py-7 text-left md:gap-8 md:py-9"
                                        >
                                            <span className="font-display text-ashen-600 w-7 shrink-0 text-sm tabular-nums md:text-base">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="font-display text-ashen-900 group-hover:text-ashen-600 flex-1 text-2xl tracking-tight transition-colors md:text-4xl">
                                                {a.abbr}
                                            </span>
                                            <span className="text-ashen-700 hidden max-w-[16rem] text-sm leading-snug lg:block">{a.summary}</span>
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'border-ashen-800 bg-ashen-800 text-ashen-200 rotate-45' : 'border-ashen-800/60 text-ashen-800 group-hover:border-ashen-900'}`}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </span>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pb-8 md:pl-12">
                                                        <p className="text-ashen-700 max-w-2xl leading-relaxed md:text-lg">{a.body}</p>
                                                        <p className="text-ashen-600 mt-4 text-sm font-medium">Best for: {a.best}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* quiet proof — the true numbers, tucked right under the methods so
                    they read as supporting evidence rather than a separate band */}
                    <div className="border-ashen-800/30 mt-10 grid grid-cols-3 gap-4 border-t pt-8 text-center md:mt-12 md:pt-10">
                        {[
                            { n: '100%', l: 'Licensed psychologists' },
                            { n: '3', l: 'Evidence-based approaches' },
                            { n: '3', l: 'Languages · Ar · En · Fr' },
                        ].map((s, i) => (
                            <div key={s.l} className={i > 0 ? 'border-ashen-800/30 border-l' : ''}>
                                <p className="font-display text-ashen-900 text-3xl tracking-tight md:text-5xl">{s.n}</p>
                                <p className="text-ashen-700 mx-auto mt-2 max-w-[10rem] text-xs leading-snug tracking-wide uppercase">{s.l}</p>
                            </div>
                        ))}
                    </div>

                    {/* nudge toward booking — animated arrows that flow down into the team,
                    keeping "book your session" front of mind right after the methods */}
                    <motion.a
                        href="#team"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: SOFT_EASE }}
                        className="group mx-auto mt-12 flex w-fit flex-col items-center gap-2 text-center md:mt-16"
                    >
                        <span className="text-ashen-900 border-ashen-600/40 group-hover:border-ashen-700 group-hover:bg-ashen-100/80 bg-ashen-100/60 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-[0.15em] uppercase transition">
                            <Sparkles className="h-3.5 w-3.5" /> Ready when you are
                        </span>
                        <span className="font-display text-ashen-900 group-hover:text-ashen-600 mt-2 text-2xl tracking-tight transition-colors md:text-4xl">
                            See our specialists &amp; book your session
                        </span>
                        <span className="text-ashen-700 text-sm">Find the right person for you — in just a couple of minutes</span>

                        {/* floating arrows: a downward wave that draws the eye to the team */}
                        <div className="mt-3 flex flex-col items-center -space-y-3">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    animate={{ opacity: [0.15, 1, 0.15], y: [0, 4, 0] }}
                                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                                >
                                    <ChevronDown className="text-ashen-600 size-7" />
                                </motion.span>
                            ))}
                        </div>
                    </motion.a>
                </section>

                {/* ===== MEET THE TEAM — framed, angled specialist cards on a colored band ===== */}
                <section id="team" className="from-ashen-700 to-ashen-800 relative z-10 bg-gradient-to-b pt-10 pb-12 md:pt-12 md:pb-16">
                    {/* soft on-brand glow for depth (no photo) */}
                    <div className="bg-sage-500/20 animate-breathe pointer-events-none absolute top-10 -left-20 h-72 w-72 rounded-full blur-3xl" />
                    <div className="bg-beige/15 animate-breathe pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full blur-3xl [animation-delay:-4s]" />

                    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
                        <div className="mb-8 max-w-2xl">
                            <span className="text-ashen-300 text-sm font-medium tracking-[0.2em] uppercase">Meet the team</span>
                            <h2 className="font-display text-ashen-200 mt-3 text-3xl tracking-tight md:text-5xl">The people behind Sanad</h2>
                            <p className="text-ashen-200 mt-4 max-w-xl leading-relaxed">
                                Every Sanad psychologist is a licensed clinical psychologist, trained across all our approaches — CBT, EMDR and
                                psychoanalysis. <span className="text-ashen-200">Real care, real credentials.</span>
                            </p>
                        </div>

                        {/* steady framed cards — swipe carousel on phone, grid on desktop */}
                        <div className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
                            {specialists.map((m) => (
                                <motion.button
                                    key={m.slug}
                                    onClick={() => setSelected(m)}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.3, ease: SOFT_EASE }}
                                    className="group from-cream via-cream to-ashen-200 block w-[72%] shrink-0 snap-center rounded-[1.25rem] bg-gradient-to-b p-3 text-left shadow-[0_30px_60px_-30px_rgba(20,21,15,0.7)] sm:w-full sm:shrink"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-[0.85rem]">
                                        {m.photo_path ? (
                                            <img
                                                src={m.photo_path}
                                                alt={m.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="absolute inset-0 h-full w-full object-cover grayscale-[80%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                            />
                                        ) : (
                                            <div className="from-sage-300 to-sage-600 absolute inset-0 bg-gradient-to-br" />
                                        )}
                                        <span className="bg-ashen-100/90 text-ashen-900 absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                                            Licensed Psychologist
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between gap-3 px-1 pt-3.5">
                                        <div>
                                            <h3 className="font-display text-ashen-900 text-xl">{m.name}</h3>
                                            <p className="text-ashen-700 mt-0.5 text-xs">Licensed clinical psychologist</p>
                                        </div>
                                        <span className="text-ashen-600 shrink-0 text-sm font-medium opacity-0 transition group-hover:opacity-100">
                                            View →
                                        </span>
                                    </div>
                                </motion.button>
                            ))}

                            {/* ghost card — signals more specialists to come */}
                            <div className="border-ashen-300/40 flex min-h-[16rem] w-[72%] shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-[1.25rem] border-2 border-dashed p-6 text-center sm:min-h-[20rem] sm:w-full sm:shrink">
                                <span className="font-display text-ashen-300/60 text-4xl">+</span>
                                <p className="text-ashen-300/80 text-sm">More specialists joining soon</p>
                            </div>
                        </div>

                        {/* confident, licensed practice statement */}
                        <p className="text-ashen-400 mt-7 max-w-3xl text-xs leading-relaxed">
                            Every Sanad clinician is a licensed clinical psychologist, and Sanad is a fully licensed, confidential clinical practice.
                            For a medical emergency or if you are in danger, please contact your local emergency number.
                        </p>
                    </div>
                </section>

                {/* ===== FAQ — "Ask away" (skewed photo + hairline list) ===== */}
                <section id="faq" className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
                        {/* left — heading + angled photo + contact */}
                        <div className="md:sticky md:top-24 md:self-start">
                            <span className="text-ashen-600 text-sm font-medium tracking-[0.2em] uppercase">FAQ</span>
                            <h2 className="font-display text-ashen-900 mt-3 text-3xl leading-[1.05] tracking-tight md:text-5xl">
                                <RevealText text="Ask away" delay={0.1} />
                            </h2>
                            <p className="text-ashen-700 mt-4 max-w-sm leading-relaxed">
                                Everything you might want to know before you begin. Can't find your answer? We're only a message away.
                            </p>

                            <TiltCard
                                from="left"
                                tilt={6}
                                className="relative mt-8 hidden w-full max-w-[18rem] overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-30px_rgba(37,38,31,0.5)] md:block"
                            >
                                <div className="from-ashen-600 to-ashen-800 text-ashen-200 relative overflow-hidden bg-gradient-to-br p-6">
                                    {/* soft warm glow — keeps the brand's light touch without a photo */}
                                    <div className="bg-beige/20 animate-breathe pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl" />
                                    <div className="relative z-10 flex flex-col gap-5">
                                        <span className="bg-ashen-200/25 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur">
                                            <MessageCircle className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="font-display text-xl">Talk to a real person</p>
                                            <p className="text-ashen-200/75 mt-1.5 text-sm leading-relaxed">
                                                A licensed psychologist, never a bot. We usually reply within a day.
                                            </p>
                                        </div>
                                        <div className="text-ashen-200/85 flex flex-col gap-2.5 pt-1 text-sm">
                                            <span className="flex items-center gap-2.5">
                                                <ShieldCheck className="text-ashen-300 h-4 w-4" /> Private &amp; confidential
                                            </span>
                                            <span className="flex items-center gap-2.5">
                                                <Globe className="text-ashen-300 h-4 w-4" /> Arabic · English · French
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>

                            <a
                                href="/register"
                                className="group bg-ashen-800 hover:bg-ashen-900 mt-7 inline-flex items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-ashen-200 text-sm font-medium transition"
                            >
                                <span className="bg-ashen-200/30 rounded-full p-1 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                                Get in touch
                            </a>
                        </div>

                        {/* right — hairline +/- list (darker hairlines: this column
                        sits on the sage side of the page split) */}
                        <div className="border-ashen-800/30 border-t">
                            {faqs.map((f, i) => {
                                const isOpen = openFaq === i;
                                return (
                                    <motion.div
                                        key={f.q}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.5, ease: SOFT_EASE, delay: i * 0.06 }}
                                        className="border-ashen-800/30 border-b"
                                    >
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : i)}
                                            className="group flex w-full items-start gap-4 py-6 text-left md:gap-5"
                                        >
                                            <span
                                                className={`font-display mt-1 text-sm tabular-nums transition-colors ${isOpen ? 'text-ashen-900' : 'text-ashen-800/70'}`}
                                            >
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="font-display text-ashen-900 group-hover:text-ashen-600 flex-1 text-lg transition-colors md:text-xl">
                                                {f.q}
                                            </span>
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'border-ashen-800 bg-ashen-800 text-ashen-200 rotate-45' : 'border-ashen-800/60 text-ashen-800 group-hover:border-ashen-900'}`}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </span>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="text-ashen-800 max-w-xl pr-6 pb-6 pl-[2.75rem] leading-relaxed">{f.a}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ===== FINAL CTA — calm on-brand panel to close ===== */}
                <section className="relative z-10 px-6 pb-12 md:pb-16">
                    {/* translucent glass — the page split stays visible behind the closing panel */}
                    <div className="from-ashen-100/55 to-ashen-300/40 border-ashen-600/30 relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border bg-gradient-to-br px-6 py-12 text-center backdrop-blur-sm md:rounded-[3.5rem] md:py-16">
                        <div className="bg-sage-300/30 animate-breathe pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full blur-3xl" />
                        <div className="bg-ashen-200/40 animate-breathe pointer-events-none absolute -right-10 -bottom-10 h-72 w-72 rounded-full blur-3xl [animation-delay:-4s]" />
                        <div className="relative z-10">
                            <span className="text-ashen-900 border-ashen-600/40 bg-ashen-100/60 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-[0.15em] uppercase">
                                <span className="bg-ashen-500 h-1.5 w-1.5 rounded-full" /> Proudly Lebanese · Beirut
                            </span>
                            <h2 className="font-display text-ashen-900 mx-auto mt-4 max-w-2xl text-3xl leading-[1.05] tracking-tight md:text-5xl">
                                Care that feels like home.
                            </h2>
                            <p className="text-ashen-700 mx-auto mt-4 max-w-md leading-relaxed">
                                Real, confidential care from licensed clinical psychologists — in your language, on your schedule, at your own pace.
                            </p>
                            <a
                                href="/register"
                                className="group bg-ashen-800 hover:bg-ashen-900 mt-8 inline-flex items-center gap-2.5 rounded-full py-3 pr-6 pl-3 text-ashen-200 text-sm font-medium transition"
                            >
                                <span className="bg-ashen-200/30 rounded-full p-1.5 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="h-5 w-5" />
                                </span>
                                Book a session
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* ===== FOOTER — cinematic, Lebanese identity + trust ===== */}
            <footer id="contact" className="bg-ashen-950 text-ashen-200 relative scroll-mt-20 overflow-hidden">
                {/* soft on-brand glow for a little depth — solid color, no photo */}
                <div
                    aria-hidden
                    className="bg-ashen-800/20 pointer-events-none absolute top-0 -left-32 h-80 w-80 rounded-full blur-3xl"
                    style={{ animation: 'aurora-1 26s ease-in-out infinite' }}
                />

                <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-14">
                    {/* link columns */}
                    <div className="grid grid-cols-2 gap-10 pb-10 md:grid-cols-4">
                        {/* brand */}
                        <div className="col-span-2 md:col-span-1">
                            <p className="font-display text-2xl">Sanad</p>
                            <p className="text-ashen-400 mt-3 max-w-xs text-sm leading-relaxed">
                                A safe space for your mind — real, licensed psychological care, guided with warmth.
                            </p>
                        </div>

                        {/* explore */}
                        <div>
                            <p className="text-ashen-400 text-xs font-medium tracking-[0.15em] uppercase">Explore</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li>
                                    <a href="#support" className="transition hover:text-ashen-400">
                                        In-the-moment support
                                    </a>
                                </li>
                                <li>
                                    <a href="#approaches" className="transition hover:text-ashen-400">
                                        Our approaches
                                    </a>
                                </li>
                                <li>
                                    <a href="#team" className="transition hover:text-ashen-400">
                                        Our team
                                    </a>
                                </li>
                                <li>
                                    <a href="#faq" className="transition hover:text-ashen-400">
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* contact */}
                        <div>
                            <p className="text-ashen-400 text-xs font-medium tracking-[0.15em] uppercase">Reach us</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li>
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 transition hover:text-ashen-400"
                                    >
                                        <MessageCircle className="text-ashen-400 h-4 w-4" /> WhatsApp us
                                    </a>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <MapPin className="text-ashen-400 h-4 w-4" /> Beirut, Lebanon
                                </li>
                            </ul>
                        </div>

                        {/* reassurance */}
                        <div>
                            <p className="text-ashen-400 text-xs font-medium tracking-[0.15em] uppercase">Why trust us</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li className="flex items-center gap-2.5">
                                    <ShieldCheck className="text-ashen-400 h-4 w-4" /> Private &amp; confidential
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Sparkles className="text-ashen-400 h-4 w-4" /> Licensed clinical psychologists
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Globe className="text-ashen-400 h-4 w-4" /> Arabic · English · French
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* bottom bar */}
                    <div className="border-ashen-300/15 flex flex-col gap-4 border-t pt-8 md:flex-row md:items-center md:justify-between">
                        <p className="text-ashen-300/60 text-xs">© {new Date().getFullYear()} Sanad. All rights reserved.</p>
                        <div className="text-ashen-200/70 flex items-center gap-6 text-xs">
                            <a href="/privacy" className="transition hover:text-ashen-400">
                                Privacy
                            </a>
                            <a href="/terms" className="transition hover:text-ashen-400">
                                Terms
                            </a>
                            <a href="#faq" className="transition hover:text-ashen-400">
                                FAQ
                            </a>
                        </div>
                    </div>

                    {/* licensed-practice statement */}
                    <p className="text-ashen-400/70 mt-6 max-w-3xl text-[11px] leading-relaxed">
                        Sanad is a fully licensed, confidential clinical practice. Every session is delivered by a licensed clinical psychologist. For
                        a medical emergency or if you are in danger, please contact your local emergency number.
                    </p>
                </div>
            </footer>

            {/* ===== DOCTOR PROFILE MODAL ===== */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                        className="bg-ashen-950/70 fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-cream relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl md:flex-row"
                        >
                            <button
                                onClick={() => setSelected(null)}
                                aria-label="Close"
                                className="text-ashen-900 bg-ashen-100/90 hover:bg-ashen-100 absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="relative h-52 w-full shrink-0 sm:h-64 md:h-auto md:w-2/5">
                                {selected.photo_path ? (
                                    <img src={selected.photo_path} alt={selected.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="from-sage-300 to-sage-600 h-full w-full bg-gradient-to-br" />
                                )}
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                                <span className="bg-ashen-100 text-ashen-600 rounded-full px-3 py-1 text-xs font-medium">
                                    Licensed Clinical Psychologist
                                </span>
                                <h3 className="font-display text-ashen-900 mt-4 text-3xl">{selected.name}</h3>
                                <p className="text-ashen-600 mt-1 text-sm">Licensed clinical psychologist · Private &amp; confidential</p>
                                <p className="text-ashen-700 mt-5 leading-relaxed">
                                    {selected.bio ||
                                        selected.headline ||
                                        `${selected.name.split(' ')[0]} is a licensed clinical psychologist offering warm, confidential care across CBT, EMDR and psychoanalytic approaches.`}
                                </p>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <p className="text-ashen-600 text-xs tracking-wider uppercase">Approaches</p>
                                        <p className="text-ashen-700 mt-1 text-sm">
                                            {(selected.approaches.length > 0
                                                ? selected.approaches.map((a) => APPROACH_LABELS[a] ?? a)
                                                : sharedApproaches
                                            ).join(' · ')}
                                        </p>
                                    </div>
                                    {selected.languages.length > 0 && (
                                        <div>
                                            <p className="text-ashen-600 text-xs tracking-wider uppercase">Languages</p>
                                            <p className="text-ashen-700 mt-1 text-sm">
                                                {selected.languages.map((l) => LANGUAGE_LABELS[l] ?? l).join(' · ')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <a
                                    href={`/book/${selected.slug}`}
                                    className="bg-ashen-800 hover:bg-ashen-900 mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-ashen-200 text-sm font-medium transition"
                                >
                                    Book a session with {selected.name.split(' ')[0]} →
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
