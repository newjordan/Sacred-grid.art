import React from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import ToggleSwitch from '../controls/ToggleSwitch';
import SelectDropdown from '../controls/SelectDropdown';

const GradientSettingsSection = ({ settings, setSettings }) => {
    const easingOptions = [
        { value: 'linear', label: 'Linear' },
        { value: 'easeInOutQuad', label: 'Ease In Out Quad' },
        { value: 'easeInOutCubic', label: 'Ease In Out Cubic' }
    ];
    
    return (
        <>
            <FieldSet legend="Gradient Lines">
                <ToggleSwitch
                    label="Use Gradient Lines"
                    value={settings.colors.gradient.lines.enabled}
                    onChange={setSettings.setUseGradientLines}
                />
                <div>
                    <label>Gradient Colors (Lines): </label>
                    {settings.colors.gradient.lines.colors.map((color, i) => (
                        <input
                            key={i}
                            type="color"
                            value={color}
                            onChange={(e) => {
                                const newColors = [...settings.colors.gradient.lines.colors];
                                newColors[i] = e.target.value;
                                setSettings.setGradientColorsLines(newColors);
                            }}
                        />
                    ))}
                </div>
            </FieldSet>

            <FieldSet legend="Gradient Dots">
                <ToggleSwitch
                    label="Use Gradient Dots"
                    value={settings.colors.gradient.dots.enabled}
                    onChange={setSettings.setUseGradientDots}
                />
                <div>
                    <label>Gradient Colors (Dots): </label>
                    {settings.colors.gradient.dots.colors.map((color, i) => (
                        <input
                            key={i}
                            type="color"
                            value={color}
                            onChange={(e) => {
                                const newColors = [...settings.colors.gradient.dots.colors];
                                newColors[i] = e.target.value;
                                setSettings.setGradientColorsDots(newColors);
                            }}
                        />
                    ))}
                </div>
            </FieldSet>

            <FieldSet legend="Gradient Shapes">
                <ToggleSwitch
                    label="Use Gradient Shapes"
                    value={settings.colors.gradient.shapes.enabled}
                    onChange={setSettings.setUseGradientShapes}
                />
                <div>
                    <label>Gradient Colors (Shapes): </label>
                    {settings.colors.gradient.shapes.colors.map((color, i) => (
                        <input
                            key={i}
                            type="color"
                            value={color}
                            onChange={(e) => {
                                const newColors = [...settings.colors.gradient.shapes.colors];
                                newColors[i] = e.target.value;
                                setSettings.setGradientColorsShapes(newColors);
                            }}
                        />
                    ))}
                </div>
                <SelectDropdown
                    label="Color Easing Type"
                    value={settings.colors.gradient.easing}
                    onChange={(e) => setSettings.setColorEasingType(e.target.value)}
                    options={easingOptions}
                />
                <RangeSlider
                    label="Color Cycle Duration (ms)"
                    min={1000}
                    max={10000}
                    step={100}
                    value={settings.colors.gradient.cycleDuration}
                    onChange={(e) => setSettings.setColorCycleDuration(parseInt(e.target.value))}
                />
            </FieldSet>
        </>
    );
};

export default GradientSettingsSection;