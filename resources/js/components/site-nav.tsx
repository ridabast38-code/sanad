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
        <header className="border-ashen-300/30 bg-cream sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b px-5 md:px-12 lg:px-16">
            <Link href="/dashboard" className="font-display text-sage-700 text-[1.65rem] tracking-tight">
                Sanad
            </Link>

            <nav className="flex flex-1 items-center justify-center gap-5 sm:gap-9">
                {tabs.map((tab) => (
                    <Link key={tab.href} href={tab.href} className="text-ashen-500 hover:text-sage-700 text-[15px] font-medium transition">
                        {tab.label}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center gap-2">
                <Link
                    href="/dashboard?view=notifications"
                    aria-label="Notifications"
                    className="text-ashen-500 hover:text-sage-700 relative flex size-10 items-center justify-center rounded-full transition hover:bg-white"
                >
                    <Bell className="size-5" />
                    <span className="bg-sage-600 ring-cream absolute top-2.5 right-2.5 size-2 rounded-full ring-2" />
                </Link>
                <Link
                    href="/dashboard?view=profile"
                    aria-label="Your profile"
                    className={`block size-10 overflow-hidden rounded-full ring-2 transition ${
                        url.startsWith('/settings') ? 'ring-sage-500' : 'ring-sage-200 hover:ring-sage-400'
                    }`}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="bg-sage-100 text-sage-700 flex h-full w-full items-center justify-center text-sm font-semibold">
                            {initials}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}
