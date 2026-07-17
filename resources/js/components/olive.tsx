import { SOFT_EASE } from '@/components/reveal-text';
import { motion } from 'motion/react';

/**
 * Sanad's olive layer — the decorative vocabulary shared by every page.
 *
 * These started life inside the landing page and were lifted out unchanged so
 * the rest of the app can't drift away from them. The two rules that made them
 * behave are load-bearing and easy to undo by accident:
 *
 *   1. Anchor to a section's TOP edge, never to a page percentage. A section's
 *      top doesn't move when its own content grows downward; the page's height
 *      does. Positioned by page %, every accordion drags the whole background
 *      across the screen mid-animation.
 *   2. Inside anything that can grow (an accordion, a table, a list), a drop's
 *      `y` must be a fixed unit — same trap, same reason.
 *
 * Animations are translate/opacity only, so blurred layers are never
 * re-rasterised.
 */

/**
 * A bead of olive oil. `y` is a raw CSS length on purpose — see rule 2 above.
 */
export interface Drop {
    x: number;
    y: string;
    fall: number;
    dur: number;
    delay: number;
}

/**
 * Beads of oil, falling quietly.
 *
 * Deliberately rare and slow: at this cadence they read as oil (healing,
 * anointing) rather than tears. Tone must match the surface — a pale bead
 * vanishes on the light panels, a dark one vanishes on the dark ones.
 */
export function OliveDrops({ drops, tone, className = '' }: { drops: readonly Drop[]; tone: 'light' | 'dark'; className?: string }) {
    const bead = tone === 'light' ? 'radial-gradient(circle at 35% 30%, #f6f6f4, #92938d)' : 'radial-gradient(circle at 35% 30%, #b0b1ab, #383935)';
    const halo = tone === 'light' ? '0 0 7px 1px rgba(246,246,244,0.4)' : '0 1px 4px rgba(20,21,15,0.35)';

    return (
        <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
            {drops.map((d, i) => (
                <span
                    key={i}
                    className="absolute h-[9px] w-[6px]"
                    style={{
                        left: `${d.x}%`,
                        top: d.y,
                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        background: bead,
                        boxShadow: halo,
                        ['--drop-fall' as string]: `${d.fall}px`,
                        animation: `olive-drop ${d.dur}s ease-in infinite`,
                        animationDelay: `${d.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Drifting motes of light.
 *
 * IMPORTANT: only ever place this inside a container whose height is fixed. Each
 * mote's `top` is a percentage of its container, so a container that grows would
 * drag every mote across the screen while the content animates.
 */
export interface Mote {
    l: number;
    t: number;
    s: number;
    d: number;
    delay: number;
}

export function DustField({ motes }: { motes: readonly Mote[] }) {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {motes.map((p, i) => (
                <div
                    key={i}
                    className="bg-ashen-200 absolute rounded-full"
                    style={{
                        left: `${p.l}%`,
                        top: `${p.t}%`,
                        width: `${p.s * 2.5}px`,
                        height: `${p.s * 2.5}px`,
                        animation: `dust-drift ${p.d}s ease-in-out infinite`,
                        animationDelay: `${p.delay}s`,
                        filter: 'blur(1px)',
                        boxShadow: '0 0 8px 2px rgba(176,177,171,0.5)',
                    }}
                />
            ))}
        </div>
    );
}

/** A calm four-mote field — enough to feel alive, cheap enough to leave running. */
export const DUST_QUIET: readonly Mote[] = [
    { l: 8, t: 12, s: 2, d: 18, delay: -2 },
    { l: 35, t: 42, s: 1, d: 24, delay: -11 },
    { l: 70, t: 48, s: 1.5, d: 23, delay: -13 },
    { l: 86, t: 30, s: 2, d: 20, delay: -16 },
];

/** Oil falling through a panel's quiet edges — clear of any centred content. */
export const EDGE_DROPS: readonly Drop[] = [
    { x: 3, y: '16%', fall: 150, dur: 10, delay: 0 },
    { x: 97, y: '30%', fall: 170, dur: 12, delay: -5 },
    { x: 2, y: '62%', fall: 140, dur: 11, delay: -7.5 },
    { x: 98, y: '74%', fall: 160, dur: 13, delay: -2 },
];

/** Released from the crown — the payoff of the tree. Its box is fixed, so % is safe. */
export const TREE_DROPS: readonly Drop[] = [
    { x: 27, y: '26%', fall: 120, dur: 9, delay: 0 },
    { x: 52, y: '15%', fall: 150, dur: 11, delay: -4.5 },
    { x: 71, y: '31%', fall: 110, dur: 10, delay: -7.5 },
    { x: 40, y: '44%', fall: 95, dur: 12, delay: -2.5 },
];

/**
 * The ancient olive, rooted in whatever panel holds it.
 *
 * Colour and transparency come from the `.olive-mask` luminance mask; see the
 * note on it in app.css for why the asset carries no alpha of its own. The
 * parent must NOT clip, if the crown is meant to escape upward.
 */
export function OliveTree({
    className = 'bottom-8 md:bottom-10',
    opacity = 'opacity-[0.26] md:opacity-[0.32]',
}: {
    className?: string;
    opacity?: string;
}) {
    // Desktop only. The tree is drawn by a luminance mask (see .olive-mask in
    // app.css); some mobile browsers report support but don't honour mask-mode, so
    // the bare bg-ashen-950 box renders as a dark slab over the closing text. It's
    // pure decoration, so the safe move is to not draw it on phones at all.
    return (
        <div aria-hidden className={`pointer-events-none absolute inset-x-0 z-[1] hidden justify-center md:flex ${className}`}>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1.6, ease: SOFT_EASE }}
                // The box keeps the engraving's exact 3:4 ratio at every size, so the
                // luminance mask (contain) fills it with no empty margin. The old mobile
                // width was 26.25rem/420px — wider than a phone, so the tree overflowed
                // both edges and read as a detached slab rather than a backdrop growing
                // out of the panel. 21rem/336px sits inside the viewport and merges.
                className="relative h-[28rem] w-[21rem] md:h-[54rem] md:w-[40.5rem]"
            >
                <div className={`olive-mask bg-ashen-950 absolute inset-0 ${opacity}`} />
                <OliveDrops drops={TREE_DROPS} tone="dark" />
            </motion.div>
        </div>
    );
}

/**
 * The wide olive treeline — sunk low so only the canopy clears the bottom edge.
 * Use where a full tree would pile its weight straight into the content: a whole
 * tree is a specimen, this is a horizon.
 */
export function OliveHorizon({ tone = 'bg-ashen-200', opacity = 'opacity-[0.1] md:opacity-[0.12]' }: { tone?: string; opacity?: string }) {
    return <div aria-hidden className={`horizon-mask absolute inset-x-[-6%] bottom-0 h-[48%] md:h-[52%] ${tone} ${opacity}`} />;
}
