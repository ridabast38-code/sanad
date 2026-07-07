import { motion } from 'motion/react';

/** A gentle ease shared by the landing and the guided flows, so reveals feel like one system. */
export const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Reveals a line of text word-by-word with a soft blur-up — the site's signature
 * heading entrance. Drop it inside any heading element; it keeps the element's
 * own typography classes.
 */
export function RevealText({ text, delay = 0, stagger = 0.07 }: { text: string; delay?: number; stagger?: number }) {
    return (
        <>
            {text.split(' ').map((word, i) => (
                <motion.span
                    key={`${word}-${i}`}
                    className="inline-block"
                    style={{ marginRight: '0.25em' }}
                    initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.55, delay: delay + i * stagger, ease: SOFT_EASE }}
                >
                    {word}
                </motion.span>
            ))}
        </>
    );
}
