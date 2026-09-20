// src/audioVisualizer/GridAudioConnector.test.js
import { computeHarmonicGlowIntensity } from './GridAudioConnector';

describe('computeHarmonicGlowIntensity', () => {
  it('stays within the slider-declared [0, 20] range for a single frame', () => {
    expect(computeHarmonicGlowIntensity(1, true, 1)).toBeLessThanOrEqual(20);
    expect(computeHarmonicGlowIntensity(1, true, 1)).toBeGreaterThanOrEqual(0);
    expect(computeHarmonicGlowIntensity(0, false, 1)).toBe(0);
  });

  it('does not accumulate across repeated frames of sustained treble energy', () => {
    // Regression test: the old implementation read its own previous output
    // back out of settings and added to it every frame, so it grew without
    // bound for as long as there was any treble energy at all.
    const responseIntensity = 0.5;
    const trebleAtt = 0.2;
    let previousIntensity;

    for (let frame = 0; frame < 600; frame++) { // 10s at 60fps
      const isBeat = frame % 30 === 0;
      const intensity = computeHarmonicGlowIntensity(trebleAtt, isBeat, responseIntensity);
      expect(intensity).toBeLessThanOrEqual(20);
      expect(intensity).toBeGreaterThanOrEqual(0);
      previousIntensity = intensity;
    }

    // With sustained input the value should settle, not keep climbing.
    expect(previousIntensity).toBeLessThanOrEqual(20);
  });

  it('is a pure function of the current inputs, independent of prior state', () => {
    const a = computeHarmonicGlowIntensity(0.3, false, 0.5);
    const b = computeHarmonicGlowIntensity(0.3, false, 0.5);
    expect(a).toBe(b);
  });
});
