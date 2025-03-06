import React from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import ColorPicker from '../controls/ColorPicker';
import SelectDropdown from '../controls/SelectDropdown';
import ToggleSwitch from '../controls/ToggleSwitch';

const VisualSettingsSection = ({ settings, setSettings, rendererType }) => {
    const colorSchemeOptions = [
        { value: 'grayscale', label: 'Grayscale' },
        { value: 'blue', label: 'Blue' },
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'purple', label: 'Purple' }
    ];
    
    return (
        <FieldSet legend="Basic Settings">
            <ColorPicker
                label="Background Color"
                value={settings.colors.background}
                onChange={(e) => setSettings.setBackgroundColor(e.target.value)}
            />
            <RangeSlider
                label="Animation Speed"
                min={0.1}
                max={2}
                step={0.1}
                value={settings.animation.speed}
                onChange={(e) => setSettings.setAnimationSpeed(parseFloat(e.target.value))}
            />
            <SelectDropdown
                label="Color Scheme"
                value={settings.colors.scheme}
                onChange={(e) => setSettings.setColorScheme(e.target.value)}
                options={colorSchemeOptions}
            />
        </FieldSet>
    );
};

export default VisualSettingsSection;