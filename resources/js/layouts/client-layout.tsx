import { AmbientBackground } from '@/components/ambient-background';
import { DUST_QUIET, DustField } from '@/components/olive';
import { SiteNav } from '@/components/site-nav';

/**
 * Nav-only shell for client pages outside the dashboard — no sidebar.
 *
 * Carries the page-wide light→dark split (see `.sanad-split` in app.css). Every
 * surface above it — the nav, each page's cards — has to stay translucent, or it
 * punches an opaque hole straight through the gradient.
 *
 * `fitViewport` locks the page to the screen on desktop so it never scrolls; the
 * page then owns scrolling its own parts. Opt-in, because it only suits pages
 * with a bounded amount of content — force a long list into it and the overflow
 * is simply unreachable.
 */
export default function ClientLayout({ children, fitViewport = false }: { children: React.ReactNode; fitViewport?: boolean }) {
    const lock = fitViewport ? 'lg:h-screen lg:min-h-0 lg:overflow-hidden' : '';

    return (
        <div className={`sanad-split text-ashen-800 relative flex min-h-screen flex-col ${lock}`}>
            {/* The atmosphere belongs to the shell, not to each page. Pages used to
            render their own AmbientBackground inside the content area, which stopped
            it dead at the nav and left a visible seam straight across the page — the
            glows simply didn't exist behind the header. Here it spans everything, so
            the nav and the section below it share one continuous wash.

            Fixed, not absolute: these pages scroll, and a layer anchored to a growing
            document would drift away with the content. */}
            <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
                <AmbientBackground />
                <DustField motes={DUST_QUIET} />
            </div>

            <div className={`relative z-10 flex min-h-screen flex-col ${lock}`}>
                <SiteNav />
                {children}
            </div>
        </div>
    );
}
