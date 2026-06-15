import { SiteNav } from '@/components/site-nav';

/** Nav-only shell for client pages outside the dashboard — no sidebar. */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-cream text-ashen-800 flex min-h-screen flex-col">
            <SiteNav />
            {children}
        </div>
    );
}
