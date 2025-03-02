// src/shapes/ShapeUtils.js
import { AnimationMode } from '../constants/ShapeTypes';

export function calculateAnimationParams(time, shapeSettings, globalSettings) {
    const { animation } = shapeSettings;
    const loopDuration = 6000;
    const rawProgress = (time % loopDuration) / loopDuration;

    // Apply reverse animation if configured
    const progress = animation.reverse ? 1 - rawProgress : rawProgress;

    let dynamicRadius, finalOpacity;
    if (animation.mode === AnimationMode.GROW) {
        dynamicRadius = shapeSettings.size * progress;
        let fadeValue;
        if (progress < animation.fadeIn) {
            fadeValue = progress / animation.fadeIn;
        } else if (progress > 1 - animation.fadeOut) {
            fadeValue = (1 - progress) / animation.fadeOut;
        } else {
            fadeValue = 1;
        }
        finalOpacity = Math.max(0, Math.min(1, shapeSettings.opacity * fadeValue));
    } else { // PULSE or other
        // Apply breathing to pulsing mode
        const basePhase = progress * 2 * Math.PI;
        const breathingPhase = time * animation.speed;
        const breathingFactor = 1 + Math.sin(breathingPhase) * animation.intensity;
        const pulse = 0.5 + 0.5 * Math.sin(basePhase);
        dynamicRadius = shapeSettings.size * pulse * breathingFactor;
        finalOpacity = shapeSettings.opacity;
    }

    return { dynamicRadius, finalOpacity };
}
