import { CrisisSafety, type SafetyInfo } from '@/components/crisis-safety';
import { RevealText } from '@/components/reveal-text';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useMemo, useState } from 'react';

export interface FlowStep {
    title: string;
    lines: string[];
}

export interface FlowPath {
    steps: FlowStep[];
    closing: string[];
}

export interface Flow {
    key: string;
    phase: string;
    label: string;
    summary: string;
    icon: string;
    intro: FlowStep[];
    check: { question: string; options: { key: string; label: string }[] };
    paths: Record<string, FlowPath>;
}

/** The props a closing screen receives once the guided steps are done. */
export interface ClosingProps {
    lines: string[];
    safety: SafetyInfo;
    isGuest: boolean;
}

/** The phases of the guided experience, in order. */
type Stage = 'intro' | 'check' | 'path' | 'closing';

/**
 * The calming side photo shared by every guided screen (menu + all flows). A
 * FIXED height and centered crop keep it identical from page to page — it rests
 * at a gentle tilt, is gray-washed to match the site, and colors up on hover.
 * Desktop only, so a phone in a hard moment goes straight to the words.
 */
export function GuidedPhoto({ src, eyebrow, title }: { src: string; eyebrow: string; title: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, rotateY: -10 }}
            animate={{ opacity: 1, rotateY: -5 }}
            whileHover={{ rotateY: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1200 }}
            className="group relative hidden overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(20,21,15,0.6)] lg:sticky lg:top-8 lg:block lg:h-[40rem]"
        >
            <img
                src={src}
                alt=""
                decoding="async"
                className="h-full w-full object-cover object-center grayscale-[45%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
            />
            <div className="from-ashen-950/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-8">
                <p className="text-ashen-300 text-xs font-medium tracking-[0.25em] uppercase">{eyebrow}</p>
                <p className="font-display text-ashen-200 mt-2 text-3xl leading-tight">{title}</p>
            </div>
        </motion.div>
    );
}

/**
 * The shared guided-flow player used by both the emergency and ongoing-support
 * journeys: a calm progress rail, word-by-word title reveals, and a large
 * gray-washed side photo (desktop). Only the closing screen differs between the
 * two, so callers pass their own via `renderClosing`.
 */
export function GuidedFlow({
    flow,
    safety,
    isGuest,
    back,
    photo,
    renderClosing,
}: {
    flow: Flow;
    safety: SafetyInfo;
    isGuest: boolean;
    back: { href: string; label: string };
    photo: { src: string; eyebrow: string; title: ReactNode };
    renderClosing: (props: ClosingProps) => ReactNode;
}) {
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

    const progress = useProgress(flow, stage, introIndex, path, pathIndex);

    return (
        <div className="relative mx-auto min-h-screen max-w-6xl px-6 py-8 md:py-10">
            <div className="mb-6 flex items-center justify-between gap-4">
                <Link href={back.href} className="text-ashen-600 hover:text-ashen-900 inline-flex items-center gap-2 text-sm font-medium transition">
                    <ArrowLeft className="size-4" /> {back.label}
                </Link>
                <span className="text-ashen-600 text-xs font-medium tracking-[0.15em] uppercase">{flow.label}</span>
            </div>

            <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
                <GuidedPhoto src={photo.src} eyebrow={photo.eyebrow} title={photo.title} />

                {/* the guided player */}
                <div className="flex min-h-[70vh] flex-col lg:min-h-[34rem]">
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

                                {stage === 'closing' && path && renderClosing({ lines: path.closing, safety, isGuest })}
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
    );
}

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
