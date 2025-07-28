// src/components/panels/ShapeControls.tsx - Shape-specific controls with modern UI

import React from 'react';
import { ShapeConfig, ShapeType, AnimationMode } from '../../types';
import GlassPanel from '../ui/GlassPanel';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';
import ColorPicker from '../ui/ColorPicker';
import Accordion from '../ui/Accordion';

export interface ShapeControlsProps {
  config: ShapeConfig;
  onChange: (updates: Partial<ShapeConfig>) => void;
  onReset: () => void;
  onRandomize: () => void;
  className?: string;
}

const ShapeControls: React.FC<ShapeControlsProps> = ({
  config,
  onChange,
  onReset,
  onRandomize,
  className = ''
}) => {
  // Shape type options
  const shapeTypes = [
    { value: ShapeType.POLYGON, label: 'Polygon' },
    { value: ShapeType.STAR, label: 'Star' },
    { value: ShapeType.CIRCLE, label: 'Circle' },
    { value: ShapeType.FLOWER_OF_LIFE, label: 'Flower of Life' },
    { value: ShapeType.MERKABA, label: 'Merkaba' },
    { value: ShapeType.SPIRAL, label: 'Spiral' },
    { value: ShapeType.LISSAJOUS, label: 'Lissajous' },
    { value: ShapeType.HEXAGON, label: 'Hexagon' },
    { value: ShapeType.PENTAGON, label: 'Pentagon' },
    { value: ShapeType.METATRONS_CUBE, label: "Metatron's Cube" },
    { value: ShapeType.TREE_OF_LIFE, label: 'Tree of Life' },
    { value: ShapeType.FIBONACCI_SPIRAL, label: 'Fibonacci Spiral' },
    { value: ShapeType.GOLDEN_RECTANGLE, label: 'Golden Rectangle' },
    { value: ShapeType.MANDALA, label: 'Mandala' }
  ];

  // Animation mode options
  const animationModes = [
    { value: AnimationMode.GROW, label: 'Grow' },
    { value: AnimationMode.PULSE, label: 'Pulse' },
    { value: AnimationMode.ORBIT, label: 'Orbit' },
    { value: AnimationMode.WAVEFORM, label: 'Waveform' },
    { value: AnimationMode.SPIRAL, label: 'Spiral' },
    { value: AnimationMode.HARMONIC, label: 'Harmonic' },
    { value: AnimationMode.SWARM, label: 'Swarm' },
    { value: AnimationMode.BREATHE, label: 'Breathe' }
  ];

  // Update helper
  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.');
    const updates: any = {};
    let current = updates;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(updates);
  };

  // Accordion sections
  const accordionSections = [
    {
      id: 'basic',
      title: 'Basic Properties',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      children: (
        <div className="space-y-4">
          {/* Shape Type */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Shape Type
            </label>
            <select
              value={config.type}
              onChange={(e) => updateConfig('type', e.target.value as ShapeType)}
              className="glass-input w-full"
            >
              {shapeTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <Slider
            label="Size"
            value={config.size}
            onChange={(value) => updateConfig('size', value)}
            min={10}
            max={1000}
            step={5}
            formatValue={(val) => `${val}px`}
          />

          {/* Opacity */}
          <Slider
            label="Opacity"
            value={config.opacity * 100}
            onChange={(value) => updateConfig('opacity', value / 100)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
          />

          {/* Thickness */}
          <Slider
            label="Line Thickness"
            value={config.thickness}
            onChange={(value) => updateConfig('thickness', value)}
            min={0.1}
            max={20}
            step={0.1}
            formatValue={(val) => `${val}px`}
          />

          {/* Vertices (for applicable shapes) */}
          {(config.type === ShapeType.POLYGON || config.type === ShapeType.STAR) && (
            <Slider
              label="Vertices"
              value={config.vertices || 3}
              onChange={(value) => updateConfig('vertices', value)}
              min={3}
              max={20}
              step={1}
            />
          )}

          {/* Rotation */}
          <Slider
            label="Rotation"
            value={config.rotation * (180 / Math.PI)}
            onChange={(value) => updateConfig('rotation', value * (Math.PI / 180))}
            min={0}
            max={360}
            step={1}
            formatValue={(val) => `${val}°`}
          />
        </div>
      )
    },
    {
      id: 'position',
      title: 'Position & Transform',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
      ),
      children: (
        <div className="space-y-4">
          {/* Position X */}
          <Slider
            label="Position X"
            value={config.position.x}
            onChange={(value) => updateConfig('position.x', value)}
            min={-500}
            max={500}
            step={1}
            formatValue={(val) => `${val}px`}
          />

          {/* Position Y */}
          <Slider
            label="Position Y"
            value={config.position.y}
            onChange={(value) => updateConfig('position.y', value)}
            min={-500}
            max={500}
            step={1}
            formatValue={(val) => `${val}px`}
          />

          {/* Use Line Factory */}
          <Toggle
            checked={config.useLineFactory}
            onChange={(checked) => updateConfig('useLineFactory', checked)}
            label="Use Advanced Line Effects"
            description="Apply special line effects like glow, taper, and waves"
          />
        </div>
      )
    },
    {
      id: 'fractal',
      title: 'Fractal Properties',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      children: (
        <div className="space-y-4">
          {/* Fractal Depth */}
          <Slider
            label="Fractal Depth"
            value={config.fractal.depth}
            onChange={(value) => updateConfig('fractal.depth', value)}
            min={1}
            max={8}
            step={1}
            description="Number of recursive iterations"
          />

          {/* Fractal Scale */}
          <Slider
            label="Scale Factor"
            value={config.fractal.scale * 100}
            onChange={(value) => updateConfig('fractal.scale', value / 100)}
            min={10}
            max={90}
            step={1}
            formatValue={(val) => `${val}%`}
            description="Size reduction for each iteration"
          />

          {/* Thickness Falloff */}
          <Slider
            label="Thickness Falloff"
            value={config.fractal.thicknessFalloff * 100}
            onChange={(value) => updateConfig('fractal.thicknessFalloff', value / 100)}
            min={10}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
            description="Line thickness reduction per iteration"
          />

          {/* Child Count */}
          <Slider
            label="Child Count"
            value={config.fractal.childCount}
            onChange={(value) => updateConfig('fractal.childCount', value)}
            min={1}
            max={12}
            step={1}
            description="Number of child fractals per iteration"
          />

          {/* Sacred Positioning */}
          <Toggle
            checked={config.fractal.sacredPositioning}
            onChange={(checked) => updateConfig('fractal.sacredPositioning', checked)}
            label="Sacred Positioning"
            description="Use golden ratio for fractal positioning"
          />

          {/* Sacred Intensity */}
          {config.fractal.sacredPositioning && (
            <Slider
              label="Sacred Intensity"
              value={config.fractal.sacredIntensity * 100}
              onChange={(value) => updateConfig('fractal.sacredIntensity', value / 100)}
              min={0}
              max={100}
              step={1}
              formatValue={(val) => `${val}%`}
            />
          )}
        </div>
      )
    },
    {
      id: 'animation',
      title: 'Animation Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 110 5H9V10z" />
        </svg>
      ),
      children: (
        <div className="space-y-4">
          {/* Animation Mode */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Animation Mode
            </label>
            <select
              value={config.animation.mode}
              onChange={(e) => updateConfig('animation.mode', e.target.value as AnimationMode)}
              className="glass-input w-full"
            >
              {animationModes.map(mode => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {/* Animation Speed */}
          <Slider
            label="Speed"
            value={config.animation.speed * 10000}
            onChange={(value) => updateConfig('animation.speed', value / 10000)}
            min={1}
            max={50}
            step={0.1}
            formatValue={(val) => `${val.toFixed(1)}x`}
          />

          {/* Animation Intensity */}
          <Slider
            label="Intensity"
            value={config.animation.intensity * 100}
            onChange={(value) => updateConfig('animation.intensity', value / 100)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
          />

          {/* Reverse Animation */}
          <Toggle
            checked={config.animation.reverse}
            onChange={(checked) => updateConfig('animation.reverse', checked)}
            label="Reverse Animation"
            description="Play animation in reverse direction"
          />

          {/* Variable Timing */}
          <Toggle
            checked={config.animation.variableTiming}
            onChange={(checked) => updateConfig('animation.variableTiming', checked)}
            label="Variable Timing"
            description="Use variable timing for more organic feel"
          />

          {/* Fade In/Out */}
          <Slider
            label="Fade In Duration"
            value={config.animation.fadeIn * 100}
            onChange={(value) => updateConfig('animation.fadeIn', value / 100)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
          />

          <Slider
            label="Fade Out Duration"
            value={config.animation.fadeOut * 100}
            onChange={(value) => updateConfig('animation.fadeOut', value / 100)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
          />

          {/* Stagger Delay */}
          <Slider
            label="Stagger Delay"
            value={config.animation.staggerDelay}
            onChange={(value) => updateConfig('animation.staggerDelay', value)}
            min={0}
            max={500}
            step={10}
            formatValue={(val) => `${val}ms`}
            description="Delay between animated elements"
          />
        </div>
      )
    },
    {
      id: 'stacking',
      title: 'Stacking & Layers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      children: (
        <div className="space-y-4">
          {/* Enable Stacking */}
          <Toggle
            checked={config.stacking.enabled}
            onChange={(checked) => updateConfig('stacking.enabled', checked)}
            label="Enable Stacking"
            description="Create multiple layers of the same shape"
          />

          {config.stacking.enabled && (
            <>
              {/* Stack Count */}
              <Slider
                label="Stack Count"
                value={config.stacking.count}
                onChange={(value) => updateConfig('stacking.count', value)}
                min={1}
                max={10}
                step={1}
                description="Number of stacked layers"
              />

              {/* Time Offset */}
              <Slider
                label="Time Offset"
                value={config.stacking.timeOffset}
                onChange={(value) => updateConfig('stacking.timeOffset', value)}
                min={-5000}
                max={5000}
                step={100}
                formatValue={(val) => `${val}ms`}
                description="Animation timing offset between layers"
              />

              {/* Interval */}
              <Slider
                label="Layer Interval"
                value={config.stacking.interval}
                onChange={(value) => updateConfig('stacking.interval', value)}
                min={100}
                max={3000}
                step={50}
                formatValue={(val) => `${val}ms`}
                description="Time between layer appearances"
              />
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <GlassPanel
      variant="floating"
      className={`w-80 max-h-[80vh] overflow-y-auto ${className}`}
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white/90">Shape Controls</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onRandomize}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Random
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Reset
            </Button>
          </div>
        </div>
      }
    >
      <Accordion
        items={accordionSections}
        variant="glass"
        allowMultiple
        animated
      />
    </GlassPanel>
  );
};

export default ShapeControls;