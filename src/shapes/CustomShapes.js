// src/shapes/CustomShapes.js
import { getMultiEasedColor } from '../utils/drawingUtils';

// Helper function for consistent coloring
const getColor = (alpha, config) => {
    // Check if using WebGL renderer - detect from config or context
    const isWebGL = config.rendererType === 'webgl' || 
                   (config.context && config.context.isWebGLContext);
    
    // Use grayscale as default for WebGL
    if (isWebGL) {
        switch (config.colorScheme) {
            case 'red':
                return `rgba(255,100,100,${alpha})`;
            case 'green':
                return `rgba(100,255,100,${alpha})`;
            case 'purple':
                return `rgba(200,100,255,${alpha})`;
            case 'blue':
                return `rgba(200,220,255,${alpha})`;
            case 'grayscale':
            default:
                return `rgba(220,220,220,${alpha})`;
        }
    } else {
        // Standard colors for Canvas2D
        switch (config.colorScheme) {
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
};

/**
 * Enhanced calculateDynamicParams function for CustomShapes.js
 */
const calculateDynamicParams = (t, config) => {
    const loopDuration = 6000;
    const rawProgress = (t % loopDuration) / loopDuration;

    // Determine if this is a primary or accent shape to use the appropriate animation settings
    const isPrimaryShape = (config.shapeName === config.primaryShape);

    // Select the appropriate animation parameters based on shape type
    const animationMode = isPrimaryShape ? config.primaryAnimationMode : config.accentShapeAAnimationMode;
    const reverseAnimation = isPrimaryShape ? config.reversePrimaryAnimation : config.reverseAccentShapeAnimation;
    const breathingSpeed = isPrimaryShape ? config.primaryBreathingSpeed : config.accentShapeABreathingSpeed;
    const breathingIntensity = isPrimaryShape ? config.primaryBreathingIntensity : config.accentShapeABreathingIntensity;
    const fadeInFraction = isPrimaryShape ? config.primaryFadeInFraction : config.accentShapeAFadeInFraction;
    const fadeOutFraction = isPrimaryShape ? config.primaryFadeOutFraction : config.accentShapeAFadeOutFraction;

    // Apply reverse animation if configured
    const progress = reverseAnimation ? 1 - rawProgress : rawProgress;

    let dynamicRadius, finalTransparency;
    if (animationMode === 'grow') {
        dynamicRadius = config.radius * progress;
        let fadeValue;
        if (progress < fadeInFraction) {
            fadeValue = progress / fadeInFraction;
        } else if (progress > 1 - fadeOutFraction) {
            fadeValue = (1 - progress) / fadeOutFraction;
        } else {
            fadeValue = 1;
        }
        finalTransparency = Math.max(0, Math.min(1, config.transparency * fadeValue));
    } else {
        // Apply breathing to pulsing mode using the CORRECT variables
        const basePhase = progress * 2 * Math.PI;
        const breathingPhase = t * breathingSpeed;
        const breathingFactor = 1 + Math.sin(breathingPhase) * breathingIntensity;
        const pulse = 0.5 + 0.5 * Math.sin(basePhase);
        dynamicRadius = config.radius * pulse * breathingFactor;
        finalTransparency = config.transparency;
    }

    return { dynamicRadius, finalTransparency };
};

/**
 * Draw the Flower of Life shape
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} params - Drawing parameters
 */
export const drawFlowerOfLife = (ctx, params) => {
    const { cx, cy, radius, thickness, transparency, t, config } = params;
    const adjustedParams = {
        cx, cy, t,
        radius: radius,
        transparency: transparency,
        config: {
            ...config,
            radius: radius,
            shapeName: config.shapeName, // ADDED: pass shapeName to identify shape type
            context: ctx // Pass the context to detect if it's WebGL
        }
    };

    const { dynamicRadius, finalTransparency } = calculateDynamicParams(t, adjustedParams.config);

    // Set stroke style based on gradient settings
    if (config.useGradientPrimary) {
        ctx.strokeStyle = getMultiEasedColor(
            t,
            config.gradientColorsPrimary,
            1,
            config.colorCycleDuration,
            config.colorEasingType
        );
        ctx.globalAlpha = finalTransparency;
    } else {
        ctx.strokeStyle = getColor(finalTransparency, adjustedParams.config);
        ctx.globalAlpha = 1;
    }
    ctx.lineWidth = thickness;

    // Draw the central circle using the dynamic radius
    ctx.beginPath();
    ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Integrate rotation for the surrounding circles
    const rotation = config.rotation || 0;

    // Draw six surrounding circles arranged in a hexagon using the dynamic radius
    for (let i = 0; i < 6; i++) {
        const angle = rotation + (i * 2 * Math.PI) / 6;
        const x = cx + dynamicRadius * Math.cos(angle);
        const y = cy + dynamicRadius * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, dynamicRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
};

/**
 * Draw the Merkaba shape
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} params - Drawing parameters
 */
export const drawMerkaba = (ctx, params) => {
    const { cx, cy, radius, thickness, transparency, t, config } = params;
    const adjustedParams = {
        cx, cy, t,
        radius: radius,
        transparency: transparency,
        config: {
            ...config,
            radius: radius,
            shapeName: config.shapeName, // ADDED: pass shapeName to identify shape type
            context: ctx // Pass the context to detect if it's WebGL
        }
    };

    const { dynamicRadius, finalTransparency } = calculateDynamicParams(t, adjustedParams.config);

    // Set stroke style based on gradient settings
    if (config.useGradientPrimary) {
        ctx.strokeStyle = getMultiEasedColor(
            t,
            config.gradientColorsPrimary,
            1,
            config.colorCycleDuration,
            config.colorEasingType
        );
        ctx.globalAlpha = finalTransparency;
    } else {
        ctx.strokeStyle = getColor(finalTransparency, adjustedParams.config);
        ctx.globalAlpha = 1;
    }
    ctx.lineWidth = thickness;

    // Integrate rotation for the triangles
    const rotation = config.rotation || 0;

    // First triangle: oriented upwards
    const vertices1 = [];
    for (let i = 0; i < 3; i++) {
        const angle = rotation + (i * 2 * Math.PI) / 3 + Math.PI / 6; // Adjusted to point up
        vertices1.push({
            x: cx + dynamicRadius * Math.cos(angle),
            y: cy + dynamicRadius * Math.sin(angle),
        });
    }

    // Second triangle: rotated 60° relative to the first (inverted)
    const vertices2 = [];
    for (let i = 0; i < 3; i++) {
        const angle = rotation + (i * 2 * Math.PI) / 3 + Math.PI / 6 + Math.PI; // Rotated 180° to invert
        vertices2.push({
            x: cx + dynamicRadius * Math.cos(angle),
            y: cy + dynamicRadius * Math.sin(angle),
        });
    }

    // Draw the first triangle
    ctx.beginPath();
    ctx.moveTo(vertices1[0].x, vertices1[0].y);
    for (let i = 1; i < vertices1.length; i++) {
        ctx.lineTo(vertices1[i].x, vertices1[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw the second triangle
    ctx.beginPath();
    ctx.moveTo(vertices2[0].x, vertices2[0].y);
    for (let i = 1; i < vertices2.length; i++) {
        ctx.lineTo(vertices2[i].x, vertices2[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.globalAlpha = 1;
};