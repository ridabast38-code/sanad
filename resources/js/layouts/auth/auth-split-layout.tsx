import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    photoSide?: 'left' | 'right';
    quote?: string;
    quoteFooter?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    photoSide = 'left',
    quote = 'A safe space for your mind.',
    quoteFooter = 'Sanad',
}: AuthLayoutProps) {
    const slide = { type: 'spring', stiffness: 200, damping: 30 } as const;

    // cinematic photo panel — slides side to side when navigating login <-> register
    const photo = (
        <motion.div key="auth-photo" layout transition={slide} className="relative hidden overflow-hidden lg:block lg:w-1/2">
            <img src="/images/auth.jpg" alt="" className="absolute inset-0 h-full w-full scale-105 object-cover" />
            <div className="from-ashen-950/70 via-ashen-950/45 to-ashen-950/80 absolute inset-0 bg-gradient-to-b" />
            <div
                aria-hidden
                className="bg-sage-600/30 pointer-events-none absolute bottom-0 -left-24 h-96 w-96 rounded-full blur-3xl"
                style={{ animation: 'aurora-1 26s ease-in-out infinite' }}
            />

            <div className="absolute inset-0 flex flex-col justify-between p-12">
                <Link href={route('home')} className="flex items-center gap-2.5 text-white">
                    <AppLogoIcon className="size-7 fill-current text-white" />
                    <span className="font-display text-xl">Sanad</span>
                </Link>
                <blockquote>
                    <p className="font-display max-w-md text-3xl leading-snug text-white">{quote}</p>
                    <footer className="mt-4 text-sm tracking-wide text-white/70">{quoteFooter}</footer>
                </blockquote>
            </div>
        </motion.div>
    );

    // form panel — the page content lands here
    const form = (
        <motion.div
            key="auth-form"
            layout
            transition={slide}
            className="relative flex w-full items-center justify-center overflow-hidden px-6 py-12 sm:px-10 lg:w-1/2"
        >
            {/* soft, breathing glows for a calm atmosphere */}
            <div
                aria-hidden
                className="bg-sage-300/25 pointer-events-none absolute top-0 -right-24 h-80 w-80 rounded-full blur-3xl"
                style={{ animation: 'breathe 9s ease-in-out infinite' }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl"
                style={{ animation: 'breathe 11s ease-in-out infinite', animationDelay: '-3s' }}
            />

            <div className="relative z-10 mx-auto w-full max-w-sm">
                <Link href={route('home')} className="text-ashen-800 mb-8 flex items-center justify-center gap-2.5 lg:hidden">
                    <AppLogoIcon className="text-sage-700 size-7 fill-current" />
                    <span className="font-display text-xl">Sanad</span>
                </Link>

                {/* content cross-fades when the title changes (login <-> register) */}
                <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="font-display text-ashen-800 text-3xl tracking-tight">{title}</h1>
                        <p className="text-ashen-500 mt-2 text-sm leading-relaxed">{description}</p>
                    </div>
                    {children}
                </motion.div>
            </div>
        </motion.div>
    );

    return (
        <div className="bg-cream flex min-h-dvh">
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
