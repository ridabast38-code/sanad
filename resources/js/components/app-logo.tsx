export default function AppLogo() {
    return (
        <>
            {/* Sanad badge — the cream "S" on sage, matching our favicon */}
            <div className="bg-sage-600 flex aspect-square size-9 items-center justify-center rounded-lg shadow-sm">
                <span className="font-display text-cream text-xl leading-none">S</span>
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="font-display text-sidebar-foreground text-base leading-tight">Sanad</span>
                <span className="text-sidebar-foreground/60 truncate text-[10px] tracking-[0.12em] uppercase">Psychological support</span>
            </div>
        </>
    );
}
