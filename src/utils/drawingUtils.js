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
    switch (easingType) {
        case 'easeInOutQuad':
            return easeInOutQuad(t);
        case 'easeInOutCubic':
            return easeInOutCubic(t);
        case 'linear':
        default:
            return easeLinear(t);
    }
}

export function parseHexColor(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return [r, g, b];
}

export function getMultiEasedColor(time, colors, alpha, cycleDuration, easingType) {
    const n = colors.length;
    let progress = (time % cycleDuration) / cycleDuration;
    const scaledProgress = progress * n;
    const index = Math.floor(scaledProgress);
    const nextIndex = (index + 1) % n;
    let t = scaledProgress - index;
    t = applyEasing(easingType, t);
    const [r1, g1, b1] = parseHexColor(colors[index]);
    const [r2, g2, b2] = parseHexColor(colors[nextIndex]);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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