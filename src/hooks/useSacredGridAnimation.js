// src/hooks/useSacredGridAnimation.js
import { useEffect, useRef } from 'react';
import SacredGridRenderer from '../renderers/SacredGridRenderer';
import { RendererType } from '../renderers/RendererFactory';

/**
 * Custom hook for handling Sacred Grid animation
 * @param {React.RefObject} containerRef - Reference to the container element
 * @param {Object} settings - Sacred Grid visualization settings
 * @param {string} rendererType - Type of renderer to use (from RendererType enum)
 * @param {React.RefObject} rendererInstanceRef - Reference to store the renderer instance
 * @returns {Object} - Object containing animation controls and state
 */
const useSacredGridAnimation = (containerRef, settings, rendererType = RendererType.CANVAS_2D, rendererInstanceRef = null) => {
    // Keep a local ref to the renderer if an external one is not provided
    const localRendererRef = useRef(null);
    const rendererRef = rendererInstanceRef || localRendererRef;

    // Initialize and clean up the renderer
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        // Clean up previous renderer if it exists to avoid duplicate renderers
        if (rendererRef.current) {
            rendererRef.current.dispose();
            rendererRef.current = null;
        }

        // Create a new SacredGridRenderer
        const renderer = new SacredGridRenderer(
            containerRef.current,
            settings,
            rendererType
        );

        // Initialize the renderer
        try {
            renderer.initialize();

            // Force multiple redraws after initialization to ensure canvas is visible
            // First immediate draw attempt
            renderer.drawFrame();
            
            // Then queue a series of delayed draws to handle possible race conditions
            const redrawAttempts = [50, 100, 500];
            redrawAttempts.forEach(delay => {
                window.setTimeout(() => {
                    if (renderer && renderer.renderer) {
                        // Force resize before drawing to ensure dimensions are correct
                        if (typeof renderer.renderer._handleResize === 'function') {
                            renderer.renderer._handleResize();
                        }
                        renderer.drawFrame();
                    }
                }, delay);
            });
        } catch (error) {
            // Initialization failed
        }

        // Save the renderer reference
        rendererRef.current = renderer;

        // Clean up function
        return () => {
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current = null;
            }
        };
    }, [containerRef, rendererType]);

    // Update settings when they change
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.updateSettings(settings);
        }
    }, [settings]);

    // Return controls and state
    return {
        renderer: rendererRef.current,
        // Add functions to control the renderer if needed
        pause: () => {
            if (rendererRef.current) {
                rendererRef.current.stopAnimation();
            }
        },
        resume: () => {
            if (rendererRef.current) {
                rendererRef.current.startAnimation();
            }
        },
        // Return the renderer type for informational purposes
        rendererType
    };
};

export default useSacredGridAnimation;