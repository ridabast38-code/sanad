import { SanadMark } from '@/components/sanad-logo';
import { SVGAttributes } from 'react';

/**
 * The OurSanad mark on its own, for the places too tight for the full lockup.
 *
 * This used to be an SVG <text> node set in Fraunces, which meant the "logo" was
 * a webfont glyph: it flashed a fallback serif before the font loaded and looked
 * different anywhere the font failed. It now draws the real mark.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return <SanadMark {...props} />;
}
