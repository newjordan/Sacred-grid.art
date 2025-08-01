// src/hooks/useDefaultSettings.js
// Simple hook to inject DEFAULT_SETTINGS on first run without disrupting architecture

import { useEffect, useRef } from 'react';
import { DEFAULT_SETTINGS } from '../utils/constants.ts';

/**
 * Hook that applies default settings on first run
 * This is a non-invasive way to ensure the beautiful green flower pattern
 * loads by default without changing the existing state architecture
 */
export const useDefaultSettings = (setSettings) => {
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Only run once on component mount
        if (!hasInitialized.current && setSettings) {
            console.log('🌸 Loading beautiful default pattern (Green Flower)...');
            
            // Apply all the default settings from constants.ts
            const applyDefaults = () => {
                // Grid settings
                if (setSettings.setGridSize) setSettings.setGridSize(DEFAULT_SETTINGS.grid.size);
                if (setSettings.setGridSpacing) setSettings.setGridSpacing(DEFAULT_SETTINGS.grid.spacing);
                if (setSettings.setBaseDotSize) setSettings.setBaseDotSize(DEFAULT_SETTINGS.grid.baseDotSize);
                if (setSettings.setConnectionOpacity) setSettings.setConnectionOpacity(DEFAULT_SETTINGS.grid.connectionOpacity);
                if (setSettings.setGridBreathingSpeed) setSettings.setGridBreathingSpeed(DEFAULT_SETTINGS.grid.breathingSpeed);
                if (setSettings.setGridBreathingIntensity) setSettings.setGridBreathingIntensity(DEFAULT_SETTINGS.grid.breathingIntensity);
                if (setSettings.setShowVertices) setSettings.setShowVertices(DEFAULT_SETTINGS.grid.showVertices);

                // XY Grid settings
                if (setSettings.setShowXYGrid) setSettings.setShowXYGrid(DEFAULT_SETTINGS.xyGrid.show);
                if (setSettings.setXYGridSize) setSettings.setXYGridSize(DEFAULT_SETTINGS.xyGrid.size);
                if (setSettings.setXYGridSpacing) setSettings.setXYGridSpacing(DEFAULT_SETTINGS.xyGrid.spacing);
                if (setSettings.setXYGridOpacity) setSettings.setXYGridOpacity(DEFAULT_SETTINGS.xyGrid.opacity);
                if (setSettings.setXYGridLineWidth) setSettings.setXYGridLineWidth(DEFAULT_SETTINGS.xyGrid.lineWidth);
                if (setSettings.setXYGridColor) setSettings.setXYGridColor(DEFAULT_SETTINGS.xyGrid.color);
                if (setSettings.setShowXYGridLabels) setSettings.setShowXYGridLabels(DEFAULT_SETTINGS.xyGrid.showLabels);

                // Line Factory settings
                if (setSettings.setLineStyle) setSettings.setLineStyle(DEFAULT_SETTINGS.lineFactory.style);
                if (setSettings.setLineTaper) setSettings.setLineTaper(DEFAULT_SETTINGS.lineFactory.taper.type);
                if (setSettings.setTaperStart) setSettings.setTaperStart(DEFAULT_SETTINGS.lineFactory.taper.startWidth);
                if (setSettings.setTaperEnd) setSettings.setTaperEnd(DEFAULT_SETTINGS.lineFactory.taper.endWidth);
                if (setSettings.setLineGlow) setSettings.setLineGlow(DEFAULT_SETTINGS.lineFactory.glow.intensity);
                if (setSettings.setLineGlowColor) setSettings.setLineGlowColor(DEFAULT_SETTINGS.lineFactory.glow.color);

                // Color and gradient settings
                if (setSettings.setUseGradientLines) setSettings.setUseGradientLines(DEFAULT_SETTINGS.colors.gradient.lines.enabled);
                if (setSettings.setGradientColorsLines) setSettings.setGradientColorsLines(DEFAULT_SETTINGS.colors.gradient.lines.colors);
                if (setSettings.setUseGradientDots) setSettings.setUseGradientDots(DEFAULT_SETTINGS.colors.gradient.dots.enabled);
                if (setSettings.setGradientColorsDots) setSettings.setGradientColorsDots(DEFAULT_SETTINGS.colors.gradient.dots.colors);
                if (setSettings.setUseGradientShapes) setSettings.setUseGradientShapes(DEFAULT_SETTINGS.colors.gradient.shapes.enabled);
                if (setSettings.setGradientColorsShapes) setSettings.setGradientColorsShapes(DEFAULT_SETTINGS.colors.gradient.shapes.colors);
                if (setSettings.setColorEasingType) setSettings.setColorEasingType(DEFAULT_SETTINGS.colors.gradient.easing);
                if (setSettings.setColorCycleDuration) setSettings.setColorCycleDuration(DEFAULT_SETTINGS.colors.gradient.cycleDuration);

                // Animation settings
                if (setSettings.setAnimationSpeed) setSettings.setAnimationSpeed(DEFAULT_SETTINGS.animation.speed);

                // Primary shape settings (the main flower)
                if (setSettings.setPrimaryShapeType) setSettings.setPrimaryShapeType(DEFAULT_SETTINGS.shapes.primary.type);
                if (setSettings.setPrimaryShapeSize) setSettings.setPrimaryShapeSize(DEFAULT_SETTINGS.shapes.primary.size);
                if (setSettings.setPrimaryShapeOpacity) setSettings.setPrimaryShapeOpacity(DEFAULT_SETTINGS.shapes.primary.opacity);
                if (setSettings.setPrimaryShapeThickness) setSettings.setPrimaryShapeThickness(DEFAULT_SETTINGS.shapes.primary.thickness);
                if (setSettings.setPrimaryShapeRotation) setSettings.setPrimaryShapeRotation(DEFAULT_SETTINGS.shapes.primary.rotation);

                // Primary shape animation
                if (setSettings.setPrimaryAnimationMode) setSettings.setPrimaryAnimationMode(DEFAULT_SETTINGS.shapes.primary.animation.mode);
                if (setSettings.setPrimaryAnimationSpeed) setSettings.setPrimaryAnimationSpeed(DEFAULT_SETTINGS.shapes.primary.animation.speed);
                if (setSettings.setPrimaryAnimationIntensity) setSettings.setPrimaryAnimationIntensity(DEFAULT_SETTINGS.shapes.primary.animation.intensity);
                if (setSettings.setPrimaryAnimationReverse) setSettings.setPrimaryAnimationReverse(DEFAULT_SETTINGS.shapes.primary.animation.reverse);
                if (setSettings.setPrimaryVariableTiming) setSettings.setPrimaryVariableTiming(DEFAULT_SETTINGS.shapes.primary.animation.variableTiming);
                if (setSettings.setPrimaryStaggerDelay) setSettings.setPrimaryStaggerDelay(DEFAULT_SETTINGS.shapes.primary.animation.staggerDelay);

                // Primary shape stacking
                if (setSettings.setPrimaryStackingEnabled) setSettings.setPrimaryStackingEnabled(DEFAULT_SETTINGS.shapes.primary.stacking.enabled);
                if (setSettings.setPrimaryStackingCount) setSettings.setPrimaryStackingCount(DEFAULT_SETTINGS.shapes.primary.stacking.count);
                if (setSettings.setPrimaryStackingTimeOffset) setSettings.setPrimaryStackingTimeOffset(DEFAULT_SETTINGS.shapes.primary.stacking.timeOffset);
                if (setSettings.setPrimaryStackingInterval) setSettings.setPrimaryStackingInterval(DEFAULT_SETTINGS.shapes.primary.stacking.interval);

                // Primary shape fractal settings
                if (setSettings.setPrimaryFractalDepth) setSettings.setPrimaryFractalDepth(DEFAULT_SETTINGS.shapes.primary.fractal.depth);
                if (setSettings.setPrimaryFractalScale) setSettings.setPrimaryFractalScale(DEFAULT_SETTINGS.shapes.primary.fractal.scale);
                if (setSettings.setPrimaryFractalThicknessFalloff) setSettings.setPrimaryFractalThicknessFalloff(DEFAULT_SETTINGS.shapes.primary.fractal.thicknessFalloff);
                if (setSettings.setPrimaryFractalChildCount) setSettings.setPrimaryFractalChildCount(DEFAULT_SETTINGS.shapes.primary.fractal.childCount);

                // Secondary shape settings (disabled by default in green flower)
                if (setSettings.setSecondaryShapeEnabled) setSettings.setSecondaryShapeEnabled(DEFAULT_SETTINGS.shapes.secondary.enabled);
                if (setSettings.setSecondaryShapeType) setSettings.setSecondaryShapeType(DEFAULT_SETTINGS.shapes.secondary.type);
                if (setSettings.setSecondaryShapeSize) setSettings.setSecondaryShapeSize(DEFAULT_SETTINGS.shapes.secondary.size);
                if (setSettings.setSecondaryShapeOpacity) setSettings.setSecondaryShapeOpacity(DEFAULT_SETTINGS.shapes.secondary.opacity);
                if (setSettings.setSecondaryShapeThickness) setSettings.setSecondaryShapeThickness(DEFAULT_SETTINGS.shapes.secondary.thickness);
                if (setSettings.setSecondaryShapeRotation) setSettings.setSecondaryShapeRotation(DEFAULT_SETTINGS.shapes.secondary.rotation);

                console.log('✅ Default settings applied successfully! Beautiful green flower pattern loaded.');
            };

            // Apply defaults with a small delay to ensure all setters are available
            setTimeout(applyDefaults, 100);
            
            hasInitialized.current = true;
        }
    }, [setSettings]);

    return hasInitialized.current;
};
