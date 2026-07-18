import { DustField, OliveDrops, OliveHorizon, OliveTree, type Drop, type Mote } from '@/components/olive';
import { RevealText, SOFT_EASE } from '@/components/reveal-text';
import { APPROACH_LABELS, LANGUAGE_LABELS } from '@/components/specialist-card';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
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

/**
 * The landing's own dust placements. The shared DustField is split across two
 * calm sections here to keep the mote count — and the animation budget — exactly
 * where it was, and because each section's height is fixed. See components/olive.tsx.
 */
const DUST_UPPER: Mote[] = [
    { l: 8, t: 12, s: 2, d: 18, delay: -2 },
    { l: 22, t: 8, s: 1, d: 16, delay: -14 },
    { l: 35, t: 42, s: 1, d: 24, delay: -11 },
    { l: 70, t: 48, s: 1.5, d: 23, delay: -13 },
];

const DUST_LOWER: Mote[] = [
    { l: 52, t: 38, s: 1, d: 21, delay: -1 },
    { l: 86, t: 30, s: 2, d: 20, delay: -16 },
    { l: 30, t: 70, s: 1, d: 24, delay: -19 },
    { l: 82, t: 72, s: 1.5, d: 20, delay: -12 },
];

/** The support panel's quiet edges — it has no accordion, so percentages hold. */
const SUPPORT_DROPS: Drop[] = [
    { x: 3, y: '16%', fall: 150, dur: 10, delay: 0 },
    { x: 97, y: '30%', fall: 170, dur: 12, delay: -5 },
    { x: 2, y: '62%', fall: 140, dur: 11, delay: -7.5 },
    { x: 98, y: '74%', fall: 160, dur: 13, delay: -2 },
];

/** The approaches panel — fixed units, because its rows expand. */
const APPROACH_DROPS: Drop[] = [
    { x: 4, y: '5rem', fall: 130, dur: 11, delay: -1 },
    { x: 96, y: '11rem', fall: 150, dur: 13, delay: -6 },
    { x: 6, y: '19rem', fall: 120, dur: 10, delay: -8.5 },
];

export default function Home({ whatsappUrl, specialists = [] }: { whatsappUrl: string; specialists?: LandingSpecialist[] }) {
    const isGuest = !usePage<SharedData>().props.auth?.user;

    const mouseX = useMotionValue(50);
    const mouseY = useMotionValue(50);
    const spotlight = useMotionTemplate`radial-gradient(circle 450px at ${mouseX}% ${mouseY}%, rgba(176,177,171,0.22), rgba(146,147,141,0.08) 35%, transparent 70%)`;

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
        <div className="sanad-split min-h-screen">
            {/* Always-present crisis fast lane for visitors in distress — one tap to
            a real person on WhatsApp, no sign-up needed. */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ashen-800 hover:bg-ashen-900 text-ashen-100 fixed bottom-5 left-5 z-[70] inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 active:scale-95"
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
                        className="absolute inset-0 z-0 h-full w-full scale-110 transform-gpu object-cover blur-[2px] grayscale-[45%]"
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
                                        <a href={item.href} className="group hover:text-ashen-400 relative inline-block py-1 transition">
                                            {item.label}
                                            <span className="bg-ashen-200 absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            {/* wordmark dropped on phones once the two pills are here — three
                            items crowd a narrow bar, and the hero headline already says who
                            we are. It comes back on md. */}
                            <div className="text-ashen-200 hidden text-xl sm:block md:hidden">Sanad</div>
                            <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
                                {/* Guests only — the way back in for a practitioner or a
                                returning client. We stripped login links off most sections,
                                so the hero is where it belongs; a signed-in visitor gets the
                                dashboard shortcut in its place. Shown at every size. */}
                                {isGuest ? (
                                    <motion.a
                                        href="/login"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="border-ashen-200/40 text-ashen-200 hover:border-ashen-200/80 hover:bg-ashen-200/10 flex items-center rounded-full border px-4 py-1.5 text-sm transition md:py-2"
                                    >
                                        Log in
                                    </motion.a>
                                ) : (
                                    <motion.a
                                        href="/dashboard"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="border-ashen-200/40 text-ashen-200 hover:border-ashen-200/80 hover:bg-ashen-200/10 flex items-center rounded-full border px-4 py-1.5 text-sm transition md:py-2"
                                    >
                                        My space
                                    </motion.a>
                                )}
                                <motion.a
                                    href="#team"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-ashen-800 hover:bg-ashen-900 text-ashen-200 flex items-center gap-2 rounded-full py-1.5 pr-5 pl-2 text-sm transition md:gap-3 md:py-2"
                                >
                                    <span className="bg-ashen-200/30 rounded-full p-1 md:p-1.5">
                                        <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                                    </span>
                                    {/* just "Book" on phones so it fits beside Log in */}
                                    <span className="hidden sm:inline">Book a session</span>
                                    <span className="sm:hidden">Book</span>
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
                        <motion.a
                            href="#approaches"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="group absolute right-0 bottom-0 flex items-center gap-4 rounded-tl-[2.5rem] bg-[#90918a] p-6 pl-10 md:gap-6 md:pl-12"
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
                            <div className="border-ashen-900/30 bg-ashen-900/10 flex h-12 w-12 items-center justify-center rounded-full border transition-transform group-hover:rotate-45 md:h-14 md:w-14">
                                <ArrowUpRight className="text-ashen-900 h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-ashen-900 text-base md:text-xl">Our approach</p>
                                <div className="text-ashen-900/70 group-hover:text-ashen-900 flex items-center gap-1 transition">
                                    <span className="text-xs md:text-[15px]">How support works</span>
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </motion.a>
                    </div>
                </section>
            </div>

            {/* ===== CONTINUOUS CANVAS — transparent, so the page-wide light→dark
            split shows through beneath the auroras and every section ===== */}
            <div onMouseMove={handleMouseMove} className="relative overflow-hidden">
                {/* NOTE: the auroras and dust deliberately live INSIDE individual sections
                rather than here. Positioned against this canvas they used percentage tops,
                so every accordion (Methods, FAQ) changed the canvas height and dragged the
                whole background across the screen while the panel animated. Anchored to a
                section's top edge instead, they hold still: a section's top doesn't move
                when its own content grows downward. */}

                {/* mouse spotlight across the whole canvas */}
                <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />

                {/* ===== HOW ARE YOU FEELING — dark glowing panel ===== */}
                <section id="support" className="relative z-10 pt-8 pb-12 md:pt-10 md:pb-16">
                    {/* anchored to this section's top, not a % of the page — see the note on the canvas */}
                    <div
                        className="bg-ashen-400/14 pointer-events-none absolute top-[4rem] -left-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
                        style={{ animation: 'aurora-1 22s ease-in-out infinite' }}
                    />
                    <div
                        className="bg-ashen-300/12 pointer-events-none absolute top-[42rem] -right-40 h-[36rem] w-[36rem] rounded-full blur-3xl"
                        style={{ animation: 'aurora-2 26s ease-in-out infinite' }}
                    />
                    <DustField motes={DUST_UPPER} />

                    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
                        <div className="sanad-border from-ashen-700 to-ashen-800 border-ashen-300/25 relative overflow-hidden rounded-[2.5rem] border bg-gradient-to-br px-6 py-12 md:px-12 md:py-14">
                            {/* animating light glows inside the panel */}
                            <div className="bg-ashen-400/16 animate-breathe pointer-events-none absolute top-10 -left-10 h-72 w-72 rounded-full blur-3xl" />
                            <div className="bg-ashen-300/12 animate-breathe pointer-events-none absolute -right-10 bottom-10 h-80 w-80 rounded-full blur-3xl [animation-delay:-4s]" />
                            <div className="bg-ashen-400/12 animate-breathe pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 rounded-full blur-3xl [animation-delay:-7s]" />

                            {/* oil falling through the panel's quiet edges — light-toned to
                            carry against the dark gradient */}
                            <OliveDrops drops={SUPPORT_DROPS} tone="light" className="z-[5]" />

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
                                    <a href="/ongoing" className="group flex flex-col items-stretch gap-5 md:flex-row md:items-center md:gap-14">
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
                            className="h-full w-full object-cover grayscale-[45%]"
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
                    {/* top-anchored: stays put when the approach rows expand below it */}
                    <div
                        className="bg-ashen-200/20 pointer-events-none absolute top-[6rem] left-1/4 h-[30rem] w-[30rem] rounded-full blur-3xl"
                        style={{ animation: 'aurora-3 28s ease-in-out infinite' }}
                    />
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
                    Translucent glass — lets the page split glow through. */}
                    <div className="sanad-border bg-ashen-100/50 relative overflow-hidden rounded-[1.5rem] px-6 backdrop-blur-sm md:rounded-[2rem] md:px-10">
                        {/* soft olive branches framing inside the border — peace, life, and a
                        quiet nod to home. Clipped by the panel's overflow, sits behind the rows. */}
                        <motion.img
                            aria-hidden
                            src="/images/olive-branches.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            initial={{ opacity: 0, scale: 1.04 }}
                            whileInView={{ opacity: 0.4, scale: 1 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 1.4, ease: SOFT_EASE }}
                            className="pointer-events-none absolute inset-0 h-full w-full object-cover grayscale-[15%] select-none"
                        />
                        {/* dark-toned here: this panel is light glass over the olive branches */}
                        <OliveDrops drops={APPROACH_DROPS} tone="dark" className="z-[5]" />

                        <div className="divide-ashen-700/15 relative z-10 divide-y">
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
                <section id="team" className="relative z-10 scroll-mt-6 pt-6 pb-7 md:pt-7 md:pb-8">
                    {/* The band itself, feathered top and bottom. It used to be a solid block
                    dropped between two light sections, which left a hard seam straight across
                    the page at each edge. Everything decorative lives inside this layer, so
                    the mask fades the glows and the tree out with it. */}
                    <div className="from-ashen-700 to-ashen-800 pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b [mask-image:linear-gradient(to_bottom,transparent,black_6%,black_94%,transparent)]">
                        {/* Halved and no longer breathing. These were carrying the section's depth
                        back when it had no image behind it; the olive does that job now, and two
                        pulsing blooms at the edges only fought it. */}
                        <div className="bg-ashen-400/8 absolute top-10 -left-24 h-64 w-64 rounded-full blur-3xl" />
                        <div className="bg-ashen-300/6 absolute -right-24 bottom-10 h-64 w-64 rounded-full blur-3xl" />

                        {/* The olive behind the team, sunk low so only the canopy clears the
                        bottom edge — a treeline rather than a specimen. A whole tree piles its
                        weight in the centre, which is exactly where the cards sit. */}
                        <OliveHorizon />

                        <DustField motes={DUST_LOWER} />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
                        {/* One left-aligned column: heading, then the button directly under it.
                        The blurb and the shuffle note used to sit opposite in a second column
                        and were saying what the cards already show — losing them lets the
                        section close right up around the faces. */}
                        <div className="mb-4 md:mb-5">
                            <span className="text-ashen-300 text-sm font-medium tracking-[0.2em] uppercase">Meet the team</span>
                            <h2 className="font-display text-ashen-200 mt-2 text-3xl tracking-tight md:text-4xl">The people behind Sanad</h2>

                            {/* Shown to everyone, at every size — the phone landing needs a way
                            into the full directory too. Always the public directory, even for
                            signed-in clients, practitioners and admins: from the landing page a
                            visitor expects the public list, and bouncing them into a role-specific
                            dashboard view instead reads as a confusing detour. */}
                            <motion.a
                                href="/psychologists"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group bg-ashen-200 text-ashen-900 hover:bg-ashen-100 mt-4 inline-flex items-center gap-2 rounded-full py-2 pr-5 pl-2 text-sm font-medium transition"
                            >
                                <span className="bg-ashen-900/10 rounded-full p-1 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                                View all psychologists
                            </motion.a>
                        </div>

                        {/* A drag rail at every size, not a grid. With twenty specialists a grid
                        becomes a wall, and the cream matte that used to frame each photo was the
                        brightest thing on the page — the eye landed on the border instead of the
                        face. The photo is the card now. */}
                        <div className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 md:gap-5">
                            {specialists.map((m) => (
                                <motion.button
                                    key={m.slug}
                                    onClick={() => setSelected(m)}
                                    whileHover={{ y: -6 }}
                                    transition={{ duration: 0.45, ease: SOFT_EASE }}
                                    className="group relative aspect-[4/5] w-[78%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] text-left shadow-[0_30px_60px_-30px_rgba(20,21,15,0.75)] sm:w-[45%] lg:w-[31%]"
                                >
                                    {m.photo_path ? (
                                        <img
                                            src={m.photo_path}
                                            alt={m.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="absolute inset-0 h-full w-full object-cover grayscale-[35%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                                        />
                                    ) : (
                                        <div className="from-ashen-300 to-ashen-500 absolute inset-0 bg-gradient-to-br" />
                                    )}

                                    {/* the name rests on the photo instead of on a frame below it */}
                                    <div className="from-ashen-950/90 via-ashen-950/25 absolute inset-0 bg-gradient-to-t to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <h3 className="font-display text-ashen-100 text-xl md:text-2xl">{m.name}</h3>
                                        {m.headline && <p className="text-ashen-300 mt-1 text-xs">{m.headline}</p>}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* confident, licensed practice statement */}
                        <p className="text-ashen-400 mt-5 max-w-3xl text-xs leading-relaxed">
                            Every Sanad clinician is a licensed clinical psychologist, and Sanad is a fully licensed, confidential clinical practice.
                            For a medical emergency or if you are in danger, please contact your local emergency number.
                        </p>
                    </div>
                </section>

                {/* ===== FAQ — "Ask away" (skewed photo + hairline list) ===== */}
                {/* z-20: sits above the closing panel so the olive crown growing up from
                it passes BEHIND this text rather than over it. */}
                <section id="faq" className="relative z-20 mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
                    {/* top-anchored: the whole reason the background used to slide when a
                    question opened was this blob being positioned by page percentage */}
                    <div
                        className="bg-ashen-300/15 pointer-events-none absolute top-[5rem] -left-32 h-[30rem] w-[30rem] rounded-full blur-3xl"
                        style={{ animation: 'aurora-2 30s ease-in-out infinite' }}
                    />
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
                                <div className="from-ashen-700 to-ashen-800 text-ashen-200 relative overflow-hidden bg-gradient-to-br p-6">
                                    {/* soft warm glow — keeps the brand's light touch without a photo */}
                                    <div className="bg-ashen-300/20 animate-breathe pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl" />
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
                                className="group bg-ashen-800 hover:bg-ashen-900 text-ashen-200 mt-7 inline-flex items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-sm font-medium transition"
                            >
                                <span className="bg-ashen-200/30 rounded-full p-1 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                                Get in touch
                            </a>
                        </div>

                        {/* right — hairline +/- list (darker hairlines: this column
                        sits on the darker side of the page split) */}
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
                    {/* Deliberately NOT clipped: the olive tree is rooted in this panel but
                    its crown escapes upward into the FAQ, tying the closing sections into
                    one composition. The panel's own surface is clipped separately below. */}
                    <div className="relative mx-auto max-w-6xl">
                        {/* panel surface + glows — clipped to the rounded shape */}
                        <div className="from-ashen-100/55 to-ashen-300/40 border-ashen-600/30 pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem] border bg-gradient-to-br backdrop-blur-sm md:rounded-[3.5rem]">
                            <div className="bg-ashen-300/14 animate-breathe pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full blur-3xl" />
                            <div className="bg-ashen-200/20 animate-breathe pointer-events-none absolute -right-10 -bottom-10 h-72 w-72 rounded-full blur-3xl [animation-delay:-4s]" />
                        </div>

                        <OliveTree />

                        <div className="relative z-10 px-6 py-12 text-center md:py-16">
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
                                href="#team"
                                className="group bg-ashen-800 hover:bg-ashen-900 text-ashen-200 mt-8 inline-flex items-center gap-2.5 rounded-full py-3 pr-6 pl-3 text-sm font-medium transition"
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
            <footer id="contact" className="bg-ashen-800 text-ashen-200 relative scroll-mt-20 overflow-hidden">
                {/* soft on-brand glow for a little depth — solid color, no photo */}
                <div
                    aria-hidden
                    className="bg-ashen-600/30 pointer-events-none absolute top-0 -left-32 h-80 w-80 rounded-full blur-3xl"
                    style={{ animation: 'aurora-1 26s ease-in-out infinite' }}
                />

                <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-14">
                    {/* link columns */}
                    <div className="grid grid-cols-2 gap-10 pb-10 md:grid-cols-4">
                        {/* brand */}
                        <div className="col-span-2 md:col-span-1">
                            <p className="font-display text-2xl">Sanad</p>
                            <p className="text-ashen-300 mt-3 max-w-xs text-sm leading-relaxed">
                                A safe space for your mind — real, licensed psychological care, guided with warmth.
                            </p>
                        </div>

                        {/* explore */}
                        <div>
                            <p className="text-ashen-300 text-xs font-medium tracking-[0.15em] uppercase">Explore</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li>
                                    <a href="#support" className="hover:text-ashen-100 transition">
                                        In-the-moment support
                                    </a>
                                </li>
                                <li>
                                    <a href="#approaches" className="hover:text-ashen-100 transition">
                                        Our approaches
                                    </a>
                                </li>
                                <li>
                                    <a href="#team" className="hover:text-ashen-100 transition">
                                        Our team
                                    </a>
                                </li>
                                <li>
                                    <a href="#faq" className="hover:text-ashen-100 transition">
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* contact */}
                        <div>
                            <p className="text-ashen-300 text-xs font-medium tracking-[0.15em] uppercase">Reach us</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li>
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-ashen-100 flex items-center gap-2.5 transition"
                                    >
                                        <MessageCircle className="text-ashen-300 h-4 w-4" /> WhatsApp us
                                    </a>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <MapPin className="text-ashen-300 h-4 w-4" /> Beirut, Lebanon
                                </li>
                            </ul>
                        </div>

                        {/* reassurance */}
                        <div>
                            <p className="text-ashen-300 text-xs font-medium tracking-[0.15em] uppercase">Why trust us</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li className="flex items-center gap-2.5">
                                    <ShieldCheck className="text-ashen-300 h-4 w-4" /> Private &amp; confidential
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Sparkles className="text-ashen-300 h-4 w-4" /> Licensed clinical psychologists
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Globe className="text-ashen-300 h-4 w-4" /> Arabic · English · French
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* bottom bar */}
                    <div className="border-ashen-300/15 flex flex-col gap-4 border-t pt-8 md:flex-row md:items-center md:justify-between">
                        <p className="text-ashen-200/60 text-xs">© {new Date().getFullYear()} Sanad. All rights reserved.</p>
                        <div className="text-ashen-200/70 flex items-center gap-6 text-xs">
                            <a href="/privacy" className="hover:text-ashen-100 transition">
                                Privacy
                            </a>
                            <a href="/terms" className="hover:text-ashen-100 transition">
                                Terms
                            </a>
                            <a href="#faq" className="hover:text-ashen-100 transition">
                                FAQ
                            </a>
                        </div>
                    </div>

                    {/* licensed-practice statement */}
                    <p className="text-ashen-200/70 mt-6 max-w-3xl text-[11px] leading-relaxed">
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
                            // The same diagonal gradient as .sanad-card, but opaque: this sits over a dark
                            // scrim, so a translucent panel would pull that darkness up through the
                            // text. Flat white was the one profile surface left in the app.
                            className="from-ashen-50 to-ashen-200 relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-gradient-to-br shadow-2xl md:flex-row"
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
                                    <img src={selected.photo_path} alt={selected.name} className="h-full w-full object-cover grayscale-[15%]" />
                                ) : (
                                    <div className="from-ashen-300 to-ashen-500 h-full w-full bg-gradient-to-br" />
                                )}
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                                <h3 className="font-display text-ashen-900 text-3xl">{selected.name}</h3>
                                {selected.headline && <p className="text-ashen-600 mt-1 text-sm">{selected.headline}</p>}
                                {selected.bio && <p className="text-ashen-700 mt-5 leading-relaxed">{selected.bio}</p>}

                                <div className="mt-6 space-y-4">
                                    {selected.approaches.length > 0 && (
                                        <div>
                                            <p className="text-ashen-600 text-xs tracking-wider uppercase">Approaches</p>
                                            <p className="text-ashen-700 mt-1 text-sm">
                                                {selected.approaches.map((a) => APPROACH_LABELS[a] ?? a).join(' · ')}
                                            </p>
                                        </div>
                                    )}
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
                                    className="bg-ashen-800 hover:bg-ashen-900 text-ashen-200 mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition"
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
