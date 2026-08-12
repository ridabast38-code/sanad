import SlotPicker, { type Slot } from '@/components/slot-picker';
import { APPROACH_LABELS, LANGUAGE_LABELS } from '@/components/specialist-card';
import ClientLayout from '@/layouts/client-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowUpRight, CalendarClock, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEvent } from 'react';

/** Same warm frosted-glass container as the rest of the client app. */
const CARD = 'sanad-card rounded-3xl';

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
    slots: Slot[];
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
        <ClientLayout fitViewport>
            <Head title={specialist.name} />

            <div className="text-ashen-800 relative flex min-h-full flex-1 flex-col lg:min-h-0">
                <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12 lg:min-h-0 lg:py-6">
                    {/* Three columns on desktop, not two.

                    The times used to sit in a scrolling box inside the form, which meant
                    hunting for a slot through a letterbox — worse than simply scrolling
                    the page. Spreading the content sideways gives every step room to be
                    visible at once, so the times never need a cramped scroller again. */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-6 md:grid-cols-2 md:gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:items-stretch lg:gap-6"
                    >
                        {/* ===== PORTRAIT (desktop only) =====
                        Hidden on a phone: a full 4:5 portrait ate the whole first screen and
                        pushed the session type, times and Confirm button far down a scroll. The
                        phone leads with the name and the booking instead. */}
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

                        {/* ===== TIME + NOTE + CONFIRM ===== */}
                        <form onSubmit={submit} className={`flex flex-col gap-4 p-6 md:col-span-2 lg:col-span-5 lg:min-h-0 ${CARD}`}>
                            <h2 className="font-display text-ashen-800 shrink-0 text-xl">Book your session</h2>

                            {/* The times get the room — this is what the page exists for, and
                            it is the last thing that should ever be squeezed. */}
                            <div className="flex flex-col gap-2.5 lg:min-h-0 lg:flex-1">
                                <p className="text-ashen-500 flex shrink-0 items-center gap-1.5 text-xs font-medium tracking-[0.12em] uppercase">
                                    <CalendarClock className="text-ashen-600 size-4" /> 2 · Pick a time
                                </p>
                                <SlotPicker slots={slots} value={data.scheduled_at} onSelect={(iso) => setData('scheduled_at', iso)} />
                                {errors.scheduled_at && <p className="text-sm text-red-600">{errors.scheduled_at}</p>}
                            </div>

                            <div className="shrink-0">
                                <p className="text-ashen-500 mb-2 text-xs font-medium tracking-[0.12em] uppercase">
                                    3 · Anything you’d like to share? <span className="normal-case">(optional)</span>
                                </p>
                                <textarea
                                    value={data.client_note}
                                    onChange={(event) => setData('client_note', event.target.value)}
                                    rows={2}
                                    placeholder="A few words about what brings you here — only your specialist will read this."
                                    className="border-ashen-300/50 text-ashen-800 placeholder:text-ashen-400 focus:border-ashen-400 focus:ring-ashen-300/40 bg-ashen-50/60 w-full rounded-2xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
                                />
                                {errors.client_note && <p className="mt-2 text-sm text-red-600">{errors.client_note}</p>}
                            </div>

                            <div className="border-ashen-300/40 flex shrink-0 flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-ashen-600 text-sm">
                                    {selectedService ? (
                                        <>
                                            Total: <span className="font-display text-ashen-800 text-xl">${selectedService.price}</span> — payment is
                                            arranged after confirmation.
                                        </>
                                    ) : (
                                        'Select a session type to continue.'
                                    )}
                                </p>
                                <button
                                    type="submit"
                                    disabled={processing || !data.scheduled_at || !data.service_id}
                                    className="group bg-ashen-700 hover:bg-ashen-800 text-ashen-50 inline-flex w-fit shrink-0 items-center gap-2 rounded-full py-2.5 pr-2.5 pl-6 text-sm font-medium shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
                                >
                                    {processing ? 'Booking…' : 'Confirm booking'}
                                    <span className="bg-ashen-50/20 rounded-full p-1.5 transition-transform group-hover:rotate-45">
                                        <ArrowUpRight className="size-4" />
                                    </span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </ClientLayout>
    );
}
