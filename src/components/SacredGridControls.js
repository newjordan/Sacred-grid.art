// src/components/SacredGridControls.js
import React, { useRef } from 'react'; // Import useRef
import CollapsibleSection from './CollapsibleSection';
import GridSettingsSection from './sections/GridSettingsSection';
import XYGridSection from './sections/XYGridSection';
import MouseInteractionSection from './sections/MouseInteractionSection';
import VisualSettingsSection from './sections/VisualSettingsSection';
import LineFactorySection from './sections/LineFactorySection';
import GradientSettingsSection from './sections/GradientSettingsSection';
import SecondaryShapeSection from './sections/SecondaryShapeSection';
import PrimaryShapeSection from './sections/PrimaryShapeSection';
import ExportControls from './panels/ExportControls.js';
import PostProcessingSection from './sections/PostProcessingSection.js';

// Accept onImportSettings and onExport props
const SacredGridControls = ({ settings, setSettings, toggleControls, rendererType, onImportSettings, onExport }) => {

    // Ref for the hidden file input
    const fileInputRef = useRef(null);

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

    // Function to trigger the hidden file input
    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Function to handle file selection and reading
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return; // No file selected
        }

        if (file.type !== 'application/json') {
            alert('Invalid file type. Please select a .json file.');
            // Reset the input value so the user can select the same file again if needed
            if (fileInputRef.current) fileInputRef.current.value = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            if (onImportSettings) {
                onImportSettings(content); // Pass content to the handler in SacredGrid.js
            }
            // Reset the input value after processing
             if (fileInputRef.current) fileInputRef.current.value = null;
        };
        reader.onerror = (e) => {
            console.error("Error reading file:", e);
            alert("Failed to read the settings file.");
             // Reset the input value on error
             if (fileInputRef.current) fileInputRef.current.value = null;
        };
        reader.readAsText(file);
    };


    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 200,
                top: 20,
                left: 10,
                color: 'white',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '20px',
                maxHeight: '90vh',
                width: '420px',
                overflowY: 'auto',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Sacred Grid Controls</h2>
                {/* Container for buttons */}
                <div style={{ display: 'flex', gap: '5px' }}>
                    {/* Import Settings Button */}
                    <button
                        onClick={handleImportClick}
                        title="Import settings from a JSON file"
                        style={{
                            background: 'rgba(0, 200, 100, 0.15)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0, 200, 100, 0.3)',
                            color: 'white',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(0, 200, 100, 0.25)';
                            e.target.style.borderColor = 'rgba(0, 200, 100, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(0, 200, 100, 0.15)';
                            e.target.style.borderColor = 'rgba(0, 200, 100, 0.3)';
                        }}
                    >
                        Import
                    </button>
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json" // Only accept JSON files
                        style={{ display: 'none' }} // Keep it hidden
                    />
                    {/* Export Settings Button */}
                    <button
                        onClick={handleExportSettings}
                        title="Export current settings to a JSON file"
                        style={{
                            background: 'rgba(0, 119, 255, 0.15)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0, 119, 255, 0.3)',
                            color: 'white',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(0, 119, 255, 0.25)';
                            e.target.style.borderColor = 'rgba(0, 119, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(0, 119, 255, 0.15)';
                            e.target.style.borderColor = 'rgba(0, 119, 255, 0.3)';
                        }}
                    >
                        Export
                    </button>
                    {/* Hide Button */}
                    <button
                        onClick={toggleControls}
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
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

            {/* Post-Processing Effects */}
            <CollapsibleSection title="Post-Processing Effects" initiallyOpen={false}>
                <PostProcessingSection
                    settings={settings}
                    setSettings={setSettings}
                />
            </CollapsibleSection>

            {/* Export Settings */}
            {onExport && (
                <CollapsibleSection title="Export" initiallyOpen={false}>
                    <ExportControls onExport={onExport} />
                </CollapsibleSection>
            )}
        </div>
    );
};

export default SacredGridControls;
