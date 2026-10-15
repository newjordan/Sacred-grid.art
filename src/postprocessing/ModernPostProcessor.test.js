// src/postprocessing/ModernPostProcessor.test.js
import { ModernPostProcessor, PostProcessingConfig } from './ModernPostProcessor';
import SacredGridRenderer from '../renderers/SacredGridRenderer';

describe('ModernPostProcessor WebGL lifecycle', () => {
  let getContextSpy;
  let glContexts;

  // jsdom has no WebGL, so stand in a GL context that tracks live textures
  const makeFakeGL = () => {
    const gl = {
      liveTextures: new Set(),
      liveFramebuffers: new Set(),
      liveBuffers: new Set(),
      lost: false,
      ARRAY_BUFFER: 1,
      TEXTURE_2D: 2,
      FRAMEBUFFER: 3,
      createBuffer: () => { const b = {}; gl.liveBuffers.add(b); return b; },
      deleteBuffer: (b) => gl.liveBuffers.delete(b),
      createTexture: () => { const t = {}; gl.liveTextures.add(t); return t; },
      deleteTexture: (t) => gl.liveTextures.delete(t),
      createFramebuffer: () => { const f = {}; gl.liveFramebuffers.add(f); return f; },
      deleteFramebuffer: (f) => gl.liveFramebuffers.delete(f),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      bindTexture: jest.fn(),
      texImage2D: jest.fn(),
      texParameteri: jest.fn(),
      bindFramebuffer: jest.fn(),
      framebufferTexture2D: jest.fn(),
      getExtension: (name) =>
        name === 'WEBGL_lose_context' ? { loseContext: () => { gl.lost = true; } } : null,
    };
    return gl;
  };

  const enabledConfig = {
    enabled: true,
    bloom: { ...PostProcessingConfig.bloom, enabled: true },
  };

  const makeProcessor = (config) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 2400;
    return new ModernPostProcessor(canvas, config);
  };

  beforeEach(() => {
    glContexts = [];
    getContextSpy = jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation((type) => {
        if (type === '2d') return {};
        const gl = makeFakeGL();
        glContexts.push(gl);
        return gl;
      });
  });

  afterEach(() => {
    getContextSpy.mockRestore();
  });

  it('creates no WebGL context when constructed', () => {
    makeProcessor();
    expect(glContexts).toHaveLength(0);
  });

  it('creates no WebGL context while post-processing is disabled', () => {
    const processor = makeProcessor();
    for (let i = 0; i < 10; i++) processor.processFrame(i * 16);
    expect(glContexts).toHaveLength(0);
  });

  it('creates no WebGL context when resized before first use', () => {
    const processor = makeProcessor();
    processor.resize(1080, 2200);
    processor.resize(1080, 2400);
    expect(glContexts).toHaveLength(0);
  });

  it('creates the WebGL context once, on the first enabled frame', () => {
    const processor = makeProcessor(enabledConfig);
    for (let i = 0; i < 10; i++) processor.processFrame(i * 16);
    expect(glContexts).toHaveLength(1);
    expect(glContexts[0].liveTextures.size).toBe(4);
  });

  it('skips WebGL entirely when gpuAcceleration is off', () => {
    const processor = makeProcessor({
      ...enabledConfig,
      performance: { ...PostProcessingConfig.performance, gpuAcceleration: false },
    });
    processor.processFrame(0);
    expect(glContexts).toHaveLength(0);
  });

  it('still applies the CSS filter fallback when enabled', () => {
    const processor = makeProcessor(enabledConfig);
    processor.processFrame(0);
    expect(processor.canvas.style.filter).toContain('blur(');
  });

  it('does not leak WebGL resources across resizes', () => {
    const processor = makeProcessor(enabledConfig);
    processor.processFrame(0);
    const gl = glContexts[0];

    for (let i = 0; i < 10; i++) processor.resize(1080, i % 2 ? 2400 : 2200);

    expect(gl.liveTextures.size).toBe(4);
    expect(gl.liveFramebuffers.size).toBe(4);
    expect(gl.liveBuffers.size).toBe(1);
  });

  it('dispose() frees all resources and the context', () => {
    const processor = makeProcessor(enabledConfig);
    processor.processFrame(0);
    const gl = glContexts[0];

    processor.dispose();
    expect(gl.liveTextures.size).toBe(0);
    expect(gl.liveFramebuffers.size).toBe(0);
    expect(gl.liveBuffers.size).toBe(0);
    expect(gl.lost).toBe(true);

    // A stray frame after dispose must not throw or recreate WebGL
    expect(() => processor.processFrame(16)).not.toThrow();
    expect(glContexts).toHaveLength(1);
  });

  it('SacredGridRenderer.dispose() disposes its post-processor', () => {
    const postProcessor = { dispose: jest.fn() };
    const renderer = Object.create(SacredGridRenderer.prototype);
    Object.assign(renderer, { postProcessor, renderer: null, animationFrame: null });

    renderer.dispose();

    expect(postProcessor.dispose).toHaveBeenCalledTimes(1);
    expect(renderer.postProcessor).toBeNull();
  });
});
