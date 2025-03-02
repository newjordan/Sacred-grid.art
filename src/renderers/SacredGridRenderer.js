// src/renderers/SacredGridRenderer.js
// This is a refactored version of the renderer with the new naming structure
import { ShapeType, AnimationMode } from '../constants/ShapeTypes';
import { 
    ShapeDrawers,
    drawPolygon, 
    drawFlowerOfLife, 
    drawMerkaba, 
    drawCircle,
    drawStar,
    drawLissajous, 
    drawSpiral,
    drawHexagon,
    drawPentagon
} from '../shapes/ShapeDrawers';
import RendererFactory, { RendererType } from './RendererFactory';
import { getMultiEasedColor, getShapeColor } from '../utils/drawingUtils';

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

        // Draw the shape
        this.renderer.drawCustomShape(drawFunc, {
            cx,
            cy,
            radius,
            thickness,
            shapeSettings,
            time,
            globalSettings: this.settings,
        });

        // Draw recursive shapes if needed
        if (fractalDepth > 1 && shapeSettings.fractal) {
            this.drawRecursiveShapes(
                shapeType,
                cx,
                cy,
                radius,
                thickness,
                opacity,
                fractalDepth,
                time,
                shapeSettings
            );
        }
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

        for (let i = 0; i < childCount; i++) {
            const childAngle = (i * 2 * Math.PI) / childCount + rotation;
            const offsetX = radius * Math.cos(childAngle);
            const offsetY = radius * Math.sin(childAngle);

            // Draw child shape (recursive call)
            this.drawShape(
                shapeType,
                cx + offsetX,
                cy + offsetY,
                newRadius,
                newThickness,
                newOpacity,
                fractalDepth - 1,
                time,
                shapeSettings
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
