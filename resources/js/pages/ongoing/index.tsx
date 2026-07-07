import { AmbientBackground } from '@/components/ambient-background';
import { CrisisSafety, type SafetyInfo } from '@/components/crisis-safety';
import { GuidedPhoto } from '@/components/guided-flow';
import { RevealText } from '@/components/reveal-text';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Car, CloudRain, Flame, HeartCrack, LifeBuoy, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface FlowMenuItem {
    key: string;
    label: string;
    summary: string;
    icon: string;
}

interface OngoingIndexProps {
    flows: FlowMenuItem[];
    safety: SafetyInfo;
}

/** Maps a flow's icon name (set in StabilizationFlows) to a Lucide icon. */
const ICONS: Record<string, LucideIcon> = {
    car: Car,
    war: Flame,
    grief: HeartCrack,
    disaster: CloudRain,
};

export default function OngoingIndex({ flows, safety }: OngoingIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const isGuest = !auth.user;

    return (
        <>
            <Head title="Ongoing support" />

            {/* Same landing gray split. On desktop the page locks to the viewport so the
            cards column never scrolls; on phones it flows and scrolls naturally. */}
            <div className="text-ashen-800 relative min-h-screen bg-[linear-gradient(to_right,#f6f4ed_0%,#e6e5dd_28%,#b8b9b1_55%,#90918a_76%,#90918a_100%)] lg:h-screen lg:overflow-hidden">
                <AmbientBackground />

                <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:h-screen lg:min-h-0 lg:py-7">
                    <div className="mb-4 shrink-0">
                        <Link
                            href={isGuest ? '/' : '/dashboard'}
                            className="text-ashen-600 hover:text-ashen-900 inline-flex items-center gap-2 text-sm font-medium transition"
                        >
                            <ArrowLeft className="size-4" /> {isGuest ? 'Back to home' : 'Back to my space'}
                        </Link>
                    </div>

                    <div className="grid items-stretch gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
                        {/* the same calming photo the flows use, filling the column height here */}
                        <GuidedPhoto
                            src="/images/support/ongoing.jpg"
                            eyebrow="Ongoing Support"
                            sizeClass="lg:h-full"
                            title={
                                <>
                                    A steadier path,
                                    <br />
                                    one step at a time.
                                </>
                            }
                        />

                        <div className="flex flex-col lg:min-h-0">
                            <motion.header
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="mb-5 shrink-0"
                            >
                                <span className="border-ashen-500/50 text-ashen-700 bg-ashen-100/50 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
                                    <LifeBuoy className="size-3.5" /> Ongoing support
                                </span>
                                <h1 className="font-display text-ashen-900 mt-3 text-3xl leading-tight tracking-tight sm:text-4xl">
                                    <RevealText text="What have you been through?" delay={0.1} />
                                </h1>
                                <p className="text-ashen-700 mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
                                    Choose what feels closest. We'll walk through it together, gently — and when you're ready, we can help you take
                                    the next step with a specialist.
                                </p>
                            </motion.header>

                            <div className="grid gap-3 sm:grid-cols-2">
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
                                                href={`/ongoing/${flow.key}`}
                                                className="group border-ashen-400/40 bg-ashen-100/50 hover:border-ashen-600/50 hover:bg-ashen-100/80 flex h-full items-start gap-4 rounded-2xl border p-5 shadow-[0_12px_36px_-16px_rgba(26,28,28,0.2)] backdrop-blur-xl transition hover:-translate-y-1"
                                            >
                                                <span className="bg-ashen-200/70 text-ashen-700 ring-ashen-400/40 flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 transition group-hover:scale-105">
                                                    <Icon className="size-6" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="text-ashen-900 font-display block leading-snug">{flow.label}</span>
                                                    <span className="text-ashen-600 mt-1 block text-sm leading-relaxed">{flow.summary}</span>
                                                </span>
                                                <ArrowUpRight className="text-ashen-500 group-hover:text-ashen-800 mt-0.5 size-5 shrink-0 transition group-hover:translate-x-0.5" />
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="mt-5">
                                <CrisisSafety safety={safety} />
                            </div>

                            <p className="text-ashen-600 mt-4 text-xs leading-relaxed">
                                These guided steps offer gentle support — they don't replace professional or emergency care. If it just happened, our{' '}
                                <Link href="/emergency" className="text-ashen-900 font-medium underline underline-offset-4">
                                    Emergency First Aid
                                </Link>{' '}
                                is one tap away.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
