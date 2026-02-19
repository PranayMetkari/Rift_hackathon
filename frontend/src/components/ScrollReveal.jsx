import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * ScrollReveal — animates children in (fade + slide up) when they 
 * scroll into the viewport.
 *
 * Props:
 *   delay   — stagger delay in seconds (default 0)
 *   y       — initial Y offset in px (default 24)
 *   once    — only animate once (default true)
 */
export default function ScrollReveal({ children, delay = 0, y = 24, once = true, style, className }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            style={style}
            className={className}
        >
            {children}
        </motion.div>
    );
}
