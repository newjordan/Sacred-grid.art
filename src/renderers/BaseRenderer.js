// src/renderers/BaseRenderer.js
/**
 * BaseRenderer - Abstract base class for all rendering implementations
 * This serves as the interface that all specific renderers must implement
 */
class BaseRenderer {
    /**
     * Initialize the renderer
     * @param {HTMLElement} container - DOM element to attach the renderer to
     * @param {Object} options - Renderer-specific initialization options
     */
    constructor(container, options = {}) {
        if (this.constructor === BaseRenderer) {
            throw new Error("BaseRenderer is an abstract class and cannot be instantiated directly");
        }

        this.container = container;
        this.options = options;
        this.width = 0;
        this.height = 0;
        this.mousePosition = { x: 0, y: 0 };
        this._listeners = {};
    }

    /**
     * Set up the renderer, create necessary DOM elements
     * @returns {HTMLElement} The created rendering element (canvas, etc.)
     */
    initialize() {
        throw new Error("Method 'initialize()' must be implemented by derived classes");
    }

    /**
     * Resize the rendering surface
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Clear the rendering surface
     * @param {string} color - Background color
     */
    clear(color) {
        throw new Error("Method 'clear()' must be implemented by derived classes");
    }

    /**
     * Begin a new frame for rendering
     */
    beginFrame() {
        throw new Error("Method 'beginFrame()' must be implemented by derived classes");
    }

    /**
     * End the current rendering frame
     */
    endFrame() {
        throw new Error("Method 'endFrame()' must be implemented by derived classes");
    }

    /**
     * Draw a line between two points
     * @param {number} x1 - Start X coordinate
     * @param {number} y1 - Start Y coordinate
     * @param {number} x2 - End X coordinate
     * @param {number} y2 - End Y coordinate
     * @param {string} color - Line color
     * @param {number} lineWidth - Line width
     */
    drawLine(x1, y1, x2, y2, color, lineWidth) {
        throw new Error("Method 'drawLine()' must be implemented by derived classes");
    }

    /**
     * Draw a circle
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Circle radius
     * @param {string} fillColor - Fill color (optional)
     * @param {string} strokeColor - Stroke color (optional)
     * @param {number} lineWidth - Line width for stroke (optional)
     */
    drawCircle(x, y, radius, fillColor, strokeColor, lineWidth) {
        throw new Error("Method 'drawCircle()' must be implemented by derived classes");
    }

    /**
     * Draw a polygon
     * @param {Array} vertices - Array of {x, y} points
     * @param {string} fillColor - Fill color (optional)
     * @param {string} strokeColor - Stroke color (optional)
     * @param {number} lineWidth - Line width for stroke (optional)
     */
    drawPolygon(vertices, fillColor, strokeColor, lineWidth) {
        throw new Error("Method 'drawPolygon()' must be implemented by derived classes");
    }

    /**
     * Draw a custom shape using a drawing function
     * @param {Function} drawFunction - Function that will perform the actual drawing
     * @param {Object} params - Parameters for the drawing function
     */
    drawCustomShape(drawFunction, params) {
        throw new Error("Method 'drawCustomShape()' must be implemented by derived classes");
    }

    /**
     * Update mouse position
     * @param {number} x - Mouse X coordinate
     * @param {number} y - Mouse Y coordinate
     */
    updateMousePosition(x, y) {
        this.mousePosition = { x, y };
    }

    /**
     * Add event listeners to the rendering element
     * @param {string} eventType - Event type (e.g., 'mousemove')
     * @param {Function} callback - Event handler
     */
    addEventListener(eventType, callback) {
        if (!this._listeners[eventType]) {
            this._listeners[eventType] = [];
        }
        this._listeners[eventType].push(callback);
    }

    /**
     * Remove all event listeners and clean up resources
     */
    dispose() {
        this._listeners = {};
    }
}

export default BaseRenderer;
