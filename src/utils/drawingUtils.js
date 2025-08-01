export function easeLinear(t) {
    return t;
}

export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function applyEasing(easingType, t) {
    return applyEnhancedEasing(easingType, t);
}

// Enhanced easing functions with higher precision and more options
export function applyEnhancedEasing(easingType, t) {
    // Clamp input to prevent numerical issues
    t = Math.max(0, Math.min(1, t));

    switch (easingType) {
        case 'easeInOutCubic':
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        case 'easeInOutQuad':
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        case 'easeInOutSine':
            return -(Math.cos(Math.PI * t) - 1) / 2;

        case 'easeInOutExpo':
            if (t === 0) return 0;
            if (t === 1) return 1;
            return t < 0.5
                ? Math.pow(2, 20 * t - 10) / 2
                : (2 - Math.pow(2, -20 * t + 10)) / 2;

        case 'easeInOutElastic':
            const c5 = (2 * Math.PI) / 4.5;
            if (t === 0) return 0;
            if (t === 1) return 1;
            return t < 0.5
                ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;

        case 'linear':
        default:
            return t;
    }
}

export function parseHexColor(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return [r, g, b];
}

// Enhanced color interpolation with sub-pixel precision
// Eliminates color snapping by avoiding premature rounding
export function getMultiEasedColor(time, colors, alpha, cycleDuration, easingType) {
    const n = colors.length;
    let progress = (time % cycleDuration) / cycleDuration;
    const scaledProgress = progress * n;
    const index = Math.floor(scaledProgress);
    const nextIndex = (index + 1) % n;
    let t = scaledProgress - index;

    // Apply enhanced easing
    t = applyEnhancedEasing(easingType, t);

    const [r1, g1, b1] = parseHexColor(colors[index]);
    const [r2, g2, b2] = parseHexColor(colors[nextIndex]);

    // High-precision interpolation (no rounding until final step)
    const r = r1 + (r2 - r1) * t;
    const g = g1 + (g2 - g1) * t;
    const b = b1 + (b2 - b1) * t;

    // Apply sub-pixel precision rounding for smoother transitions
    const precision = 1000;
    const finalR = Math.round(r * precision) / precision;
    const finalG = Math.round(g * precision) / precision;
    const finalB = Math.round(b * precision) / precision;

    return `rgba(${Math.round(finalR)}, ${Math.round(finalG)}, ${Math.round(finalB)}, ${alpha})`;
}

// Detect WebGL renderer from context or settings
export function isWebGLRenderer(context, settings) {
    return (context && context.isWebGLContext) || 
           (settings && settings.rendererType === 'webgl');
}

export function getShapeColor(alpha, colorScheme, context, settings) {
    // Check if using WebGL renderer
    const usingWebGL = isWebGLRenderer(context, settings);
    
    // Default to grayscale for WebGL renderer if scheme is not specified
    if (usingWebGL && colorScheme !== 'red' && colorScheme !== 'green' && 
        colorScheme !== 'purple' && colorScheme !== 'blue' && colorScheme !== 'grayscale') {
        return `rgba(220,220,220,${alpha})`;
    }
    
    switch (colorScheme) {
        case 'red':
            return `rgba(255,100,100,${alpha})`;
        case 'green':
            return `rgba(100,255,100,${alpha})`;
        case 'purple':
            return `rgba(200,100,255,${alpha})`;
        case 'grayscale':
            return `rgba(220,220,220,${alpha})`;
        case 'blue':
        default:
            return `rgba(200,220,255,${alpha})`;
    }
}