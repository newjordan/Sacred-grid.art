import React, { useEffect, useRef } from 'react';

const LinePreview = ({ settings }) => {
    const canvasRef = useRef(null);
    
    // Function to render the line preview
    const updateLinePreview = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the line
        const startX = 30;
        const endX = canvas.width - 30;
        const y = canvas.height / 2;
        const baseWidth = 3;
        
        // Set up glow if needed
        if (settings.lineFactory.glow.intensity > 0) {
            ctx.shadowBlur = settings.lineFactory.glow.intensity;
            ctx.shadowColor = settings.lineFactory.glow.color;
        }
        
        // Draw outline if enabled
        if (settings.lineFactory.outline.enabled) {
            ctx.beginPath();
            ctx.strokeStyle = settings.lineFactory.outline.color;
            ctx.lineWidth = baseWidth + settings.lineFactory.outline.width * 2;
            
            if (settings.lineFactory.sineWave.type !== 'none') {
                ctx.moveTo(startX, y);
                for (let x = startX; x <= endX; x++) {
                    let waveY = y;
                    const progress = (x - startX) / (endX - startX);
                    const angle = progress * Math.PI * 2 * settings.lineFactory.sineWave.frequency + settings.lineFactory.sineWave.phase;
                    
                    if (settings.lineFactory.sineWave.type === 'sine') {
                        waveY = y + Math.sin(angle) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'cosine') {
                        waveY = y + Math.cos(angle) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'square') {
                        waveY = y + (Math.sin(angle) > 0 ? 1 : -1) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'triangle') {
                        waveY = y + (Math.asin(Math.sin(angle)) * 2 / Math.PI) * settings.lineFactory.sineWave.amplitude;
                    }
                    
                    ctx.lineTo(x, waveY);
                }
            } else {
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
            }
            
            if (settings.lineFactory.style === 'dashed') {
                ctx.setLineDash(settings.lineFactory.dash.pattern);
                ctx.lineDashOffset = settings.lineFactory.dash.offset;
            } else if (settings.lineFactory.style === 'dotted') {
                ctx.setLineDash([2, 4]);
            } else {
                ctx.setLineDash([]);
            }
            
            ctx.stroke();
        }
        
        // Reset shadow for main line
        ctx.shadowBlur = 0;
        
        // Draw the main line
        ctx.beginPath();
        ctx.strokeStyle = '#3498db'; // Default blue color
        
        // Handle tapered lines
        if (settings.lineFactory.taper.type !== 'none') {
            const lineLength = endX - startX;
            
            if (settings.lineFactory.sineWave.type !== 'none') {
                // For sine waves with taper, we need to draw segments
                const segments = 100;
                
                for (let i = 0; i < segments; i++) {
                    const progress = i / segments;
                    const nextProgress = (i + 1) / segments;
                    
                    let width = baseWidth;
                    
                    // Apply taper based on type
                    if (settings.lineFactory.taper.type === 'start') {
                        width = baseWidth * (settings.lineFactory.taper.startWidth + (1 - settings.lineFactory.taper.startWidth) * progress);
                    } else if (settings.lineFactory.taper.type === 'end') {
                        width = baseWidth * (1 - (1 - settings.lineFactory.taper.endWidth) * progress);
                    } else if (settings.lineFactory.taper.type === 'both') {
                        if (progress < 0.5) {
                            width = baseWidth * (settings.lineFactory.taper.startWidth + (1 - settings.lineFactory.taper.startWidth) * (progress * 2));
                        } else {
                            width = baseWidth * (1 - (1 - settings.lineFactory.taper.endWidth) * ((progress - 0.5) * 2));
                        }
                    } else if (settings.lineFactory.taper.type === 'middle') {
                        if (progress < 0.5) {
                            width = baseWidth * (1 - (1 - settings.lineFactory.taper.startWidth) * ((0.5 - progress) * 2));
                        } else {
                            width = baseWidth * (1 - (1 - settings.lineFactory.taper.endWidth) * ((progress - 0.5) * 2));
                        }
                    }
                    
                    const x1 = startX + progress * lineLength;
                    const x2 = startX + nextProgress * lineLength;
                    
                    const angle1 = progress * Math.PI * 2 * settings.lineFactory.sineWave.frequency + settings.lineFactory.sineWave.phase;
                    const angle2 = nextProgress * Math.PI * 2 * settings.lineFactory.sineWave.frequency + settings.lineFactory.sineWave.phase;
                    
                    let y1 = y;
                    let y2 = y;
                    
                    if (settings.lineFactory.sineWave.type === 'sine') {
                        y1 = y + Math.sin(angle1) * settings.lineFactory.sineWave.amplitude;
                        y2 = y + Math.sin(angle2) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'cosine') {
                        y1 = y + Math.cos(angle1) * settings.lineFactory.sineWave.amplitude;
                        y2 = y + Math.cos(angle2) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'square') {
                        y1 = y + (Math.sin(angle1) > 0 ? 1 : -1) * settings.lineFactory.sineWave.amplitude;
                        y2 = y + (Math.sin(angle2) > 0 ? 1 : -1) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'triangle') {
                        y1 = y + (Math.asin(Math.sin(angle1)) * 2 / Math.PI) * settings.lineFactory.sineWave.amplitude;
                        y2 = y + (Math.asin(Math.sin(angle2)) * 2 / Math.PI) * settings.lineFactory.sineWave.amplitude;
                    }
                    
                    ctx.beginPath();
                    ctx.lineWidth = width;
                    
                    if (settings.lineFactory.style === 'dashed') {
                        ctx.setLineDash(settings.lineFactory.dash.pattern);
                        ctx.lineDashOffset = settings.lineFactory.dash.offset;
                    } else if (settings.lineFactory.style === 'dotted') {
                        ctx.setLineDash([2, 4]);
                    } else if (settings.lineFactory.style === 'wavy') {
                        // Wavy is handled by the sine wave
                    } else if (settings.lineFactory.style === 'zigzag') {
                        // ZigZag is handled as a special case of sine wave
                    } else {
                        ctx.setLineDash([]);
                    }
                    
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            } else {
                // For straight lines with taper
                const segments = 40;
                
                for (let i = 0; i < segments; i++) {
                    const progress = i / segments;
                    let width = baseWidth;
                    
                    // Apply taper based on type
                    if (settings.lineFactory.taper.type === 'start') {
                        width = baseWidth * (settings.lineFactory.taper.startWidth + (1 - settings.lineFactory.taper.startWidth) * progress);
                    } else if (settings.lineFactory.taper.type === 'end') {
                        width = baseWidth * (1 - (1 - settings.lineFactory.taper.endWidth) * progress);
                    } else if (settings.lineFactory.taper.type === 'both') {
                        if (progress < 0.5) {
                            width = baseWidth * (settings.lineFactory.taper.startWidth + (1 - settings.lineFactory.taper.startWidth) * (progress * 2));
                        } else {
                            width = baseWidth * (1 - (1 - settings.lineFactory.taper.endWidth) * ((progress - 0.5) * 2));
                        }
                    } else if (settings.lineFactory.taper.type === 'middle') {
                        if (progress < 0.5) {
                            width = baseWidth * (1 - (1 - settings.lineFactory.taper.startWidth) * ((0.5 - progress) * 2));
                        } else {
                            width = baseWidth * (1 - (1 - settings.lineFactory.taper.endWidth) * ((progress - 0.5) * 2));
                        }
                    }
                    
                    const x = startX + progress * lineLength;
                    const segmentLength = lineLength / segments;
                    
                    ctx.beginPath();
                    ctx.lineWidth = width;
                    
                    if (settings.lineFactory.style === 'dashed') {
                        ctx.setLineDash(settings.lineFactory.dash.pattern);
                        ctx.lineDashOffset = settings.lineFactory.dash.offset;
                    } else if (settings.lineFactory.style === 'dotted') {
                        ctx.setLineDash([2, 4]);
                    } else {
                        ctx.setLineDash([]);
                    }
                    
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + segmentLength, y);
                    ctx.stroke();
                }
            }
        } else {
            // Non-tapered lines
            ctx.lineWidth = baseWidth;
            
            // Handle different line styles
            if (settings.lineFactory.style === 'spiral') {
                // Draw spiral line
                const lineLength = endX - startX;
                const segments = 50;
                const maxRadius = 6;
                const time = performance.now() * 0.001;
                
                ctx.beginPath();
                for (let i = 0; i <= segments; i++) {
                    const progress = i / segments;
                    const xPos = startX + lineLength * progress;
                    
                    // Calculate spiral effect
                    const spiralRadius = Math.min(maxRadius, progress * 1.5 * baseWidth);
                    const spiralAngle = progress * Math.PI * 2 * 5 + time;
                    
                    // Calculate spiral offset
                    const offsetY = Math.cos(spiralAngle) * spiralRadius;
                    
                    // Apply offset
                    const spiralY = y + offsetY;
                    
                    if (i === 0) {
                        ctx.moveTo(xPos, spiralY);
                    } else {
                        ctx.lineTo(xPos, spiralY);
                    }
                }
                ctx.stroke();
            } else if (settings.lineFactory.style === 'ribbon') {
                // Draw ribbon line
                const lineLength = endX - startX;
                const segments = 50;
                const ribbonWidth = 6;
                const twistRate = 2;
                const time = performance.now() * 0.001;
                
                // Create two paths for the ribbon edges
                const topPoints = [];
                const bottomPoints = [];
                
                for (let i = 0; i <= segments; i++) {
                    const progress = i / segments;
                    const xPos = startX + lineLength * progress;
                    
                    // Calculate twist angle
                    const twistAngle = progress * Math.PI * 2 * twistRate + time;
                    const ribbonOffset = Math.sin(twistAngle) * (ribbonWidth / 2);
                    
                    // Calculate edge points
                    topPoints.push({ x: xPos, y: y + ribbonOffset });
                    bottomPoints.push({ x: xPos, y: y - ribbonOffset });
                }
                
                // Draw filled ribbon
                ctx.beginPath();
                
                // Top edge
                ctx.moveTo(topPoints[0].x, topPoints[0].y);
                for (let i = 1; i < topPoints.length; i++) {
                    ctx.lineTo(topPoints[i].x, topPoints[i].y);
                }
                
                // Bottom edge (reverse)
                for (let i = bottomPoints.length - 1; i >= 0; i--) {
                    ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
                }
                
                ctx.closePath();
                
                // Use a gradient fill for ribbon effect
                const gradient = ctx.createLinearGradient(startX, y, endX, y);
                gradient.addColorStop(0, ctx.strokeStyle);
                gradient.addColorStop(0.5, ctx.strokeStyle + "44"); // Semi-transparent
                gradient.addColorStop(1, ctx.strokeStyle);
                
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Outline
                ctx.lineWidth = baseWidth * 0.3;
                ctx.stroke();
            } else if (settings.lineFactory.style === 'double') {
                // Draw double line
                const spacing = 4;
                
                // Draw first line
                ctx.beginPath();
                ctx.lineWidth = baseWidth;
                ctx.moveTo(startX, y - spacing/2);
                ctx.lineTo(endX, y - spacing/2);
                ctx.stroke();
                
                // Draw second line
                ctx.beginPath();
                ctx.lineWidth = baseWidth * 0.7;
                ctx.moveTo(startX, y + spacing/2);
                ctx.lineTo(endX, y + spacing/2);
                ctx.stroke();
            } else if (settings.lineFactory.style === 'complex') {
                // Draw complex dotted/dashed pattern
                const pattern = settings.lineFactory.complex?.pattern || [5, 2, 2, 2, 10, 2];
                const time = performance.now() * 0.01;
                
                ctx.beginPath();
                ctx.lineWidth = baseWidth;
                ctx.setLineDash(pattern);
                ctx.lineDashOffset = time % 40; // Animate dash offset
                
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();
                
                // Reset dash pattern
                ctx.setLineDash([]);
            } else if (settings.lineFactory.style === 'dashed') {
                ctx.setLineDash(settings.lineFactory.dash.pattern);
                ctx.lineDashOffset = settings.lineFactory.dash.offset;
                
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();
            } else if (settings.lineFactory.style === 'dotted') {
                ctx.setLineDash([2, 4]);
                
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();
            } else if (settings.lineFactory.sineWave.type !== 'none') {
                // Get current time for animation
                const time = performance.now() * 0.001;
                // Get phase, possibly animated
                let phase = settings.lineFactory.sineWave.phase;
                if (settings.lineFactory.sineWave.animated) {
                    phase += time * settings.lineFactory.sineWave.speed;
                }
                
                ctx.beginPath();
                ctx.moveTo(startX, y);
                
                for (let x = startX; x <= endX; x++) {
                    let waveY = y;
                    const progress = (x - startX) / (endX - startX);
                    const angle = progress * Math.PI * 2 * settings.lineFactory.sineWave.frequency + phase;
                    
                    if (settings.lineFactory.sineWave.type === 'sine') {
                        waveY = y + Math.sin(angle) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'cosine') {
                        waveY = y + Math.cos(angle) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'square') {
                        waveY = y + (Math.sin(angle) > 0 ? 1 : -1) * settings.lineFactory.sineWave.amplitude;
                    } else if (settings.lineFactory.sineWave.type === 'triangle') {
                        waveY = y + (Math.asin(Math.sin(angle)) * 2 / Math.PI) * settings.lineFactory.sineWave.amplitude;
                    }
                    
                    ctx.lineTo(x, waveY);
                }
                
                ctx.stroke();
            } else {
                ctx.setLineDash([]);
                
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();
            }
        }
    };

    // Create animation frame for sine wave animation
    useEffect(() => {
        let animationFrameId;
        
        const animate = () => {
            if (settings.lineFactory?.sineWave?.animated) {
                updateLinePreview();
                animationFrameId = requestAnimationFrame(animate);
            }
        };
        
        if (settings.lineFactory?.sineWave?.animated) {
            animationFrameId = requestAnimationFrame(animate);
        }
        
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [settings.lineFactory?.sineWave?.animated, settings.lineFactory?.sineWave?.speed]);
    
    // Update line preview when settings change
    useEffect(() => {
        if (settings.lineFactory && canvasRef.current) {
            updateLinePreview();
        }
    }, [
        settings.lineFactory?.style,
        settings.lineFactory?.taper?.type,
        settings.lineFactory?.taper?.startWidth,
        settings.lineFactory?.taper?.endWidth,
        settings.lineFactory?.glow?.intensity,
        settings.lineFactory?.glow?.color,
        settings.lineFactory?.outline?.enabled,
        settings.lineFactory?.outline?.color,
        settings.lineFactory?.outline?.width,
        settings.lineFactory?.dash?.pattern,
        settings.lineFactory?.dash?.offset,
        settings.lineFactory?.sineWave?.type,
        settings.lineFactory?.sineWave?.amplitude,
        settings.lineFactory?.sineWave?.frequency,
        settings.lineFactory?.sineWave?.phase,
        settings.lineFactory?.spiral,
        settings.lineFactory?.ribbon,
        settings.lineFactory?.double,
        settings.lineFactory?.complex,
        settings.lineFactory?.loopLine
    ]);
    
    return (
        <div style={{ 
            width: '100%', 
            height: '80px', 
            backgroundColor: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '4px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <canvas 
                ref={canvasRef}
                width="300" 
                height="80"
                style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            />
        </div>
    );
};

export default LinePreview;