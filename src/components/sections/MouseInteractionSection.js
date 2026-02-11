import React from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import ToggleSwitch from '../controls/ToggleSwitch';

const MouseInteractionSection = ({ settings, setSettings }) => {
    return (
        <FieldSet legend="Mouse Interaction">
            <ToggleSwitch
                label="Enable Mouse Hover"
                value={settings.mouse.enabled}
                onChange={(val) => setSettings.setMouseEnabled(val)}
            />
            {settings.mouse.enabled && (
                <>
                    <RangeSlider
                        label="Mouse Influence Radius"
                        min={50}
                        max={500}
                        value={settings.mouse.influenceRadius}
                        onChange={(e) => setSettings.setMouseInfluenceRadius(parseInt(e.target.value))}
                    />
                    <RangeSlider
                        label="Max Mouse Scale"
                        min={1}
                        max={5}
                        step={0.1}
                        value={settings.mouse.maxScale}
                        onChange={(e) => setSettings.setMaxMouseScale(parseFloat(e.target.value))}
                    />
                </>
            )}
        </FieldSet>
    );
};

export default MouseInteractionSection;