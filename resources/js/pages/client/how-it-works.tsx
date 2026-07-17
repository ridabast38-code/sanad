import ClientLayout from '@/layouts/client-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarClock, CreditCard, Heart, MessageCircle, ShieldCheck, Sparkles, Video } from 'lucide-react';
import type { ComponentType } from 'react';

const CARD = 'sanad-card rounded-2xl';

const STEPS: { icon: ComponentType<{ className?: string }>; title: string; body: string }[] = [
    {
        icon: MessageCircle,
        title: 'Find your specialist',
        body: 'Browse licensed specialists and choose someone whose approach and language feel right for you.',
    },
    { icon: CalendarClock, title: 'Pick a time', body: 'Choose an available slot that fits your schedule — sessions are online, wherever you are.' },
    {
        icon: CreditCard,
        title: 'Confirm securely',
        body: 'Pay privately and your booking is confirmed. You will receive everything you need beforehand.',
    },
    { icon: Video, title: 'Meet & breathe', body: 'Join your private video session and take the next gentle step, supported and unjudged.' },
];

const PREP: string[] = [
    'Find a quiet, private spot where you won’t be interrupted.',
    'Check your internet, camera, and headphones a few minutes early.',
    'There’s nothing to prepare or “get right” — come exactly as you are.',
    'It’s okay to feel nervous. Your specialist will guide the conversation gently.',
];

export default function HowItWorks() {
    return (
        <ClientLayout>
            <Head title="How Sanad works" />

            <main className="mx-auto w-full max-w-3xl px-6 py-12 md:px-8 md:py-16">
                <header className="mb-12">
                    <span className="border-ashen-200 text-ashen-700 bg-ashen-50/80 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
                        <Sparkles className="size-3.5" /> A gentle guide
                    </span>
                    <h1 className="font-display text-ashen-800 mt-4 text-4xl leading-tight tracking-tight md:text-5xl">How Sanad works</h1>
                    <p className="text-ashen-500 mt-3 text-lg leading-relaxed">Support that meets you where you are — in four simple steps.</p>
                </header>

                <div className="space-y-4">
                    {STEPS.map(({ icon: Icon, title, body }, i) => (
                        <div key={title} className={`flex items-start gap-5 p-6 ${CARD}`}>
                            <div className="bg-ashen-100 text-ashen-700 relative flex size-12 shrink-0 items-center justify-center rounded-xl">
                                <Icon className="size-6" />
                                <span className="bg-ashen-600 ring-ashen-50 absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2">
                                    {i + 1}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-display text-ashen-800 text-lg">{title}</h2>
                                <p className="text-ashen-600 mt-1 text-sm leading-relaxed">{body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-ashen-100 bg-ashen-50/60 mt-6 flex items-start gap-3 rounded-2xl border p-5">
                    <ShieldCheck className="text-ashen-600 mt-0.5 size-5 shrink-0" />
                    <p className="text-ashen-600 text-sm leading-relaxed">
                        Every Sanad psychologist is a licensed clinical psychologist, offering real, confidential care. For a medical emergency,
                        please contact your local emergency number.
                    </p>
                </div>

                {/* ===== Preparing for your first session ===== */}
                <section id="first-session" className="mt-16 scroll-mt-24">
                    <h2 className="font-display text-ashen-800 text-3xl tracking-tight md:text-4xl">Preparing for your first session</h2>
                    <p className="text-ashen-500 mt-3 leading-relaxed">A few small things to help you feel settled before you begin.</p>

                    <ul className="mt-6 space-y-3">
                        {PREP.map((tip) => (
                            <li key={tip} className={`flex items-start gap-3 p-5 ${CARD}`}>
                                <Heart className="text-ashen-600 mt-0.5 size-5 shrink-0" />
                                <span className="text-ashen-700 text-sm leading-relaxed">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <Link
                    href="/dashboard?view=specialists"
                    className="group bg-ashen-700 hover:bg-ashen-800 mt-12 inline-flex items-center gap-2 rounded-full py-3 pr-3 pl-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                    Find your specialist
                    <span className="bg-ashen-50/20 rounded-full p-1.5 transition-transform group-hover:rotate-45">
                        <ArrowUpRight className="size-4" />
                    </span>
                </Link>
            </main>
        </ClientLayout>
    );
}
