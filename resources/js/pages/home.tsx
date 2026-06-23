import { ArrowUpRight, ChevronDown, ChevronRight, Clock, Globe, LifeBuoy, Mail, MapPin, MessageCircle, Play, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';

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

export default function Home({ whatsappUrl, specialists = [] }: { whatsappUrl: string; specialists?: { id: number; name: string }[] }) {
    // Match a landing team card to its real practitioner record (by name) so its
    // "Book" button can deep-link into that psychologist's public booking page.
    // Falls back to /register if there's no matching approved practitioner.
    const bookingHref = (name: string) => {
        const match = specialists.find((s) => s.name.toLowerCase() === name.toLowerCase());
        return match ? `/book/${match.id}` : '/register';
    };

    const mouseX = useMotionValue(50);
    const mouseY = useMotionValue(50);
    const spotlight = useMotionTemplate`radial-gradient(circle 450px at ${mouseX}% ${mouseY}%, rgba(232,217,191,0.45), rgba(212,180,131,0.15) 35%, transparent 70%)`;

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

    // every specialist is trained across the same approaches — no per-person roles
    const sharedApproaches = ['CBT', 'EMDR', 'Psychoanalysis'];

    const team = [
        {
            name: 'Sireen Al Bast',
            photo: '/images/team/sireen.jpg',
            languages: ['Arabic', 'English', 'French'],
            details:
                'Sireen is a licensed clinical psychologist offering calm, attentive care across CBT, EMDR and psychoanalytic approaches. Every session is private and confidential.',
        },
        {
            name: 'Hanna Aylo',
            photo: '/images/team/hanna.jpg',
            languages: ['Arabic', 'English'],
            details:
                'Hanna is a licensed clinical psychologist offering warm, steady care across CBT, EMDR and psychoanalytic approaches. Every session is private and confidential.',
        },
    ];

    const [selected, setSelected] = useState<(typeof team)[number] | null>(null);

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
        <div className="bg-cream min-h-screen">
            {/* Always-present crisis fast lane for visitors in distress — one tap to
            a real person on WhatsApp, no sign-up needed. */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-5 left-5 z-[70] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95"
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
                            <ul className="hidden items-center gap-8 text-sm text-white/90 md:flex">
                                {[
                                    { label: 'Services', href: '#support' },
                                    { label: 'Our team', href: '#team' },
                                    { label: 'Approach', href: '#approaches' },
                                    { label: 'Contact', href: '#contact' },
                                ].map((item) => (
                                    <li key={item.href}>
                                        <a href={item.href} className="group relative inline-block py-1 transition hover:text-white">
                                            {item.label}
                                            <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <div className="text-xl text-white md:hidden">Sanad</div>
                            <div className="flex flex-1 justify-end">
                                <motion.a
                                    href="/register"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-sage-700 hover:bg-sage-800 flex items-center gap-2 rounded-full py-1.5 pr-5 pl-2 text-sm text-white transition md:gap-3 md:py-2"
                                >
                                    <span className="rounded-full bg-white/20 p-1 md:p-1.5">
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
                                className="mb-3 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 backdrop-blur-md"
                            >
                                <Sparkles className="h-4 w-4 text-white" />
                                <span className="text-sm text-white">Licensed clinical psychologists</span>
                            </motion.div>

                            <h1 className="mb-2 text-4xl leading-[1.05] font-normal tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[80px]">
                                <RevealText text="A safe space for your mind" delay={0.25} stagger={0.09} />
                            </h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base md:text-lg"
                            >
                                Real, confidential sessions with licensed clinical psychologists — online, on your schedule, guided with care.
                            </motion.p>
                        </div>

                        {/* bottom-left glass card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute bottom-6 left-6 hidden min-w-[170px] flex-col gap-3 rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:flex md:bottom-10 md:left-10"
                        >
                            <div>
                                <p className="text-3xl font-normal tracking-tight text-white">12</p>
                                <p className="text-[11px] tracking-wider text-white/60 uppercase">Caring specialists</p>
                            </div>
                            <motion.a
                                href="#team"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="text-ashen-800 flex w-fit items-center gap-2 self-start rounded-full bg-white py-1.5 pr-5 pl-1.5 text-sm transition hover:bg-white/90"
                            >
                                <span className="bg-sage-700/10 rounded-full p-1">
                                    <ArrowUpRight className="text-sage-700 h-4 w-4" />
                                </span>
                                Meet the team
                            </motion.a>
                        </motion.div>

                        {/* bottom-right CUT-OUT card (notched into the corner, like the reference) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-cream absolute right-0 bottom-0 flex items-center gap-4 rounded-tl-[2.5rem] p-6 pl-10 md:gap-6 md:pl-12"
                        >
                            {/* concave corner masks — make the notch blend smoothly into the card */}
                            <div className="pointer-events-none absolute -top-[2.5rem] right-0 h-[2.5rem] w-[2.5rem]">
                                <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#faf6ef" />
                                </svg>
                            </div>
                            <div className="pointer-events-none absolute bottom-0 -left-[2.5rem] h-[2.5rem] w-[2.5rem]">
                                <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#faf6ef" />
                                </svg>
                            </div>

                            {/* content */}
                            <div className="border-ashen-300 bg-ashen-900/5 flex h-12 w-12 items-center justify-center rounded-full border md:h-14 md:w-14">
                                <ArrowUpRight className="text-ashen-700 h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-ashen-800 text-base md:text-xl">Our approach</p>
                                <div className="text-ashen-500 hover:text-ashen-700 flex cursor-pointer items-center gap-1 transition">
                                    <span className="text-xs md:text-[15px]">How support works</span>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>

            {/* ===== CONTINUOUS CANVAS — one seamless background for all content ===== */}
            <div onMouseMove={handleMouseMove} className="from-cream via-ashen-100 to-cream relative overflow-hidden bg-gradient-to-b">
                {/* always-on aurora spanning the WHOLE canvas (both sections) */}
                <div
                    className="bg-sage-400/40 pointer-events-none absolute top-[4%] -left-40 h-[38rem] w-[38rem] rounded-full blur-3xl"
                    style={{ animation: 'aurora-1 22s ease-in-out infinite' }}
                />
                <div
                    className="pointer-events-none absolute top-[26%] -right-40 h-[42rem] w-[42rem] rounded-full bg-amber-300/35 blur-3xl"
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

                {/* golden rays from the top */}
                <div
                    className="pointer-events-none absolute -top-20 -left-20 h-[40rem] w-[28rem] origin-top-left -rotate-12 bg-gradient-to-b from-amber-200/40 via-amber-100/15 to-transparent blur-2xl"
                    style={{ animation: 'ray-sweep 14s ease-in-out infinite' }}
                />
                <div
                    className="pointer-events-none absolute -top-20 -right-20 h-[40rem] w-[28rem] origin-top-right rotate-12 bg-gradient-to-b from-amber-200/40 via-amber-100/15 to-transparent blur-2xl"
                    style={{ animation: 'ray-sweep 14s ease-in-out infinite reverse', animationDelay: '-3s' }}
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
                        <div className="sanad-border from-ashen-500 to-ashen-700 relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br px-6 py-12 md:px-12 md:py-14">
                            {/* animating light glows inside the panel */}
                            <div className="bg-sage-500/40 animate-breathe pointer-events-none absolute top-10 -left-10 h-72 w-72 rounded-full blur-3xl" />
                            <div className="bg-beige/40 animate-breathe pointer-events-none absolute -right-10 bottom-10 h-80 w-80 rounded-full blur-3xl [animation-delay:-4s]" />
                            <div className="bg-sage-500/30 animate-breathe pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 rounded-full blur-3xl [animation-delay:-7s]" />

                            {/* content above the glows */}
                            <div className="relative z-10">
                                {/* header: heading left, button right */}
                                <div className="mb-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
                                    <div>
                                        <span className="text-sage-300 text-sm font-medium tracking-[0.2em] uppercase">In-the-moment support</span>
                                        <h2 className="font-display mt-3 text-4xl tracking-tight text-white md:text-5xl">
                                            Let's start where you are
                                        </h2>
                                    </div>
                                    <a
                                        href="#faq"
                                        className="group text-ashen-900 inline-flex items-center gap-2.5 rounded-full bg-white py-2 pr-5 pl-2 text-sm font-medium transition hover:bg-white/90"
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
                                                    <span className="bg-beige absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                                                    <span className="bg-beige relative inline-flex h-2.5 w-2.5 rounded-full" />
                                                </span>
                                                <span className="text-beige text-xs font-medium tracking-[0.15em] uppercase">
                                                    If it just happened
                                                </span>
                                            </div>
                                            <h3 className="font-display group-hover:text-beige text-4xl tracking-tight text-white transition-colors md:text-5xl">
                                                Emergency First Aid
                                            </h3>
                                            <p className="text-ashen-300 mt-4 max-w-md leading-relaxed">
                                                For a shock that's still fresh — within the last hours. Immediate, guided grounding to help you feel
                                                safe right now.
                                            </p>
                                            <ul className="mt-6 hidden space-y-2.5 md:block">
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-beige/20 text-beige flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        1
                                                    </span>
                                                    Find safety
                                                </li>
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-beige/20 text-beige flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        2
                                                    </span>
                                                    Full-body reset
                                                </li>
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-beige/20 text-beige flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        3
                                                    </span>
                                                    Steady your focus
                                                </li>
                                            </ul>
                                            <p className="text-ashen-400 mt-5 hidden items-center gap-1.5 text-sm md:flex">
                                                <Clock className="h-4 w-4" /> Available now · ~3 minutes
                                            </p>
                                            <span className="text-beige mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-3">
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
                                                <span className="bg-sage-300 h-2.5 w-2.5 rounded-full" />
                                                <span className="text-sage-300 text-xs font-medium tracking-[0.15em] uppercase">
                                                    If it's been a while
                                                </span>
                                            </div>
                                            <h3 className="font-display group-hover:text-sage-300 text-4xl tracking-tight text-white transition-colors md:text-5xl">
                                                Ongoing Support
                                            </h3>
                                            <p className="text-ashen-300 mt-4 max-w-md leading-relaxed">
                                                For something from days, weeks, or longer ago — gentle support to process what happened, at your own
                                                pace.
                                            </p>
                                            <ul className="mt-6 hidden space-y-2.5 md:block">
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-sage-500/20 text-sage-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        1
                                                    </span>
                                                    Talk it through
                                                </li>
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-sage-500/20 text-sage-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        2
                                                    </span>
                                                    Guided sessions over time
                                                </li>
                                                <li className="text-ashen-300 flex items-center gap-2.5 text-sm">
                                                    <span className="bg-sage-500/20 text-sage-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                                                        3
                                                    </span>
                                                    At your own pace
                                                </li>
                                            </ul>
                                            <p className="text-ashen-400 mt-5 hidden items-center gap-1.5 text-sm md:flex">
                                                <Clock className="h-4 w-4" /> Whenever you're ready
                                            </p>
                                            <span className="text-sage-300 mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-3">
                                                Explore support →
                                            </span>
                                        </motion.div>
                                    </a>
                                </div>

                                <p className="text-ashen-400 mx-auto mt-12 max-w-xl text-center text-sm">
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
                        <img src="/images/support/ongoing.jpg" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        <div className="bg-ashen-950/55 absolute inset-0" />
                        <div className="from-ashen-950/80 to-ashen-950/30 absolute inset-0 bg-gradient-to-t via-transparent" />
                    </motion.div>

                    {/* the emotional line — two halves drift toward each other on scroll */}
                    <div className="relative z-10 flex h-full items-center">
                        <div className="mx-auto w-full max-w-6xl px-6">
                            <p className="text-sage-300 mb-4 text-sm font-medium tracking-[0.25em] uppercase">However you arrived here</p>
                            <h2 className="font-display flex flex-col text-4xl leading-[1.05] text-white sm:text-5xl md:text-7xl lg:text-8xl">
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
                <section id="approaches" className="relative z-10 mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16">
                    <div className="mb-6 max-w-2xl md:mb-8">
                        <span className="text-sage-700 text-sm font-medium tracking-[0.2em] uppercase">Our approaches</span>
                        <h2 className="font-display text-ashen-800 mt-3 text-3xl tracking-tight md:text-5xl">Methods, guided by specialists</h2>
                        <p className="text-ashen-500 mt-4 max-w-xl leading-relaxed">
                            Evidence-based approaches, explained simply. Your licensed psychologist will help choose what fits you.
                        </p>
                    </div>

                    {/* defined panel with an animated, on-brand glowing border (cinematic) */}
                    <div className="sanad-border relative overflow-hidden rounded-[1.5rem] bg-white/55 px-6 backdrop-blur-sm md:rounded-[2rem] md:px-10">
                        <div className="divide-ashen-200/70 divide-y">
                            {approaches.map((a, i) => {
                                const isOpen = open === i;
                                return (
                                    <div key={a.abbr}>
                                        <button
                                            onClick={() => setOpen(isOpen ? null : i)}
                                            className="group flex w-full items-center gap-5 py-7 text-left md:gap-8 md:py-9"
                                        >
                                            <span className="font-display text-ashen-400 w-7 shrink-0 text-sm tabular-nums md:text-base">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="font-display text-ashen-800 group-hover:text-sage-700 flex-1 text-2xl tracking-tight transition-colors md:text-4xl">
                                                {a.abbr}
                                            </span>
                                            <span className="text-ashen-500 hidden max-w-[16rem] text-sm leading-snug lg:block">{a.summary}</span>
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'border-sage-700 bg-sage-700 rotate-45 text-white' : 'border-ashen-300 text-sage-700 group-hover:border-sage-500'}`}
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
                                                        <p className="text-ashen-600 max-w-2xl leading-relaxed md:text-lg">{a.body}</p>
                                                        <p className="text-sage-700 mt-4 text-sm font-medium">Best for: {a.best}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
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
                        <span className="text-sage-700 border-sage-200 group-hover:border-sage-400 group-hover:bg-sage-50 inline-flex items-center gap-2 rounded-full border bg-white/60 px-4 py-1.5 text-xs font-medium tracking-[0.15em] uppercase transition">
                            <Sparkles className="h-3.5 w-3.5" /> Ready when you are
                        </span>
                        <span className="font-display text-ashen-800 group-hover:text-sage-700 mt-2 text-2xl tracking-tight transition-colors md:text-4xl">
                            See our specialists &amp; book your session
                        </span>
                        <span className="text-ashen-500 text-sm">Find the right person for you — in just a couple of minutes</span>

                        {/* floating arrows: a downward wave that draws the eye to the team */}
                        <div className="mt-3 flex flex-col items-center -space-y-3">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    animate={{ opacity: [0.15, 1, 0.15], y: [0, 4, 0] }}
                                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                                >
                                    <ChevronDown className="text-sage-600 size-7" />
                                </motion.span>
                            ))}
                        </div>
                    </motion.a>
                </section>

                {/* ===== HONEST NUMBERS — a quiet, true stat strip ===== */}
                <section className="relative z-10 mx-auto max-w-5xl px-6 pb-6 md:px-8 md:pb-10">
                    <div className="border-ashen-200/70 grid grid-cols-3 gap-4 border-y py-8 text-center md:py-10">
                        {[
                            { n: '100%', l: 'Licensed psychologists' },
                            { n: '3', l: 'Evidence-based approaches' },
                            { n: '3', l: 'Languages · Ar · En · Fr' },
                        ].map((s, i) => (
                            <div key={s.l} className={i > 0 ? 'border-ashen-200/70 border-l' : ''}>
                                <p className="font-display text-ashen-800 text-4xl tracking-tight md:text-6xl">{s.n}</p>
                                <p className="text-ashen-500 mx-auto mt-2 max-w-[10rem] text-xs leading-snug tracking-wide uppercase">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== MEET THE TEAM — framed, angled specialist cards on a colored band ===== */}
                <section id="team" className="from-ashen-700 to-ashen-800 relative z-10 bg-gradient-to-b py-12 md:py-16">
                    {/* soft on-brand glow for depth (no photo) */}
                    <div className="bg-sage-500/20 animate-breathe pointer-events-none absolute top-10 -left-20 h-72 w-72 rounded-full blur-3xl" />
                    <div className="bg-beige/15 animate-breathe pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full blur-3xl [animation-delay:-4s]" />

                    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
                        <div className="mb-8 max-w-2xl">
                            <span className="text-sage-300 text-sm font-medium tracking-[0.2em] uppercase">Meet the team</span>
                            <h2 className="font-display mt-3 text-3xl tracking-tight text-white md:text-5xl">The people behind Sanad</h2>
                            <p className="text-ashen-200 mt-4 max-w-xl leading-relaxed">
                                Every Sanad psychologist is a licensed clinical psychologist, trained across all our approaches — CBT, EMDR and
                                psychoanalysis. <span className="text-white">Real care, real credentials.</span>
                            </p>
                        </div>

                        {/* steady framed cards — swipe carousel on phone, grid on desktop */}
                        <div className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
                            {team.map((m) => (
                                <motion.button
                                    key={m.name}
                                    onClick={() => setSelected(m)}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.3, ease: SOFT_EASE }}
                                    className="group bg-cream block w-[72%] shrink-0 snap-center rounded-[1.25rem] p-3 text-left shadow-[0_30px_60px_-30px_rgba(20,21,15,0.7)] sm:w-full sm:shrink"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-[0.85rem]">
                                        <img
                                            src={m.photo}
                                            alt={m.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="absolute inset-0 h-full w-full object-cover grayscale-[30%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                        />
                                        <span className="bg-beige/90 text-ashen-800 absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                                            Licensed Psychologist
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between gap-3 px-1 pt-3.5">
                                        <div>
                                            <h3 className="font-display text-ashen-800 text-xl">{m.name}</h3>
                                            <p className="text-ashen-500 mt-0.5 text-xs">Licensed clinical psychologist</p>
                                        </div>
                                        <span className="text-sage-700 shrink-0 text-sm font-medium opacity-0 transition group-hover:opacity-100">
                                            View →
                                        </span>
                                    </div>
                                </motion.button>
                            ))}

                            {/* ghost card — signals more specialists to come */}
                            <div className="flex min-h-[16rem] w-[72%] shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-[1.25rem] border-2 border-dashed border-white/25 p-6 text-center sm:min-h-[20rem] sm:w-full sm:shrink">
                                <span className="font-display text-4xl text-white/40">+</span>
                                <p className="text-sm text-white/60">More specialists joining soon</p>
                            </div>
                        </div>

                        {/* confident, licensed practice statement */}
                        <p className="mt-7 max-w-3xl text-xs leading-relaxed text-white/55">
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
                            <span className="text-sage-700 text-sm font-medium tracking-[0.2em] uppercase">FAQ</span>
                            <h2 className="font-display text-ashen-800 mt-3 text-3xl leading-[1.05] tracking-tight md:text-5xl">Ask away</h2>
                            <p className="text-ashen-500 mt-4 max-w-sm leading-relaxed">
                                Everything you might want to know before you begin. Can't find your answer? We're only a message away.
                            </p>

                            <TiltCard
                                from="left"
                                tilt={6}
                                className="relative mt-8 hidden aspect-[4/5] w-full max-w-[18rem] overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-30px_rgba(37,38,31,0.5)] md:block"
                            >
                                <img
                                    src={team[0].photo}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 h-full w-full object-cover grayscale-[30%]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <p className="text-sm font-medium text-white">Talk to a real person</p>
                                    <p className="text-xs text-white/70">We usually reply within a day</p>
                                </div>
                            </TiltCard>

                            <a
                                href="/register"
                                className="group bg-sage-700 hover:bg-sage-800 mt-7 inline-flex items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-sm font-medium text-white transition"
                            >
                                <span className="rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                                Get in touch
                            </a>
                        </div>

                        {/* right — hairline +/- list */}
                        <div className="border-ashen-200/70 border-t">
                            {faqs.map((f, i) => {
                                const isOpen = openFaq === i;
                                return (
                                    <div key={f.q} className="border-ashen-200/70 border-b">
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : i)}
                                            className="group flex w-full items-start gap-4 py-6 text-left md:gap-5"
                                        >
                                            <span
                                                className={`font-display mt-1 text-sm tabular-nums transition-colors ${isOpen ? 'text-sage-700' : 'text-ashen-400'}`}
                                            >
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="font-display text-ashen-800 group-hover:text-sage-700 flex-1 text-lg transition-colors md:text-xl">
                                                {f.q}
                                            </span>
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'border-sage-700 bg-sage-700 rotate-45 text-white' : 'border-ashen-300 text-sage-700 group-hover:border-sage-400'}`}
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
                                                    <p className="text-ashen-500 max-w-xl pr-6 pb-6 pl-[2.75rem] leading-relaxed">{f.a}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ===== FINAL CTA — calm on-brand panel to close ===== */}
                <section className="relative z-10 px-6 pb-12 md:pb-16">
                    <div className="from-sage-100 to-cream border-sage-200/60 relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border bg-gradient-to-br px-6 py-12 text-center md:rounded-[3.5rem] md:py-16">
                        <div className="bg-sage-300/30 animate-breathe pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full blur-3xl" />
                        <div className="bg-sage-200/40 animate-breathe pointer-events-none absolute -right-10 -bottom-10 h-72 w-72 rounded-full blur-3xl [animation-delay:-4s]" />
                        <div className="relative z-10">
                            <span className="text-sage-700 border-sage-200 inline-flex items-center gap-2 rounded-full border bg-white/60 px-4 py-1.5 text-xs font-medium tracking-[0.15em] uppercase">
                                <span className="bg-sage-500 h-1.5 w-1.5 rounded-full" /> Proudly Lebanese · Beirut
                            </span>
                            <h2 className="font-display text-ashen-900 mx-auto mt-4 max-w-2xl text-3xl leading-[1.05] tracking-tight md:text-5xl">
                                Care that feels like home.
                            </h2>
                            <p className="text-ashen-600 mx-auto mt-4 max-w-md leading-relaxed">
                                Real, confidential care from licensed clinical psychologists — in your language, on your schedule, at your own pace.
                            </p>
                            <a
                                href="/register"
                                className="group bg-sage-700 hover:bg-sage-800 mt-8 inline-flex items-center gap-2.5 rounded-full py-3 pr-6 pl-3 text-sm font-medium text-white transition"
                            >
                                <span className="rounded-full bg-white/20 p-1.5 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="h-5 w-5" />
                                </span>
                                Book a session
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* ===== FOOTER — cinematic, Lebanese identity + trust ===== */}
            <footer id="contact" className="bg-ashen-950 relative scroll-mt-20 overflow-hidden text-white">
                {/* soft on-brand glow for a little depth — solid color, no photo */}
                <div
                    aria-hidden
                    className="bg-sage-700/20 pointer-events-none absolute top-0 -left-32 h-80 w-80 rounded-full blur-3xl"
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
                            <p className="text-ashen-500 text-xs font-medium tracking-[0.15em] uppercase">Explore</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li>
                                    <a href="#support" className="transition hover:text-white">
                                        In-the-moment support
                                    </a>
                                </li>
                                <li>
                                    <a href="#approaches" className="transition hover:text-white">
                                        Our approaches
                                    </a>
                                </li>
                                <li>
                                    <a href="#team" className="transition hover:text-white">
                                        Our team
                                    </a>
                                </li>
                                <li>
                                    <a href="#faq" className="transition hover:text-white">
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* contact */}
                        <div>
                            <p className="text-ashen-500 text-xs font-medium tracking-[0.15em] uppercase">Reach us</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li>
                                    <a href="mailto:hello@sanad.com" className="flex items-center gap-2.5 transition hover:text-white">
                                        <Mail className="text-sage-400 h-4 w-4" /> hello@sanad.com
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 transition hover:text-white"
                                    >
                                        <MessageCircle className="text-sage-400 h-4 w-4" /> WhatsApp us
                                    </a>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <MapPin className="text-sage-400 h-4 w-4" /> Beirut, Lebanon
                                </li>
                            </ul>
                        </div>

                        {/* reassurance */}
                        <div>
                            <p className="text-ashen-500 text-xs font-medium tracking-[0.15em] uppercase">Why trust us</p>
                            <ul className="text-ashen-300 mt-4 space-y-3 text-sm">
                                <li className="flex items-center gap-2.5">
                                    <ShieldCheck className="text-sage-400 h-4 w-4" /> Private &amp; confidential
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Sparkles className="text-sage-400 h-4 w-4" /> Under certified supervision
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Globe className="text-sage-400 h-4 w-4" /> Arabic · English · French
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* bottom bar */}
                    <div className="flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-white/50">© {new Date().getFullYear()} Sanad. All rights reserved.</p>
                        <div className="flex items-center gap-6 text-xs text-white/60">
                            <a href="/privacy" className="transition hover:text-white">
                                Privacy
                            </a>
                            <a href="/terms" className="transition hover:text-white">
                                Terms
                            </a>
                            <a href="#faq" className="transition hover:text-white">
                                FAQ
                            </a>
                        </div>
                    </div>

                    {/* licensed-practice statement */}
                    <p className="mt-6 max-w-3xl text-[11px] leading-relaxed text-white/40">
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
                                className="text-ashen-700 absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur transition hover:bg-white"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="relative h-52 w-full shrink-0 sm:h-64 md:h-auto md:w-2/5">
                                <img src={selected.photo} alt={selected.name} className="h-full w-full object-cover" />
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                                <span className="bg-sage-100 text-sage-700 rounded-full px-3 py-1 text-xs font-medium">
                                    Licensed Clinical Psychologist
                                </span>
                                <h3 className="font-display text-ashen-800 mt-4 text-3xl">{selected.name}</h3>
                                <p className="text-ashen-500 mt-1 text-sm">Licensed clinical psychologist · Private &amp; confidential</p>
                                <p className="text-ashen-600 mt-5 leading-relaxed">{selected.details}</p>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <p className="text-ashen-400 text-xs tracking-wider uppercase">Approaches</p>
                                        <p className="text-ashen-700 mt-1 text-sm">{sharedApproaches.join(' · ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-ashen-400 text-xs tracking-wider uppercase">Languages</p>
                                        <p className="text-ashen-700 mt-1 text-sm">{selected.languages.join(' · ')}</p>
                                    </div>
                                </div>

                                <a
                                    href={bookingHref(selected.name)}
                                    className="bg-sage-700 hover:bg-sage-800 mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition"
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
