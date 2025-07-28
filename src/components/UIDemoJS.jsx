// src/components/UIDemoJS.jsx - Demo page to showcase new UI components (JS version)

import React, { useState } from 'react';

// Import our styles
import '../styles/design-tokens.css';
import '../styles/glassmorphism.css';
import '../styles/animations.css';
import '../styles/themes.css';
import '../styles/utilities.css';

const UIDemoJS = () => {
  // Demo state
  const [sliderValue, setSliderValue] = useState(50);
  const [toggleValue, setToggleValue] = useState(false);
  const [colorValue, setColorValue] = useState('#0077ff');
  const [activePanel, setActivePanel] = useState('components');

  // Simple button component for demo
  const DemoButton = ({ children, variant = 'default', onClick, className = '' }) => {
    const variantClasses = {
      default: 'glass-button bg-white/5 border-white/20 text-white hover:bg-white/10',
      primary: 'glass-button-primary bg-blue-500/20 border-blue-400/40 text-blue-200 hover:bg-blue-500/30',
      ghost: 'bg-transparent border-transparent text-white hover:bg-white/10'
    };

    return (
      <button
        className={`
          relative inline-flex items-center justify-center font-medium
          transition-all duration-300 ease-out focus:outline-none
          px-4 py-2 text-sm h-10 rounded-lg cursor-pointer
          ${variantClasses[variant]} ${className}
        `}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };

  // Simple glass panel component
  const DemoPanel = ({ children, title, className = '' }) => (
    <div className={`glass-panel p-6 animate-fade-in ${className}`}>
      {title && <h3 className="text-lg font-semibold text-white/90 mb-4">{title}</h3>}
      {children}
    </div>
  );

  // Simple slider component
  const DemoSlider = ({ label, value, onChange, min = 0, max = 100 }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <label className="text-white/90">{label}</label>
        <span className="text-white/70">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="glass-slider w-full"
      />
    </div>
  );

  // Simple toggle component
  const DemoToggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
      <span className="text-white/90 text-sm">{label}</span>
      <button
        className={`
          glass-toggle w-11 h-6 rounded-full transition-all duration-300
          ${checked ? 'bg-blue-500/30 border-blue-400' : 'bg-white/10 border-white/20'}
        `}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`
            w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );

  // Simple color picker
  const DemoColorPicker = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="block text-sm text-white/90">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 glass-button border-2 border-white/20 rounded-lg overflow-hidden cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="glass-input flex-1 text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );

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
              { id: 'panels', label: 'Glass Panels' },
              { id: 'buttons', label: 'Buttons' },
              { id: 'interactive', label: 'Interactive' }
            ].map(panel => (
              <DemoButton
                key={panel.id}
                variant={activePanel === panel.id ? 'primary' : 'ghost'}
                onClick={() => setActivePanel(panel.id)}
              >
                {panel.label}
              </DemoButton>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Basic Components */}
          {activePanel === 'components' && (
            <DemoPanel title="Basic Components" className="animate-slide-in-up">
              <div className="space-y-4">
                <DemoSlider
                  label="Demo Slider"
                  value={sliderValue}
                  onChange={setSliderValue}
                />
                
                <DemoToggle
                  label="Demo Toggle"
                  checked={toggleValue}
                  onChange={setToggleValue}
                />
                
                <DemoColorPicker
                  label="Demo Color"
                  value={colorValue}
                  onChange={setColorValue}
                />

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-white/60">
                    These are simplified versions of our full component library. 
                    The complete TypeScript components have many more features!
                  </p>
                </div>
              </div>
            </DemoPanel>
          )}

          {/* Glass Panels */}
          {activePanel === 'panels' && (
            <>
              <DemoPanel title="Default Panel" className="animate-slide-in-left">
                <p className="text-white/70">
                  Standard glass panel with subtle transparency and backdrop blur.
                </p>
              </DemoPanel>

              <div className="glass-panel-floating p-6 animate-slide-in-up">
                <h3 className="text-lg font-semibold text-white/90 mb-4">Floating Panel</h3>
                <p className="text-white/70">
                  Enhanced floating panel with stronger glass effects and shadows.
                </p>
              </div>

              <div className="glass-light p-6 animate-slide-in-right">
                <h3 className="text-lg font-semibold text-white/90 mb-4">Light Panel</h3>
                <p className="text-white/70">
                  Light variant with reduced blur for subtle glass effect.
                </p>
              </div>
            </>
          )}

          {/* Buttons */}
          {activePanel === 'buttons' && (
            <DemoPanel title="Button Variants" className="animate-slide-in-down">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <DemoButton variant="default">Default</DemoButton>
                  <DemoButton variant="primary">Primary</DemoButton>
                  <DemoButton variant="ghost">Ghost</DemoButton>
                  <DemoButton variant="default">Outline</DemoButton>
                </div>
                
                <DemoButton variant="primary" className="w-full">
                  Full Width Button
                </DemoButton>

                <div className="flex gap-2">
                  <DemoButton variant="primary" className="flex-1">Action</DemoButton>
                  <DemoButton variant="ghost" className="flex-1">Cancel</DemoButton>
                </div>
              </div>
            </DemoPanel>
          )}

          {/* Interactive Demo */}
          {activePanel === 'interactive' && (
            <DemoPanel title="Interactive Demo" className="animate-slide-in-up">
              <div className="space-y-4">
                <div className="text-center">
                  <div 
                    className="w-24 h-24 mx-auto rounded-lg transition-all duration-300 hover:scale-110"
                    style={{ 
                      backgroundColor: colorValue,
                      opacity: sliderValue / 100,
                      transform: toggleValue ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  />
                </div>
                
                <div className="text-center text-sm text-white/70">
                  <p>Color: {colorValue}</p>
                  <p>Opacity: {sliderValue}%</p>
                  <p>Rotated: {toggleValue ? 'Yes' : 'No'}</p>
                </div>

                <DemoButton 
                  variant="primary" 
                  className="w-full"
                  onClick={() => {
                    setColorValue('#' + Math.floor(Math.random()*16777215).toString(16));
                    setSliderValue(Math.floor(Math.random() * 100));
                    setToggleValue(!toggleValue);
                  }}
                >
                  🎲 Randomize All
                </DemoButton>
              </div>
            </DemoPanel>
          )}
        </div>

        {/* Feature Showcase */}
        <div className="mt-12">
          <DemoPanel title="Glassmorphism Features" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass p-4 rounded-lg">
                <h4 className="font-medium mb-2">✨ Backdrop Blur</h4>
                <p className="text-sm text-white/70">CSS backdrop-filter creates the glass effect</p>
              </div>
              
              <div className="glass-light p-4 rounded-lg">
                <h4 className="font-medium mb-2">🎨 Multiple Variants</h4>
                <p className="text-sm text-white/70">Light, heavy, subtle, and floating options</p>
              </div>
              
              <div className="glass-heavy p-4 rounded-lg">
                <h4 className="font-medium mb-2">⚡ Smooth Animations</h4>
                <p className="text-sm text-white/70">CSS transitions and micro-interactions</p>
              </div>
              
              <div className="glass-subtle p-4 rounded-lg">
                <h4 className="font-medium mb-2">📱 Responsive Design</h4>
                <p className="text-sm text-white/70">Mobile-optimized with touch support</p>
              </div>
            </div>
          </DemoPanel>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/50">
          <p>Sacred Grid Canvas2D - Modern Glassmorphism UI</p>
          <p className="text-sm">This is a simplified demo. The full TypeScript components have many more features!</p>
        </div>
      </div>
    </div>
  );
};

export default UIDemoJS;