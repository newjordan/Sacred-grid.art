import React, { useState, useRef, useEffect, useCallback } from 'react';
import FieldSet from './controls/FieldSet';
import RangeSlider from './controls/RangeSlider';
import SelectDropdown from './controls/SelectDropdown';
import ToggleSwitch from './controls/ToggleSwitch';

const MandalaDesigner = ({ settings, setSettings, isVisible }) => {
    const canvasRef = useRef(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [paths, setPaths] = useState([]);
    const [selectedTool, setSelectedTool] = useState('pen');
    const [showFullPreview, setShowFullPreview] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [selectedHandle, setSelectedHandle] = useState(null);
    const [useLineFactory, setUseLineFactory] = useState(true);
    const [lineColor, setLineColor] = useState('#0077ff');
    const [lineWidth, setLineWidth] = useState(2);
    const [curveTension, setCurveTension] = useState(0.5);
    const [handleMode, setHandleMode] = useState('smooth'); // smooth, sharp, auto
    const [pathSmoothing, setPathSmoothing] = useState(0.3);
    const [showHandles, setShowHandles] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [gridSize, setGridSize] = useState(10);
    const [hoveredElement, setHoveredElement] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [drawingMode, setDrawingMode] = useState('draw'); // 'draw', 'edit', or 'freedraw'
    const [isPanning, setIsPanning] = useState(false);
    const [isFreedrawing, setIsFreedrawing] = useState(false);
    const [freedrawPath, setFreedrawPath] = useState([]);
    const [canvasReady, setCanvasReady] = useState(false);
    
    // Mandala settings
    const symmetry = settings.shapes.primary.mandalaSymmetry || 8;
    const pieAngle = (2 * Math.PI) / symmetry;
    const baseCanvasSize = 400; // Increased base size
    const canvasSize = baseCanvasSize;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = canvasSize * 0.4;

    // This will be handled after drawCanvas is defined

    // Force initial canvas draw on mount and when canvas ref becomes available
    useEffect(() => {
        const initializeCanvas = () => {
            if (!canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas size
            canvas.width = canvasSize;
            canvas.height = canvasSize;

            // Mark canvas as ready
            setCanvasReady(true);

            // Force initial draw with a simple background for now
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, 0, canvasSize, canvasSize);
        };

        // Try immediate initialization
        initializeCanvas();

        // Also try after a short delay in case ref isn't ready
        const timeoutId = setTimeout(initializeCanvas, 50);

        return () => clearTimeout(timeoutId);
    }, []); // No dependencies to avoid circular reference

    const drawCanvas = useCallback((ctx) => {
        if (!ctx) return;

        try {
            // Clear canvas
            ctx.clearRect(0, 0, canvasSize, canvasSize);

            // Apply zoom and pan transforms
            ctx.save();
            ctx.translate(canvasSize / 2, canvasSize / 2);
            ctx.scale(zoomLevel, zoomLevel);
            ctx.translate(-canvasSize / 2 + panOffset.x, -canvasSize / 2 + panOffset.y);

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
            drawPath(ctx, currentPath, lineColor, lineWidth);
            if (selectedTool === 'pen' && (drawingMode === 'edit' || showHandles)) {
                drawControlHandles(ctx, currentPath);
            }
        }

        // Draw freedraw path while drawing
        if (freedrawPath.length > 1) {
            drawFreedrawPath(ctx, freedrawPath, lineColor, lineWidth);
        }

            ctx.restore();
        } catch (error) {
            console.error('Error drawing canvas:', error);
            // Fallback: just draw a black background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, 0, canvasSize, canvasSize);
        }
    }, [symmetry, paths, currentPath, showFullPreview, selectedTool, lineColor, lineWidth, zoomLevel, panOffset, drawingMode, showHandles, freedrawPath]);

    // Main canvas update effect - now that drawCanvas is defined
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        drawCanvas(ctx);
    }, [drawCanvas, symmetry, paths, currentPath, showFullPreview, selectedTool, zoomLevel, panOffset, drawingMode, showHandles, freedrawPath, hoveredElement]);

    // Force immediate canvas refresh
    const forceCanvasRefresh = useCallback(() => {
        if (!canvasRef.current) return;
        requestAnimationFrame(() => {
            const ctx = canvasRef.current.getContext('2d');
            drawCanvas(ctx);
        });
    }, [drawCanvas]);

    // Trigger full draw once canvas is ready and drawCanvas is available
    useEffect(() => {
        if (canvasReady && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            drawCanvas(ctx);
        }
    }, [canvasReady, drawCanvas]);

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
        if (path.length < 1) return;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        if (path.length === 1) {
            // Draw a small circle for single point
            ctx.arc(path[0].x, path[0].y, lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw Bézier curves between points
            for (let i = 1; i < path.length; i++) {
                const prevPoint = path[i - 1];
                const currentPoint = path[i];

                if (prevPoint.handleOut && currentPoint.handleIn) {
                    // Use cubic Bézier curve with control handles
                    ctx.bezierCurveTo(
                        prevPoint.handleOut.x, prevPoint.handleOut.y,
                        currentPoint.handleIn.x, currentPoint.handleIn.y,
                        currentPoint.x, currentPoint.y
                    );
                } else if (prevPoint.handleOut) {
                    // Use quadratic curve with one control point
                    ctx.quadraticCurveTo(
                        prevPoint.handleOut.x, prevPoint.handleOut.y,
                        currentPoint.x, currentPoint.y
                    );
                } else {
                    // Straight line
                    ctx.lineTo(currentPoint.x, currentPoint.y);
                }
            }
            ctx.stroke();
        }

        ctx.restore();
    };

    const drawFreedrawPath = (ctx, path, color = '#0077ff', lineWidth = 2) => {
        if (path.length < 2) return;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.8; // Slightly transparent while drawing

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        // Draw smooth lines through all points
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }

        ctx.stroke();
        ctx.restore();
    };

    const drawControlHandles = (ctx, path) => {
        if (!path || path.length === 0 || !showHandles) return;

        ctx.save();

        path.forEach((point, index) => {
            // Draw anchor point with different styles based on type
            const isSelected = point.selected;
            const pointType = point.type || 'smooth';

            // Anchor point styling
            if (pointType === 'sharp') {
                ctx.fillStyle = isSelected ? '#ff0000' : '#ffff00'; // Yellow for sharp points
                ctx.beginPath();
                // Draw diamond shape for sharp points
                const size = isSelected ? 6 : 4;
                ctx.moveTo(point.x, point.y - size);
                ctx.lineTo(point.x + size, point.y);
                ctx.lineTo(point.x, point.y + size);
                ctx.lineTo(point.x - size, point.y);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = isSelected ? '#00ffff' : '#00ff00'; // Green for smooth points
                ctx.beginPath();
                ctx.arc(point.x, point.y, isSelected ? 6 : 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw control handles
            if (point.handleIn) {
                const isHovered = hoveredElement && hoveredElement.type === 'handleIn' && hoveredElement.index === index;

                // Handle line
                ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = isHovered ? 2 : 1.5;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(point.handleIn.x, point.handleIn.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Handle point - larger and more visible
                const handleSize = isHovered ? 6 : 5;
                ctx.fillStyle = isHovered ? '#ff8800' : '#ff6600';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(point.handleIn.x, point.handleIn.y, handleSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Add inner dot for better visibility
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(point.handleIn.x, point.handleIn.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            if (point.handleOut) {
                const isHovered = hoveredElement && hoveredElement.type === 'handleOut' && hoveredElement.index === index;

                // Handle line
                ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = isHovered ? 2 : 1.5;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(point.handleOut.x, point.handleOut.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Handle point - larger and more visible
                const handleSize = isHovered ? 6 : 5;
                ctx.fillStyle = isHovered ? '#ff8800' : '#ff6600';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(point.handleOut.x, point.handleOut.y, handleSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Add inner dot for better visibility
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(point.handleOut.x, point.handleOut.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw grid if enabled
        if (snapToGrid) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 0.5;

            for (let x = 0; x <= canvasSize; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasSize);
                ctx.stroke();
            }

            for (let y = 0; y <= canvasSize; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvasSize, y);
                ctx.stroke();
            }
        }

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
        paths.forEach(pathData => {
            const pathPoints = pathData.points || pathData; // Handle both old and new format
            const pathColor = pathData.color || '#0077ff';
            const pathWidth = pathData.width || 2;

            const translatedPath = pathPoints.map(p => ({
                x: p.x - centerX,
                y: p.y - centerY,
                handleIn: p.handleIn ? { x: p.handleIn.x - centerX, y: p.handleIn.y - centerY } : null,
                handleOut: p.handleOut ? { x: p.handleOut.x - centerX, y: p.handleOut.y - centerY } : null
            }));
            drawPath(ctx, translatedPath, pathColor, pathWidth);
            if (selectedTool === 'pen') {
                drawControlHandles(ctx, translatedPath);
            }
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
            paths.forEach(pathData => {
                const pathPoints = pathData.points || pathData; // Handle both old and new format
                const pathColor = pathData.color || '#0077ff';
                const pathWidth = (pathData.width || 2) * 0.75; // Slightly thinner in preview

                const translatedPath = pathPoints.map(p => ({
                    x: p.x - centerX,
                    y: p.y - centerY,
                    handleIn: p.handleIn ? { x: p.handleIn.x - centerX, y: p.handleIn.y - centerY } : null,
                    handleOut: p.handleOut ? { x: p.handleOut.x - centerX, y: p.handleOut.y - centerY } : null
                }));
                drawPath(ctx, translatedPath, pathColor, pathWidth);
            });
            
            ctx.restore();
        }
        
        ctx.restore();
    };

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;

        // Convert screen coordinates to canvas coordinates accounting for zoom and pan
        const canvasX = (rawX - rect.width / 2) / zoomLevel + canvasSize / 2 - panOffset.x;
        const canvasY = (rawY - rect.height / 2) / zoomLevel + canvasSize / 2 - panOffset.y;

        return {
            x: canvasX,
            y: canvasY,
            screenX: rawX,
            screenY: rawY
        };
    };

    const isPointInPieSlice = (x, y) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        return distance <= radius && angle >= 0 && angle <= pieAngle;
    };

    const findNearestPoint = (pos, path) => {
        let nearest = null;
        let minDistance = 15; // Increased threshold for easier selection

        // First check handles (higher priority for easier selection)
        path.forEach((point, index) => {
            // Check control handles first (they're smaller and harder to click)
            if (point.handleIn && showHandles) {
                const handleDistance = Math.sqrt((pos.x - point.handleIn.x) ** 2 + (pos.y - point.handleIn.y) ** 2);
                if (handleDistance < minDistance) {
                    nearest = { type: 'handleIn', index, point };
                    minDistance = handleDistance;
                }
            }

            if (point.handleOut && showHandles) {
                const handleDistance = Math.sqrt((pos.x - point.handleOut.x) ** 2 + (pos.y - point.handleOut.y) ** 2);
                if (handleDistance < minDistance) {
                    nearest = { type: 'handleOut', index, point };
                    minDistance = handleDistance;
                }
            }
        });

        // If no handle found, check anchor points
        if (!nearest) {
            path.forEach((point, index) => {
                const distance = Math.sqrt((pos.x - point.x) ** 2 + (pos.y - point.y) ** 2);
                if (distance < minDistance) {
                    nearest = { type: 'anchor', index, point };
                    minDistance = distance;
                }
            });
        }

        return nearest;
    };

    const handleMouseDown = (e) => {
        if (selectedTool !== 'pen') return;

        const pos = getMousePos(e);

        // Handle panning with middle mouse button (button 1)
        if (e.button === 1) {
            e.preventDefault(); // Prevent browser default middle-click behavior
            setIsPanning(true);
            setDragStartPos({ x: pos.screenX, y: pos.screenY });
            return;
        }

        if (!isPointInPieSlice(pos.x, pos.y)) return;

        // Check if clicking on existing point or handle
        const nearest = findNearestPoint(pos, currentPath);

        if (drawingMode === 'freedraw') {
            // Freedraw mode - start drawing a continuous path
            setIsFreedrawing(true);
            setFreedrawPath([{ x: pos.x, y: pos.y }]);
        } else if (drawingMode === 'edit' && nearest) {
            // Edit mode - only allow editing existing points/handles
            setSelectedPoint(nearest);
            setIsDragging(true);
            setDragStartPos(pos);
        } else if (drawingMode === 'draw' && !nearest) {
            // Draw mode - only allow creating new points
            const snappedPos = snapToGrid ? {
                x: Math.round(pos.x / gridSize) * gridSize,
                y: Math.round(pos.y / gridSize) * gridSize
            } : pos;

            const newPoint = {
                x: snappedPos.x,
                y: snappedPos.y,
                handleIn: null,
                handleOut: null,
                type: 'smooth',
                selected: true
            };

            setCurrentPath(prev => {
                const newPath = [...prev, newPoint];

                // Auto-generate smooth handles for the new point if we have previous points
                if (newPath.length >= 2) {
                    const updatedPath = generateSmartHandles(newPath);
                    return updatedPath;
                }

                return newPath;
            });

            // Start dragging to create initial curve
            setSelectedPoint({ type: 'newPoint', index: currentPath.length, point: newPoint });
            setIsDragging(true);
            setDragStartPos(pos);
        } else if (drawingMode === 'draw' && nearest) {
            // In draw mode but clicked on existing point - switch to edit mode temporarily
            setDrawingMode('edit');
            setSelectedPoint(nearest);
            setIsDragging(true);
            setDragStartPos(pos);
        }
    };

    const handleMouseMove = (e) => {
        if (selectedTool !== 'pen') return;

        const pos = getMousePos(e);

        // Handle panning
        if (isPanning && dragStartPos) {
            const deltaX = pos.screenX - dragStartPos.x;
            const deltaY = pos.screenY - dragStartPos.y;

            setPanOffset(prev => {
                const newOffset = {
                    x: prev.x + deltaX / zoomLevel,
                    y: prev.y + deltaY / zoomLevel
                };
                // Force immediate refresh after pan
                forceCanvasRefresh();
                return newOffset;
            });

            setDragStartPos({ x: pos.screenX, y: pos.screenY });
            return;
        }

        // Handle freedraw mode
        if (isFreedrawing && isPointInPieSlice(pos.x, pos.y)) {
            setFreedrawPath(prev => {
                const lastPoint = prev[prev.length - 1];
                const distance = Math.sqrt((pos.x - lastPoint.x) ** 2 + (pos.y - lastPoint.y) ** 2);

                // Only add point if it's far enough from the last one (smoothing)
                if (distance > 2) {
                    return [...prev, { x: pos.x, y: pos.y }];
                }
                return prev;
            });
            return;
        }

        if (!isDragging) return;
        if (!isPointInPieSlice(pos.x, pos.y)) return;

        if (selectedPoint) {
            const { type, index } = selectedPoint;

            setCurrentPath(prev => {
                const newPath = [...prev];

                if (type === 'anchor') {
                    // Move anchor point and regenerate handles
                    newPath[index] = {
                        ...newPath[index],
                        x: pos.x,
                        y: pos.y
                    };
                    // Regenerate smart handles for affected points
                    return generateSmartHandles(newPath);

                } else if (type === 'handleIn') {
                    // Move handle in - maintain symmetry for smooth points
                    const point = newPath[index];
                    const newHandleIn = { x: pos.x, y: pos.y };

                    newPath[index] = {
                        ...point,
                        handleIn: newHandleIn
                    };

                    // If smooth point, mirror the handle
                    if (point.type === 'smooth') {
                        const dx = point.x - pos.x;
                        const dy = point.y - pos.y;
                        newPath[index].handleOut = {
                            x: point.x + dx,
                            y: point.y + dy
                        };
                    }

                } else if (type === 'handleOut') {
                    // Move handle out - maintain symmetry for smooth points
                    const point = newPath[index];
                    const newHandleOut = { x: pos.x, y: pos.y };

                    newPath[index] = {
                        ...point,
                        handleOut: newHandleOut
                    };

                    // If smooth point, mirror the handle
                    if (point.type === 'smooth') {
                        const dx = point.x - pos.x;
                        const dy = point.y - pos.y;
                        newPath[index].handleIn = {
                            x: point.x + dx,
                            y: point.y + dy
                        };
                    }

                } else if (type === 'newPoint') {
                    // Creating initial curve by dragging from new point
                    const point = newPath[index];
                    const dx = pos.x - dragStartPos.x;
                    const dy = pos.y - dragStartPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 5) { // Only create handles if dragged far enough
                        const angle = Math.atan2(dy, dx);
                        const handleLength = distance * 0.5;

                        newPath[index] = {
                            ...point,
                            handleOut: {
                                x: point.x + Math.cos(angle) * handleLength,
                                y: point.y + Math.sin(angle) * handleLength
                            },
                            handleIn: {
                                x: point.x - Math.cos(angle) * handleLength,
                                y: point.y - Math.sin(angle) * handleLength
                            }
                        };
                    }
                }

                return newPath;
            });
        }
    };

    const handleMouseUp = () => {
        // Finish freedraw path
        if (isFreedrawing && freedrawPath.length > 1) {
            // Convert freedraw path to bezier path with smart handles
            const bezierPath = convertFreedrawToBezier(freedrawPath);
            setCurrentPath(bezierPath);
            setFreedrawPath([]);
        }

        setIsDragging(false);
        setIsPanning(false);
        setIsFreedrawing(false);
        setSelectedPoint(null);
        setDragStartPos(null);
    };

    const handleMouseHover = (e) => {
        if (isDragging || selectedTool !== 'pen') return;

        const pos = getMousePos(e);
        if (!isPointInPieSlice(pos.x, pos.y)) {
            setHoveredElement(null);
            return;
        }

        const nearest = findNearestPoint(pos, currentPath);
        setHoveredElement(nearest);
    };

    const clearPaths = () => {
        setPaths([]);
        setCurrentPath([]);
    };

    const undoLastPath = () => {
        setPaths(prev => prev.slice(0, -1));
    };

    const finishCurrentPath = () => {
        if (currentPath.length > 1) {
            const pathWithStyle = {
                points: currentPath,
                color: lineColor,
                width: lineWidth,
                useLineFactory: useLineFactory,
                id: Date.now() + Math.random() // Unique ID
            };
            setPaths(prev => [...prev, pathWithStyle]);
            setCurrentPath([]);

            // Update the main Sacred Grid settings with the new custom mandala data
            if (setSettings.setCustomMandalaData) {
                setSettings.setCustomMandalaData([...paths, pathWithStyle]);
            }
        }
    };

    const undoLastPoint = () => {
        setCurrentPath(prev => prev.slice(0, -1));
    };

    // Smart handle generation system
    const generateSmartHandles = (path) => {
        if (path.length < 2) return path;

        return path.map((point, index) => {
            if (point.type === 'sharp') return point;

            const prevPoint = index > 0 ? path[index - 1] : null;
            const nextPoint = index < path.length - 1 ? path[index + 1] : null;

            // Calculate smart handle positions
            let handleIn = null;
            let handleOut = null;

            if (prevPoint && nextPoint) {
                // Middle point - create smooth curve through all three points
                const dx = nextPoint.x - prevPoint.x;
                const dy = nextPoint.y - prevPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const handleLength = distance * curveTension * 0.25;

                const angle = Math.atan2(dy, dx);
                handleIn = {
                    x: point.x - Math.cos(angle) * handleLength,
                    y: point.y - Math.sin(angle) * handleLength
                };
                handleOut = {
                    x: point.x + Math.cos(angle) * handleLength,
                    y: point.y + Math.sin(angle) * handleLength
                };
            } else if (prevPoint) {
                // End point - create handle based on direction from previous
                const dx = point.x - prevPoint.x;
                const dy = point.y - prevPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const handleLength = distance * curveTension * 0.3;

                const angle = Math.atan2(dy, dx);
                handleIn = {
                    x: point.x - Math.cos(angle) * handleLength,
                    y: point.y - Math.sin(angle) * handleLength
                };
            } else if (nextPoint) {
                // Start point - create handle based on direction to next
                const dx = nextPoint.x - point.x;
                const dy = nextPoint.y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const handleLength = distance * curveTension * 0.3;

                const angle = Math.atan2(dy, dx);
                handleOut = {
                    x: point.x + Math.cos(angle) * handleLength,
                    y: point.y + Math.sin(angle) * handleLength
                };
            }

            return {
                ...point,
                handleIn,
                handleOut
            };
        });
    };

    const autoGenerateHandles = () => {
        if (currentPath.length < 2) return;

        setCurrentPath(prev => generateSmartHandles(prev));
    };

    const smoothPath = () => {
        if (currentPath.length < 3) return;

        setCurrentPath(prev => {
            const smoothed = [...prev];

            // Apply smoothing algorithm
            for (let i = 1; i < smoothed.length - 1; i++) {
                const prevPoint = smoothed[i - 1];
                const currentPoint = smoothed[i];
                const nextPoint = smoothed[i + 1];

                // Weighted average smoothing
                const weight = pathSmoothing;
                const newX = currentPoint.x * (1 - weight) +
                           (prevPoint.x + nextPoint.x) * 0.5 * weight;
                const newY = currentPoint.y * (1 - weight) +
                           (prevPoint.y + nextPoint.y) * 0.5 * weight;

                smoothed[i] = {
                    ...currentPoint,
                    x: newX,
                    y: newY
                };
            }

            return smoothed;
        });

        // Regenerate handles after smoothing
        setTimeout(autoGenerateHandles, 10);
    };

    const togglePointType = (pointIndex) => {
        setCurrentPath(prev => {
            const newPath = [...prev];
            const point = newPath[pointIndex];

            if (point.type === 'smooth') {
                // Convert to sharp - remove handles
                newPath[pointIndex] = {
                    ...point,
                    type: 'sharp',
                    handleIn: null,
                    handleOut: null
                };
            } else {
                // Convert to smooth - generate handles
                newPath[pointIndex] = {
                    ...point,
                    type: 'smooth'
                };
                return generateSmartHandles(newPath);
            }

            return newPath;
        });
    };

    const simplifyPath = () => {
        if (currentPath.length < 3) return;

        setCurrentPath(prev => {
            // Remove points that are too close together
            const simplified = [];
            const minDistance = 8; // Minimum distance between points

            simplified.push(prev[0]); // Always keep first point

            for (let i = 1; i < prev.length - 1; i++) {
                const prevPoint = simplified[simplified.length - 1];
                const currentPoint = prev[i];
                const distance = Math.sqrt(
                    (currentPoint.x - prevPoint.x) ** 2 +
                    (currentPoint.y - prevPoint.y) ** 2
                );

                if (distance >= minDistance) {
                    simplified.push(currentPoint);
                }
            }

            if (prev.length > 1) {
                simplified.push(prev[prev.length - 1]); // Always keep last point
            }

            return generateSmartHandles(simplified);
        });
    };

    const convertFreedrawToBezier = (freedrawPoints) => {
        if (freedrawPoints.length < 2) return [];

        // Simplify the freedraw path first
        const simplified = [];
        const tolerance = 5; // Minimum distance between points

        simplified.push(freedrawPoints[0]); // Always keep first point

        for (let i = 1; i < freedrawPoints.length - 1; i++) {
            const prevPoint = simplified[simplified.length - 1];
            const currentPoint = freedrawPoints[i];
            const distance = Math.sqrt(
                (currentPoint.x - prevPoint.x) ** 2 +
                (currentPoint.y - prevPoint.y) ** 2
            );

            if (distance >= tolerance) {
                simplified.push(currentPoint);
            }
        }

        if (freedrawPoints.length > 1) {
            simplified.push(freedrawPoints[freedrawPoints.length - 1]); // Always keep last point
        }

        // Convert to bezier points with handles
        const bezierPoints = simplified.map((point, index) => ({
            x: point.x,
            y: point.y,
            handleIn: null,
            handleOut: null,
            type: 'smooth',
            selected: false
        }));

        // Generate smart handles for the converted path
        return generateSmartHandles(bezierPoints);
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
            width: '350px',
            maxHeight: '90vh',
            overflowY: 'auto',
            overflowX: 'hidden'
        }}>
            <FieldSet legend="🎨 Mandala Designer">
                <div style={{ marginBottom: '15px' }}>
                    <canvas
                        ref={canvasRef}
                        style={{
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            cursor: selectedTool === 'pen' ?
                                (isPanning ? 'grabbing' :
                                 isFreedrawing ? 'crosshair' :
                                 drawingMode === 'freedraw' ? 'crosshair' :
                                 drawingMode === 'edit' && hoveredElement && (hoveredElement.type === 'handleIn' || hoveredElement.type === 'handleOut') ? 'move' :
                                 drawingMode === 'edit' && hoveredElement && hoveredElement.type === 'anchor' ? 'grab' :
                                 drawingMode === 'draw' ? 'crosshair' : 'default') : 'default',
                            width: '100%',
                            height: 'auto'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={(e) => {
                            handleMouseMove(e);
                            handleMouseHover(e);
                        }}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={(e) => {
                            handleMouseUp();
                            setHoveredElement(null);
                        }}
                        onWheel={(e) => {
                            e.preventDefault();

                            // More precise zoom with different speeds
                            const zoomSpeed = e.ctrlKey ? 0.05 : 0.1; // Slower zoom with Ctrl held
                            const zoomFactor = e.deltaY > 0 ? (1 - zoomSpeed) : (1 + zoomSpeed);

                            setZoomLevel(prev => {
                                const newZoom = Math.max(0.25, Math.min(8, prev * zoomFactor));
                                // Force immediate refresh after zoom
                                forceCanvasRefresh();
                                return newZoom;
                            });
                        }}
                        onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
                    />
                </div>

                {/* Zoom and Mode Controls */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '15px',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '8px',
                    borderRadius: '8px'
                }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <button
                            onClick={() => {
                                setZoomLevel(prev => Math.max(0.25, prev * 0.8));
                                forceCanvasRefresh();
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            🔍-
                        </button>
                        <span style={{ fontSize: '11px', minWidth: '50px', textAlign: 'center' }}>
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                            onClick={() => {
                                setZoomLevel(prev => Math.min(8, prev * 1.25));
                                forceCanvasRefresh();
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            🔍+
                        </button>
                        <button
                            onClick={() => {
                                setZoomLevel(1);
                                setPanOffset({ x: 0, y: 0 });
                                forceCanvasRefresh();
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            🎯
                        </button>
                    </div>

                    <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.2)' }}></div>

                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setDrawingMode('draw')}
                            style={{
                                background: drawingMode === 'draw' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                border: `1px solid ${drawingMode === 'draw' ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                                color: 'white',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                flex: '1 1 30%'
                            }}
                        >
                            ✏️ Draw
                        </button>
                        <button
                            onClick={() => setDrawingMode('freedraw')}
                            style={{
                                background: drawingMode === 'freedraw' ? 'rgba(0, 150, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                border: `1px solid ${drawingMode === 'freedraw' ? 'rgba(0, 150, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                                color: 'white',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                flex: '1 1 30%'
                            }}
                        >
                            🖌️ Free
                        </button>
                        <button
                            onClick={() => setDrawingMode('edit')}
                            style={{
                                background: drawingMode === 'edit' ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                border: `1px solid ${drawingMode === 'edit' ? 'rgba(255, 165, 0, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                                color: 'white',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                flex: '1 1 30%'
                            }}
                        >
                            🎯 Edit
                        </button>
                    </div>
                </div>

                {/* Navigation Hint */}
                <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textAlign: 'center',
                    marginBottom: '10px',
                    fontStyle: 'italic'
                }}>
                    🖱️ Middle mouse: drag to pan, wheel to zoom
                </div>
                
                <SelectDropdown
                    label="Tool"
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    options={[
                        { value: 'pen', label: '🖊️ Pen Tool (Bézier)' },
                        { value: 'select', label: '👆 Select' },
                        { value: 'erase', label: '🗑️ Erase' }
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

                <div style={{ marginTop: '15px', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                        🎨 Line Style
                    </strong>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', minWidth: '40px' }}>Color:</label>
                    <input
                        type="color"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        style={{
                            width: '40px',
                            height: '25px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '4px',
                            background: 'transparent',
                            cursor: 'pointer'
                        }}
                    />
                    <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: lineColor,
                        borderRadius: '50%',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}></div>
                </div>

                <RangeSlider
                    label="Line Width"
                    min={1}
                    max={8}
                    step={0.5}
                    value={lineWidth}
                    onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                />

                <ToggleSwitch
                    label="Use Line Factory Effects"
                    value={useLineFactory}
                    onChange={setUseLineFactory}
                />

                <div style={{ marginTop: '15px', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                        🎯 Curve Controls
                    </strong>
                </div>

                <SelectDropdown
                    label="Handle Mode"
                    value={handleMode}
                    onChange={(e) => setHandleMode(e.target.value)}
                    options={[
                        { value: 'smooth', label: '🟢 Smooth (Curved)' },
                        { value: 'sharp', label: '🔶 Sharp (Corner)' },
                        { value: 'auto', label: '🤖 Auto (Smart)' }
                    ]}
                />

                <RangeSlider
                    label="Curve Tension"
                    min={0}
                    max={1}
                    step={0.1}
                    value={curveTension}
                    onChange={(e) => setCurveTension(parseFloat(e.target.value))}
                />

                <RangeSlider
                    label="Path Smoothing"
                    min={0}
                    max={0.8}
                    step={0.1}
                    value={pathSmoothing}
                    onChange={(e) => setPathSmoothing(parseFloat(e.target.value))}
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <ToggleSwitch
                        label="Show Handles"
                        value={showHandles}
                        onChange={setShowHandles}
                    />
                    <ToggleSwitch
                        label="Snap to Grid"
                        value={snapToGrid}
                        onChange={setSnapToGrid}
                    />
                </div>

                {snapToGrid && (
                    <RangeSlider
                        label="Grid Size"
                        min={5}
                        max={20}
                        step={5}
                        value={gridSize}
                        onChange={(e) => setGridSize(parseInt(e.target.value))}
                    />
                )}
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' }}>
                    <button
                        onClick={finishCurrentPath}
                        disabled={currentPath.length < 2}
                        style={{
                            background: 'rgba(0, 255, 0, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0, 255, 0, 0.3)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: currentPath.length < 2 ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            opacity: currentPath.length < 2 ? 0.5 : 1,
                            flex: '1 1 45%'
                        }}
                    >
                        ✓ Finish Path
                    </button>
                    <button
                        onClick={undoLastPoint}
                        disabled={currentPath.length === 0}
                        style={{
                            background: 'rgba(255, 165, 0, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 165, 0, 0.3)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: currentPath.length === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            opacity: currentPath.length === 0 ? 0.5 : 1,
                            flex: '1 1 45%'
                        }}
                    >
                        ↶ Undo Point
                    </button>
                    <button
                        onClick={undoLastPath}
                        style={{
                            background: 'rgba(255, 165, 0, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 165, 0, 0.3)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            flex: '1 1 45%'
                        }}
                    >
                        ↶ Undo Path
                    </button>
                    <button
                        onClick={clearPaths}
                        style={{
                            background: 'rgba(255, 0, 0, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 0, 0, 0.3)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            flex: '1 1 45%'
                        }}
                    >
                        🗑️ Clear All
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={autoGenerateHandles}
                        disabled={currentPath.length < 2}
                        style={{
                            background: 'rgba(0, 150, 255, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0, 150, 255, 0.3)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: currentPath.length < 2 ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            opacity: currentPath.length < 2 ? 0.5 : 1,
                            flex: '1 1 45%'
                        }}
                    >
                        🤖 Auto Handles
                    </button>
                    <button
                        onClick={smoothPath}
                        disabled={currentPath.length < 3}
                        style={{
                            background: 'rgba(150, 0, 255, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(150, 0, 255, 0.3)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: currentPath.length < 3 ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            opacity: currentPath.length < 3 ? 0.5 : 1,
                            flex: '1 1 45%'
                        }}
                    >
                        ✨ Smooth Path
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={simplifyPath}
                        disabled={currentPath.length < 3}
                        style={{
                            background: 'rgba(255, 150, 0, 0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 150, 0, 0.3)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: currentPath.length < 3 ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            opacity: currentPath.length < 3 ? 0.5 : 1,
                            flex: '1 1 100%'
                        }}
                    >
                        🎯 Simplify Path (Remove Close Points)
                    </button>
                </div>

                {selectedTool === 'pen' && (
                    <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        lineHeight: '1.4'
                    }}>
                        <strong>🖊️ Drawing Modes + Navigation:</strong><br/>
                        • <strong>✏️ Draw:</strong> Click to add bezier points<br/>
                        • <strong>🖌️ Free:</strong> Drag to draw freehand (auto-converts)<br/>
                        • <strong>🎯 Edit:</strong> Drag handles & points<br/>
                        • <strong>🖱️ Middle drag:</strong> Pan canvas<br/>
                        • <strong>🖱️ Wheel:</strong> Zoom (25%-800%)<br/>
                        • <strong>Ctrl+wheel:</strong> Precise zoom<br/>
                        • <strong>🟠 Handles:</strong> Control curve shape<br/>
                        • <strong>🎯 Reset:</strong> Center view, 100% zoom
                    </div>
                )}
            </FieldSet>
        </div>
    );
};

export default MandalaDesigner;
