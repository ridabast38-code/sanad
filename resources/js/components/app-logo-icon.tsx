import { SVGAttributes } from 'react';

/**
 * The Sanad mark — a warm serif "S". Uses `currentColor` so it adopts whatever
 * text color it's placed in (auth screens, headers, etc.).
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg" {...props}>
            <text
                x="20"
                y="22"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Fraunces, Georgia, 'Times New Roman', serif"
                fontSize="34"
                fontWeight={600}
                fill="currentColor"
            >
                S
            </text>
        </svg>
    );
}
