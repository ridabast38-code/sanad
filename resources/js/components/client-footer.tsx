import { Link } from '@inertiajs/react';

/** Slim in-app footer — the marketing footer lives on the public site. */
export function ClientFooter() {
    return (
        <footer className="border-ashen-200/70 mt-4 border-t">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 md:px-8">
                <div className="text-ashen-500 flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} OurSanad · A safe space for your mind.</p>
                    <div className="flex items-center gap-5">
                        <a href="mailto:hello@oursanad.com" className="hover:text-ashen-700 transition">
                            Help &amp; support
                        </a>
                        <Link href="/privacy" className="hover:text-ashen-700 transition">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-ashen-700 transition">
                            Terms
                        </Link>
                    </div>
                </div>
                <p className="text-ashen-400 max-w-3xl text-[11px] leading-relaxed">
                    OurSanad offers psychological support and is not a substitute for professional or emergency care. If you are in danger or in
                    crisis, please contact your local emergency number.
                </p>
            </div>
        </footer>
    );
}
