/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * Whether we're running inside the native mobile app (Capacitor) rather than a
 * normal web browser. The in-app demo card checkout is shown only when this is
 * true, so the public website keeps its manual-transfer flow untouched.
 */
export function isNativeApp(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    // Capacitor injects this inside the packaged app.
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (cap?.isNativePlatform?.()) {
        return true;
    }

    // Robust fallback: the app tags its user-agent (see capacitor.config.ts) so
    // detection still works even when the bridge object isn't ready yet.
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('SanadApp')) {
        return true;
    }

    // Dev/testing overrides so the app-only checkout can be previewed in a browser.
    try {
        if (new URLSearchParams(window.location.search).has('app')) {
            return true;
        }
        if (window.localStorage.getItem('sanad_app') === '1') {
            return true;
        }
    } catch {
        // Accessing storage/search can throw in locked-down contexts — ignore.
    }

    return false;
}
