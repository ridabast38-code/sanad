import type { CapacitorConfig } from '@capacitor/cli';

/**
 * DEMO / COMPETITION ONLY — the native Android wrapper.
 *
 * The app is a thin native shell that loads the live Sanad site. `appendUserAgent`
 * tags every request so the web app can reliably tell it's running inside the app
 * (see isNativeApp()) and show the in-app demo checkout. Safe to delete after the
 * competition (with the android/ folder and the Capacitor dev-deps).
 */
const config: CapacitorConfig = {
    appId: 'com.oursanad.app',
    appName: 'Sanad',
    webDir: 'capacitor/www',
    server: {
        url: 'https://oursanad.com',
        androidScheme: 'https',
        // Keep the site's own pages (incl. a www redirect) inside the app; only
        // truly external links (e.g. WhatsApp) hand off to the system browser.
        allowNavigation: ['oursanad.com', 'www.oursanad.com'],
    },
    android: {
        appendUserAgent: 'SanadApp',
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 1400,
            backgroundColor: '#f6f4ed',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
        },
    },
};

export default config;
