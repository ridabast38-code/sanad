import { AmbientBackground } from '@/components/ambient-background';
import { type SafetyInfo } from '@/components/crisis-safety';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarHeart, Check, Heart, MessageCircle } from 'lucide-react';
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

            <div className="bg-cream text-ashen-800 relative min-h-screen">
                <AmbientBackground />

                <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8 md:py-12">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <Link
                            href="/emergency"
                            className="text-ashen-500 hover:text-sage-700 inline-flex items-center gap-2 text-sm font-medium transition"
                        >
                            <ArrowLeft className="size-4" /> Choose something else
                        </Link>
                        <span className="text-ashen-400 text-xs font-medium">{flow.label}</span>
                    </div>

                    {/* calm progress rail */}
                    <div className="bg-sage-100 mb-10 h-1 w-full overflow-hidden rounded-full">
                        <motion.div
                            className="bg-sage-500 h-full rounded-full"
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
                                {stage === 'intro' && <StepCard step={flow.intro[introIndex]} onNext={advanceIntro} nextLabel="Continue" />}

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

                                {stage === 'closing' && path && <ClosingCard lines={path.closing} safety={safety} />}
                            </motion.div>
                        </AnimatePresence>
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
                <p className="text-sage-600 mb-4 text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Step {stepNumber} of {stepTotal}
                </p>
            )}
            <h2 className="font-display text-sage-800 text-3xl leading-tight tracking-tight md:text-4xl">{step.title}</h2>

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
                    className="group bg-sage-700 hover:bg-sage-800 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 active:scale-[0.98]"
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
            <h2 className="font-display text-sage-800 text-3xl leading-tight tracking-tight md:text-4xl">{question}</h2>
            <p className="text-ashen-500 mt-3 text-base">There’s no wrong answer. Choose whatever feels closest.</p>

            <div className="mt-8 space-y-3">
                {options.map((option, i) => (
                    <motion.button
                        key={option.key}
                        type="button"
                        onClick={() => onChoose(option.key)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 + i * 0.07 }}
                        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/55 px-6 py-5 text-left shadow-[0_8px_30px_-14px_rgba(26,28,28,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/85"
                    >
                        <span className="text-ashen-800 text-lg font-medium">{option.label}</span>
                        <ArrowRight className="text-ashen-300 group-hover:text-sage-600 size-5 shrink-0 transition group-hover:translate-x-0.5" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

function ClosingCard({ lines, safety }: { lines: string[]; safety: SafetyInfo }) {
    return (
        <div className="flex flex-1 flex-col">
            <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="bg-sage-100 text-sage-700 flex size-16 items-center justify-center rounded-full"
            >
                <Heart className="size-8" />
            </motion.span>

            <div className="mt-8 space-y-4">
                {lines.map((line, i) => (
                    <p key={i} className="font-display text-sage-800 text-2xl leading-snug md:text-3xl">
                        {line}
                    </p>
                ))}
            </div>

            <p className="text-ashen-500 mt-6 text-base leading-relaxed">
                Take all the time you need. When you’re ready, you can rest here, talk to someone, or arrange ongoing support.
            </p>

            <div className="mt-8 space-y-3">
                <a
                    href={safety.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 active:scale-[0.99]"
                >
                    <MessageCircle className="size-4" /> I still feel overwhelmed — talk to someone now
                </a>

                <Link
                    href="/specialists"
                    className="border-sage-300 text-sage-700 hover:bg-sage-50 flex w-full items-center justify-center gap-2 rounded-full border bg-white/60 px-6 py-4 text-sm font-semibold transition active:scale-[0.99]"
                >
                    <CalendarHeart className="size-4" /> Arrange ongoing support
                </Link>

                <Link
                    href="/dashboard"
                    className="text-ashen-500 hover:text-sage-700 flex w-full items-center justify-center gap-2 py-3 text-sm font-medium transition"
                >
                    <Check className="size-4" /> I’m feeling steadier — return to my space
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
