import { AmbientBackground } from '@/components/ambient-background';
import { CrisisSafety, type SafetyInfo } from '@/components/crisis-safety';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Car, CloudRain, Flame, HeartCrack, LifeBuoy, LogIn, type LucideIcon, UserPlus, Waves } from 'lucide-react';
import { motion } from 'motion/react';

interface FlowMenuItem {
    key: string;
    label: string;
    summary: string;
    icon: string;
}

interface EmergencyIndexProps {
    flows: FlowMenuItem[];
    safety: SafetyInfo;
}

/** Maps a flow's icon name (set in StabilizationFlows) to a Lucide icon. */
const ICONS: Record<string, LucideIcon> = {
    car: Car,
    war: Flame,
    grief: HeartCrack,
    disaster: CloudRain,
    waves: Waves,
};

export default function EmergencyIndex({ flows, safety }: EmergencyIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const isGuest = !auth.user;

    return (
        <>
            <Head title="Get help now" />

            <div className="from-cream via-sage-50/50 to-cream text-ashen-800 relative min-h-screen bg-gradient-to-b">
                <AmbientBackground />
                {/* soft sage halo behind the header — gentle warmth, stays calm */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(125,160,128,0.14),transparent)]"
                />

                <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 md:py-14">
                    <Link
                        href={isGuest ? '/' : '/dashboard'}
                        className="text-ashen-500 hover:text-sage-700 mb-10 inline-flex items-center gap-2 self-start text-sm font-medium transition"
                    >
                        <ArrowLeft className="size-4" /> {isGuest ? 'Back to home' : 'Back to my space'}
                    </Link>

                    <motion.header
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="mb-10"
                    >
                        <span className="border-sage-200 text-sage-700 inline-flex items-center gap-2 rounded-full border bg-white/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
                            <LifeBuoy className="size-3.5" /> You’re not alone
                        </span>
                        <h1 className="font-display text-sage-800 mt-4 text-4xl leading-tight tracking-tight md:text-5xl">
                            Let’s take this <span className="italic">one step</span> at a time.
                        </h1>
                        <p className="text-ashen-500 mt-4 max-w-xl text-lg leading-relaxed">
                            Whatever just happened, you don’t have to handle it alone. Tell us what you’re going through, and we’ll gently walk with
                            you right now.
                        </p>
                    </motion.header>

                    <div className="mb-8">
                        <CrisisSafety safety={safety} />
                    </div>

                    {isGuest && (
                        <div className="border-sage-200/70 bg-sage-50/50 mb-8 rounded-3xl border p-5">
                            <p className="text-ashen-700 text-sm font-semibold">You can start right now — no account needed.</p>
                            <p className="text-ashen-500 mt-1 text-sm">
                                Begin a grounding exercise below, or sign in so a specialist can follow up with you afterwards.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link
                                    href="/login"
                                    className="border-sage-300 text-sage-700 hover:bg-sage-50 inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold transition active:scale-95"
                                >
                                    <LogIn className="size-4" /> Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="border-sage-300 text-sage-700 hover:bg-sage-50 inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold transition active:scale-95"
                                >
                                    <UserPlus className="size-4" /> Create an account
                                </Link>
                            </div>
                        </div>
                    )}

                    <p className="text-ashen-400 mb-5 text-[11px] font-semibold tracking-[0.2em] uppercase">What are you going through?</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {flows.map((flow, i) => {
                            const Icon = ICONS[flow.icon] ?? LifeBuoy;
                            return (
                                <motion.div
                                    key={flow.key}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 * i }}
                                >
                                    <Link
                                        href={`/emergency/${flow.key}`}
                                        className="group hover:border-sage-200 flex h-full items-start gap-4 rounded-3xl border border-white/60 bg-white/55 p-6 shadow-[0_12px_36px_-16px_rgba(26,28,28,0.16)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/85 hover:shadow-[0_20px_50px_-20px_rgba(79,111,82,0.28)]"
                                    >
                                        <span className="bg-sage-100 text-sage-700 ring-sage-200/60 flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1 transition group-hover:scale-105">
                                            <Icon className="size-7" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="text-ashen-800 font-display block text-lg leading-snug">{flow.label}</span>
                                            <span className="text-ashen-500 mt-1 block text-sm leading-relaxed">{flow.summary}</span>
                                        </span>
                                        <ArrowUpRight className="text-ashen-300 group-hover:text-sage-600 mt-1 size-5 shrink-0 transition group-hover:translate-x-0.5" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    <p className="text-ashen-400 mt-10 text-center text-sm">
                        These steps offer immediate comfort — they don’t replace professional or medical care.
                    </p>
                </div>
            </div>
        </>
    );
}
