// src/utils/defaultLoader.js
// Simple script to load green_flower_2.json settings on startup

import greenFlowerSettings from '../green_flower_2.json';

/**
 * Load the beautiful green flower pattern as default settings
 * This runs once on application startup to ensure users see the stunning pattern
 */
export const loadDefaultPattern = (setSettings) => {
    console.log('🌸 Loading beautiful Green Flower pattern as default...');
    
    try {
        // Apply all settings from green_flower_2.json using correct nested structure
        const settings = greenFlowerSettings;

        // Grid settings
        if (settings.grid?.size !== undefined) setSettings.setGridSize(settings.grid.size);
        if (settings.grid?.spacing !== undefined) setSettings.setGridSpacing(settings.grid.spacing);
        if (settings.grid?.baseDotSize !== undefined) setSettings.setBaseDotSize(settings.grid.baseDotSize);
        if (settings.grid?.connectionOpacity !== undefined) setSettings.setConnectionOpacity(settings.grid.connectionOpacity);
        if (settings.grid?.noiseIntensity !== undefined) setSettings.setNoiseIntensity(settings.grid.noiseIntensity);
        if (settings.grid?.lineWidthMultiplier !== undefined) setSettings.setLineWidthMultiplier(settings.grid.lineWidthMultiplier);
        if (settings.grid?.breathingSpeed !== undefined) setSettings.setGridBreathingSpeed(settings.grid.breathingSpeed);
        if (settings.grid?.breathingIntensity !== undefined) setSettings.setGridBreathingIntensity(settings.grid.breathingIntensity);
        if (settings.grid?.showVertices !== undefined) setSettings.setShowVertices(settings.grid.showVertices);

        // XY Grid settings
        if (settings.xyGrid?.show !== undefined) setSettings.setShowXYGrid(settings.xyGrid.show);
        if (settings.xyGrid?.size !== undefined) setSettings.setXYGridSize(settings.xyGrid.size);
        if (settings.xyGrid?.spacing !== undefined) setSettings.setXYGridSpacing(settings.xyGrid.spacing);
        if (settings.xyGrid?.opacity !== undefined) setSettings.setXYGridOpacity(settings.xyGrid.opacity);
        if (settings.xyGrid?.lineWidth !== undefined) setSettings.setXYGridLineWidth(settings.xyGrid.lineWidth);
        if (settings.xyGrid?.color !== undefined) setSettings.setXYGridColor(settings.xyGrid.color);
        if (settings.xyGrid?.showLabels !== undefined) setSettings.setShowXYGridLabels(settings.xyGrid.showLabels);

        // Color settings
        if (settings.colors?.background !== undefined) setSettings.setBackgroundColor(settings.colors.background);
        if (settings.colors?.scheme !== undefined) setSettings.setColorScheme(settings.colors.scheme);
        if (settings.colors?.lineColor !== undefined) setSettings.setLineColor(settings.colors.lineColor);

        // Gradient settings
        if (settings.colors?.gradient?.lines?.enabled !== undefined) setSettings.setUseGradientLines(settings.colors.gradient.lines.enabled);
        if (settings.colors?.gradient?.lines?.colors !== undefined) setSettings.setGradientColorsLines(settings.colors.gradient.lines.colors);
        if (settings.colors?.gradient?.dots?.enabled !== undefined) setSettings.setUseGradientDots(settings.colors.gradient.dots.enabled);
        if (settings.colors?.gradient?.dots?.colors !== undefined) setSettings.setGradientColorsDots(settings.colors.gradient.dots.colors);
        if (settings.colors?.gradient?.shapes?.enabled !== undefined) setSettings.setUseGradientShapes(settings.colors.gradient.shapes.enabled);
        if (settings.colors?.gradient?.shapes?.colors !== undefined) setSettings.setGradientColorsShapes(settings.colors.gradient.shapes.colors);
        if (settings.colors?.gradient?.easing !== undefined) setSettings.setColorEasingType(settings.colors.gradient.easing);
        if (settings.colors?.gradient?.cycleDuration !== undefined) setSettings.setColorCycleDuration(settings.colors.gradient.cycleDuration);

        // Animation settings
        if (settings.animation?.speed !== undefined) setSettings.setAnimationSpeed(settings.animation.speed);

        // Line Factory settings
        if (settings.lineFactory?.style !== undefined) setSettings.setLineStyle(settings.lineFactory.style);
        if (settings.lineFactory?.taper?.type !== undefined) setSettings.setLineTaper(settings.lineFactory.taper.type);
        if (settings.lineFactory?.taper?.startWidth !== undefined) setSettings.setTaperStart(settings.lineFactory.taper.startWidth);
        if (settings.lineFactory?.taper?.endWidth !== undefined) setSettings.setTaperEnd(settings.lineFactory.taper.endWidth);
        if (settings.lineFactory?.glow?.intensity !== undefined) setSettings.setLineGlow(settings.lineFactory.glow.intensity);
        if (settings.lineFactory?.glow?.color !== undefined) setSettings.setLineGlowColor(settings.lineFactory.glow.color);
        if (settings.lineFactory?.outline?.enabled !== undefined) setSettings.setLineOutline(settings.lineFactory.outline.enabled);
        if (settings.lineFactory?.outline?.color !== undefined) setSettings.setLineOutlineColor(settings.lineFactory.outline.color);
        if (settings.lineFactory?.outline?.width !== undefined) setSettings.setLineOutlineWidth(settings.lineFactory.outline.width);
        if (settings.lineFactory?.dash?.pattern !== undefined) setSettings.setDashPattern(settings.lineFactory.dash.pattern);
        if (settings.lineFactory?.dash?.offset !== undefined) setSettings.setDashOffset(settings.lineFactory.dash.offset);
        if (settings.lineFactory?.sineWave?.type !== undefined) setSettings.setSineWaveType(settings.lineFactory.sineWave.type);
        if (settings.lineFactory?.sineWave?.amplitude !== undefined) setSettings.setSineAmplitude(settings.lineFactory.sineWave.amplitude);
        if (settings.lineFactory?.sineWave?.frequency !== undefined) setSettings.setSineFrequency(settings.lineFactory.sineWave.frequency);
        if (settings.lineFactory?.sineWave?.phase !== undefined) setSettings.setSinePhase(settings.lineFactory.sineWave.phase);
        if (settings.lineFactory?.loopLine !== undefined) setSettings.setLoopLine(settings.lineFactory.loopLine);
        if (settings.lineFactory?.bidirectionalWaves !== undefined) setSettings.setBidirectionalWaves(settings.lineFactory.bidirectionalWaves);

        // Primary shape settings
        if (settings.shapes?.primary?.type !== undefined) setSettings.setPrimaryShapeType(settings.shapes.primary.type);
        if (settings.shapes?.primary?.size !== undefined) setSettings.setPrimaryShapeSize(settings.shapes.primary.size);
        if (settings.shapes?.primary?.opacity !== undefined) setSettings.setPrimaryShapeOpacity(settings.shapes.primary.opacity);
        if (settings.shapes?.primary?.thickness !== undefined) setSettings.setPrimaryShapeThickness(settings.shapes.primary.thickness);
        if (settings.shapes?.primary?.vertices !== undefined) setSettings.setPrimaryShapeVertices(settings.shapes.primary.vertices);
        if (settings.shapes?.primary?.rotation !== undefined) setSettings.setPrimaryShapeRotation(settings.shapes.primary.rotation);
        if (settings.shapes?.primary?.position?.offsetX !== undefined) setSettings.setPrimaryShapeOffsetX(settings.shapes.primary.position.offsetX);
        if (settings.shapes?.primary?.position?.offsetY !== undefined) setSettings.setPrimaryShapeOffsetY(settings.shapes.primary.position.offsetY);

        // Primary shape animation
        if (settings.shapes?.primary?.animation?.mode !== undefined) setSettings.setPrimaryAnimationMode(settings.shapes.primary.animation.mode);
        if (settings.shapes?.primary?.animation?.reverse !== undefined) setSettings.setPrimaryAnimationReverse(settings.shapes.primary.animation.reverse);
        if (settings.shapes?.primary?.animation?.speed !== undefined) setSettings.setPrimaryAnimationSpeed(settings.shapes.primary.animation.speed);
        if (settings.shapes?.primary?.animation?.intensity !== undefined) setSettings.setPrimaryAnimationIntensity(settings.shapes.primary.animation.intensity);
        if (settings.shapes?.primary?.animation?.fadeIn !== undefined) setSettings.setPrimaryFadeIn(settings.shapes.primary.animation.fadeIn);
        if (settings.shapes?.primary?.animation?.fadeOut !== undefined) setSettings.setPrimaryFadeOut(settings.shapes.primary.animation.fadeOut);
        if (settings.shapes?.primary?.animation?.variableTiming !== undefined) setSettings.setPrimaryVariableTiming(settings.shapes.primary.animation.variableTiming);
        if (settings.shapes?.primary?.animation?.staggerDelay !== undefined) setSettings.setPrimaryStaggerDelay(settings.shapes.primary.animation.staggerDelay);

        // Primary shape stacking
        if (settings.shapes?.primary?.stacking?.enabled !== undefined) setSettings.setPrimaryStackingEnabled(settings.shapes.primary.stacking.enabled);
        if (settings.shapes?.primary?.stacking?.count !== undefined) setSettings.setPrimaryStackingCount(settings.shapes.primary.stacking.count);
        if (settings.shapes?.primary?.stacking?.timeOffset !== undefined) setSettings.setPrimaryStackingTimeOffset(settings.shapes.primary.stacking.timeOffset);
        if (settings.shapes?.primary?.stacking?.interval !== undefined) setSettings.setPrimaryStackingInterval(settings.shapes.primary.stacking.interval);

        // Primary shape fractal
        if (settings.shapes?.primary?.fractal?.depth !== undefined) setSettings.setPrimaryFractalDepth(settings.shapes.primary.fractal.depth);
        if (settings.shapes?.primary?.fractal?.scale !== undefined) setSettings.setPrimaryFractalScale(settings.shapes.primary.fractal.scale);
        if (settings.shapes?.primary?.fractal?.thicknessFalloff !== undefined) setSettings.setPrimaryFractalThicknessFalloff(settings.shapes.primary.fractal.thicknessFalloff);
        if (settings.shapes?.primary?.fractal?.childCount !== undefined) setSettings.setPrimaryFractalChildCount(settings.shapes.primary.fractal.childCount);
        if (settings.shapes?.primary?.fractal?.sacredPositioning !== undefined) setSettings.setPrimarySacredPositioning(settings.shapes.primary.fractal.sacredPositioning);
        if (settings.shapes?.primary?.fractal?.sacredIntensity !== undefined) setSettings.setPrimarySacredIntensity(settings.shapes.primary.fractal.sacredIntensity);

        // Secondary shape settings
        if (settings.shapes?.secondary?.enabled !== undefined) setSettings.setSecondaryShapeEnabled(settings.shapes.secondary.enabled);
        if (settings.shapes?.secondary?.type !== undefined) setSettings.setSecondaryShapeType(settings.shapes.secondary.type);
        if (settings.shapes?.secondary?.size !== undefined) setSettings.setSecondaryShapeSize(settings.shapes.secondary.size);
        if (settings.shapes?.secondary?.opacity !== undefined) setSettings.setSecondaryShapeOpacity(settings.shapes.secondary.opacity);
        if (settings.shapes?.secondary?.thickness !== undefined) setSettings.setSecondaryShapeThickness(settings.shapes.secondary.thickness);
        if (settings.shapes?.secondary?.rotation !== undefined) setSettings.setSecondaryShapeRotation(settings.shapes.secondary.rotation);

        // Secondary shape animation
        if (settings.secondaryAnimationMode !== undefined) setSettings.setSecondaryAnimationMode(settings.secondaryAnimationMode);
        if (settings.secondaryAnimationReverse !== undefined) setSettings.setSecondaryAnimationReverse(settings.secondaryAnimationReverse);
        if (settings.secondaryAnimationSpeed !== undefined) setSettings.setSecondaryAnimationSpeed(settings.secondaryAnimationSpeed);
        if (settings.secondaryAnimationIntensity !== undefined) setSettings.setSecondaryAnimationIntensity(settings.secondaryAnimationIntensity);
        if (settings.secondaryVariableTiming !== undefined) setSettings.setSecondaryVariableTiming(settings.secondaryVariableTiming);
        if (settings.secondaryStaggerDelay !== undefined) setSettings.setSecondaryStaggerDelay(settings.secondaryStaggerDelay);

        // Secondary shape stacking
        if (settings.secondaryStackingEnabled !== undefined) setSettings.setSecondaryStackingEnabled(settings.secondaryStackingEnabled);
        if (settings.secondaryStackingCount !== undefined) setSettings.setSecondaryStackingCount(settings.secondaryStackingCount);
        if (settings.secondaryStackingTimeOffset !== undefined) setSettings.setSecondaryStackingTimeOffset(settings.secondaryStackingTimeOffset);
        if (settings.secondaryStackingInterval !== undefined) setSettings.setSecondaryStackingInterval(settings.secondaryStackingInterval);

        // Secondary shape fractal
        if (settings.secondaryFractalDepth !== undefined) setSettings.setSecondaryFractalDepth(settings.secondaryFractalDepth);
        if (settings.secondaryFractalScale !== undefined) setSettings.setSecondaryFractalScale(settings.secondaryFractalScale);
        if (settings.secondaryFractalThicknessFalloff !== undefined) setSettings.setSecondaryFractalThicknessFalloff(settings.secondaryFractalThicknessFalloff);
        if (settings.secondaryFractalChildCount !== undefined) setSettings.setSecondaryFractalChildCount(settings.secondaryFractalChildCount);

        console.log('✅ Green Flower pattern loaded successfully!');
        
    } catch (error) {
        console.error('❌ Failed to load default pattern:', error);
        console.log('Falling back to current settings...');
    }
};
