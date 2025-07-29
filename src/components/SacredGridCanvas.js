import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import useSacredGridAnimation from '../hooks/useSacredGridAnimation';
import { RendererType } from '../renderers/RendererFactory';

const SacredGridCanvas = forwardRef(({
    settings,
    onExport,
    toggleControls,
    showControls,
    rendererType = RendererType.CANVAS_2D
}, ref) => {
    console.log('SacredGridCanvas rendering with settings:', settings);
    
    const containerRef = useRef(null);
    const rendererInstanceRef = useRef(null);

    // Check if container is properly created
    useEffect(() => {
        console.log('Container ref state:', {
            exists: !!containerRef.current,
            element: containerRef.current
        });
    }, [containerRef.current]);
    
    // Force explicit dimensions on component mount and window resize
    useEffect(() => {
        const updateDimensions = () => {
            // When the containerRef is available, force explicit pixel dimensions
            if (containerRef.current && containerRef.current.parentNode) {
                const parentWidth = containerRef.current.parentNode.clientWidth || window.innerWidth;
                const parentHeight = containerRef.current.parentNode.clientHeight || window.innerHeight;
                
                console.log('SacredGridCanvas updating container dimensions:', {
                    parentWidth,
                    parentHeight,
                    parentElement: containerRef.current.parentNode
                });
                
                // Set explicit dimensions in pixels instead of percentages
                containerRef.current.style.width = `${parentWidth}px`;
                containerRef.current.style.height = `${parentHeight}px`;
                
                // Force renderer resize if it exists
                if (rendererInstanceRef.current && 
                    rendererInstanceRef.current.renderer && 
                    typeof rendererInstanceRef.current.renderer._handleResize === 'function') {
                    console.log('Forcing renderer resize after dimension update');
                    rendererInstanceRef.current.renderer._handleResize();
                }
            }
        };
        
        // Run once on mount
        updateDimensions();
        
        // Add resize listener
        window.addEventListener('resize', updateDimensions);
        
        // Run again after a small delay to handle any race conditions with parent container sizing
        const resizeTimer = setTimeout(updateDimensions, 100);
        
        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(resizeTimer);
        };
    }, [containerRef, rendererInstanceRef]);

    // Use our custom hook to handle animation
    const { renderer } = useSacredGridAnimation(containerRef, settings, rendererType, rendererInstanceRef);

    // Expose the renderer to parent components via ref
    useImperativeHandle(ref, () => ({
        exportAsImage: () => {
            if (rendererInstanceRef.current) {
                return rendererInstanceRef.current.exportAsImage();
            }
            return null;
        },
        updateSettings: (newSettings) => {
            console.log('updateSettings called through ref with', newSettings);
            if (rendererInstanceRef.current) {
                rendererInstanceRef.current.updateSettings(newSettings);
            }
        }
    }));

    return (
        <div
            ref={containerRef}
            className="canvas-container"
            style={{
                position: 'absolute',
                width: '100%',  // Still set 100% initially but will be overridden with pixel values
                height: '100%', // Still set 100% initially but will be overridden with pixel values
                top: 0,
                left: 0,
                backgroundColor: settings.colors?.background || '#000000', // Safely access background color
                overflow: 'hidden', // Prevent scrollbars
                display: 'block' // Ensure it's displayed as a block
            }}
        >
            {onExport && (
                <button
                    onClick={onExport}
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.transform = 'translateY(0px)';
                    }}
                >
                    Export Background
                </button>
            )}
            {toggleControls && (
                <button
                    onClick={toggleControls}
                    style={{ position: 'absolute', zIndex: 10, top: 10, right: 10 }}
                >
                    {showControls !== undefined ? (showControls ? 'Hide Controls' : 'Show Controls') : 'Toggle Controls'}
                </button>
            )}
        </div>
    );
});

export default SacredGridCanvas;