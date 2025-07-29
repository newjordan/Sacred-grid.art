import React, { useState } from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import SelectDropdown from '../controls/SelectDropdown';
import ToggleSwitch from '../controls/ToggleSwitch';
import { ShapeType, AnimationMode } from '../../constants/ShapeTypes';
import PolygonEditorControl from '../PolygonEditorControl';

// Test component for debugging toggle issues
const TestToggle = () => {
    const [testValue, setTestValue] = useState(false);
    
    return (
        <div style={{ marginBottom: '10px', padding: '5px', border: '1px solid red' }}>
            <p>Debug Toggle Test:</p>
            <ToggleSwitch
                label="Test Toggle"
                value={testValue}
                onChange={(val) => {
                    console.log("Test toggle changed to:", val);
                    setTestValue(val);
                }}
            />
            <p>Current value: {testValue ? 'true' : 'false'}</p>
        </div>
    );
};

const SecondaryShapeSection = ({ settings, setSettings }) => {
    // Local state for math settings that will be independent of the main settings object
    const [useHarmonicRatio, setUseHarmonicRatio] = useState(false);
    const [harmonicRatio, setHarmonicRatio] = useState("1:1");
    const [useSymmetryGroup, setUseSymmetryGroup] = useState(false);
    const [symmetryOperation, setSymmetryOperation] = useState("rotation");
    
    // Local state for randomizer settings
    const [useRandomizer, setUseRandomizer] = useState(true);
    const [randomizerScale, setRandomizerScale] = useState(0.15);
    const [randomSeedOffset, setRandomSeedOffset] = useState(0);

    // Apply local changes to the global settings when they change
    React.useEffect(() => {
        if (setSettings.setSecondaryUseHarmonicRatios) {
            setSettings.setSecondaryUseHarmonicRatios(useHarmonicRatio);
        }
        if (setSettings.setSecondaryHarmonicRatio) {
            setSettings.setSecondaryHarmonicRatio(harmonicRatio);
        }
        if (setSettings.setSecondaryUseSymmetryGroup) {
            setSettings.setSecondaryUseSymmetryGroup(useSymmetryGroup);
        }
        if (setSettings.setSecondarySymmetryOperation) {
            setSettings.setSecondarySymmetryOperation(symmetryOperation);
        }
        // Apply randomizer settings
        if (setSettings.setUseRandomizer) {
            setSettings.setUseRandomizer(useRandomizer);
        }
        if (setSettings.setRandomizerScale) {
            setSettings.setRandomizerScale(randomizerScale);
        }
        if (setSettings.setRandomSeedOffset) {
            setSettings.setRandomSeedOffset(randomSeedOffset);
        }
    }, [useHarmonicRatio, harmonicRatio, useSymmetryGroup, symmetryOperation, 
        useRandomizer, randomizerScale, randomSeedOffset]);
    
    // Local state for centering toggles
    const [centerSecondaryOffset, setCenterSecondaryOffset] = useState(false);

    const handleCenterSecondaryOffsetToggle = (e) => {
        const checked = e;
        setCenterSecondaryOffset(checked);
        if (checked) {
            // Set secondary position offsets to 0
            setSettings.setSecondaryOffsetX(0);
            setSettings.setSecondaryOffsetY(0);
        }
    };

    // Don't display section if secondary shape is disabled
    if (!settings.shapes.secondary || !settings.shapes.secondary.enabled) {
        return (
            <FieldSet legend="Secondary Shape">
                <ToggleSwitch
                    label="Enable Secondary Shape"
                    value={settings.shapes.secondary?.enabled || false}
                    onChange={setSettings.setSecondaryEnabled}
                />
            </FieldSet>
        );
    }

    const shapeTypeOptions = [
        { value: ShapeType.POLYGON, label: 'Polygon' },
        { value: ShapeType.FLOWER_OF_LIFE, label: 'Flower of Life' },
        { value: ShapeType.MERKABA, label: 'Merkaba' },
        { value: ShapeType.METATRONS_CUBE, label: "Metatron's Cube" },
        { value: ShapeType.TREE_OF_LIFE, label: 'Tree of Life' },
        { value: ShapeType.CIRCLE, label: 'Circle' },
        { value: ShapeType.STAR, label: 'Star' },
        { value: ShapeType.SPIRAL, label: 'Spiral' },
        { value: ShapeType.LISSAJOUS, label: 'Lissajous Curve' },
        { value: ShapeType.HEXAGON, label: 'Hexagon' },
        { value: ShapeType.PENTAGON, label: 'Pentagon' }
    ];
    
    const animationModeOptions = [
        { value: AnimationMode.GROW, label: 'Grow' },
        { value: AnimationMode.PULSE, label: 'Pulse' },
        { value: AnimationMode.ORBIT, label: 'Orbit' },
        { value: AnimationMode.WAVEFORM, label: 'Waveform' },
        { value: AnimationMode.SPIRAL, label: 'Spiral' },
        { value: AnimationMode.HARMONIC, label: 'Harmonic' },
        { value: AnimationMode.SWARM, label: 'Swarm' },
        { value: AnimationMode.BREATHE, label: 'Breathe' }
    ];
    
    return (
        <>
            <FieldSet legend="Secondary Shape">
                <ToggleSwitch
                    label="Enable Secondary Shape"
                    value={settings.shapes.secondary.enabled}
                    onChange={setSettings.setSecondaryEnabled}
                />
            </FieldSet>

            {settings.shapes.secondary.enabled && (
                <>
                    <FieldSet legend="Secondary Shape Type">
                        <SelectDropdown
                            label="Shape Type"
                            value={settings.shapes.secondary.type}
                            onChange={(e) => setSettings.setSecondaryType(e.target.value)}
                            options={shapeTypeOptions}
                        />
                        <RangeSlider
                            label="Rotation (degrees)"
                            min={0}
                            max={360}
                            value={settings.shapes.secondary.rotation}
                            onChange={(e) => setSettings.setSecondaryRotation(parseInt(e.target.value))}
                        />
                        {/* Shape-specific controls */}
                        {settings.shapes.secondary.type === ShapeType.POLYGON && (
                            <>
                                <RangeSlider
                                    label="Vertices"
                                    min={3}
                                    max={66}
                                    value={settings.shapes.secondary.vertices}
                                    onChange={(e) => setSettings.setSecondaryVertices(parseInt(e.target.value))}
                                />
                            </>
                        )}
                        {settings.shapes.secondary.type === ShapeType.STAR && (
                            <>
                                <RangeSlider
                                    label="Points"
                                    min={3}
                                    max={16}
                                    value={settings.shapes.secondary.vertices || 5}
                                    onChange={(e) => setSettings.setSecondaryVertices(parseInt(e.target.value))}
                                />
                                <RangeSlider
                                    label="Inner Radius Ratio"
                                    min={0.1}
                                    max={0.9}
                                    step={0.05}
                                    value={settings.shapes.secondary.innerRadiusRatio || 0.4}
                                    onChange={(e) => {
                                        if (setSettings.setSecondaryInnerRadiusRatio) {
                                            setSettings.setSecondaryInnerRadiusRatio(parseFloat(e.target.value));
                                        }
                                    }}
                                />
                            </>
                        )}
                        {settings.shapes.secondary.type === ShapeType.SPIRAL && (
                            <>
                                <RangeSlider
                                    label="Turns"
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    value={settings.shapes.secondary.turns || 3}
                                    onChange={(e) => {
                                        if (setSettings.setSecondaryTurns) {
                                            setSettings.setSecondaryTurns(parseFloat(e.target.value));
                                        }
                                    }}
                                />
                                <RangeSlider
                                    label="Decay Rate"
                                    min={0.05}
                                    max={0.5}
                                    step={0.01}
                                    value={settings.shapes.secondary.decay || 0.15}
                                    onChange={(e) => {
                                        if (setSettings.setSecondaryDecay) {
                                            setSettings.setSecondaryDecay(parseFloat(e.target.value));
                                        }
                                    }}
                                />
                            </>
                        )}
                        {settings.shapes.secondary.type === ShapeType.LISSAJOUS && (
                            <>
                                <RangeSlider
                                    label="A Parameter"
                                    min={1}
                                    max={12}
                                    step={1}
                                    value={settings.shapes.secondary.paramA || 3}
                                    onChange={(e) => {
                                        if (setSettings.setSecondaryParamA) {
                                            setSettings.setSecondaryParamA(parseInt(e.target.value));
                                        }
                                    }}
                                />
                                <RangeSlider
                                    label="B Parameter"
                                    min={1}
                                    max={12}
                                    step={1}
                                    value={settings.shapes.secondary.paramB || 2}
                                    onChange={(e) => {
                                        if (setSettings.setSecondaryParamB) {
                                            setSettings.setSecondaryParamB(parseInt(e.target.value));
                                        }
                                    }}
                                />
                                <RangeSlider
                                    label="Delta (Phase Shift)"
                                    min={0}
                                    max={6.28}
                                    step={0.1}
                                    value={settings.shapes.secondary.paramDelta || 1.57}
                                    onChange={(e) => {
                                        if (setSettings.setSecondaryParamDelta) {
                                            setSettings.setSecondaryParamDelta(parseFloat(e.target.value));
                                        }
                                    }}
                                />
                            </>
                        )}
                    </FieldSet>

                    <FieldSet legend="Secondary Shape Appearance">
                        <RangeSlider
                            label="Size"
                            min={50}
                            max={777}
                            value={settings.shapes.secondary.size}
                            onChange={(e) => setSettings.setSecondarySize(parseInt(e.target.value))}
                        />
                        <RangeSlider
                            label="Opacity"
                            min={0}
                            max={1}
                            step={0.01}
                            value={settings.shapes.secondary.opacity}
                            onChange={(e) => setSettings.setSecondaryOpacity(parseFloat(e.target.value))}
                        />
                        <RangeSlider
                            label="Thickness"
                            min={1.0}
                            max={12}
                            step={0.1}
                            value={settings.shapes.secondary.thickness}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setSettings.setSecondaryThickness(value);
                            }}
                        />
                        <div className="line-factory-toggle-container">
                            <ToggleSwitch
                                label="Use Line Factory Effects"
                                value={settings.shapes.secondary.useLineFactory}
                                onChange={(value) => {
                                    if (setSettings.setUseSecondaryLineFactory) {
                                        setSettings.setUseSecondaryLineFactory(value);
                                    }
                                }}
                            />
                            {settings.rendererType === 'webgl' && settings.shapes.secondary.useLineFactory && (
                                <div className="info-message" style={{color: '#0080ff', fontSize: '0.8em', marginTop: '5px'}}>
                                    ℹ️ Using triangle strip-based rendering for Line Factory in WebGL
                                </div>
                            )}
                        </div>
                        <RangeSlider
                            label="Position X"
                            min={-200}
                            max={200}
                            value={settings.shapes.secondary.position.offsetX}
                            onChange={(e) => setSettings.setSecondaryOffsetX(parseInt(e.target.value))}
                            disabled={centerSecondaryOffset}
                        />
                        <RangeSlider
                            label="Position Y"
                            min={-200}
                            max={200}
                            value={settings.shapes.secondary.position.offsetY}
                            onChange={(e) => setSettings.setSecondaryOffsetY(parseInt(e.target.value))}
                            disabled={centerSecondaryOffset}
                        />
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={centerSecondaryOffset}
                                    onChange={(e) => handleCenterSecondaryOffsetToggle(e.target.checked)}
                                />
                                Center Shape Position
                            </label>
                        </div>
                    </FieldSet>

                    <FieldSet legend="Secondary Shape Fractal">
                        <RangeSlider
                            label="Fractal Depth"
                            min={1}
                            max={6}
                            value={settings.shapes.secondary.fractal.depth}
                            onChange={(e) => setSettings.setSecondaryFractalDepth(parseInt(e.target.value))}
                        />
                        <RangeSlider
                            label="Fractal Scale"
                            min={0.1}
                            max={1}
                            step={0.1}
                            value={settings.shapes.secondary.fractal.scale}
                            onChange={(e) => setSettings.setSecondaryFractalScale(parseFloat(e.target.value))}
                        />
                        <RangeSlider
                            label="Thickness Falloff"
                            min={0.1}
                            max={1}
                            step={0.01}
                            value={settings.shapes.secondary.fractal.thicknessFalloff}
                            onChange={(e) => setSettings.setSecondaryFractalThicknessFalloff(parseFloat(e.target.value))}
                        />
                        <RangeSlider
                            label="Child Count"
                            min={2}
                            max={12}
                            value={settings.shapes.secondary.fractal.childCount}
                            onChange={(e) => setSettings.setSecondaryFractalChildCount(parseInt(e.target.value))}
                        />
                        <ToggleSwitch
                            label="Sacred Geometric Positioning"
                            value={settings.shapes.secondary.fractal.sacredPositioning}
                            onChange={setSettings.setSecondaryFractalSacredPositioning}
                            tooltip="Position fractals according to sacred geometry principles"
                        />
                        <RangeSlider
                            label="Sacred Pattern Intensity"
                            min={0}
                            max={1}
                            step={0.01}
                            value={settings.shapes.secondary.fractal.sacredIntensity}
                            onChange={(e) => setSettings.setSecondaryFractalSacredIntensity(parseFloat(e.target.value))}
                            tooltip="Controls the strength of the sacred geometric positioning"
                        />
                    </FieldSet>

                    <FieldSet legend="Secondary Shape Animation">
                        <SelectDropdown
                            label="Animation Mode"
                            value={settings.shapes.secondary.animation.mode}
                            onChange={(e) => setSettings.setSecondaryAnimationMode(e.target.value)}
                            options={animationModeOptions}
                        />
                        <ToggleSwitch
                            label="Reverse Animation"
                            value={settings.shapes.secondary.animation.reverse}
                            onChange={setSettings.setSecondaryAnimationReverse}
                        />
                        <RangeSlider
                            label="Animation Speed"
                            min={0.0001}
                            max={0.005}
                            step={0.0001}
                            value={settings.shapes.secondary.animation.speed}
                            onChange={(e) => setSettings.setSecondaryAnimationSpeed(parseFloat(e.target.value))}
                        />
                        <RangeSlider
                            label="Breathing Intensity"
                            min={0}
                            max={1}
                            step={0.01}
                            value={settings.shapes.secondary.animation.intensity}
                            onChange={(e) => setSettings.setSecondaryAnimationIntensity(parseFloat(e.target.value))}
                        />
                        <RangeSlider
                            label="Fade In Fraction"
                            min={0}
                            max={1}
                            step={0.01}
                            value={settings.shapes.secondary.animation.fadeIn}
                            onChange={(e) => setSettings.setSecondaryAnimationFadeIn(parseFloat(e.target.value))}
                        />
                        <RangeSlider
                            label="Fade Out Fraction"
                            min={0}
                            max={1}
                            step={0.01}
                            value={settings.shapes.secondary.animation.fadeOut}
                            onChange={(e) => setSettings.setSecondaryAnimationFadeOut(parseFloat(e.target.value))}
                        />
                        <ToggleSwitch
                            label="Variable Timing"
                            value={settings.shapes.secondary.animation.variableTiming}
                            onChange={setSettings.setSecondaryVariableTiming}
                            tooltip="Adds natural variation to animation timing"
                        />
                        <RangeSlider
                            label="Stagger Delay"
                            min={0}
                            max={1000}
                            step={10}
                            value={settings.shapes.secondary.animation.staggerDelay}
                            onChange={(e) => setSettings.setSecondaryStaggerDelay(parseInt(e.target.value))}
                            tooltip="Creates staggered initialization for a more organic feel"
                        />
                    </FieldSet>

                    <FieldSet legend="Secondary Shape Stacking">
                        <ToggleSwitch
                            label="Enable Stacking"
                            value={settings.shapes.secondary.stacking.enabled}
                            onChange={setSettings.setSecondaryStackingEnabled}
                        />
                        <RangeSlider
                            label="Stack Count"
                            min={1}
                            max={10}
                            value={settings.shapes.secondary.stacking.count}
                            onChange={(e) => setSettings.setSecondaryStackingCount(parseInt(e.target.value))}
                        />
                        <RangeSlider
                            label="Stack Time Offset"
                            min={-5000}
                            max={5000}
                            value={settings.shapes.secondary.stacking.timeOffset}
                            onChange={(e) => setSettings.setSecondaryStackingTimeOffset(parseInt(e.target.value))}
                        />
                        <RangeSlider
                            label="Stack Interval"
                            min={0}
                            max={2000}
                            value={settings.shapes.secondary.stacking.interval}
                            onChange={(e) => setSettings.setSecondaryStackingInterval(parseInt(e.target.value))}
                        />
                    </FieldSet>
                    
                    <FieldSet legend="Mathematical Relationships">
                        <ToggleSwitch
                            label="Use Harmonic Ratios"
                            value={useHarmonicRatio}
                            onChange={(value) => {
                                console.log("Setting harmonic ratio to:", value);
                                setUseHarmonicRatio(value);
                            }}
                        />
                        {useHarmonicRatio && (
                            <SelectDropdown
                                label="Harmonic Ratio"
                                value={harmonicRatio}
                                onChange={(e) => {
                                    setHarmonicRatio(e.target.value);
                                }}
                                options={[
                                    { value: "1:1", label: "1:1 (Unison)" },
                                    { value: "1:2", label: "1:2 (Octave)" },
                                    { value: "2:3", label: "2:3 (Perfect Fifth)" },
                                    { value: "3:4", label: "3:4 (Perfect Fourth)" },
                                    { value: "3:5", label: "3:5 (Major Sixth)" },
                                    { value: "4:5", label: "4:5 (Major Third)" },
                                    { value: "5:8", label: "5:8 (Minor Sixth)" },
                                    { value: "1:1.618", label: "1:φ (Golden Ratio)" }
                                ]}
                            />
                        )}
                        
                        <ToggleSwitch
                            label="Use Symmetry Group"
                            value={useSymmetryGroup}
                            onChange={(value) => {
                                console.log("Setting symmetry group to:", value);
                                setUseSymmetryGroup(value);
                            }}
                        />
                        {useSymmetryGroup && (
                            <SelectDropdown
                                label="Symmetry Operation"
                                value={symmetryOperation}
                                onChange={(e) => {
                                    setSymmetryOperation(e.target.value);
                                }}
                                options={[
                                    { value: "rotation", label: "Rotation (Cn)" },
                                    { value: "reflection", label: "Reflection" },
                                    { value: "glideReflection", label: "Glide Reflection" },
                                    { value: "rotation180", label: "180° Rotation" },
                                    { value: "dihedral", label: "Dihedral (Dn)" }
                                ]}
                            />
                        )}
                        
                        <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                            <ToggleSwitch
                                label="Use Position Randomizer"
                                value={useRandomizer}
                                onChange={(value) => {
                                    setUseRandomizer(value);
                                }}
                            />
                            {useRandomizer && (
                                <>
                                    <RangeSlider
                                        label="Randomizer Scale"
                                        min={0}
                                        max={0.5}
                                        step={0.01}
                                        value={randomizerScale}
                                        onChange={(e) => setRandomizerScale(parseFloat(e.target.value))}
                                    />
                                    <RangeSlider
                                        label="Random Seed"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={randomSeedOffset}
                                        onChange={(e) => setRandomSeedOffset(parseInt(e.target.value))}
                                    />
                                </>
                            )}
                        </div>
                    </FieldSet>
                </>
            )}
        </>
    );
};

export default SecondaryShapeSection;