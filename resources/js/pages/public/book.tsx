import { APPROACH_LABELS, LANGUAGE_LABELS } from '@/components/specialist-card';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CalendarClock, Clock, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEvent } from 'react';

/** Same warm frosted-glass container used across the client app. */
const CARD = 'sanad-card rounded-3xl';

const FIELD =
    'border-ashen-300/50 text-ashen-800 placeholder:text-ashen-400 focus:border-ashen-400 focus:ring-ashen-300/40 w-full rounded-2xl border bg-ashen-50/60 px-4 py-2.5 text-sm focus:ring-2 focus:outline-none';

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

/**
 * The guest booking page — the same psychologist, the same three columns and the
 * same viewport fit as the signed-in profile at /therapists/{id}.
 *
 * It used to be a different page entirely: two columns, a full-width account
 * banner across the top, and the whole thing scrolling. A visitor arriving from
 * the public directory saw one design, then a completely different one the moment
 * they signed in. The only real difference now is that a guest has to tell us who
 * they are, so the booking column carries three extra fields — which is exactly
 * why the account nudge is one line here instead of a banner.
 */
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
        <div className="sanad-split text-ashen-800 relative flex min-h-screen flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden">
            <Head title={`Book with ${specialist.name}`} />

            {/* ===== minimal public top bar ===== */}
            <header className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between px-6 py-4 md:px-10">
                <Link href="/" className="font-display text-ashen-800 text-xl tracking-tight">
                    OurSanad
                </Link>
                <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/psychologists"
                            className="group border-ashen-600/40 text-ashen-700 hover:border-ashen-700 hover:text-ashen-900 inline-flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-2 text-sm transition md:py-2"
                        >
                            <span className="bg-ashen-900/10 rounded-full p-1 transition-transform group-hover:-translate-x-0.5">
                                <ArrowLeft className="h-4 w-4" />
                            </span>
                            Back
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/login"
                            className="group bg-ashen-800 hover:bg-ashen-900 text-ashen-200 inline-flex items-center gap-2 rounded-full py-1.5 pr-5 pl-2 text-sm transition md:py-2"
                        >
                            <span className="bg-ashen-200/30 rounded-full p-1 transition-transform group-hover:rotate-45">
                                <ArrowUpRight className="h-4 w-4" />
                            </span>
                            Log in
                        </Link>
                    </motion.div>
                </div>
            </header>

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-14 md:px-10 lg:min-h-0 lg:pb-6">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-6 md:grid-cols-2 md:gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:items-stretch lg:gap-6"
                >
                    {/* ===== PORTRAIT (desktop only) =====
                    Hidden on a phone so the name, session type, times and Confirm aren't
                    pushed below a full-height portrait — the phone leads with the booking. */}
                    <div className={`hidden flex-col overflow-hidden md:flex lg:col-span-4 lg:min-h-0 ${CARD}`}>
                        <div className="p-2.5 lg:min-h-0 lg:flex-1">
                            <div className="bg-ashen-200/70 relative aspect-[4/5] w-full overflow-hidden rounded-[1.3rem] lg:aspect-auto lg:h-full lg:min-h-[8rem]">
                                {specialist.photo_path ? (
                                    <img
                                        src={specialist.photo_path}
                                        alt={specialist.name}
                                        className="absolute inset-0 h-full w-full object-cover object-[center_20%] grayscale-[15%]"
                                    />
                                ) : (
                                    <div className="from-ashen-300 to-ashen-600 absolute inset-0 bg-gradient-to-br" />
                                )}
                            </div>
                        </div>
                        <div className="shrink-0 px-5 pb-5 lg:pt-3">
                            <p className="text-ashen-600 flex items-start gap-2 text-xs leading-relaxed">
                                <ShieldCheck className="text-ashen-600 mt-0.5 size-4 shrink-0" />
                                Private &amp; confidential.
                            </p>
                        </div>
                    </div>

                    {/* ===== STORY + SESSION TYPE ===== */}
                    <div className="flex flex-col gap-5 lg:col-span-3 lg:min-h-0">
                        <header className="shrink-0">
                            <h1 className="font-display text-ashen-800 text-3xl leading-tight tracking-tight md:text-4xl lg:text-3xl">
                                {specialist.name}
                            </h1>
                            {specialist.headline && <p className="text-ashen-600 mt-2 text-base lg:text-sm">{specialist.headline}</p>}
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                {specialist.approaches.map((approach) => (
                                    <span key={approach} className="bg-ashen-100 text-ashen-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                                        {APPROACH_LABELS[approach] ?? approach}
                                    </span>
                                ))}
                                {specialist.languages.map((language) => (
                                    <span key={language} className="border-ashen-300/60 text-ashen-500 rounded-full border px-2.5 py-0.5 text-xs">
                                        {LANGUAGE_LABELS[language] ?? language}
                                    </span>
                                ))}
                                {specialist.years_experience != null && (
                                    <span className="text-ashen-500 ml-1 text-xs">{specialist.years_experience} years of experience</span>
                                )}
                            </div>
                            {/* clamped on desktop so an unusually long bio cannot push the
                            booking column off the screen */}
                            {specialist.bio && (
                                <p className="text-ashen-600 mt-4 text-sm leading-relaxed lg:mt-3 lg:line-clamp-4">{specialist.bio}</p>
                            )}
                        </header>

                        <div className={`flex flex-col gap-3 p-5 lg:min-h-0 lg:flex-1 ${CARD}`}>
                            <p className="text-ashen-500 shrink-0 text-xs font-medium tracking-[0.12em] uppercase">1 · Session type</p>

                            {services.length === 0 && (
                                <div className="border-ashen-300/50 text-ashen-600 bg-ashen-50/40 rounded-2xl border border-dashed px-4 py-5 text-center text-sm">
                                    {firstName} is finishing setting up their session types. Please check back shortly, or{' '}
                                    <Link href="/psychologists" className="text-ashen-700 font-medium underline-offset-2 hover:underline">
                                        choose another specialist
                                    </Link>
                                    .
                                </div>
                            )}

                            <div className="scrollbar-hide flex flex-col gap-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                                {services.map((service) => (
                                    <button
                                        type="button"
                                        key={service.id}
                                        onClick={() => setData('service_id', service.id)}
                                        className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                                            data.service_id === service.id
                                                ? 'border-ashen-500 bg-ashen-50/80 shadow-sm'
                                                : 'border-ashen-300/50 hover:border-ashen-400 bg-ashen-50/40'
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
                            {errors.service_id && <p className="text-sm text-red-600">{errors.service_id}</p>}
                        </div>
                    </div>

                    {/* ===== TIME + DETAILS + RESERVE ===== */}
                    <form onSubmit={submit} className={`flex flex-col gap-4 p-6 md:col-span-2 lg:col-span-5 lg:min-h-0 ${CARD}`}>
                        <div className="shrink-0">
                            <h2 className="font-display text-ashen-800 text-xl tracking-tight">Book your session with {firstName}</h2>
                            <p className="text-ashen-600 mt-1 text-xs leading-relaxed">
                                No account needed — we’ll email you everything for this session.
                            </p>
                        </div>

                        {/* The times get the room. This is what the page exists for, and it is
                        the last thing that should ever be squeezed into a letterbox. */}
                        <div className="flex flex-col gap-2.5 lg:min-h-0 lg:flex-1">
                            <p className="text-ashen-500 flex shrink-0 items-center gap-1.5 text-xs font-medium tracking-[0.12em] uppercase">
                                <CalendarClock className="text-ashen-600 size-4" /> 2 · Pick a time
                            </p>
                            {slots.length > 0 ? (
                                <div className="scrollbar-hide flex flex-wrap content-start gap-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                                    {slots.map((slot) => (
                                        <button
                                            type="button"
                                            key={slot.iso}
                                            onClick={() => setData('scheduled_at', slot.iso)}
                                            className={`h-fit rounded-full border px-4 py-2 text-sm font-medium transition ${
                                                data.scheduled_at === slot.iso
                                                    ? 'border-ashen-600 bg-ashen-600 text-ashen-50 shadow-sm'
                                                    : 'border-ashen-300/60 bg-ashen-50/60 text-ashen-800 hover:border-ashen-400'
                                            }`}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-ashen-500 text-sm">No open times right now — please check back soon.</p>
                            )}
                            {errors.scheduled_at && <p className="text-sm text-red-600">{errors.scheduled_at}</p>}
                        </div>

                        {/* the one thing the signed-in page doesn't need: who you are */}
                        <div className="shrink-0">
                            <p className="text-ashen-500 mb-2 text-xs font-medium tracking-[0.12em] uppercase">3 · Your details</p>
                            <div className="flex flex-col gap-2.5">
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
                                <div className="grid gap-2.5 sm:grid-cols-2">
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
                                        rows={2}
                                        placeholder="Anything you’d like to share? (optional) — only your specialist will read this."
                                        className={FIELD}
                                    />
                                    {errors.client_note && <p className="mt-1.5 text-sm text-red-600">{errors.client_note}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-ashen-300/40 flex shrink-0 flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
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
                                className="group bg-ashen-700 hover:bg-ashen-800 text-ashen-50 inline-flex w-fit shrink-0 items-center gap-2 rounded-full py-2.5 pr-2.5 pl-6 text-sm font-medium shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
                            >
                                {processing ? 'Reserving…' : 'Reserve as guest'}
                                <span className="bg-ashen-50/20 rounded-full p-1.5 transition-transform group-hover:rotate-45">
                                    <ArrowUpRight className="size-4" />
                                </span>
                            </button>
                        </div>

                        {/* One line, not the banner this page used to open with. The account is
                        worth having, but it isn't what this page is for. */}
                        <p className="text-ashen-500 shrink-0 text-xs leading-relaxed">
                            <Link
                                href="/register"
                                className="text-ashen-700 inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline"
                            >
                                <UserPlus className="size-3.5" /> Create an account
                            </Link>{' '}
                            instead — a dashboard, reminders and loyalty rewards.
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
