// src/components/panels/ExportControls.tsx - Export options and controls

import React, { useState } from 'react';
import { ExportOptions } from '../../types';
import GlassPanel from '../ui/GlassPanel';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';

export interface ExportControlsProps {
  onExport: (options: ExportOptions) => Promise<void>;
  isExporting?: boolean;
  className?: string;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  onExport,
  isExporting = false,
  className = ''
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 0.9,
    width: 1920,
    height: 1080,
    transparent: false,
    // Standalone-specific defaults
    standaloneTitle: 'Sacred Grid Player',
    includeControls: true,
    enableFullscreen: true,
    showInfo: true,
    // Wallpaper mode defaults
    wallpaperMode: false,
    scale: 1,
    animationSpeed: 1
  });

  const [customDimensions, setCustomDimensions] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Preset dimensions
  const presetDimensions = [
    { name: 'HD (1280×720)', width: 1280, height: 720 },
    { name: 'Full HD (1920×1080)', width: 1920, height: 1080 },
    { name: '4K (3840×2160)', width: 3840, height: 2160 },
    { name: 'Square HD (1080×1080)', width: 1080, height: 1080 },
    { name: 'Instagram Story (1080×1920)', width: 1080, height: 1920 },
    { name: 'Twitter Header (1500×500)', width: 1500, height: 500 },
    { name: 'Facebook Cover (1200×630)', width: 1200, height: 630 }
  ];

  // Format options
  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'High-quality image with transparency support' },
    { value: 'standalone', label: 'Standalone HTML', description: 'Self-contained interactive HTML file you can share' },
    { value: 'wallpaper', label: 'Wallpaper Mode', description: 'Optimized for desktop wallpapers (Lively, Plash, Komorebi)' }
  ];

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  const handlePresetSelect = (preset: { width: number; height: number }) => {
    updateOptions({ width: preset.width, height: preset.height });
    setCustomDimensions(false);
  };

  const handleExport = async () => {
    try {
      setExportProgress(0);
      await onExport(exportOptions);
      setExportProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => setExportProgress(0), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress(0);
    }
  };

  const estimatedFileSize = () => {
    const pixels = exportOptions.width * exportOptions.height;
    let sizeKB = 0;

    switch (exportOptions.format) {
      case 'png':
        sizeKB = pixels * (exportOptions.transparent ? 4 : 3) / 1024;
        break;
      case 'jpg':
        sizeKB = pixels * 3 * exportOptions.quality / 1024;
        break;
      case 'svg':
        sizeKB = 50; // SVG is typically small
        break;
      case 'gif':
        sizeKB = pixels * 1.5 / 1024; // Rough estimate
        break;
      case 'webm':
        sizeKB = pixels * 0.5 / 1024; // Compressed video
        break;
      case 'widget':
        sizeKB = exportOptions.includeControls ? 25 : 15; // Lightweight HTML/JS/CSS
        break;
    }

    if (sizeKB < 1024) {
      return `~${Math.round(sizeKB)} KB`;
    } else {
      return `~${(sizeKB / 1024).toFixed(1)} MB`;
    }
  };

  return (
    <GlassPanel
      variant="floating"
      className={`w-80 ${className}`}
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white/90">Export</h3>
          <div className="text-sm text-white/70">
            {estimatedFileSize()}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 gap-2">
            {formatOptions.map(format => (
              <label
                key={format.value}
                className={`
                  glass-card p-3 transition-all duration-200
                  ${(format as any).disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                  }
                  ${exportOptions.format === format.value && !(format as any).disabled
                    ? 'ring-2 ring-blue-500/50 bg-blue-500/10'
                    : !(format as any).disabled ? 'hover:bg-white/5' : ''
                  }
                `}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={exportOptions.format === format.value && !(format as any).disabled}
                  onChange={(e) => !(format as any).disabled && updateOptions({ format: e.target.value as any })}
                  disabled={(format as any).disabled}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white/90">{format.label}</div>
                    <div className="text-xs text-white/60">{format.description}</div>
                  </div>
                  <div className={`
                    w-4 h-4 rounded-full border-2 transition-colors
                    ${exportOptions.format === format.value 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-white/30'
                    }
                  `}>
                    {exportOptions.format === format.value && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quality Settings */}
        {exportOptions.format === 'png' && (
          <Slider
            label="Quality"
            value={exportOptions.quality * 100}
            onChange={(value) => updateOptions({ quality: value / 100 })}
            min={10}
            max={100}
            step={5}
            formatValue={(val) => `${val}%`}
            description="PNG compression quality"
          />
        )}

        {/* Transparency - PNG only */}
        {exportOptions.format === 'png' && (
          <Toggle
            checked={exportOptions.transparent}
            onChange={(checked) => updateOptions({ transparent: checked })}
            label="Transparent Background"
            description="Remove background for overlay use"
          />
        )}

        {/* Standalone-specific Options */}
        {exportOptions.format === 'standalone' && (
          <div className="space-y-4 p-4 glass-card">
            <h4 className="text-sm font-semibold text-white/90 mb-3">Standalone Options</h4>

            <div>
              <label className="block text-xs text-white/70 mb-1">Title</label>
              <input
                type="text"
                value={exportOptions.standaloneTitle || 'Sacred Grid Player'}
                onChange={(e) => updateOptions({ standaloneTitle: e.target.value })}
                className="glass-input w-full text-sm"
                placeholder="Sacred Grid Player"
              />
            </div>

            <Toggle
              checked={exportOptions.includeControls || true}
              onChange={(checked) => updateOptions({ includeControls: checked })}
              label="Include Interactive Controls"
              description="Add play/pause, reset, and fullscreen controls"
            />

            <Toggle
              checked={exportOptions.enableFullscreen || true}
              onChange={(checked) => updateOptions({ enableFullscreen: checked })}
              label="Enable Fullscreen"
              description="Allow fullscreen viewing"
            />

            <Toggle
              checked={exportOptions.showInfo || true}
              onChange={(checked) => updateOptions({ showInfo: checked })}
              label="Show Info Panel"
              description="Display grid information and creation date"
            />

            <Toggle
              checked={exportOptions.optimize ?? true}
              onChange={(checked) => updateOptions({ optimize: checked })}
              label="Optimize File Size"
              description="Remove unused elements and compress content"
            />

            {exportOptions.optimize && (
              <div>
                <label className="block text-xs text-white/70 mb-1">Optimization Level</label>
                <select
                  value={exportOptions.optimizationLevel || 'default'}
                  onChange={(e) => updateOptions({ optimizationLevel: e.target.value as 'conservative' | 'default' | 'aggressive' })}
                  className="glass-input w-full text-sm"
                >
                  <option value="conservative">Conservative (Safer)</option>
                  <option value="default">Default (Balanced)</option>
                  <option value="aggressive">Aggressive (Maximum compression)</option>
                </select>
              </div>
            )}

            <div className="text-xs text-white/50 p-2 bg-blue-500/10 rounded border border-blue-500/20">
              💡 <strong>Tip:</strong> The exported file will be a self-contained HTML file (~15-50KB)
              that runs the same algorithm as the main application and works offline.
              {exportOptions.optimize && (
                <><br/>🔧 <strong>Optimization:</strong> Removes unused settings and compresses content for smaller file size.</>
              )}
            </div>
          </div>
        )}

        {/* Wallpaper Mode Options */}
        {exportOptions.format === 'wallpaper' && (
          <div className="space-y-4 p-4 glass-card">
            <h4 className="text-sm font-semibold text-white/90 mb-3">Wallpaper Settings</h4>

            <div>
              <label className="block text-xs text-white/70 mb-1">Title (optional)</label>
              <input
                type="text"
                value={exportOptions.standaloneTitle || 'Sacred Grid Wallpaper'}
                onChange={(e) => updateOptions({ standaloneTitle: e.target.value })}
                className="glass-input w-full text-sm"
                placeholder="Sacred Grid Wallpaper"
              />
            </div>

            <Slider
              label="Zoom Level"
              value={(exportOptions.scale || 1) * 100}
              onChange={(value) => updateOptions({ scale: value / 100 })}
              min={50}
              max={200}
              step={10}
              formatValue={(val) => `${val}%`}
              description="Adjust the view zoom (50% = zoomed out, 200% = zoomed in)"
            />

            <Slider
              label="Animation Speed"
              value={(exportOptions.animationSpeed || 1) * 100}
              onChange={(value) => updateOptions({ animationSpeed: value / 100 })}
              min={10}
              max={100}
              step={5}
              formatValue={(val) => `${val}%`}
              description="Slower = more meditative (default: 50%)"
            />

            <div className="text-xs text-white/50 p-2 bg-purple-500/10 rounded border border-purple-500/20">
              🖼️ <strong>Wallpaper Mode:</strong> No mouse interaction, no controls - just pure animation.
              <br/>Works with <a href="https://www.rocksdanister.com/lively/" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">Lively Wallpaper</a> (Windows),{' '}
              <a href="https://github.com/sindresorhus/Plash" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">Plash</a> (macOS), and similar tools.
            </div>
          </div>
        )}

        {/* Dimensions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-white/90">
              Dimensions
            </label>
            <Toggle
              checked={customDimensions}
              onChange={setCustomDimensions}
              label=""
              size="sm"
            />
          </div>

          {customDimensions ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Width</label>
                  <input
                    type="number"
                    value={exportOptions.width}
                    onChange={(e) => updateOptions({ width: parseInt(e.target.value) || 1920 })}
                    className="glass-input w-full text-sm"
                    min="100"
                    max="7680"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Height</label>
                  <input
                    type="number"
                    value={exportOptions.height}
                    onChange={(e) => updateOptions({ height: parseInt(e.target.value) || 1080 })}
                    className="glass-input w-full text-sm"
                    min="100"
                    max="4320"
                  />
                </div>
              </div>
              
              <div className="text-xs text-white/50 text-center">
                Aspect Ratio: {(exportOptions.width / exportOptions.height).toFixed(2)}:1
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {presetDimensions.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset)}
                  className={`
                    glass-card p-2 text-left transition-all duration-200
                    ${exportOptions.width === preset.width && exportOptions.height === preset.height
                      ? 'ring-2 ring-blue-500/50 bg-blue-500/10'
                      : 'hover:bg-white/5'
                    }
                  `}
                >
                  <div className="text-sm font-medium text-white/90">{preset.name}</div>
                  <div className="text-xs text-white/60">{preset.width} × {preset.height}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/90">Exporting...</span>
              <span className="text-white/70">{exportProgress}%</span>
            </div>
            <div className="glass-progress">
              <div 
                className="glass-progress-fill"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isExporting}
          onClick={handleExport}
          glow
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          {isExporting ? 'Exporting...' : `Export ${
            exportOptions.format === 'standalone' ? 'HTML' :
            exportOptions.format === 'wallpaper' ? 'Wallpaper' :
            exportOptions.format.toUpperCase()
          }`}
        </Button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Copy current view to clipboard
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          >
            Copy
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Share functionality
              if (navigator.share) {
                navigator.share({
                  title: 'Sacred Grid Creation',
                  text: 'Check out this sacred geometry pattern I created!',
                  url: window.location.href
                });
              } else {
                // Fallback to copy URL
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            }
          >
            Share
          </Button>
        </div>

        {/* Export History */}
        <div className="text-xs text-white/50">
          <div className="font-medium mb-2">Recent Exports</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>sacred-grid-1920x1080.png</span>
              <span>2.3 MB</span>
            </div>
            <div className="flex justify-between">
              <span>mandala-pattern.svg</span>
              <span>45 KB</span>
            </div>
            <div className="flex justify-between">
              <span>flower-of-life-4k.png</span>
              <span>8.7 MB</span>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};

export default ExportControls;