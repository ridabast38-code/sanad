export default function AppLogo() {
    return (
        <>
            {/* The Sanad wordmark — the S resting in an open hand. Dark artwork, so
            this is the variant for the cream sidebar; dark surfaces use the light one.
            It already carries the name, which is why there's no "Sanad" text beside it. */}
            <img src="/images/sanad-wordmark-dark.png" alt="Sanad" className="h-9 w-auto shrink-0 select-none" draggable={false} />
            <div className="grid flex-1 text-left">
                <span className="text-sidebar-foreground/60 truncate text-[10px] tracking-[0.12em] uppercase">Psychological support</span>
            </div>
        </>
    );
}
