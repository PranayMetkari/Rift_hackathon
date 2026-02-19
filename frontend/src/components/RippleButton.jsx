import { useRef } from 'react';

/**
 * RippleButton — wraps any button with a material-style expanding ripple
 * at the exact click/tap point.
 *
 * Usage:
 *   <RippleButton className="btn-analyze" onClick={...} disabled={...}>
 *     Click me
 *   </RippleButton>
 *
 * Accepts all standard button props plus `rippleColor` (default: rgba(255,255,255,0.35))
 */
export default function RippleButton({
    children,
    onClick,
    disabled,
    className,
    style,
    rippleColor = 'rgba(255,255,255,0.3)',
    type = 'button',
    ...rest
}) {
    const btnRef = useRef(null);

    const handleClick = (e) => {
        if (disabled) return;

        const btn = btnRef.current;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const size = Math.max(rect.width, rect.height) * 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            left: ${x - size / 2}px;
            top: ${y - size / 2}px;
            background: ${rippleColor};
            transform: scale(0);
            animation: ripple-expand 0.55s ease-out forwards;
            pointer-events: none;
        `;

        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);

        onClick?.(e);
    };

    return (
        <button
            ref={btnRef}
            type={type}
            disabled={disabled}
            className={className}
            onClick={handleClick}
            style={{
                position: 'relative',
                overflow: 'hidden',
                ...style,
            }}
            {...rest}
        >
            {children}
        </button>
    );
}
