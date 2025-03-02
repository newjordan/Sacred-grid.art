// src/components/SacredGrid.js
// Main component for Canvas2D-only version
import React, { useState, useRef, useEffect } from 'react';
import SacredGridCanvas from './components/SacredGridCanvas';
import SacredGridControls from './components/SacredGridControls';
import { RendererType } from './renderers/RendererFactory';
import { ShapeType, AnimationMode, LineStyleType, TaperType, SineWaveType } from './constants/ShapeTypes';

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

    // Canvas2D is the only renderer in this version
    const rendererType = RendererType.CANVAS_2D;

    // Grid settings
    const [gridSize, setGridSize] = useState(6);
    const [gridSpacing, setGridSpacing] = useState(140);
    const [baseDotSize, setBaseDotSize] = useState(2);
    const [connectionOpacity, setConnectionOpacity] = useState(0.15);
    const [noiseIntensity, setNoiseIntensity] = useState(1);
    const [lineWidthMultiplier, setLineWidthMultiplier] = useState(1);
    const [gridBreathingSpeed, setGridBreathingSpeed] = useState(0.0008);
    const [gridBreathingIntensity, setGridBreathingIntensity] = useState(0.2);
    
    // XY Grid settings
    const [showXYGrid, setShowXYGrid] = useState(true);
    const [xyGridSize, setXYGridSize] = useState(20);
    const [xyGridSpacing, setXYGridSpacing] = useState(40);
    const [xyGridOpacity, setXYGridOpacity] = useState(0.1);
    const [xyGridLineWidth, setXYGridLineWidth] = useState(0.5);
    const [xyGridColor, setXYGridColor] = useState('#444444');
    const [showXYGridLabels, setShowXYGridLabels] = useState(false);
    
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
    const [primaryFractalScale, setPrimaryFractalScale] = useState(0.5);
    const [primaryFractalThicknessFalloff, setPrimaryFractalThicknessFalloff] = useState(0.8);
    const [primaryFractalChildCount, setPrimaryFractalChildCount] = useState(3);
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

    // Primary stacking settings
    const [primaryStackingEnabled, setPrimaryStackingEnabled] = useState(true);
    const [primaryStackingCount, setPrimaryStackingCount] = useState(3);
    const [primaryStackingTimeOffset, setPrimaryStackingTimeOffset] = useState(-3000);
    const [primaryStackingInterval, setPrimaryStackingInterval] = useState(1000);

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
                fractal: {
                    depth: primaryFractalDepth,
                    scale: primaryFractalScale,
                    thicknessFalloff: primaryFractalThicknessFalloff,
                    childCount: primaryFractalChildCount,
                },
                animation: {
                    mode: primaryAnimationMode,
                    reverse: primaryAnimationReverse,
                    speed: primaryAnimationSpeed,
                    intensity: primaryAnimationIntensity,
                    fadeIn: primaryAnimationFadeIn,
                    fadeOut: primaryAnimationFadeOut,
                },
                stacking: {
                    enabled: primaryStackingEnabled,
                    count: primaryStackingCount,
                    timeOffset: primaryStackingTimeOffset,
                    interval: primaryStackingInterval,
                },
            }
        },
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
        setPrimaryAnimationMode,
        setPrimaryAnimationReverse,
        setPrimaryAnimationSpeed,
        setPrimaryAnimationIntensity,
        setPrimaryAnimationFadeIn,
        setPrimaryAnimationFadeOut,
        setPrimaryStackingEnabled,
        setPrimaryStackingCount,
        setPrimaryStackingTimeOffset,
        setPrimaryStackingInterval,
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <SacredGridCanvas 
                settings={settings} 
                ref={rendererRef}
                rendererType={rendererType}
                showControls={showControls}
                toggleControls={toggleControls}
            />
            
            {showControls && 
                <SacredGridControls 
                    settings={settings}
                    setSettings={setSettings}
                    toggleControls={toggleControls}
                    rendererType={rendererType}
                />
            }
            
            {!showControls && (
                <button
                    onClick={toggleControls}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        zIndex: 150,
                    }}
                >
                    Show Controls
                </button>
            )}
        </div>
    );
};

export default SacredGrid;