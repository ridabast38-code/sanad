import { Link, usePage } from '@inertiajs/react';

const navItems = [
    { title: 'Profile', url: '/settings/profile' },
    { title: 'Password', url: '/settings/password' },
];

/** Settings sub-navigation — horizontal tabs, no sidebar. */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const { url } = usePage();

    return (
        <main className="mx-auto w-full max-w-3xl px-6 py-12 md:px-8 md:py-16">
            <header className="mb-8">
                <h1 className="font-display text-sage-800 text-3xl tracking-tight md:text-4xl">Settings</h1>
                <p className="text-ashen-500 mt-2">Manage your profile and account.</p>
            </header>

            <nav className="border-ashen-300/30 mb-10 flex gap-1 border-b">
                {navItems.map((item) => {
                    const active = url.startsWith(item.url);
                    return (
                        <Link
                            key={item.url}
                            href={item.url}
                            prefetch
                            className={`relative px-4 py-3 text-sm font-medium transition ${active ? 'text-sage-700' : 'text-ashen-500 hover:text-sage-700'}`}
                        >
                            {item.title}
                            {active && <span className="bg-sage-600 absolute inset-x-4 -bottom-px h-0.5 rounded-full" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="max-w-2xl">{children}</div>
        </main>
    );
}
