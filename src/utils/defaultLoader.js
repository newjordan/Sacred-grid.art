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
        // Apply all settings from green_flower_2.json
        const settings = greenFlowerSettings;
        
        // Grid settings
        if (settings.gridSize !== undefined) setSettings.setGridSize(settings.gridSize);
        if (settings.gridSpacing !== undefined) setSettings.setGridSpacing(settings.gridSpacing);
        if (settings.baseDotSize !== undefined) setSettings.setBaseDotSize(settings.baseDotSize);
        if (settings.connectionOpacity !== undefined) setSettings.setConnectionOpacity(settings.connectionOpacity);
        if (settings.noiseIntensity !== undefined) setSettings.setNoiseIntensity(settings.noiseIntensity);
        if (settings.lineWidthMultiplier !== undefined) setSettings.setLineWidthMultiplier(settings.lineWidthMultiplier);
        if (settings.gridBreathingSpeed !== undefined) setSettings.setGridBreathingSpeed(settings.gridBreathingSpeed);
        if (settings.gridBreathingIntensity !== undefined) setSettings.setGridBreathingIntensity(settings.gridBreathingIntensity);
        if (settings.showVertices !== undefined) setSettings.setShowVertices(settings.showVertices);

        // XY Grid settings
        if (settings.showXYGrid !== undefined) setSettings.setShowXYGrid(settings.showXYGrid);
        if (settings.xyGridSize !== undefined) setSettings.setXYGridSize(settings.xyGridSize);
        if (settings.xyGridSpacing !== undefined) setSettings.setXYGridSpacing(settings.xyGridSpacing);
        if (settings.xyGridOpacity !== undefined) setSettings.setXYGridOpacity(settings.xyGridOpacity);
        if (settings.xyGridLineWidth !== undefined) setSettings.setXYGridLineWidth(settings.xyGridLineWidth);
        if (settings.xyGridColor !== undefined) setSettings.setXYGridColor(settings.xyGridColor);
        if (settings.showXYGridLabels !== undefined) setSettings.setShowXYGridLabels(settings.showXYGridLabels);

        // Color settings
        if (settings.backgroundColor !== undefined) setSettings.setBackgroundColor(settings.backgroundColor);
        if (settings.colorScheme !== undefined) setSettings.setColorScheme(settings.colorScheme);
        if (settings.lineColor !== undefined) setSettings.setLineColor(settings.lineColor);
        
        // Gradient settings
        if (settings.useGradientLines !== undefined) setSettings.setUseGradientLines(settings.useGradientLines);
        if (settings.gradientColorsLines !== undefined) setSettings.setGradientColorsLines(settings.gradientColorsLines);
        if (settings.useGradientDots !== undefined) setSettings.setUseGradientDots(settings.useGradientDots);
        if (settings.gradientColorsDots !== undefined) setSettings.setGradientColorsDots(settings.gradientColorsDots);
        if (settings.useGradientShapes !== undefined) setSettings.setUseGradientShapes(settings.useGradientShapes);
        if (settings.gradientColorsShapes !== undefined) setSettings.setGradientColorsShapes(settings.gradientColorsShapes);
        if (settings.colorEasingType !== undefined) setSettings.setColorEasingType(settings.colorEasingType);
        if (settings.colorCycleDuration !== undefined) setSettings.setColorCycleDuration(settings.colorCycleDuration);

        // Animation settings
        if (settings.animationSpeed !== undefined) setSettings.setAnimationSpeed(settings.animationSpeed);

        // Line Factory settings
        if (settings.lineStyle !== undefined) setSettings.setLineStyle(settings.lineStyle);
        if (settings.lineTaper !== undefined) setSettings.setLineTaper(settings.lineTaper);
        if (settings.taperStart !== undefined) setSettings.setTaperStart(settings.taperStart);
        if (settings.taperEnd !== undefined) setSettings.setTaperEnd(settings.taperEnd);
        if (settings.lineGlow !== undefined) setSettings.setLineGlow(settings.lineGlow);
        if (settings.lineGlowColor !== undefined) setSettings.setLineGlowColor(settings.lineGlowColor);
        if (settings.lineOutline !== undefined) setSettings.setLineOutline(settings.lineOutline);
        if (settings.lineOutlineColor !== undefined) setSettings.setLineOutlineColor(settings.lineOutlineColor);
        if (settings.lineOutlineWidth !== undefined) setSettings.setLineOutlineWidth(settings.lineOutlineWidth);
        if (settings.dashPattern !== undefined) setSettings.setDashPattern(settings.dashPattern);
        if (settings.dashOffset !== undefined) setSettings.setDashOffset(settings.dashOffset);
        if (settings.sineWaveType !== undefined) setSettings.setSineWaveType(settings.sineWaveType);
        if (settings.sineAmplitude !== undefined) setSettings.setSineAmplitude(settings.sineAmplitude);
        if (settings.sineFrequency !== undefined) setSettings.setSineFrequency(settings.sineFrequency);
        if (settings.sinePhase !== undefined) setSettings.setSinePhase(settings.sinePhase);
        if (settings.loopLine !== undefined) setSettings.setLoopLine(settings.loopLine);
        if (settings.bidirectionalWaves !== undefined) setSettings.setBidirectionalWaves(settings.bidirectionalWaves);

        // Primary shape settings
        if (settings.primaryShapeType !== undefined) setSettings.setPrimaryShapeType(settings.primaryShapeType);
        if (settings.primaryShapeSize !== undefined) setSettings.setPrimaryShapeSize(settings.primaryShapeSize);
        if (settings.primaryShapeOpacity !== undefined) setSettings.setPrimaryShapeOpacity(settings.primaryShapeOpacity);
        if (settings.primaryShapeThickness !== undefined) setSettings.setPrimaryShapeThickness(settings.primaryShapeThickness);
        if (settings.primaryShapeVertices !== undefined) setSettings.setPrimaryShapeVertices(settings.primaryShapeVertices);
        if (settings.primaryShapeRotation !== undefined) setSettings.setPrimaryShapeRotation(settings.primaryShapeRotation);
        if (settings.primaryShapeOffsetX !== undefined) setSettings.setPrimaryShapeOffsetX(settings.primaryShapeOffsetX);
        if (settings.primaryShapeOffsetY !== undefined) setSettings.setPrimaryShapeOffsetY(settings.primaryShapeOffsetY);

        // Primary shape animation
        if (settings.primaryAnimationMode !== undefined) setSettings.setPrimaryAnimationMode(settings.primaryAnimationMode);
        if (settings.primaryAnimationReverse !== undefined) setSettings.setPrimaryAnimationReverse(settings.primaryAnimationReverse);
        if (settings.primaryAnimationSpeed !== undefined) setSettings.setPrimaryAnimationSpeed(settings.primaryAnimationSpeed);
        if (settings.primaryAnimationIntensity !== undefined) setSettings.setPrimaryAnimationIntensity(settings.primaryAnimationIntensity);
        if (settings.primaryFadeIn !== undefined) setSettings.setPrimaryFadeIn(settings.primaryFadeIn);
        if (settings.primaryFadeOut !== undefined) setSettings.setPrimaryFadeOut(settings.primaryFadeOut);
        if (settings.primaryVariableTiming !== undefined) setSettings.setPrimaryVariableTiming(settings.primaryVariableTiming);
        if (settings.primaryStaggerDelay !== undefined) setSettings.setPrimaryStaggerDelay(settings.primaryStaggerDelay);

        // Primary shape stacking
        if (settings.primaryStackingEnabled !== undefined) setSettings.setPrimaryStackingEnabled(settings.primaryStackingEnabled);
        if (settings.primaryStackingCount !== undefined) setSettings.setPrimaryStackingCount(settings.primaryStackingCount);
        if (settings.primaryStackingTimeOffset !== undefined) setSettings.setPrimaryStackingTimeOffset(settings.primaryStackingTimeOffset);
        if (settings.primaryStackingInterval !== undefined) setSettings.setPrimaryStackingInterval(settings.primaryStackingInterval);

        // Primary shape fractal
        if (settings.primaryFractalDepth !== undefined) setSettings.setPrimaryFractalDepth(settings.primaryFractalDepth);
        if (settings.primaryFractalScale !== undefined) setSettings.setPrimaryFractalScale(settings.primaryFractalScale);
        if (settings.primaryFractalThicknessFalloff !== undefined) setSettings.setPrimaryFractalThicknessFalloff(settings.primaryFractalThicknessFalloff);
        if (settings.primaryFractalChildCount !== undefined) setSettings.setPrimaryFractalChildCount(settings.primaryFractalChildCount);
        if (settings.primarySacredPositioning !== undefined) setSettings.setPrimarySacredPositioning(settings.primarySacredPositioning);
        if (settings.primarySacredIntensity !== undefined) setSettings.setPrimarySacredIntensity(settings.primarySacredIntensity);

        // Secondary shape settings
        if (settings.secondaryShapeEnabled !== undefined) setSettings.setSecondaryShapeEnabled(settings.secondaryShapeEnabled);
        if (settings.secondaryShapeType !== undefined) setSettings.setSecondaryShapeType(settings.secondaryShapeType);
        if (settings.secondaryShapeSize !== undefined) setSettings.setSecondaryShapeSize(settings.secondaryShapeSize);
        if (settings.secondaryShapeOpacity !== undefined) setSettings.setSecondaryShapeOpacity(settings.secondaryShapeOpacity);
        if (settings.secondaryShapeThickness !== undefined) setSettings.setSecondaryShapeThickness(settings.secondaryShapeThickness);
        if (settings.secondaryShapeRotation !== undefined) setSettings.setSecondaryShapeRotation(settings.secondaryShapeRotation);

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
