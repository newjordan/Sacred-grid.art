// src/SacredGridComplete.jsx - Complete Sacred Grid with all new features (JS version for compatibility)
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Simple inline components to replace UI imports
const GlassPanel = ({ children, style }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    ...style
  }}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'medium', onClick, style }) => (
  <button
    onClick={onClick}
    style={{
      background: variant === 'primary' ? 'rgba(0, 119, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: size === 'small' ? '6px 12px' : '10px 16px',
      cursor: 'pointer',
      fontSize: size === 'small' ? '12px' : '14px',
      transition: 'all 0.3s ease',
      ...style
    }}
    onMouseOver={(e) => {
      e.target.style.background = variant === 'primary' ? 'rgba(0, 119, 255, 1)' : 'rgba(255, 255, 255, 0.2)';
    }}
    onMouseOut={(e) => {
      e.target.style.background = variant === 'primary' ? 'rgba(0, 119, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)';
    }}
  >
    {children}
  </button>
);

const Slider = ({ label, value, min, max, step = 1, onChange }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ color: '#ffffff', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
      {label}: {value}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: '100%',
        height: '4px',
        borderRadius: '2px',
        background: 'rgba(255, 255, 255, 0.2)',
        outline: 'none',
        cursor: 'pointer'
      }}
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <label style={{ color: '#ffffff', fontSize: '14px' }}>
      {label}
    </label>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ cursor: 'pointer' }}
    />
  </div>
);

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'left',
          marginBottom: '8px'
        }}
      >
        {title} {isOpen ? '▼' : '▶'}
      </button>
      {isOpen && (
        <div style={{ paddingLeft: '8px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const SacredGridComplete = ({
  width = window.innerWidth,
  height = window.innerHeight
}) => {
  const canvasRef = useRef(null);
  const [currentDemo, setCurrentDemo] = useState('basic');
  const [isAnimating, setIsAnimating] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [rotation, setRotation] = useState(0);

  // Demo configurations
  const [demoConfig, setDemoConfig] = useState({
    basic: {
      radius: 150,
      sides: 6,
      rotation: 0
    },
    spiral: {
      turns: 3,
      radius: 10,
      points: 200
    },
    mandala: {
      symmetry: 8,
      layers: 5
    }
  });

  // Initialize demo
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Start render loop
    let animationId;
    const renderLoop = () => {
      if (!isAnimating) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Set background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
      
      // Render current demo
      renderCurrentDemo(ctx);
      
      // Update rotation
      setRotation(prev => prev + 0.01);
      
      animationId = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [currentDemo, isAnimating, width, height]);

  const renderCurrentDemo = useCallback((ctx) => {
    const center = { x: width / 2, y: height / 2 };

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.translate(-center.x, -center.y);

    switch (currentDemo) {
      case 'basic':
        renderBasicShape(ctx, center);
        break;
      case 'spiral':
        renderSpiral(ctx, center);
        break;
      case 'mandala':
        renderMandala(ctx, center);
        break;
      default:
        renderBasicShape(ctx, center);
    }

    ctx.restore();
  }, [currentDemo, demoConfig, width, height, rotation]);

  const renderBasicShape = (ctx, center) => {
    const config = demoConfig.basic;
    const radius = config.radius;
    const sides = config.sides;

    // Draw polygon
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();

    // Draw center circle
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderSpiral = (ctx, center) => {
    const config = demoConfig.spiral;
    const turns = config.turns;
    const maxRadius = config.radius * 10;
    const points = config.points;

    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const angle = t * turns * Math.PI * 2;
      const radius = t * maxRadius;
      
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  };

  const renderMandala = (ctx, center) => {
    const config = demoConfig.mandala;
    const symmetry = config.symmetry;
    const layers = config.layers;

    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 1;

    for (let layer = 1; layer <= layers; layer++) {
      const radius = (layer / layers) * 200;
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw radial lines
      for (let i = 0; i < symmetry; i++) {
        const angle = (i / symmetry) * Math.PI * 2;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />

      {/* Controls Panel */}
      {showControls && (
        <GlassPanel
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '320px',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 10
          }}
        >
          <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '18px' }}>
              Sacred Grid Complete
            </h2>

            {/* Demo Selection */}
            <Accordion title="Demo Selection" defaultOpen>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {[
                  { key: 'basic', label: 'Basic Shape' },
                  { key: 'spiral', label: 'Spiral' },
                  { key: 'mandala', label: 'Mandala' }
                ].map(demo => (
                  <Button
                    key={demo.key}
                    variant={currentDemo === demo.key ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setCurrentDemo(demo.key)}
                  >
                    {demo.label}
                  </Button>
                ))}
              </div>
            </Accordion>

            {/* Demo-specific Controls */}
            {currentDemo === 'basic' && (
              <Accordion title="Basic Shape">
                <Slider
                  label="Radius"
                  value={demoConfig.basic.radius}
                  min={50}
                  max={300}
                  onChange={(value) => setDemoConfig(prev => ({
                    ...prev,
                    basic: { ...prev.basic, radius: value }
                  }))}
                />
                <Slider
                  label="Sides"
                  value={demoConfig.basic.sides}
                  min={3}
                  max={12}
                  step={1}
                  onChange={(value) => setDemoConfig(prev => ({
                    ...prev,
                    basic: { ...prev.basic, sides: value }
                  }))}
                />
              </Accordion>
            )}

            {currentDemo === 'spiral' && (
              <Accordion title="Spiral">
                <Slider
                  label="Turns"
                  value={demoConfig.spiral.turns}
                  min={1}
                  max={5}
                  step={0.5}
                  onChange={(value) => setDemoConfig(prev => ({
                    ...prev,
                    spiral: { ...prev.spiral, turns: value }
                  }))}
                />
                <Slider
                  label="Radius"
                  value={demoConfig.spiral.radius}
                  min={5}
                  max={50}
                  onChange={(value) => setDemoConfig(prev => ({
                    ...prev,
                    spiral: { ...prev.spiral, radius: value }
                  }))}
                />
              </Accordion>
            )}

            {currentDemo === 'mandala' && (
              <Accordion title="Mandala">
                <Slider
                  label="Symmetry"
                  value={demoConfig.mandala.symmetry}
                  min={3}
                  max={16}
                  step={1}
                  onChange={(value) => setDemoConfig(prev => ({
                    ...prev,
                    mandala: { ...prev.mandala, symmetry: value }
                  }))}
                />
                <Slider
                  label="Layers"
                  value={demoConfig.mandala.layers}
                  min={2}
                  max={8}
                  step={1}
                  onChange={(value) => setDemoConfig(prev => ({
                    ...prev,
                    mandala: { ...prev.mandala, layers: value }
                  }))}
                />
              </Accordion>
            )}

            {/* Animation Controls */}
            <Accordion title="Animation">
              <Toggle
                label="Enable Animation"
                checked={isAnimating}
                onChange={setIsAnimating}
              />
            </Accordion>
          </div>
        </GlassPanel>
      )}

      {/* Toggle Controls Button */}
      <Button
        variant="primary"
        size="small"
        onClick={() => setShowControls(!showControls)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 11
        }}
      >
        {showControls ? 'Hide Controls' : 'Show Controls'}
      </Button>

      {/* Status Display */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '12px',
        zIndex: 10
      }}>
        <div>Demo: {currentDemo}</div>
        <div>Animation: {isAnimating ? 'ON' : 'OFF'}</div>
      </div>
    </div>
  );
};

export default SacredGridComplete;