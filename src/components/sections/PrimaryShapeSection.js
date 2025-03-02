import React, { useState } from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import SelectDropdown from '../controls/SelectDropdown';
import ToggleSwitch from '../controls/ToggleSwitch';
import { ShapeType, AnimationMode } from '../../constants/ShapeTypes';
import PolygonEditorControl from '../PolygonEditorControl';

const PrimaryShapeSection = ({ settings, setSettings }) => {
    // Local state for centering toggles
    const [centerPrimaryOffset, setCenterPrimaryOffset] = useState(false);

    const handleCenterPrimaryOffsetToggle = (e) => {
        const checked = e;
        setCenterPrimaryOffset(checked);
        if (checked) {
            // Set primary position offsets to 0
            setSettings.setPrimaryOffsetX(0);
            setSettings.setPrimaryOffsetY(0);
        }
    };

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
            <FieldSet legend="Primary Shape Type">
                <SelectDropdown
                    label="Shape Type"
                    value={settings.shapes.primary.type}
                    onChange={(e) => setSettings.setPrimaryType(e.target.value)}
                    options={shapeTypeOptions}
                />
                <RangeSlider
                    label="Rotation (degrees)"
                    min={0}
                    max={360}
                    value={settings.shapes.primary.rotation}
                    onChange={(e) => setSettings.setPrimaryRotation(parseInt(e.target.value))}
                />
                {/* Shape-specific controls */}
                {settings.shapes.primary.type === ShapeType.POLYGON && (
                    <>
                        <RangeSlider
                            label="Vertices"
                            min={3}
                            max={66}
                            value={settings.shapes.primary.vertices}
                            onChange={(e) => setSettings.setPrimaryVertices(parseInt(e.target.value))}
                            disabled={settings.shapes.primary.useCustomVertices}
                        />
                        <PolygonEditorControl 
                            settings={settings} 
                            setSettings={setSettings}
                        />
                    </>
                )}
                {settings.shapes.primary.type === ShapeType.STAR && (
                    <>
                        <RangeSlider
                            label="Points"
                            min={3}
                            max={16}
                            value={settings.shapes.primary.vertices || 5}
                            onChange={(e) => setSettings.setPrimaryVertices(parseInt(e.target.value))}
                        />
                        <RangeSlider
                            label="Inner Radius Ratio"
                            min={0.1}
                            max={0.9}
                            step={0.05}
                            value={settings.shapes.primary.innerRadiusRatio || 0.4}
                            onChange={(e) => {
                                // This might need a new setter if you want to persist this value
                                if (setSettings.setPrimaryInnerRadiusRatio) {
                                    setSettings.setPrimaryInnerRadiusRatio(parseFloat(e.target.value));
                                }
                            }}
                        />
                    </>
                )}
                {settings.shapes.primary.type === ShapeType.SPIRAL && (
                    <>
                        <RangeSlider
                            label="Turns"
                            min={1}
                            max={10}
                            step={0.5}
                            value={settings.shapes.primary.turns || 3}
                            onChange={(e) => {
                                // This might need a new setter if you want to persist this value
                                if (setSettings.setPrimaryTurns) {
                                    setSettings.setPrimaryTurns(parseFloat(e.target.value));
                                }
                            }}
                        />
                        <RangeSlider
                            label="Decay Rate"
                            min={0.05}
                            max={0.5}
                            step={0.01}
                            value={settings.shapes.primary.decay || 0.15}
                            onChange={(e) => {
                                // This might need a new setter if you want to persist this value
                                if (setSettings.setPrimaryDecay) {
                                    setSettings.setPrimaryDecay(parseFloat(e.target.value));
                                }
                            }}
                        />
                    </>
                )}
                {settings.shapes.primary.type === ShapeType.LISSAJOUS && (
                    <>
                        <RangeSlider
                            label="A Parameter"
                            min={1}
                            max={12}
                            step={1}
                            value={settings.shapes.primary.paramA || 3}
                            onChange={(e) => {
                                // This might need a new setter if you want to persist this value
                                if (setSettings.setPrimaryParamA) {
                                    setSettings.setPrimaryParamA(parseInt(e.target.value));
                                }
                            }}
                        />
                        <RangeSlider
                            label="B Parameter"
                            min={1}
                            max={12}
                            step={1}
                            value={settings.shapes.primary.paramB || 2}
                            onChange={(e) => {
                                // This might need a new setter if you want to persist this value
                                if (setSettings.setPrimaryParamB) {
                                    setSettings.setPrimaryParamB(parseInt(e.target.value));
                                }
                            }}
                        />
                        <RangeSlider
                            label="Delta (Phase Shift)"
                            min={0}
                            max={6.28}
                            step={0.1}
                            value={settings.shapes.primary.paramDelta || 1.57}
                            onChange={(e) => {
                                // This might need a new setter if you want to persist this value
                                if (setSettings.setPrimaryParamDelta) {
                                    setSettings.setPrimaryParamDelta(parseFloat(e.target.value));
                                }
                            }}
                        />
                    </>
                )}
                {settings.shapes.primary.type === ShapeType.HEXAGON && (
                    <>
                        <RangeSlider
                            label="Rotation (degrees)"
                            min={0}
                            max={360}
                            value={settings.shapes.primary.rotation}
                            onChange={(e) => setSettings.setPrimaryRotation(parseInt(e.target.value))}
                        />
                    </>
                )}
                {settings.shapes.primary.type === ShapeType.PENTAGON && (
                    <>
                        <RangeSlider
                            label="Rotation (degrees)"
                            min={0}
                            max={360}
                            value={settings.shapes.primary.rotation}
                            onChange={(e) => setSettings.setPrimaryRotation(parseInt(e.target.value))}
                        />
                    </>
                )}
            </FieldSet>

            <FieldSet legend="Primary Shape Appearance">
                <RangeSlider
                    label="Size"
                    min={50}
                    max={777}
                    value={settings.shapes.primary.size}
                    onChange={(e) => setSettings.setPrimarySize(parseInt(e.target.value))}
                />
                <RangeSlider
                    label="Opacity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.shapes.primary.opacity}
                    onChange={(e) => setSettings.setPrimaryOpacity(parseFloat(e.target.value))}
                />
                <RangeSlider
                    label="Thickness"
                    min={1.0}
                    max={12}
                    step={0.1}
                    value={settings.shapes.primary.thickness}
                    onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        console.log("Setting primary thickness to:", value);
                        setSettings.setPrimaryThickness(value);
                    }}
                />
                <div className="line-factory-toggle-container">
                    <ToggleSwitch
                        label="Use Line Factory Effects"
                        value={settings.shapes.primary.useLineFactory}
                        onChange={(value) => {
                            console.log("TOGGLING LINE FACTORY", value);
                            if (setSettings.setUsePrimaryLineFactory) {
                                setSettings.setUsePrimaryLineFactory(value);
                            } else {
                                console.error("setUsePrimaryLineFactory is not defined!");
                            }
                        }}
                    />
                    {settings.rendererType === 'webgl' && settings.shapes.primary.useLineFactory && (
                        <div className="info-message" style={{color: '#0080ff', fontSize: '0.8em', marginTop: '5px'}}>
                            ℹ️ Using triangle strip-based rendering for Line Factory in WebGL
                        </div>
                    )}
                </div>
                <RangeSlider
                    label="Position X"
                    min={-200}
                    max={200}
                    value={settings.shapes.primary.position.offsetX}
                    onChange={(e) => setSettings.setPrimaryOffsetX(parseInt(e.target.value))}
                    disabled={centerPrimaryOffset}
                />
                <RangeSlider
                    label="Position Y"
                    min={-200}
                    max={200}
                    value={settings.shapes.primary.position.offsetY}
                    onChange={(e) => setSettings.setPrimaryOffsetY(parseInt(e.target.value))}
                    disabled={centerPrimaryOffset}
                />
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={centerPrimaryOffset}
                            onChange={(e) => handleCenterPrimaryOffsetToggle(e.target.checked)}
                        />
                        Center Shape Position
                    </label>
                </div>
            </FieldSet>

            <FieldSet legend="Primary Shape Fractal">
                <RangeSlider
                    label="Fractal Depth"
                    min={1}
                    max={6}
                    value={settings.shapes.primary.fractal.depth}
                    onChange={(e) => setSettings.setPrimaryFractalDepth(parseInt(e.target.value))}
                />
                <RangeSlider
                    label="Fractal Scale"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={settings.shapes.primary.fractal.scale}
                    onChange={(e) => setSettings.setPrimaryFractalScale(parseFloat(e.target.value))}
                />
                <RangeSlider
                    label="Thickness Falloff"
                    min={0.1}
                    max={1}
                    step={0.01}
                    value={settings.shapes.primary.fractal.thicknessFalloff}
                    onChange={(e) => setSettings.setPrimaryFractalThicknessFalloff(parseFloat(e.target.value))}
                />
                <RangeSlider
                    label="Child Count"
                    min={2}
                    max={12}
                    value={settings.shapes.primary.fractal.childCount}
                    onChange={(e) => setSettings.setPrimaryFractalChildCount(parseInt(e.target.value))}
                />
            </FieldSet>

            <FieldSet legend="Primary Shape Animation">
                <SelectDropdown
                    label="Animation Mode"
                    value={settings.shapes.primary.animation.mode}
                    onChange={(e) => setSettings.setPrimaryAnimationMode(e.target.value)}
                    options={animationModeOptions}
                />
                <ToggleSwitch
                    label="Reverse Animation"
                    value={settings.shapes.primary.animation.reverse}
                    onChange={setSettings.setPrimaryAnimationReverse}
                />
                <RangeSlider
                    label="Animation Speed"
                    min={0.0001}
                    max={0.005}
                    step={0.0001}
                    value={settings.shapes.primary.animation.speed}
                    onChange={(e) => setSettings.setPrimaryAnimationSpeed(parseFloat(e.target.value))}
                />
                <RangeSlider
                    label="Breathing Intensity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.shapes.primary.animation.intensity}
                    onChange={(e) => setSettings.setPrimaryAnimationIntensity(parseFloat(e.target.value))}
                />
                <RangeSlider
                    label="Fade In Fraction"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.shapes.primary.animation.fadeIn}
                    onChange={(e) => setSettings.setPrimaryAnimationFadeIn(parseFloat(e.target.value))}
                />
                <RangeSlider
                    label="Fade Out Fraction"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.shapes.primary.animation.fadeOut}
                    onChange={(e) => setSettings.setPrimaryAnimationFadeOut(parseFloat(e.target.value))}
                />
            </FieldSet>

            <FieldSet legend="Primary Shape Stacking">
                <ToggleSwitch
                    label="Enable Stacking"
                    value={settings.shapes.primary.stacking.enabled}
                    onChange={setSettings.setPrimaryStackingEnabled}
                />
                <RangeSlider
                    label="Stack Count"
                    min={1}
                    max={10}
                    value={settings.shapes.primary.stacking.count}
                    onChange={(e) => setSettings.setPrimaryStackingCount(parseInt(e.target.value))}
                />
                <RangeSlider
                    label="Stack Time Offset"
                    min={-5000}
                    max={5000}
                    value={settings.shapes.primary.stacking.timeOffset}
                    onChange={(e) => setSettings.setPrimaryStackingTimeOffset(parseInt(e.target.value))}
                />
                <RangeSlider
                    label="Stack Interval"
                    min={0}
                    max={2000}
                    value={settings.shapes.primary.stacking.interval}
                    onChange={(e) => setSettings.setPrimaryStackingInterval(parseInt(e.target.value))}
                />
            </FieldSet>
        </>
    );
};

export default PrimaryShapeSection;