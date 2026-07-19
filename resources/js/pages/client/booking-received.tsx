import { ClientFooter } from '@/components/client-footer';
import ClientLayout from '@/layouts/client-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * Shown right after a successful in-app demo payment. The money is in, but the
 * session is NOT confirmed yet — it's awaiting an admin's decision, so the copy
 * is careful not to promise a confirmed booking.
 */
interface Props {
    booking: {
        reference: string;
        practitioner_name: string;
        service_name: string;
        scheduled_label: string;
        price: number;
    };
}

export default function BookingReceived({ booking }: Props) {
    return (
        <ClientLayout>
            <Head title="Payment received" />

            <div className="text-ashen-800 relative flex min-h-full flex-col overflow-hidden">
                <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10 md:px-8 md:py-16">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                        <span className="bg-ashen-100 text-ashen-700 inline-flex size-16 items-center justify-center rounded-full">
                            <CheckCircle2 className="size-9" />
                        </span>
                        <h1 className="font-display text-ashen-800 mt-5 text-3xl leading-tight tracking-tight md:text-4xl">Payment received</h1>
                        <p className="text-ashen-600 mx-auto mt-3 max-w-md text-sm leading-relaxed">
                            Thank you — your payment came through. Your session is now <strong>awaiting confirmation</strong>. We’ll review it and
                            email you as soon as it’s confirmed.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="sanad-card flex flex-col gap-4 rounded-3xl p-6 md:p-7"
                    >
                        <div className="flex items-start gap-3">
                            <CalendarClock className="text-ashen-600 mt-0.5 size-5 shrink-0" />
                            <div className="min-w-0">
                                <p className="font-display text-ashen-800 text-lg">{booking.practitioner_name}</p>
                                <p className="text-ashen-600 text-sm">{booking.service_name}</p>
                                <p className="text-ashen-600 mt-1 text-sm">{booking.scheduled_label}</p>
                            </div>
                            <p className="font-display text-ashen-800 ml-auto shrink-0 text-xl">${booking.price.toFixed(2)}</p>
                        </div>

                        <div className="border-ashen-200/70 bg-ashen-50/60 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                            <span className="text-ashen-500 text-[11px] font-medium tracking-[0.12em] uppercase">Reference</span>
                            <span className="text-ashen-800 text-sm font-medium">{booking.reference}</span>
                        </div>

                        <p className="text-ashen-600 flex items-start gap-2 text-xs leading-relaxed">
                            <Clock className="text-ashen-600 mt-0.5 size-4 shrink-0" />
                            Sessions are confirmed by our team, usually within a few hours. You’ll get an email the moment yours is set.
                        </p>
                    </motion.div>

                    <div className="flex justify-center">
                        <Link
                            href="/dashboard"
                            className="group bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-2 rounded-full py-2.5 pr-2.5 pl-6 text-sm font-medium text-white shadow-lg transition duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                        >
                            Back to my dashboard
                            <span className="bg-ashen-50/20 rounded-full p-1.5 transition-transform group-hover:rotate-45">
                                <ArrowUpRight className="size-4" />
                            </span>
                        </Link>
                    </div>
                </div>

                <ClientFooter />
            </div>
        </ClientLayout>
    );
}
