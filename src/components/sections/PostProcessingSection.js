// src/components/sections/PostProcessingSection.js - Modern Post-Processing Integration
// Integrates world-class modern post-processing into the main Sacred Grid application

import React from 'react';
import ModernPostProcessingPanel from '../panels/ModernPostProcessingPanel.js';

const PostProcessingSection = ({ settings, setSettings }) => {
    // Simply render the modern post-processing panel
    return (
        <ModernPostProcessingPanel
            settings={settings}
            setSettings={setSettings}
            performanceMetrics={{
                fps: 60,
                frameTime: 16.67,
                effectTime: 0,
                webglSupported: true
            }}
        />
    );
};

export default PostProcessingSection;
