// src/components/SacredGrid.js
// Main component for Canvas2D-only version
import React, { useState, useRef, useEffect } from 'react';
import SacredGridCanvas from './components/SacredGridCanvas';
import SacredGridControls from './components/SacredGridControls';
import MandalaDesigner from './components/MandalaDesigner';
import { RendererType } from './renderers/RendererFactory';
import { ShapeType, AnimationMode, LineStyleType, TaperType, SineWaveType } from './constants/ShapeTypes';
import { ExportManager } from './export/ExportManager.js';
import { StateDuplicator } from './utils/StateDuplicator';
import { DEFAULT_SETTINGS } from './utils/constants.ts';
import { useDefaultSettings } from './hooks/useDefaultSettings';
// import { deepMerge } from './utils/deepMerge'; // Removed as it's not currently used

// Add a small CSS snippet to ensure full-screen display
const fullscreenStyles = `
html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
`;

const SacredGrid = () => {
    // Add useEffect to inject the fullscreen styles
    useEffect(() => {
        // Create and inject a style tag with our fullscreen CSS
        const styleTag = document.createElement('style');
        styleTag.textContent = fullscreenStyles;
        document.head.appendChild(styleTag);

        // Cleanup when component unmounts
        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);

    // Reference to the renderer
    const rendererRef = useRef(null);

    // Export manager
    const exportManagerRef = useRef(new ExportManager());

    // Canvas2D is the only renderer in this version
    const rendererType = RendererType.CANVAS_2D;

    // Grid settings - Initialize with DEFAULT_SETTINGS
    const [gridSize, setGridSize] = useState(DEFAULT_SETTINGS.grid.size);
    const [gridSpacing, setGridSpacing] = useState(DEFAULT_SETTINGS.grid.spacing);
    const [baseDotSize, setBaseDotSize] = useState(DEFAULT_SETTINGS.grid.baseDotSize);
    const [connectionOpacity, setConnectionOpacity] = useState(DEFAULT_SETTINGS.grid.connectionOpacity);
    const [noiseIntensity, setNoiseIntensity] = useState(DEFAULT_SETTINGS.grid.noiseIntensity);
    const [lineWidthMultiplier, setLineWidthMultiplier] = useState(DEFAULT_SETTINGS.grid.lineWidthMultiplier);
    const [gridBreathingSpeed, setGridBreathingSpeed] = useState(DEFAULT_SETTINGS.grid.breathingSpeed);
    const [gridBreathingIntensity, setGridBreathingIntensity] = useState(DEFAULT_SETTINGS.grid.breathingIntensity);
    const [showVertices, setShowVertices] = useState(DEFAULT_SETTINGS.grid.showVertices);
    
    // XY Grid settings - Initialize with DEFAULT_SETTINGS
    const [showXYGrid, setShowXYGrid] = useState(DEFAULT_SETTINGS.xyGrid.show);
    const [xyGridSize, setXYGridSize] = useState(DEFAULT_SETTINGS.xyGrid.size);
    const [xyGridSpacing, setXYGridSpacing] = useState(DEFAULT_SETTINGS.xyGrid.spacing);
    const [xyGridOpacity, setXYGridOpacity] = useState(DEFAULT_SETTINGS.xyGrid.opacity);
    const [xyGridLineWidth, setXYGridLineWidth] = useState(DEFAULT_SETTINGS.xyGrid.lineWidth);
    const [xyGridColor, setXYGridColor] = useState(DEFAULT_SETTINGS.xyGrid.color);
    const [showXYGridLabels, setShowXYGridLabels] = useState(DEFAULT_SETTINGS.xyGrid.showLabels);
    
    // Line Factory settings
    const [lineStyle, setLineStyle] = useState(LineStyleType.SOLID);
    const [lineTaper, setLineTaper] = useState(TaperType.NONE);
    const [taperStart, setTaperStart] = useState(0.1);
    const [taperEnd, setTaperEnd] = useState(0.1);
    const [lineGlow, setLineGlow] = useState(0);
    const [lineGlowColor, setLineGlowColor] = useState('#ffffff');
    const [lineOutline, setLineOutline] = useState(false);
    const [lineOutlineColor, setLineOutlineColor] = useState('#000000');
    const [lineOutlineWidth, setLineOutlineWidth] = useState(0.5);
    const [dashPattern, setDashPattern] = useState([5, 5]);
    const [dashOffset, setDashOffset] = useState(0);
    const [sineWaveType, setSineWaveType] = useState(SineWaveType.NONE);
    const [sineAmplitude, setSineAmplitude] = useState(5);
    const [sineFrequency, setSineFrequency] = useState(0.1);
    const [sinePhase, setSinePhase] = useState(0);
    
    // Apply Line Factory settings to grid
    const [useLineFactoryForGrid, setUseLineFactoryForGrid] = useState(false);

    // Mouse settings
    const [mouseInfluenceRadius, setMouseInfluenceRadius] = useState(200);
    const [maxMouseScale, setMaxMouseScale] = useState(2);

    // Color settings
    const [backgroundColor, setBackgroundColor] = useState('#000000');
    const [colorScheme, setColorScheme] = useState('blue');
    const [lineColor, setLineColor] = useState('#0077ff');
    const [useGradientLines, setUseGradientLines] = useState(false);
    const [gradientColorsLines, setGradientColorsLines] = useState([
        '#ff0000', '#ff7700', '#00ff00', '#0000ff',
    ]);
    const [useGradientDots, setUseGradientDots] = useState(false);
    const [gradientColorsDots, setGradientColorsDots] = useState([
        '#ff00ff', '#ff0077', '#0077ff', '#00ffff',
    ]);
    const [useGradientShapes, setUseGradientShapes] = useState(false);
    const [gradientColorsShapes, setGradientColorsShapes] = useState([
        '#ffffff', '#dddddd', '#aaaaaa', '#000000',
    ]);
    const [colorEasingType, setColorEasingType] = useState('linear');
    const [colorCycleDuration, setColorCycleDuration] = useState(6000);

    // Animation settings
    const [animationSpeed, setAnimationSpeed] = useState(1);

    // Primary Shape settings
    const [primaryType, setPrimaryType] = useState(ShapeType.POLYGON);
    const [primarySize, setPrimarySize] = useState(350);
    const [primaryOpacity, setPrimaryOpacity] = useState(1.0);
    const [primaryThickness, setPrimaryThickness] = useState(6);
    const [primaryFractalDepth, setPrimaryFractalDepth] = useState(1);
    const [primaryFractalScale, setPrimaryFractalScale] = useState(0.5); // Fractal distance
    const [primaryFractalThicknessFalloff, setPrimaryFractalThicknessFalloff] = useState(0.8);
    const [primaryFractalChildCount, setPrimaryFractalChildCount] = useState(3);
    const [primaryFractalSacredPositioning, setPrimaryFractalSacredPositioning] = useState(true);
    const [primaryFractalSacredIntensity, setPrimaryFractalSacredIntensity] = useState(0.5);
    const [primaryOffsetX, setPrimaryOffsetX] = useState(0);
    const [primaryOffsetY, setPrimaryOffsetY] = useState(0);
    const [primaryVertices, setPrimaryVertices] = useState(3);
    const [primaryRotation, setPrimaryRotation] = useState(0);
    const [usePrimaryLineFactory, setUsePrimaryLineFactory] = useState(false);
    const [primaryAnimationMode, setPrimaryAnimationMode] = useState(AnimationMode.GROW);
    const [primaryAnimationReverse, setPrimaryAnimationReverse] = useState(false);
    const [primaryAnimationSpeed, setPrimaryAnimationSpeed] = useState(0.0008);
    const [primaryAnimationIntensity, setPrimaryAnimationIntensity] = useState(0.2);
    const [primaryAnimationFadeIn, setPrimaryAnimationFadeIn] = useState(0.2);
    const [primaryAnimationFadeOut, setPrimaryAnimationFadeOut] = useState(0.2);
    const [primaryVariableTiming, setPrimaryVariableTiming] = useState(true);
    const [primaryStaggerDelay, setPrimaryStaggerDelay] = useState(100);

    // Primary shape-specific settings
    const [primarySpiralType, setPrimarySpiralType] = useState('golden');
    const [primaryTurns, setPrimaryTurns] = useState(4);
    const [primaryArms, setPrimaryArms] = useState(1);
    const [primaryMandalaStyle, setPrimaryMandalaStyle] = useState('geometric');
    const [primaryMandalaSymmetry, setPrimaryMandalaSymmetry] = useState(8);
    const [primaryMandalaLayers, setPrimaryMandalaLayers] = useState(4);
    const [primaryMandalaPetals, setPrimaryMandalaPetals] = useState(6);
    const [primaryMandalaComplexity, setPrimaryMandalaComplexity] = useState(0.5);
    const [customMandalaData, setCustomMandalaData] = useState([]);

    // Primary stacking settings
    const [primaryStackingEnabled, setPrimaryStackingEnabled] = useState(true);
    const [primaryStackingCount, setPrimaryStackingCount] = useState(3);
    const [primaryStackingTimeOffset, setPrimaryStackingTimeOffset] = useState(-3000);
    const [primaryStackingInterval, setPrimaryStackingInterval] = useState(1000);

    // Secondary Shape settings
    const [secondaryEnabled, setSecondaryEnabled] = useState(false);
    const [secondaryType, setSecondaryType] = useState(ShapeType.STAR);
    const [secondarySize, setSecondarySize] = useState(250);
    const [secondaryOpacity, setSecondaryOpacity] = useState(0.8);
    const [secondaryThickness, setSecondaryThickness] = useState(4);
    const [secondaryFractalDepth, setSecondaryFractalDepth] = useState(1);
    const [secondaryFractalScale, setSecondaryFractalScale] = useState(0.5);
    const [secondaryFractalThicknessFalloff, setSecondaryFractalThicknessFalloff] = useState(0.8);
    const [secondaryFractalChildCount, setSecondaryFractalChildCount] = useState(3);
    const [secondaryFractalSacredPositioning, setSecondaryFractalSacredPositioning] = useState(true);
    const [secondaryFractalSacredIntensity, setSecondaryFractalSacredIntensity] = useState(0.5);
    const [secondaryOffsetX, setSecondaryOffsetX] = useState(0);
    const [secondaryOffsetY, setSecondaryOffsetY] = useState(0);
    const [secondaryVertices, setSecondaryVertices] = useState(5);
    const [secondaryRotation, setSecondaryRotation] = useState(36);
    const [useSecondaryLineFactory, setUseSecondaryLineFactory] = useState(false);
    const [secondaryAnimationMode, setSecondaryAnimationMode] = useState(AnimationMode.PULSE);
    const [secondaryAnimationReverse, setSecondaryAnimationReverse] = useState(true);
    const [secondaryAnimationSpeed, setSecondaryAnimationSpeed] = useState(0.0006);
    const [secondaryAnimationIntensity, setSecondaryAnimationIntensity] = useState(0.3);
    const [secondaryAnimationFadeIn, setSecondaryAnimationFadeIn] = useState(0.2);
    const [secondaryAnimationFadeOut, setSecondaryAnimationFadeOut] = useState(0.2);
    const [secondaryVariableTiming, setSecondaryVariableTiming] = useState(true);
    const [secondaryStaggerDelay, setSecondaryStaggerDelay] = useState(150);

    // Secondary stacking settings
    const [secondaryStackingEnabled, setSecondaryStackingEnabled] = useState(true);
    const [secondaryStackingCount, setSecondaryStackingCount] = useState(2);
    const [secondaryStackingTimeOffset, setSecondaryStackingTimeOffset] = useState(1500);
    const [secondaryStackingInterval, setSecondaryStackingInterval] = useState(1500);
    
    // Secondary mathematical relationships
    const [secondaryUseHarmonicRatios, setSecondaryUseHarmonicRatios] = useState(false);
    const [secondaryHarmonicRatio, setSecondaryHarmonicRatio] = useState("1:1");
    const [secondaryUseSymmetryGroup, setSecondaryUseSymmetryGroup] = useState(false);
    const [secondarySymmetryOperation, setSecondarySymmetryOperation] = useState("rotation");

    // Secondary shape-specific settings
    const [secondarySpiralType, setSecondarySpiralType] = useState('golden');
    const [secondaryTurns, setSecondaryTurns] = useState(4);
    const [secondaryArms, setSecondaryArms] = useState(1);
    const [secondaryMandalaStyle, setSecondaryMandalaStyle] = useState('geometric');
    const [secondaryMandalaSymmetry, setSecondaryMandalaSymmetry] = useState(8);
    const [secondaryMandalaLayers, setSecondaryMandalaLayers] = useState(4);
    const [secondaryMandalaPetals, setSecondaryMandalaPetals] = useState(6);
    const [secondaryMandalaComplexity, setSecondaryMandalaComplexity] = useState(0.5);

    // Randomizer settings
    const [useRandomizer, setUseRandomizer] = useState(true);
    const [randomizerScale, setRandomizerScale] = useState(0.15); // Default 15% of primary size
    const [randomSeedOffset, setRandomSeedOffset] = useState(0); // Allows changing the seed pattern

    // Modern Post-Processing settings
    const [modernPostProcessingEnabled, setModernPostProcessingEnabled] = useState(false);
    const [modernPostProcessingIntensity, setModernPostProcessingIntensity] = useState(1.0);

    // Bloom settings
    const [bloomEnabled, setBloomEnabled] = useState(false);
    const [bloomThreshold, setBloomThreshold] = useState(0.8);
    const [bloomIntensity, setBloomIntensity] = useState(1.0);
    const [bloomRadius, setBloomRadius] = useState(1.0);
    const [bloomSoftKnee, setBloomSoftKnee] = useState(0.5);
    const [bloomQuality, setBloomQuality] = useState('high');
    const [bloomToneMapping, setBloomToneMapping] = useState(true);
    const [bloomExposure, setBloomExposure] = useState(1.0);

    // Color Grading settings
    const [colorGradingEnabled, setColorGradingEnabled] = useState(false);
    const [colorGradingExposure, setColorGradingExposure] = useState(0.0);
    const [colorGradingContrast, setColorGradingContrast] = useState(1.0);
    const [colorGradingHighlights, setColorGradingHighlights] = useState(0.0);
    const [colorGradingShadows, setColorGradingShadows] = useState(0.0);
    const [colorGradingWhites, setColorGradingWhites] = useState(0.0);
    const [colorGradingBlacks, setColorGradingBlacks] = useState(0.0);
    const [colorGradingTemperature, setColorGradingTemperature] = useState(0.0);
    const [colorGradingTint, setColorGradingTint] = useState(0.0);
    const [colorGradingVibrance, setColorGradingVibrance] = useState(0.0);
    const [colorGradingSaturation, setColorGradingSaturation] = useState(1.0);
    const [colorGradingGamma, setColorGradingGamma] = useState(1.0);

    // Cinematic Effects settings
    const [chromaticAberrationEnabled, setChromaticAberrationEnabled] = useState(false);
    const [chromaticAberrationIntensity, setChromaticAberrationIntensity] = useState(0.5);
    const [chromaticAberrationQuality, setChromaticAberrationQuality] = useState('high');
    const [chromaticAberrationRadial, setChromaticAberrationRadial] = useState(true);

    const [vignetteEnabled, setVignetteEnabled] = useState(false);
    const [vignetteIntensity, setVignetteIntensity] = useState(0.5);
    const [vignetteSmoothness, setVignetteSmoothness] = useState(0.5);
    const [vignetteRoundness, setVignetteRoundness] = useState(1.0);

    const [filmGrainEnabled, setFilmGrainEnabled] = useState(false);
    const [filmGrainIntensity, setFilmGrainIntensity] = useState(0.3);
    const [filmGrainSize, setFilmGrainSize] = useState(1.0);
    const [filmGrainLuminance, setFilmGrainLuminance] = useState(0.7);
    const [filmGrainColored, setFilmGrainColored] = useState(false);

    // Control panel visibility
    const [showControls, setShowControls] = useState(true);
    const toggleControls = () => setShowControls(prev => !prev);

    // Build the structured settings object from all the state variables
    const settings = {
        // Grid and general settings
        grid: {
            size: gridSize,
            spacing: gridSpacing,
            baseDotSize: baseDotSize,
            connectionOpacity: connectionOpacity,
            noiseIntensity: noiseIntensity,
            lineWidthMultiplier: lineWidthMultiplier,
            breathingSpeed: gridBreathingSpeed,
            breathingIntensity: gridBreathingIntensity,
            showVertices: showVertices,
            useLineFactorySettings: useLineFactoryForGrid
        },

        // Mouse interaction settings
        mouse: {
            influenceRadius: mouseInfluenceRadius,
            maxScale: maxMouseScale,
            position: { x: 0, y: 0 }, // This will be updated by the renderer
        },

        // Colors and gradients
        colors: {
            background: backgroundColor,
            scheme: colorScheme,
            lineColor: lineColor,
            gradient: {
                lines: {
                    enabled: useGradientLines,
                    colors: gradientColorsLines,
                },
                dots: {
                    enabled: useGradientDots,
                    colors: gradientColorsDots,
                },
                shapes: {
                    enabled: useGradientShapes,
                    colors: gradientColorsShapes,
                },
                easing: colorEasingType,
                cycleDuration: colorCycleDuration,
            },
        },

        // Animation global settings
        animation: {
            speed: animationSpeed,
        },
        
        // XY Grid settings
        xyGrid: {
            show: showXYGrid,
            size: xyGridSize,
            spacing: xyGridSpacing,
            opacity: xyGridOpacity,
            lineWidth: xyGridLineWidth,
            color: xyGridColor,
            showLabels: showXYGridLabels
        },
        
        // Line Factory settings
        lineFactory: {
            style: lineStyle,
            taper: {
                type: lineTaper,
                startWidth: taperStart,
                endWidth: taperEnd,
            },
            glow: {
                intensity: lineGlow,
                color: lineGlowColor,
            },
            outline: {
                enabled: lineOutline,
                color: lineOutlineColor,
                width: lineOutlineWidth,
            },
            dash: {
                pattern: dashPattern,
                offset: dashOffset,
            },
            sineWave: {
                type: sineWaveType,
                amplitude: sineAmplitude,
                frequency: sineFrequency,
                phase: sinePhase,
            },
            loopLine: true,
            bidirectionalWaves: true,
        },
        
        // Shapes container object
        shapes: {
            // Primary shape settings
            primary: {
                type: primaryType,
                size: primarySize,
                opacity: primaryOpacity,
                thickness: primaryThickness,
                vertices: primaryVertices,
                rotation: primaryRotation,
                useLineFactory: usePrimaryLineFactory,
                position: {
                    offsetX: primaryOffsetX,
                    offsetY: primaryOffsetY,
                },
                // Shape-specific properties
                spiralType: primarySpiralType,
                turns: primaryTurns,
                arms: primaryArms,
                mandalaStyle: primaryMandalaStyle,
                mandalaSymmetry: primaryMandalaSymmetry,
                mandalaLayers: primaryMandalaLayers,
                mandalaPetals: primaryMandalaPetals,
                mandalaComplexity: primaryMandalaComplexity,
                customMandalaData: customMandalaData,
                fractal: {
                    depth: primaryFractalDepth,
                    scale: primaryFractalScale, // Fractal distance (positioning)
                    thicknessFalloff: primaryFractalThicknessFalloff,
                    childCount: primaryFractalChildCount,
                    sacredPositioning: primaryFractalSacredPositioning,
                    sacredIntensity: primaryFractalSacredIntensity
                },
                animation: {
                    mode: primaryAnimationMode,
                    reverse: primaryAnimationReverse,
                    speed: primaryAnimationSpeed,
                    intensity: primaryAnimationIntensity,
                    fadeIn: primaryAnimationFadeIn,
                    fadeOut: primaryAnimationFadeOut,
                    variableTiming: primaryVariableTiming,
                    staggerDelay: primaryStaggerDelay,
                },
                stacking: {
                    enabled: primaryStackingEnabled,
                    count: primaryStackingCount,
                    timeOffset: primaryStackingTimeOffset,
                    interval: primaryStackingInterval,
                },
            }
            ,
            secondary: {
                enabled: secondaryEnabled,
                type: secondaryType,
                size: secondarySize,
                opacity: secondaryOpacity,
                thickness: secondaryThickness,
                vertices: secondaryVertices,
                rotation: secondaryRotation,
                useLineFactory: useSecondaryLineFactory,
                position: {
                    offsetX: secondaryOffsetX,
                    offsetY: secondaryOffsetY,
                },
                // Shape-specific properties
                spiralType: secondarySpiralType,
                turns: secondaryTurns,
                arms: secondaryArms,
                mandalaStyle: secondaryMandalaStyle,
                mandalaSymmetry: secondaryMandalaSymmetry,
                mandalaLayers: secondaryMandalaLayers,
                mandalaPetals: secondaryMandalaPetals,
                mandalaComplexity: secondaryMandalaComplexity,
                fractal: {
                    depth: secondaryFractalDepth,
                    scale: secondaryFractalScale,
                    thicknessFalloff: secondaryFractalThicknessFalloff,
                    childCount: secondaryFractalChildCount,
                    sacredPositioning: secondaryFractalSacredPositioning,
                    sacredIntensity: secondaryFractalSacredIntensity
                },
                animation: {
                    mode: secondaryAnimationMode,
                    reverse: secondaryAnimationReverse,
                    speed: secondaryAnimationSpeed,
                    intensity: secondaryAnimationIntensity,
                    fadeIn: secondaryAnimationFadeIn,
                    fadeOut: secondaryAnimationFadeOut,
                    variableTiming: secondaryVariableTiming,
                    staggerDelay: secondaryStaggerDelay,
                },
                stacking: {
                    enabled: secondaryStackingEnabled,
                    count: secondaryStackingCount,
                    timeOffset: secondaryStackingTimeOffset,
                    interval: secondaryStackingInterval,
                    mathRelationships: {
                        useRandomizer: useRandomizer,
                        randomizerScale: randomizerScale,
                        randomSeedOffset: randomSeedOffset,
                        useHarmonicRatios: secondaryUseHarmonicRatios,
                        harmonicRatio: secondaryHarmonicRatio,
                        useSymmetryGroup: secondaryUseSymmetryGroup,
                        symmetryOperation: secondarySymmetryOperation,
                    },
                },
            }
        },

        // Modern Post-Processing settings
        modernPostProcessing: {
            enabled: modernPostProcessingEnabled,
            intensity: modernPostProcessingIntensity,

            bloom: {
                enabled: bloomEnabled,
                threshold: bloomThreshold,
                intensity: bloomIntensity,
                radius: bloomRadius,
                softKnee: bloomSoftKnee,
                quality: bloomQuality,
                toneMapping: bloomToneMapping,
                exposure: bloomExposure
            },

            colorGrading: {
                enabled: colorGradingEnabled,
                exposure: colorGradingExposure,
                contrast: colorGradingContrast,
                highlights: colorGradingHighlights,
                shadows: colorGradingShadows,
                whites: colorGradingWhites,
                blacks: colorGradingBlacks,
                temperature: colorGradingTemperature,
                tint: colorGradingTint,
                vibrance: colorGradingVibrance,
                saturation: colorGradingSaturation,
                gamma: colorGradingGamma
            },

            cinematic: {
                chromaticAberration: {
                    enabled: chromaticAberrationEnabled,
                    intensity: chromaticAberrationIntensity,
                    quality: chromaticAberrationQuality,
                    radial: chromaticAberrationRadial
                },
                vignette: {
                    enabled: vignetteEnabled,
                    intensity: vignetteIntensity,
                    smoothness: vignetteSmoothness,
                    roundness: vignetteRoundness,
                    center: [0.5, 0.5]
                },
                filmGrain: {
                    enabled: filmGrainEnabled,
                    intensity: filmGrainIntensity,
                    size: filmGrainSize,
                    luminance: filmGrainLuminance,
                    colored: filmGrainColored
                }
            }
        }
    };

    // Build setSettings object for callbacks
    const setSettings = {
        // Grid setters
        setGridSize,
        setGridSpacing,
        setBaseDotSize,
        setConnectionOpacity,
        setNoiseIntensity,
        setLineWidthMultiplier,
        setGridBreathingSpeed,
        setShowVertices,
        setGridBreathingIntensity,
        setUseLineFactoryForGrid,

        // Mouse setters
        setMouseInfluenceRadius,
        setMaxMouseScale,

        // XY Grid setters
        setShowXYGrid,
        setXYGridSize,
        setXYGridSpacing,
        setXYGridOpacity,
        setXYGridLineWidth,
        setXYGridColor,
        setShowXYGridLabels,

        // Color setters
        setBackgroundColor,
        setColorScheme,
        setLineColor,
        setUseGradientLines,
        setGradientColorsLines,
        setUseGradientDots,
        setGradientColorsDots,
        setUseGradientShapes,
        setGradientColorsShapes,
        setColorEasingType,
        setColorCycleDuration,

        // Animation setters
        setAnimationSpeed,
        
        // Line Factory setters
        setLineStyle,
        setLineTaper,
        setTaperStart,
        setTaperEnd,
        setLineGlow,
        setLineGlowColor,
        setLineOutline,
        setLineOutlineColor,
        setLineOutlineWidth,
        setDashPattern,
        setDashOffset,
        setSineWaveType,
        setSineAmplitude,
        setSineFrequency,
        setSinePhase,

        // Primary Shape setters
        setPrimaryType,
        setPrimarySize,
        setPrimaryOpacity,
        setPrimaryThickness,
        setPrimaryVertices,
        setPrimaryRotation,
        setUsePrimaryLineFactory,
        setPrimaryOffsetX,
        setPrimaryOffsetY,
        setPrimaryFractalDepth,
        setPrimaryFractalScale,
        setPrimaryFractalThicknessFalloff,
        setPrimaryFractalChildCount,
        setPrimaryFractalSacredPositioning,
        setPrimaryFractalSacredIntensity,
        setPrimaryAnimationMode,
        setPrimaryAnimationReverse,
        setPrimaryAnimationSpeed,
        setPrimaryAnimationIntensity,
        setPrimaryAnimationFadeIn,
        setPrimaryAnimationFadeOut,
        setPrimaryVariableTiming,
        setPrimaryStaggerDelay,
        setPrimaryStackingEnabled,
        setPrimaryStackingCount,
        setPrimaryStackingTimeOffset,
        setPrimaryStackingInterval,

        // Primary shape-specific setters
        setPrimarySpiralType,
        setPrimaryTurns,
        setPrimaryArms,
        setPrimaryMandalaStyle,
        setPrimaryMandalaSymmetry,
        setPrimaryMandalaLayers,
        setPrimaryMandalaPetals,
        setPrimaryMandalaComplexity,
        setCustomMandalaData,

        // Secondary Shape setters
        setSecondaryEnabled,
        setSecondaryType,
        setSecondarySize,
        setSecondaryOpacity,
        setSecondaryThickness,
        setSecondaryVertices,
        setSecondaryRotation,
        setUseSecondaryLineFactory,
        setSecondaryOffsetX,
        setSecondaryOffsetY,
        setSecondaryFractalDepth,
        setSecondaryFractalScale,
        setSecondaryFractalThicknessFalloff,
        setSecondaryFractalChildCount,
        setSecondaryFractalSacredPositioning,
        setSecondaryFractalSacredIntensity,
        setSecondaryAnimationMode,
        setSecondaryAnimationReverse,
        setSecondaryAnimationSpeed,
        setSecondaryAnimationIntensity,
        setSecondaryAnimationFadeIn,
        setSecondaryAnimationFadeOut,
        setSecondaryVariableTiming,
        setSecondaryStaggerDelay,
        setSecondaryStackingEnabled,
        setSecondaryStackingCount,
        setSecondaryStackingTimeOffset,
        setSecondaryStackingInterval,
        
        // Secondary math relationship setters
        setSecondaryUseHarmonicRatios,
        setSecondaryHarmonicRatio,
        setSecondaryUseSymmetryGroup,
        setSecondarySymmetryOperation,

        // Secondary shape-specific setters
        setSecondarySpiralType,
        setSecondaryTurns,
        setSecondaryArms,
        setSecondaryMandalaStyle,
        setSecondaryMandalaSymmetry,
        setSecondaryMandalaLayers,
        setSecondaryMandalaPetals,
        setSecondaryMandalaComplexity,

        // Randomizer setters
        setUseRandomizer,
        setRandomizerScale,
        setRandomSeedOffset,

        // Modern Post-Processing setters
        setModernPostProcessingEnabled,
        setModernPostProcessingIntensity,

        // Bloom setters
        setBloomEnabled,
        setBloomThreshold,
        setBloomIntensity,
        setBloomRadius,
        setBloomSoftKnee,
        setBloomQuality,
        setBloomToneMapping,
        setBloomExposure,

        // Color Grading setters
        setColorGradingEnabled,
        setColorGradingExposure,
        setColorGradingContrast,
        setColorGradingHighlights,
        setColorGradingShadows,
        setColorGradingWhites,
        setColorGradingBlacks,
        setColorGradingTemperature,
        setColorGradingTint,
        setColorGradingVibrance,
        setColorGradingSaturation,
        setColorGradingGamma,

        // Cinematic Effects setters
        setChromaticAberrationEnabled,
        setChromaticAberrationIntensity,
        setChromaticAberrationQuality,
        setChromaticAberrationRadial,
        setVignetteEnabled,
        setVignetteIntensity,
        setVignetteSmoothness,
        setVignetteRoundness,
        setFilmGrainEnabled,
        setFilmGrainIntensity,
        setFilmGrainSize,
        setFilmGrainLuminance,
        setFilmGrainColored,
    };

    // 🌸 Apply beautiful default settings on first run (Green Flower pattern)
    useDefaultSettings(setSettings);

    // Handle importing settings from a JSON file
    const handleImportSettings = (jsonContent) => {
        try {
            const importedSettings = JSON.parse(jsonContent);

            // Basic validation (check for top-level keys)
            if (!importedSettings || typeof importedSettings !== 'object' ||
                !importedSettings.grid || !importedSettings.colors || !importedSettings.shapes) {
                throw new Error("Invalid settings file format. Missing essential keys.");
            }

            // --- Update State ---
            // Use a helper or manually set each state variable.
            // This is verbose but ensures each piece of state is updated.
            // It's crucial that the structure here matches the 'settings' object structure.

            // Grid settings
            if (importedSettings.grid) {
                setGridSize(importedSettings.grid.size ?? gridSize);
                setGridSpacing(importedSettings.grid.spacing ?? gridSpacing);
                setBaseDotSize(importedSettings.grid.baseDotSize ?? baseDotSize);
                setConnectionOpacity(importedSettings.grid.connectionOpacity ?? connectionOpacity);
                setNoiseIntensity(importedSettings.grid.noiseIntensity ?? noiseIntensity);
                setLineWidthMultiplier(importedSettings.grid.lineWidthMultiplier ?? lineWidthMultiplier);
                setGridBreathingSpeed(importedSettings.grid.breathingSpeed ?? gridBreathingSpeed);
                setGridBreathingIntensity(importedSettings.grid.breathingIntensity ?? gridBreathingIntensity);
                setShowVertices(importedSettings.grid.showVertices ?? showVertices);
                setUseLineFactoryForGrid(importedSettings.grid.useLineFactorySettings ?? useLineFactoryForGrid);
            }

            // Mouse settings (position is handled internally, only update influence/scale)
            if (importedSettings.mouse) {
                setMouseInfluenceRadius(importedSettings.mouse.influenceRadius ?? mouseInfluenceRadius);
                setMaxMouseScale(importedSettings.mouse.maxScale ?? maxMouseScale);
            }

            // Color settings
            if (importedSettings.colors) {
                setBackgroundColor(importedSettings.colors.background ?? backgroundColor);
                setColorScheme(importedSettings.colors.scheme ?? colorScheme);
                setLineColor(importedSettings.colors.lineColor ?? lineColor);
                if (importedSettings.colors.gradient) {
                    if (importedSettings.colors.gradient.lines) {
                        setUseGradientLines(importedSettings.colors.gradient.lines.enabled ?? useGradientLines);
                        setGradientColorsLines(importedSettings.colors.gradient.lines.colors ?? gradientColorsLines);
                    }
                    if (importedSettings.colors.gradient.dots) {
                        setUseGradientDots(importedSettings.colors.gradient.dots.enabled ?? useGradientDots);
                        setGradientColorsDots(importedSettings.colors.gradient.dots.colors ?? gradientColorsDots);
                    }
                    if (importedSettings.colors.gradient.shapes) {
                        setUseGradientShapes(importedSettings.colors.gradient.shapes.enabled ?? useGradientShapes);
                        setGradientColorsShapes(importedSettings.colors.gradient.shapes.colors ?? gradientColorsShapes);
                    }
                    setColorEasingType(importedSettings.colors.gradient.easing ?? colorEasingType);
                    setColorCycleDuration(importedSettings.colors.gradient.cycleDuration ?? colorCycleDuration);
                }
            }

            // Animation settings
            if (importedSettings.animation) {
                setAnimationSpeed(importedSettings.animation.speed ?? animationSpeed);
            }

            // XY Grid settings
            if (importedSettings.xyGrid) {
                setShowXYGrid(importedSettings.xyGrid.show ?? showXYGrid);
                setXYGridSize(importedSettings.xyGrid.size ?? xyGridSize);
                setXYGridSpacing(importedSettings.xyGrid.spacing ?? xyGridSpacing);
                setXYGridOpacity(importedSettings.xyGrid.opacity ?? xyGridOpacity);
                setXYGridLineWidth(importedSettings.xyGrid.lineWidth ?? xyGridLineWidth);
                setXYGridColor(importedSettings.xyGrid.color ?? xyGridColor);
                setShowXYGridLabels(importedSettings.xyGrid.showLabels ?? showXYGridLabels);
            }

            // Line Factory settings
            if (importedSettings.lineFactory) {
                setLineStyle(importedSettings.lineFactory.style ?? lineStyle);
                if (importedSettings.lineFactory.taper) {
                    setLineTaper(importedSettings.lineFactory.taper.type ?? lineTaper);
                    setTaperStart(importedSettings.lineFactory.taper.startWidth ?? taperStart);
                    setTaperEnd(importedSettings.lineFactory.taper.endWidth ?? taperEnd);
                }
                 if (importedSettings.lineFactory.glow) {
                    setLineGlow(importedSettings.lineFactory.glow.intensity ?? lineGlow);
                    setLineGlowColor(importedSettings.lineFactory.glow.color ?? lineGlowColor);
                }
                if (importedSettings.lineFactory.outline) {
                    setLineOutline(importedSettings.lineFactory.outline.enabled ?? lineOutline);
                    setLineOutlineColor(importedSettings.lineFactory.outline.color ?? lineOutlineColor);
                    setLineOutlineWidth(importedSettings.lineFactory.outline.width ?? lineOutlineWidth);
                }
                if (importedSettings.lineFactory.dash) {
                    setDashPattern(importedSettings.lineFactory.dash.pattern ?? dashPattern);
                    setDashOffset(importedSettings.lineFactory.dash.offset ?? dashOffset);
                }
                if (importedSettings.lineFactory.sineWave) {
                    setSineWaveType(importedSettings.lineFactory.sineWave.type ?? sineWaveType);
                    setSineAmplitude(importedSettings.lineFactory.sineWave.amplitude ?? sineAmplitude);
                    setSineFrequency(importedSettings.lineFactory.sineWave.frequency ?? sineFrequency);
                    setSinePhase(importedSettings.lineFactory.sineWave.phase ?? sinePhase);
                }
            }

            // Primary Shape settings
            if (importedSettings.shapes && importedSettings.shapes.primary) {
                const primary = importedSettings.shapes.primary;
                setPrimaryType(primary.type ?? primaryType);
                setPrimarySize(primary.size ?? primarySize);
                setPrimaryOpacity(primary.opacity ?? primaryOpacity);
                setPrimaryThickness(primary.thickness ?? primaryThickness);
                setPrimaryVertices(primary.vertices ?? primaryVertices);
                setPrimaryRotation(primary.rotation ?? primaryRotation);
                setUsePrimaryLineFactory(primary.useLineFactory ?? usePrimaryLineFactory);
                if (primary.position) {
                    setPrimaryOffsetX(primary.position.offsetX ?? primaryOffsetX);
                    setPrimaryOffsetY(primary.position.offsetY ?? primaryOffsetY);
                }
                if (primary.fractal) {
                    setPrimaryFractalDepth(primary.fractal.depth ?? primaryFractalDepth);
                    setPrimaryFractalScale(primary.fractal.scale ?? primaryFractalScale);
                    setPrimaryFractalThicknessFalloff(primary.fractal.thicknessFalloff ?? primaryFractalThicknessFalloff);
                    setPrimaryFractalChildCount(primary.fractal.childCount ?? primaryFractalChildCount);
                    setPrimaryFractalSacredPositioning(primary.fractal.sacredPositioning ?? primaryFractalSacredPositioning);
                    setPrimaryFractalSacredIntensity(primary.fractal.sacredIntensity ?? primaryFractalSacredIntensity);
                }
                if (primary.animation) {
                    setPrimaryAnimationMode(primary.animation.mode ?? primaryAnimationMode);
                    setPrimaryAnimationReverse(primary.animation.reverse ?? primaryAnimationReverse);
                    setPrimaryAnimationSpeed(primary.animation.speed ?? primaryAnimationSpeed);
                    setPrimaryAnimationIntensity(primary.animation.intensity ?? primaryAnimationIntensity);
                    setPrimaryAnimationFadeIn(primary.animation.fadeIn ?? primaryAnimationFadeIn);
                    setPrimaryAnimationFadeOut(primary.animation.fadeOut ?? primaryAnimationFadeOut);
                    setPrimaryVariableTiming(primary.animation.variableTiming ?? primaryVariableTiming);
                    setPrimaryStaggerDelay(primary.animation.staggerDelay ?? primaryStaggerDelay);
                }
                if (primary.stacking) {
                    setPrimaryStackingEnabled(primary.stacking.enabled ?? primaryStackingEnabled);
                    setPrimaryStackingCount(primary.stacking.count ?? primaryStackingCount);
                    setPrimaryStackingTimeOffset(primary.stacking.timeOffset ?? primaryStackingTimeOffset);
                    setPrimaryStackingInterval(primary.stacking.interval ?? primaryStackingInterval);
                }
            }

            // Secondary Shape settings
            if (importedSettings.shapes && importedSettings.shapes.secondary) {
                const secondary = importedSettings.shapes.secondary;
                setSecondaryEnabled(secondary.enabled ?? secondaryEnabled);
                setSecondaryType(secondary.type ?? secondaryType);
                setSecondarySize(secondary.size ?? secondarySize);
                setSecondaryOpacity(secondary.opacity ?? secondaryOpacity);
                setSecondaryThickness(secondary.thickness ?? secondaryThickness);
                setSecondaryVertices(secondary.vertices ?? secondaryVertices);
                setSecondaryRotation(secondary.rotation ?? secondaryRotation);
                setUseSecondaryLineFactory(secondary.useLineFactory ?? useSecondaryLineFactory);
                if (secondary.position) {
                    setSecondaryOffsetX(secondary.position.offsetX ?? secondaryOffsetX);
                    setSecondaryOffsetY(secondary.position.offsetY ?? secondaryOffsetY);
                }
                if (secondary.fractal) {
                    setSecondaryFractalDepth(secondary.fractal.depth ?? secondaryFractalDepth);
                    setSecondaryFractalScale(secondary.fractal.scale ?? secondaryFractalScale);
                    setSecondaryFractalThicknessFalloff(secondary.fractal.thicknessFalloff ?? secondaryFractalThicknessFalloff);
                    setSecondaryFractalChildCount(secondary.fractal.childCount ?? secondaryFractalChildCount);
                    setSecondaryFractalSacredPositioning(secondary.fractal.sacredPositioning ?? secondaryFractalSacredPositioning);
                    setSecondaryFractalSacredIntensity(secondary.fractal.sacredIntensity ?? secondaryFractalSacredIntensity);
                }
                if (secondary.animation) {
                    setSecondaryAnimationMode(secondary.animation.mode ?? secondaryAnimationMode);
                    setSecondaryAnimationReverse(secondary.animation.reverse ?? secondaryAnimationReverse);
                    setSecondaryAnimationSpeed(secondary.animation.speed ?? secondaryAnimationSpeed);
                    setSecondaryAnimationIntensity(secondary.animation.intensity ?? secondaryAnimationIntensity);
                    setSecondaryAnimationFadeIn(secondary.animation.fadeIn ?? secondaryAnimationFadeIn);
                    setSecondaryAnimationFadeOut(secondary.animation.fadeOut ?? secondaryAnimationFadeOut);
                    setSecondaryVariableTiming(secondary.animation.variableTiming ?? secondaryVariableTiming);
                    setSecondaryStaggerDelay(secondary.animation.staggerDelay ?? secondaryStaggerDelay);
                }
                if (secondary.stacking) {
                    setSecondaryStackingEnabled(secondary.stacking.enabled ?? secondaryStackingEnabled);
                    setSecondaryStackingCount(secondary.stacking.count ?? secondaryStackingCount);
                    setSecondaryStackingTimeOffset(secondary.stacking.timeOffset ?? secondaryStackingTimeOffset);
                    setSecondaryStackingInterval(secondary.stacking.interval ?? secondaryStackingInterval);
                    if (secondary.stacking.mathRelationships) {
                        const mathRel = secondary.stacking.mathRelationships;
                        setUseRandomizer(mathRel.useRandomizer ?? useRandomizer);
                        setRandomizerScale(mathRel.randomizerScale ?? randomizerScale);
                        setRandomSeedOffset(mathRel.randomSeedOffset ?? randomSeedOffset);
                        setSecondaryUseHarmonicRatios(mathRel.useHarmonicRatios ?? secondaryUseHarmonicRatios);
                        setSecondaryHarmonicRatio(mathRel.harmonicRatio ?? secondaryHarmonicRatio);
                        setSecondaryUseSymmetryGroup(mathRel.useSymmetryGroup ?? secondaryUseSymmetryGroup);
                        setSecondarySymmetryOperation(mathRel.symmetryOperation ?? secondarySymmetryOperation);
                    }
                }
            }

            alert("Settings imported successfully!");

        } catch (error) {
            console.error("Error importing settings:", error);
            alert(`Failed to import settings: ${error.message}`);
        }
    };

    // Handle exporting with comprehensive settings capture
    const handleExport = async (exportOptions, progressCallback) => {
        try {
            // Get the canvas from the renderer through the exposed canvas property
            const canvas = rendererRef.current?.canvas || null;

            if (!canvas) {
                throw new Error('Canvas not available for export. Make sure the Sacred Grid is fully loaded.');
            }

            console.log('🎯 Canvas found for export:', {
                width: canvas.width,
                height: canvas.height,
                element: canvas
            });

            // DEBUG: Show current UI state values
            console.clear();
            console.log('🚨 EXPORT DEBUG - Current UI State:');
            console.log('Grid Size:', gridSize);
            console.log('Show Vertices:', showVertices);
            console.log('Show XY Grid:', showXYGrid);
            console.log('Use Gradient Lines:', useGradientLines);
            console.log('Primary Type:', primaryType);
            console.log('Primary Size:', primarySize);
            console.log('Background Color:', backgroundColor);

            // Capture ALL current settings from the application state
            const comprehensiveSettings = {
                // Grid Settings
                gridSize,
                gridSpacing,
                connectionOpacity,
                noiseIntensity,
                lineWidthMultiplier,
                gridBreathingSpeed,
                gridBreathingIntensity,
                showVertices,

                // XY Grid Settings
                showXYGrid,
                xyGridSize,
                xyGridSpacing,
                xyGridOpacity,
                xyGridLineWidth,
                xyGridColor,
                showXYGridLabels,

                // Line Factory Settings
                lineStyle,
                lineTaper,
                taperStart,
                taperEnd,
                lineGlow,
                lineGlowColor,
                lineOutline,
                lineOutlineColor,
                lineOutlineWidth,
                dashPattern,
                dashOffset,
                sineWaveType,
                sineAmplitude,
                sineFrequency,
                sinePhase,
                useLineFactoryForGrid,

                // Mouse Settings
                mouseInfluenceRadius,
                maxMouseScale,

                // Color Settings
                backgroundColor,
                colorScheme,
                lineColor,
                useGradientLines,
                gradientColorsLines,
                useGradientDots,
                gradientColorsDots,
                useGradientShapes,
                gradientColorsShapes,
                colorEasingType,
                colorCycleDuration,

                // Animation Settings
                animationSpeed,

                // Primary Shape Settings
                primaryType,
                primarySize,
                primaryOpacity,
                primaryThickness,
                primaryFractalDepth,
                primaryFractalScale,
                primaryFractalThicknessFalloff,
                primaryFractalChildCount,
                primaryFractalSacredPositioning,
                primaryFractalSacredIntensity,
                primaryOffsetX,
                primaryOffsetY,
                primaryVertices,
                primaryRotation,
                usePrimaryLineFactory,
                primaryAnimationMode,
                primaryAnimationReverse,
                primaryAnimationSpeed,
                primaryAnimationIntensity,
                primaryAnimationFadeIn,
                primaryAnimationFadeOut,
                primaryVariableTiming,
                primaryStaggerDelay,

                // Primary Shape-specific Settings
                primarySpiralType,
                primaryTurns,
                primaryArms,
                primaryMandalaStyle,
                primaryMandalaSymmetry,
                primaryMandalaLayers,
                primaryMandalaPetals,
                primaryMandalaComplexity,
                customMandalaData,

                // Primary Stacking Settings
                primaryStackingEnabled,
                primaryStackingCount,

                // Secondary Shape Settings (if they exist)
                secondaryType: secondaryType || 'none',
                secondarySize: secondarySize || 200,
                secondaryOpacity: secondaryOpacity || 0.5,
                secondaryThickness: secondaryThickness || 3,
                secondaryVertices: secondaryVertices || 6,
                secondaryRotation: secondaryRotation || 0,
                secondaryOffsetX: secondaryOffsetX || 0,
                secondaryOffsetY: secondaryOffsetY || 0,
                secondaryAnimationSpeed: secondaryAnimationSpeed || 0.001,
                secondaryAnimationIntensity: secondaryAnimationIntensity || 0.15,

                // Renderer Settings
                rendererType,
                showControls
            };

            console.log('📊 Exporting with comprehensive settings:');
            console.log(`🎯 Total settings captured: ${Object.keys(comprehensiveSettings).length}`);

            await exportManagerRef.current.export(
                comprehensiveSettings,
                canvas,
                exportOptions,
                progressCallback || ((progress, message) => {
                    console.log(`Export progress: ${Math.round(progress * 100)}% - ${message}`);
                })
            );
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error.message}`);
        }
    };

    // Legacy export handler for backward compatibility
    const handleExportImage = () => {
        // Get the actual canvas dimensions from the renderer
        const canvas = rendererRef.current?.canvas;
        if (!canvas) {
            console.error('Canvas not available for export');
            return;
        }

        // Use the actual canvas display size for perfect resolution matching
        const canvasRect = canvas.getBoundingClientRect();
        const actualWidth = Math.round(canvasRect.width);
        const actualHeight = Math.round(canvasRect.height);

        console.log('🎯 Exporting with actual display dimensions:', {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            displayWidth: actualWidth,
            displayHeight: actualHeight,
            devicePixelRatio: window.devicePixelRatio
        });

        handleExport({
            format: 'png',
            quality: 1.0,
            width: actualWidth,
            height: actualHeight,
            scale: window.devicePixelRatio || 1, // Use device pixel ratio for crisp exports
            transparent: false
        });
    };

    // State duplication functionality
    const createApplicationSnapshot = async () => {
        try {
            console.log('📸 Creating application snapshot...');

            const canvas = rendererRef.current?.canvas || null;

            // Gather current application state
            const additionalState = {
                performance: {
                    fps: 60, // This would come from actual performance monitoring
                    frameTime: 16.67,
                    memoryUsage: 0,
                    renderTime: 0,
                    particleCount: 0,
                    shapeCount: 0
                },
                animation: {
                    currentTime: performance.now(),
                    isPlaying: true,
                    speed: 1,
                    startTime: performance.now()
                },
                mouse: {
                    position: { x: -1000, y: -1000 },
                    isActive: false
                },
                ui: {
                    showControls,
                    activePanel: null,
                    isLoading: false
                }
            };

            // Create snapshot using the comprehensive settings
            const snapshot = await StateDuplicator.createSnapshot(
                canvas,
                settings,
                additionalState
            );

            console.log('✅ Application snapshot created successfully');
            console.log(StateDuplicator.getSnapshotSummary(snapshot));

            return snapshot;
        } catch (error) {
            console.error('❌ Failed to create application snapshot:', error);
            throw error;
        }
    };

    const restoreFromSnapshot = async (snapshot) => {
        try {
            console.log('🔄 Restoring application from snapshot...');

            const canvas = rendererRef.current?.canvas || null;

            const success = await StateDuplicator.restoreFromSnapshot(
                snapshot,
                canvas,
                setSettings,
                (uiState) => {
                    if (uiState.showControls !== undefined) {
                        setShowControls(uiState.showControls);
                    }
                }
            );

            if (success) {
                console.log('✅ Application restored from snapshot successfully');
            } else {
                throw new Error('Failed to restore application state');
            }

            return success;
        } catch (error) {
            console.error('❌ Failed to restore from snapshot:', error);
            throw error;
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <SacredGridCanvas
                settings={settings}
                ref={rendererRef}
                rendererType={rendererType}
                onExport={handleExportImage}
            />
            
            {showControls &&
                <SacredGridControls
                    settings={settings}
                    setSettings={setSettings}
                    toggleControls={toggleControls}
                    rendererType={rendererType}
                    onImportSettings={handleImportSettings} // Pass down the import handler
                    onExport={handleExport} // Pass down the export handler
                    onCreateSnapshot={createApplicationSnapshot} // Pass down snapshot creation
                    onRestoreSnapshot={restoreFromSnapshot} // Pass down snapshot restoration
                />
            }

            {/* Mandala Designer - shows when Custom Mandala is selected */}
            <MandalaDesigner
                settings={settings}
                setSettings={setSettings}
                isVisible={settings.shapes.primary.type === ShapeType.CUSTOM_MANDALA}
            />
            {!showControls && (
                <button
                    onClick={toggleControls}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        zIndex: 150,
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.transform = 'translateY(0px)';
                    }}
                >
                    Show Controls
                </button>
            )}
        </div>
    );
};

export default SacredGrid;
