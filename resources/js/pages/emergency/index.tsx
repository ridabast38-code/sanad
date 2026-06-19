import { AmbientBackground } from '@/components/ambient-background';
import { CrisisSafety, type SafetyInfo } from '@/components/crisis-safety';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Car, CloudRain, Flame, HeartCrack, LifeBuoy, type LucideIcon, Waves } from 'lucide-react';
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
    return (
        <>
            <Head title="Get help now" />

            <div className="bg-cream text-ashen-800 relative min-h-screen">
                <AmbientBackground />

                <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 md:py-14">
                    <Link
                        href="/dashboard"
                        className="text-ashen-500 hover:text-sage-700 mb-10 inline-flex items-center gap-2 self-start text-sm font-medium transition"
                    >
                        <ArrowLeft className="size-4" /> Back to my space
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
                                        className="group flex h-full items-start gap-4 rounded-2xl border border-white/60 bg-white/55 p-6 shadow-[0_8px_30px_-14px_rgba(26,28,28,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
                                    >
                                        <span className="bg-sage-100 text-sage-700 flex size-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105">
                                            <Icon className="size-6" />
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
