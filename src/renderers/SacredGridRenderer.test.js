// src/renderers/SacredGridRenderer.test.js
import SacredGridRenderer from './SacredGridRenderer';

describe('SacredGridRenderer.noise', () => {
  const makeRenderer = (noiseIntensity = 1) =>
    new SacredGridRenderer(null, { grid: { noiseIntensity } });

  it('matches the direct sin/cos formula the cache used to memoize', () => {
    const noiseIntensity = 1;
    const renderer = makeRenderer(noiseIntensity);
    const x = 12.34, y = -5.6, t = 789.1;
    const expected = noiseIntensity * Math.sin(x * 0.3 + t * 0.002) * Math.cos(y * 0.3 - t * 0.003);
    expect(renderer.noise(x, y, t)).toBeCloseTo(expected, 10);
  });

  it('is deterministic for repeated calls with the same inputs', () => {
    const renderer = makeRenderer(1);
    const first = renderer.noise(3, 4, 100);
    const second = renderer.noise(3, 4, 100);
    expect(second).toBe(first);
  });

  it('scales linearly with grid.noiseIntensity', () => {
    const base = makeRenderer(1).noise(1, 2, 3);
    const doubled = makeRenderer(2).noise(1, 2, 3);
    expect(doubled).toBeCloseTo(base * 2, 10);
  });

  it('stays within the expected [-intensity, intensity] range across many inputs', () => {
    const renderer = makeRenderer(1);
    for (let t = 0; t < 5000; t += 16.6667) {
      const value = renderer.noise(t * 0.37, t * 0.19, t);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});
