import { Head, useForm } from '@inertiajs/react';
import { motion } from 'motion/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type OnboardingForm = {
    date_of_birth: string;
    gender: string;
    phone: string;
    emergency_contact: string;
    support_reason: string;
    preferred_language: string;
    preferred_approach: string;
};

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 90 }, (_, i) => currentYear - 13 - i); // 13 to 102 years old
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const selectClass =
    'rounded-xl border border-stone-300 bg-white/60 px-3 py-2.5 text-sm text-stone-800 transition focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/30 disabled:opacity-50';

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

function ChoiceGroup({
    options,
    value,
    onChange,
    disabled,
}: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-wrap gap-2.5">
            {options.map((o) => {
                const active = value === o.value;
                return (
                    <motion.button
                        key={o.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(o.value)}
                        whileTap={{ scale: disabled ? 1 : 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                            active
                                ? 'border-sage-700 bg-sage-700 text-white'
                                : 'border-stone-300 bg-white/60 text-stone-700 hover:border-sage-400'
                        }`}
                    >
                        {o.label}
                    </motion.button>
                );
            })}
        </div>
    );
}

export default function Onboarding({ name }: { name: string }) {
    const { data, setData, post, processing, errors } = useForm<OnboardingForm>({
        date_of_birth: '',
        gender: '',
        phone: '',
        emergency_contact: '',
        support_reason: '',
        preferred_language: '',
        preferred_approach: '',
    });

    // date of birth handled as three friendly dropdowns, combined into YYYY-MM-DD
    const [dob, setDob] = useState({ day: '', month: '', year: '' });
    const updateDob = (part: 'day' | 'month' | 'year', value: string) => {
        const next = { ...dob, [part]: value };
        setDob(next);
        if (next.day && next.month && next.year) {
            const mm = String(Number(next.month)).padStart(2, '0');
            const dd = String(Number(next.day)).padStart(2, '0');
            setData('date_of_birth', `${next.year}-${mm}-${dd}`);
        } else {
            setData('date_of_birth', '');
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const firstName = name?.split(' ')[0] ?? '';

    return (
        <div className="min-h-screen bg-cream px-6 py-12 md:py-16">
            <Head title="Welcome to Sanad" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mx-auto max-w-xl"
            >
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-sage-700">A warm welcome</span>
                <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-stone-800 md:text-5xl">
                    Hello{firstName ? `, ${firstName}` : ''}.
                </h1>
                <p className="mt-4 leading-relaxed text-stone-500">
                    A few gentle questions so we can support you with care. There are no wrong answers, and everything you share stays private.
                </p>

                <form onSubmit={submit} className="mt-10 flex flex-col gap-8">
                    {/* date of birth — three calm dropdowns */}
                    <div className="grid gap-2">
                        <Label>Date of birth</Label>
                        <div className="grid grid-cols-3 gap-3">
                            <select aria-label="Day" value={dob.day} onChange={(e) => updateDob('day', e.target.value)} disabled={processing} className={selectClass}>
                                <option value="" disabled>Day</option>
                                {days.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <select aria-label="Month" value={dob.month} onChange={(e) => updateDob('month', e.target.value)} disabled={processing} className={selectClass}>
                                <option value="" disabled>Month</option>
                                {months.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <select aria-label="Year" value={dob.year} onChange={(e) => updateDob('year', e.target.value)} disabled={processing} className={selectClass}>
                                <option value="" disabled>Year</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <InputError message={errors.date_of_birth} />
                    </div>

                    {/* gender */}
                    <div className="grid gap-3">
                        <Label>How do you identify?</Label>
                        <ChoiceGroup options={genders} value={data.gender} onChange={(v) => setData('gender', v)} disabled={processing} />
                        <InputError message={errors.gender} />
                    </div>

                    {/* preferred language */}
                    <div className="grid gap-3">
                        <Label>Which language feels most like home?</Label>
                        <ChoiceGroup options={languages} value={data.preferred_language} onChange={(v) => setData('preferred_language', v)} disabled={processing} />
                        <InputError message={errors.preferred_language} />
                    </div>

                    {/* support reason */}
                    <div className="grid gap-2">
                        <Label htmlFor="support_reason">What brings you here?</Label>
                        <textarea
                            id="support_reason"
                            rows={4}
                            value={data.support_reason}
                            onChange={(e) => setData('support_reason', e.target.value)}
                            disabled={processing}
                            placeholder="Share as little or as much as you'd like — it helps us match you with the right specialist."
                            className="w-full rounded-xl border border-stone-300 bg-white/60 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/30 disabled:opacity-50"
                        />
                        <InputError message={errors.support_reason} />
                    </div>

                    {/* preferred approach (optional) */}
                    <div className="grid gap-3">
                        <Label>
                            Any approach you're drawn to? <span className="font-normal text-stone-400">(optional)</span>
                        </Label>
                        <ChoiceGroup options={approaches} value={data.preferred_approach} onChange={(v) => setData('preferred_approach', v)} disabled={processing} />
                        <InputError message={errors.preferred_approach} />
                    </div>

                    {/* phone */}
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={processing}
                            placeholder="+961 …"
                            className="bg-white/60"
                        />
                        <p className="text-xs text-stone-400">So your specialist can reach you about your sessions.</p>
                        <InputError message={errors.phone} />
                    </div>

                    {/* emergency contact */}
                    <div className="grid gap-2">
                        <Label htmlFor="emergency_contact">Emergency contact</Label>
                        <Input
                            id="emergency_contact"
                            type="text"
                            value={data.emergency_contact}
                            onChange={(e) => setData('emergency_contact', e.target.value)}
                            disabled={processing}
                            placeholder="Name and phone number of someone we can reach"
                            className="bg-white/60"
                        />
                        <p className="text-xs text-stone-400">For your safety — only used if there's a serious concern for your wellbeing.</p>
                        <InputError message={errors.emergency_contact} />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={processing}
                        whileHover={{ scale: processing ? 1 : 1.01 }}
                        whileTap={{ scale: processing ? 1 : 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 py-3 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(79,111,82,0.8)] transition-colors hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Saving your answers…' : 'Continue to my space'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
