import React from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import ToggleSwitch from '../controls/ToggleSwitch';

const GridSettingsSection = ({ settings, setSettings }) => {
    return (
        <FieldSet legend="Grid Parameters">
            <RangeSlider
                label="Grid Size"
                min={2}
                max={12}
                value={settings.grid.size}
                onChange={(e) => setSettings.setGridSize(parseInt(e.target.value))}
            />
            <RangeSlider
                label="Spacing"
                min={50}
                max={300}
                value={settings.grid.spacing}
                onChange={(e) => setSettings.setGridSpacing(parseInt(e.target.value))}
            />
            <RangeSlider
                label="Dot Size"
                min={1}
                max={10}
                value={settings.grid.baseDotSize}
                onChange={(e) => setSettings.setBaseDotSize(parseInt(e.target.value))}
            />
            <RangeSlider
                label="Connection Opacity"
                min={0}
                max={1}
                step={0.01}
                value={settings.grid.connectionOpacity}
                onChange={(e) => setSettings.setConnectionOpacity(parseFloat(e.target.value))}
            />
            <ToggleSwitch
                label="Use Line Factory for Grid"
                value={settings.grid.useLineFactorySettings}
                onChange={setSettings.setUseLineFactoryForGrid}
            />
            <RangeSlider
                label="Noise Intensity"
                min={0}
                max={2}
                step={0.1}
                value={settings.grid.noiseIntensity}
                onChange={(e) => setSettings.setNoiseIntensity(parseFloat(e.target.value))}
            />
            <RangeSlider
                label="Line Width Multiplier"
                min={0.5}
                max={3}
                step={0.1}
                value={settings.grid.lineWidthMultiplier}
                onChange={(e) => setSettings.setLineWidthMultiplier(parseFloat(e.target.value))}
            />
            <RangeSlider
                label="Breathing Speed"
                min={0.0001}
                max={0.005}
                step={0.0001}
                value={settings.grid.breathingSpeed}
                onChange={(e) => setSettings.setGridBreathingSpeed(parseFloat(e.target.value))}
            />
            <RangeSlider
                label="Breathing Intensity"
                min={0}
                max={1}
                step={0.01}
                value={settings.grid.breathingIntensity}
                onChange={(e) => setSettings.setGridBreathingIntensity(parseFloat(e.target.value))}
            />
        </FieldSet>
    );
};

export default GridSettingsSection;