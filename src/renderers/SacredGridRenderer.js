// src/renderers/SacredGridRenderer.js
// This is a refactored version of the renderer with the new naming structure
import { ShapeType, AnimationMode } from '../constants/ShapeTypes';
import {
    ShapeDrawers,
    drawPolygon,
    drawFlowerOfLife,
    drawMerkaba,
    drawMetatronsCube,
    drawTreeOfLife,
    drawMandala,
    drawCustomMandala,
    drawCircle,
    drawStar,
    drawLissajous,
    drawSpiral,
    drawHexagon,
    drawPentagon
} from '../shapes/ShapeDrawers';
import RendererFactory, { RendererType } from './RendererFactory';
import { getMultiEasedColor, getShapeColor } from '../utils/drawingUtils';
import { calculateAnimationParams } from '../shapes/ShapeUtils';

class SacredGridRenderer {
    constructor(container, settings, rendererType = RendererType.CANVAS_2D) {
        this.container = container;
        this.settings = settings;
        this.rendererType = rendererType;
        this.renderer = null;
        this.animationFrame = null;
        this.gridPoints = [];
        this.PHI = (1 + Math.sqrt(5)) / 2;
        this.time = 0;

        // Initialize shape settings
        if (this.settings && this.settings.shapes && this.settings.shapes.primary) {
            // No override needed - using normal settings
        }

        // Shape drawing registry - using the imported ShapeDrawers map
        this.shapeDrawers = ShapeDrawers;
    }

    initialize() {
        try {
            // Create the appropriate renderer
            this.renderer = RendererFactory.createRenderer(
                this.rendererType,
                this.container
            );
            
            // Initialize the renderer
            this.renderer.initialize();
        } catch (error) {
            console.error('Error initializing renderer:', error);
        }

        // Generate grid points
        this.generateGridPoints();

        // Set up event handlers
        this.renderer.addEventListener('mousemove', (x, y) => {
            this.settings.mouse.position.x = x;
            this.settings.mouse.position.y = y;
        });

        this.renderer.addEventListener('mouseleave', () => {
            this.settings.mouse.position.x = -1000;
            this.settings.mouse.position.y = -1000;
        });

        this.renderer.addEventListener('resize', () => {
            this.generateGridPoints();
        });

        // Start animation loop
        this.startAnimation();
    }

    generateGridPoints() {
        this.gridPoints = [];
        const offsetX = this.renderer.width / 2;
        const offsetY = this.renderer.height / 2;
        const { size, spacing } = this.settings.grid;

        // Performance optimization: Only generate points within the visible area with a small margin
        const screenDiagonal = Math.sqrt(this.renderer.width * this.renderer.width + 
                                       this.renderer.height * this.renderer.height);
        const visibleRadius = Math.ceil((screenDiagonal / 2) / spacing) + 1;
        
        // Use Math.min to limit grid size to visible area plus margin
        const effectiveSize = Math.min(size, visibleRadius);
        
        // Create cache for sine/cosine values to avoid recalculation
        const trigCache = {};
        
        for (let x = -effectiveSize; x <= effectiveSize; x++) {
            for (let y = -effectiveSize; y <= effectiveSize; y++) {
                const goldenOffset = (x * y) / this.PHI;
                
                // Use cache for trig functions
                if (!trigCache[goldenOffset]) {
                    trigCache[goldenOffset] = {
                        sin: Math.sin(goldenOffset),
                        cos: Math.cos(goldenOffset)
                    };
                }
                
                this.gridPoints.push({
                    x: offsetX + x * spacing + trigCache[goldenOffset].sin * 2,
                    y: offsetY + y * spacing + trigCache[goldenOffset].cos * 2,
                    noiseOffset: Math.random() * 10,
                });
            }
        }
    }

    startAnimation() {
        console.log('SacredGridRenderer startAnimation called');
        
        // Stop existing animation if any
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        const animate = (time = 0) => {
            // Remove excessive logging to improve performance
            this.time = time * this.settings.animation.speed;
            this.drawFrame();
            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    exportAsImage() {
        if (!this.renderer) {
            console.error('Renderer not initialized');
            return null;
        }

        // For Canvas2D renderer
        if (this.rendererType === RendererType.CANVAS_2D) {
            const canvas = this.renderer.canvas;
            if (!canvas) {
                console.error('Canvas not available');
                return null;
            }

            // Temporarily disable animations
            const wasAnimating = this.animationFrame !== null;
            if (wasAnimating) {
                this.stopAnimation();
            }

            // Force a redraw to ensure the latest state is captured
            this.drawFrame();

            // Get the image data
            const dataURL = canvas.toDataURL('image/png');

            // Resume animation if it was active
            if (wasAnimating) {
                this.startAnimation();
            }

            return dataURL;
        }

        console.warn('Export not fully implemented for this renderer type');
        return null;
    }

    // Faster noise function with cache for common values
    noise(x, y, t) {
        // Cache key for common noise values to prevent recalculation
        const cacheKey = `${Math.round(x*100)},${Math.round(y*100)},${Math.round(t*10)}`;
        
        // Use a static cache on the class (shared between all instances)
        if (!SacredGridRenderer.noiseCache) {
            SacredGridRenderer.noiseCache = new Map();
        }
        
        // Return cached value if available
        if (SacredGridRenderer.noiseCache.has(cacheKey)) {
            return SacredGridRenderer.noiseCache.get(cacheKey);
        }
        
        // Simplified noise calculation - reduce number of sine/cosine operations
        const value = (
            this.settings.grid.noiseIntensity *
            Math.sin(x * 0.3 + t * 0.002) *
            Math.cos(y * 0.3 - t * 0.003)
        );
        
        // Only cache if the Map is not too large (prevent memory leaks)
        if (SacredGridRenderer.noiseCache.size < 10000) {
            SacredGridRenderer.noiseCache.set(cacheKey, value);
        }
        
        return value;
    }

    drawShape(shapeType, cx, cy, radius, thickness, opacity, fractalDepth, time, shapeSettings) {
        // Get the drawing function for this shape type
        const drawFunc = this.shapeDrawers[shapeType];
        if (!drawFunc) {
            console.warn(`Shape type '${shapeType}' not found`);
            return;
        }
        
        // Calculate animation parameters including the new movement parameters
        const { offsetX = 0, offsetY = 0, rotationOffset = 0 } = shapeSettings.animation ? 
            calculateAnimationParams(time, shapeSettings, this.settings) : 
            { offsetX: 0, offsetY: 0, rotationOffset: 0 };
            
        // Apply position offsets from animation
        const adjustedCx = cx + offsetX;
        const adjustedCy = cy + offsetY;
        
        // Apply rotation offset if needed
        let adjustedRotation = shapeSettings.rotation || 0;
        if (rotationOffset) {
            adjustedRotation += rotationOffset;
        }
        
        // Create a modified shape settings object with the adjusted rotation
        const adjustedSettings = {
            ...shapeSettings,
            rotation: adjustedRotation
        };

        // Draw the shape with adjusted position
        this.renderer.drawCustomShape(drawFunc, {
            cx: adjustedCx,
            cy: adjustedCy,
            radius,
            thickness,
            shapeSettings: adjustedSettings,
            time,
            globalSettings: this.settings,
        });

        // Draw recursive shapes if needed
        if (fractalDepth > 1 && shapeSettings.fractal) {
            this.drawRecursiveShapes(
                shapeType,
                adjustedCx, // Use the adjusted position for fractals too
                adjustedCy,
                radius,
                thickness,
                opacity,
                fractalDepth,
                time,
                adjustedSettings // Use the adjusted settings for fractals
            );
        }
    }

    // Store pattern type selection for each shape to ensure consistency
    _shapePatternTypes = new Map();
    
    // Generate unique key for a shape
    _getShapeKey(shapeType, shapeSettings) {
        return `${shapeType}_${shapeSettings.vertices || 3}_${shapeSettings.position?.offsetX || 0}_${shapeSettings.position?.offsetY || 0}`;
    }
    
    // Get a stable pattern type for a shape
    _getStablePatternType(shapeType, shapeSettings) {
        const shapeKey = this._getShapeKey(shapeType, shapeSettings);
        
        if (!this._shapePatternTypes.has(shapeKey)) {
            // Create a deterministic but unique pattern selection for this shape
            const seed = (shapeType.charCodeAt(0) || 0) + 
                        (shapeSettings.vertices || 3) * 10;
                        
            // Function to get a seeded random number (0-1)
            const seededRandom = (n) => {
                const x = Math.sin(n * 9999) * 10000;
                return x - Math.floor(x);
            };
            
            // Select pattern type (0-4) deterministically
            const patternType = Math.floor(seededRandom(seed) * 5);
            this._shapePatternTypes.set(shapeKey, patternType);
        }
        
        return this._shapePatternTypes.get(shapeKey);
    }

    drawRecursiveShapes(shapeType, cx, cy, radius, thickness, opacity, fractalDepth, time, shapeSettings) {
        const { fractal } = shapeSettings;

        // Calculate new parameters for child shapes
        const newRadius = radius * fractal.scale;
        const newThickness = thickness * fractal.thicknessFalloff;
        const newOpacity = opacity * fractal.thicknessFalloff;

        // Child count from fractal settings or default to 3
        const childCount = fractal.childCount || 3;
        const rotation = (shapeSettings.rotation * Math.PI) / 180; // Convert to radians
        
        // Mathematical constants for sacred geometry
        const PHI = 1.618033988749895; // Golden ratio
        const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 137.5° in radians
        const SQRT3 = Math.sqrt(3);
        const SQRT5 = Math.sqrt(5);
        
        // Determine if we should use sacred positioning
        const useSacredPositioning = fractal.sacredPositioning;
        const sacredIntensity = fractal.sacredIntensity || 0.5;
        
        // Create a stable seed based on shape properties (exclude time to avoid jitter)
        const seed = (shapeType.charCodeAt(0) || 0) + 
                    (shapeSettings.vertices || 3) * 10 +
                    Math.round(fractalDepth * 100);
                    
        // Function to get a seeded random number (0-1)
        const seededRandom = (n) => {
            const x = Math.sin(n * 9999) * 10000;
            return x - Math.floor(x);
        };
        
        // Get a consistent pattern type for this shape (independent of time)
        const patternType = this._getStablePatternType(shapeType, shapeSettings);
        
        // Calculate a stable rotation offset for the pattern
        // This ensures consistency across fractal levels
        const patternRotationOffset = seededRandom(seed) * Math.PI * 2;
        
        // Pre-calculate any fixed pattern parameters to ensure consistency
        const fixedPatternParams = {};
        
        // Setup fixed parameters based on pattern type
        switch(patternType) {
            case 1: // Fibonacci grid
                fixedPatternParams.fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
                fixedPatternParams.maxFib = fixedPatternParams.fib[fixedPatternParams.fib.length-1];
                break;
                
            case 3: // Metatron's Cube
                fixedPatternParams.slice = 2 * Math.PI / 6; // Hexagonal symmetry
                break;
        }
        
        for (let i = 0; i < childCount; i++) {
            let offsetX, offsetY;
            
            if (useSacredPositioning) {
                // Calculate base angle for equal spacing - use stable pattern rotation
                const baseAngle = (i * 2 * Math.PI) / childCount + rotation + patternRotationOffset;
                
                switch(patternType) {
                    case 0: // Golden ratio spiral positions
                        // Each point is placed at golden ratio intervals along a spiral
                        // Use a consistent angle progression for stability
                        const spiralAngle = baseAngle + (GOLDEN_ANGLE * i * (fractalDepth + 1));
                        // Normalize the spiral radius to ensure it stays within bounds
                        const spiralProgress = i / Math.max(childCount - 1, 1);
                        const spiralRadius = radius * (0.6 + 0.4 * Math.pow(PHI, -spiralProgress));
                        offsetX = spiralRadius * Math.cos(spiralAngle);
                        offsetY = spiralRadius * Math.sin(spiralAngle);
                        break;
                        
                    case 1: // Fibonacci grid positions
                        // Position based on Fibonacci sequence numbers as coordinates
                        // Using deterministic index selection based on child index and fractal depth
                        const { fib, maxFib } = fixedPatternParams;
                        // Create stable indices based on child position in pattern
                        const stableIdx1 = (i * (fractalDepth + 1)) % fib.length;
                        const stableIdx2 = ((i * 3) + fractalDepth) % fib.length;
                        
                        // Normalize to keep within radius - maintain consistency across levels
                        const normX = (fib[stableIdx1] / maxFib) * 2 - 1; // -1 to 1 range
                        const normY = (fib[stableIdx2] / maxFib) * 2 - 1;
                        
                        // Apply rotation to maintain the overall pattern structure
                        // Use stable angle calculations
                        const fibAngle = baseAngle * 0.5; // gentler rotation
                        const rotatedX = normX * Math.cos(fibAngle) - normY * Math.sin(fibAngle);
                        const rotatedY = normX * Math.sin(fibAngle) + normY * Math.cos(fibAngle);
                        
                        offsetX = radius * rotatedX * 0.75; // Scale down slightly for better containment
                        offsetY = radius * rotatedY * 0.75;
                        break;
                        
                    case 2: // Platonic solid vertex positions
                        // Use vertices of platonic solids projected onto a sphere
                        // These create fundamental sacred geometry forms
                        
                        if (childCount <= 4) {
                            // Tetrahedron vertices (simplex) - stable across fractal levels
                            const tetrahedronVerts = [
                                [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]
                            ];
                            // Use consistent index calculation
                            const vertIndex = (i + fractalDepth) % 4;
                            const vert = tetrahedronVerts[vertIndex];
                            
                            // Project 3D point onto 2D circle with consistent scaling
                            const len = Math.sqrt(vert[0]*vert[0] + vert[1]*vert[1] + vert[2]*vert[2]);
                            offsetX = radius * (vert[0] / len) * 0.7; // Slightly reduced scale for better appearance
                            offsetY = radius * (vert[1] / len) * 0.7;
                        }
                        else if (childCount <= 6) {
                            // Octahedron vertices - use stable angle calculation
                            const octAngle = patternRotationOffset + i * (Math.PI / 3);
                            // Use a consistent alternation pattern
                            const altFactor = ((i + fractalDepth) % 2) ? 0.7 : -0.7;
                            offsetX = radius * Math.cos(octAngle) * 0.8;
                            offsetY = radius * Math.sin(octAngle) * altFactor;
                        }
                        else {
                            // Icosahedron-inspired vertices (more vertices)
                            // Use stable angle calculations
                            const icoAngle1 = patternRotationOffset + (i * GOLDEN_ANGLE);
                            const icoAngle2 = patternRotationOffset + ((i+1) * GOLDEN_ANGLE);
                            // Create stable blend factor
                            const blend = ((i + fractalDepth) % 3) / 2; // 0, 0.5, or 1
                            
                            offsetX = radius * (Math.cos(icoAngle1) * (1-blend) + Math.cos(icoAngle2) * blend) * 0.8;
                            offsetY = radius * (Math.sin(icoAngle1) * (1-blend) + Math.sin(icoAngle2) * blend) * 0.8;
                        }
                        break;
                        
                    case 3: // Metatron's Cube point positions
                        // Based on the Flower of Life and Metatron's Cube geometry
                        // These points create a powerful sacred geometry framework
                        
                        const { slice } = fixedPatternParams;
                        // Use stable ring and segment calculations
                        const ring = 1 + ((i + fractalDepth) % 3); // 1, 2, or 3 rings
                        const segment = i % 6; // 0-5 (six segments)
                        
                        // Calculate polar coordinates based on Metatron's Cube structure
                        const metaAngle = segment * slice + patternRotationOffset;
                        // Use normalized radius to ensure consistent spacing
                        const metaRadiusFactor = 0.3 + (0.2 * ring);
                        
                        offsetX = radius * metaRadiusFactor * Math.cos(metaAngle);
                        offsetY = radius * metaRadiusFactor * Math.sin(metaAngle);
                        break;
                        
                    case 4: // Sri Yantra pattern (interlocking triangles)
                        // Triangular patterns that form the Sri Yantra
                        // Use stable index calculations
                        const triIndex = (i + fractalDepth) % 3;
                        // Alternate triangles in a consistent way
                        const isUpward = ((i + fractalDepth) % 2 === 0);
                        
                        // Triangle angle - use pattern rotation for consistency
                        const triAngle = patternRotationOffset + (triIndex * 2 * Math.PI / 3) + (isUpward ? 0 : Math.PI/3);
                        
                        // Use consistent radius calculations
                        const radiusFactor = 0.5 + (isUpward ? 0.2 : 0);
                        
                        offsetX = radius * radiusFactor * Math.cos(triAngle);
                        offsetY = radius * radiusFactor * Math.sin(triAngle);
                        break;
                        
                    default: // Fallback to standard positioning
                        const defaultAngle = (i * 2 * Math.PI) / childCount + rotation;
                        offsetX = radius * Math.cos(defaultAngle);
                        offsetY = radius * Math.sin(defaultAngle);
                }
                
                // Apply smooth damping to avoid extreme positions
                // This helps limit any jitter or extreme positioning
                const maxOffset = radius * 0.9; // Maximum 90% of radius
                offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
                offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));
                
                // If the sacred intensity is less than 1, blend with the standard circular arrangement
                if (sacredIntensity < 1) {
                    const standardAngle = (i * 2 * Math.PI) / childCount + rotation;
                    const standardX = radius * Math.cos(standardAngle);
                    const standardY = radius * Math.sin(standardAngle);
                    
                    // Blend sacred and standard positions based on intensity
                    offsetX = offsetX * sacredIntensity + standardX * (1 - sacredIntensity);
                    offsetY = offsetY * sacredIntensity + standardY * (1 - sacredIntensity);
                }
            } else {
                // Standard circular arrangement if sacred positioning is disabled
                const childAngle = (i * 2 * Math.PI) / childCount + rotation;
                offsetX = radius * Math.cos(childAngle);
                offsetY = radius * Math.sin(childAngle);
            }

            // Draw child shape (recursive call)
            // Create child-specific animation parameters for more variation
            const childShapeSettings = {
                ...shapeSettings,
                // Add a slight phase shift for each child to create more varied movement
                animation: shapeSettings.animation ? {
                    ...shapeSettings.animation,
                    // Add a child-specific delay factor for more organic movement
                    childPhaseShift: i / childCount // Varies from 0 to almost 1
                } : shapeSettings.animation
            };
            
            // Recursive call with enhanced child settings
            this.drawShape(
                shapeType,
                cx + offsetX,
                cy + offsetY,
                newRadius,
                newThickness,
                newOpacity,
                fractalDepth - 1,
                time,
                childShapeSettings
            );
        }
    }

    drawFrame() {
        try {
            if (!this.renderer) {
                console.error('Renderer is null in drawFrame');
                return;
            }
            
            // Before starting, validate that the renderer has valid dimensions
            if (!this.renderer.width || !this.renderer.height || 
                this.renderer.width < 1 || this.renderer.height < 1) {
                console.error('Invalid renderer dimensions:', {
                    width: this.renderer.width,
                    height: this.renderer.height
                });
                
                // Force resize to try to recover
                if (typeof this.renderer._handleResize === 'function') {
                    console.log('Attempting to force resize to recover from invalid dimensions');
                    this.renderer._handleResize();
                }
                
                // If still invalid after resize attempt, abort drawing
                if (!this.renderer.width || !this.renderer.height || 
                    this.renderer.width < 1 || this.renderer.height < 1) {
                    console.error('Still invalid dimensions after resize attempt, aborting draw');
                    return;
                }
            }
            
            // Begin frame
            this.renderer.beginFrame();

            // Clear background
            this.renderer.clear(this.settings.colors.background);

            const centerX = this.renderer.width / 2;
            const centerY = this.renderer.height / 2;
            
            // These debug statements confirm the renderer is properly initialized
            console.log('Rendering with dimensions:', {
                width: this.renderer.width,
                height: this.renderer.height,
                canvasWidth: this.renderer.canvas ? this.renderer.canvas.width : 'unknown',
                canvasHeight: this.renderer.canvas ? this.renderer.canvas.height : 'unknown',
                container: this.renderer.container ? {
                    width: this.renderer.container.clientWidth,
                    height: this.renderer.container.clientHeight,
                    style: {
                        display: this.renderer.container.style.display,
                        position: this.renderer.container.style.position,
                        width: this.renderer.container.style.width,
                        height: this.renderer.container.style.height
                    }
                } : 'unknown'
            });
            
            // Draw XY grid (below sacred grid)
            if (this.settings.xyGrid && this.settings.xyGrid.show) {
                this.drawXYGrid(centerX, centerY);
                // Ensure global alpha is reset after drawing XY grid
                this.renderer.resetGlobalAlpha();
            }

            // Draw sacred grid lines
            this.drawGridLines(centerX, centerY);

            // Draw grid dots
            this.drawGridDots();

            // Draw shapes
            this.drawShapes(centerX, centerY);

            // End frame
            this.renderer.endFrame();
        } catch (error) {
            console.error('Error in drawFrame:', error);
        }
    }
    
    drawXYGrid(centerX, centerY) {
        const { xyGrid, colors } = this.settings;
        const { size, spacing, opacity, lineWidth, color, showLabels } = xyGrid;
        
        // Calculate grid boundaries
        const halfWidth = size * spacing;
        const halfHeight = size * spacing;
        const startX = centerX - halfWidth;
        const endX = centerX + halfWidth;
        const startY = centerY - halfHeight;
        const endY = centerY + halfHeight;
        
        // Set opacity for grid lines
        this.renderer.setGlobalAlpha(opacity);
        
        // Draw horizontal lines
        for (let y = -size; y <= size; y++) {
            const yPos = centerY + y * spacing;
            
            this.renderer.drawLine(
                startX, yPos,
                endX, yPos,
                color, 
                lineWidth
            );
            
            // Draw labels if enabled
            if (showLabels && y !== 0) {
                this.renderer.drawText(String(y), startX - 20, yPos + 4, color, "10px Arial");
            }
        }
        
        // Draw vertical lines
        for (let x = -size; x <= size; x++) {
            const xPos = centerX + x * spacing;
            
            this.renderer.drawLine(
                xPos, startY,
                xPos, endY,
                color,
                lineWidth
            );
            
            // Draw labels if enabled
            if (showLabels && x !== 0) {
                this.renderer.drawText(String(x), xPos, startY - 10, color, "10px Arial");
            }
        }
        
        // Draw axes with slightly thicker lines
        this.renderer.drawLine(
            centerX, startY,
            centerX, endY,
            color,
            lineWidth * 2
        );
        
        this.renderer.drawLine(
            startX, centerY,
            endX, centerY,
            color,
            lineWidth * 2
        );
        
        // Reset opacity
        this.renderer.resetGlobalAlpha();
    }

    drawGridLines(centerX, centerY) {
        const { grid, colors, mouse } = this.settings;

        // Performance optimization: Create a connection map to avoid duplicate calculations
        // and skip calculations for points that are too far apart
        const connectionsToRender = [];
        const maxDistance = Math.max(this.renderer.width, this.renderer.height) * 0.5;

        // First pass: Calculate connections
        for (let i = 0; i < this.gridPoints.length; i++) {
            const point = this.gridPoints[i];
            const distToCenter = Math.hypot(point.x - centerX, point.y - centerY);
            const pointTurbulence = this.noise(
                point.x * 0.01,
                point.y * 0.01,
                this.time + point.noiseOffset
            );

            for (let j = i + 1; j < this.gridPoints.length; j++) {
                const otherPoint = this.gridPoints[j];
                
                // Quick distance check to skip calculations for points that are far apart
                const dx = point.x - otherPoint.x;
                const dy = point.y - otherPoint.y;
                // Approximate squared distance check is faster than hypot for initial filtering
                const distSquared = dx * dx + dy * dy;
                
                // Skip if points are too far apart (using squared distance for speed)
                if (distSquared > maxDistance * maxDistance) continue;
                
                const dist = Math.sqrt(distSquared); // Now calculate actual distance
                
                // Check if this connection follows the golden ratio
                if (
                    Math.abs(dist / distToCenter - 1 / this.PHI) < 0.1 ||
                    Math.abs(dist / distToCenter - this.PHI) < 0.1
                ) {
                    const otherTurbulence = this.noise(
                        otherPoint.x * 0.01,
                        otherPoint.y * 0.01,
                        this.time + otherPoint.noiseOffset
                    );
                    const lineTurbulence = (pointTurbulence + otherTurbulence) * 0.5;
                    const breathingPhase =
                        this.time * grid.breathingSpeed + dist * 0.002 + lineTurbulence;
                    const baseOpacity =
                        grid.connectionOpacity *
                        (0.7 + Math.sin(breathingPhase) * 0.3 * grid.breathingIntensity);

                    const lineCenter = {
                        x: (point.x + otherPoint.x) / 2,
                        y: (point.y + otherPoint.y) / 2,
                    };
                    const lineMouseDist = Math.hypot(
                        lineCenter.x - mouse.position.x,
                        lineCenter.y - mouse.position.y
                    );
                    const lineMouseInfluence = Math.max(
                        0,
                        1 - lineMouseDist / mouse.influenceRadius
                    );
                    const finalOpacity = baseOpacity * (1 + lineMouseInfluence);
                    const lineWidth = (0.5 + lineMouseInfluence) * grid.lineWidthMultiplier;

                    // Store connection data for later rendering
                    connectionsToRender.push({
                        point1: point,
                        point2: otherPoint,
                        opacity: finalOpacity,
                        width: lineWidth
                    });
                }
            }
        }

        // Second pass: Render all connections
        // This improves performance by batching similar rendering operations
        // and reduces state changes (like gradient calculations)
        
        if (colors.gradient.lines.enabled) {
            // Pre-calculate the gradient color once for all gradient lines
            const lineColor = getMultiEasedColor(
                this.time,
                colors.gradient.lines.colors,
                1,
                colors.gradient.cycleDuration,
                colors.gradient.easing
            );
            
            // Render all gradient lines together
            for (const conn of connectionsToRender) {
                this.renderer.setGlobalAlpha(conn.opacity);
                
                if (grid.useLineFactorySettings) {
                    this.renderer.drawLine(
                        conn.point1.x,
                        conn.point1.y,
                        conn.point2.x,
                        conn.point2.y,
                        lineColor,
                        conn.width,
                        this.settings.lineFactory
                    );
                } else {
                    this.renderer.drawLine(
                        conn.point1.x,
                        conn.point1.y,
                        conn.point2.x,
                        conn.point2.y,
                        lineColor,
                        conn.width
                    );
                }
                
                this.renderer.resetGlobalAlpha();
            }
        } else {
            // Render all non-gradient lines
            for (const conn of connectionsToRender) {
                const lineColor = getShapeColor(conn.opacity, colors.scheme, this.renderer, { rendererType: this.rendererType });
                
                if (grid.useLineFactorySettings) {
                    this.renderer.drawLine(
                        conn.point1.x,
                        conn.point1.y,
                        conn.point2.x,
                        conn.point2.y,
                        lineColor,
                        conn.width,
                        this.settings.lineFactory
                    );
                } else {
                    this.renderer.drawLine(
                        conn.point1.x,
                        conn.point1.y,
                        conn.point2.x,
                        conn.point2.y,
                        lineColor,
                        conn.width
                    );
                }
            }
        }
    }

    drawGridDots() {
        const { grid, colors, mouse } = this.settings;
        
        // Check if vertices should be shown
        if (grid.showVertices === false) {
            return; // Exit early if vertices should not be displayed
        }
        
        // Performance optimization: Pre-calculate shared computations
        // and batch similar rendering operations
        const dotsToRender = [];
        let useGradient = colors.gradient.dots.enabled;
        let gradientColor;
        
        // Pre-calculate gradient color if needed
        if (useGradient) {
            gradientColor = getMultiEasedColor(
                this.time,
                colors.gradient.dots.colors,
                1,
                colors.gradient.cycleDuration,
                colors.gradient.easing
            );
        }
        
        // First pass: Calculate all dot properties
        for (const point of this.gridPoints) {
            // Calculate mouse influence
            const distanceFromMouse = Math.hypot(
                point.x - mouse.position.x,
                point.y - mouse.position.y
            );
            const mouseInfluence = Math.max(
                0,
                1 - distanceFromMouse / mouse.influenceRadius
            );
            
            // Calculate dot size with breathing effect
            const breathePhase = this.time * grid.breathingSpeed + point.noiseOffset;
            const breathe = 1 + Math.sin(breathePhase) * grid.breathingIntensity;
            const dotRadius = grid.baseDotSize * breathe * (1 + (mouse.maxScale - 1) * mouseInfluence);
            
            // Calculate alpha
            const alpha = Math.max(
                0,
                Math.min(
                    1,
                    0.7 + 0.3 * Math.sin(breathePhase)
                )
            );
            
            // Store dot data for rendering
            dotsToRender.push({
                x: point.x,
                y: point.y,
                radius: dotRadius,
                alpha: alpha
            });
        }
        
        // Second pass: Render all dots
        if (useGradient) {
            // Render all gradient dots together
            for (const dot of dotsToRender) {
                this.renderer.setGlobalAlpha(dot.alpha);
                this.renderer.drawCircle(
                    dot.x,
                    dot.y,
                    dot.radius,
                    gradientColor
                );
            }
            this.renderer.resetGlobalAlpha();
        } else {
            // Render all regular dots
            for (const dot of dotsToRender) {
                const dotColor = getShapeColor(dot.alpha, colors.scheme, this.renderer, { rendererType: this.rendererType });
                this.renderer.drawCircle(
                    dot.x,
                    dot.y,
                    dot.radius,
                    dotColor
                );
            }
        }
    }

    drawShapes(centerX, centerY) {
        // Normal shape rendering
        const { shapes } = this.settings;

        // Draw primary shape
        this.drawPrimaryShape(centerX, centerY);
        
        // Draw secondary shape if enabled
        if (shapes.secondary && shapes.secondary.enabled) {
            this.drawSecondaryShape(centerX, centerY);
        }
        
        // Apply WebGL sacred geometry effects if available and enabled
        if (this.rendererType === RendererType.WEBGL && 
            this.renderer && 
            typeof this.renderer.applySacredGeometryEffect === 'function' &&
            this.settings.webglEffects && 
            this.settings.webglEffects.sacredGeometry && 
            this.settings.webglEffects.sacredGeometry.enabled) {
            
            const intensity = this.settings.webglEffects.sacredGeometry.intensity || 0.5;
            
            if (this.settings.webglEffects.sacredGeometry.highPerformance) {
                this.renderer.applyHighPerformanceSacredGeometry(intensity);
            } else {
                this.renderer.applySacredGeometryEffect(intensity);
            }
        }

        // Accent shapes have been removed
    }

    drawPrimaryShape(centerX, centerY) {
        const { shapes } = this.settings;
        const { primary } = shapes;

        // Standard shape rendering

        // Calculate position with offset
        const shapeCenterX = centerX + primary.position.offsetX;
        const shapeCenterY = centerY + primary.position.offsetY;

        // Reset WebGL framebuffers before drawing different shape types
        // This helps prevent artifacts between shape renders
        if (this.renderer && this.rendererType === RendererType.WEBGL && 
            typeof this.renderer.resetFramebuffers === 'function') {
            this.renderer.resetFramebuffers();
        }

        // For WebGL, we now have forced brightness in the ShapeDrawers library, so we can remove
        // the debug shapes here
        
        // Use the regular shape drawing method too
        this.drawShape(
            primary.type,
            shapeCenterX,
            shapeCenterY,
            primary.size,
            primary.thickness,
            primary.opacity,
            primary.fractal.depth,
            this.time,
            primary
        );

        // Draw stacked primary shapes if enabled
        if (primary.stacking.enabled) {
            for (let i = 0; i < primary.stacking.count; i++) {
                this.drawShape(
                    primary.type,
                    shapeCenterX,
                    shapeCenterY,
                    primary.size,
                    primary.thickness,
                    primary.opacity,
                    primary.fractal.depth,
                    this.time +
                    primary.stacking.timeOffset +
                    i * primary.stacking.interval,
                    primary
                );
            }
        }
    }

    drawSecondaryShape(centerX, centerY) {
        const { shapes } = this.settings;
        const { primary, secondary } = shapes;

        // Calculate position with offset
        let shapeCenterX = centerX + secondary.position.offsetX;
        let shapeCenterY = centerY + secondary.position.offsetY;
        
        // Get the primary shape center for reference if needed
        const primaryCenterX = centerX + primary.position.offsetX;
        const primaryCenterY = centerY + primary.position.offsetY;
        
        // Processed values that might be modified by mathematical relationships
        let shapeType = secondary.type;
        let shapeSize = secondary.size;
        let shapeThickness = secondary.thickness;
        let shapeOpacity = secondary.opacity;
        let shapeFractalDepth = secondary.fractal.depth;
        let shapeRotation = secondary.rotation;
        
        // Apply harmonic ratio relationships if enabled
        if (secondary.mathRelationships && secondary.mathRelationships.useHarmonicRatios === true) {
            const harmonicRatio = secondary.mathRelationships.harmonicRatio || "1:1";
            
            // Parse the ratio into numerator and denominator
            let ratio = 1;
            if (harmonicRatio === "1:1.618") {
                // Special case for golden ratio
                ratio = 1 / 1.618;
            } else {
                const [numerator, denominator] = harmonicRatio.split(':').map(Number);
                if (numerator && denominator) {
                    ratio = numerator / denominator;
                }
            }
            
            // Apply ratio to size
            shapeSize = primary.size * ratio;
            
            // Apply ratio to thickness with a balanced approach
            // Square root provides a more pleasing relationship for thickness
            shapeThickness = primary.thickness * Math.sqrt(ratio);
            
            // Enhanced motion: Add orbit-like movement based on the time and harmonic ratio
            // This creates a circular motion with radius proportional to the ratio
            const orbitSpeed = 0.0005; // Controls how fast the shape orbits
            const orbitRadius = primary.size * 0.2 * ratio; // Radius scales with the harmonic ratio
            const orbitPhase = this.time * orbitSpeed;
            
            // Apply orbital motion to the shape position
            shapeCenterX += Math.cos(orbitPhase) * orbitRadius;
            shapeCenterY += Math.sin(orbitPhase) * orbitRadius;
        }
        
        // Apply symmetry operations if enabled
        if (secondary.mathRelationships && secondary.mathRelationships.useSymmetryGroup === true) {
            const operation = secondary.mathRelationships.symmetryOperation || "rotation";
            
            // Add time-dependent animation for more dynamic motion
            const animTime = this.time * 0.001; // Slow down time for animation
            
            switch (operation) {
                case "rotation":
                    // Apply a time-varying rotation around the primary shape center
                    // Instead of fixed 90 degrees, we animate the rotation angle
                    const rotAngle = Math.PI/2 + Math.sin(animTime * 0.5) * Math.PI/4; // Varies between 45° and 135°
                    const dx = shapeCenterX - primaryCenterX;
                    const dy = shapeCenterY - primaryCenterY;
                    
                    const cosRot = Math.cos(rotAngle);
                    const sinRot = Math.sin(rotAngle);
                    
                    shapeCenterX = primaryCenterX + dx * cosRot - dy * sinRot;
                    shapeCenterY = primaryCenterY + dx * sinRot + dy * cosRot;
                    
                    // Also animate the rotation of the shape itself
                    shapeRotation = (secondary.rotation + Math.sin(animTime) * 30) % 360;
                    break;
                    
                case "reflection":
                    // Reflect across a moving axis that oscillates around the Y-axis
                    const axisAngle = Math.sin(animTime * 0.7) * Math.PI/6; // Varies by ±30 degrees
                    const dist = Math.hypot(shapeCenterX - primaryCenterX, shapeCenterY - primaryCenterY);
                    const curAngle = Math.atan2(shapeCenterY - primaryCenterY, shapeCenterX - primaryCenterX);
                    const reflectedAngle = Math.PI - curAngle + 2 * axisAngle;
                    
                    shapeCenterX = primaryCenterX + dist * Math.cos(reflectedAngle);
                    shapeCenterY = primaryCenterY + dist * Math.sin(reflectedAngle);
                    break;
                    
                case "glideReflection":
                    // Reflect across the Y-axis and add oscillating translation
                    shapeCenterX = primaryCenterX - (shapeCenterX - primaryCenterX);
                    shapeCenterY = shapeCenterY + 50 * Math.sin(animTime); // Oscillating glide component
                    break;
                    
                case "rotation180":
                    // 180 degree rotation with pulsing distance
                    const pulseFactor = 0.8 + 0.2 * Math.sin(animTime * 1.5); // Varies between 0.6 and 1.0
                    shapeCenterX = primaryCenterX - (shapeCenterX - primaryCenterX) * pulseFactor;
                    shapeCenterY = primaryCenterY - (shapeCenterY - primaryCenterY) * pulseFactor;
                    break;
                    
                case "dihedral":
                    // Dihedral symmetry with spinning animation
                    const angle = Math.PI/3 + animTime % (Math.PI * 2); // Continuously rotating angle
                    const cosAngle = Math.cos(angle);
                    const sinAngle = Math.sin(angle);
                    
                    const dxD = shapeCenterX - primaryCenterX;
                    const dyD = shapeCenterY - primaryCenterY;
                    
                    const rotatedX = primaryCenterX + dxD * cosAngle - dyD * sinAngle;
                    const rotatedY = primaryCenterY + dxD * sinAngle + dyD * cosAngle;
                    
                    // Apply reflection that changes over time
                    const reflectAxis = animTime % Math.PI;
                    const cosReflect = Math.cos(2 * reflectAxis);
                    const sinReflect = Math.sin(2 * reflectAxis);
                    
                    const rxD = rotatedX - primaryCenterX;
                    const ryD = rotatedY - primaryCenterY;
                    
                    shapeCenterX = primaryCenterX + rxD * cosReflect + ryD * sinReflect;
                    shapeCenterY = primaryCenterY + rxD * sinReflect - ryD * cosReflect;
                    
                    // Animate rotation as well
                    shapeRotation = (secondary.rotation + animTime * 30) % 360;
                    break;
            }
        }
        
        // Add randomizer for spawn point if enabled
        if (secondary.mathRelationships && secondary.mathRelationships.useRandomizer) {
            // Get the randomizer settings from the UI controls
            const randomizerScale = secondary.mathRelationships.randomizerScale || 0.15;
            const seedOffset = secondary.mathRelationships.randomSeedOffset || 0;
            
            // We'll use a seeded random function based on the shape type and time
            // This creates a stable random effect that changes with each shape but is consistent
            const generateRandomOffset = (seed) => {
                // Simple seeded random function
                const x = Math.sin((seed + seedOffset) * 0.1) * 10000;
                return (x - Math.floor(x)) * 2 - 1; // Range from -1 to 1
            };
            
            // Create random seeds based on shape properties to ensure consistent behavior
            const randomSeedX = (shapeType.charCodeAt(0) || 0) + (primary.size * 0.1);
            const randomSeedY = (shapeType.charCodeAt(1) || 0) + (primary.thickness * 0.5);
            
            // Apply random offset to position
            // Scale by primary shape size for proportional randomness
            const randomOffsetScale = primary.size * randomizerScale;
            shapeCenterX += generateRandomOffset(randomSeedX) * randomOffsetScale;
            shapeCenterY += generateRandomOffset(randomSeedY) * randomOffsetScale;
        }
        
        // Reset WebGL framebuffers before drawing different shape types
        // This helps prevent artifacts between shape renders
        if (this.renderer && this.rendererType === RendererType.WEBGL && 
            typeof this.renderer.resetFramebuffers === "function") {
            this.renderer.resetFramebuffers();
        }
        
        // Create a modified secondary settings object with the processed values
        const modifiedSecondary = {
            ...secondary,
            size: shapeSize,
            thickness: shapeThickness,
            opacity: shapeOpacity,
            rotation: shapeRotation
        };
        
        // Use the regular shape drawing method with potentially modified values
        this.drawShape(
            shapeType,
            shapeCenterX,
            shapeCenterY,
            shapeSize,
            shapeThickness,
            shapeOpacity,
            shapeFractalDepth,
            this.time,
            modifiedSecondary
        );

        // Draw stacked secondary shapes if enabled
        if (secondary.stacking.enabled) {
            for (let i = 0; i < secondary.stacking.count; i++) {
                this.drawShape(
                    shapeType,
                    shapeCenterX,
                    shapeCenterY,
                    shapeSize,
                    shapeThickness,
                    shapeOpacity,
                    shapeFractalDepth,
                    this.time +
                    secondary.stacking.timeOffset +
                    i * secondary.stacking.interval,
                    modifiedSecondary
                );
            }
        }
    }

    // Remove or modify the drawAccentShapes method
    drawAccentShapes(centerX, centerY) {
        // This method is now a no-op since accent shapes have been removed
        return;
    }

    updateSettings(newSettings) {
        const oldSettings = this.settings;
        this.settings = { ...this.settings, ...newSettings };
        
        // Regenerate grid points only if grid size or spacing changed
        if (
            newSettings.grid && (
                (oldSettings.grid.size !== this.settings.grid.size) || 
                (oldSettings.grid.spacing !== this.settings.grid.spacing)
            )
        ) {
            // Clear noise cache when grid changes
            if (SacredGridRenderer.noiseCache) {
                SacredGridRenderer.noiseCache.clear();
            }
            this.generateGridPoints();
        }
        
        // Check if the primary shape type has changed
        if (
            newSettings.shapes && 
            newSettings.shapes.primary && 
            oldSettings.shapes && 
            oldSettings.shapes.primary &&
            newSettings.shapes.primary.type !== oldSettings.shapes.primary.type
        ) {
            // Reset WebGL framebuffers when shape type changes to prevent artifacts
            if (this.renderer && this.rendererType === RendererType.WEBGL && typeof this.renderer.resetFramebuffers === 'function') {
                this.renderer.resetFramebuffers();
            }
        }
    }

    dispose() {
        this.stopAnimation();
        
        // Clear caches to free memory
        if (SacredGridRenderer.noiseCache) {
            SacredGridRenderer.noiseCache.clear();
        }
        
        // Clear grid points to free memory
        this.gridPoints = [];
        
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
    }
}

export default SacredGridRenderer;
