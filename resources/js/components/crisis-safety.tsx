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
        <div className="border-ashen-500/40 from-ashen-200/60 to-ashen-300/50 rounded-3xl border bg-gradient-to-br p-5 shadow-[0_8px_30px_-14px_rgba(26,28,28,0.2)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="bg-ashen-200/70 text-ashen-700 flex size-10 shrink-0 items-center justify-center rounded-full">
                        <ShieldAlert className="size-5" />
                    </span>
                    <div>
                        <p className="text-ashen-900 text-sm font-semibold">Need a person right now?</p>
                        <p className="text-ashen-600 text-sm">We’re one message away, any time.</p>
                    </div>
                </div>
                <a
                    href={safety.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ashen-800 hover:bg-ashen-900 text-ashen-100 inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    <MessageCircle className="size-4" /> Talk to us on WhatsApp
                </a>
            </div>

            <div className="border-ashen-400/40 mt-4 border-t pt-3">
                <button
                    type="button"
                    onClick={() => setShowHotlines((v) => !v)}
                    className="text-ashen-700 hover:text-ashen-900 inline-flex items-center gap-2 text-xs font-semibold transition"
                >
                    <LifeBuoy className="size-3.5" />
                    {showHotlines ? 'Hide emergency numbers' : 'In immediate danger? See emergency numbers'}
                </button>

                {showHotlines && (
                    <ul className="mt-3 space-y-2">
                        {safety.hotlines.map((line) => (
                            <li key={line.number} className="bg-ashen-200/50 flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-ashen-900 truncate text-sm font-semibold">{line.label}</p>
                                    <p className="text-ashen-600 truncate text-xs">{line.note}</p>
                                </div>
                                <a
                                    href={`tel:${line.number}`}
                                    className="bg-ashen-200/80 text-ashen-800 hover:bg-ashen-300 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold tabular-nums transition"
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
