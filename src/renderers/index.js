// src/renderers/index.js
import BaseRenderer from './BaseRenderer';
import Canvas2DRenderer from './Canvas2DRenderer';
import RendererFactory, { RendererType } from './RendererFactory';
import SacredGridRenderer from './SacredGridRenderer';

// Export a unified API for renderers
export {
    BaseRenderer,
    Canvas2DRenderer,
    RendererFactory,
    RendererType,
    SacredGridRenderer
};

// Default export for convenience
export default RendererFactory;