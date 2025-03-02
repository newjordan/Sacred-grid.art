// Helper function to draw a continuous path with sine waves
// This handles drawing the entire polygon as one continuous line
function drawContinuousPath(ctx, path, color, lineWidth, lineSettings) {
    // We need to create a new special path that follows the polygon vertices
    // but maintains a continuous sine wave throughout
    
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
    
    // Get wave settings
    const waveType = lineSettings.sineWave.type || 'sine';
    const amplitude = lineSettings.sineWave.amplitude || 5;
    const frequency = lineSettings.sineWave.frequency || 0.1;
    const phase = lineSettings.sineWave.phase || 0;
    const animated = lineSettings.sineWave.animated || false;
    const time = performance.now(); // For animation
    const waveSpeed = lineSettings.sineWave.speed || 0.2;
    const bidirectional = lineSettings.bidirectionalWaves === true;
    
    // Adjust phase for animation if enabled
    let animatedPhase = phase;
    if (animated) {
        // Use the current time to animate the phase
        animatedPhase += time * 0.001 * waveSpeed;
    }
    
    // Calculate total number of wave cycles for the entire path
    // Force whole number of cycles for proper loop closure
    const exactCycles = Math.max(1, Math.round(frequency * totalPathLength / 30));
    
    // Generate a path with densely packed points for smooth sine waves
    const totalPoints = Math.max(50, Math.ceil(totalPathLength / 5)); // At least one point every 5px
    
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
        
        // Calculate wave angle
        let waveAngle;
        
        if (bidirectional) {
            // Create forward and reverse waves
            const forwardAngle = progress * Math.PI * 2 * exactCycles + animatedPhase;
            const reversePhase = animatedPhase + Math.PI;
            const reverseAngle = (1 - progress) * Math.PI * 2 * exactCycles + reversePhase;
            
            // Create blend factor with smooth sine curve (0 -> 1 -> 0)
            const blendFactor = Math.sin(progress * Math.PI);
            
            // Blend the forward and reverse angles
            waveAngle = forwardAngle * blendFactor + reverseAngle * (1 - blendFactor);
        } else {
            // Simple continuous wave along the path
            waveAngle = progress * Math.PI * 2 * exactCycles + animatedPhase;
        }
        
        // Calculate wave offset based on the type
        let waveOffset;
        switch (waveType) {
            case 'sine':
                waveOffset = Math.sin(waveAngle) * amplitude;
                break;
            case 'cosine':
                waveOffset = Math.cos(waveAngle) * amplitude;
                break;
            case 'square':
                waveOffset = (Math.sin(waveAngle) > 0 ? 1 : -1) * amplitude;
                break;
            case 'triangle':
                waveOffset = (Math.asin(Math.sin(waveAngle)) * 2 / Math.PI) * amplitude;
                break;
            default:
                waveOffset = 0;
        }
        
        // Calculate perpendicular offsets to the line segment
        const perpX = Math.sin(angle);
        const perpY = -Math.cos(angle);
        
        // Apply wave offset perpendicular to the path
        const waveX = x + perpX * waveOffset;
        const waveY = y + perpY * waveOffset;
        
        // Add to the shape path
        shapePath.push({ x: waveX, y: waveY });
    }
    
    // Now draw the final continuous path
    ctx.beginPath();
    ctx.moveTo(shapePath[0].x, shapePath[0].y);
    
    for (let i = 1; i < shapePath.length; i++) {
        ctx.lineTo(shapePath[i].x, shapePath[i].y);
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

// Helper function to draw a shape using line factory for each segment
function drawShapeWithLineFactory(ctx, params, vertices, globalSettings) {
    const { thickness, strokeColor } = params;
    const lineFactorySettings = { ...globalSettings.lineFactory };
    
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
    
    // For continuous line drawing, we need to handle the entire path differently
    // when using sine waves to ensure they're consistently maintained across the shape
    const usingSineWave = lineFactorySettings.sineWave && 
                         lineFactorySettings.sineWave.type \!== 'none';
    
    if (usingSineWave && vertices.length > 2) {
        // Create a continuous path by using a single drawLine call with multiple segments
        // This approach treats the entire polygon as one continuous line
        
        // Create a continuous path
        const continuousPath = {
            points: shapePoints,
            totalLength: totalLength
        };
        
        // Use a special draw continuous path function with the line settings
        drawContinuousPath(ctx, continuousPath, strokeColor, thickness, lineFactorySettings);
    } else {
        // Traditional approach - draw each segment separately
        // Draw each line segment using the line factory
        for (let i = 0; i < vertices.length; i++) {
            const startIdx = i;
            const endIdx = (i + 1) % vertices.length;
            
            // Calculate segment length as proportion of total perimeter
            // This helps adjust wave frequencies to maintain continuity
            const dx = vertices[endIdx].x - vertices[startIdx].x;
            const dy = vertices[endIdx].y - vertices[startIdx].y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);
            const segmentProportion = segmentLength / totalLength;
            
            // Create segment-specific line settings to ensure proper wave sync
            const segmentSettings = { ...lineFactorySettings };
            
            // If using sine wave, adjust phase based on progress along perimeter
            if (segmentSettings.sineWave && segmentSettings.sineWave.type \!== 'none') {
                // Calculate accumulated phase up to this segment
                let accumulatedPhase = 0;
                for (let j = 0; j < i; j++) {
                    const prevDx = vertices[(j+1) % vertices.length].x - vertices[j].x;
                    const prevDy = vertices[(j+1) % vertices.length].y - vertices[j].y;
                    const prevLength = Math.sqrt(prevDx * prevDx + prevDy * prevDy);
                    const prevProportion = prevLength / totalLength;
                    accumulatedPhase += prevProportion * Math.PI * 2;
                }
                
                // Use the accumulated phase to align wave patterns between segments
                segmentSettings.sineWave = {
                    ...segmentSettings.sineWave,
                    phaseOffset: accumulatedPhase
                };
            }
            
            // Use Canvas2DRenderer's enhanced drawLine method with line factory settings
            ctx.drawLine(
                vertices[startIdx].x,
                vertices[startIdx].y,
                vertices[endIdx].x,
                vertices[endIdx].y,
                strokeColor,
                thickness,
                segmentSettings
            );
        }
    }
}
