import { ClientFooter } from '@/components/client-footer';
import { DemoPayByCard } from '@/components/demo-pay-by-card';
import { isNativeApp } from '@/lib/native';
import ClientLayout from '@/layouts/client-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarClock, Check, Copy, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

/** Same warm frosted-glass container as the rest of the client app. */
const CARD = 'sanad-card rounded-3xl';

interface PaymentMethod {
    key: string;
    label: string;
    number: string;
    account_name: string | null;
    instructions: string;
}

interface BookingPaymentProps {
    booking: {
        id: number;
        reference: string;
        practitioner_name: string;
        service_name: string;
        scheduled_label: string;
        price: number;
    };
    methods: PaymentMethod[];
    whatsappUrl: string;
}

/** A value with a one-tap copy button that briefly confirms. */
function CopyField({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Clipboard unavailable — the value is still visible to copy by hand.
        }
    };

    return (
        // The whole field is the tap target — on a phone you tap the number and it's
        // copied, ready to paste straight into Whish.
        <button
            type="button"
            onClick={copy}
            className="border-ashen-200/70 bg-ashen-50/60 hover:bg-ashen-100/70 flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99]"
        >
            <span className="min-w-0">
                <span className="text-ashen-500 block text-[11px] font-medium tracking-[0.12em] uppercase">{label}</span>
                <span className="text-ashen-800 mt-0.5 block truncate text-base font-semibold">{value}</span>
            </span>
            <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    copied ? 'bg-ashen-800 text-ashen-50' : 'text-ashen-700'
                }`}
            >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied!' : 'Tap to copy'}
            </span>
        </button>
    );
}

export default function BookingPayment({ booking, methods, whatsappUrl }: BookingPaymentProps) {
    return (
        <ClientLayout>
            <Head title="Confirm your session" />

            <div className="text-ashen-800 relative flex min-h-full flex-col overflow-hidden">
                <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
                    <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <span className="bg-ashen-100 text-ashen-700 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                            <Check className="size-3.5" /> Session reserved
                        </span>
                        <h1 className="font-display text-ashen-800 mt-4 text-3xl leading-tight tracking-tight md:text-4xl">
                            One last step — send your payment
                        </h1>
                        <p className="text-ashen-600 mx-auto mt-3 max-w-xl text-sm leading-relaxed">
                            Your time is held. To confirm it, send the amount below via Whish or OMT. Once we receive it, we’ll confirm your session
                            and email you the details.
                        </p>
                    </motion.header>

                    {/* ===== BOOKING SUMMARY ===== */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className={`p-6 md:p-7 ${CARD}`}
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-ashen-500 flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] uppercase">
                                    <CalendarClock className="text-ashen-600 size-4" /> Your session
                                </p>
                                <p className="font-display text-ashen-800 mt-2 text-xl">{booking.practitioner_name}</p>
                                <p className="text-ashen-600 text-sm">{booking.service_name}</p>
                                <p className="text-ashen-600 mt-1 text-sm">{booking.scheduled_label}</p>
                            </div>
                            <div className="border-ashen-200/60 shrink-0 border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:text-right">
                                <p className="text-ashen-500 text-xs">Amount to send</p>
                                <p className="font-display text-ashen-800 text-3xl">${booking.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* ===== IN-APP CARD CHECKOUT (demo, native app only) ===== */}
                    {isNativeApp() && (
                        <>
                            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                                <DemoPayByCard bookingId={booking.id} price={booking.price} />
                            </motion.div>
                            <div className="flex items-center gap-3">
                                <span className="bg-ashen-200/70 h-px flex-1" />
                                <span className="text-ashen-500 text-xs font-medium tracking-[0.12em] uppercase">Or pay by transfer</span>
                                <span className="bg-ashen-200/70 h-px flex-1" />
                            </div>
                        </>
                    )}

                    {/* ===== PAYMENT METHODS ===== */}
                    {methods.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {methods.map((method, index) => (
                                <motion.div
                                    key={method.key}
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    className={`flex flex-col gap-3 p-6 ${CARD}`}
                                >
                                    <h2 className="font-display text-ashen-800 text-lg">{method.label}</h2>
                                    {method.account_name && <CopyField label="Account name" value={method.account_name} />}
                                    <CopyField label="Number" value={method.number} />
                                    <p className="text-ashen-500 text-xs leading-relaxed">{method.instructions}</p>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className={`p-6 text-center ${CARD}`}>
                            <p className="text-ashen-600 text-sm">
                                Payment details are being set up. Please contact us and we’ll guide you through it.
                            </p>
                        </div>
                    )}

                    {/* ===== OMT / WHATSAPP SUPPORT ===== */}
                    <motion.a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={`flex items-center gap-4 p-5 transition hover:-translate-y-0.5 ${CARD}`}
                    >
                        <span className="bg-ashen-100 text-ashen-700 flex size-11 shrink-0 items-center justify-center rounded-full">
                            <MessageCircle className="size-5" />
                        </span>
                        <span className="min-w-0">
                            <span className="text-ashen-800 block text-sm font-medium">Paying by OMT, or need a hand?</span>
                            <span className="text-ashen-500 block text-xs leading-relaxed">
                                Message us on WhatsApp — we’ll arrange an OMT transfer or walk you through Whish.
                            </span>
                        </span>
                        <ArrowUpRight className="text-ashen-400 ml-auto size-4 shrink-0" />
                    </motion.a>

                    {/* ===== REFERENCE + REASSURANCE ===== */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`flex flex-col gap-4 p-6 ${CARD}`}
                    >
                        <div className="border-ashen-200/70 bg-ashen-50/60 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                            <span className="min-w-0">
                                <span className="text-ashen-500 block text-[11px] font-medium tracking-[0.12em] uppercase">Your reference</span>
                                <span className="text-ashen-800 mt-0.5 block text-sm font-medium">{booking.reference}</span>
                            </span>
                            <span className="text-ashen-500 max-w-[55%] text-right text-xs leading-snug">
                                Add this in the transfer note so we can match your payment quickly.
                            </span>
                        </div>

                        <p className="text-ashen-600 flex items-start gap-2 text-xs leading-relaxed">
                            <ShieldCheck className="text-ashen-600 mt-0.5 size-4 shrink-0" />
                            Payments are reviewed by hand for now — once yours arrives, you’ll get a confirmation email (usually within a few hours)
                            and your session moves to confirmed.
                        </p>
                    </motion.div>

                    {/* ===== ACTIONS ===== */}
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/dashboard"
                            className="group bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-2 rounded-full py-2.5 pr-2.5 pl-6 text-sm font-medium text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.97]"
                        >
                            I’ve sent the payment
                            <span className="bg-ashen-50/20 rounded-full p-1.5 transition-transform group-hover:rotate-45">
                                <ArrowUpRight className="size-4" />
                            </span>
                        </Link>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ashen-700 hover:bg-ashen-100 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition"
                        >
                            <MessageCircle className="size-4" /> Need help paying?
                        </a>
                    </div>
                </div>

                <ClientFooter />
            </div>
        </ClientLayout>
    );
}
