// src/renderers/Canvas2DRenderer.test.js
import Canvas2DRenderer, { MAX_PIXEL_RATIO } from './Canvas2DRenderer';

describe('Canvas2DRenderer ctx.drawLine', () => {
  let container;
  let getContextSpy;

  // jsdom has no canvas implementation, so stand in a plain context object
  const makeFakeContext = () => ({
    save: jest.fn(),
    restore: jest.fn(),
    setTransform: jest.fn(),
    scale: jest.fn(),
  });

  const makeRenderer = () => {
    const renderer = new Canvas2DRenderer(container);
    renderer.initialize();
    return renderer;
  };

  beforeEach(() => {
    const parent = document.createElement('div');
    container = document.createElement('div');
    parent.appendChild(container);
    document.body.appendChild(parent);
    getContextSpy = jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => makeFakeContext());
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    document.body.innerHTML = '';
  });

  it('attaches drawLine to the context once, at initialize()', () => {
    const renderer = makeRenderer();
    expect(typeof renderer.ctx.drawLine).toBe('function');
  });

  it('delegates ctx.drawLine to the renderer drawLine with all arguments', () => {
    const renderer = makeRenderer();
    const spy = jest.spyOn(renderer, 'drawLine').mockImplementation(() => {});
    const lineSettings = { style: 'dashed' };

    renderer.ctx.drawLine(1, 2, 3, 4, '#fff', 2, lineSettings);

    expect(spy).toHaveBeenCalledWith(1, 2, 3, 4, '#fff', 2, lineSettings);
  });

  it('makes ctx.drawLine available to shape drawers inside drawCustomShape()', () => {
    const renderer = makeRenderer();
    const params = { cx: 10, cy: 20 };
    let seenDrawLine;
    const drawFunction = jest.fn((ctx) => {
      seenDrawLine = ctx.drawLine;
    });

    renderer.drawCustomShape(drawFunction, params);

    expect(drawFunction).toHaveBeenCalledWith(renderer.ctx, params);
    expect(typeof seenDrawLine).toBe('function');
  });

  it('keeps the same ctx.drawLine across drawCustomShape() calls instead of re-adding/deleting it', () => {
    const renderer = makeRenderer();
    const original = renderer.ctx.drawLine;

    for (let i = 0; i < 100; i++) {
      renderer.drawCustomShape(() => {}, {});
    }

    expect(Object.prototype.hasOwnProperty.call(renderer.ctx, 'drawLine')).toBe(true);
    expect(renderer.ctx.drawLine).toBe(original);
  });

  it('ignores a non-function drawFunction without touching ctx.drawLine', () => {
    const renderer = makeRenderer();
    const original = renderer.ctx.drawLine;

    expect(() => renderer.drawCustomShape(null, {})).not.toThrow();
    expect(renderer.ctx.drawLine).toBe(original);
  });

  it('still initializes when getContext() returns null', () => {
    getContextSpy.mockImplementation(() => null);
    const renderer = new Canvas2DRenderer(container);

    expect(() => renderer.initialize()).not.toThrow();
    expect(renderer.ctx).toBeNull();
  });
});

describe('Canvas2DRenderer pixel ratio', () => {
  let container;
  let getContextSpy;
  let ctx;
  const originalDpr = window.devicePixelRatio;

  beforeEach(() => {
    const parent = document.createElement('div');
    container = document.createElement('div');
    parent.appendChild(container);
    document.body.appendChild(parent);
    // jsdom has no layout, so give the container a fixed size
    container.getBoundingClientRect = () => ({ width: 400, height: 300 });
    getContextSpy = jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => {
        ctx = { save: jest.fn(), restore: jest.fn(), setTransform: jest.fn(), scale: jest.fn() };
        return ctx;
      });
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    Object.defineProperty(window, 'devicePixelRatio', { value: originalDpr, configurable: true });
    document.body.innerHTML = '';
  });

  const initAt = (dpr) => {
    Object.defineProperty(window, 'devicePixelRatio', { value: dpr, configurable: true });
    const renderer = new Canvas2DRenderer(container);
    renderer.initialize();
    return renderer;
  };

  it.each([1, 1.5, 2])('uses the device pixel ratio as-is at DPR %p', (dpr) => {
    const renderer = initAt(dpr);
    expect(renderer.canvas.width).toBe(Math.floor(400 * dpr));
    expect(renderer.canvas.height).toBe(Math.floor(300 * dpr));
    expect(ctx.scale).toHaveBeenLastCalledWith(dpr, dpr);
  });

  it.each([2.625, 3, 4])('caps the backing store at MAX_PIXEL_RATIO on DPR %p', (dpr) => {
    const renderer = initAt(dpr);
    expect(renderer.canvas.width).toBe(400 * MAX_PIXEL_RATIO);
    expect(renderer.canvas.height).toBe(300 * MAX_PIXEL_RATIO);
    expect(ctx.scale).toHaveBeenLastCalledWith(MAX_PIXEL_RATIO, MAX_PIXEL_RATIO);
  });

  it('keeps the logical size and CSS size at the layout size', () => {
    const renderer = initAt(3);
    expect(renderer.width).toBe(400);
    expect(renderer.height).toBe(300);
    expect(renderer.canvas.style.width).toBe('400px');
    expect(renderer.canvas.style.height).toBe('300px');
  });
});
