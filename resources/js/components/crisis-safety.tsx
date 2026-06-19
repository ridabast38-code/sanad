import { LifeBuoy, MessageCircle, Phone, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export interface SafetyInfo {
    whatsapp_url: string;
    hotlines: { label: string; number: string; note: string }[];
}

/**
 * The life-safety layer shown on every emergency screen: a quiet, always-present
 * way to reach a real person on WhatsApp, and — one tap away — the crisis
 * hotlines for immediate danger. Calm by default so it never adds panic.
 */
export function CrisisSafety({ safety }: { safety: SafetyInfo }) {
    const [showHotlines, setShowHotlines] = useState(false);

    return (
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <ShieldAlert className="size-5" />
                    </span>
                    <div>
                        <p className="text-ashen-800 text-sm font-semibold">Need a person right now?</p>
                        <p className="text-ashen-500 text-sm">We’re one message away, any time.</p>
                    </div>
                </div>
                <a
                    href={safety.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    <MessageCircle className="size-4" /> Talk to us on WhatsApp
                </a>
            </div>

            <div className="mt-4 border-t border-amber-200/60 pt-3">
                <button
                    type="button"
                    onClick={() => setShowHotlines((v) => !v)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 transition hover:text-amber-800"
                >
                    <LifeBuoy className="size-3.5" />
                    {showHotlines ? 'Hide emergency numbers' : 'In immediate danger? See emergency numbers'}
                </button>

                {showHotlines && (
                    <ul className="mt-3 space-y-2">
                        {safety.hotlines.map((line) => (
                            <li key={line.number} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-ashen-800 truncate text-sm font-semibold">{line.label}</p>
                                    <p className="text-ashen-500 truncate text-xs">{line.note}</p>
                                </div>
                                <a
                                    href={`tel:${line.number}`}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-sm font-bold text-amber-700 tabular-nums transition hover:bg-amber-200"
                                >
                                    <Phone className="size-3.5" /> {line.number}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
