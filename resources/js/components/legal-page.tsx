import { AmbientBackground } from '@/components/ambient-background';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Calm public page for legal texts (privacy, terms). Standalone — works for
 * guests and signed-in clients alike.
 */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="sanad-split text-ashen-800 relative min-h-screen overflow-hidden">
            <Head title={title} />
            <AmbientBackground />

            <div className="relative mx-auto w-full max-w-3xl px-4 py-12 md:px-8 md:py-16">
                <Link href="/" className="text-ashen-700 hover:text-ashen-900 inline-flex items-center gap-1.5 text-sm font-medium transition">
                    <ArrowLeft className="size-4" /> Back to OurSanad
                </Link>

                <h1 className="font-display text-ashen-800 mt-6 text-4xl tracking-tight md:text-5xl">{title}</h1>
                <p className="text-ashen-500 mt-2 text-sm">Last updated: June 2026</p>

                <div className="prose-sanad [&_a]:text-ashen-700 [&_h2]:font-display [&_h2]:text-ashen-800 [&_p]:text-ashen-600 mt-8 flex flex-col gap-4 text-sm leading-relaxed [&_a]:underline [&_h2]:mt-4 [&_h2]:text-xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
