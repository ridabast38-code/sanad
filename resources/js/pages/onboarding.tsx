import { Head, useForm } from '@inertiajs/react';
import { CalendarHeart, LoaderCircle, Phone, Sparkles } from 'lucide-react';
import { motion, useScroll } from 'motion/react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { BirthCalendar } from '@/components/ui/birth-calendar';
import { Label } from '@/components/ui/label';

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
                        : 'border-white/20 bg-white/5 text-ashen-200 hover:border-sage-400/60 hover:bg-white/10'
                    : active
                      ? 'border-sage-700 bg-sage-700 text-white shadow-[0_10px_24px_-8px_rgba(79,111,82,0.7)]'
                      : 'border-ashen-300 bg-white/70 text-ashen-700 shadow-sm hover:border-sage-400 hover:shadow-md';
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
                className="from-sage-400 via-sage-500 fixed top-0 left-0 z-50 h-1 w-full origin-left bg-gradient-to-r to-amber-300 shadow-[0_0_14px_2px_rgba(125,160,128,0.55)]"
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
                <img
                    src="/images/onboarding-poster.jpg"
                    alt=""
                    className="hidden h-full w-full scale-105 object-cover blur-[2px] motion-reduce:block"
                />
                {/* darker, sage-tinted veil so it stays cinematic and on-brand */}
                <div className="from-ashen-950/60 via-sage-900/45 to-ashen-950/70 absolute inset-0 bg-gradient-to-b" />
                {/* ambient glows drifting across the whole page */}
                <div
                    aria-hidden
                    className="bg-sage-400/30 pointer-events-none absolute top-[6%] -left-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
                    style={{ animation: 'aurora-1 24s ease-in-out infinite' }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute top-[40%] -right-40 h-[36rem] w-[36rem] rounded-full bg-amber-300/25 blur-3xl"
                    style={{ animation: 'aurora-2 28s ease-in-out infinite' }}
                />
                <div
                    aria-hidden
                    className="bg-beige/25 pointer-events-none absolute top-[72%] left-1/4 h-[30rem] w-[30rem] rounded-full blur-3xl"
                    style={{ animation: 'aurora-3 30s ease-in-out infinite' }}
                />
                <div
                    aria-hidden
                    className="bg-sage-300/25 pointer-events-none absolute top-[90%] right-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl"
                    style={{ animation: 'aurora-2 26s ease-in-out infinite', animationDelay: '-6s' }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl px-6 py-14 md:py-20">
                {/* ===== HERO ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="mb-10 text-center"
                >
                    <span className="text-sage-300 inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase">
                        <Sparkles className="h-3.5 w-3.5" /> A warm welcome
                    </span>
                    <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] md:text-5xl">
                        Hello{firstName ? `, ${firstName}` : ''}.
                    </h1>
                    <p className="text-ashen-200 mx-auto mt-4 max-w-md leading-relaxed">
                        A few gentle questions so we can support you with care. There are no wrong answers, and everything you share stays private.
                    </p>
                </motion.div>

                <form onSubmit={submit} className="space-y-8">
                    {/* ===== SECTION 1 — About you (light) ===== */}
                    <motion.section
                        {...reveal}
                        className="border-ashen-200/70 rounded-[2rem] border bg-white/70 p-7 shadow-[0_18px_50px_-35px_rgba(73,74,69,0.5)] md:p-9"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <span className="bg-sage-100 text-sage-700 flex h-10 w-10 items-center justify-center rounded-full">
                                <CalendarHeart className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-display text-ashen-800 text-xl">A little about you</h2>
                                <p className="text-ashen-500 text-sm">This helps us care for you appropriately.</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label className="text-ashen-700">Date of birth</Label>
                                <BirthCalendar value={data.date_of_birth} onChange={(v) => setData('date_of_birth', v)} disabled={processing} />
                                <InputError message={errors.date_of_birth} />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-ashen-700">How do you identify?</Label>
                                <ChoiceGroup options={genders} value={data.gender} onChange={(v) => setData('gender', v)} disabled={processing} />
                                <InputError message={errors.gender} />
                            </div>
                        </div>
                    </motion.section>

                    {/* ===== SECTION 2 — Contact (dark, cinematic) ===== */}
                    <motion.section
                        {...reveal}
                        className="from-ashen-500 to-ashen-700 relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br p-7 md:p-9"
                    >
                        <div
                            aria-hidden
                            className="bg-sage-500/30 animate-breathe pointer-events-none absolute bottom-0 -left-10 h-56 w-56 rounded-full blur-3xl"
                        />
                        <div className="relative z-10">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="text-sage-300 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                    <Phone className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="font-display text-xl text-white">How can we reach you?</h2>
                                    <p className="text-ashen-300 text-sm">Your specialist will use this for your sessions.</p>
                                </div>
                            </div>

                            <Label className="text-ashen-200">Phone number</Label>
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
                                    className="focus:border-sage-400 focus:ring-sage-500/30 w-20 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center text-sm text-white transition focus:ring-2 focus:outline-none disabled:opacity-50"
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
                                    className="placeholder:text-ashen-400 focus:border-sage-400 focus:ring-sage-500/30 flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white transition focus:ring-2 focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            <p className="text-ashen-300 mt-2 text-xs">Country code is editable — just type it (e.g. +961).</p>
                            <InputError message={errors.phone} className="mt-2 text-red-300" />
                        </div>
                    </motion.section>

                    {/* ===== SECTION 3 — Your story (light) ===== */}
                    <motion.section
                        {...reveal}
                        className="border-ashen-200/70 rounded-[2rem] border bg-white/70 p-7 shadow-[0_18px_50px_-35px_rgba(73,74,69,0.5)] md:p-9"
                    >
                        <div className="mb-6">
                            <h2 className="font-display text-ashen-800 text-xl">In your own words</h2>
                            <p className="text-ashen-500 text-sm">Only if you'd like to — there's no pressure.</p>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="support_reason" className="text-ashen-700">
                                    What brings you here? <span className="text-ashen-400 font-normal">(optional)</span>
                                </Label>
                                <textarea
                                    id="support_reason"
                                    rows={4}
                                    value={data.support_reason}
                                    onChange={(e) => setData('support_reason', e.target.value)}
                                    disabled={processing}
                                    placeholder="Share as little or as much as you'd like — it helps us match you with the right specialist."
                                    className="border-ashen-300 text-ashen-800 placeholder:text-ashen-400 focus:border-sage-400 focus:ring-sage-500/25 w-full rounded-2xl border bg-white/70 px-4 py-3 text-sm transition focus:ring-2 focus:outline-none disabled:opacity-50"
                                />
                                <InputError message={errors.support_reason} />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-ashen-700">Which language feels most like home?</Label>
                                <ChoiceGroup
                                    options={languages}
                                    value={data.preferred_language}
                                    onChange={(v) => setData('preferred_language', v)}
                                    disabled={processing}
                                />
                                <InputError message={errors.preferred_language} />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-ashen-700">
                                    Any approach you're drawn to? <span className="text-ashen-400 font-normal">(optional)</span>
                                </Label>
                                <ChoiceGroup
                                    options={approaches}
                                    value={data.preferred_approach}
                                    onChange={(v) => setData('preferred_approach', v)}
                                    disabled={processing}
                                />
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
                        className="group from-sage-600 to-sage-700 relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r py-3.5 text-sm font-medium text-white shadow-[0_18px_45px_-12px_rgba(79,111,82,0.95)] transition-shadow hover:shadow-[0_22px_55px_-12px_rgba(79,111,82,1)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {/* shine sweep on hover */}
                        <span
                            aria-hidden
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
                        />
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
