import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="grid min-h-dvh bg-cream lg:grid-cols-2">
            {/* left — cinematic photo, calm reassurance (hidden on small screens) */}
            <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
                <img src="/images/support/ongoing.jpg" alt="" className="absolute inset-0 h-full w-full scale-105 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/45 to-stone-950/80" />
                <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-sage-600/30 blur-3xl" style={{ animation: 'aurora-1 26s ease-in-out infinite' }} />

                <Link href={route('home')} className="relative z-10 flex items-center gap-2.5 text-white">
                    <AppLogoIcon className="size-7 fill-current text-white" />
                    <span className="font-display text-xl">Sanad</span>
                </Link>

                <blockquote className="relative z-10">
                    <p className="max-w-md font-display text-3xl leading-snug text-white">
                        However you arrived here, you don't have to carry it alone.
                    </p>
                    <footer className="mt-4 text-sm tracking-wide text-white/70">A safe space for your mind</footer>
                </blockquote>
            </div>

            {/* right — the form, on warm cream */}
            <div className="relative flex items-center justify-center px-6 py-12 sm:px-10">
                <div aria-hidden className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-sage-300/20 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="relative z-10 mx-auto w-full max-w-sm"
                >
                    {/* mobile brand mark */}
                    <Link href={route('home')} className="mb-8 flex items-center justify-center gap-2.5 text-stone-800 lg:hidden">
                        <AppLogoIcon className="size-7 fill-current text-sage-700" />
                        <span className="font-display text-xl">Sanad</span>
                    </Link>

                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="font-display text-3xl tracking-tight text-stone-800">{title}</h1>
                        <p className="mt-2 text-sm leading-relaxed text-stone-500">{description}</p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
}
