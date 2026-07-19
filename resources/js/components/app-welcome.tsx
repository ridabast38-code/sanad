import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { ArrowUpRight, LifeBuoy, Sparkles, Users } from 'lucide-react';

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * The native app's front door for logged-out users. Instead of the marketing
 * landing (hero, FAQ, team, footer), it opens straight into a calm "doorway" of
 * the things you can actually do without an account — log in, browse specialists,
 * or reach guided/urgent support. Only shown inside the app (see isNativeApp());
 * the website keeps its full landing page.
 */
export function AppWelcome({ whatsappUrl, specialistCount = 0 }: { whatsappUrl: string; specialistCount?: number }) {
    const doors = [
        {
            href: '/psychologists',
            icon: Users,
            title: 'Browse psychologists',
            sub: specialistCount > 0 ? `${specialistCount} licensed specialists` : 'Licensed specialists',
        },
        {
            href: '/ongoing',
            icon: Sparkles,
            title: 'Ongoing support',
            sub: 'A guided space, at your pace',
        },
    ];

    return (
        <div className="sanad-split text-ashen-800 flex min-h-dvh flex-col overflow-hidden px-6 pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            {/* soft breathing glow, matching the auth screens */}
            <div
                aria-hidden
                className="bg-ashen-300/25 pointer-events-none absolute -top-16 -right-20 h-72 w-72 rounded-full blur-3xl"
                style={{ animation: 'breathe 9s ease-in-out infinite' }}
            />

            {/* Brand + welcome */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="relative">
                <img src="/app-icon.png?v=7" alt="" aria-hidden className="size-16 rounded-[22%] shadow-sm" draggable={false} />
                <h1 className="font-display text-ashen-800 mt-6 text-4xl leading-[1.05] tracking-tight">
                    A safe space
                    <br />
                    for your mind
                </h1>
                <p className="text-ashen-600 mt-3 max-w-sm text-sm leading-relaxed">
                    Real, confidential sessions with licensed clinical psychologists — online, on your schedule, guided with care.
                </p>
            </motion.div>

            {/* Pre-login doors */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className="mt-8 flex flex-col gap-3"
            >
                {doors.map((d) => (
                    <Link
                        key={d.href}
                        href={d.href}
                        className="sanad-card group flex items-center gap-4 rounded-2xl p-4 transition active:scale-[0.99]"
                    >
                        <span className="bg-ashen-100 text-ashen-700 flex size-11 shrink-0 items-center justify-center rounded-full">
                            <d.icon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="text-ashen-800 block text-sm font-medium">{d.title}</span>
                            <span className="text-ashen-500 block text-xs">{d.sub}</span>
                        </span>
                        <ArrowUpRight className="text-ashen-400 size-4 shrink-0 transition group-hover:translate-x-0.5" />
                    </Link>
                ))}

                {/* Urgent help — a calm safety signal, always reachable */}
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-ashen-300/60 flex items-center gap-4 rounded-2xl border border-dashed p-4 transition active:scale-[0.99]"
                >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <LifeBuoy className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="text-ashen-800 block text-sm font-medium">Need urgent help?</span>
                        <span className="text-ashen-500 block text-xs">Reach a real person now</span>
                    </span>
                    <ArrowUpRight className="text-ashen-400 size-4 shrink-0" />
                </a>
            </motion.div>

            {/* Auth actions pinned to the bottom */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="mt-auto flex flex-col gap-3 pt-8"
            >
                <Link
                    href="/login"
                    className="bg-ashen-800 hover:bg-ashen-900 flex items-center justify-center rounded-full py-3.5 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98]"
                >
                    Log in
                </Link>
                <Link
                    href="/register"
                    className="border-ashen-300 text-ashen-800 hover:bg-ashen-100/60 flex items-center justify-center rounded-full border py-3.5 text-sm font-semibold transition active:scale-[0.98]"
                >
                    Create an account
                </Link>
            </motion.div>
        </div>
    );
}
