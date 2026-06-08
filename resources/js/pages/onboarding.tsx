import { Head, useForm } from '@inertiajs/react';
import { motion, useScroll } from 'motion/react';
import { LoaderCircle, Phone, CalendarHeart, Sparkles } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { BirthCalendar } from '@/components/ui/birth-calendar';

type OnboardingForm = {
    date_of_birth: string;
    gender: string;
    phone: string;
    support_reason: string;
    preferred_language: string;
    preferred_approach: string;
};

const genders = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'non_binary', label: 'Non-binary' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const languages = [
    { value: 'arabic', label: 'Arabic' },
    { value: 'english', label: 'English' },
    { value: 'french', label: 'French' },
];

const approaches = [
    { value: 'cbt', label: 'CBT' },
    { value: 'emdr', label: 'EMDR' },
    { value: 'psychoanalysis', label: 'Psychoanalysis' },
    { value: 'unsure', label: 'Not sure — help me choose' },
];

/** A soft choice-pill group. `dark` switches it for use on dark panels. */
function ChoiceGroup({
    options,
    value,
    onChange,
    disabled,
    dark,
}: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    dark?: boolean;
}) {
    return (
        <div className="flex flex-wrap gap-2.5">
            {options.map((o) => {
                const active = value === o.value;
                const base = dark
                    ? active
                        ? 'border-sage-400 bg-sage-500 text-white shadow-[0_10px_24px_-8px_rgba(125,160,128,0.7)]'
                        : 'border-white/20 bg-white/5 text-stone-200 hover:border-sage-400/60 hover:bg-white/10'
                    : active
                      ? 'border-sage-700 bg-sage-700 text-white shadow-[0_10px_24px_-8px_rgba(79,111,82,0.7)]'
                      : 'border-stone-300 bg-white/70 text-stone-700 shadow-sm hover:border-sage-400 hover:shadow-md';
                return (
                    <motion.button
                        key={o.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(o.value)}
                        whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
                        whileTap={{ scale: disabled ? 1 : 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className={`rounded-full border px-4 py-2 text-sm transition-[color,background-color,border-color,box-shadow] disabled:opacity-50 ${base}`}
                    >
                        {o.label}
                    </motion.button>
                );
            })}
        </div>
    );
}

const reveal = {
    initial: { opacity: 0, y: 34, scale: 0.98 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: '-70px' },
    transition: { duration: 0.7, ease: 'easeOut' as const },
};

export default function Onboarding({ name }: { name: string }) {
    const { data, setData, post, processing, errors } = useForm<OnboardingForm>({
        date_of_birth: '',
        gender: '',
        phone: '',
        support_reason: '',
        preferred_language: '',
        preferred_approach: '',
    });

    // phone — typeable country code + number combined into one value
    const [countryCode, setCountryCode] = useState('+961');
    const [phoneNumber, setPhoneNumber] = useState('');
    const syncPhone = (code: string, num: string) => setData('phone', num.trim() ? `${code.trim()} ${num.trim()}` : '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const firstName = name?.split(' ')[0] ?? '';
    const { scrollYProgress } = useScroll();

    return (
        <div className="relative min-h-screen">
            <Head title="Welcome to Sanad" />

            {/* glowing scroll-progress bar */}
            <motion.div
                style={{ scaleX: scrollYProgress }}
                className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-sage-400 via-sage-500 to-amber-300 shadow-[0_0_14px_2px_rgba(125,160,128,0.55)]"
            />

            {/* ===== full-page cinematic background ===== */}
            <div className="fixed inset-0">
                {/* soft bokeh video — blurred + veiled so it stays calm behind the form */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/images/onboarding-poster.jpg"
                    className="h-full w-full scale-105 object-cover blur-[2px] motion-reduce:hidden"
                >
                    <source src="/videos/onboarding.mp4" type="video/mp4" />
                </video>
                {/* reduced-motion fallback: still poster instead of video */}
                <img src="/images/onboarding-poster.jpg" alt="" className="hidden h-full w-full scale-105 object-cover blur-[2px] motion-reduce:block" />
                {/* darker, sage-tinted veil so it stays cinematic and on-brand */}
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-sage-900/45 to-stone-950/70" />
                {/* ambient glows drifting across the whole page */}
                <div aria-hidden className="pointer-events-none absolute -left-40 top-[6%] h-[34rem] w-[34rem] rounded-full bg-sage-400/30 blur-3xl" style={{ animation: 'aurora-1 24s ease-in-out infinite' }} />
                <div aria-hidden className="pointer-events-none absolute -right-40 top-[40%] h-[36rem] w-[36rem] rounded-full bg-amber-300/25 blur-3xl" style={{ animation: 'aurora-2 28s ease-in-out infinite' }} />
                <div aria-hidden className="pointer-events-none absolute left-1/4 top-[72%] h-[30rem] w-[30rem] rounded-full bg-beige/25 blur-3xl" style={{ animation: 'aurora-3 30s ease-in-out infinite' }} />
                <div aria-hidden className="pointer-events-none absolute right-1/3 top-[90%] h-[28rem] w-[28rem] rounded-full bg-sage-300/25 blur-3xl" style={{ animation: 'aurora-2 26s ease-in-out infinite', animationDelay: '-6s' }} />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl px-6 py-14 md:py-20">
                {/* ===== HERO ===== */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="mb-10 text-center">
                    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-sage-300">
                        <Sparkles className="h-3.5 w-3.5" /> A warm welcome
                    </span>
                    <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-white md:text-5xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">Hello{firstName ? `, ${firstName}` : ''}.</h1>
                    <p className="mx-auto mt-4 max-w-md leading-relaxed text-stone-200">
                        A few gentle questions so we can support you with care. There are no wrong answers, and everything you share stays private.
                    </p>
                </motion.div>

                <form onSubmit={submit} className="space-y-8">
                    {/* ===== SECTION 1 — About you (light) ===== */}
                    <motion.section {...reveal} className="rounded-[2rem] border border-stone-200/70 bg-white/70 p-7 shadow-[0_18px_50px_-35px_rgba(73,74,69,0.5)] md:p-9">
                        <div className="mb-6 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-700">
                                <CalendarHeart className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-display text-xl text-stone-800">A little about you</h2>
                                <p className="text-sm text-stone-500">This helps us care for you appropriately.</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label className="text-stone-700">Date of birth</Label>
                                <BirthCalendar value={data.date_of_birth} onChange={(v) => setData('date_of_birth', v)} disabled={processing} />
                                <InputError message={errors.date_of_birth} />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-stone-700">How do you identify?</Label>
                                <ChoiceGroup options={genders} value={data.gender} onChange={(v) => setData('gender', v)} disabled={processing} />
                                <InputError message={errors.gender} />
                            </div>
                        </div>
                    </motion.section>

                    {/* ===== SECTION 2 — Contact (dark, cinematic) ===== */}
                    <motion.section {...reveal} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-ashen-500 to-ashen-700 p-7 md:p-9">
                        <div aria-hidden className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-sage-500/30 blur-3xl animate-breathe" />
                        <div className="relative z-10">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sage-300">
                                    <Phone className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="font-display text-xl text-white">How can we reach you?</h2>
                                    <p className="text-sm text-stone-300">Your specialist will use this for your sessions.</p>
                                </div>
                            </div>

                            <Label className="text-stone-200">Phone number</Label>
                            <div className="mt-2 flex gap-3">
                                <input
                                    type="text"
                                    inputMode="tel"
                                    aria-label="Country code"
                                    value={countryCode}
                                    onChange={(e) => {
                                        setCountryCode(e.target.value);
                                        syncPhone(e.target.value, phoneNumber);
                                    }}
                                    disabled={processing}
                                    className="w-20 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center text-sm text-white transition focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 disabled:opacity-50"
                                />
                                <input
                                    type="tel"
                                    inputMode="tel"
                                    aria-label="Phone number"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value);
                                        syncPhone(countryCode, e.target.value);
                                    }}
                                    disabled={processing}
                                    placeholder="70 123 456"
                                    className="flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400 transition focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 disabled:opacity-50"
                                />
                            </div>
                            <p className="mt-2 text-xs text-stone-300">Country code is editable — just type it (e.g. +961).</p>
                            <InputError message={errors.phone} className="mt-2 text-red-300" />
                        </div>
                    </motion.section>

                    {/* ===== SECTION 3 — Your story (light) ===== */}
                    <motion.section {...reveal} className="rounded-[2rem] border border-stone-200/70 bg-white/70 p-7 shadow-[0_18px_50px_-35px_rgba(73,74,69,0.5)] md:p-9">
                        <div className="mb-6">
                            <h2 className="font-display text-xl text-stone-800">In your own words</h2>
                            <p className="text-sm text-stone-500">Only if you'd like to — there's no pressure.</p>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="support_reason" className="text-stone-700">
                                    What brings you here? <span className="font-normal text-stone-400">(optional)</span>
                                </Label>
                                <textarea
                                    id="support_reason"
                                    rows={4}
                                    value={data.support_reason}
                                    onChange={(e) => setData('support_reason', e.target.value)}
                                    disabled={processing}
                                    placeholder="Share as little or as much as you'd like — it helps us match you with the right specialist."
                                    className="w-full rounded-2xl border border-stone-300 bg-white/70 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 transition focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500/25 disabled:opacity-50"
                                />
                                <InputError message={errors.support_reason} />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-stone-700">Which language feels most like home?</Label>
                                <ChoiceGroup options={languages} value={data.preferred_language} onChange={(v) => setData('preferred_language', v)} disabled={processing} />
                                <InputError message={errors.preferred_language} />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-stone-700">
                                    Any approach you're drawn to? <span className="font-normal text-stone-400">(optional)</span>
                                </Label>
                                <ChoiceGroup options={approaches} value={data.preferred_approach} onChange={(v) => setData('preferred_approach', v)} disabled={processing} />
                                <InputError message={errors.preferred_approach} />
                            </div>
                        </div>
                    </motion.section>

                    <motion.button
                        type="submit"
                        disabled={processing}
                        whileHover={{ scale: processing ? 1 : 1.02, y: processing ? 0 : -2 }}
                        whileTap={{ scale: processing ? 1 : 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sage-600 to-sage-700 py-3.5 text-sm font-medium text-white shadow-[0_18px_45px_-12px_rgba(79,111,82,0.95)] transition-shadow hover:shadow-[0_22px_55px_-12px_rgba(79,111,82,1)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {/* shine sweep on hover */}
                        <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                        <span className="relative flex items-center gap-2">
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {processing ? 'Saving your answers…' : 'Continue to my space'}
                        </span>
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
