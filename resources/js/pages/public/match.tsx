import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, RotateCcw, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * "Find your specialist" — a short quiz that scores the real specialist directory
 * (language, approach, gender preference, availability) and returns the best fit
 * with a % and reasons, then links straight into the public booking flow. All
 * scoring is deterministic and client-side. Surfaced only inside the app.
 */

interface Specialist {
    id: number;
    slug: string;
    name: string;
    headline: string | null;
    approaches: string[];
    languages: string[];
    gender: string | null;
    years_experience: number | null;
    from_price: number | null;
    next_available_label: string | null;
    next_available_at: string | null;
}

const LANGS = [
    { key: 'arabic', label: 'Arabic', native: 'العربية' },
    { key: 'english', label: 'English', native: 'English' },
    { key: 'french', label: 'French', native: 'Français' },
];
const APPROACHES = [
    { key: 'cbt', label: 'CBT', hint: 'Practical, thought-focused' },
    { key: 'emdr', label: 'EMDR', hint: 'Processing hard memories' },
    { key: 'psychoanalysis', label: 'Psychoanalysis', hint: 'Deeper, exploratory' },
    { key: 'unsure', label: 'Not sure yet', hint: 'Help me decide' },
];
const GENDERS = [
    { key: 'female', label: 'A woman' },
    { key: 'male', label: 'A man' },
    { key: 'any', label: 'No preference' },
];

const APPROACH_LABEL: Record<string, string> = { cbt: 'CBT', emdr: 'EMDR', psychoanalysis: 'Psychoanalysis' };
const LANG_LABEL: Record<string, string> = { arabic: 'Arabic', english: 'English', french: 'French' };

type Answers = { language?: string; approach?: string; gender?: string };

function scoreOf(s: Specialist, a: Answers) {
    let score = 55;
    const reasons: string[] = [];

    if (a.language && s.languages?.includes(a.language)) {
        score += 40;
        reasons.push(`Speaks ${LANG_LABEL[a.language]}`);
    }
    if (a.approach && a.approach !== 'unsure' && s.approaches?.includes(a.approach)) {
        score += 30;
        reasons.push(APPROACH_LABEL[a.approach]);
    }
    if (a.gender && a.gender !== 'any' && s.gender === a.gender) {
        score += 14;
        reasons.push(a.gender === 'female' ? 'Woman' : 'Man');
    }
    const soon =
        s.next_available_at && (new Date(s.next_available_at).getTime() - Date.now()) / 86400000 <= 7;
    if (soon) {
        score += 10;
        reasons.push('Available soon');
    }
    return { fit: Math.min(99, Math.round(score)), reasons };
}

function Avatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (
        <span className="bg-ashen-200 text-ashen-700 font-display flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg">
            {initials}
        </span>
    );
}

export default function Match({ practitioners = [] }: { practitioners?: Specialist[] }) {
    const [step, setStep] = useState(0); // 0..2 questions, 3 = results
    const [answers, setAnswers] = useState<Answers>({});

    const ranked = useMemo(() => {
        return practitioners
            .map((s) => ({ s, ...scoreOf(s, answers) }))
            .sort((a, b) => b.fit - a.fit)
            .slice(0, 3);
    }, [practitioners, answers]);

    const questions = [
        { key: 'language' as const, title: 'Which language feels most like home?', options: LANGS },
        { key: 'approach' as const, title: 'Any style you lean toward?', options: APPROACHES },
        { key: 'gender' as const, title: 'Who would you feel more at ease with?', options: GENDERS },
    ];

    const choose = (key: keyof Answers, value: string) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
        window.setTimeout(() => setStep((s) => s + 1), 220);
    };

    const restart = () => {
        setAnswers({});
        setStep(0);
    };

    return (
        <div
            className="text-ashen-800 flex min-h-dvh flex-col px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            style={{ background: 'linear-gradient(to bottom, #f6f4ed 0%, #e6e5dd 30%, #c3c4bd 70%, #a9aaa2 100%)' }}
        >
            <Head title="Find your specialist" />

            {/* header */}
            <div className="flex items-center justify-between">
                <Link href={step > 0 && step < 3 ? '#' : '/'} onClick={(e) => { if (step > 0 && step < 3) { e.preventDefault(); setStep((s) => s - 1); } }} className="text-ashen-600 flex size-9 items-center justify-center rounded-full">
                    <ArrowLeft className="size-5" />
                </Link>
                <span className="text-ashen-600 flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] uppercase">
                    <Sparkles className="size-3.5" /> Find your specialist
                </span>
                <span className="size-9" />
            </div>

            {/* progress */}
            {step < 3 && (
                <div className="mt-6 flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <span key={i} className={`h-1 flex-1 rounded-full transition ${i <= step ? 'bg-ashen-700' : 'bg-ashen-300/60'}`} />
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                {step < 3 ? (
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="flex flex-1 flex-col justify-center py-8"
                    >
                        <h1 className="font-display text-ashen-800 text-3xl leading-tight tracking-tight">{questions[step].title}</h1>
                        <div className="mt-7 flex flex-col gap-3">
                            {questions[step].options.map((o) => (
                                <button
                                    key={o.key}
                                    onClick={() => choose(questions[step].key, o.key)}
                                    className="sanad-card group flex items-center gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 active:scale-[0.99]"
                                >
                                    <span className="flex-1">
                                        <span className="text-ashen-800 block text-base font-medium">{o.label}</span>
                                        {'hint' in o && o.hint && <span className="text-ashen-500 block text-xs">{o.hint}</span>}
                                        {'native' in o && o.native && o.native !== o.label && (
                                            <span className="text-ashen-500 block text-xs">{o.native}</span>
                                        )}
                                    </span>
                                    <ArrowUpRight className="text-ashen-400 size-4 transition group-hover:translate-x-0.5" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="flex flex-1 flex-col py-6"
                    >
                        <p className="text-ashen-600 text-sm">Based on what you shared, your best match is</p>

                        {ranked[0] && (
                            <div className="sanad-card mt-3 rounded-3xl p-5">
                                <div className="flex items-start gap-4">
                                    <Avatar name={ranked[0].s.name} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-display text-ashen-800 text-xl leading-tight">{ranked[0].s.name}</p>
                                        {ranked[0].s.headline && <p className="text-ashen-500 mt-0.5 text-sm">{ranked[0].s.headline}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display text-ashen-800 text-2xl leading-none">{ranked[0].fit}%</p>
                                        <p className="text-ashen-500 text-[10px] tracking-wider uppercase">fit</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {ranked[0].reasons.map((r) => (
                                        <span key={r} className="bg-ashen-100 text-ashen-700 rounded-full px-2.5 py-1 text-xs font-medium">
                                            {r}
                                        </span>
                                    ))}
                                    {ranked[0].s.next_available_label && (
                                        <span className="text-ashen-500 rounded-full px-2.5 py-1 text-xs">Next: {ranked[0].s.next_available_label}</span>
                                    )}
                                </div>

                                <Link
                                    href={`/book/${ranked[0].s.slug}`}
                                    className="bg-ashen-800 hover:bg-ashen-900 mt-5 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98]"
                                >
                                    Book with {ranked[0].s.name.split(' ')[0]}
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </div>
                        )}

                        {ranked.length > 1 && (
                            <>
                                <p className="text-ashen-600 mt-6 text-xs font-medium tracking-[0.12em] uppercase">Also a good fit</p>
                                <div className="mt-3 flex flex-col gap-3">
                                    {ranked.slice(1).map((r) => (
                                        <Link
                                            key={r.s.id}
                                            href={`/book/${r.s.slug}`}
                                            className="sanad-card flex items-center gap-3 rounded-2xl p-3.5 transition active:scale-[0.99]"
                                        >
                                            <Avatar name={r.s.name} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-ashen-800 truncate text-sm font-medium">{r.s.name}</p>
                                                <p className="text-ashen-500 truncate text-xs">{r.reasons.slice(0, 2).join(' · ') || r.s.headline}</p>
                                            </div>
                                            <span className="text-ashen-600 text-sm font-semibold">{r.fit}%</span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                        {ranked.length === 0 && (
                            <p className="text-ashen-600 mt-6 text-sm">No specialists are available just yet — please check back soon.</p>
                        )}

                        <button onClick={restart} className="text-ashen-600 hover:text-ashen-800 mt-8 inline-flex items-center justify-center gap-2 self-center text-sm font-medium">
                            <RotateCcw className="size-4" /> Retake the quiz
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
