import { AmbientBackground } from '@/components/ambient-background';
import { ClientFooter } from '@/components/client-footer';
import { APPROACH_LABELS, LANGUAGE_LABELS } from '@/components/specialist-card';
import ClientLayout from '@/layouts/client-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowUpRight, CalendarClock, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEvent } from 'react';

/** Same warm frosted-glass container as the rest of the client app. */
const CARD = 'rounded-3xl border border-white/60 bg-white/55 shadow-[0_24px_60px_-35px_rgba(58,59,55,0.4)] backdrop-blur-xl';

interface SpecialistProfileProps {
    specialist: {
        id: number;
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

export default function SpecialistProfile({ specialist, services, slots }: SpecialistProfileProps) {
    const { data, setData, post, processing, errors } = useForm({
        practitioner_id: specialist.id,
        service_id: services[0]?.id ?? 0,
        scheduled_at: '',
        client_note: '',
    });

    const selectedService = services.find((service) => service.id === data.service_id);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/bookings');
    };

    return (
        <ClientLayout>
            <Head title={specialist.name} />

            <div className="bg-cream text-ashen-800 relative flex min-h-full flex-col overflow-hidden">
                <AmbientBackground />

                <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid items-start gap-6 md:grid-cols-5 md:gap-8"
                    >
                        {/* ===== PORTRAIT ===== */}
                        <div className={`overflow-hidden md:col-span-2 ${CARD}`}>
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
                                        M2 · Clinical Psychology
                                    </span>
                                </div>
                            </div>
                            <div className="px-5 pb-5">
                                <p className="text-ashen-600 flex items-start gap-2 text-xs leading-relaxed">
                                    <ShieldCheck className="text-sage-600 mt-0.5 size-4 shrink-0" />
                                    Works under the supervision of certified psychologists. Private &amp; confidential.
                                </p>
                            </div>
                        </div>

                        {/* ===== STORY + BOOKING ===== */}
                        <div className="flex flex-col gap-6 md:col-span-3">
                            <header>
                                <h1 className="font-display text-ashen-800 text-3xl leading-tight tracking-tight md:text-4xl">{specialist.name}</h1>
                                {specialist.headline && <p className="text-ashen-600 mt-2 text-base">{specialist.headline}</p>}
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
                                    {specialist.years_experience != null && (
                                        <span className="text-ashen-500 ml-1 text-xs">{specialist.years_experience} years of experience</span>
                                    )}
                                </div>
                                {specialist.bio && <p className="text-ashen-600 mt-4 max-w-xl text-sm leading-relaxed">{specialist.bio}</p>}
                            </header>

                            {/* ===== BOOKING FORM ===== */}
                            <form onSubmit={submit} className={`flex flex-col gap-6 p-6 md:p-7 ${CARD}`}>
                                <h2 className="font-display text-ashen-800 text-xl">Book your session</h2>

                                {/* service */}
                                <div>
                                    <p className="text-ashen-500 mb-2.5 text-xs font-medium tracking-[0.12em] uppercase">1 · Session type</p>
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

                                {/* note */}
                                <div>
                                    <p className="text-ashen-500 mb-2.5 text-xs font-medium tracking-[0.12em] uppercase">
                                        3 · Anything you’d like to share? <span className="normal-case">(optional)</span>
                                    </p>
                                    <textarea
                                        value={data.client_note}
                                        onChange={(event) => setData('client_note', event.target.value)}
                                        rows={3}
                                        placeholder="A few words about what brings you here — only your specialist will read this."
                                        className="border-sage-200/70 text-ashen-800 placeholder:text-ashen-400 focus:border-sage-400 focus:ring-sage-300/40 w-full rounded-2xl border bg-white/60 px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                                    />
                                    {errors.client_note && <p className="mt-2 text-sm text-red-600">{errors.client_note}</p>}
                                </div>

                                <div className="border-sage-200/60 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-ashen-600 text-sm">
                                        {selectedService ? (
                                            <>
                                                Total: <span className="font-display text-ashen-800 text-xl">${selectedService.price}</span> — payment
                                                is arranged after confirmation.
                                            </>
                                        ) : (
                                            'Select a session type to continue.'
                                        )}
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.scheduled_at || !data.service_id}
                                        className="group bg-sage-700 hover:bg-sage-800 inline-flex w-fit shrink-0 items-center gap-2 rounded-full py-2.5 pr-2.5 pl-6 text-sm font-medium text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
                                    >
                                        {processing ? 'Booking…' : 'Confirm booking'}
                                        <span className="rounded-full bg-white/20 p-1.5 transition-transform group-hover:rotate-45">
                                            <ArrowUpRight className="size-4" />
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>

                <ClientFooter />
            </div>
        </ClientLayout>
    );
}
