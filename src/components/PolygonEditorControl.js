import React, { useState, useEffect } from 'react';

/**
 * PolygonEditorControl - A component for editing polygon vertices with linked endpoints
 * This control ensures that the first and last points of a polygon are always linked
 */
const PolygonEditorControl = ({ settings, setSettings }) => {
    // Local state to track custom vertex points
    const [customVertices, setCustomVertices] = useState([]);
    const [isCustomMode, setIsCustomMode] = useState(false);

    // Initialize from current settings when component loads
    useEffect(() => {
        // If we're using the regular polygon mode, vertices are calculated automatically
        // based on the number of sides (vertices) and radius
        if (!isCustomMode) {
            // Calculate vertices for display purposes only
            const sides = settings.shapes.primary.vertices || 3;
            const cx = 0;  // Center coordinates in our preview
            const cy = 0;
            const radius = 50; // Preview radius
            const rotation = (settings.shapes.primary.rotation * Math.PI) / 180;
            
            const calculatedVertices = [];
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides + rotation;
                calculatedVertices.push({
                    x: cx + radius * Math.cos(angle),
                    y: cy + radius * Math.sin(angle),
                });
            }
            setCustomVertices(calculatedVertices);
        }
    }, [settings.shapes.primary.vertices, settings.shapes.primary.rotation, isCustomMode]);

    // Toggle between regular polygon and custom vertex modes
    const toggleMode = () => {
        setIsCustomMode(!isCustomMode);
        
        // When switching to custom mode, start with the current polygon vertices
        if (!isCustomMode) {
            // Start with current vertices as the base
            const sides = settings.shapes.primary.vertices || 3;
            const cx = 0;  // Center coordinates
            const cy = 0;
            const radius = 50; // Preview radius
            const rotation = (settings.shapes.primary.rotation * Math.PI) / 180;
            
            const calculatedVertices = [];
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides + rotation;
                calculatedVertices.push({
                    x: cx + radius * Math.cos(angle),
                    y: cy + radius * Math.sin(angle),
                });
            }
            setCustomVertices(calculatedVertices);
            
            // Store the vertices in the application settings
            if (setSettings.setCustomVertices) {
                setSettings.setCustomVertices(calculatedVertices);
            }
        }
    };

    // Add a new vertex to the polygon
    const addVertex = () => {
        if (!isCustomMode) return;
        
        // If we have at least 2 vertices, add a new one between the last and first
        if (customVertices.length >= 2) {
            const lastVertex = customVertices[customVertices.length - 1];
            const firstVertex = customVertices[0];
            
            // Calculate midpoint between last and first vertices
            const newVertex = {
                x: (lastVertex.x + firstVertex.x) / 2,
                y: (lastVertex.y + firstVertex.y) / 2,
            };
            
            // Insert the new vertex before the closing point
            const updatedVertices = [...customVertices, newVertex];
            setCustomVertices(updatedVertices);
            
            // Update the application settings
            if (setSettings.setCustomVertices) {
                setSettings.setCustomVertices(updatedVertices);
            }
        }
    };

    // Remove the last vertex from the polygon
    const removeVertex = () => {
        if (!isCustomMode || customVertices.length <= 3) return;
        
        const updatedVertices = customVertices.slice(0, -1);
        setCustomVertices(updatedVertices);
        
        // Update the application settings
        if (setSettings.setCustomVertices) {
            setSettings.setCustomVertices(updatedVertices);
        }
    };

    // Render a SVG preview of the polygon
    const renderPreview = () => {
        if (customVertices.length < 3) return null;
        
        // Scale and center the preview
        const previewSize = 100;
        const scaleFactor = 0.8; // Ensure polygon fits in the preview
        
        // Create path string for the polygon
        let pathString = '';
        customVertices.forEach((vertex, index) => {
            // Scale vertex coordinates to fit the preview
            const x = previewSize/2 + vertex.x * scaleFactor;
            const y = previewSize/2 + vertex.y * scaleFactor;
            
            if (index === 0) {
                pathString += `M ${x} ${y} `;
            } else {
                pathString += `L ${x} ${y} `;
            }
        });
        // Close the path back to the first point
        pathString += 'Z';
        
        return (
            <svg width={previewSize} height={previewSize} style={{ margin: '10px auto', display: 'block' }}>
                <path 
                    d={pathString} 
                    fill="none" 
                    stroke="#00AAFF" 
                    strokeWidth="2" 
                />
                {/* Draw points at each vertex */}
                {customVertices.map((vertex, index) => (
                    <circle
                        key={index}
                        cx={previewSize/2 + vertex.x * scaleFactor}
                        cy={previewSize/2 + vertex.y * scaleFactor}
                        r={index === 0 ? 4 : 3} // Make first point larger
                        fill={index === 0 ? "#FFAA00" : "#00AAFF"}
                    />
                ))}
                {/* Highlight the link between first and last points */}
                {customVertices.length > 2 && (
                    <line 
                        x1={previewSize/2 + customVertices[0].x * scaleFactor}
                        y1={previewSize/2 + customVertices[0].y * scaleFactor}
                        x2={previewSize/2 + customVertices[customVertices.length-1].x * scaleFactor}
                        y2={previewSize/2 + customVertices[customVertices.length-1].y * scaleFactor}
                        stroke="#FFAA00"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                    />
                )}
            </svg>
        );
    };

    return (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label>
                    <input
                        type="checkbox"
                        checked={isCustomMode}
                        onChange={toggleMode}
                    />
                    Custom Polygon Vertices
                </label>
                <div>
                    <button 
                        onClick={addVertex} 
                        disabled={!isCustomMode}
                        style={{ 
                            marginRight: '5px',
                            background: isCustomMode ? '#00AAFF' : '#666',
                            color: '#fff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '3px'
                        }}
                    >
                        Add Vertex
                    </button>
                    <button 
                        onClick={removeVertex} 
                        disabled={!isCustomMode || customVertices.length <= 3}
                        style={{ 
                            background: isCustomMode && customVertices.length > 3 ? '#FF4444' : '#666',
                            color: '#fff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '3px'
                        }}
                    >
                        Remove Vertex
                    </button>
                </div>
            </div>
            
            {renderPreview()}
            
            <div style={{ fontSize: '0.8em', opacity: 0.7, textAlign: 'center', marginTop: '5px' }}>
                {isCustomMode 
                    ? 'Custom polygon mode ensures the first and last points are always connected' 
                    : 'Switch to custom mode to manually edit polygon vertices'}
            </div>
        </div>
    );
};

export default PolygonEditorControl;