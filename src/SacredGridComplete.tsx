// src/SacredGridComplete.tsx - Complete Sacred Grid with all new features
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppProvider } from './contexts/AppContext';
import { usePerformance } from './hooks/usePerformance';
import { useParticles } from './hooks/useParticles';

// Import all our new components
import { MetatronsCube } from './shapes/MetatronsCube';
import { TreeOfLife } from './shapes/TreeOfLife';
import { FibonacciSpiral } from './shapes/FibonacciSpiral';
import { PlatonicSolids } from './shapes/PlatonicSolids';
import { MandalaGenerator } from './shapes/MandalaGenerator';
import { MandelbrotSet } from './fractals/MandelbrotSet';
import { ShapeMorpher } from './morphing/ShapeMorpher';
import { LayerManager } from './layers/LayerManager';
import { ImageExporter } from './export/ImageExporter';
import { SVGExporter } from './export/SVGExporter';
import { AnimationExporter } from './export/AnimationExporter';
import { PerformanceMonitor } from './performance/PerformanceMonitor';
import { Timeline, TimelineBuilder, Easing, Interpolators } from './animation/Timeline';

// Import UI components
import { GlassPanel } from './components/ui/GlassPanel';
import { Button } from './components/ui/Button';
import { Slider } from './components/ui/Slider';
import { Toggle } from './components/ui/Toggle';
import { ColorPicker } from './components/ui/ColorPicker';
import { Accordion } from './components/ui/Accordion';

// Import types
import { Vector2D, Vector3D } from './types';

interface SacredGridCompleteProps {
  width?: number;
  height?: number;
}

export const SacredGridComplete: React.FC<SacredGridCompleteProps> = ({
  width = window.innerWidth,
  height = window.innerHeight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentDemo, setCurrentDemo] = useState<string>('metatron');
  const [isAnimating, setIsAnimating] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  // Performance monitoring
  const performanceMonitor = useRef(new PerformanceMonitor());
  const performance = usePerformance();
  
  // Particle system
  const particleSystem = useParticles({
    canvas: canvasRef.current,
    maxParticles: 500,
    emissionRate: 10,
    autoEmit: false,
    collisionDetection: true,
    boundaryCollision: true,
    bounds: { left: 0, right: width, top: 0, bottom: height }
  });

  // Layer management
  const layerManager = useRef<LayerManager>(new LayerManager(width, height));
  
  // Export systems
  const imageExporter = useRef(new ImageExporter());
  const svgExporter = useRef(new SVGExporter());
  const animationExporter = useRef(new AnimationExporter());

  // Demo configurations
  const [demoConfig, setDemoConfig] = useState({
    metatron: {
      circleCount: 13,
      radius: 150,
      rotation: 0,
      showConnections: true,
      show3D: false
    },
    treeOfLife: {
      variant: 'traditional',
      showPaths: true,
      showSephirot: true,
      pathHighlight: null
    },
    fibonacci: {
      turns: 3,
      pointsPerTurn: 100,
      initialRadius: 10,
      spiralType: 'golden'
    },
    platonic: {
      solidType: 'icosahedron',
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      projection: 'orthographic',
      showWireframe: true
    },
    mandala: {
      style: 'geometric',
      symmetry: 8,
      layers: 5,
      complexity: 5
    },
    mandelbrot: {
      centerX: -0.5,
      centerY: 0,
      zoom: 1,
      maxIterations: 100,
      colorScheme: 'classic'
    },
    particles: {
      count: 200,
      emissionRate: 5,
      gravity: { x: 0, y: 50 },
      attraction: false
    }
  });

  // Animation timeline
  const timeline = useRef<Timeline>(new Timeline({
    duration: 10000,
    loop: true,
    autoPlay: true
  }));

  // Initialize demo
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Initialize timeline animations
    setupAnimations();
    
    // Start render loop
    const renderLoop = () => {
      if (!isAnimating) return;
      
      performanceMonitor.current.startFrame();
      performanceMonitor.current.startRender();
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Render current demo
      renderCurrentDemo(ctx);
      
      performanceMonitor.current.endRender();
      
      requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
    
    return () => {
      setIsAnimating(false);
    };
  }, [currentDemo, isAnimating, width, height]);

  const setupAnimations = useCallback(() => {
    const builder = new TimelineBuilder({
      duration: 10000,
      loop: true,
      autoPlay: true
    });

    // Add rotation animation
    builder.animateNumber('rotation', 'rotation', [
      { time: 0, value: 0, easing: Easing.linear },
      { time: 10000, value: Math.PI * 2, easing: Easing.linear }
    ]);

    // Add scale animation
    builder.animateNumber('scale', 'scale', [
      { time: 0, value: 1, easing: Easing.easeInOutSine },
      { time: 5000, value: 1.2, easing: Easing.easeInOutSine },
      { time: 10000, value: 1, easing: Easing.easeInOutSine }
    ]);

    timeline.current = builder.build();
  }, []);

  const renderCurrentDemo = useCallback((ctx: CanvasRenderingContext2D) => {
    const center: Vector2D = { x: width / 2, y: height / 2 };
    const time = performance.now();
    
    // Get animation values
    const rotation = timeline.current.getValue('rotation') || 0;
    const scale = timeline.current.getValue('scale') || 1;

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.translate(-center.x, -center.y);

    switch (currentDemo) {
      case 'metatron':
        renderMetatronsCube(ctx, center);
        break;
      case 'treeOfLife':
        renderTreeOfLife(ctx, center);
        break;
      case 'fibonacci':
        renderFibonacciSpiral(ctx, center);
        break;
      case 'platonic':
        renderPlatonicSolid(ctx, center);
        break;
      case 'mandala':
        renderMandala(ctx, center);
        break;
      case 'mandelbrot':
        renderMandelbrot(ctx);
        break;
      case 'particles':
        // Particles are handled by the particle system
        break;
    }

    ctx.restore();
  }, [currentDemo, demoConfig, width, height]);

  const renderMetatronsCube = (ctx: CanvasRenderingContext2D, center: Vector2D) => {
    const config = demoConfig.metatron;
    const cube = new MetatronsCube();
    
    const circles = cube.generateCirclePattern(center, config.radius);
    
    // Render circles
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    
    circles.forEach(circle => {
      ctx.beginPath();
      ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Render connections if enabled
    if (config.showConnections) {
      const connections = cube.generateConnections(circles);
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
      ctx.lineWidth = 1;
      
      connections.forEach(connection => {
        ctx.beginPath();
        ctx.moveTo(connection.start.x, connection.start.y);
        ctx.lineTo(connection.end.x, connection.end.y);
        ctx.stroke();
      });
    }
  };

  const renderTreeOfLife = (ctx: CanvasRenderingContext2D, center: Vector2D) => {
    const config = demoConfig.treeOfLife;
    const tree = new TreeOfLife();
    
    const sephirot = tree.generateSephirot(center, 200);
    const paths = tree.generatePaths(sephirot);

    // Render paths
    if (config.showPaths) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 2;
      
      paths.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path.start.x, path.start.y);
        ctx.lineTo(path.end.x, path.end.y);
        ctx.stroke();
      });
    }

    // Render sephirot
    if (config.showSephirot) {
      sephirot.forEach((sephira, index) => {
        ctx.fillStyle = sephira.color;
        ctx.beginPath();
        ctx.arc(sephira.position.x, sephira.position.y, sephira.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(sephira.name, sephira.position.x, sephira.position.y + 4);
      });
    }
  };

  const renderFibonacciSpiral = (ctx: CanvasRenderingContext2D, center: Vector2D) => {
    const config = demoConfig.fibonacci;
    
    const spiral = FibonacciSpiral.generateGoldenSpiral(
      center,
      config.initialRadius,
      config.turns,
      config.pointsPerTurn
    );

    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    spiral.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    
    ctx.stroke();
  };

  const renderPlatonicSolid = (ctx: CanvasRenderingContext2D, center: Vector2D) => {
    const config = demoConfig.platonic;
    
    let solid;
    switch (config.solidType) {
      case 'tetrahedron':
        solid = PlatonicSolids.generateTetrahedron();
        break;
      case 'cube':
        solid = PlatonicSolids.generateCube();
        break;
      case 'octahedron':
        solid = PlatonicSolids.generateOctahedron();
        break;
      case 'dodecahedron':
        solid = PlatonicSolids.generateDodecahedron();
        break;
      case 'icosahedron':
      default:
        solid = PlatonicSolids.generateIcosahedron();
        break;
    }

    const projection = PlatonicSolids.projectOrthographic(
      solid,
      center,
      100,
      config.rotationX,
      config.rotationY,
      config.rotationZ
    );

    // Render wireframe
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1;
    
    projection.edges.forEach(([startIndex, endIndex]) => {
      const start = projection.vertices2D[startIndex];
      const end = projection.vertices2D[endIndex];
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    // Render vertices
    ctx.fillStyle = '#00aaff';
    projection.vertices2D.forEach(vertex => {
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const renderMandala = (ctx: CanvasRenderingContext2D, center: Vector2D) => {
    const config = demoConfig.mandala;
    
    const mandalaConfig = {
      center,
      radius: 200,
      symmetry: config.symmetry,
      layers: config.layers,
      complexity: config.complexity,
      style: config.style as any
    };

    const elements = MandalaGenerator.generate(mandalaConfig);

    elements.forEach(element => {
      ctx.strokeStyle = '#ff69b4';
      ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
      ctx.lineWidth = 1;

      switch (element.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(element.center.x, element.center.y, element.radius, 0, Math.PI * 2);
          if (element.filled) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
          break;
        case 'line':
          if (element.points && element.points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            ctx.lineTo(element.points[1].x, element.points[1].y);
            ctx.stroke();
          }
          break;
        case 'polygon':
          if (element.points && element.points.length > 2) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            element.points.slice(1).forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.closePath();
            if (element.filled) {
              ctx.fill();
            } else {
              ctx.stroke();
            }
          }
          break;
      }
    });
  };

  const renderMandelbrot = (ctx: CanvasRenderingContext2D) => {
    const config = demoConfig.mandelbrot;
    
    const mandelbrot = new MandelbrotSet({
      width: width,
      height: height,
      centerX: config.centerX,
      centerY: config.centerY,
      zoom: config.zoom,
      maxIterations: config.maxIterations,
      escapeRadius: 2,
      colorScheme: config.colorScheme as any
    });

    const imageData = mandelbrot.generate();
    ctx.putImageData(imageData, 0, 0);
  };

  const handleExportImage = async () => {
    if (!canvasRef.current) return;

    const config = {
      format: 'png' as const,
      quality: 1,
      width: width,
      height: height,
      scale: 2,
      transparent: false,
      backgroundColor: '#000000'
    };

    try {
      const blob = await imageExporter.current.exportCanvas(canvasRef.current, config);
      imageExporter.current.downloadBlob(blob, `sacred-grid-${currentDemo}.png`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportSVG = () => {
    const config = SVGExporter.getDefaultConfig(width, height);
    
    // Create simple SVG representation
    svgExporter.current.clear();
    svgExporter.current.addCircle({ x: width/2, y: height/2 }, 100, {
      fill: 'none',
      stroke: '#00ff88',
      'stroke-width': '2'
    });
    
    const svgContent = svgExporter.current.exportShapes([], config);
    svgExporter.current.downloadSVG(svgContent, `sacred-grid-${currentDemo}.svg`);
  };

  return (
    <AppProvider>
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
                    { key: 'metatron', label: "Metatron's Cube" },
                    { key: 'treeOfLife', label: 'Tree of Life' },
                    { key: 'fibonacci', label: 'Fibonacci Spiral' },
                    { key: 'platonic', label: 'Platonic Solids' },
                    { key: 'mandala', label: 'Mandalas' },
                    { key: 'mandelbrot', label: 'Mandelbrot Set' },
                    { key: 'particles', label: 'Particle System' }
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
              {currentDemo === 'metatron' && (
                <Accordion title="Metatron's Cube">
                  <Slider
                    label="Radius"
                    value={demoConfig.metatron.radius}
                    min={50}
                    max={300}
                    onChange={(value) => setDemoConfig(prev => ({
                      ...prev,
                      metatron: { ...prev.metatron, radius: value }
                    }))}
                  />
                  <Toggle
                    label="Show Connections"
                    checked={demoConfig.metatron.showConnections}
                    onChange={(checked) => setDemoConfig(prev => ({
                      ...prev,
                      metatron: { ...prev.metatron, showConnections: checked }
                    }))}
                  />
                </Accordion>
              )}

              {currentDemo === 'fibonacci' && (
                <Accordion title="Fibonacci Spiral">
                  <Slider
                    label="Turns"
                    value={demoConfig.fibonacci.turns}
                    min={1}
                    max={5}
                    step={0.5}
                    onChange={(value) => setDemoConfig(prev => ({
                      ...prev,
                      fibonacci: { ...prev.fibonacci, turns: value }
                    }))}
                  />
                  <Slider
                    label="Initial Radius"
                    value={demoConfig.fibonacci.initialRadius}
                    min={5}
                    max={50}
                    onChange={(value) => setDemoConfig(prev => ({
                      ...prev,
                      fibonacci: { ...prev.fibonacci, initialRadius: value }
                    }))}
                  />
                </Accordion>
              )}

              {currentDemo === 'platonic' && (
                <Accordion title="Platonic Solids">
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ color: '#ffffff', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                      Solid Type
                    </label>
                    <select
                      value={demoConfig.platonic.solidType}
                      onChange={(e) => setDemoConfig(prev => ({
                        ...prev,
                        platonic: { ...prev.platonic, solidType: e.target.value }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#ffffff'
                      }}
                    >
                      <option value="tetrahedron">Tetrahedron</option>
                      <option value="cube">Cube</option>
                      <option value="octahedron">Octahedron</option>
                      <option value="dodecahedron">Dodecahedron</option>
                      <option value="icosahedron">Icosahedron</option>
                    </select>
                  </div>
                </Accordion>
              )}

              {currentDemo === 'mandala' && (
                <Accordion title="Mandala Generator">
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

              {/* Export Controls */}
              <Accordion title="Export">
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <Button variant="secondary" size="small" onClick={handleExportImage}>
                    Export PNG
                  </Button>
                  <Button variant="secondary" size="small" onClick={handleExportSVG}>
                    Export SVG
                  </Button>
                </div>
              </Accordion>

              {/* Performance Monitor */}
              <Accordion title="Performance">
                <div style={{ color: '#ffffff', fontSize: '12px' }}>
                  <div>FPS: {performance.fps.toFixed(1)}</div>
                  <div>Frame Time: {performance.frameTime.toFixed(2)}ms</div>
                  <div>Memory: {performance.memoryUsage.toFixed(1)}MB</div>
                </div>
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

        {/* Performance Display */}
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
          <div>FPS: {performance.fps.toFixed(1)}</div>
          <div>Particles: {particleSystem.stats.activeParticles}</div>
        </div>
      </div>
    </AppProvider>
  );
};

export default SacredGridComplete;