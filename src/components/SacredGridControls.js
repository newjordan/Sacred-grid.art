// src/components/SacredGridControls.js
import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import GridSettingsSection from './sections/GridSettingsSection';
import XYGridSection from './sections/XYGridSection';
import MouseInteractionSection from './sections/MouseInteractionSection';
import VisualSettingsSection from './sections/VisualSettingsSection';
import LineFactorySection from './sections/LineFactorySection';
import GradientSettingsSection from './sections/GradientSettingsSection';
import SecondaryShapeSection from './sections/SecondaryShapeSection';
import PrimaryShapeSection from './sections/PrimaryShapeSection';

const SacredGridControls = ({ settings, setSettings, toggleControls, rendererType }) => {

    // Function to handle exporting settings to a JSON file
    const handleExportSettings = () => {
        try {
            // Convert the settings object to a nicely formatted JSON string
            const settingsJson = JSON.stringify(settings, null, 2);
            
            // Create a Blob object containing the JSON data
            const blob = new Blob([settingsJson], { type: 'application/json' });
            
            // Create a temporary URL for the Blob
            const url = URL.createObjectURL(blob);
            
            // Create a temporary anchor element to trigger the download
            const link = document.createElement('a');
            link.href = url;
            // Suggest a filename for the download
            link.download = 'sacred-grid-settings.json'; 
            
            // Append the link to the body (required for Firefox)
            document.body.appendChild(link);
            
            // Programmatically click the link to start the download
            link.click();
            
            // Clean up by removing the link and revoking the URL
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error exporting settings:", error);
            alert("Failed to export settings. See console for details.");
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 200,
                top: 20,
                left: 10,
                color: 'white',
                background: 'rgba(0,0,0,0.7)',
                padding: '15px',
                maxHeight: '90vh',
                width: '350px',
                overflowY: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Sacred Grid Controls</h2>
                {/* Container for buttons */}
                <div style={{ display: 'flex', gap: '5px' }}> 
                    {/* Export Settings Button */}
                    <button 
                        onClick={handleExportSettings}
                        title="Export current settings to a JSON file"
                        style={{
                            background: 'rgba(0, 100, 200, 0.7)', // Different color
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Export
                    </button>
                    {/* Hide Button */}
                    <button 
                        onClick={toggleControls}
                        style={{
                            background: 'rgba(50, 50, 50, 0.7)',
                            color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Hide
                </button>
                </div>
            </div>

            {/* Grid Settings */}
            <CollapsibleSection title="Grid Settings" initiallyOpen={true}>
                <GridSettingsSection 
                    settings={settings} 
                    setSettings={setSettings} 
                />
                
                <XYGridSection 
                    settings={settings} 
                    setSettings={setSettings} 
                />
                
                <MouseInteractionSection 
                    settings={settings} 
                    setSettings={setSettings} 
                />
            </CollapsibleSection>

            {/* Visual Settings */}
            <CollapsibleSection title="Visual Settings" initiallyOpen={true}>
                <VisualSettingsSection 
                    settings={settings} 
                    setSettings={setSettings} 
                />
            </CollapsibleSection>

            {/* Line Factory Settings */}
            <CollapsibleSection title="Line Factory" initiallyOpen={false}>
                <LineFactorySection 
                    settings={settings} 
                    setSettings={setSettings} 
                />
            </CollapsibleSection>

            {/* Gradient Settings */}
            <CollapsibleSection title="Gradient Settings" initiallyOpen={false}>
                <GradientSettingsSection 
                    settings={settings} 
                    setSettings={setSettings} 
                />
            </CollapsibleSection>

            {/* Primary Shape Settings */}
            <CollapsibleSection title="Primary Shape Settings" initiallyOpen={false}>
                <PrimaryShapeSection 
                    settings={settings} 
                    setSettings={setSettings} 
                />
            </CollapsibleSection>
            
            {/* Secondary Shape Settings */}
            <CollapsibleSection title="Secondary Shape Settings" initiallyOpen={false}>
                <SecondaryShapeSection
                    settings={settings}
                    setSettings={setSettings}
                />
            </CollapsibleSection>
        </div>
    );
};

export default SacredGridControls;
