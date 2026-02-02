import React, { useState } from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import SelectDropdown from '../controls/SelectDropdown';
import ToggleSwitch from '../controls/ToggleSwitch';
import ColorPicker from '../controls/ColorPicker';
import LinePreview from '../LinePreview';
import { LineStyleType, TaperType, SineWaveType, ModulationType } from '../../constants/ShapeTypes';

const LineFactorySection = ({ settings, setSettings }) => {
    // Check for WebGL renderer to show warnings
    const isWebGL = settings.rendererType === 'webgl';
    
    // WebGL mode uses improved triangle strip-based rendering
    const lineStyleOptions = Object.entries(LineStyleType).map(([key, value]) => ({
        value,
        label: key.toLowerCase()
    }));
    
    const taperTypeOptions = Object.entries(TaperType).map(([key, value]) => ({
        value,
        label: key.toLowerCase()
    }));
    
    const sineWaveOptions = Object.entries(SineWaveType).map(([key, value]) => ({
        value,
        label: key.toLowerCase()
    }));
    
    return (
        <>
            <LinePreview settings={settings} />

            {isWebGL && (
                <div style={{
                    backgroundColor: 'rgba(0, 128, 255, 0.2)',
                    border: '1px solid #0080ff',
                    borderRadius: '5px',
                    padding: '10px',
                    marginBottom: '15px',
                    fontSize: '0.9em'
                }}>
                    ℹ️ <strong>WebGL Mode:</strong> Using improved triangle strip-based rendering for line effects.
                    Some advanced effects may render differently than in Canvas2D mode.
                </div>
            )}

            <FieldSet legend="Basic Line Properties">
                <ColorPicker
                    label="Line Color"
                    value={settings.colors.lineColor}
                    onChange={(e) => setSettings.setLineColor(e.target.value)}
                />
                
                <SelectDropdown
                    label="Line Style"
                    value={settings.lineFactory.style}
                    onChange={(e) => setSettings.setLineStyle(e.target.value)}
                    options={lineStyleOptions}
                />
                
                {settings.lineFactory.style === LineStyleType.DASHED && (
                    <>
                        <div>
                            <label>Dash Pattern: </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={settings.lineFactory.dash.pattern[0]}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    const newPattern = [value, settings.lineFactory.dash.pattern[1]];
                                    setSettings.setDashPattern(newPattern);
                                }}
                                style={{ width: '50px', background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
                            />
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={settings.lineFactory.dash.pattern[1]}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    const newPattern = [settings.lineFactory.dash.pattern[0], value];
                                    setSettings.setDashPattern(newPattern);
                                }}
                                style={{ width: '50px', background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
                            />
                            <span>{`[${settings.lineFactory.dash.pattern.join(', ')}]`}</span>
                        </div>
                        
                        <RangeSlider
                            label="Dash Offset"
                            min={0}
                            max={20}
                            value={settings.lineFactory.dash.offset}
                            onChange={(e) => setSettings.setDashOffset(parseInt(e.target.value))}
                        />
                    </>
                )}
                
                {settings.lineFactory.style === LineStyleType.COMPLEX && (
                    <>
                        <div>
                            <label>Complex Pattern: </label>
                            <input
                                type="text"
                                value={settings.lineFactory.complex?.pattern.join(',')}
                                onChange={(e) => {
                                    try {
                                        const pattern = e.target.value.split(',').map(val => parseInt(val.trim()));
                                        const updatedComplex = { 
                                            ...settings.lineFactory.complex,
                                            pattern 
                                        };
                                        setSettings.setComplexSettings(updatedComplex);
                                    } catch (err) {
                                        // Invalid pattern, do nothing
                                    }
                                }}
                                style={{ width: '200px', background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
                            />
                            <p style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                Enter comma-separated values (e.g. 5,2,2,2,10,2)
                            </p>
                        </div>
                    </>
                )}
            </FieldSet>

            <FieldSet legend="Taper Effects">
                <SelectDropdown
                    label="Taper Type"
                    value={settings.lineFactory.taper.type}
                    onChange={(e) => setSettings.setLineTaper(e.target.value)}
                    options={taperTypeOptions}
                />
                
                {settings.lineFactory.taper.type !== TaperType.NONE && (
                    <>
                        <RangeSlider
                            label="Taper Start Width"
                            min={0}
                            max={1}
                            step={0.01}
                            value={settings.lineFactory.taper.startWidth}
                            onChange={(e) => setSettings.setTaperStart(parseFloat(e.target.value))}
                            disabled={settings.lineFactory.taper.type === TaperType.END}
                        />
                        <RangeSlider
                            label="Taper End Width"
                            min={0}
                            max={1}
                            step={0.01}
                            value={settings.lineFactory.taper.endWidth}
                            onChange={(e) => setSettings.setTaperEnd(parseFloat(e.target.value))}
                            disabled={settings.lineFactory.taper.type === TaperType.START}
                        />
                    </>
                )}
            </FieldSet>

            <FieldSet legend="Glow Effects">
                <RangeSlider
                    label="Glow Intensity"
                    min={0}
                    max={20}
                    value={settings.lineFactory.glow.intensity}
                    onChange={(e) => setSettings.setLineGlow(parseFloat(e.target.value))}
                />
                <ColorPicker
                    label="Glow Color"
                    value={settings.lineFactory.glow.color}
                    onChange={(e) => setSettings.setLineGlowColor(e.target.value)}
                />
            </FieldSet>

            <FieldSet legend="Outline Effects">
                <ToggleSwitch
                    label="Enable Outline"
                    value={settings.lineFactory.outline.enabled}
                    onChange={setSettings.setLineOutline}
                />
                
                {settings.lineFactory.outline.enabled && (
                    <>
                        <ColorPicker
                            label="Outline Color"
                            value={settings.lineFactory.outline.color}
                            onChange={(e) => setSettings.setLineOutlineColor(e.target.value)}
                        />
                        <RangeSlider
                            label="Outline Width"
                            min={0.1}
                            max={5}
                            step={0.1}
                            value={settings.lineFactory.outline.width}
                            onChange={(e) => setSettings.setLineOutlineWidth(parseFloat(e.target.value))}
                        />
                    </>
                )}
            </FieldSet>

            <FieldSet legend="Sine Wave Effects">
                <SelectDropdown
                    label="Wave Type"
                    value={settings.lineFactory.sineWave.type}
                    onChange={(e) => setSettings.setSineWaveType(e.target.value)}
                    options={sineWaveOptions}
                />
                
                {settings.lineFactory.sineWave.type !== SineWaveType.NONE && settings.lineFactory.sineWave.type !== 'compound' && (
                    <>
                        <RangeSlider
                            label="Amplitude"
                            min={0}
                            max={336}
                            value={settings.lineFactory.sineWave.amplitude}
                            onChange={(e) => setSettings.setSineAmplitude(parseFloat(e.target.value))}
                        />
                        <RangeSlider
                            label="Frequency"
                            min={0.01}
                            max={1}
                            step={0.01}
                            value={settings.lineFactory.sineWave.frequency}
                            onChange={(e) => setSettings.setSineFrequency(parseFloat(e.target.value))}
                        />
                        <RangeSlider
                            label="Phase"
                            min={0}
                            max={6.28}
                            step={0.01}
                            value={settings.lineFactory.sineWave.phase}
                            onChange={(e) => setSettings.setSinePhase(parseFloat(e.target.value))}
                        />
                        <ToggleSwitch
                            label="Animate Wave"
                            value={settings.lineFactory.sineWave.animated}
                            onChange={setSettings.setSineWaveAnimated}
                        />
                        
                        {settings.lineFactory.sineWave.animated && (
                            <RangeSlider
                                label="Animation Speed"
                                min={0.01}
                                max={2}
                                step={0.01}
                                value={settings.lineFactory.sineWave.speed}
                                onChange={(e) => setSettings.setSineWaveSpeed(parseFloat(e.target.value))}
                            />
                        )}
                    </>
                )}
                
                {/* Compound Wave Builder UI */}
                {settings.lineFactory.sineWave.type === 'compound' && (
                    <>
                        <RangeSlider
                            label="Master Amplitude"
                            min={0}
                            max={336}
                            value={settings.lineFactory.sineWave.amplitude}
                            onChange={(e) => setSettings.setSineAmplitude(parseFloat(e.target.value))}
                        />
                        
                        <ToggleSwitch
                            label="Animate Wave"
                            value={settings.lineFactory.sineWave.animated}
                            onChange={setSettings.setSineWaveAnimated}
                        />
                        
                        {settings.lineFactory.sineWave.animated && (
                            <RangeSlider
                                label="Animation Speed"
                                min={0.01}
                                max={2}
                                step={0.01}
                                value={settings.lineFactory.sineWave.speed}
                                onChange={(e) => setSettings.setSineWaveSpeed(parseFloat(e.target.value))}
                            />
                        )}
                        
                        <div style={{ margin: '10px 0', padding: '10px', background: 'rgba(30, 30, 30, 0.5)', borderRadius: '5px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Wave Components</h4>
                            
                            {/* List existing components */}
                            {(settings.lineFactory.compound?.components || []).map((component, index) => (
                                <div key={index} style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '5px',
                                    alignItems: 'center',
                                    margin: '5px 0',
                                    padding: '5px',
                                    background: 'rgba(40, 40, 40, 0.5)',
                                    borderRadius: '3px'
                                }}>
                                    <span style={{ width: '20px' }}>{index+1}.</span>
                                    
                                    <SelectDropdown
                                        label="Type"
                                        value={component.type || 'sine'}
                                        onChange={(e) => {
                                            const newComponents = [...(settings.lineFactory.compound?.components || [])];
                                            newComponents[index] = {
                                                ...newComponents[index],
                                                type: e.target.value
                                            };
                                            
                                            const updatedCompound = {
                                                ...settings.lineFactory.compound || {},
                                                components: newComponents
                                            };
                                            
                                            setSettings.setCompoundSettings(updatedCompound);
                                        }}
                                        options={[
                                            { value: 'sine', label: 'sine' },
                                            { value: 'cosine', label: 'cosine' },
                                            { value: 'square', label: 'square' },
                                            { value: 'triangle', label: 'triangle' },
                                            { value: 'sawtooth', label: 'sawtooth' },
                                            { value: 'pulse', label: 'pulse' },
                                            { value: 'noise', label: 'noise' },
                                        ]}
                                        style={{ width: '100px', minWidth: '100px' }}
                                    />
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <label>Weight:</label>
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="2"
                                            step="0.1"
                                            value={component.weight || 1.0}
                                            onChange={(e) => {
                                                const newComponents = [...(settings.lineFactory.compound?.components || [])];
                                                newComponents[index] = {
                                                    ...newComponents[index],
                                                    weight: parseFloat(e.target.value)
                                                };
                                                
                                                const updatedCompound = {
                                                    ...settings.lineFactory.compound || {},
                                                    components: newComponents
                                                };
                                                
                                                setSettings.setCompoundSettings(updatedCompound);
                                            }}
                                            style={{ width: '60px', background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <label>Freq:</label>
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="10"
                                            step="0.1"
                                            value={component.frequency || 1.0}
                                            onChange={(e) => {
                                                const newComponents = [...(settings.lineFactory.compound?.components || [])];
                                                newComponents[index] = {
                                                    ...newComponents[index],
                                                    frequency: parseFloat(e.target.value)
                                                };
                                                
                                                const updatedCompound = {
                                                    ...settings.lineFactory.compound || {},
                                                    components: newComponents
                                                };
                                                
                                                setSettings.setCompoundSettings(updatedCompound);
                                            }}
                                            style={{ width: '60px', background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <label>Phase:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="6.28"
                                            step="0.1"
                                            value={component.phase || 0}
                                            onChange={(e) => {
                                                const newComponents = [...(settings.lineFactory.compound?.components || [])];
                                                newComponents[index] = {
                                                    ...newComponents[index],
                                                    phase: parseFloat(e.target.value)
                                                };
                                                
                                                const updatedCompound = {
                                                    ...settings.lineFactory.compound || {},
                                                    components: newComponents
                                                };
                                                
                                                setSettings.setCompoundSettings(updatedCompound);
                                            }}
                                            style={{ width: '60px', background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
                                        />
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            const newComponents = [...(settings.lineFactory.compound?.components || [])];
                                            newComponents.splice(index, 1);
                                            
                                            const updatedCompound = {
                                                ...settings.lineFactory.compound || {},
                                                components: newComponents
                                            };
                                            
                                            setSettings.setCompoundSettings(updatedCompound);
                                        }}
                                        style={{ 
                                            background: 'rgba(200, 50, 50, 0.7)', 
                                            color: 'white', 
                                            border: 'none',
                                            borderRadius: '3px',
                                            padding: '2px 6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            
                            {/* Add component button */}
                            <button
                                onClick={() => {
                                    const newComponent = {
                                        type: 'sine',
                                        weight: 1.0,
                                        frequency: 1.0,
                                        phase: 0
                                    };
                                    
                                    const newComponents = [
                                        ...(settings.lineFactory.compound?.components || []),
                                        newComponent
                                    ];
                                    
                                    const updatedCompound = {
                                        ...settings.lineFactory.compound || {},
                                        components: newComponents
                                    };
                                    
                                    setSettings.setCompoundSettings(updatedCompound);
                                }}
                                style={{ 
                                    background: 'rgba(80, 120, 200, 0.7)', 
                                    color: 'white', 
                                    border: 'none',
                                    borderRadius: '3px',
                                    padding: '5px 10px',
                                    margin: '5px 0',
                                    cursor: 'pointer'
                                }}
                            >
                                + Add Wave Component
                            </button>
                            
                            {/* Show note for empty components */}
                            {(!settings.lineFactory.compound?.components || settings.lineFactory.compound.components.length === 0) && (
                                <p style={{ fontSize: '0.9em', opacity: 0.7 }}>
                                    Add at least one wave component to create a compound wave.
                                </p>
                            )}
                        </div>
                    </>
                )}
                
                {/* Advanced Wave Settings for parametric waves */}
                {['lissajous', 'figure8', 'rose', 'butterfly'].includes(settings.lineFactory.sineWave.type) && (
                    <FieldSet legend="Parametric Wave Parameters">
                        {settings.lineFactory.sineWave.type === 'lissajous' && (
                            <>
                                <RangeSlider
                                    label="X Frequency (a)"
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={settings.lineFactory.parametric?.a || 3}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        const updatedParams = { 
                                            ...settings.lineFactory.parametric || {},
                                            a: value 
                                        };
                                        setSettings.setParametricSettings(updatedParams);
                                    }}
                                />
                                <RangeSlider
                                    label="Y Frequency (b)"
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={settings.lineFactory.parametric?.b || 2}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        const updatedParams = { 
                                            ...settings.lineFactory.parametric || {},
                                            b: value 
                                        };
                                        setSettings.setParametricSettings(updatedParams);
                                    }}
                                />
                                <RangeSlider
                                    label="Phase Shift (delta)"
                                    min={0}
                                    max={6.28}
                                    step={0.1}
                                    value={settings.lineFactory.parametric?.delta || 1.57}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        const updatedParams = { 
                                            ...settings.lineFactory.parametric || {},
                                            delta: value 
                                        };
                                        setSettings.setParametricSettings(updatedParams);
                                    }}
                                />
                            </>
                        )}
                        
                        {settings.lineFactory.sineWave.type === 'rose' && (
                            <>
                                <RangeSlider
                                    label="Petals (n)"
                                    min={1}
                                    max={12}
                                    step={1}
                                    value={settings.lineFactory.parametric?.n || 3}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        const updatedParams = { 
                                            ...settings.lineFactory.parametric || {},
                                            n: value 
                                        };
                                        setSettings.setParametricSettings(updatedParams);
                                    }}
                                />
                                <RangeSlider
                                    label="Divisor (d)"
                                    min={1}
                                    max={12}
                                    step={1}
                                    value={settings.lineFactory.parametric?.d || 1}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        const updatedParams = { 
                                            ...settings.lineFactory.parametric || {},
                                            d: value 
                                        };
                                        setSettings.setParametricSettings(updatedParams);
                                    }}
                                />
                            </>
                        )}
                        
                        {['figure8', 'butterfly'].includes(settings.lineFactory.sineWave.type) && (
                            <RangeSlider
                                label="Scale Factor"
                                min={0.1}
                                max={3}
                                step={0.1}
                                value={settings.lineFactory.parametric?.scale || 1}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const updatedParams = { 
                                        ...settings.lineFactory.parametric || {},
                                        scale: value 
                                    };
                                    setSettings.setParametricSettings(updatedParams);
                                }}
                            />
                        )}
                    </FieldSet>
                )}
            </FieldSet>

            {/* Wave Modulation Section */}
            <FieldSet legend="Wave Modulation">
                <SelectDropdown
                    label="Modulation Type"
                    value={settings.lineFactory.modulation?.type || 'none'}
                    onChange={(e) => {
                        const modType = e.target.value;
                        const updatedMod = { 
                            ...settings.lineFactory.modulation || {},
                            type: modType 
                        };
                        setSettings.setModulationSettings(updatedMod);
                    }}
                    options={Object.entries(ModulationType).map(([key, value]) => ({
                        value,
                        label: key.toLowerCase()
                    }))}
                />
                
                {settings.lineFactory.modulation?.type && settings.lineFactory.modulation?.type !== 'none' && (
                    <>
                        <RangeSlider
                            label="Modulation Frequency"
                            min={0.01}
                            max={1}
                            step={0.01}
                            value={settings.lineFactory.modulation?.frequency || 0.1}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                const updatedMod = { 
                                    ...settings.lineFactory.modulation,
                                    frequency: value 
                                };
                                setSettings.setModulationSettings(updatedMod);
                            }}
                        />
                        
                        <RangeSlider
                            label="Modulation Depth"
                            min={0.01}
                            max={1}
                            step={0.01}
                            value={settings.lineFactory.modulation?.depth || 0.5}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                const updatedMod = { 
                                    ...settings.lineFactory.modulation,
                                    depth: value 
                                };
                                setSettings.setModulationSettings(updatedMod);
                            }}
                        />
                        
                        {settings.lineFactory.modulation?.type === 'harmonic' && (
                            <div>
                                <label>Harmonic Mix: </label>
                                <input
                                    type="text"
                                    value={(settings.lineFactory.modulation?.harmonics || [1, 0.5, 0.25]).join(',')}
                                    onChange={(e) => {
                                        try {
                                            const harmonics = e.target.value.split(',')
                                                .map(val => parseFloat(val.trim()))
                                                .filter(val => !isNaN(val));
                                                
                                            if (harmonics.length > 0) {
                                                const updatedMod = { 
                                                    ...settings.lineFactory.modulation,
                                                    harmonics 
                                                };
                                                setSettings.setModulationSettings(updatedMod);
                                            }
                                        } catch (err) {
                                            // Invalid input, do nothing
                                        }
                                    }}
                                    style={{ width: '200px', background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
                                />
                                <p style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                    Enter comma-separated values (e.g. 1,0.5,0.25)
                                </p>
                            </div>
                        )}
                    </>
                )}
            </FieldSet>
            
            {/* Wave Transform Section */}
            {settings.lineFactory.sineWave.type !== 'none' && 
             settings.lineFactory.sineWave.type !== 'compound' &&
             !['lissajous', 'figure8', 'rose', 'butterfly'].includes(settings.lineFactory.sineWave.type) && (
                <FieldSet legend="Wave Transform">
                    <SelectDropdown
                        label="Transform Type"
                        value={settings.lineFactory.transform?.type || 'none'}
                        onChange={(e) => {
                            const transformType = e.target.value;
                            const updatedTransform = { 
                                ...settings.lineFactory.transform || {},
                                type: transformType 
                            };
                            setSettings.setTransformSettings(updatedTransform);
                        }}
                        options={[
                            { value: 'none', label: 'none' },
                            { value: 'invert', label: 'invert' },
                            { value: 'exponential', label: 'exponential' },
                            { value: 'clip', label: 'clip' },
                            { value: 'fold', label: 'fold' }
                        ]}
                    />
                    
                    {settings.lineFactory.transform?.type === 'exponential' && (
                        <RangeSlider
                            label="Exponent"
                            min={0.5}
                            max={5}
                            step={0.1}
                            value={settings.lineFactory.transform?.params?.exponent || 2}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                const updatedParams = { 
                                    ...settings.lineFactory.transform?.params || {},
                                    exponent: value 
                                };
                                
                                const updatedTransform = {
                                    ...settings.lineFactory.transform,
                                    params: updatedParams
                                };
                                
                                setSettings.setTransformSettings(updatedTransform);
                            }}
                        />
                    )}
                    
                    {settings.lineFactory.transform?.type === 'clip' && (
                        <RangeSlider
                            label="Threshold"
                            min={0.1}
                            max={1}
                            step={0.05}
                            value={settings.lineFactory.transform?.params?.threshold || 0.8}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                const updatedParams = { 
                                    ...settings.lineFactory.transform?.params || {},
                                    threshold: value 
                                };
                                
                                const updatedTransform = {
                                    ...settings.lineFactory.transform,
                                    params: updatedParams
                                };
                                
                                setSettings.setTransformSettings(updatedTransform);
                            }}
                        />
                    )}
                </FieldSet>
            )}
            
            <FieldSet legend="General Line Settings">
                <ToggleSwitch
                    label="Loop Line"
                    value={settings.lineFactory.loopLine}
                    onChange={setSettings.setLoopLine}
                />
                <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '5px' }}>
                    When enabled, wave and curved lines will appear to connect end-to-end
                </div>
                
                {settings.lineFactory.loopLine && settings.lineFactory.sineWave.type !== 'none' && (
                    <ToggleSwitch
                        label="Bidirectional Waves"
                        value={settings.lineFactory.bidirectionalWaves || false}
                        onChange={(value) => {
                            // Create a copy of the line factory settings with the new bidirectional flag
                            const updatedSettings = {
                                ...settings.lineFactory,
                                bidirectionalWaves: value
                            };
                            setSettings.setLineFactorySettings(updatedSettings);
                        }}
                    />
                )}
                {settings.lineFactory.bidirectionalWaves && (
                    <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '5px' }}>
                        Creates flowing waves in both directions for perfect loop connectivity
                    </div>
                )}
            </FieldSet>
            
            {/* Advanced Line Style Settings */}
            {(settings.lineFactory.style === LineStyleType.SPIRAL || 
              settings.lineFactory.style === LineStyleType.RIBBON || 
              settings.lineFactory.style === LineStyleType.DOUBLE) && (
                <FieldSet legend="Advanced Line Settings">
                    {settings.lineFactory.style === LineStyleType.SPIRAL && (
                        <>
                            <RangeSlider
                                label="Spiral Tightness"
                                min={0.01}
                                max={1}
                                step={0.01}
                                value={settings.lineFactory.spiral?.tightness || 0.1}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const updatedSpiral = { 
                                        ...settings.lineFactory.spiral,
                                        tightness: value 
                                    };
                                    setSettings.setSpiralSettings(updatedSpiral);
                                }}
                            />
                            <RangeSlider
                                label="Spiral Growth"
                                min={0.5}
                                max={5}
                                step={0.1}
                                value={settings.lineFactory.spiral?.growth || 1.5}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const updatedSpiral = { 
                                        ...settings.lineFactory.spiral,
                                        growth: value 
                                    };
                                    setSettings.setSpiralSettings(updatedSpiral);
                                }}
                            />
                            <RangeSlider
                                label="Max Radius"
                                min={1}
                                max={20}
                                step={0.5}
                                value={settings.lineFactory.spiral?.maxRadius || 5}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const updatedSpiral = { 
                                        ...settings.lineFactory.spiral,
                                        maxRadius: value 
                                    };
                                    setSettings.setSpiralSettings(updatedSpiral);
                                }}
                            />
                        </>
                    )}
                    
                    {settings.lineFactory.style === LineStyleType.RIBBON && (
                        <>
                            <RangeSlider
                                label="Ribbon Width"
                                min={1}
                                max={10}
                                step={0.1}
                                value={settings.lineFactory.ribbon?.width || 3}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const updatedRibbon = { 
                                        ...settings.lineFactory.ribbon,
                                        width: value 
                                    };
                                    setSettings.setRibbonSettings(updatedRibbon);
                                }}
                            />
                            <RangeSlider
                                label="Twist Rate"
                                min={0.1}
                                max={5}
                                step={0.1}
                                value={settings.lineFactory.ribbon?.twist || 2}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const updatedRibbon = { 
                                        ...settings.lineFactory.ribbon,
                                        twist: value 
                                    };
                                    setSettings.setRibbonSettings(updatedRibbon);
                                }}
                            />
                        </>
                    )}
                    
                    {settings.lineFactory.style === LineStyleType.DOUBLE && (
                        <>
                            <RangeSlider
                                label="Line Spacing"
                                min={0.5}
                                max={5}
                                step={0.1}
                                value={settings.lineFactory.double?.spacing || 1.5}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const updatedDouble = { 
                                        ...settings.lineFactory.double,
                                        spacing: value 
                                    };
                                    setSettings.setDoubleSettings(updatedDouble);
                                }}
                            />
                            <RangeSlider
                                label="Second Line Width"
                                min={0.1}
                                max={2}
                                step={0.1}
                                value={settings.lineFactory.double?.secondLineWidth || 0.7}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const updatedDouble = { 
                                        ...settings.lineFactory.double,
                                        secondLineWidth: value 
                                    };
                                    setSettings.setDoubleSettings(updatedDouble);
                                }}
                            />
                        </>
                    )}
                </FieldSet>
            )}
        </>
    );
};

export default LineFactorySection;