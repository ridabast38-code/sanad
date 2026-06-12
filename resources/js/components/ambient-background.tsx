/**
 * Sanad's warm-sanctuary atmosphere: slow sage and sand auroras breathing over
 * the cream page — the same ambient language as the public site and onboarding.
 * Translate/opacity-only animations on blurred blobs, so it costs almost nothing.
 */
export function AmbientBackground() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="bg-sage-300/40 absolute -top-40 -left-44 h-[36rem] w-[36rem] rounded-full blur-3xl"
                style={{ animation: 'aurora-1 26s ease-in-out infinite' }}
            />
            <div
                className="bg-sand/25 absolute top-1/4 -right-44 h-[32rem] w-[32rem] rounded-full blur-3xl"
                style={{ animation: 'aurora-2 32s ease-in-out infinite' }}
            />
            <div
                className="bg-sage-200/50 absolute -bottom-32 left-1/4 h-[30rem] w-[30rem] rounded-full blur-3xl"
                style={{ animation: 'aurora-3 38s ease-in-out infinite' }}
            />
        </div>
    );
}
