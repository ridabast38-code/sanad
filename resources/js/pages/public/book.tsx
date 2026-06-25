import { AmbientBackground } from '@/components/ambient-background';
import { APPROACH_LABELS, LANGUAGE_LABELS } from '@/components/specialist-card';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CalendarClock, Check, Clock, Gift, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEvent } from 'react';

/** Same warm frosted-glass container used across the client app. */
const CARD = 'rounded-3xl border border-white/60 bg-white/55 shadow-[0_24px_60px_-35px_rgba(58,59,55,0.4)] backdrop-blur-xl';

const FIELD =
    'border-sage-200/70 text-ashen-800 placeholder:text-ashen-400 focus:border-sage-400 focus:ring-sage-300/40 w-full rounded-2xl border bg-white/60 px-4 py-3 text-sm focus:ring-2 focus:outline-none';

interface BookProps {
    specialist: {
        id: number;
        slug: string;
        name: string;
        headline: string | null;
        bio: string | null;
        photo_path: string | null;
        approaches: string[];
        languages: string[];
        years_experience: number | null;
    };
    services: {
        id: number;
        name: string;
        description: string | null;
        duration_minutes: number | null;
        price: number;
    }[];
    slots: { iso: string; label: string }[];
}

export default function Book({ specialist, services, slots }: BookProps) {
    const firstName = specialist.name.split(' ')[0];

    const { data, setData, post, processing, errors } = useForm({
        service_id: services[0]?.id ?? 0,
        scheduled_at: '',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        client_note: '',
    });

    const selectedService = services.find((service) => service.id === data.service_id);
    const ready = !!data.service_id && !!data.scheduled_at && !!data.guest_name && !!data.guest_email && !!data.guest_phone;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(`/book/${specialist.slug}`);
    };

    return (
        <div className="bg-cream text-ashen-800 relative min-h-screen overflow-hidden">
            <Head title={`Book with ${specialist.name}`} />
            <AmbientBackground />

            {/* ===== minimal public top bar ===== */}
            <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
                <Link href="/" className="font-display text-ashen-800 text-xl tracking-tight">
                    Sanad
                </Link>
                <Link
                    href="/login"
                    className="text-ashen-600 hover:text-ashen-900 hover:bg-ashen-900/5 rounded-full px-4 py-2 text-sm font-medium transition"
                >
                    Log in
                </Link>
            </header>

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 md:px-8">
                <Link href="/#team" className="text-ashen-500 hover:text-ashen-800 inline-flex w-fit items-center gap-1.5 text-sm transition">
                    <ArrowLeft className="size-4" /> Back to our team
                </Link>

                {/* up-front choice — make creating an account the visible, inviting first path */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="border-sage-200/70 from-sage-100/80 relative overflow-hidden rounded-3xl border bg-gradient-to-r to-white/50 p-5 sm:p-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="bg-sage-600 flex size-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm">
                                <Sparkles className="size-5" />
                            </span>
                            <div>
                                <p className="font-display text-ashen-800 text-lg leading-tight">Create a free account &amp; unlock more</p>
                                <p className="text-ashen-600 mt-0.5 text-sm leading-relaxed">
                                    A dashboard to track sessions, reminders, and loyalty rewards — or simply book as a guest below.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/register"
                            className="group bg-sage-700 hover:bg-sage-800 inline-flex shrink-0 items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5"
                        >
                            <span className="rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-45">
                                <UserPlus className="size-4" />
                            </span>
                            Create account &amp; book
                        </Link>
                    </div>
                </motion.div>

                <div className="grid items-start gap-6 md:grid-cols-5 md:gap-8">
                    {/* ===== LEFT — specialist + the sign-up invitation ===== */}
                    <div className="flex flex-col gap-6 md:col-span-2 md:sticky md:top-6">
                        <div className={`overflow-hidden ${CARD}`}>
                            <div className="p-2.5">
                                <div className="bg-ashen-200/70 relative aspect-[4/5] w-full overflow-hidden rounded-[1.3rem]">
                                    {specialist.photo_path ? (
                                        <img
                                            src={specialist.photo_path}
                                            alt={specialist.name}
                                            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                                        />
                                    ) : (
                                        <div className="from-sage-300 to-sage-600 absolute inset-0 bg-gradient-to-br" />
                                    )}
                                    <span className="bg-cream/90 text-ashen-700 absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur">
                                        Licensed Psychologist
                                    </span>
                                </div>
                            </div>
                            <div className="px-5 pb-5">
                                <h1 className="font-display text-ashen-800 text-2xl tracking-tight">{specialist.name}</h1>
                                {specialist.headline && <p className="text-ashen-600 mt-1 text-sm">{specialist.headline}</p>}
                                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                    {specialist.approaches.map((approach) => (
                                        <span key={approach} className="bg-sage-100 text-sage-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                                            {APPROACH_LABELS[approach] ?? approach}
                                        </span>
                                    ))}
                                    {specialist.languages.map((language) => (
                                        <span key={language} className="border-sage-200 text-ashen-500 rounded-full border px-2.5 py-0.5 text-xs">
                                            {LANGUAGE_LABELS[language] ?? language}
                                        </span>
                                    ))}
                                </div>
                                {specialist.bio && <p className="text-ashen-600 mt-4 text-sm leading-relaxed">{specialist.bio}</p>}
                                <p className="text-ashen-600 mt-4 flex items-start gap-2 text-xs leading-relaxed">
                                    <ShieldCheck className="text-sage-600 mt-0.5 size-4 shrink-0" />
                                    Licensed clinical psychologist. Private &amp; confidential.
                                </p>
                            </div>
                        </div>

                        {/* the gentle nudge to create an account */}
                        <div className="border-sage-200/70 from-sage-50 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-white/60 p-6">
                            <span className="text-sage-700 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] uppercase">
                                <Sparkles className="size-4" /> Worth a minute
                            </span>
                            <h2 className="font-display text-ashen-800 mt-2 text-xl">Create a free account?</h2>
                            <p className="text-ashen-600 mt-1.5 text-sm leading-relaxed">
                                You can book as a guest below — but with an account you also get:
                            </p>
                            <ul className="mt-4 space-y-2.5">
                                {[
                                    { icon: CalendarClock, text: 'A dashboard to track every session' },
                                    { icon: Gift, text: 'Promotions & loyalty rewards' },
                                    { icon: Check, text: 'Reminders so you never miss a session' },
                                ].map((perk) => (
                                    <li key={perk.text} className="text-ashen-700 flex items-center gap-2.5 text-sm">
                                        <span className="bg-sage-100 text-sage-700 flex size-6 shrink-0 items-center justify-center rounded-full">
                                            <perk.icon className="size-3.5" />
                                        </span>
                                        {perk.text}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/register"
                                className="group bg-sage-700 hover:bg-sage-800 mt-5 inline-flex items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-sm font-medium text-white transition"
                            >
                                <span className="rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-45">
                                    <UserPlus className="size-4" />
                                </span>
                                Create an account
                            </Link>
                        </div>
                    </div>

                    {/* ===== RIGHT — the booking form (guest path) ===== */}
                    <form onSubmit={submit} className={`flex flex-col gap-7 p-6 md:col-span-3 md:p-8 ${CARD}`}>
                        <div>
                            <h2 className="font-display text-ashen-800 text-2xl tracking-tight">Book your session with {firstName}</h2>
                            <p className="text-ashen-600 mt-1.5 text-sm leading-relaxed">
                                No account needed — just the essentials, and we’ll email you everything for this session.
                            </p>
                        </div>

                        {/* service */}
                        <div>
                            <p className="text-ashen-500 mb-2.5 text-xs font-medium tracking-[0.12em] uppercase">1 · Session type</p>
                            {services.length === 0 && (
                                <div className="border-sage-200/70 text-ashen-600 rounded-2xl border border-dashed bg-white/40 px-4 py-5 text-center text-sm">
                                    {firstName} is finishing setting up their session types. Please check back shortly, or{' '}
                                    <Link href="/#team" className="text-sage-700 font-medium underline-offset-2 hover:underline">
                                        choose another specialist
                                    </Link>
                                    .
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                {services.map((service) => (
                                    <button
                                        type="button"
                                        key={service.id}
                                        onClick={() => setData('service_id', service.id)}
                                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                                            data.service_id === service.id
                                                ? 'border-sage-500 bg-sage-50 shadow-sm'
                                                : 'border-sage-200/70 hover:border-sage-300 bg-white/50'
                                        }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="text-ashen-800 block text-sm font-medium">{service.name}</span>
                                            {service.duration_minutes != null && (
                                                <span className="text-ashen-500 mt-0.5 flex items-center gap-1 text-xs">
                                                    <Clock className="size-3.5" /> {service.duration_minutes} minutes
                                                </span>
                                            )}
                                        </span>
                                        <span className="font-display text-ashen-800 shrink-0 text-lg">${service.price}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.service_id && <p className="mt-2 text-sm text-red-600">{errors.service_id}</p>}
                        </div>

                        {/* slot */}
                        <div>
                            <p className="text-ashen-500 mb-2.5 flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] uppercase">
                                <CalendarClock className="text-sage-600 size-4" /> 2 · Pick a time
                            </p>
                            {slots.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {slots.map((slot) => (
                                        <button
                                            type="button"
                                            key={slot.iso}
                                            onClick={() => setData('scheduled_at', slot.iso)}
                                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                                data.scheduled_at === slot.iso
                                                    ? 'border-sage-600 bg-sage-600 text-white shadow-sm'
                                                    : 'border-sage-200 bg-sage-50/70 text-sage-800 hover:border-sage-400'
                                            }`}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-ashen-500 text-sm">No open times right now — please check back soon.</p>
                            )}
                            {errors.scheduled_at && <p className="mt-2 text-sm text-red-600">{errors.scheduled_at}</p>}
                        </div>

                        {/* details */}
                        <div>
                            <p className="text-ashen-500 mb-2.5 text-xs font-medium tracking-[0.12em] uppercase">3 · Your details</p>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <input
                                        type="text"
                                        value={data.guest_name}
                                        onChange={(event) => setData('guest_name', event.target.value)}
                                        placeholder="Full name"
                                        autoComplete="name"
                                        className={FIELD}
                                    />
                                    {errors.guest_name && <p className="mt-1.5 text-sm text-red-600">{errors.guest_name}</p>}
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <input
                                            type="email"
                                            value={data.guest_email}
                                            onChange={(event) => setData('guest_email', event.target.value)}
                                            placeholder="Email"
                                            autoComplete="email"
                                            className={FIELD}
                                        />
                                        {errors.guest_email && <p className="mt-1.5 text-sm text-red-600">{errors.guest_email}</p>}
                                    </div>
                                    <div>
                                        <input
                                            type="tel"
                                            value={data.guest_phone}
                                            onChange={(event) => setData('guest_phone', event.target.value)}
                                            placeholder="Phone number"
                                            autoComplete="tel"
                                            className={FIELD}
                                        />
                                        {errors.guest_phone && <p className="mt-1.5 text-sm text-red-600">{errors.guest_phone}</p>}
                                    </div>
                                </div>
                                <div>
                                    <textarea
                                        value={data.client_note}
                                        onChange={(event) => setData('client_note', event.target.value)}
                                        rows={3}
                                        placeholder="Anything you’d like to share? (optional) — only your specialist will read this."
                                        className={FIELD}
                                    />
                                    {errors.client_note && <p className="mt-1.5 text-sm text-red-600">{errors.client_note}</p>}
                                </div>
                            </div>
                        </div>

                        {/* total + reserve */}
                        <div className="border-sage-200/60 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-ashen-600 text-sm">
                                {selectedService ? (
                                    <>
                                        Total: <span className="font-display text-ashen-800 text-xl">${selectedService.price}</span> — paid after we
                                        confirm.
                                    </>
                                ) : (
                                    'Select a session type to continue.'
                                )}
                            </p>
                            <button
                                type="submit"
                                disabled={processing || !ready}
                                className="group bg-sage-700 hover:bg-sage-800 inline-flex w-fit shrink-0 items-center gap-2 rounded-full py-2.5 pr-2.5 pl-6 text-sm font-medium text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
                            >
                                {processing ? 'Reserving…' : 'Reserve as guest'}
                                <span className="rounded-full bg-white/20 p-1.5 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="size-4" />
                                </span>
                            </button>
                        </div>

                        <p className="text-ashen-500 -mt-2 text-xs leading-relaxed">
                            Prefer to keep a record?{' '}
                            <Link href="/register" className="text-sage-700 font-medium underline-offset-2 hover:underline">
                                Create an account
                            </Link>{' '}
                            instead — you’ll get a dashboard, reminders and loyalty rewards.
                        </p>
                    </form>
                </div>
            </div>

            {/* tiny footer note */}
            <footer className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-8 md:px-8">
                <p className="text-ashen-400 border-ashen-200/70 border-t pt-6 text-xs leading-relaxed">
                    Sanad is a fully licensed, confidential clinical practice. For a medical emergency or if you are in danger, please contact your
                    local emergency number.
                </p>
            </footer>
        </div>
    );
}
