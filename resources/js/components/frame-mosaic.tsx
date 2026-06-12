import { motion } from 'motion/react';

/**
 * Turns a single photo into a row of vertical "frames" (slats). Each slat is the
 * same image clipped to its column, so together they reassemble the full picture.
 * On mount the slats stagger into place (a curtain forming the image) — a one-time
 * reveal, then it sits perfectly still. One image, transform-only = cheap.
 *
 * `objectPosition` chooses which part of the photo stays in frame (e.g. the faces).
 */
export function FrameMosaic({
    src,
    strips = 8,
    objectPosition = '50% 50%',
    className = '',
}: {
    src: string;
    strips?: number;
    objectPosition?: string;
    className?: string;
}) {
    const step = 100 / strips;

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
            {Array.from({ length: strips }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 ${100 - (i + 1) * step}% 0 ${i * step}%)` }}
                    initial={{ opacity: 0, y: i % 2 === 0 ? '-14%' : '14%' }}
                    animate={{ opacity: 1, y: '0%' }}
                    transition={{ duration: 1.1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                    <img src={src} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition }} />
                </motion.div>
            ))}
        </div>
    );
}
