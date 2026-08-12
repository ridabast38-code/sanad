import SanadLogo from '@/components/sanad-logo';

export default function AppLogo() {
    return (
        <>
            {/* The lockup already carries the name, which is why there's no "OurSanad"
            text beside it — only the tagline. It inherits the surface's text
            colour, so the same component works on the cream sidebar and on dark. */}
            <SanadLogo className="shrink-0" markClassName="h-9 w-auto" />
            <div className="grid flex-1 text-left">
                <span className="text-sidebar-foreground/60 truncate text-[10px] tracking-[0.12em] uppercase">Psychological support</span>
            </div>
        </>
    );
}
