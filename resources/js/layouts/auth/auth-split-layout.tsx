import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    photoSide?: 'left' | 'right';
}

export default function AuthSplitLayout({ children, title, description, photoSide = 'left' }: AuthLayoutProps) {
    const slide = { type: 'spring', stiffness: 200, damping: 30 } as const;

    // cinematic photo panel — slides side to side when navigating login <-> register
    const photo = (
        <motion.div key="auth-photo" layout transition={slide} className="relative hidden overflow-hidden lg:block lg:w-1/2">
            <img src="/images/auth.jpg" alt="" className="absolute inset-0 h-full w-full scale-105 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/45 to-stone-950/80" />
            <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-sage-600/30 blur-3xl" style={{ animation: 'aurora-1 26s ease-in-out infinite' }} />

            <div className="absolute inset-0 flex flex-col justify-between p-12">
                <Link href={route('home')} className="flex items-center gap-2.5 text-white">
                    <AppLogoIcon className="size-7 fill-current text-white" />
                    <span className="font-display text-xl">Sanad</span>
                </Link>
                <blockquote>
                    <p className="max-w-md font-display text-3xl leading-snug text-white">
                        However you arrived here, you don't have to carry it alone.
                    </p>
                    <footer className="mt-4 text-sm tracking-wide text-white/70">A safe space for your mind</footer>
                </blockquote>
            </div>
        </motion.div>
    );

    // form panel — the page content lands here
    const form = (
        <motion.div key="auth-form" layout transition={slide} className="relative flex w-full items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2">
            <div aria-hidden className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-sage-300/20 blur-3xl" />

            <div className="relative z-10 mx-auto w-full max-w-sm">
                <Link href={route('home')} className="mb-8 flex items-center justify-center gap-2.5 text-stone-800 lg:hidden">
                    <AppLogoIcon className="size-7 fill-current text-sage-700" />
                    <span className="font-display text-xl">Sanad</span>
                </Link>

                {/* content cross-fades when the title changes (login <-> register) */}
                <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="font-display text-3xl tracking-tight text-stone-800">{title}</h1>
                        <p className="mt-2 text-sm leading-relaxed text-stone-500">{description}</p>
                    </div>
                    {children}
                </motion.div>
            </div>
        </motion.div>
    );

    return (
        <div className="flex min-h-dvh bg-cream">
            {photoSide === 'left' ? (
                <>
                    {photo}
                    {form}
                </>
            ) : (
                <>
                    {form}
                    {photo}
                </>
            )}
        </div>
    );
}
