import { AmbientBackground } from '@/components/ambient-background';
import { ClientFooter } from '@/components/client-footer';
import { matchesPreferences, SpecialistCard, type MatchPreferences, type Specialist } from '@/components/specialist-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ShieldCheck, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface SpecialistsProps {
    practitioners: Specialist[];
    preferences: MatchPreferences;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Specialists', href: '/specialists' },
];

const fadeUp = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
};

export default function Specialists({ practitioners, preferences }: SpecialistsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Our specialists" />

            <div className="bg-cream text-ashen-800 relative flex min-h-full flex-col overflow-hidden">
                <AmbientBackground />

                <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
                    <header>
                        <span className="border-sage-200/80 text-sage-700 inline-flex items-center gap-2 rounded-full border bg-white/50 px-3.5 py-1 text-[11px] font-medium tracking-[0.18em] uppercase backdrop-blur">
                            <Users className="size-3.5" /> {practitioners.length} available
                        </span>
                        <h1 className="font-display text-ashen-800 mt-4 text-4xl leading-tight tracking-tight md:text-5xl">Our specialists</h1>
                        <p className="text-ashen-600 mt-3 flex max-w-2xl items-start gap-2 text-sm leading-relaxed">
                            <ShieldCheck className="text-sage-600 mt-0.5 size-4 shrink-0" />
                            Every specialist holds a Master’s (M2) in Clinical Psychology and works under the supervision of certified psychologists.
                        </p>
                    </header>

                    {practitioners.length > 0 ? (
                        <motion.div {...fadeUp} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {practitioners.map((specialist) => (
                                <SpecialistCard key={specialist.id} specialist={specialist} matched={matchesPreferences(specialist, preferences)} />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="border-sage-300/60 flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed bg-white/30 p-12 text-center backdrop-blur-sm">
                            <p className="font-display text-ashen-700 text-xl">Our specialists are on their way</p>
                            <p className="text-ashen-500 max-w-sm text-sm">We’re carefully selecting the right people. Check back soon.</p>
                        </div>
                    )}
                </div>

                <ClientFooter />
            </div>
        </AppLayout>
    );
}
