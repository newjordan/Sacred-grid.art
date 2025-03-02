import React from 'react';
import FieldSet from '../controls/FieldSet';
import RangeSlider from '../controls/RangeSlider';
import ToggleSwitch from '../controls/ToggleSwitch';
import ColorPicker from '../controls/ColorPicker';

const XYGridSection = ({ settings, setSettings }) => {
    return (
        <FieldSet legend="XY Grid">
            <ToggleSwitch
                label="Show XY Grid"
                value={settings.xyGrid.show}
                onChange={setSettings.setShowXYGrid}
            />
            {settings.xyGrid.show && (
                <>
                    <RangeSlider
                        label="Grid Size"
                        min={5}
                        max={50}
                        value={settings.xyGrid.size}
                        onChange={(e) => setSettings.setXYGridSize(parseInt(e.target.value))}
                    />
                    <RangeSlider
                        label="Grid Spacing"
                        min={10}
                        max={100}
                        value={settings.xyGrid.spacing}
                        onChange={(e) => setSettings.setXYGridSpacing(parseInt(e.target.value))}
                    />
                    <RangeSlider
                        label="Grid Opacity"
                        min={0.01}
                        max={1}
                        step={0.01}
                        value={settings.xyGrid.opacity}
                        onChange={(e) => setSettings.setXYGridOpacity(parseFloat(e.target.value))}
                    />
                    <RangeSlider
                        label="Line Width"
                        min={0.1}
                        max={3}
                        step={0.1}
                        value={settings.xyGrid.lineWidth}
                        onChange={(e) => setSettings.setXYGridLineWidth(parseFloat(e.target.value))}
                    />
                    <ColorPicker
                        label="Grid Color"
                        value={settings.xyGrid.color}
                        onChange={(e) => setSettings.setXYGridColor(e.target.value)}
                    />
                    <ToggleSwitch
                        label="Show Labels"
                        value={settings.xyGrid.showLabels}
                        onChange={setSettings.setShowXYGridLabels}
                    />
                </>
            )}
        </FieldSet>
    );
};

export default XYGridSection;