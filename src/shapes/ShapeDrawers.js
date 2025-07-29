// src/shapes/ShapeDrawers.js
import { ShapeType, AnimationMode, ShapeTemplate, ModulationType } from '../constants/ShapeTypes';
import { calculateAnimationParams } from './ShapeUtils';
import { getMultiEasedColor, getShapeColor } from '../utils/drawingUtils';
import { 
    basicWaveFunctions, 
    parametricWaveFunctions, 
    modulationFunctions, 
    generateCompoundWave,
    waveTransforms
} from './WaveFunctions';

// Define new shape drawing functions for Hexagon and Pentagon
export function drawHexagon(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        // Apply opacity directly to the context for consistent handling between gradient/non-gradient modes
        ctx.globalAlpha = finalOpacity;
        // Get the shape color without embedding opacity (pass 1.0 as alpha)
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    // Get rotation
    const rotation = (shapeSettings.rotation * Math.PI) / 180;

    // Generate vertices for the hexagon
    const vertices = [];
    for (let i = 0; i < 6; i++) {
        const angle = rotation + i * Math.PI / 3;
        vertices.push({
            x: cx + dynamicRadius * Math.cos(angle),
            y: cy + dynamicRadius * Math.sin(angle)
        });
    }
    // Close the shape
    vertices.push({...vertices[0]});

    // Check if we should use enhanced line factory drawing
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices, globalSettings);
    } else {
        // Use the template for standard drawing
        if (typeof ctx.beginPath === 'function') {
            drawShapeTemplate(ctx, 
                { cx, cy, radius, thickness, strokeColor, dynamicRadius },
                ShapeTemplate.HEXAGON,
                true
            );
        } else if (ctx.drawPolygon) {
            // WebGL drawing - use the drawPolygon method directly
            ctx.drawPolygon(vertices, null, strokeColor, thickness);
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

export function drawPentagon(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        // Apply opacity directly to the context for consistent handling between gradient/non-gradient modes
        ctx.globalAlpha = finalOpacity;
        // Get the shape color without embedding opacity (pass 1.0 as alpha)
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    // Get rotation
    const rotation = (shapeSettings.rotation * Math.PI) / 180;

    // Generate vertices for the pentagon
    const vertices = [];
    for (let i = 0; i < 5; i++) {
        const angle = rotation + i * Math.PI * 2 / 5 - Math.PI / 2;
        vertices.push({
            x: cx + dynamicRadius * Math.cos(angle),
            y: cy + dynamicRadius * Math.sin(angle)
        });
    }
    // Close the shape
    vertices.push({...vertices[0]});

    // Check if we should use enhanced line factory drawing
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices, globalSettings);
    } else {
        // Use the template for standard drawing
        if (typeof ctx.beginPath === 'function') {
            drawShapeTemplate(ctx, 
                { cx, cy, radius, thickness, strokeColor, dynamicRadius },
                ShapeTemplate.PENTAGON,
                true
            );
        } else if (ctx.drawPolygon) {
            // WebGL drawing - use the drawPolygon method directly
            ctx.drawPolygon(vertices, null, strokeColor, thickness);
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

// Map shape types to drawer functions for easier lookup
export const ShapeDrawers = {
    [ShapeType.POLYGON]: drawPolygon,
    [ShapeType.FLOWER_OF_LIFE]: drawFlowerOfLife,
    [ShapeType.MERKABA]: drawMerkaba,
    [ShapeType.METATRONS_CUBE]: drawMetatronsCube,
    [ShapeType.TREE_OF_LIFE]: drawTreeOfLife,
    [ShapeType.CIRCLE]: drawCircle,
    [ShapeType.STAR]: drawStar,
    [ShapeType.SPIRAL]: drawSpiral,
    [ShapeType.LISSAJOUS]: drawLissajous,
    [ShapeType.HEXAGON]: drawHexagon,
    [ShapeType.PENTAGON]: drawPentagon
};

// Helper function to draw a shape using the new template system
function drawShapeTemplate(ctx, params, templateFn, isClosedPath) {
    const { cx, cy, radius, thickness, strokeColor, dynamicRadius } = params;
    
    // Ensure we're using a Canvas2D context and not WebGL context
    if (typeof ctx.beginPath !== 'function') {
        // If we have a WebGL context, try to use specialized WebGL drawing methods
        if (typeof ctx.drawCircle === 'function' && templateFn === ShapeTemplate.CIRCLE) {
            // Special handling for circles in WebGL
            console.log('WebGL drawing circle directly, radius:', dynamicRadius);
            ctx.drawCircle(cx, cy, dynamicRadius, strokeColor);
            return;
        } else if (typeof ctx.drawPolygon === 'function' && ctx.isWebGLContext === true) {
            // We are in WebGL mode but don't have a specific implementation
            // This would use the generic polygon approach
            console.log('WebGL template drawing for', templateFn.name || 'unnamed shape');
            return;
        }
        
        console.warn('drawShapeTemplate called with non-Canvas2D context');
        return;
    }
    
    // Begin path for the shape (Canvas2D mode)
    ctx.beginPath();
    
    // Use the shape template function to draw the shape
    try {
        templateFn(ctx, cx, cy, dynamicRadius);
    } catch (err) {
        console.error('Error executing shape template:', err);
    }
    
    // If the shape isn't automatically closed and should be, close it
    if (!isClosedPath) {
        ctx.closePath();
    }
    
    // Draw the shape
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = thickness;
    ctx.stroke();
}

// Helper function to draw a shape using line factory for each segment
// Enhanced function to draw a continuous path with any line effects
// This handles drawing the entire polygon as one continuous line
function drawContinuousPath(ctx, path, color, lineWidth, lineSettings) {
    // We need to create a new special path that follows the polygon vertices
    // but maintains continuous effects throughout
    
    // Apply continuous path drawing for line effects
    
    // BUGFIX: Ensure minimum width is applied - increase the minimum to 1.0 for better visibility
    const effectiveLineWidth = Math.max(lineWidth, 1.0);
    
    const { points, totalLength } = path;
    if (points.length < 2) return;
    
    // Calculate cumulative distances along the path
    const cumulativeDistances = [0]; // Start with 0
    let totalPathLength = 0;
    
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        const segLength = Math.sqrt(dx * dx + dy * dy);
        totalPathLength += segLength;
        cumulativeDistances.push(totalPathLength);
    }
    
    // Get wave settings - with defaults if not specified
    const useSineWave = lineSettings.sineWave && lineSettings.sineWave.type && 
                        lineSettings.sineWave.type !== 'none';
    
    // Default to sine wave if style is wavy, or square wave if zigzag
    let effectiveWaveType = 'none';
    let effectiveAmplitude = 0;
    let effectiveFrequency = 0.1;
    
    if (useSineWave) {
        effectiveWaveType = lineSettings.sineWave.type || 'sine';
        effectiveAmplitude = lineSettings.sineWave.amplitude || 5;
        effectiveFrequency = lineSettings.sineWave.frequency || 0.1;
    } else if (lineSettings.style === 'wavy') {
        effectiveWaveType = 'sine';
        effectiveAmplitude = 5;
        effectiveFrequency = 0.1;
    } else if (lineSettings.style === 'zigzag') {
        effectiveWaveType = 'square';
        effectiveAmplitude = 5;
        effectiveFrequency = 0.1;
    }
    
    // Only proceed with wave generation if we're actually using a wave effect
    const useWaveEffect = effectiveWaveType !== 'none';
    
    // If not using any wave effect, draw a standard path
    if (!useWaveEffect) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        return;
    }
    
    // Wave animation parameters
    const phase = (useSineWave && lineSettings.sineWave.phase) || 0;
    const animated = (useSineWave && lineSettings.sineWave.animated) || false;
    const time = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const waveSpeed = (useSineWave && lineSettings.sineWave.speed) || 0.2;
    
    // Always use bidirectional for better loop closure
    const bidirectional = true;
    
    // Adjust phase for animation if enabled
    let animatedPhase = phase;
    if (animated) {
        // Use the current time to animate the phase
        animatedPhase += time * 0.001 * waveSpeed;
    }
    
    // Calculate total number of wave cycles for the entire path
    // Force whole number of cycles for proper loop closure
    const exactCycles = Math.max(1, Math.round(effectiveFrequency * totalPathLength / 30));
    
    // Generate a path with densely packed points for smooth wave effects
    // More points = smoother curves, especially for complex shapes
    const totalPoints = Math.max(100, Math.ceil(totalPathLength / 3)); 
    
    // Path for the final shape
    const shapePath = [];
    
    for (let i = 0; i <= totalPoints; i++) {
        // Progress along the total path (0 to 1)
        const progress = i / totalPoints;
        const distanceAlongPath = progress * totalPathLength;
        
        // Find which segment this point belongs to
        let segmentIndex = 0;
        while (segmentIndex < cumulativeDistances.length - 1 && 
               cumulativeDistances[segmentIndex + 1] < distanceAlongPath) {
            segmentIndex++;
        }
        
        // Calculate the progress within the current segment
        const segmentStartDist = cumulativeDistances[segmentIndex];
        const segmentEndDist = cumulativeDistances[segmentIndex + 1] || totalPathLength;
        const segmentLength = segmentEndDist - segmentStartDist;
        const segmentProgress = segmentLength > 0 ? 
            (distanceAlongPath - segmentStartDist) / segmentLength : 0;
        
        // Get the segment start and end points
        const startPoint = points[segmentIndex];
        const endPoint = points[segmentIndex + 1] || points[0]; // Loop back to start
        
        // Interpolate position along the segment
        const x = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
        const y = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
        
        // Calculate angle of the current segment for perpendicular offset
        const angle = Math.atan2(
            endPoint.y - startPoint.y,
            endPoint.x - startPoint.x
        );
        
        // Calculate wave angle - blending forward and reverse waves
        let waveAngle;
        
        if (bidirectional) {
            // Create forward and reverse waves
            const forwardAngle = progress * Math.PI * 2 * exactCycles + animatedPhase;
            const reversePhase = animatedPhase + Math.PI;
            const reverseAngle = (1 - progress) * Math.PI * 2 * exactCycles + reversePhase;
            
            // Create blend factor with smooth sine curve (0 -> 1 -> 0)
            // This is the key to perfect loop closure at vertices
            const blendFactor = Math.sin(progress * Math.PI);
            
            // Blend the forward and reverse angles
            waveAngle = forwardAngle * blendFactor + reverseAngle * (1 - blendFactor);
        } else {
            // Simple continuous wave along the path
            waveAngle = progress * Math.PI * 2 * exactCycles + animatedPhase;
        }
        
        // Calculate wave offset based on the type using the new wave function system
        let waveOffset = 0;
        let offsetX = 0;
        let offsetY = 0;
        
        // Get modulation settings
        const modulation = lineSettings.modulation || { type: 'none' };
        let modulatedAngle = waveAngle;
        let modulatedAmplitude = effectiveAmplitude;
        
        // Apply modulation if enabled
        if (modulation.type && modulation.type !== 'none') {
            switch (modulation.type) {
                case 'frequency':
                    modulatedAngle = modulationFunctions.frequencyModulation(waveAngle, {
                        modFrequency: modulation.frequency || 0.1,
                        modDepth: modulation.depth || 0.5,
                        time: time * 0.001
                    });
                    break;
                case 'amplitude':
                    modulatedAmplitude = modulationFunctions.amplitudeModulation(effectiveAmplitude, {
                        modFrequency: modulation.frequency || 0.1,
                        modDepth: modulation.depth || 0.5,
                        time: time * 0.001
                    });
                    break;
                case 'phase':
                    modulatedAngle = modulationFunctions.phaseModulation(waveAngle, {
                        modFrequency: modulation.frequency || 0.1,
                        modDepth: modulation.depth || Math.PI/2,
                        time: time * 0.001
                    });
                    break;
                case 'harmonic':
                    // Use the harmonic modulation function directly
                    waveOffset = modulationFunctions.harmonicModulation(waveAngle, modulatedAmplitude, {
                        harmonics: modulation.harmonics || [1, 0.5, 0.25],
                        time: time * 0.001
                    });
                    break;
            }
        }
        
        // Apply different wave types
        if (effectiveWaveType === 'compound' && lineSettings.compound && lineSettings.compound.components) {
            // Use compound wave generator
            waveOffset = generateCompoundWave(
                modulatedAngle, 
                modulatedAmplitude, 
                lineSettings.compound.components
            );
        } 
        // Handle parametric waves (which need both X and Y offsets)
        else if (['lissajous', 'figure8', 'rose', 'butterfly'].includes(effectiveWaveType)) {
            // Get the parametric wave function
            const paramWaveFn = parametricWaveFunctions[effectiveWaveType];
            
            if (paramWaveFn) {
                // Build params object from settings or defaults
                const params = {
                    amplitude: modulatedAmplitude,
                    // Specific parameters for each type from lineSettings if available
                    ...(lineSettings.parametric || {})
                };
                
                // Calculate x,y offset from parametric function
                const offset = paramWaveFn(modulatedAngle, params);
                offsetX = offset.x;
                offsetY = offset.y;
            }
        }
        // Basic wave functions
        else {
            // Get the wave function from our library (or default to sine)
            const waveFn = basicWaveFunctions[effectiveWaveType] || basicWaveFunctions.sine;
            
            // Calculate the offset using the selected wave function
            waveOffset = waveFn(modulatedAngle, modulatedAmplitude);
            
            // Apply transforms if available
            if (lineSettings.transform && lineSettings.transform.type) {
                const transformFn = waveTransforms[lineSettings.transform.type];
                if (transformFn) {
                    const transformParams = lineSettings.transform.params || {};
                    waveOffset = transformFn(waveOffset, modulatedAmplitude, transformParams);
                }
            }
        }
        
        // Calculate perpendicular offsets to the line segment
        const perpX = Math.sin(angle);
        const perpY = -Math.cos(angle);
        
        // Apply wave offset - handle both parametric and standard waves
        let waveX, waveY;
        
        if (['lissajous', 'figure8', 'rose', 'butterfly'].includes(effectiveWaveType)) {
            // For parametric waves, use both X and Y offsets directly
            // But still orient them to the line direction
            const lineX = Math.cos(angle); // Line direction vector
            const lineY = Math.sin(angle);
            
            // Orient the parametric curve to the line direction
            waveX = x + lineX * offsetX + perpX * offsetY;
            waveY = y + lineY * offsetX + perpY * offsetY;
        } else {
            // Standard waves apply offset perpendicular to the path
            waveX = x + perpX * waveOffset;
            waveY = y + perpY * waveOffset;
        }
        
        // Add to the shape path
        shapePath.push({ x: waveX, y: waveY });
    }
    
    // Apply any special line settings before drawing
    ctx.save();
    
    // Apply glow if needed
    if (lineSettings.glow && lineSettings.glow.intensity > 0) {
        ctx.shadowBlur = lineSettings.glow.intensity;
        ctx.shadowColor = lineSettings.glow.color || color;
    }
    
    // Draw outline if enabled
    if (lineSettings.outline && lineSettings.outline.enabled) {
        ctx.beginPath();
        ctx.moveTo(shapePath[0].x, shapePath[0].y);
        
        for (let i = 1; i < shapePath.length; i++) {
            ctx.lineTo(shapePath[i].x, shapePath[i].y);
        }
        
        ctx.strokeStyle = lineSettings.outline.color || '#000000';
        ctx.lineWidth = lineWidth + (lineSettings.outline.width || 1) * 2;
        ctx.stroke();
    }
    
    // Reset shadow for main line
    ctx.shadowBlur = 0;
    
    // Now draw the final continuous path
    ctx.beginPath();
    ctx.moveTo(shapePath[0].x, shapePath[0].y);
    
    for (let i = 1; i < shapePath.length; i++) {
        ctx.lineTo(shapePath[i].x, shapePath[i].y);
    }
    
    // Apply dash pattern if needed
    if (lineSettings.style === 'dashed' && lineSettings.dash) {
        ctx.setLineDash(lineSettings.dash.pattern || [5, 5]);
        ctx.lineDashOffset = lineSettings.dash.offset || 0;
    } else if (lineSettings.style === 'dotted') {
        ctx.setLineDash([2, 4]);
    } else {
        ctx.setLineDash([]);
    }
    
    // Draw main path
    ctx.strokeStyle = color;
    // BUGFIX: Use our effective line width to ensure visibility
    ctx.lineWidth = effectiveLineWidth;
    ctx.stroke();
    
    // Restore context
    ctx.restore();
}

// Helper function to draw a shape using line factory for each segment
function drawShapeWithLineFactory(ctx, params, vertices, globalSettings) {
    const { thickness, strokeColor } = params;
    const lineFactorySettings = { ...globalSettings.lineFactory };
    
    // Using line factory for drawing
    
    // Ensure minimum thickness is applied to prevent invisible lines - increase to 1.0 for better visibility
    const effectiveThickness = Math.max(thickness, 1.0);
    
    // Ensure the loopLine setting is honored
    // This is critical for closed shapes like polygons
    lineFactorySettings.loopLine = true;
    
    // Store the original path points for the shape to ensure proper closure
    const shapePoints = [];
    
    // First collect all points (needed to calculate proper frequencies for wave effects)
    for (let i = 0; i < vertices.length; i++) {
        shapePoints.push({
            x: vertices[i].x,
            y: vertices[i].y
        });
    }
    
    // Add the first point again to create a complete loop
    if (vertices.length > 0) {
        shapePoints.push({
            x: vertices[0].x, 
            y: vertices[0].y
        });
    }
    
    // Calculate total perimeter length (needed for wave frequency calculation)
    let totalLength = 0;
    for (let i = 0; i < shapePoints.length - 1; i++) {
        const dx = shapePoints[i+1].x - shapePoints[i].x;
        const dy = shapePoints[i+1].y - shapePoints[i].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
    }
    
    // ALWAYS use the continuous path approach for all wave types
    // This creates a unified consistent rendering system that avoids
    // conflicts between different rendering methods
    
    // Create a continuous path
    const continuousPath = {
        points: shapePoints,
        totalLength: totalLength
    };
    
    // Use bidirectional waves setting from line factory or force it for better loop connectivity
    const enhancedSettings = { 
        ...lineFactorySettings, 
        bidirectionalWaves: lineFactorySettings.bidirectionalWaves !== undefined ? 
            lineFactorySettings.bidirectionalWaves : true,
        loopLine: true  // Always ensure looping for polygon shapes
    };
    
    // Use special continuous path drawing function for ALL line types, not just sine waves
    // This ensures consistent rendering and avoids competing approaches
    drawContinuousPath(ctx, continuousPath, strokeColor, effectiveThickness, enhancedSettings);
}

export function drawPolygon(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;
    
    // EMERGENCY DEBUG PRINT FOR WebGL TRACING
    console.log("SHAPE DRAWER: drawPolygon called", {
        cx, cy, radius, thickness, 
        isWebGL: ctx.isWebGLContext === true,
        transparency: globalSettings.colors.scheme.opacity
    });

    // Calculate animation parameters with special handling for WebGL
    const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';
    let finalOpacity;
    
    if (isWebGL) {
        // Force maximum opacity in WebGL mode to ensure visibility
        finalOpacity = 1.0;
        console.log("FORCING FULL OPACITY FOR WEBGL POLYGON");
    } else {
        // Use normal opacity calculation for Canvas2D
        finalOpacity = calculateAnimationParams(time, shapeSettings, globalSettings).finalOpacity;
    }
    
    // Use normal radius calculation
    const { dynamicRadius } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        // Apply opacity directly to the context for consistent handling between gradient/non-gradient modes
        ctx.globalAlpha = finalOpacity;
        // Get the shape color without embedding opacity (pass 1.0 as alpha)
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    // Get the number of vertices (sides) and rotation angle
    const sides = shapeSettings.vertices || 3;
    const rotation = (shapeSettings.rotation * Math.PI) / 180; // Convert to radians

    // Generate vertices for the polygon
    let vertices = [];
    
    // Check if we're using custom vertices
    if (shapeSettings.useCustomVertices && shapeSettings.customVertices && shapeSettings.customVertices.length > 2) {
        // Use custom vertices - scale them to match the current dynamic radius
        // and adjust for center position
        const customVertices = shapeSettings.customVertices;
        const maxCustomRadius = Math.max(...customVertices.map(v => 
            Math.sqrt(v.x * v.x + v.y * v.y)
        ));
        
        // Calculate scale factor to maintain relative size
        const scaleFactor = maxCustomRadius > 0 ? dynamicRadius / maxCustomRadius : 1;
        
        // Create scaled and positioned vertices
        vertices = customVertices.map(v => ({
            x: cx + v.x * scaleFactor,
            y: cy + v.y * scaleFactor
        }));
    } else {
        // Use standard polygon calculation based on sides
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides + rotation;
            vertices.push({
                x: cx + dynamicRadius * Math.cos(angle),
                y: cy + dynamicRadius * Math.sin(angle),
            });
        }
    }
    
    // ALWAYS ensure that the polygon path forms a complete loop
    // This is critical for wave continuity at the joining point
    if (vertices.length > 0) {
        // Add first vertex again at the end (if not already there)
        // First check if they're different
        const firstV = vertices[0];
        const lastV = vertices[vertices.length - 1];
        
        if (Math.abs(firstV.x - lastV.x) > 0.001 || Math.abs(firstV.y - lastV.y) > 0.001) {
            // Add first vertex again to close the loop
            vertices.push({...vertices[0]});
        }
    }

    // Check if we should use enhanced line factory drawing
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices, globalSettings);
    } else {
        // Check if we're in WebGL mode
        
        if (isWebGL) {
            // WebGL drawing - use the drawPolygon method directly
            if (ctx.drawPolygon && vertices && vertices.length > 2) {
                // EMERGENCY: Force bright color and thick lines for WebGL
                const webglColor = "#FF00FF"; // Bright magenta
                const webglThickness = Math.max(thickness * 5, 5); // Much thicker
                
                console.log("EMERGENCY: WebGL polygon forced to magenta with thickness:", webglThickness);
                
                // For WebGL, need to pass line settings when useLineFactory is true
                if (shapeSettings.useLineFactory && globalSettings.lineFactory) {
                    ctx.drawPolygon(vertices, null, webglColor, webglThickness, globalSettings.lineFactory);
                } else {
                    ctx.drawPolygon(vertices, null, webglColor, webglThickness);
                }
            } else {
                console.error('Cannot draw polygon in WebGL - missing method or insufficient vertices');
            }
        } else {
            // Standard Canvas2D drawing
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.strokeStyle = strokeColor;
            // BUGFIX: Ensure minimum line width for visibility - increase to 1.0 for better visibility
            ctx.lineWidth = Math.max(thickness, 1.0);
            ctx.stroke();
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

export function drawFlowerOfLife(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Debug info
    console.log('drawFlowerOfLife called with:', 
        'cx:', cx, 
        'cy:', cy, 
        'radius:', radius, 
        'ctx type:', typeof ctx.beginPath === 'function' ? 'Canvas2D' : 'WebGL');

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        // Apply opacity directly to the context for consistent handling between gradient/non-gradient modes
        ctx.globalAlpha = finalOpacity;
        // Get the shape color without embedding opacity (pass 1.0 as alpha)
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    // Integrate rotation for the surrounding circles
    const rotation = (shapeSettings.rotation * Math.PI) / 180; // Convert to radians

    // Check if we should use Line Factory settings
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        // Draw using shape template with line factory
        const segments = 36; // Number of segments to approximate the circle
        
        // Draw the central circle
        const centralCircleVertices = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            centralCircleVertices.push({
                x: cx + dynamicRadius * Math.cos(angle),
                y: cy + dynamicRadius * Math.sin(angle)
            });
        }
        // Close the circle by connecting back to first point
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, centralCircleVertices, globalSettings);
        
        // Draw six surrounding circles arranged in a hexagon
        for (let i = 0; i < 6; i++) {
            const centerAngle = rotation + (i * 2 * Math.PI) / 6;
            const centerX = cx + dynamicRadius * Math.cos(centerAngle);
            const centerY = cy + dynamicRadius * Math.sin(centerAngle);
            
            // Generate vertices for each surrounding circle
            const circleVertices = [];
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                circleVertices.push({
                    x: centerX + dynamicRadius * Math.cos(angle),
                    y: centerY + dynamicRadius * Math.sin(angle)
                });
            }
            // Draw the circle
            drawShapeWithLineFactory(ctx, { thickness, strokeColor }, circleVertices, globalSettings);
        }
    } else {
        // Check if we're in WebGL mode
        const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';
        
        if (isWebGL) {
            console.log('Using WebGL mode for Flower of Life');
            // WebGL drawing - use drawCircle directly
            
            if (typeof ctx.drawCircle === 'function') {
                // Draw the central circle
                ctx.drawCircle(cx, cy, dynamicRadius, strokeColor);
                
                // Draw six surrounding circles arranged in a hexagon
                for (let i = 0; i < 6; i++) {
                    const angle = rotation + (i * 2 * Math.PI) / 6;
                    const x = cx + dynamicRadius * Math.cos(angle);
                    const y = cy + dynamicRadius * Math.sin(angle);
                    ctx.drawCircle(x, y, dynamicRadius, strokeColor);
                }
            } else {
                console.error('WebGL context has no drawCircle method');
            }
        } else {
            // Canvas2D mode
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = thickness;
            
            // Draw the central circle
            ctx.beginPath();
            ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw six surrounding circles arranged in a hexagon
            for (let i = 0; i < 6; i++) {
                const angle = rotation + (i * 2 * Math.PI) / 6;
                const x = cx + dynamicRadius * Math.cos(angle);
                const y = cy + dynamicRadius * Math.sin(angle);
                
                ctx.beginPath();
                ctx.arc(x, y, dynamicRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

export function drawMerkaba(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        strokeColor = getShapeColor(finalOpacity, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
        ctx.globalAlpha = 1;
    }

    // Integrate rotation for the triangles
    const rotation = (shapeSettings.rotation * Math.PI) / 180; // Convert to radians

    // First triangle: oriented upwards
    const vertices1 = [];
    for (let i = 0; i < 3; i++) {
        const angle = rotation + (i * 2 * Math.PI) / 3 + Math.PI / 6;
        vertices1.push({
            x: cx + dynamicRadius * Math.cos(angle),
            y: cy + dynamicRadius * Math.sin(angle),
        });
    }

    // Second triangle: rotated 60° relative to the first (inverted)
    const vertices2 = [];
    for (let i = 0; i < 3; i++) {
        const angle = rotation + (i * 2 * Math.PI) / 3 + Math.PI / 6 + Math.PI;
        vertices2.push({
            x: cx + dynamicRadius * Math.cos(angle),
            y: cy + dynamicRadius * Math.sin(angle),
        });
    }

    // Check if we should use Line Factory settings
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        // Draw the first triangle with line factory settings
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices1, globalSettings);
        
        // Draw the second triangle with line factory settings
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices2, globalSettings);
    } else {
        // Check if we're in WebGL mode
        const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';
        
        if (isWebGL) {
            // WebGL drawing - use the drawPolygon method directly
            if (ctx.drawPolygon) {
                ctx.drawPolygon(vertices1, null, strokeColor, thickness);
                ctx.drawPolygon(vertices2, null, strokeColor, thickness);
            }
        } else {
            // Canvas2D mode
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = thickness;
            
            // Draw the first triangle
            ctx.beginPath();
            ctx.moveTo(vertices1[0].x, vertices1[0].y);
            for (let i = 1; i < vertices1.length; i++) {
                ctx.lineTo(vertices1[i].x, vertices1[i].y);
            }
            ctx.closePath();
            ctx.stroke();

            // Draw the second triangle
            ctx.beginPath();
            ctx.moveTo(vertices2[0].x, vertices2[0].y);
            for (let i = 1; i < vertices2.length; i++) {
                ctx.lineTo(vertices2[i].x, vertices2[i].y);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

// New shape drawing functions using the template system

export function drawCircle(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        // Apply opacity directly to the context for consistent handling between gradient/non-gradient modes
        ctx.globalAlpha = finalOpacity;
        // Get the shape color without embedding opacity (pass 1.0 as alpha)
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    // Check if we should use enhanced line factory drawing
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        // Draw circle using line segments for line factory effects
        const segments = 36; // Number of segments to approximate the circle
        const vertices = [];
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            vertices.push({
                x: cx + dynamicRadius * Math.cos(angle),
                y: cy + dynamicRadius * Math.sin(angle)
            });
        }
        
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices, globalSettings);
    } else {
        // Use the shape template for standard drawing
        if (typeof ctx.beginPath === 'function') {
            drawShapeTemplate(ctx, 
                { cx, cy, radius, thickness, strokeColor, dynamicRadius }, 
                ShapeTemplate.CIRCLE, 
                true
            );
        } else if (ctx.drawCircle) {
            // WebGL drawing - use drawCircle directly
            ctx.drawCircle(cx, cy, dynamicRadius, strokeColor);
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

export function drawStar(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        // Apply opacity directly to the context for consistent handling between gradient/non-gradient modes
        ctx.globalAlpha = finalOpacity;
        // Get the shape color without embedding opacity (pass 1.0 as alpha)
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    // Get number of points and inner radius ratio
    const points = shapeSettings.vertices || 5;
    const innerRadius = shapeSettings.innerRadiusRatio || 0.4;
    const rotation = (shapeSettings.rotation * Math.PI) / 180; // Convert to radians

    // Generate vertices for the star
    const vertices = [];
    for (let i = 0; i < points * 2; i++) {
        const angle = rotation + i * Math.PI / points - Math.PI / 2;
        const r = i % 2 === 0 ? dynamicRadius : dynamicRadius * innerRadius;
        vertices.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    
    // Close the shape by adding the first vertex at the end
    if (vertices.length > 0) {
        vertices.push({...vertices[0]});
    }

    // Check if we should use enhanced line factory drawing
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices, globalSettings);
    } else {
        // Use the template for standard drawing
        if (typeof ctx.beginPath === 'function') {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation); // Apply rotation
            ctx.translate(-cx, -cy);
            
            drawShapeTemplate(ctx, 
                { cx, cy, radius, thickness, strokeColor, dynamicRadius },
                (ctx, x, y, r) => ShapeTemplate.STAR(ctx, x, y, r, points, innerRadius),
                true
            );
            
            ctx.restore();
        } else if (ctx.isWebGLContext === true && ctx.drawPolygon) {
            // WebGL drawing - use the drawPolygon method directly
            if (vertices && vertices.length > 2) {
                console.log('Drawing star with WebGL, vertices:', vertices.length);
                ctx.drawPolygon(vertices, null, strokeColor, thickness);
            } else {
                console.error('Cannot draw star in WebGL - insufficient vertices');
            }
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

export function drawLissajous(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        strokeColor = getShapeColor(finalOpacity, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
        ctx.globalAlpha = 1;
    }

    // Lissajous parameters (use settings if available)
    const a = shapeSettings.paramA || 3;
    const b = shapeSettings.paramB || 2;
    const delta = shapeSettings.paramDelta || (shapeSettings.rotation * Math.PI) / 180; // Use either explicit delta or rotation
    const segments = 100;

    // Generate vertices for the Lissajous curve
    const vertices = [];
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        vertices.push({
            x: cx + dynamicRadius * Math.sin(a * t + delta),
            y: cy + dynamicRadius * Math.sin(b * t)
        });
    }

    // Check if we should use enhanced line factory drawing
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        // For line factory, we need to draw segment by segment
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices, globalSettings);
    } else {
        // Use the template for standard drawing
        if (typeof ctx.beginPath === 'function') {
            drawShapeTemplate(ctx, 
                { cx, cy, radius, thickness, strokeColor, dynamicRadius },
                (ctx, x, y, r) => ShapeTemplate.LISSAJOUS(ctx, x, y, r, a, b, delta, segments),
                false // Lissajous may not be a closed path
            );
        } else if (ctx.isWebGLContext === true && ctx.drawPolygon) {
            // WebGL drawing - use the drawPolygon method directly
            if (vertices && vertices.length > 2) {
                console.log('Drawing lissajous with WebGL, vertices:', vertices.length);
                ctx.drawPolygon(vertices, null, strokeColor, thickness);
            } else {
                console.error('Cannot draw lissajous in WebGL - insufficient vertices');
            }
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

export function drawSpiral(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        // Apply opacity directly to the context for consistent handling between gradient/non-gradient modes
        ctx.globalAlpha = finalOpacity;
        // Get the shape color without embedding opacity (pass 1.0 as alpha)
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    // Spiral parameters (use settings if available)
    const turns = shapeSettings.turns || 3;
    const decay = shapeSettings.decay || 0.15;
    const segments = 100;
    const rotation = (shapeSettings.rotation * Math.PI) / 180; // Apply as initial angle offset

    // Generate vertices for the spiral
    const vertices = [];
    for (let i = 0; i <= segments; i++) {
        const angle = rotation + (i / segments) * Math.PI * 2 * turns;
        const r = dynamicRadius * (1 - (i / segments) * decay);
        vertices.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }

    // Check if we should use enhanced line factory drawing
    if (ctx.drawLine && shapeSettings.useLineFactory && globalSettings.lineFactory) {
        // For line factory, treat as a shape for better looping
        drawShapeWithLineFactory(ctx, { thickness, strokeColor }, vertices, globalSettings);
    } else {
        // Use the template for standard drawing
        if (typeof ctx.beginPath === 'function') {
            drawShapeTemplate(ctx, 
                { cx, cy, radius, thickness, strokeColor, dynamicRadius },
                (ctx, x, y, r) => ShapeTemplate.SPIRAL(ctx, x, y, r, turns, decay, segments),
                false // Spiral is not a closed path
            );
        } else if (ctx.isWebGLContext === true && ctx.drawPolygon) {
            // WebGL drawing - use the drawPolygon method directly
            if (vertices && vertices.length > 2) {
                console.log('Drawing spiral with WebGL, vertices:', vertices.length);
                ctx.drawPolygon(vertices, null, strokeColor, thickness);
            } else {
                console.error('Cannot draw spiral in WebGL - insufficient vertices');
            }
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
}

export function drawMetatronsCube(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        ctx.globalAlpha = finalOpacity;
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    const rotation = (shapeSettings.rotation * Math.PI) / 180;
    const circleRadius = dynamicRadius / 6;

    // Check if we're in WebGL mode
    const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';

    if (isWebGL) {
        if (typeof ctx.drawCircle === 'function') {
            // Central circle
            ctx.drawCircle(cx, cy, circleRadius, strokeColor);

            // Inner hexagon - 6 circles
            const innerRadius = circleRadius * 2;
            for (let i = 0; i < 6; i++) {
                const angle = rotation + (i / 6) * Math.PI * 2;
                const x = cx + innerRadius * Math.cos(angle);
                const y = cy + innerRadius * Math.sin(angle);
                ctx.drawCircle(x, y, circleRadius, strokeColor);
            }

            // Outer hexagon - 6 circles
            const outerRadius = circleRadius * 4;
            for (let i = 0; i < 6; i++) {
                const angle = rotation + (i / 6) * Math.PI * 2 + (Math.PI / 6);
                const x = cx + outerRadius * Math.cos(angle);
                const y = cy + outerRadius * Math.sin(angle);
                ctx.drawCircle(x, y, circleRadius, strokeColor);
            }
        }
    } else {
        // Canvas2D mode
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = thickness;

        // Central circle
        ctx.beginPath();
        ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner hexagon - 6 circles
        const innerRadius = circleRadius * 2;
        for (let i = 0; i < 6; i++) {
            const angle = rotation + (i / 6) * Math.PI * 2;
            const x = cx + innerRadius * Math.cos(angle);
            const y = cy + innerRadius * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Outer hexagon - 6 circles
        const outerRadius = circleRadius * 4;
        for (let i = 0; i < 6; i++) {
            const angle = rotation + (i / 6) * Math.PI * 2 + (Math.PI / 6);
            const x = cx + outerRadius * Math.cos(angle);
            const y = cy + outerRadius * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Reset global alpha
    ctx.globalAlpha = 1;
}

export function drawTreeOfLife(ctx, params) {
    const { cx, cy, radius, thickness, shapeSettings, time, globalSettings } = params;

    // Calculate animation parameters
    const { dynamicRadius, finalOpacity } = calculateAnimationParams(
        time,
        shapeSettings,
        globalSettings
    );

    // Set the stroke style
    let strokeColor;
    if (globalSettings.colors.gradient.shapes.enabled) {
        strokeColor = getMultiEasedColor(
            time,
            globalSettings.colors.gradient.shapes.colors,
            1,
            globalSettings.colors.gradient.cycleDuration,
            globalSettings.colors.gradient.easing
        );
        ctx.globalAlpha = finalOpacity;
    } else {
        ctx.globalAlpha = finalOpacity;
        strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    }

    const rotation = (shapeSettings.rotation * Math.PI) / 180;
    const sephirahRadius = dynamicRadius / 12;

    // Traditional Tree of Life positions (simplified)
    const sephirot = [
        { x: 0, y: -dynamicRadius * 0.8, name: 'Kether' },      // Crown
        { x: -dynamicRadius * 0.3, y: -dynamicRadius * 0.5, name: 'Chokmah' },   // Wisdom
        { x: dynamicRadius * 0.3, y: -dynamicRadius * 0.5, name: 'Binah' },      // Understanding
        { x: -dynamicRadius * 0.4, y: -dynamicRadius * 0.1, name: 'Chesed' },    // Mercy
        { x: dynamicRadius * 0.4, y: -dynamicRadius * 0.1, name: 'Geburah' },    // Severity
        { x: 0, y: 0, name: 'Tiphareth' },                      // Beauty
        { x: -dynamicRadius * 0.4, y: dynamicRadius * 0.3, name: 'Netzach' },    // Victory
        { x: dynamicRadius * 0.4, y: dynamicRadius * 0.3, name: 'Hod' },         // Glory
        { x: 0, y: dynamicRadius * 0.5, name: 'Yesod' },        // Foundation
        { x: 0, y: dynamicRadius * 0.8, name: 'Malkuth' }       // Kingdom
    ];

    // Apply rotation to positions
    const rotatedSephirot = sephirot.map(seph => ({
        x: cx + seph.x * Math.cos(rotation) - seph.y * Math.sin(rotation),
        y: cy + seph.x * Math.sin(rotation) + seph.y * Math.cos(rotation),
        name: seph.name
    }));

    // Check if we're in WebGL mode
    const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';

    if (isWebGL) {
        if (typeof ctx.drawCircle === 'function' && typeof ctx.drawLine === 'function') {
            // Draw connecting paths first
            const paths = [
                [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5],
                [5, 6], [5, 7], [5, 8], [6, 7], [6, 8], [7, 8], [8, 9]
            ];

            paths.forEach(([from, to]) => {
                const fromSeph = rotatedSephirot[from];
                const toSeph = rotatedSephirot[to];
                ctx.drawLine(fromSeph.x, fromSeph.y, toSeph.x, toSeph.y, strokeColor, thickness * 0.5);
            });

            // Draw sephirot circles
            rotatedSephirot.forEach(seph => {
                ctx.drawCircle(seph.x, seph.y, sephirahRadius, strokeColor);
            });
        }
    } else {
        // Canvas2D mode
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = thickness * 0.5;

        // Draw connecting paths first
        const paths = [
            [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5],
            [5, 6], [5, 7], [5, 8], [6, 7], [6, 8], [7, 8], [8, 9]
        ];

        paths.forEach(([from, to]) => {
            const fromSeph = rotatedSephirot[from];
            const toSeph = rotatedSephirot[to];

            ctx.beginPath();
            ctx.moveTo(fromSeph.x, fromSeph.y);
            ctx.lineTo(toSeph.x, toSeph.y);
            ctx.stroke();
        });

        // Draw sephirot circles
        ctx.lineWidth = thickness;
        rotatedSephirot.forEach(seph => {
            ctx.beginPath();
            ctx.arc(seph.x, seph.y, sephirahRadius, 0, Math.PI * 2);
            ctx.stroke();
        });
    }

    // Reset global alpha
    ctx.globalAlpha = 1;
}