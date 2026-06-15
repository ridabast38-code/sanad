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

/** Shared shell for the practitioner & admin dashboards — on-brand, but a denser work tool. */
export default function StaffLayout({ title, children }: { title: string; children: React.ReactNode }) {
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
        <div className="bg-cream text-ashen-800 flex min-h-screen flex-col">
            <Head title={title} />

            <header className="border-ashen-300/30 bg-cream sticky top-0 z-40 border-b">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
                    <div className="flex items-center gap-3">
                        <Link href={isAdmin ? '/admin' : '/practitioner'} className="font-display text-sage-700 text-xl tracking-tight">
                            Sanad
                        </Link>
                        <span className="bg-sage-100 text-sage-700 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
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
                                    isActive(item.href) ? 'bg-sage-100 text-sage-800' : 'text-ashen-500 hover:text-sage-700 hover:bg-white'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <span className="bg-sage-100 text-sage-700 hidden size-9 items-center justify-center rounded-full text-sm font-semibold sm:flex">
                            {initials}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-ashen-500 hover:text-sage-700 flex size-9 items-center justify-center rounded-full transition hover:bg-white"
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
                                isActive(item.href) ? 'bg-sage-100 text-sage-800' : 'text-ashen-500'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8 md:py-10">{children}</main>
        </div>
    );
}
