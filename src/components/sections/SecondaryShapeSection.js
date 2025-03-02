import React, { useState } from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import SelectDropdown from '../controls/SelectDropdown';
import ToggleSwitch from '../controls/ToggleSwitch';
import { ShapeType, AnimationMode } from '../../constants/ShapeTypes';
import PolygonEditorControl from '../PolygonEditorControl';

const SecondaryShapeSection = ({ settings, setSettings }) => {
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
        { value: ShapeType.CIRCLE, label: 'Circle' },
        { value: ShapeType.STAR, label: 'Star' },
        { value: ShapeType.SPIRAL, label: 'Spiral' },
        { value: ShapeType.LISSAJOUS, label: 'Lissajous Curve' },
        { value: ShapeType.HEXAGON, label: 'Hexagon' },
        { value: ShapeType.PENTAGON, label: 'Pentagon' }
    ];
    
    const animationModeOptions = [
        { value: AnimationMode.GROW, label: 'Grow' },
        { value: AnimationMode.PULSE, label: 'Pulse' }
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
                </>
            )}
        </>
    );
};

export default SecondaryShapeSection;