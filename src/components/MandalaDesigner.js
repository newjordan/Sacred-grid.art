import React, { useState, useRef, useEffect, useCallback } from 'react';
import FieldSet from './controls/FieldSet';
import RangeSlider from './controls/RangeSlider';
import SelectDropdown from './controls/SelectDropdown';
import ToggleSwitch from './controls/ToggleSwitch';

const MandalaDesigner = ({ settings, setSettings, isVisible }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState([]);
    const [paths, setPaths] = useState([]);
    const [selectedTool, setSelectedTool] = useState('draw');
    const [showFullPreview, setShowFullPreview] = useState(true);
    
    // Mandala settings
    const symmetry = settings.shapes.primary.mandalaSymmetry || 8;
    const pieAngle = (2 * Math.PI) / symmetry;
    const canvasSize = 300;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = canvasSize * 0.4;

    // Initialize canvas
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        
        drawCanvas(ctx);
    }, [symmetry, paths, showFullPreview]);

    const drawCanvas = useCallback((ctx) => {
        // Clear canvas
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        
        // Set up styling
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        // Draw pie slice guide
        drawPieSliceGuide(ctx);
        
        // Draw paths
        if (showFullPreview) {
            drawFullMandalaPreview(ctx);
        } else {
            drawPieSliceOnly(ctx);
        }
        
        // Draw current path being drawn
        if (currentPath.length > 0) {
            drawPath(ctx, currentPath, '#00ff00', 2);
        }
    }, [symmetry, paths, currentPath, showFullPreview]);

    const drawPieSliceGuide = (ctx) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Draw pie slice boundary
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius, 0);
        ctx.arc(0, 0, radius, 0, pieAngle);
        ctx.lineTo(0, 0);
        ctx.stroke();
        
        // Draw center circle
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw radius guides
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 1; i <= 3; i++) {
            const r = (radius * i) / 4;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, pieAngle);
            ctx.stroke();
        }
        
        ctx.restore();
    };

    const drawPath = (ctx, path, color = '#0077ff', lineWidth = 2) => {
        if (path.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        
        // Draw smooth spline curve through points
        for (let i = 1; i < path.length; i++) {
            if (i === path.length - 1) {
                ctx.lineTo(path[i].x, path[i].y);
            } else {
                const cp1x = path[i].x;
                const cp1y = path[i].y;
                const cp2x = (path[i].x + path[i + 1].x) / 2;
                const cp2y = (path[i].y + path[i + 1].y) / 2;
                ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y);
            }
        }
        
        ctx.stroke();
        ctx.restore();
    };

    const drawPieSliceOnly = (ctx) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Clip to pie slice
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius, 0);
        ctx.arc(0, 0, radius, 0, pieAngle);
        ctx.closePath();
        ctx.clip();
        
        // Draw all paths in the pie slice
        paths.forEach(path => {
            drawPath(ctx, path.map(p => ({ x: p.x - centerX, y: p.y - centerY })), '#0077ff', 2);
        });
        
        ctx.restore();
    };

    const drawFullMandalaPreview = (ctx) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Draw all symmetry copies
        for (let i = 0; i < symmetry; i++) {
            ctx.save();
            ctx.rotate(i * pieAngle);
            
            // Clip to pie slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(radius, 0);
            ctx.arc(0, 0, radius, 0, pieAngle);
            ctx.closePath();
            ctx.clip();
            
            // Draw all paths
            paths.forEach(path => {
                drawPath(ctx, path.map(p => ({ x: p.x - centerX, y: p.y - centerY })), '#0077ff', 1.5);
            });
            
            ctx.restore();
        }
        
        ctx.restore();
    };

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const isPointInPieSlice = (x, y) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        return distance <= radius && angle >= 0 && angle <= pieAngle;
    };

    const handleMouseDown = (e) => {
        if (selectedTool !== 'draw') return;
        
        const pos = getMousePos(e);
        if (!isPointInPieSlice(pos.x, pos.y)) return;
        
        setIsDrawing(true);
        setCurrentPath([pos]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || selectedTool !== 'draw') return;
        
        const pos = getMousePos(e);
        if (!isPointInPieSlice(pos.x, pos.y)) return;
        
        setCurrentPath(prev => [...prev, pos]);
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        
        setIsDrawing(false);
        if (currentPath.length > 1) {
            setPaths(prev => [...prev, currentPath]);
        }
        setCurrentPath([]);
    };

    const clearPaths = () => {
        setPaths([]);
        setCurrentPath([]);
    };

    const undoLastPath = () => {
        setPaths(prev => prev.slice(0, -1));
    };

    if (!isVisible) return null;

    return (
        <div style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '20px',
            zIndex: 300,
            color: 'white',
            width: '350px'
        }}>
            <FieldSet legend="🎨 Mandala Designer">
                <div style={{ marginBottom: '15px' }}>
                    <canvas
                        ref={canvasRef}
                        style={{
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            cursor: selectedTool === 'draw' ? 'crosshair' : 'default',
                            width: '100%',
                            height: 'auto'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>
                
                <SelectDropdown
                    label="Tool"
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    options={[
                        { value: 'draw', label: '✏️ Draw' },
                        { value: 'erase', label: '🗑️ Erase' },
                        { value: 'select', label: '👆 Select' }
                    ]}
                />
                
                <ToggleSwitch
                    label="Show Full Preview"
                    value={showFullPreview}
                    onChange={setShowFullPreview}
                />
                
                <RangeSlider
                    label="Symmetry"
                    min={4}
                    max={16}
                    step={2}
                    value={symmetry}
                    onChange={(e) => {
                        if (setSettings.setPrimaryMandalaSymmetry) {
                            setSettings.setPrimaryMandalaSymmetry(parseInt(e.target.value));
                        }
                    }}
                />
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button
                        onClick={undoLastPath}
                        style={{
                            background: 'rgba(255, 165, 0, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 165, 0, 0.3)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            flex: 1
                        }}
                    >
                        ↶ Undo
                    </button>
                    <button
                        onClick={clearPaths}
                        style={{
                            background: 'rgba(255, 0, 0, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 0, 0, 0.3)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            flex: 1
                        }}
                    >
                        🗑️ Clear
                    </button>
                </div>
            </FieldSet>
        </div>
    );
};

export default MandalaDesigner;
