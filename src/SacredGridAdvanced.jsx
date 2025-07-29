import React, { useState, useRef, useEffect, useCallback } from 'react';

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const PI = Math.PI;
const TWO_PI = Math.PI * 2;

const GlassPanel = ({ children, style }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    ...style
  }}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', onClick, style }) => (
  <button
    onClick={onClick}
    style={{
      background: variant === 'primary' ? 'rgba(0, 119, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '10px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      margin: '4px',
      ...style
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
        height: '6px',
        borderRadius: '3px',
        background: 'rgba(255, 255, 255, 0.2)',
        outline: 'none',
        cursor: 'pointer'
      }}
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ marginRight: '8px' }}
    />
    <label style={{ color: '#ffffff', fontSize: '14px' }}>{label}</label>
  </div>
);

const ColorPicker = ({ label, value, onChange }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ color: '#ffffff', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
      {label}
    </label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        height: '40px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    />
  </div>
);

class MetatronsCube {
  static generateCirclePattern(center, radius) {
    const circles = [];
    circles.push({ center: { ...center }, radius: radius * 0.3, id: 'center' });
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI;
      const distance = radius * 0.5;
      circles.push({
        center: {
          x: center.x + Math.cos(angle) * distance,
          y: center.y + Math.sin(angle) * distance
        },
        radius: radius * 0.3,
        id: `inner_${i}`
      });
    }
    
    return circles;
  }
  
  static generateConnections(circles) {
    const connections = [];
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const distance = Math.sqrt(
          Math.pow(circles[j].center.x - circles[i].center.x, 2) +
          Math.pow(circles[j].center.y - circles[i].center.y, 2)
        );
        if (distance < circles[i].radius * 4) {
          connections.push({
            start: circles[i].center,
            end: circles[j].center
          });
        }
      }
    }
    return connections;
  }
}

const SacredGridAdvanced = ({ width = window.innerWidth, height = window.innerHeight }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [currentDemo, setCurrentDemo] = useState('metatron');
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [gridSize, setGridSize] = useState(50);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [showGrid, setShowGrid] = useState(true);
  const [shapeScale, setShapeScale] = useState(200);
  const [lineWidth, setLineWidth] = useState(2);
  const [shapeOpacity, setShapeOpacity] = useState(0.8);
  const [primaryColor, setPrimaryColor] = useState('#00ff88');
  const [secondaryColor, setSecondaryColor] = useState('#0088ff');
  const [backgroundColor, setBackgroundColor] = useState('#0a0a0a');
  const [showCircles, setShowCircles] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [circleOpacity, setCircleOpacity] = useState(0.6);

  useEffect(() => {
    if (!isAnimating) return;
    
    const animate = () => {
      setRotation(prev => prev + 0.01 * animationSpeed);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationSpeed]);
  
  const drawGrid = useCallback((ctx, canvas) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${gridOpacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    
    ctx.stroke();
  }, [showGrid, gridOpacity, gridSize]);
  
  const drawMetatronsCube = useCallback((ctx, center) => {
    const circles = MetatronsCube.generateCirclePattern(center, shapeScale);
    const connections = MetatronsCube.generateConnections(circles);
    
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.translate(-center.x, -center.y);
    
    if (showConnections) {
      ctx.strokeStyle = `${secondaryColor}${Math.floor(shapeOpacity * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      
      connections.forEach(conn => {
        ctx.moveTo(conn.start.x, conn.start.y);
        ctx.lineTo(conn.end.x, conn.end.y);
      });
      
      ctx.stroke();
    }
    
    if (showCircles) {
      ctx.strokeStyle = `${primaryColor}${Math.floor(circleOpacity * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = lineWidth;
      
      circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, TWO_PI);
        ctx.stroke();
      });
    }
    
    ctx.restore();
  }, [rotation, shapeScale, showConnections, showCircles, secondaryColor, primaryColor, shapeOpacity, circleOpacity, lineWidth]);
  
  const render = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid(ctx, canvas);
    
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    drawMetatronsCube(ctx, center);
  }, [width, height, backgroundColor, drawGrid, drawMetatronsCube]);
  
  useEffect(() => {
    render();
  }, [render]);
  
  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      background: backgroundColor
    }}>
      <canvas
        ref={canvasRef}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          cursor: 'crosshair'
        }}
      />
      
      <GlassPanel style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '320px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ color: '#ffffff', marginTop: 0, marginBottom: '20px' }}>
          Sacred Grid Advanced
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>Animation</h3>
          <Toggle 
            label="Enable Animation"
            checked={isAnimating}
            onChange={setIsAnimating}
          />
          <Slider
            label="Animation Speed"
            value={animationSpeed}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setAnimationSpeed}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>Grid</h3>
          <Toggle 
            label="Show Grid"
            checked={showGrid}
            onChange={setShowGrid}
          />
          <Slider
            label="Grid Size"
            value={gridSize}
            min={20}
            max={100}
            onChange={setGridSize}
          />
          <Slider
            label="Grid Opacity"
            value={gridOpacity}
            min={0}
            max={1}
            step={0.1}
            onChange={setGridOpacity}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>Shape</h3>
          <Slider
            label="Scale"
            value={shapeScale}
            min={50}
            max={400}
            onChange={setShapeScale}
          />
          <Slider
            label="Line Width"
            value={lineWidth}
            min={1}
            max={10}
            onChange={setLineWidth}
          />
          <Slider
            label="Shape Opacity"
            value={shapeOpacity}
            min={0}
            max={1}
            step={0.1}
            onChange={setShapeOpacity}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>Colors</h3>
          <ColorPicker
            label="Primary Color"
            value={primaryColor}
            onChange={setPrimaryColor}
          />
          <ColorPicker
            label="Secondary Color"
            value={secondaryColor}
            onChange={setSecondaryColor}
          />
          <ColorPicker
            label="Background Color"
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>Metatron's Cube</h3>
          <Toggle 
            label="Show Circles"
            checked={showCircles}
            onChange={setShowCircles}
          />
          <Toggle 
            label="Show Connections"
            checked={showConnections}
            onChange={setShowConnections}
          />
          <Slider
            label="Circle Opacity"
            value={circleOpacity}
            min={0}
            max={1}
            step={0.1}
            onChange={setCircleOpacity}
          />
        </div>
      </GlassPanel>
    </div>
  );
};

export default SacredGridAdvanced;