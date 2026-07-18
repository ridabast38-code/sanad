import { X } from 'lucide-react';
import { type ReactNode } from 'react';

/**
 * A small centered modal for reading a record's full detail — the "info" panels
 * on the admin clients and bookings pages. Scrolls its own body so a long list of
 * fields never pushes the close button or the modal itself off a phone screen.
 */
export function InfoModal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
    return (
        <div className="bg-ashen-950/60 fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-ashen-50 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-2xl"
            >
                <div className="border-ashen-200/70 flex items-start justify-between gap-4 border-b px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="font-display text-ashen-900 truncate text-lg">{title}</h3>
                        {subtitle && <p className="text-ashen-400 truncate text-xs">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-ashen-500 hover:text-ashen-900 hover:bg-ashen-100 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full transition"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
            </div>
        </div>
    );
}

/**
 * One labelled fact inside an InfoModal. Renders a subtle "—" when empty, so a
 * blank field reads as "not provided" rather than a broken row.
 */
export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
    const empty = value === null || value === undefined || value === '';

    return (
        <div className="border-ashen-200/50 flex flex-col gap-0.5 border-b py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-3">
            <p className="text-ashen-400 shrink-0 text-[11px] font-semibold tracking-[0.12em] uppercase sm:w-32">{label}</p>
            <p className={`text-sm ${empty ? 'text-ashen-300' : 'text-ashen-800'}`}>{empty ? '—' : value}</p>
        </div>
    );
}
