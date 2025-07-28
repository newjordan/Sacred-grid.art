// src/components/UIDemo.tsx - Demo page to showcase new UI components

import React, { useState } from 'react';
import GlassPanel from './ui/GlassPanel';
import Button from './ui/Button';
import Slider from './ui/Slider';
import Toggle from './ui/Toggle';
import ColorPicker from './ui/ColorPicker';
import Accordion from './ui/Accordion';
import ShapeControls from './panels/ShapeControls';
import AnimationControls from './panels/AnimationControls';
import LayerControls from './panels/LayerControls';
import ExportControls from './panels/ExportControls';
import { ShapeType, AnimationMode, BlendMode } from '../types';

// Import our styles
import '../styles/design-tokens.css';
import '../styles/glassmorphism.css';
import '../styles/animations.css';
import '../styles/themes.css';
import '../styles/utilities.css';

const UIDemo: React.FC = () => {
  // Demo state
  const [sliderValue, setSliderValue] = useState(50);
  const [toggleValue, setToggleValue] = useState(false);
  const [colorValue, setColorValue] = useState('#0077ff');
  const [activePanel, setActivePanel] = useState<string | null>('shapes');

  // Mock shape config
  const [shapeConfig, setShapeConfig] = useState({
    type: ShapeType.POLYGON,
    size: 350,
    opacity: 1.0,
    thickness: 6,
    vertices: 5,
    rotation: 0,
    position: { x: 0, y: 0 },
    useLineFactory: false,
    fractal: {
      depth: 1,
      scale: 0.5,
      thicknessFalloff: 0.8,
      childCount: 3,
      sacredPositioning: true,
      sacredIntensity: 0.5
    },
    animation: {
      mode: AnimationMode.GROW,
      reverse: false,
      speed: 0.0008,
      intensity: 0.2,
      fadeIn: 0.2,
      fadeOut: 0.2,
      variableTiming: true,
      staggerDelay: 100
    },
    stacking: {
      enabled: true,
      count: 3,
      timeOffset: -3000,
      interval: 1000
    }
  });

  // Mock animation state
  const [animationState, setAnimationState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 10000,
    speed: 1,
    loop: true
  });

  // Mock layers
  const [layers, setLayers] = useState([
    {
      id: 'layer1',
      name: 'Background',
      visible: true,
      opacity: 1,
      blendMode: BlendMode.NORMAL,
      zIndex: 0,
      locked: false
    },
    {
      id: 'layer2',
      name: 'Main Pattern',
      visible: true,
      opacity: 0.8,
      blendMode: BlendMode.MULTIPLY,
      zIndex: 1,
      locked: false
    }
  ]);

  const [activeLayerId, setActiveLayerId] = useState('layer1');

  // Accordion demo items
  const accordionItems = [
    {
      id: 'basic',
      title: 'Basic Components',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      children: (
        <div className="space-y-4">
          <Slider
            label="Demo Slider"
            value={sliderValue}
            onChange={setSliderValue}
            min={0}
            max={100}
            formatValue={(val) => `${val}%`}
          />
          
          <Toggle
            checked={toggleValue}
            onChange={setToggleValue}
            label="Demo Toggle"
            description="This is a demo toggle component"
          />
          
          <ColorPicker
            label="Demo Color"
            value={colorValue}
            onChange={setColorValue}
          />
        </div>
      )
    },
    {
      id: 'buttons',
      title: 'Button Variants',
      children: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="default" size="sm">Default</Button>
            <Button variant="primary" size="sm">Primary</Button>
            <Button variant="secondary" size="sm">Secondary</Button>
            <Button variant="accent" size="sm">Accent</Button>
            <Button variant="success" size="sm">Success</Button>
            <Button variant="warning" size="sm">Warning</Button>
            <Button variant="error" size="sm">Error</Button>
            <Button variant="ghost" size="sm">Ghost</Button>
          </div>
          
          <Button 
            variant="primary" 
            fullWidth 
            glow
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          >
            Glow Button with Icon
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6" style={{ 
      backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(0, 119, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 255, 204, 0.1) 0%, transparent 50%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Sacred Grid UI Demo
          </h1>
          <p className="text-white/70">
            Showcasing our new glassmorphism design system
          </p>
        </div>

        {/* Panel Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 glass-panel p-2">
            {[
              { id: 'components', label: 'Components' },
              { id: 'shapes', label: 'Shape Controls' },
              { id: 'animation', label: 'Animation' },
              { id: 'layers', label: 'Layers' },
              { id: 'export', label: 'Export' }
            ].map(panel => (
              <Button
                key={panel.id}
                size="sm"
                variant={activePanel === panel.id ? 'primary' : 'ghost'}
                onClick={() => setActivePanel(activePanel === panel.id ? null : panel.id)}
              >
                {panel.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Demo Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Basic Components Demo */}
          {activePanel === 'components' && (
            <div className="lg:col-span-2 xl:col-span-1">
              <GlassPanel
                variant="floating"
                header={<h3 className="text-lg font-semibold">Component Showcase</h3>}
                className="animate-slide-in-up"
              >
                <Accordion
                  items={accordionItems}
                  variant="glass"
                  allowMultiple
                  animated
                />
              </GlassPanel>
            </div>
          )}

          {/* Shape Controls */}
          {activePanel === 'shapes' && (
            <div className="animate-slide-in-left">
              <ShapeControls
                config={shapeConfig}
                onChange={(updates) => setShapeConfig(prev => ({ ...prev, ...updates }))}
                onReset={() => console.log('Reset shape')}
                onRandomize={() => console.log('Randomize shape')}
              />
            </div>
          )}

          {/* Animation Controls */}
          {activePanel === 'animation' && (
            <div className="animate-slide-in-up">
              <AnimationControls
                animationState={animationState}
                onStateChange={(updates) => setAnimationState(prev => ({ ...prev, ...updates }))}
                onPlay={() => setAnimationState(prev => ({ ...prev, isPlaying: true }))}
                onPause={() => setAnimationState(prev => ({ ...prev, isPlaying: false }))}
                onStop={() => setAnimationState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))}
                onSeek={(time) => setAnimationState(prev => ({ ...prev, currentTime: time }))}
              />
            </div>
          )}

          {/* Layer Controls */}
          {activePanel === 'layers' && (
            <div className="animate-slide-in-right">
              <LayerControls
                layers={layers}
                activeLayerId={activeLayerId}
                onLayerAdd={() => {
                  const newLayer = {
                    id: `layer${layers.length + 1}`,
                    name: `Layer ${layers.length + 1}`,
                    visible: true,
                    opacity: 1,
                    blendMode: BlendMode.NORMAL,
                    zIndex: layers.length,
                    locked: false
                  };
                  setLayers(prev => [...prev, newLayer]);
                }}
                onLayerRemove={(id) => setLayers(prev => prev.filter(l => l.id !== id))}
                onLayerUpdate={(id, updates) => {
                  setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
                }}
                onLayerReorder={(layerIds) => {
                  const reordered = layerIds.map(id => layers.find(l => l.id === id)!);
                  setLayers(reordered);
                }}
                onLayerSelect={setActiveLayerId}
                onLayerDuplicate={(id) => {
                  const layer = layers.find(l => l.id === id);
                  if (layer) {
                    const duplicate = {
                      ...layer,
                      id: `${layer.id}_copy`,
                      name: `${layer.name} Copy`
                    };
                    setLayers(prev => [...prev, duplicate]);
                  }
                }}
              />
            </div>
          )}

          {/* Export Controls */}
          {activePanel === 'export' && (
            <div className="animate-slide-in-down">
              <ExportControls
                onExport={async (options) => {
                  console.log('Exporting with options:', options);
                  // Simulate export delay
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }}
              />
            </div>
          )}
        </div>

        {/* Theme Showcase */}
        <div className="mt-12">
          <GlassPanel
            variant="floating"
            header={<h3 className="text-lg font-semibold">Glass Panel Variants</h3>}
            className="animate-fade-in"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassPanel variant="default" padding="md">
                <h4 className="font-medium mb-2">Default</h4>
                <p className="text-sm text-white/70">Standard glass panel with subtle transparency</p>
              </GlassPanel>
              
              <GlassPanel variant="light" padding="md">
                <h4 className="font-medium mb-2">Light</h4>
                <p className="text-sm text-white/70">Lighter variant with less blur</p>
              </GlassPanel>
              
              <GlassPanel variant="heavy" padding="md">
                <h4 className="font-medium mb-2">Heavy</h4>
                <p className="text-sm text-white/70">Heavy blur for strong glass effect</p>
              </GlassPanel>
              
              <GlassPanel variant="subtle" padding="md">
                <h4 className="font-medium mb-2">Subtle</h4>
                <p className="text-sm text-white/70">Minimal glass effect for clean look</p>
              </GlassPanel>
            </div>
          </GlassPanel>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/50">
          <p>Sacred Grid Canvas2D - Modern Glassmorphism UI</p>
          <p className="text-sm">Built with React, TypeScript, and CSS Custom Properties</p>
        </div>
      </div>
    </div>
  );
};

export default UIDemo;