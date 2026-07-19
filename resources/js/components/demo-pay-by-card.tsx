import { useForm } from '@inertiajs/react';
import { AlertCircle, CreditCard, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * "SanadPay" — the in-app sandbox checkout. It formats and brand-detects the
 * card, plays a short Processing… beat, then posts to the gateway, which does
 * real validation (Luhn/expiry/CVC) and can decline test cards. On success the
 * booking is marked paid (still pending — no auto-confirm). No real money moves.
 * Only rendered inside the native app (see isNativeApp()).
 */

function detectBrand(digits: string): string {
    if (/^4/.test(digits)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'Amex';
    return '';
}

function formatNumber(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 19);
    return d.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)} / ${d.slice(2)}`;
}

export function DemoPayByCard({ bookingId, price }: { bookingId: number; price: number }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: 'Sanad Demo',
        number: '4242 4242 4242 4242',
        expiry: '12 / 29',
        cvc: '123',
    });
    const [phase, setPhase] = useState<'idle' | 'processing'>('idle');
    const busy = phase === 'processing' || processing;
    const brand = detectBrand(data.number.replace(/\D/g, ''));

    const pay = () => {
        if (busy) return;
        clearErrors();
        setPhase('processing');
        // A brief, believable "contacting your bank" beat before the charge posts.
        window.setTimeout(() => {
            post(`/bookings/${bookingId}/gateway`, {
                onError: () => setPhase('idle'),
            });
        }, 1500);
    };

    const field =
        'border-ashen-200/70 bg-ashen-50/70 focus:border-ashen-400 focus:ring-ashen-300/40 w-full rounded-2xl border px-4 py-3 text-sm text-ashen-800 outline-none transition focus:ring-2';

    return (
        <div className="sanad-card overflow-hidden rounded-3xl">
            {/* Gateway header — reads as a real payment product */}
            <div className="bg-ashen-800 flex items-center justify-between px-6 py-4 text-white">
                <span className="font-display flex items-center gap-2 text-lg">
                    <ShieldCheck className="size-5" /> SanadPay
                </span>
                <span className="text-ashen-200/80 flex items-center gap-1.5 text-[11px] font-medium tracking-[0.12em] uppercase">
                    <Lock className="size-3" /> Secure sandbox
                </span>
            </div>

            <div className="p-6 md:p-7">
                {errors.card && (
                    <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <span>{errors.card}</span>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <label className="block">
                        <span className="text-ashen-500 mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase">Name on card</span>
                        <input className={field} value={data.name} onChange={(e) => setData('name', e.target.value)} disabled={busy} />
                    </label>
                    <label className="block">
                        <span className="text-ashen-500 mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase">Card number</span>
                        <span className="relative block">
                            <input
                                className={field}
                                value={data.number}
                                onChange={(e) => setData('number', formatNumber(e.target.value))}
                                inputMode="numeric"
                                autoComplete="cc-number"
                                disabled={busy}
                            />
                            {brand && (
                                <span className="text-ashen-600 absolute top-1/2 right-3 -translate-y-1/2 rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-semibold">
                                    {brand}
                                </span>
                            )}
                        </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="text-ashen-500 mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase">Expiry</span>
                            <input
                                className={field}
                                value={data.expiry}
                                onChange={(e) => setData('expiry', formatExpiry(e.target.value))}
                                inputMode="numeric"
                                placeholder="MM / YY"
                                disabled={busy}
                            />
                        </label>
                        <label className="block">
                            <span className="text-ashen-500 mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase">CVC</span>
                            <input
                                className={field}
                                value={data.cvc}
                                onChange={(e) => setData('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                disabled={busy}
                            />
                        </label>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={pay}
                    disabled={busy}
                    className="bg-ashen-800 hover:bg-ashen-900 mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:translate-y-0 disabled:opacity-90"
                >
                    {busy ? (
                        <>
                            <Loader2 className="size-4 animate-spin" /> Contacting your bank…
                        </>
                    ) : (
                        <>
                            <CreditCard className="size-4" /> Pay ${price.toFixed(2)}
                        </>
                    )}
                </button>

                <p className="text-ashen-400 mt-3 text-center text-[11px] leading-relaxed">
                    Sandbox — no real charge. Try <span className="text-ashen-600 font-medium">4242 4242 4242 4242</span> (approved) or{' '}
                    <span className="text-ashen-600 font-medium">4000 0000 0000 0002</span> (declined).
                </p>
            </div>
        </div>
    );
}
