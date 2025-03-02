// src/renderers/RendererFactory.js
import Canvas2DRenderer from './Canvas2DRenderer';

/**
 * Available renderer types
 */
export const RendererType = {
    CANVAS_2D: 'canvas2d',
    // WebGL has been removed for this Canvas2D-only version
};

/**
 * Factory for creating renderer instances
 */
class RendererFactory {
    /**
     * Create a new renderer of the specified type
     * @param {string} type - Renderer type from RendererType enum
     * @param {HTMLElement} container - DOM element to attach the renderer to
     * @param {Object} options - Renderer-specific options
     * @returns {BaseRenderer} A renderer instance
     */
    static createRenderer(type, container, options = {}) {
        // Always return a Canvas2DRenderer in this version
        return new Canvas2DRenderer(container, options);
    }
}

export default RendererFactory;