// src/audioVisualizer/F181HarmonicAddressing.js
//
// F181 Harmonic Address System — finite-field-indexed audio→visual mapping.
//
// Math (per the F181 panel):
//   181 = 1 + 15 · 12 (prime), so F181 = Z/181Z is a field.
//   Address map A: R → F181, n = 1 + 12·(o − 1) + p, with o ∈ {1..15},
//   p ∈ {0..11}; address 0 is the silent source.
//   F181× has order 180 = 18 · 10. ζ10 = 2^18 mod 181 = 56 generates an
//   order-10 subgroup. Multiplication by ζ10 partitions F181× into 18
//   orbits of 10 addresses each (the "decagon orbits").
//   Frequency law: f(o,p) = 261.63 · 2^(o − 1 + p/12).
//   Chromatic hue: degree(p) = 30·p.

export const FIELD_MODULUS = 181;
export const FIELD_GENERATOR = 2;
export const DECAGON_ELEMENT = 56;        // 2^18 mod 181 = ζ10
export const DECAGON_ORDER = 10;
export const ORBIT_COUNT = 18;            // 180 / 10
export const OCTAVE_LAYERS = 15;
export const PITCH_CLASSES = 12;
export const TOTAL_ADDRESSES = 1 + OCTAVE_LAYERS * PITCH_CLASSES; // 181
export const REFERENCE_HZ = 261.63;       // C4, anchors o=1 p=0

// === address ↔ (octave, pitch) ===

export function addressFromOctavePitch(octave, pitchClass) {
  return 1 + 12 * (octave - 1) + pitchClass;
}

export function octavePitchFromAddress(n) {
  if (n === 0) return { octave: 0, pitchClass: 0, isSource: true };
  const k = n - 1;
  return {
    octave: Math.floor(k / 12) + 1,
    pitchClass: k % 12,
    isSource: false,
  };
}

// === modular exponentiation ===

export function powMod(base, exp, modulus) {
  let result = 1;
  let b = base % modulus;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1;
  }
  return result;
}

// === field-lifted operations on addresses ===

export function liftAdd(x, y) {
  return (x + y) % FIELD_MODULUS;
}

export function liftMul(x, y) {
  return (x * y) % FIELD_MODULUS;
}

// === decagon orbit table (computed, not hardcoded) ===
// Each nonzero address belongs to exactly one orbit of size 10 under
// x ↦ x · ζ10 (mod 181). 18 orbits × 10 elements partition F181×.

function buildOrbitTable() {
  const orbits = [];
  const addressToOrbitIdx = new Int8Array(FIELD_MODULUS);
  addressToOrbitIdx.fill(-1);
  for (let a = 1; a < FIELD_MODULUS; a++) {
    if (addressToOrbitIdx[a] !== -1) continue;
    const orbit = new Array(DECAGON_ORDER);
    let cur = a;
    for (let i = 0; i < DECAGON_ORDER; i++) {
      orbit[i] = cur;
      cur = (cur * DECAGON_ELEMENT) % FIELD_MODULUS;
    }
    const idx = orbits.length;
    for (const m of orbit) addressToOrbitIdx[m] = idx;
    orbits.push(orbit);
  }
  return { orbits, addressToOrbitIdx };
}

const _orbitData = buildOrbitTable();
export const ORBITS = _orbitData.orbits;                  // 18 × 10 addresses
export const ORBIT_INDEX = _orbitData.addressToOrbitIdx;  // address → orbit idx
export const CANONICAL_DECAGON = ORBITS[ORBIT_INDEX[1]];  // orbit containing 1

// === FFT → address ===

// Inverse of f(o,p). Returns nonzero address ∈ {1..180}.
// Octave is clamped to [1..15]; pitch class wraps mod 12.
export function addressFromFrequency(freqHz) {
  if (!isFinite(freqHz) || freqHz <= 0) return 0;
  const semis = 12 * Math.log2(freqHz / REFERENCE_HZ);
  const pitchClass = ((Math.round(semis) % 12) + 12) % 12;
  const rawOctave = Math.floor(semis / 12) + 1;
  const octave = Math.max(1, Math.min(OCTAVE_LAYERS, rawOctave));
  return addressFromOctavePitch(octave, pitchClass);
}

// Distribute FFT magnitude into a length-181 energy array indexed by address.
// frequencyData: Uint8Array (Web Audio getByteFrequencyData output, 0..255).
export function extractAddressEnergy(frequencyData, sampleRate, fftSize, out) {
  const energy = out || new Float32Array(TOTAL_ADDRESSES);
  energy.fill(0);
  const binCount = frequencyData.length;
  const hzPerBin = sampleRate / fftSize;
  for (let i = 1; i < binCount; i++) {
    const v = frequencyData[i];
    if (v === 0) continue;
    const f = i * hzPerBin;
    const n = addressFromFrequency(f);
    if (n > 0) energy[n] += v / 255;
  }
  return energy;
}

// === orbit aggregation ===

export function aggregateOrbitEnergy(addressEnergy, out) {
  const orbitEnergy = out || new Float32Array(ORBIT_COUNT);
  orbitEnergy.fill(0);
  for (let a = 1; a < FIELD_MODULUS; a++) {
    const e = addressEnergy[a];
    if (e === 0) continue;
    orbitEnergy[ORBIT_INDEX[a]] += e;
  }
  return orbitEnergy;
}

export function topKOrbits(orbitEnergy, k = 3) {
  const indexed = [];
  for (let i = 0; i < orbitEnergy.length; i++) {
    indexed.push({ orbitIdx: i, energy: orbitEnergy[i] });
  }
  indexed.sort((a, b) => b.energy - a.energy);
  return indexed.slice(0, k);
}

// === chromatic / hue ===

export function pitchClassToHue(pitchClass) {
  return 30 * pitchClass;
}

export function addressToHue(n) {
  return pitchClassToHue(octavePitchFromAddress(n).pitchClass);
}

export function chromaticRatio(pitchClass) {
  return Math.pow(2, pitchClass / 12);
}

// === chronometric phase law ===
// θ_Δ(t) = ω_Δ · ln((t + t_c) / T_0) + β_Δ
// λ_Δ = 3722/2705. ω_Δ = 2π/ln(λ_Δ). β_Δ = arctan(√55414535 / 13309).

export const LAMBDA_DELTA = 3722 / 2705;
export const OMEGA_DELTA = (2 * Math.PI) / Math.log(LAMBDA_DELTA);
export const BETA_DELTA = Math.atan(Math.sqrt(55414535) / 13309);

export function chronoPhase(tSeconds, anchorOffset = 1, periodSeconds = 1) {
  const arg = (tSeconds + anchorOffset) / periodSeconds;
  if (arg <= 0) return BETA_DELTA;
  return OMEGA_DELTA * Math.log(arg) + BETA_DELTA;
}

// === HSL → hex (gradient palette helper) ===

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp < 1) { r1 = c; g1 = x; }
  else if (hp < 2) { r1 = x; g1 = c; }
  else if (hp < 3) { g1 = c; b1 = x; }
  else if (hp < 4) { g1 = x; b1 = c; }
  else if (hp < 5) { r1 = x; b1 = c; }
  else { r1 = c; b1 = x; }
  const m = l - c / 2;
  const toByte = (v) => {
    const n = Math.round((v + m) * 255);
    return Math.max(0, Math.min(255, n));
  };
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(toByte(r1))}${toHex(toByte(g1))}${toHex(toByte(b1))}`;
}

// Build a 4-stop gradient palette from the top decagon orbits.
// Each stop pulls a hue from a different orbit member, so the palette
// reflects the chromatic spread of the active F181 orbit set.
export function orbitsToGradientPalette(topOrbits, options = {}) {
  const {
    saturation = 0.85,
    baseLightness = 0.45,
    energyBoost = 0.25,
    stops = 4,
  } = options;
  if (!topOrbits || topOrbits.length === 0) {
    return Array(stops).fill('#222222');
  }
  const palette = new Array(stops);
  for (let i = 0; i < stops; i++) {
    const slot = topOrbits[i % topOrbits.length];
    const orbit = ORBITS[slot.orbitIdx];
    const member = orbit[i % DECAGON_ORDER];
    const hue = addressToHue(member);
    const lightness = Math.min(0.7, baseLightness + slot.energy * energyBoost);
    palette[i] = hslToHex(hue, saturation, lightness);
  }
  return palette;
}
