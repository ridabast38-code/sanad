import { Head, useForm } from '@inertiajs/react';
import { motion } from 'motion/react';
import { LoaderCircle, ChevronDown, Phone, CalendarHeart, Sparkles } from 'lucide-react';
import { FormEventHandler, ReactNode, useState } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
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

const countryCodes = ['+961', '+971', '+966', '+974', '+965', '+973', '+968', '+962', '+20', '+33', '+44', '+1'];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 90 }, (_, i) => currentYear - 13 - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

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
                        ? 'border-sage-400 bg-sage-500 text-white'
                        : 'border-white/20 bg-white/5 text-stone-200 hover:border-sage-400/60'
                    : active
                      ? 'border-sage-700 bg-sage-700 text-white'
                      : 'border-stone-300 bg-white/60 text-stone-700 hover:border-sage-400';
                return (
                    <motion.button
                        key={o.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(o.value)}
                        whileHover={{ scale: disabled ? 1 : 1.03 }}
                        whileTap={{ scale: disabled ? 1 : 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${base}`}
                    >
                        {o.label}
                    </motion.button>
                );
            })}
        </div>
    );
}

/** A polished select with a floating label and custom chevron (not a spreadsheet cell). */
function SelectField({
    label,
    value,
    onChange,
    disabled,
    children,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="relative">
            <select
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="peer w-full appearance-none rounded-2xl border border-stone-300 bg-white/70 px-4 pb-2.5 pt-6 text-sm text-stone-800 transition focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500/25 disabled:opacity-50"
            >
                {children}
            </select>
            <span className="pointer-events-none absolute left-4 top-2 text-[10px] font-medium uppercase tracking-wider text-stone-400">{label}</span>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        </div>
    );
}

const reveal = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: 'easeOut' as const },
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

    // date of birth — three styled dropdowns combined into YYYY-MM-DD
    const [dob, setDob] = useState({ day: '', month: '', year: '' });
    const updateDob = (part: 'day' | 'month' | 'year', value: string) => {
        const next = { ...dob, [part]: value };
        setDob(next);
        if (next.day && next.month && next.year) {
            setData('date_of_birth', `${next.year}-${String(Number(next.month)).padStart(2, '0')}-${String(Number(next.day)).padStart(2, '0')}`);
        } else {
            setData('date_of_birth', '');
        }
    };

    // phone — country code + number combined into one value
    const [countryCode, setCountryCode] = useState('+961');
    const [phoneNumber, setPhoneNumber] = useState('');
    const syncPhone = (code: string, num: string) => setData('phone', num.trim() ? `${code} ${num.trim()}` : '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const firstName = name?.split(' ')[0] ?? '';

    return (
        <div className="relative min-h-screen overflow-hidden bg-cream">
            <Head title="Welcome to Sanad" />

            {/* ambient glows (cheap: opacity/translate only) */}
            <div aria-hidden className="pointer-events-none absolute -left-40 top-[8%] h-[34rem] w-[34rem] rounded-full bg-sage-300/30 blur-3xl" style={{ animation: 'aurora-1 24s ease-in-out infinite' }} />
            <div aria-hidden className="pointer-events-none absolute -right-40 top-[45%] h-[36rem] w-[36rem] rounded-full bg-amber-200/30 blur-3xl" style={{ animation: 'aurora-2 28s ease-in-out infinite' }} />

            <div className="relative z-10 mx-auto max-w-2xl px-6 py-12 md:py-16">
                {/* ===== HERO — cinematic photo panel ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-[2rem] bg-stone-900 p-8 text-white shadow-[0_30px_80px_-40px_rgba(58,59,55,0.7)] md:p-12"
                >
                    <img src="/images/support/ongoing.jpg" alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-stone-950/85 via-stone-950/55 to-sage-900/40" />
                    <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sage-500/40 blur-3xl animate-breathe" />

                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-sage-300">
                            <Sparkles className="h-3.5 w-3.5" /> A warm welcome
                        </span>
                        <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
                            Hello{firstName ? `, ${firstName}` : ''}.
                        </h1>
                        <p className="mt-4 max-w-md leading-relaxed text-stone-300">
                            A few gentle questions so we can support you with care. There are no wrong answers, and everything you share stays private.
                        </p>
                    </div>
                </motion.div>

                <form onSubmit={submit} className="mt-8 space-y-8">
                    {/* ===== SECTION 1 — About you (light) ===== */}
                    <motion.section {...reveal} className="rounded-[2rem] border border-stone-200/70 bg-white/60 p-7 shadow-[0_18px_50px_-35px_rgba(73,74,69,0.5)] md:p-9">
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
                                <Label>Date of birth</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    <SelectField label="Day" value={dob.day} onChange={(v) => updateDob('day', v)} disabled={processing}>
                                        <option value="" disabled></option>
                                        {days.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </SelectField>
                                    <SelectField label="Month" value={dob.month} onChange={(v) => updateDob('month', v)} disabled={processing}>
                                        <option value="" disabled></option>
                                        {months.map((m, i) => (
                                            <option key={m} value={i + 1}>{m}</option>
                                        ))}
                                    </SelectField>
                                    <SelectField label="Year" value={dob.year} onChange={(v) => updateDob('year', v)} disabled={processing}>
                                        <option value="" disabled></option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </SelectField>
                                </div>
                                <InputError message={errors.date_of_birth} />
                            </div>

                            <div className="grid gap-3">
                                <Label>How do you identify?</Label>
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
                                <div className="relative w-32 shrink-0">
                                    <select
                                        aria-label="Country code"
                                        value={countryCode}
                                        onChange={(e) => {
                                            setCountryCode(e.target.value);
                                            syncPhone(e.target.value, phoneNumber);
                                        }}
                                        disabled={processing}
                                        className="w-full appearance-none rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white transition focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 disabled:opacity-50"
                                    >
                                        {countryCodes.map((c) => (
                                            <option key={c} value={c} className="text-stone-800">
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
                                </div>
                                <input
                                    type="tel"
                                    inputMode="tel"
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
                            <InputError message={errors.phone} className="mt-2 text-red-300" />
                        </div>
                    </motion.section>

                    {/* ===== SECTION 3 — Your story (light) ===== */}
                    <motion.section {...reveal} className="rounded-[2rem] border border-stone-200/70 bg-white/60 p-7 shadow-[0_18px_50px_-35px_rgba(73,74,69,0.5)] md:p-9">
                        <div className="mb-6">
                            <h2 className="font-display text-xl text-stone-800">In your own words</h2>
                            <p className="text-sm text-stone-500">Only if you'd like to — there's no pressure.</p>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="support_reason">
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
                                <Label>Which language feels most like home?</Label>
                                <ChoiceGroup options={languages} value={data.preferred_language} onChange={(v) => setData('preferred_language', v)} disabled={processing} />
                                <InputError message={errors.preferred_language} />
                            </div>

                            <div className="grid gap-3">
                                <Label>
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
                        whileHover={{ scale: processing ? 1 : 1.015 }}
                        whileTap={{ scale: processing ? 1 : 0.985 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 py-3.5 text-sm font-medium text-white shadow-[0_18px_45px_-15px_rgba(79,111,82,0.9)] transition-colors hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Saving your answers…' : 'Continue to my space'}
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
