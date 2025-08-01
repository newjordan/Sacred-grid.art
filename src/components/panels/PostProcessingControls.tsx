// src/components/panels/PostProcessingControls.tsx - Post-Processing Effects Control Panel
// Comprehensive UI for controlling MilkDrop-inspired and traditional post-processing effects

import React, { useState, useCallback } from 'react';
import { PostProcessingConfig } from '../../postprocessing/MilkDropPostProcessor';
import { Toggle } from '../ui/Toggle';
import { Slider } from '../ui/Slider';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface PostProcessingControlsProps {
  config: PostProcessingConfig;
  onConfigChange: (config: Partial<PostProcessingConfig>) => void;
  onPresetLoad: (presetName: string) => void;
  onPresetSave: (presetName: string) => void;
  performanceMetrics?: {
    processingTime: number;
    effectsEnabled: number;
    frameCount: number;
  };
}

interface ExpandedSections {
  warp: boolean;
  feedback: boolean;
  colorCycle: boolean;
  bloom: boolean;
  chromatic: boolean;
  screen: boolean;
  motion: boolean;
  presets: boolean;
  performance: boolean;
}

export const PostProcessingControls: React.FC<PostProcessingControlsProps> = ({
  config,
  onConfigChange,
  onPresetLoad,
  onPresetSave,
  performanceMetrics
}) => {
  const [expanded, setExpanded] = useState<ExpandedSections>({
    warp: false,
    feedback: false,
    colorCycle: false,
    bloom: false,
    chromatic: false,
    screen: false,
    motion: false,
    presets: false,
    performance: false
  });

  const [customPresetName, setCustomPresetName] = useState('');

  const toggleSection = useCallback((section: keyof ExpandedSections) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const updateWarpConfig = useCallback((updates: Partial<typeof config.warp>) => {
    onConfigChange({ warp: { ...config.warp, ...updates } });
  }, [config.warp, onConfigChange]);

  const updateFeedbackConfig = useCallback((updates: Partial<typeof config.screen.feedback>) => {
    onConfigChange({ 
      screen: { 
        ...config.screen, 
        feedback: { ...config.screen.feedback, ...updates } 
      } 
    });
  }, [config.screen, onConfigChange]);

  const updateColorConfig = useCallback((updates: Partial<typeof config.color.colorShift>) => {
    onConfigChange({ 
      color: { 
        ...config.color, 
        colorShift: { ...config.color.colorShift, ...updates } 
      } 
    });
  }, [config.color, onConfigChange]);

  const builtInPresets = [
    'Psychedelic Warp',
    'Gentle Feedback',
    'Color Storm',
    'Tunnel Vision',
    'Kaleidoscope Dreams',
    'Retro CRT',
    'Film Noir',
    'Cyberpunk Glow',
    'Minimal Clean'
  ];

  return (
    <div className="post-processing-controls">
      <div className="panel-header">
        <h3>🌈 Post-Processing Effects</h3>
        <div className="effect-count">
          {performanceMetrics?.effectsEnabled || 0} effects active
        </div>
      </div>

      {/* MilkDrop-Inspired Effects */}
      <div className="effect-category milkdrop-category">
        <h4 className="category-title">🎨 MilkDrop-Inspired Effects</h4>
        
        {/* Screen Warping */}
        <div className="effect-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('warp')}
          >
            <Toggle
              checked={config.warp?.enabled || false}
              onChange={(enabled) => updateWarpConfig({ enabled })}
              label="Screen Warping"
              description="Geometric distortion effects"
            />
            <span className={`expand-icon ${expanded.warp ? 'expanded' : ''}`}>▼</span>
          </div>
          
          {expanded.warp && (
            <div className="section-content">
              <Select
                value={config.warp?.type || 'radial'}
                onChange={(type) => updateWarpConfig({ type: type as any })}
                options={[
                  { value: 'radial', label: 'Radial Push/Pull' },
                  { value: 'spiral', label: 'Spiral Twist' },
                  { value: 'wave', label: 'Wave Distortion' },
                  { value: 'tunnel', label: 'Tunnel Effect' },
                  { value: 'kaleidoscope', label: 'Kaleidoscope' },
                  { value: 'fisheye', label: 'Fisheye Lens' },
                  { value: 'ripple', label: 'Ripple Waves' }
                ]}
                label="Warp Type"
              />
              
              <Slider
                value={config.warp?.intensity || 0.5}
                onChange={(intensity) => updateWarpConfig({ intensity })}
                min={0}
                max={1}
                step={0.01}
                label="Intensity"
                description="Overall warp strength"
              />
              
              <Slider
                value={config.warp?.speed || 1}
                onChange={(speed) => updateWarpConfig({ speed })}
                min={0}
                max={5}
                step={0.1}
                label="Animation Speed"
                description="Speed of warp animation"
              />
              
              <Slider
                value={config.warp?.frequency || 2}
                onChange={(frequency) => updateWarpConfig({ frequency })}
                min={0.1}
                max={10}
                step={0.1}
                label="Frequency"
                description="Wave frequency for wave-based warps"
              />
              
              <div className="dual-slider">
                <Slider
                  value={config.warp?.centerX || 0.5}
                  onChange={(centerX) => updateWarpConfig({ centerX })}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Center X"
                  description="Horizontal warp center"
                />
                <Slider
                  value={config.warp?.centerY || 0.5}
                  onChange={(centerY) => updateWarpConfig({ centerY })}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Center Y"
                  description="Vertical warp center"
                />
              </div>
            </div>
          )}
        </div>

        {/* Feedback Loops */}
        <div className="effect-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('feedback')}
          >
            <Toggle
              checked={config.screen?.feedback?.enabled || false}
              onChange={(enabled) => updateFeedbackConfig({ enabled })}
              label="Feedback Loops"
              description="MilkDrop's signature trail effect"
            />
            <span className={`expand-icon ${expanded.feedback ? 'expanded' : ''}`}>▼</span>
          </div>
          
          {expanded.feedback && (
            <div className="section-content">
              <Slider
                value={config.screen?.feedback?.intensity || 0.95}
                onChange={(intensity) => updateFeedbackConfig({ intensity })}
                min={0}
                max={1}
                step={0.01}
                label="Feedback Intensity"
                description="Strength of feedback effect"
              />
              
              <Slider
                value={config.screen?.feedback?.decay || 0.98}
                onChange={(decay) => updateFeedbackConfig({ decay })}
                min={0.8}
                max={1}
                step={0.001}
                label="Decay Rate"
                description="How quickly trails fade"
              />
              
              <Slider
                value={config.screen?.feedback?.zoom || 1.01}
                onChange={(zoom) => updateFeedbackConfig({ zoom })}
                min={0.95}
                max={1.05}
                step={0.001}
                label="Zoom Factor"
                description="Zoom per frame"
              />
              
              <Slider
                value={config.screen?.feedback?.rotation || 0.01}
                onChange={(rotation) => updateFeedbackConfig({ rotation })}
                min={-0.1}
                max={0.1}
                step={0.001}
                label="Rotation"
                description="Rotation per frame"
              />
              
              <div className="dual-slider">
                <Slider
                  value={config.screen?.feedback?.offsetX || 0}
                  onChange={(offsetX) => updateFeedbackConfig({ offsetX })}
                  min={-10}
                  max={10}
                  step={0.1}
                  label="X Offset"
                  description="Horizontal drift"
                />
                <Slider
                  value={config.screen?.feedback?.offsetY || 0}
                  onChange={(offsetY) => updateFeedbackConfig({ offsetY })}
                  min={-10}
                  max={10}
                  step={0.1}
                  label="Y Offset"
                  description="Vertical drift"
                />
              </div>
            </div>
          )}
        </div>

        {/* Color Cycling */}
        <div className="effect-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('colorCycle')}
          >
            <Toggle
              checked={config.color?.colorShift?.enabled || false}
              onChange={(enabled) => updateColorConfig({ enabled })}
              label="Color Cycling"
              description="Dynamic color transformations"
            />
            <span className={`expand-icon ${expanded.colorCycle ? 'expanded' : ''}`}>▼</span>
          </div>
          
          {expanded.colorCycle && (
            <div className="section-content">
              <Slider
                value={config.color?.colorShift?.hueShift || 0}
                onChange={(hueShift) => updateColorConfig({ hueShift })}
                min={-180}
                max={180}
                step={1}
                label="Hue Shift"
                description="Color hue rotation"
              />
              
              <Slider
                value={config.color?.colorShift?.saturation || 1}
                onChange={(saturation) => updateColorConfig({ saturation })}
                min={0}
                max={2}
                step={0.01}
                label="Saturation"
                description="Color intensity"
              />
              
              <Slider
                value={config.color?.colorShift?.brightness || 1}
                onChange={(brightness) => updateColorConfig({ brightness })}
                min={0}
                max={2}
                step={0.01}
                label="Brightness"
                description="Overall brightness"
              />
              
              <Slider
                value={config.color?.colorShift?.contrast || 1}
                onChange={(contrast) => updateColorConfig({ contrast })}
                min={0}
                max={2}
                step={0.01}
                label="Contrast"
                description="Color contrast"
              />
            </div>
          )}
        </div>
      </div>

      {/* Presets Section */}
      <div className="effect-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('presets')}
        >
          <span className="section-title">🎭 Effect Presets</span>
          <span className={`expand-icon ${expanded.presets ? 'expanded' : ''}`}>▼</span>
        </div>
        
        {expanded.presets && (
          <div className="section-content">
            <div className="preset-grid">
              {builtInPresets.map(preset => (
                <Button
                  key={preset}
                  onClick={() => onPresetLoad(preset)}
                  variant="secondary"
                  size="small"
                  className="preset-button"
                >
                  {preset}
                </Button>
              ))}
            </div>
            
            <div className="custom-preset">
              <input
                type="text"
                value={customPresetName}
                onChange={(e) => setCustomPresetName(e.target.value)}
                placeholder="Custom preset name..."
                className="glass-input"
              />
              <Button
                onClick={() => {
                  if (customPresetName.trim()) {
                    onPresetSave(customPresetName.trim());
                    setCustomPresetName('');
                  }
                }}
                variant="primary"
                size="small"
                disabled={!customPresetName.trim()}
              >
                Save Preset
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Performance Monitoring */}
      {performanceMetrics && (
        <div className="effect-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('performance')}
          >
            <span className="section-title">📊 Performance</span>
            <span className={`expand-icon ${expanded.performance ? 'expanded' : ''}`}>▼</span>
          </div>
          
          {expanded.performance && (
            <div className="section-content performance-metrics">
              <div className="metric">
                <span className="metric-label">Processing Time:</span>
                <span className="metric-value">{performanceMetrics.processingTime.toFixed(2)}ms</span>
              </div>
              <div className="metric">
                <span className="metric-label">Effects Active:</span>
                <span className="metric-value">{performanceMetrics.effectsEnabled}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Frames Processed:</span>
                <span className="metric-value">{performanceMetrics.frameCount}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
