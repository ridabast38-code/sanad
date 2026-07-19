import { useForm } from '@inertiajs/react';
import { CreditCard, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * The in-app card checkout. Prefilled with a demo test card so a session can be
 * "paid" in one tap: it plays a short Processing… beat, then posts to the demo
 * gateway. On success the server marks the booking paid (still pending) and
 * redirects to the "payment received" screen — no real money, no auto-confirm.
 * Only rendered inside the native app (see isNativeApp()).
 */
export function DemoPayByCard({ bookingId, price }: { bookingId: number; price: number }) {
    const { data, setData, post, processing, errors } = useForm({
        name: 'Sanad Demo',
        number: '4242 4242 4242 4242',
        expiry: '12 / 29',
        cvc: '123',
    });
    const [phase, setPhase] = useState<'idle' | 'processing'>('idle');
    const busy = phase === 'processing' || processing;

    const pay = () => {
        if (busy) {
            return;
        }
        setPhase('processing');
        // A brief, believable "contacting your bank" beat before the charge posts.
        window.setTimeout(() => {
            post(`/bookings/${bookingId}/gateway`, {
                onError: () => setPhase('idle'),
            });
        }, 1500);
    };

    const field = 'border-ashen-200/70 bg-ashen-50/70 focus:border-ashen-400 focus:ring-ashen-300/40 w-full rounded-2xl border px-4 py-3 text-sm text-ashen-800 outline-none transition focus:ring-2';

    return (
        <div className="sanad-card rounded-3xl p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-ashen-800 flex items-center gap-2 text-lg">
                    <CreditCard className="text-ashen-600 size-5" /> Pay by card
                </h2>
                <span className="bg-ashen-100 text-ashen-600 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Demo
                </span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
                <label className="block">
                    <span className="text-ashen-500 mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase">Name on card</span>
                    <input className={field} value={data.name} onChange={(e) => setData('name', e.target.value)} disabled={busy} />
                </label>
                <label className="block">
                    <span className="text-ashen-500 mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase">Card number</span>
                    <input className={field} value={data.number} onChange={(e) => setData('number', e.target.value)} inputMode="numeric" disabled={busy} />
                    {errors.number && <span className="mt-1 block text-xs text-red-600">{errors.number}</span>}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                        <span className="text-ashen-500 mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase">Expiry</span>
                        <input className={field} value={data.expiry} onChange={(e) => setData('expiry', e.target.value)} disabled={busy} />
                    </label>
                    <label className="block">
                        <span className="text-ashen-500 mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase">CVC</span>
                        <input className={field} value={data.cvc} onChange={(e) => setData('cvc', e.target.value)} inputMode="numeric" disabled={busy} />
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
                        <Loader2 className="size-4 animate-spin" /> Processing…
                    </>
                ) : (
                    <>
                        <Lock className="size-4" /> Pay ${price.toFixed(2)}
                    </>
                )}
            </button>

            <p className="text-ashen-400 mt-3 text-center text-[11px] leading-relaxed">
                Demo checkout — no real charge is made. Your session is sent for confirmation.
            </p>
        </div>
    );
}
