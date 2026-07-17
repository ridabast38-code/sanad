import { DUST_QUIET, DustField } from '@/components/olive';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
}

const PRACTITIONER_NAV: NavItem[] = [
    { label: 'Overview', href: '/practitioner' },
    { label: 'Schedule', href: '/practitioner/schedule' },
    { label: 'Clients', href: '/practitioner/clients' },
    { label: 'Earnings', href: '/practitioner/earnings' },
    { label: 'Profile', href: '/practitioner/profile' },
];

const ADMIN_NAV: NavItem[] = [
    { label: 'Overview', href: '/admin' },
    { label: 'Practitioners', href: '/admin/practitioners' },
    { label: 'Clients', href: '/admin/clients' },
    { label: 'Bookings', href: '/admin/bookings' },
    { label: 'Transactions', href: '/admin/transactions' },
];

/**
 * Shared shell for the practitioner & admin dashboards — on-brand, but a denser work tool.
 *
 * `fitViewport` locks the page to the screen on desktop so it never scrolls; the
 * page's own content is then responsible for scrolling its parts. Opt-in, because
 * it only suits pages with a bounded amount of content — a 40-row bookings table
 * has to scroll the window, and forcing it into the viewport would just hide rows
 * behind a scrollbar nobody expects.
 */
export default function StaffLayout({ title, children, fitViewport = false }: { title: string; children: React.ReactNode; fitViewport?: boolean }) {
    const page = usePage<SharedData>();
    const user = page.props.auth.user;
    const isAdmin = user.role === 'admin';
    const nav = isAdmin ? ADMIN_NAV : PRACTITIONER_NAV;
    const path = page.url.split('?')[0];

    const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const isActive = (href: string) => (href === '/practitioner' || href === '/admin' ? path === href : path.startsWith(href));

    return (
        <div
            className={`sanad-split text-ashen-800 relative flex min-h-screen flex-col ${fitViewport ? 'lg:h-screen lg:min-h-0 lg:overflow-hidden' : ''}`}
        >
            <Head title={title} />

            {/* The lightest possible touch of the landing's atmosphere. No olive tree
            and no drops here on purpose: this is a work tool, and anything falling
            behind a table of numbers reads as a rendering glitch, not as calm.
            Fixed, so the motes don't drift off with a long scrolling table. */}
            <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
                <DustField motes={DUST_QUIET} />
            </div>

            <header className="border-ashen-300/25 sticky top-0 z-40 border-b backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
                    <div className="flex items-center gap-3">
                        <Link href={isAdmin ? '/admin' : '/practitioner'} className="font-display text-ashen-800 text-xl tracking-tight">
                            Sanad
                        </Link>
                        <span className="bg-ashen-200 text-ashen-700 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
                            {isAdmin ? 'Admin' : 'Specialist'}
                        </span>
                    </div>

                    <nav className="hidden items-center gap-1 md:flex">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                                    isActive(item.href) ? 'bg-ashen-200 text-ashen-800' : 'text-ashen-500 hover:text-ashen-800 hover:bg-ashen-100/70'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <span className="bg-ashen-200 text-ashen-700 hidden size-9 items-center justify-center rounded-full text-sm font-semibold sm:flex">
                            {initials}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-ashen-500 hover:text-ashen-800 hover:bg-ashen-100/70 flex size-9 items-center justify-center rounded-full transition"
                            aria-label="Log out"
                        >
                            <LogOut className="size-5" />
                        </Link>
                    </div>
                </div>

                {/* mobile nav */}
                <nav className="border-ashen-300/20 flex items-center gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
                    {nav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
                                isActive(item.href) ? 'bg-ashen-200 text-ashen-800' : 'text-ashen-500'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </header>

            <main
                className={`relative z-10 mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8 md:py-10 ${
                    fitViewport ? 'flex flex-col lg:min-h-0 lg:py-6' : ''
                }`}
            >
                {children}
            </main>
        </div>
    );
}
