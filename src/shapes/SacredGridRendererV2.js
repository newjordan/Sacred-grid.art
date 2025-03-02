// src/renderers/SacredGridRenderer.js
// This is a refactored version of the renderer with the new naming structure
import { ShapeType, AnimationMode } from '../constants/ShapeTypes';
import { drawPolygon, drawFlowerOfLife, drawMerkaba } from '../shapes/ShapeDrawers';
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

        // Shape drawing registry
        this.shapeDrawers = {
            [ShapeType.POLYGON]: drawPolygon,
            [ShapeType.FLOWER_OF_LIFE]: drawFlowerOfLife,
            [ShapeType.MERKABA]: drawMerkaba,
            // Add more shape drawers as needed
        };
    }

    initialize() {
        // Create the appropriate renderer
        this.renderer = RendererFactory.createRenderer(
            this.rendererType,
            this.container
        );

        // Initialize the renderer
        this.renderer.initialize();

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

        for (let x = -this.settings.grid.size; x <= this.settings.grid.size; x++) {
            for (let y = -this.settings.grid.size; y <= this.settings.grid.size; y++) {
                const goldenOffset = (x * y) / this.PHI;
                this.gridPoints.push({
                    x: offsetX + x * this.settings.grid.spacing + Math.sin(goldenOffset) * 2,
                    y: offsetY + y * this.settings.grid.spacing + Math.cos(goldenOffset) * 2,
                    noiseOffset: Math.random() * 10,
                });
            }
        }
    }

    startAnimation() {
        const animate = (time = 0) => {
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

    noise(x, y, t) {
        return (
            this.settings.grid.noiseIntensity *
            Math.sin(x * 0.3 + t * 0.002) *
            Math.cos(y * 0.3 - t * 0.003) *
            Math.sin((x + y) * 0.2 + t * 0.001)
        );
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
        // Begin frame
        this.renderer.beginFrame();

        // Clear background
        this.renderer.clear(this.settings.colors.background);

        const centerX = this.renderer.width / 2;
        const centerY = this.renderer.height / 2;

        // Draw grid lines
        this.drawGridLines(centerX, centerY);

        // Draw grid dots
        this.drawGridDots();

        // Draw shapes
        this.drawShapes(centerX, centerY);

        // End frame
        this.renderer.endFrame();
    }

    drawGridLines(centerX, centerY) {
        const { grid, colors, mouse } = this.settings;

        this.gridPoints.forEach((point) => {
            const distToCenter = Math.hypot(point.x - centerX, point.y - centerY);
            const pointTurbulence = this.noise(
                point.x * 0.01,
                point.y * 0.01,
                this.time + point.noiseOffset
            );

            this.gridPoints.forEach((otherPoint) => {
                const dist = Math.hypot(point.x - otherPoint.x, point.y - otherPoint.y);
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

                    let lineColor;
                    if (colors.gradient.lines.enabled) {
                        lineColor = getMultiEasedColor(
                            this.time,
                            colors.gradient.lines.colors,
                            1,
                            colors.gradient.cycleDuration,
                            colors.gradient.easing
                        );
                        this.renderer.setGlobalAlpha(finalOpacity);
                    } else {
                        lineColor = getShapeColor(finalOpacity, colors.scheme);
                    }

                    this.renderer.drawLine(
                        point.x,
                        point.y,
                        otherPoint.x,
                        otherPoint.y,
                        lineColor,
                        lineWidth
                    );

                    this.renderer.resetGlobalAlpha();
                }
            });
        });
    }

    drawGridDots() {
        const { grid, colors, mouse } = this.settings;

        this.gridPoints.forEach((point) => {
            const distanceFromMouse = Math.hypot(
                point.x - mouse.position.x,
                point.y - mouse.position.y
            );
            const mouseInfluence = Math.max(
                0,
                1 - distanceFromMouse / mouse.influenceRadius
            );
            const breathe =
                1 +
                Math.sin(
                    this.time * grid.breathingSpeed + point.noiseOffset
                ) *
                grid.breathingIntensity;
            const dotRadius =
                grid.baseDotSize *
                breathe *
                (1 + (mouse.maxScale - 1) * mouseInfluence);

            const alpha = Math.max(
                0,
                Math.min(
                    1,
                    0.7 +
                    0.3 *
                    Math.sin(
                        this.time * grid.breathingSpeed +
                        point.noiseOffset
                    )
                )
            );

            let dotColor;
            if (colors.gradient.dots.enabled) {
                dotColor = getMultiEasedColor(
                    this.time,
                    colors.gradient.dots.colors,
                    1,
                    colors.gradient.cycleDuration,
                    colors.gradient.easing
                );
                this.renderer.setGlobalAlpha(alpha);
            } else {
                dotColor = getShapeColor(alpha, colors.scheme);
            }

            this.renderer.drawCircle(
                point.x,
                point.y,
                dotRadius,
                dotColor
            );

            this.renderer.resetGlobalAlpha();
        });
    }

    drawShapes(centerX, centerY) {
        const { shapes } = this.settings;

        // Draw primary shape
        this.drawPrimaryShape(centerX, centerY);

        // Draw accent shapes
        this.drawAccentShapes(centerX, centerY);
    }

    drawPrimaryShape(centerX, centerY) {
        const { shapes } = this.settings;
        const { primary } = shapes;

        // Calculate position with offset
        const shapeCenterX = centerX + primary.position.offsetX;
        const shapeCenterY = centerY + primary.position.offsetY;

        // Draw the main primary shape
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

    drawAccentShapes(centerX, centerY) {
        const { shapes } = this.settings;
        const { primary, accent } = shapes;

        // Only draw accent shapes if enabled
        if (!accent.show) return;

        // Base position is primary shape position
        const baseCenterX = centerX + primary.position.offsetX;
        const baseCenterY = centerY + primary.position.offsetY;

        // Draw multiple accent shapes in a pattern
        for (let i = 0; i < accent.position.spawnCount; i++) {
            const angle = i * (2 * Math.PI / accent.position.spawnCount);
            const dx = accent.position.distanceX * Math.cos(angle);
            const dy = accent.position.distanceY * Math.sin(angle);
            const timeOffset = i * (accent.position.timeSpan / accent.position.spawnCount);

            this.drawShape(
                accent.type,
                baseCenterX + dx,
                baseCenterY + dy,
                accent.size,
                accent.thickness,
                accent.opacity,
                accent.fractal.depth,
                this.time + timeOffset,
                accent
            );
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        // Regenerate grid points if grid size or spacing changed
        if (
            newSettings.grid &&
            (newSettings.grid.size !== undefined || newSettings.grid.spacing !== undefined)
        ) {
            this.generateGridPoints();
        }
    }

    dispose() {
        this.stopAnimation();
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
    }
}

export default SacredGridRenderer;