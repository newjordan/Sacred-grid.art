// src/renderers/Canvas2DRenderer.test.js
import Canvas2DRenderer from './Canvas2DRenderer';

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
