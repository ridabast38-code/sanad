import SanadLogo from '@/components/sanad-logo';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

/**
 * The standalone top nav used on pages outside the dashboard (specialist profile,
 * settings). Mirrors the dashboard's nav, but every item is a real link back into
 * the dashboard's views — so there is no sidebar anywhere in the app.
 */
export function SiteNav() {
    const page = usePage<SharedData>();
    const user = page.props.auth.user;
    const url = page.url;

    const tabs = [
        { label: 'My sessions', href: '/dashboard' },
        { label: 'Specialists', href: '/dashboard?view=specialists' },
    ];

    const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <header className="border-ashen-300/25 sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b px-5 backdrop-blur-xl md:px-12 lg:px-16">
            <Link href="/dashboard" className="text-ashen-800">
                <SanadLogo markClassName="size-8" wordClassName="text-2xl sm:text-[1.65rem]" />
            </Link>

            <nav className="hidden flex-1 items-center justify-center gap-5 sm:flex sm:gap-9">
                {tabs.map((tab) => (
                    <Link key={tab.href} href={tab.href} className="text-ashen-500 hover:text-ashen-800 text-[15px] font-medium transition">
                        {tab.label}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center gap-2">
                <Link
                    href="/dashboard?view=notifications"
                    aria-label="Notifications"
                    className="text-ashen-500 hover:text-ashen-800 hover:bg-ashen-50/70 relative flex size-10 items-center justify-center rounded-full transition"
                >
                    <Bell className="size-5" />
                    <span className="bg-ashen-600 ring-ashen-50 absolute top-2.5 right-2.5 size-2 rounded-full ring-2" />
                </Link>
                <Link
                    href="/dashboard?view=profile"
                    aria-label="Your profile"
                    className={`block size-10 overflow-hidden rounded-full ring-2 transition ${
                        url.startsWith('/settings') ? 'ring-ashen-500' : 'ring-ashen-300 hover:ring-ashen-400'
                    }`}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="bg-ashen-200 text-ashen-700 flex h-full w-full items-center justify-center text-sm font-semibold">
                            {initials}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}
