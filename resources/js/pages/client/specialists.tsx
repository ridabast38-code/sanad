import { ClientFooter } from '@/components/client-footer';
import { SpecialistPortraitCard, SpecialistPreviewModal, type Specialist } from '@/components/specialist-card';
import ClientLayout from '@/layouts/client-layout';
import { Head } from '@inertiajs/react';
import { ShieldCheck, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface SpecialistsProps {
    practitioners: Specialist[];
}

/**
 * The client "View all" directory (reached from the emergency and ongoing flows).
 *
 * Uses the same landing-style portrait cards and preview modal as every other
 * place a specialist is listed — click a face to read their qualifications, then
 * book. It previously used the older album card and jumped straight to booking,
 * which made it the odd one out.
 */
export default function Specialists({ practitioners }: SpecialistsProps) {
    // read their qualifications first, then on to booking
    const [preview, setPreview] = useState<Specialist | null>(null);

    return (
        <ClientLayout>
            <Head title="Our specialists" />

            <div className="text-ashen-800 relative flex min-h-full flex-col overflow-hidden">
                <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
                    <header>
                        <span className="border-ashen-300/60 text-ashen-700 bg-ashen-50/70 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-medium tracking-[0.18em] uppercase backdrop-blur">
                            <Users className="size-3.5" /> {practitioners.length} available
                        </span>
                        <h1 className="font-display text-ashen-800 mt-4 text-4xl leading-tight tracking-tight md:text-5xl">Our specialists</h1>
                        <p className="text-ashen-600 mt-3 flex max-w-2xl items-start gap-2 text-sm leading-relaxed">
                            <ShieldCheck className="text-ashen-600 mt-0.5 size-4 shrink-0" />
                            Every Sanad psychologist is a licensed clinical psychologist — real, confidential care.
                        </p>
                    </header>

                    {practitioners.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {practitioners.map((specialist) => (
                                <SpecialistPortraitCard key={specialist.id} specialist={specialist} onSelect={setPreview} />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="border-ashen-300/60 bg-ashen-50/30 flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed p-12 text-center backdrop-blur-sm">
                            <p className="font-display text-ashen-700 text-xl">Our specialists are on their way</p>
                            <p className="text-ashen-500 max-w-sm text-sm">We’re carefully selecting the right people. Check back soon.</p>
                        </div>
                    )}
                </div>

                <ClientFooter />
            </div>

            {/* signed-in clients get the richer in-app profile as the booking step */}
            <SpecialistPreviewModal specialist={preview} bookHref={(s) => `/therapists/${s.id}`} onClose={() => setPreview(null)} />
        </ClientLayout>
    );
}
