import { AmbientBackground } from '@/components/ambient-background';
import { OliveTree } from '@/components/olive';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarClock, Check, Copy, Gift, MessageCircle, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

/** Same warm frosted-glass container as the rest of the app. */
const CARD = 'sanad-card rounded-3xl';

interface PaymentMethod {
    key: string;
    label: string;
    number: string;
    account_name: string | null;
    instructions: string;
}

interface BookingConfirmedProps {
    booking: {
        reference: string;
        guest_name: string;
        guest_email: string;
        practitioner_name: string;
        service_name: string;
        scheduled_label: string;
        price: number;
        is_paid: boolean;
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

export default function BookingConfirmed({ booking, methods, whatsappUrl }: BookingConfirmedProps) {
    return (
        <div className="sanad-split text-ashen-800 relative min-h-screen overflow-hidden">
            <Head title="Your session is reserved" />
            <AmbientBackground />

            {/* The olive closes this page the way it closes the landing. This is the
            arrival — the booking is made — so it earns the whole tree rather than a
            treeline. Faint, and rooted below the fold: it should be the thing you
            notice second, after the confirmation itself. */}
            <OliveTree className="-bottom-20 md:-bottom-28" opacity="opacity-[0.13] md:opacity-[0.16]" />

            <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5 md:px-8">
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

            <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 md:px-8">
                <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <span className="bg-ashen-100 text-ashen-700 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                        <Check className="size-3.5" /> Session reserved
                    </span>
                    <h1 className="font-display text-ashen-800 mt-4 text-3xl leading-tight tracking-tight md:text-4xl">
                        {booking.is_paid ? 'Your session is confirmed' : 'One last step — send your payment'}
                    </h1>
                    <p className="text-ashen-600 mx-auto mt-3 max-w-xl text-sm leading-relaxed">
                        {booking.is_paid
                            ? `Thanks, ${booking.guest_name.split(' ')[0]} — your payment is in and your session is confirmed. We’ve emailed the details to ${booking.guest_email}.`
                            : `Thanks, ${booking.guest_name.split(' ')[0]} — your time is held. To confirm it, send the amount below via Whish or OMT. Once we receive it, we’ll confirm your session and email ${booking.guest_email}.`}
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
                            <p className="text-ashen-500 text-xs">{booking.is_paid ? 'Amount paid' : 'Amount to send'}</p>
                            <p className="font-display text-ashen-800 text-3xl">${booking.price.toFixed(2)}</p>
                        </div>
                    </div>
                </motion.div>

                {/* ===== PAYMENT METHODS (only while unpaid) ===== */}
                {!booking.is_paid &&
                    (methods.length > 0 ? (
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
                    ))}

                {/* ===== OMT / WHATSAPP SUPPORT (only while unpaid) ===== */}
                {!booking.is_paid && (
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
                )}

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
                        Payments are reviewed by hand for now — once yours arrives, you’ll get a confirmation email (usually within a few hours) and
                        your session moves to confirmed.
                    </p>
                </motion.div>

                {/* ===== CREATE-ACCOUNT NUDGE ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="border-ashen-200/70 from-ashen-50 flex flex-col gap-4 rounded-3xl border bg-gradient-to-br to-white/60 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="min-w-0">
                        <p className="text-ashen-700 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] uppercase">
                            <Gift className="size-4" /> Keep it all in one place
                        </p>
                        <h2 className="font-display text-ashen-800 mt-2 text-lg">Create a free account</h2>
                        <p className="text-ashen-600 mt-1 text-sm leading-relaxed">
                            Sign up with <span className="font-medium">{booking.guest_email}</span> and this session appears in your dashboard
                            automatically — plus reminders, promotions and loyalty rewards.
                        </p>
                    </div>
                    <Link
                        href="/register"
                        className="group bg-ashen-700 hover:bg-ashen-800 inline-flex w-fit shrink-0 items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-sm font-medium text-white transition"
                    >
                        <span className="bg-ashen-50/20 rounded-full p-1 transition-transform group-hover:rotate-45">
                            <UserPlus className="size-4" />
                        </span>
                        Create account
                    </Link>
                </motion.div>

                {/* ===== ACTIONS ===== */}
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/"
                        className="group bg-ashen-900/5 text-ashen-700 hover:bg-ashen-900/10 inline-flex items-center gap-2 rounded-full py-2.5 pr-2.5 pl-6 text-sm font-medium transition"
                    >
                        Back to home
                        <span className="bg-ashen-900/10 rounded-full p-1.5 transition-transform group-hover:rotate-45">
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
        </div>
    );
}
