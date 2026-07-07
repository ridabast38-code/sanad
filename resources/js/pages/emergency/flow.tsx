import { type ClosingProps, type Flow, GuidedFlow } from '@/components/guided-flow';
import { AmbientBackground } from '@/components/ambient-background';
import { RevealText } from '@/components/reveal-text';
import { type SafetyInfo } from '@/components/crisis-safety';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarHeart, Check, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface FlowPageProps {
    flow: Flow;
    safety: SafetyInfo;
}

export default function EmergencyFlow({ flow, safety }: FlowPageProps) {
    const { auth } = usePage<SharedData>().props;
    const isGuest = !auth.user;

    return (
        <>
            <Head title={flow.label} />

            {/* The landing's light→dark gray split, so the flow feels like the same place. */}
            <div className="text-ashen-800 relative min-h-screen bg-[linear-gradient(to_right,#f6f4ed_0%,#e6e5dd_28%,#b8b9b1_55%,#90918a_76%,#90918a_100%)]">
                <AmbientBackground />
                <GuidedFlow
                    flow={flow}
                    safety={safety}
                    isGuest={isGuest}
                    back={{ href: isGuest ? '/' : '/dashboard', label: isGuest ? 'Back to home' : 'Back to my space' }}
                    photo={{
                        src: '/images/support/emergency.jpg',
                        eyebrow: 'Emergency First Aid',
                        title: (
                            <>
                                You don't have to
                                <br />
                                carry this alone.
                            </>
                        ),
                    }}
                    renderClosing={(props) => <EmergencyClosing {...props} />}
                />
            </div>
        </>
    );
}

/** The emergency closing: rest here, reach a person now, or arrange ongoing support. */
function EmergencyClosing({ lines, safety, isGuest }: ClosingProps) {
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

            <p className="text-ashen-700 mt-6 text-base leading-relaxed">
                Take all the time you need. When you're ready, you can rest here, talk to someone, or arrange ongoing support.
            </p>

            <div className="mt-8 space-y-3">
                <a
                    href={safety.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ashen-800 hover:bg-ashen-900 text-ashen-100 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.99]"
                >
                    <MessageCircle className="size-4" /> I still feel overwhelmed — talk to someone now
                </a>

                {isGuest ? (
                    <Link
                        href="/register"
                        className="border-ashen-500/60 text-ashen-800 bg-ashen-100/50 hover:bg-ashen-100/80 flex w-full items-center justify-center gap-2 rounded-full border px-6 py-4 text-sm font-semibold transition active:scale-[0.99]"
                    >
                        <UserPlus className="size-4" /> Create an account for ongoing support
                    </Link>
                ) : (
                    <Link
                        href="/specialists"
                        className="border-ashen-500/60 text-ashen-800 bg-ashen-100/50 hover:bg-ashen-100/80 flex w-full items-center justify-center gap-2 rounded-full border px-6 py-4 text-sm font-semibold transition active:scale-[0.99]"
                    >
                        <CalendarHeart className="size-4" /> Arrange ongoing support
                    </Link>
                )}

                <Link
                    href={isGuest ? '/' : '/dashboard'}
                    className="text-ashen-600 hover:text-ashen-900 flex w-full items-center justify-center gap-2 py-3 text-sm font-medium transition"
                >
                    <Check className="size-4" /> {isGuest ? 'I’m feeling steadier — return home' : 'I’m feeling steadier — return to my space'}
                </Link>
            </div>
        </div>
    );
}
