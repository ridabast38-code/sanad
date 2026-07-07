import { AmbientBackground } from '@/components/ambient-background';
import { CrisisSafety, type SafetyInfo } from '@/components/crisis-safety';
import { RevealText } from '@/components/reveal-text';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarHeart, Check, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';

interface FlowStep {
    title: string;
    lines: string[];
}

interface FlowPath {
    steps: FlowStep[];
    closing: string[];
}

interface Flow {
    key: string;
    phase: string;
    label: string;
    summary: string;
    icon: string;
    intro: FlowStep[];
    check: { question: string; options: { key: string; label: string }[] };
    paths: Record<string, FlowPath>;
}

interface FlowPageProps {
    flow: Flow;
    safety: SafetyInfo;
}

/** The phases of the guided experience, in order. */
type Stage = 'intro' | 'check' | 'path' | 'closing';

export default function EmergencyFlow({ flow, safety }: FlowPageProps) {
    const { auth } = usePage<SharedData>().props;
    const isGuest = !auth.user;

    const [stage, setStage] = useState<Stage>('intro');
    const [introIndex, setIntroIndex] = useState(0);
    const [feeling, setFeeling] = useState<string | null>(null);
    const [pathIndex, setPathIndex] = useState(0);

    const path = feeling ? flow.paths[feeling] : null;

    // A single key per visible card so AnimatePresence transitions between them.
    const cardKey = `${stage}-${introIndex}-${feeling}-${pathIndex}`;

    const advanceIntro = () => {
        if (introIndex < flow.intro.length - 1) {
            setIntroIndex((i) => i + 1);
        } else {
            setStage('check');
        }
        scrollTop();
    };

    const chooseFeeling = (key: string) => {
        setFeeling(key);
        setPathIndex(0);
        setStage('path');
        scrollTop();
    };

    const advancePath = () => {
        if (path && pathIndex < path.steps.length - 1) {
            setPathIndex((i) => i + 1);
        } else {
            setStage('closing');
        }
        scrollTop();
    };

    // Progress through the whole experience, for the calm progress bar.
    const progress = useProgress(flow, stage, introIndex, path, pathIndex);

    return (
        <>
            <Head title={flow.label} />

            {/* The landing's light→dark gray split, so the flow feels like the same place. */}
            <div className="text-ashen-800 relative min-h-screen bg-[linear-gradient(to_right,#f6f4ed_0%,#e6e5dd_28%,#b8b9b1_55%,#90918a_76%,#90918a_100%)]">
                <AmbientBackground />

                <div className="relative mx-auto min-h-screen max-w-6xl px-6 py-8 md:py-10">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <Link
                            href={isGuest ? '/' : '/dashboard'}
                            className="text-ashen-600 hover:text-ashen-900 inline-flex items-center gap-2 text-sm font-medium transition"
                        >
                            <ArrowLeft className="size-4" /> {isGuest ? 'Back to home' : 'Back to my space'}
                        </Link>
                        <span className="text-ashen-600 text-xs font-medium tracking-[0.15em] uppercase">{flow.label}</span>
                    </div>

                    <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
                        {/* the calming photo — large, gray-washed, resting at a gentle tilt
                        like the landing cards; colors up softly on hover. Desktop only, so
                        a phone in a crisis goes straight to the words. */}
                        <motion.div
                            initial={{ opacity: 0, rotateY: -10 }}
                            animate={{ opacity: 1, rotateY: -5 }}
                            whileHover={{ rotateY: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            style={{ transformPerspective: 1200 }}
                            className="group relative hidden overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(20,21,15,0.6)] lg:block lg:self-stretch"
                        >
                            <img
                                src="/images/support/emergency.jpg"
                                alt=""
                                decoding="async"
                                className="h-full min-h-[34rem] w-full object-cover grayscale-[70%] transition duration-700 group-hover:scale-105 group-hover:grayscale-[20%]"
                            />
                            <div className="from-ashen-950/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                            <div className="absolute right-0 bottom-0 left-0 p-8">
                                <p className="text-ashen-300 text-xs font-medium tracking-[0.25em] uppercase">Emergency First Aid</p>
                                <p className="font-display text-ashen-200 mt-2 text-3xl leading-tight">
                                    You don't have to
                                    <br />
                                    carry this alone.
                                </p>
                            </div>
                        </motion.div>

                        {/* the guided player */}
                        <div className="flex min-h-[70vh] flex-col lg:min-h-[34rem]">
                            {/* calm progress rail */}
                            <div className="bg-ashen-200/70 mb-10 h-1 w-full overflow-hidden rounded-full">
                                <motion.div
                                    className="bg-ashen-700 h-full rounded-full"
                                    animate={{ width: `${Math.round(progress * 100)}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>

                            <div className="flex flex-1 flex-col">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={cardKey}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -16 }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                        className="flex flex-1 flex-col"
                                    >
                                        {stage === 'intro' && (
                                            <StepCard step={flow.intro[introIndex]} onNext={advanceIntro} nextLabel="Continue" />
                                        )}

                                        {stage === 'check' && (
                                            <CheckCard question={flow.check.question} options={flow.check.options} onChoose={chooseFeeling} />
                                        )}

                                        {stage === 'path' && path && (
                                            <StepCard
                                                step={path.steps[pathIndex]}
                                                onNext={advancePath}
                                                nextLabel={pathIndex < path.steps.length - 1 ? 'Next' : 'I’ve done this'}
                                                stepNumber={pathIndex + 1}
                                                stepTotal={path.steps.length}
                                            />
                                        )}

                                        {stage === 'closing' && path && <ClosingCard lines={path.closing} safety={safety} isGuest={isGuest} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* the life-safety layer — always within reach, never in the way */}
                            <div className="mt-10">
                                <CrisisSafety safety={safety} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ============================ Cards ============================ */

function StepCard({
    step,
    onNext,
    nextLabel,
    stepNumber,
    stepTotal,
}: {
    step: FlowStep;
    onNext: () => void;
    nextLabel: string;
    stepNumber?: number;
    stepTotal?: number;
}) {
    return (
        <div className="flex flex-1 flex-col">
            {stepNumber && stepTotal && (
                <p className="text-ashen-600 mb-4 text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Step {stepNumber} of {stepTotal}
                </p>
            )}
            <h2 className="font-display text-ashen-900 text-3xl leading-tight tracking-tight md:text-4xl">
                <RevealText text={step.title} delay={0.05} />
            </h2>

            <div className="mt-8 space-y-5">
                {step.lines.map((line, i) => (
                    <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 + i * 0.12 }}
                        className="text-ashen-700 text-lg leading-relaxed md:text-xl"
                    >
                        {line}
                    </motion.p>
                ))}
            </div>

            <div className="mt-auto pt-12">
                <button
                    type="button"
                    onClick={onNext}
                    className="group bg-ashen-800 hover:bg-ashen-900 text-ashen-200 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    {nextLabel}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </button>
            </div>
        </div>
    );
}

function CheckCard({
    question,
    options,
    onChoose,
}: {
    question: string;
    options: { key: string; label: string }[];
    onChoose: (key: string) => void;
}) {
    return (
        <div className="flex flex-1 flex-col">
            <h2 className="font-display text-ashen-900 text-3xl leading-tight tracking-tight md:text-4xl">
                <RevealText text={question} delay={0.05} />
            </h2>
            <p className="text-ashen-600 mt-3 text-base">There's no wrong answer. Choose whatever feels closest.</p>

            <div className="mt-8 space-y-3">
                {options.map((option, i) => (
                    <motion.button
                        key={option.key}
                        type="button"
                        onClick={() => onChoose(option.key)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 + i * 0.07 }}
                        className="group border-ashen-400/40 bg-ashen-100/50 hover:border-ashen-600/60 hover:bg-ashen-100/80 flex w-full items-center justify-between gap-4 rounded-2xl border px-6 py-5 text-left shadow-[0_8px_30px_-14px_rgba(26,28,28,0.18)] backdrop-blur-xl transition hover:-translate-y-0.5"
                    >
                        <span className="text-ashen-800 group-hover:text-ashen-900 text-lg font-medium transition-colors">{option.label}</span>
                        <ArrowRight className="text-ashen-500 group-hover:text-ashen-800 size-5 shrink-0 transition group-hover:translate-x-0.5" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

function ClosingCard({ lines, safety, isGuest }: { lines: string[]; safety: SafetyInfo; isGuest: boolean }) {
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
                    className="text-ashen-50 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.99]"
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

/* ============================ Progress ============================ */

/** A 0→1 estimate of how far through the whole experience the person is. */
function useProgress(flow: Flow, stage: Stage, introIndex: number, path: FlowPath | null, pathIndex: number): number {
    return useMemo(() => {
        const introCount = flow.intro.length;
        const pathCount = path?.steps.length ?? 4;
        const total = introCount + 1 /* check */ + pathCount + 1; /* closing */

        let done = 0;
        if (stage === 'intro') {
            done = introIndex;
        } else if (stage === 'check') {
            done = introCount;
        } else if (stage === 'path') {
            done = introCount + 1 + pathIndex;
        } else {
            done = total - 1;
        }
        return Math.min(1, (done + 1) / total);
    }, [flow.intro.length, stage, introIndex, path, pathIndex]);
}

function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
