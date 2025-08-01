// src/components/panels/ExportControls.js - Export controls (JavaScript version)

import React, { useState } from 'react';
import SettingsChecklist from '../SettingsChecklist.js';

const ExportControls = ({ onExport, isExporting = false, className = '' }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'png',
    quality: 0.9,
    width: 1920,
    height: 1080,
    transparent: false,
    // Standalone-specific defaults
    standaloneTitle: 'Sacred Grid Player',
    includeControls: true,
    enableFullscreen: true,
    showInfo: true
  });

  const [customDimensions, setCustomDimensions] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [validationReport, setValidationReport] = useState(null);
  const [showValidationChecklist, setShowValidationChecklist] = useState(false);

  const updateOptions = (updates) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  // Format options - PNG and Standalone
  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'High-quality image with transparency support' },
    { value: 'standalone', label: 'Standalone HTML', description: 'Self-contained interactive HTML file' }
  ];

  // Dimension presets
  const dimensionPresets = [
    { label: 'HD (1920×1080)', width: 1920, height: 1080 },
    { label: '4K (3840×2160)', width: 3840, height: 2160 },
    { label: 'Square (1080×1080)', width: 1080, height: 1080 },
    { label: 'Mobile (1080×1920)', width: 1080, height: 1920 },
    { label: 'Ultrawide (2560×1080)', width: 2560, height: 1080 }
  ];

  const handlePresetSelect = (preset) => {
    updateOptions({ width: preset.width, height: preset.height });
    setCustomDimensions(false);
  };

  const handleExport = async () => {
    try {
      setExportProgress(0);

      // Show progress updates
      const progressCallback = (progress, message, validationData) => {
        setExportProgress(progress * 100);
        console.log(`Export: ${Math.round(progress * 100)}% - ${message}`);

        // Capture validation report if provided
        if (validationData && validationData.validation) {
          setValidationReport(validationData.validation);
        }
      };

      const result = await onExport(exportOptions, progressCallback);
      setExportProgress(100);
      setExportSuccess(true);

      // Show success message
      console.log('🎉 PNG exported successfully! Check your downloads folder.');

      // Reset progress and success after a delay
      setTimeout(() => {
        setExportProgress(0);
        setExportSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
      setExportProgress(0);
    }
  };

  const estimatedFileSize = () => {
    const pixels = exportOptions.width * exportOptions.height;
    const sizeKB = pixels * (exportOptions.transparent ? 4 : 3) / 1024;

    if (sizeKB < 1024) {
      return `~${Math.round(sizeKB)} KB`;
    } else {
      return `~${(sizeKB / 1024).toFixed(1)} MB`;
    }
  };

  return (
    <div className={`export-controls ${className}`} style={{
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      width: '320px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>Export</h3>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            {estimatedFileSize()}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        {/* Format Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px' }}>
            Export Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            {formatOptions.map(format => (
              <label
                key={format.value}
                style={{
                  background: exportOptions.format === format.value 
                    ? 'rgba(0, 119, 255, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: exportOptions.format === format.value
                    ? '2px solid rgba(0, 119, 255, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  if (exportOptions.format !== format.value) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (exportOptions.format !== format.value) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={exportOptions.format === format.value}
                  onChange={(e) => updateOptions({ format: e.target.value })}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{format.label}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>{format.description}</div>
                  </div>
                  {exportOptions.format === format.value && (
                    <div style={{ color: '#0077ff', fontSize: '16px' }}>✓</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>



        {/* Dimensions */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' }}>
              Dimensions
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={customDimensions}
                onChange={(e) => setCustomDimensions(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '12px' }}>Custom</span>
            </label>
          </div>

          {!customDimensions ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {dimensionPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    background: (exportOptions.width === preset.width && exportOptions.height === preset.height)
                      ? 'rgba(0, 119, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>Width</label>
                <input
                  type="number"
                  value={exportOptions.width}
                  onChange={(e) => updateOptions({ width: parseInt(e.target.value) || 1920 })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>Height</label>
                <input
                  type="number"
                  value={exportOptions.height}
                  onChange={(e) => updateOptions({ height: parseInt(e.target.value) || 1080 })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: isExporting ? 'rgba(0, 119, 255, 0.5)' : '#0077ff',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isExporting ? 'none' : '0 0 20px rgba(0, 119, 255, 0.3)'
          }}
        >
          {isExporting ? (
            <>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Exporting...
            </>
          ) : (
            <>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PNG
            </>
          )}
        </button>

        {exportProgress > 0 && exportProgress < 100 && (
          <div style={{ marginTop: '12px' }}>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${exportProgress}%`,
                height: '100%',
                background: '#0077ff',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        )}

        {exportSuccess && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(0, 255, 0, 0.1)',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            borderRadius: '6px',
            color: '#00ff88',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ✅ Export completed successfully!
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
              Check your downloads folder
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Settings Validation Checklist */}
      <SettingsChecklist
        validationReport={validationReport}
        isVisible={showValidationChecklist}
        onClose={() => setShowValidationChecklist(false)}
      />
    </div>
  );
};

export default ExportControls;
