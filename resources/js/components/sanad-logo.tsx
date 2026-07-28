import { cn } from '@/lib/utils';
import { type SVGAttributes } from 'react';

/**
 * The Sanad mark — an olive sprig growing from an open cup.
 *
 * Drawn, not photographed. The wordmark used to be three PNGs (light / dark /
 * full) exported from a raster comp, and every one of them had the arch and the
 * forearm running off the top and left edges — at any size above a thumbnail it
 * read as a cropped photo rather than a logo. Vector geometry has no edge to
 * fall off, so it stays whole from a 16px favicon to a 200px footer.
 *
 * Everything is `currentColor`, which is what killed the light/dark pair: place
 * it in a light-text context and it turns light, and the two files can't drift
 * apart because there is only one.
 */
export function SanadMark({ className, ...props }: SVGAttributes<SVGElement>) {
    return (
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sanad" className={cn('size-9', className)} {...props}>
            {/* the cup — open at the top, because support holds rather than encloses */}
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 21.5c0 10.9 6.6 17.5 16 17.5s16-6.6 16-17.5" strokeWidth="3.1" />
                <path d="M24.1 38.4c-.7-6.3-1-12.4-.5-17.9.4-4.4 1-7.6 1.5-9.7" strokeWidth="2" />
            </g>
            {/* the sprig — five leaves, alternating, growing up out of the cup */}
            <g fill="currentColor">
                <g transform="translate(23.4 30.6) rotate(203)">
                    <path d="M0 0C2.5-2.5 6.2-2.6 8.4 0 6.2 2.6 2.5 2.5 0 0Z" />
                </g>
                <g transform="translate(23.6 25.3) rotate(-23)">
                    <path d="M0 0C2.5-2.5 6.2-2.6 8.4 0 6.2 2.6 2.5 2.5 0 0Z" />
                </g>
                <g transform="translate(23.9 20.3) rotate(207)">
                    <path d="M0 0C2.3-2.3 5.7-2.4 7.7 0 5.7 2.4 2.3 2.3 0 0Z" />
                </g>
                <g transform="translate(24.5 15.5) rotate(-27)">
                    <path d="M0 0C2.3-2.3 5.7-2.4 7.7 0 5.7 2.4 2.3 2.3 0 0Z" />
                </g>
                <g transform="translate(24.7 12.6) rotate(-74)">
                    <path d="M0 0C1.9-1.9 4.8-2 6.5 0 4.8 2 1.9 1.9 0 0Z" />
                </g>
            </g>
        </svg>
    );
}

interface SanadLogoProps {
    /** wrapper — spacing and the colour everything inherits */
    className?: string;
    /** the mark; size it with `size-*` */
    markClassName?: string;
    /** the word; size it with `text-*` */
    wordClassName?: string;
    /** drop the word and show the mark alone (tight bars, avatars, small tiles) */
    markOnly?: boolean;
}

/**
 * The full lockup: mark + "Sanad" set in the brand serif.
 *
 * The word is real text in Fraunces rather than baked into the artwork, so it
 * stays sharp at every zoom level, is selectable, and reads to screen readers
 * and search crawlers as the site name.
 */
export default function SanadLogo({ className, markClassName, wordClassName, markOnly = false }: SanadLogoProps) {
    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <SanadMark className={cn('shrink-0', markClassName)} aria-hidden={!markOnly} />
            {!markOnly && <span className={cn('font-display text-[1.55rem] leading-none tracking-tight', wordClassName)}>Sanad</span>}
        </span>
    );
}
