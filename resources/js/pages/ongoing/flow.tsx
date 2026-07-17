import { AmbientBackground } from '@/components/ambient-background';
import { type SafetyInfo } from '@/components/crisis-safety';
import { type ClosingProps, type Flow, GuidedFlow } from '@/components/guided-flow';
import { RevealText } from '@/components/reveal-text';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Check, Compass, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface FlowPageProps {
    flow: Flow;
    safety: SafetyInfo;
}

export default function OngoingFlow({ flow, safety }: FlowPageProps) {
    const { auth } = usePage<SharedData>().props;
    const isGuest = !auth.user;

    return (
        <>
            <Head title={`${flow.label} — Ongoing support`} />

            {/* Same landing gray split, so the journey feels like one place. */}
            <div className="text-ashen-800 sanad-split relative min-h-screen">
                <AmbientBackground />
                <GuidedFlow
                    flow={flow}
                    safety={safety}
                    isGuest={isGuest}
                    back={{ href: '/ongoing', label: 'Choose something else' }}
                    photo={{
                        src: '/images/support/ongoing.jpg',
                        eyebrow: 'Ongoing Support',
                        title: (
                            <>
                                A steadier path,
                                <br />
                                one step at a time.
                            </>
                        ),
                    }}
                    renderClosing={(props) => <OngoingClosing {...props} />}
                />
            </div>
        </>
    );
}

/**
 * The ongoing closing: the doc's calm end lines, then a gentle invitation into
 * real sessions — our approaches (CBT, EMDR, psychoanalysis), booking, or a
 * message on WhatsApp.
 */
function OngoingClosing({ lines, safety, isGuest }: ClosingProps) {
    return (
        <div className="flex flex-1 flex-col">
            <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="bg-ashen-200/80 text-ashen-700 flex size-16 items-center justify-center rounded-full"
            >
                <Heart className="size-8" />
            </motion.span>

            <div className="mt-8 space-y-4">
                {lines.map((line, i) => (
                    <p key={i} className="font-display text-ashen-900 text-2xl leading-snug md:text-3xl">
                        <RevealText text={line} delay={0.1 + i * 0.2} stagger={0.04} />
                    </p>
                ))}
            </div>

            {/* the gentle conversion */}
            <div className="border-ashen-400/40 bg-ashen-100/50 mt-10 rounded-3xl border p-6 backdrop-blur-xl md:p-8">
                <p className="text-ashen-600 text-[11px] font-semibold tracking-[0.2em] uppercase">Going a little further</p>
                <h3 className="font-display text-ashen-900 mt-3 text-2xl leading-snug tracking-tight md:text-3xl">
                    These steps ease the moment. A specialist helps you heal what's underneath.
                </h3>
                <p className="text-ashen-700 mt-4 leading-relaxed">
                    Grounding calms the body right now. To truly move through what happened, our licensed clinical psychologists work with you over
                    time — through approaches like <span className="text-ashen-900 font-medium">CBT</span>,{' '}
                    <span className="text-ashen-900 font-medium">EMDR</span>, and <span className="text-ashen-900 font-medium">psychoanalysis</span> —
                    at a pace that feels right for you.
                </p>

                <div className="mt-7 space-y-3">
                    <Link
                        href={isGuest ? '/register' : '/specialists'}
                        className="bg-ashen-800 hover:bg-ashen-900 text-ashen-100 group flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.99]"
                    >
                        Book a session with a specialist
                        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Link
                            href="/#approaches"
                            className="border-ashen-500/50 text-ashen-800 hover:bg-ashen-100/80 flex items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-semibold transition active:scale-[0.99]"
                        >
                            <Compass className="size-4" /> Explore our approaches
                        </Link>
                        <a
                            href={safety.whatsapp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-ashen-500/50 text-ashen-800 hover:bg-ashen-100/80 flex items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-semibold transition active:scale-[0.99]"
                        >
                            <MessageCircle className="size-4" /> Talk to us on WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <Link
                href={isGuest ? '/' : '/dashboard'}
                className="text-ashen-600 hover:text-ashen-900 mt-6 flex w-full items-center justify-center gap-2 py-3 text-sm font-medium transition"
            >
                <Check className="size-4" /> {isGuest ? 'Maybe later — return home' : 'Maybe later — return to my space'}
            </Link>
        </div>
    );
}
