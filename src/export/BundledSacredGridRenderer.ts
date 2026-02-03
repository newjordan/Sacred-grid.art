/**
 * BundledSacredGridRenderer.ts
 *
 * Exports a function that returns a standalone, self-contained version of the
 * SacredGridRenderer as a JavaScript string. This can be embedded directly into
 * HTML files without any external dependencies.
 *
 * Assumptions:
 * - ShapeDrawers map is already defined in scope
 * - Canvas2DRenderer (or compatible renderer) is already defined in scope
 */

export function getBundledSacredGridRenderer(): string {
  return `
// ============================================================================
// STANDALONE SACRED GRID RENDERER
// A self-contained renderer for sacred geometry visualization
// ============================================================================

// Constants - Shape Types
const ShapeType = {
  POLYGON: 'polygon',
  FLOWER_OF_LIFE: 'flowerOfLife',
  MERKABA: 'merkaba',
  CIRCLE: 'circle',
  SPIRAL: 'spiral',
  STAR: 'star',
  LISSAJOUS: 'lissajous',
  HEXAGON: 'hexagon',
  PENTAGON: 'pentagon',
  METATRONS_CUBE: 'metatronsCube',
  TREE_OF_LIFE: 'treeOfLife',
  MANDALA: 'mandala',
  CUSTOM_MANDALA: 'customMandala'
};

// Constants - Animation Modes
const AnimationMode = {
  GROW: 'grow',
  PULSE: 'pulse',
  ORBIT: 'orbit',
  WAVEFORM: 'waveform',
  SPIRAL: 'spiral',
  HARMONIC: 'harmonic',
  SWARM: 'swarm',
  BREATHE: 'breathe'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutElastic(t) {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

function seededRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function parseHexColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return [r, g, b];
}

function applyEnhancedEasing(easingType, t) {
  t = Math.max(0, Math.min(1, t));
  switch (easingType) {
    case 'easeInOutCubic':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'easeInOutQuad':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case 'easeInOutSine':
      return -(Math.cos(Math.PI * t) - 1) / 2;
    case 'easeInOutExpo':
      if (t === 0) return 0;
      if (t === 1) return 1;
      return t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
    case 'linear':
    default:
      return t;
  }
}

function getMultiEasedColor(time, colors, alpha, cycleDuration, easingType) {
  const n = colors.length;
  let progress = (time % cycleDuration) / cycleDuration;
  const scaledProgress = progress * n;
  const index = Math.floor(scaledProgress);
  const nextIndex = (index + 1) % n;
  let t = scaledProgress - index;
  t = applyEnhancedEasing(easingType, t);
  const [r1, g1, b1] = parseHexColor(colors[index]);
  const [r2, g2, b2] = parseHexColor(colors[nextIndex]);
  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b = b1 + (b2 - b1) * t;
  return \`rgba(\${Math.round(r)}, \${Math.round(g)}, \${Math.round(b)}, \${alpha})\`;
}

function getShapeColor(alpha, colorScheme) {
  switch (colorScheme) {
    case 'red': return \`rgba(255,100,100,\${alpha})\`;
    case 'green': return \`rgba(100,255,100,\${alpha})\`;
    case 'purple': return \`rgba(200,100,255,\${alpha})\`;
    case 'grayscale': return \`rgba(220,220,220,\${alpha})\`;
    case 'blue':
    default: return \`rgba(200,220,255,\${alpha})\`;
  }
}

// ============================================================================
// ANIMATION PARAMETER CALCULATION
// ============================================================================

function calculateSymmetricFractalTiming(baseTime, fractalDepth, childIndex, totalChildren) {
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const tau = Math.PI * 2;
  const phaseOffset = (childIndex / totalChildren) * tau;
  const depthScale = Math.pow(goldenRatio, -fractalDepth);
  return baseTime + (phaseOffset * depthScale * 1000);
}

function calculateAnimationParams(time, shapeSettings, globalSettings, fractalDepth = 0, childIndex = 0, totalChildren = 1) {
  const animation = shapeSettings.animation || {};
  let adjustedTime = time;

  if (fractalDepth > 0 && totalChildren > 1) {
    adjustedTime = calculateSymmetricFractalTiming(time, fractalDepth, childIndex, totalChildren);
  }

  const uniqueId = (shapeSettings.type?.charCodeAt(0) || 0) +
                   (shapeSettings.vertices || 0) * 10 +
                   (shapeSettings.position?.offsetX || 0) * 0.1 +
                   (shapeSettings.position?.offsetY || 0) * 0.1;

  const baseLoopDuration = 6000;
  let loopDuration = baseLoopDuration;

  if (animation.variableTiming && fractalDepth === 0) {
    const durationVariation = (seededRandom(uniqueId) * 1000) - 500;
    loopDuration = baseLoopDuration + durationVariation;
  }

  const delay = (animation.staggerDelay && fractalDepth === 0) ? uniqueId % animation.staggerDelay : 0;
  adjustedTime = Math.max(0, adjustedTime - delay);
  const rawProgress = (adjustedTime % loopDuration) / loopDuration;
  const progress = animation.reverse ? 1 - rawProgress : rawProgress;

  let dynamicRadius = shapeSettings.size || 100;
  let finalOpacity = shapeSettings.opacity || 1;
  let offsetX = 0;
  let offsetY = 0;
  let rotationOffset = 0;

  const mode = animation.mode || AnimationMode.PULSE;
  const intensity = animation.intensity || 0.1;
  const speed = animation.speed || 0.001;

  if (mode === AnimationMode.GROW) {
    dynamicRadius = shapeSettings.size * progress;
    let fadeValue;
    if (progress < (animation.fadeIn || 0.1)) {
      fadeValue = progress / (animation.fadeIn || 0.1);
    } else if (progress > 1 - (animation.fadeOut || 0.1)) {
      fadeValue = (1 - progress) / (animation.fadeOut || 0.1);
    } else {
      fadeValue = 1;
    }
    finalOpacity = Math.max(0, Math.min(1, shapeSettings.opacity * fadeValue));
  } else if (mode === AnimationMode.PULSE) {
    const basePhase = progress * 2 * Math.PI;
    const breathingPhase = adjustedTime * speed;
    const secondaryPhase = adjustedTime * speed * 1.5;
    const breathingFactor = 1 +
      (Math.sin(breathingPhase) * intensity) +
      (Math.sin(secondaryPhase) * intensity * 0.3);
    const pulse = 0.5 + 0.5 * Math.sin(basePhase);
    dynamicRadius = shapeSettings.size * pulse * breathingFactor;
    const opacityPulse = 1 + (Math.sin(breathingPhase * 1.3) * 0.15);
    finalOpacity = Math.min(1, shapeSettings.opacity * opacityPulse);
  } else if (mode === AnimationMode.ORBIT) {
    const orbitPhase = adjustedTime * speed;
    dynamicRadius = shapeSettings.size * (0.8 + 0.2 * Math.sin(orbitPhase * 0.5));
    const orbitRadius = shapeSettings.size * 0.3 * intensity;
    offsetX = Math.cos(orbitPhase) * orbitRadius;
    offsetY = Math.sin(orbitPhase) * orbitRadius;
    rotationOffset = Math.sin(orbitPhase * 0.25) * 15;
  } else if (mode === AnimationMode.WAVEFORM) {
    const wavePhase = adjustedTime * speed;
    const wave1 = Math.sin(wavePhase);
    const wave2 = Math.sin(wavePhase * 2.5) * 0.3;
    const wave3 = Math.sin(wavePhase * 0.6) * 0.1;
    const waveform = wave1 + wave2 + wave3;
    const normalizedWave = (waveform / 1.4) * intensity;
    dynamicRadius = shapeSettings.size * (1 + normalizedWave);
    const opacityWave = 1 + (Math.sin(wavePhase * 1.7) * 0.1);
    finalOpacity = Math.min(1, shapeSettings.opacity * opacityWave);
    offsetX = Math.sin(wavePhase) * shapeSettings.size * 0.2 * intensity;
    offsetY = Math.cos(wavePhase * 0.7) * shapeSettings.size * 0.15 * intensity;
  } else if (mode === AnimationMode.SPIRAL) {
    const spiralPhase = adjustedTime * speed;
    dynamicRadius = shapeSettings.size * (0.9 + 0.1 * Math.sin(spiralPhase * 0.5));
    finalOpacity = shapeSettings.opacity * (0.8 + 0.2 * Math.sin(spiralPhase * 0.75));
    const angle = spiralPhase * 2;
    const spiralGrowth = (1 - Math.cos(spiralPhase * 0.5)) * 0.5;
    const spiralRadius = shapeSettings.size * 0.4 * spiralGrowth * intensity;
    offsetX = Math.cos(angle) * spiralRadius;
    offsetY = Math.sin(angle) * spiralRadius;
    rotationOffset = spiralPhase * 30;
  } else if (mode === AnimationMode.HARMONIC) {
    const harmonicPhase = adjustedTime * speed;
    const frequencyRatio = 1.5 + Math.sin(harmonicPhase * 0.1) * 0.5;
    const radiusWave =
      Math.sin(harmonicPhase) * 0.3 +
      Math.sin(harmonicPhase * 1.7) * 0.2 +
      Math.sin(harmonicPhase * 0.4) * 0.1;
    dynamicRadius = shapeSettings.size * (0.9 + radiusWave * intensity * 0.3);
    const opacityHarmonic = 0.85 + Math.sin(harmonicPhase * 1.3) * 0.15;
    finalOpacity = shapeSettings.opacity * opacityHarmonic;
    const a = 3;
    const b = frequencyRatio;
    const delta = harmonicPhase * 0.2;
    const patternScale = shapeSettings.size * 0.25 * intensity;
    offsetX = Math.sin(a * harmonicPhase + delta) * patternScale;
    offsetY = Math.sin(b * harmonicPhase) * patternScale;
    rotationOffset = Math.sin(harmonicPhase * 0.3) * 20;
  } else if (mode === AnimationMode.BREATHE) {
    const breathePhase = adjustedTime * speed;
    const breatheCycle = (Math.sin(breathePhase) + 1) / 2;
    const breatheEased = easeOutElastic(breatheCycle);
    dynamicRadius = shapeSettings.size * (0.8 + 0.3 * breatheEased * intensity);
    const pulseDir = breathePhase * 0.2;
    offsetX = Math.cos(pulseDir) * (breatheEased * 0.1) * shapeSettings.size * intensity;
    offsetY = Math.sin(pulseDir) * (breatheEased * 0.1) * shapeSettings.size * intensity;
    finalOpacity = shapeSettings.opacity * (0.8 + 0.2 * breatheEased);
    rotationOffset = (breatheEased - 0.5) * 5 * intensity;
  }

  return {
    dynamicRadius,
    finalOpacity,
    progress,
    uniqueId,
    adjustedTime,
    offsetX,
    offsetY,
    rotationOffset
  };
}

// ============================================================================
// SACRED GRID RENDERER CLASS
// ============================================================================

class SacredGridRenderer {
  constructor(container, settings, rendererType = 'canvas2d') {
    this.container = container;
    this.settings = settings;
    this.rendererType = rendererType;
    this.renderer = null;
    this.animationFrame = null;
    this.gridPoints = [];
    this.PHI = (1 + Math.sqrt(5)) / 2;
    this.time = 0;
    this._shapePatternTypes = new Map();

    // Shape drawing registry - assumes ShapeDrawers is defined in scope
    this.shapeDrawers = typeof ShapeDrawers !== 'undefined' ? ShapeDrawers : {};
  }

  initialize() {
    try {
      // Create the appropriate renderer - assumes Canvas2DRenderer is in scope
      if (typeof Canvas2DRenderer !== 'undefined') {
        this.renderer = new Canvas2DRenderer(this.container);
        this.renderer.initialize();
      } else {
        console.error('Canvas2DRenderer not found in scope');
        return;
      }
    } catch (error) {
      console.error('Error initializing renderer:', error);
      return;
    }

    this.generateGridPoints();

    // Set up event handlers
    if (this.renderer.addEventListener) {
      this.renderer.addEventListener('mousemove', (x, y) => {
        this.settings.mouse.position.x = x;
        this.settings.mouse.position.y = y;
      });

      this.renderer.addEventListener('mouseleave', () => {
        this.settings.mouse.position.x = -1000;
        this.settings.mouse.position.y = -1000;
      });

      this.renderer.addEventListener('resize', () => {
        this.generateGridPoints();
      });
    }

    this.startAnimation();
  }

  generateGridPoints() {
    this.gridPoints = [];
    const offsetX = this.renderer.width / 2;
    const offsetY = this.renderer.height / 2;
    const { size, spacing } = this.settings.grid;

    const screenDiagonal = Math.sqrt(
      this.renderer.width * this.renderer.width +
      this.renderer.height * this.renderer.height
    );
    const visibleRadius = Math.ceil((screenDiagonal / 2) / spacing) + 1;
    const effectiveSize = Math.min(size, visibleRadius);
    const trigCache = {};

    for (let x = -effectiveSize; x <= effectiveSize; x++) {
      for (let y = -effectiveSize; y <= effectiveSize; y++) {
        const goldenOffset = (x * y) / this.PHI;
        if (!trigCache[goldenOffset]) {
          trigCache[goldenOffset] = {
            sin: Math.sin(goldenOffset),
            cos: Math.cos(goldenOffset)
          };
        }
        this.gridPoints.push({
          x: offsetX + x * spacing + trigCache[goldenOffset].sin * 2,
          y: offsetY + y * spacing + trigCache[goldenOffset].cos * 2,
          noiseOffset: Math.random() * 10
        });
      }
    }
  }

  startAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    const animate = (time = 0) => {
      this.time = time * this.settings.animation.speed;
      this.drawFrame();
      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  noise(x, y, t) {
    if (!SacredGridRenderer.noiseCache) {
      SacredGridRenderer.noiseCache = new Map();
    }
    const cacheKey = \`\${Math.round(x*100)},\${Math.round(y*100)},\${Math.round(t*10)}\`;
    if (SacredGridRenderer.noiseCache.has(cacheKey)) {
      return SacredGridRenderer.noiseCache.get(cacheKey);
    }
    const value = (
      this.settings.grid.noiseIntensity *
      Math.sin(x * 0.3 + t * 0.002) *
      Math.cos(y * 0.3 - t * 0.003)
    );
    if (SacredGridRenderer.noiseCache.size < 10000) {
      SacredGridRenderer.noiseCache.set(cacheKey, value);
    }
    return value;
  }

  _getShapeKey(shapeType, shapeSettings) {
    return \`\${shapeType}_\${shapeSettings.vertices || 3}_\${shapeSettings.position?.offsetX || 0}_\${shapeSettings.position?.offsetY || 0}\`;
  }

  _getStablePatternType(shapeType, shapeSettings) {
    const shapeKey = this._getShapeKey(shapeType, shapeSettings);
    if (!this._shapePatternTypes.has(shapeKey)) {
      const seed = (shapeType.charCodeAt(0) || 0) + (shapeSettings.vertices || 3) * 10;
      const seededRand = (n) => {
        const x = Math.sin(n * 9999) * 10000;
        return x - Math.floor(x);
      };
      const patternType = Math.floor(seededRand(seed) * 5);
      this._shapePatternTypes.set(shapeKey, patternType);
    }
    return this._shapePatternTypes.get(shapeKey);
  }

  drawShape(shapeType, cx, cy, radius, thickness, opacity, fractalDepth, time, shapeSettings) {
    const drawFunc = this.shapeDrawers[shapeType];
    if (!drawFunc) return;

    const fractalContext = shapeSettings._fractalContext || { depth: fractalDepth, childIndex: 0, totalChildren: 1 };
    const animParams = shapeSettings.animation ?
      calculateAnimationParams(time, shapeSettings, this.settings, fractalContext.depth, fractalContext.childIndex, fractalContext.totalChildren) :
      { offsetX: 0, offsetY: 0, rotationOffset: 0 };

    const { offsetX = 0, offsetY = 0, rotationOffset = 0 } = animParams;
    const adjustedCx = cx + offsetX;
    const adjustedCy = cy + offsetY;

    let adjustedRotation = shapeSettings.rotation || 0;
    if (rotationOffset) {
      adjustedRotation += rotationOffset;
    }

    const adjustedSettings = {
      ...shapeSettings,
      rotation: adjustedRotation
    };

    this.renderer.drawCustomShape(drawFunc, {
      cx: adjustedCx,
      cy: adjustedCy,
      radius,
      thickness,
      shapeSettings: adjustedSettings,
      time,
      globalSettings: this.settings
    });

    if (fractalDepth > 1 && shapeSettings.fractal) {
      this.drawRecursiveShapes(
        shapeType,
        adjustedCx,
        adjustedCy,
        radius,
        thickness,
        opacity,
        fractalDepth,
        time,
        adjustedSettings
      );
    }
  }

  drawRecursiveShapes(shapeType, cx, cy, radius, thickness, opacity, fractalDepth, time, shapeSettings) {
    const { fractal } = shapeSettings;
    const sizeScaleFactor = fractal.sizeFalloff || fractal.scale || 0.5;
    const newRadius = radius * sizeScaleFactor;
    const positionRadius = radius * fractal.scale;
    const newThickness = thickness * fractal.thicknessFalloff;
    const newOpacity = opacity * fractal.thicknessFalloff;
    const childCount = fractal.childCount || 3;
    const rotation = (shapeSettings.rotation * Math.PI) / 180;

    const PHI = 1.618033988749895;
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

    const useSacredPositioning = fractal.sacredPositioning;
    const sacredIntensity = fractal.sacredIntensity || 0.5;

    const seed = (shapeType.charCodeAt(0) || 0) +
                (shapeSettings.vertices || 3) * 10 +
                Math.round(fractalDepth * 100);

    const seededRand = (n) => {
      const x = Math.sin(n * 9999) * 10000;
      return x - Math.floor(x);
    };

    const patternType = this._getStablePatternType(shapeType, shapeSettings);
    const patternRotationOffset = seededRand(seed) * Math.PI * 2;

    for (let i = 0; i < childCount; i++) {
      let offsetX, offsetY;

      if (useSacredPositioning) {
        const baseAngle = (i * 2 * Math.PI) / childCount + rotation + patternRotationOffset;

        switch(patternType) {
          case 0: // Golden ratio spiral
            const spiralAngle = baseAngle + (GOLDEN_ANGLE * i * (fractalDepth + 1));
            const spiralProgress = i / Math.max(childCount - 1, 1);
            const spiralRadius = positionRadius * (0.6 + 0.4 * Math.pow(PHI, -spiralProgress));
            offsetX = spiralRadius * Math.cos(spiralAngle);
            offsetY = spiralRadius * Math.sin(spiralAngle);
            break;

          case 1: // Fibonacci grid
            const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
            const maxFib = fib[fib.length - 1];
            const stableIdx1 = (i * (fractalDepth + 1)) % fib.length;
            const stableIdx2 = ((i * 3) + fractalDepth) % fib.length;
            const normX = (fib[stableIdx1] / maxFib) * 2 - 1;
            const normY = (fib[stableIdx2] / maxFib) * 2 - 1;
            const fibAngle = baseAngle * 0.5;
            const rotatedX = normX * Math.cos(fibAngle) - normY * Math.sin(fibAngle);
            const rotatedY = normX * Math.sin(fibAngle) + normY * Math.cos(fibAngle);
            offsetX = positionRadius * rotatedX * 0.75;
            offsetY = positionRadius * rotatedY * 0.75;
            break;

          case 2: // Platonic solid vertices
            if (childCount <= 4) {
              const tetrahedronVerts = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
              const vertIndex = (i + fractalDepth) % 4;
              const vert = tetrahedronVerts[vertIndex];
              const len = Math.sqrt(vert[0]*vert[0] + vert[1]*vert[1] + vert[2]*vert[2]);
              offsetX = positionRadius * (vert[0] / len) * 0.7;
              offsetY = positionRadius * (vert[1] / len) * 0.7;
            } else {
              const icoAngle1 = patternRotationOffset + (i * GOLDEN_ANGLE);
              const icoAngle2 = patternRotationOffset + ((i+1) * GOLDEN_ANGLE);
              const blend = ((i + fractalDepth) % 3) / 2;
              offsetX = positionRadius * (Math.cos(icoAngle1) * (1-blend) + Math.cos(icoAngle2) * blend) * 0.8;
              offsetY = positionRadius * (Math.sin(icoAngle1) * (1-blend) + Math.sin(icoAngle2) * blend) * 0.8;
            }
            break;

          case 3: // Metatron's Cube
            const slice = 2 * Math.PI / 6;
            const ring = 1 + ((i + fractalDepth) % 3);
            const segment = i % 6;
            const metaAngle = segment * slice + patternRotationOffset;
            const metaRadiusFactor = 0.3 + (0.2 * ring);
            offsetX = positionRadius * metaRadiusFactor * Math.cos(metaAngle);
            offsetY = positionRadius * metaRadiusFactor * Math.sin(metaAngle);
            break;

          case 4: // Sri Yantra
          default:
            const triIndex = (i + fractalDepth) % 3;
            const isUpward = ((i + fractalDepth) % 2 === 0);
            const triAngle = patternRotationOffset + (triIndex * 2 * Math.PI / 3) + (isUpward ? 0 : Math.PI/3);
            const radiusFactor = 0.5 + (isUpward ? 0.2 : 0);
            offsetX = positionRadius * radiusFactor * Math.cos(triAngle);
            offsetY = positionRadius * radiusFactor * Math.sin(triAngle);
        }

        const maxOffset = positionRadius * 0.9;
        offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
        offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));

        if (sacredIntensity < 1) {
          const standardAngle = (i * 2 * Math.PI) / childCount + rotation;
          const standardX = positionRadius * Math.cos(standardAngle);
          const standardY = positionRadius * Math.sin(standardAngle);
          offsetX = offsetX * sacredIntensity + standardX * (1 - sacredIntensity);
          offsetY = offsetY * sacredIntensity + standardY * (1 - sacredIntensity);
        }
      } else {
        const childAngle = (i * 2 * Math.PI) / childCount + rotation;
        offsetX = positionRadius * Math.cos(childAngle);
        offsetY = positionRadius * Math.sin(childAngle);
      }

      const childShapeSettings = {
        ...shapeSettings,
        _fractalContext: {
          depth: fractalDepth,
          childIndex: i,
          totalChildren: childCount
        },
        animation: shapeSettings.animation ? { ...shapeSettings.animation } : shapeSettings.animation
      };

      this.drawShape(
        shapeType,
        cx + offsetX,
        cy + offsetY,
        newRadius,
        newThickness,
        newOpacity,
        fractalDepth - 1,
        time,
        childShapeSettings
      );
    }
  }

  drawFrame() {
    try {
      if (!this.renderer) {
        console.error('Renderer is null in drawFrame');
        return;
      }

      if (!this.renderer.width || !this.renderer.height ||
          this.renderer.width < 1 || this.renderer.height < 1) {
        if (typeof this.renderer._handleResize === 'function') {
          this.renderer._handleResize();
        }
        if (!this.renderer.width || !this.renderer.height) return;
      }

      this.renderer.beginFrame();
      this.renderer.clear(this.settings.colors.background);

      const centerX = this.renderer.width / 2;
      const centerY = this.renderer.height / 2;

      // Draw XY grid if enabled
      if (this.settings.xyGrid && this.settings.xyGrid.show) {
        this.drawXYGrid(centerX, centerY);
        this.renderer.resetGlobalAlpha && this.renderer.resetGlobalAlpha();
      }

      // Draw sacred grid lines
      this.drawGridLines(centerX, centerY);

      // Draw grid dots
      this.drawGridDots();

      // Draw shapes
      this.drawShapes(centerX, centerY);

      this.renderer.endFrame();
    } catch (error) {
      console.error('Error in drawFrame:', error);
    }
  }

  drawXYGrid(centerX, centerY) {
    const { xyGrid } = this.settings;
    const { size, spacing, opacity, lineWidth, color, showLabels } = xyGrid;

    const halfWidth = size * spacing;
    const halfHeight = size * spacing;
    const startX = centerX - halfWidth;
    const endX = centerX + halfWidth;
    const startY = centerY - halfHeight;
    const endY = centerY + halfHeight;

    this.renderer.setGlobalAlpha && this.renderer.setGlobalAlpha(opacity);

    for (let y = -size; y <= size; y++) {
      const yPos = centerY + y * spacing;
      this.renderer.drawLine(startX, yPos, endX, yPos, color, lineWidth);
      if (showLabels && y !== 0 && this.renderer.drawText) {
        this.renderer.drawText(String(y), startX - 20, yPos + 4, color, "10px Arial");
      }
    }

    for (let x = -size; x <= size; x++) {
      const xPos = centerX + x * spacing;
      this.renderer.drawLine(xPos, startY, xPos, endY, color, lineWidth);
      if (showLabels && x !== 0 && this.renderer.drawText) {
        this.renderer.drawText(String(x), xPos, startY - 10, color, "10px Arial");
      }
    }

    this.renderer.drawLine(centerX, startY, centerX, endY, color, lineWidth * 2);
    this.renderer.drawLine(startX, centerY, endX, centerY, color, lineWidth * 2);
    this.renderer.resetGlobalAlpha && this.renderer.resetGlobalAlpha();
  }

  drawGridLines(centerX, centerY) {
    const { grid, colors, mouse } = this.settings;
    const connectionsToRender = [];
    const maxDistance = Math.max(this.renderer.width, this.renderer.height) * 0.5;

    for (let i = 0; i < this.gridPoints.length; i++) {
      const point = this.gridPoints[i];
      const distToCenter = Math.hypot(point.x - centerX, point.y - centerY);
      const pointTurbulence = this.noise(
        point.x * 0.01,
        point.y * 0.01,
        this.time + point.noiseOffset
      );

      for (let j = i + 1; j < this.gridPoints.length; j++) {
        const otherPoint = this.gridPoints[j];
        const dx = point.x - otherPoint.x;
        const dy = point.y - otherPoint.y;
        const distSquared = dx * dx + dy * dy;

        if (distSquared > maxDistance * maxDistance) continue;

        const dist = Math.sqrt(distSquared);

        if (
          Math.abs(dist / distToCenter - 1 / this.PHI) < 0.1 ||
          Math.abs(dist / distToCenter - this.PHI) < 0.1
        ) {
          const otherTurbulence = this.noise(
            otherPoint.x * 0.01,
            otherPoint.y * 0.01,
            this.time + otherPoint.noiseOffset
          );
          const lineTurbulence = (pointTurbulence + otherTurbulence) * 0.5;
          const breathingPhase = this.time * grid.breathingSpeed + dist * 0.002 + lineTurbulence;
          const baseOpacity = grid.connectionOpacity *
            (0.7 + Math.sin(breathingPhase) * 0.3 * grid.breathingIntensity);

          const lineCenter = {
            x: (point.x + otherPoint.x) / 2,
            y: (point.y + otherPoint.y) / 2
          };
          const lineMouseDist = Math.hypot(
            lineCenter.x - mouse.position.x,
            lineCenter.y - mouse.position.y
          );
          const lineMouseInfluence = Math.max(0, 1 - lineMouseDist / mouse.influenceRadius);
          const finalOpacity = baseOpacity * (1 + lineMouseInfluence);
          const lineWidth = (0.5 + lineMouseInfluence) * grid.lineWidthMultiplier;

          connectionsToRender.push({
            point1: point,
            point2: otherPoint,
            opacity: finalOpacity,
            width: lineWidth
          });
        }
      }
    }

    if (colors.gradient.lines.enabled) {
      const lineColor = getMultiEasedColor(
        this.time,
        colors.gradient.lines.colors,
        1,
        colors.gradient.cycleDuration,
        colors.gradient.easing
      );

      for (const conn of connectionsToRender) {
        this.renderer.setGlobalAlpha && this.renderer.setGlobalAlpha(conn.opacity);
        this.renderer.drawLine(
          conn.point1.x, conn.point1.y,
          conn.point2.x, conn.point2.y,
          lineColor, conn.width
        );
        this.renderer.resetGlobalAlpha && this.renderer.resetGlobalAlpha();
      }
    } else {
      for (const conn of connectionsToRender) {
        const lineColor = getShapeColor(conn.opacity, colors.scheme);
        this.renderer.drawLine(
          conn.point1.x, conn.point1.y,
          conn.point2.x, conn.point2.y,
          lineColor, conn.width
        );
      }
    }
  }

  drawGridDots() {
    const { grid, colors, mouse } = this.settings;

    if (grid.showVertices === false) return;

    const dotsToRender = [];
    const useGradient = colors.gradient.dots.enabled;
    let gradientColor;

    if (useGradient) {
      gradientColor = getMultiEasedColor(
        this.time,
        colors.gradient.dots.colors,
        1,
        colors.gradient.cycleDuration,
        colors.gradient.easing
      );
    }

    for (const point of this.gridPoints) {
      const distanceFromMouse = Math.hypot(
        point.x - mouse.position.x,
        point.y - mouse.position.y
      );
      const mouseInfluence = Math.max(0, 1 - distanceFromMouse / mouse.influenceRadius);
      const breathePhase = this.time * grid.breathingSpeed + point.noiseOffset;
      const breathe = 1 + Math.sin(breathePhase) * grid.breathingIntensity;
      const dotRadius = grid.baseDotSize * breathe * (1 + (mouse.maxScale - 1) * mouseInfluence);
      const alpha = Math.max(0, Math.min(1, 0.7 + 0.3 * Math.sin(breathePhase)));

      dotsToRender.push({ x: point.x, y: point.y, radius: dotRadius, alpha });
    }

    if (useGradient) {
      for (const dot of dotsToRender) {
        this.renderer.setGlobalAlpha && this.renderer.setGlobalAlpha(dot.alpha);
        this.renderer.drawCircle(dot.x, dot.y, dot.radius, gradientColor);
      }
      this.renderer.resetGlobalAlpha && this.renderer.resetGlobalAlpha();
    } else {
      for (const dot of dotsToRender) {
        const dotColor = getShapeColor(dot.alpha, colors.scheme);
        this.renderer.drawCircle(dot.x, dot.y, dot.radius, dotColor);
      }
    }
  }

  drawShapes(centerX, centerY) {
    const { shapes } = this.settings;
    this.drawPrimaryShape(centerX, centerY);
    if (shapes.secondary && shapes.secondary.enabled) {
      this.drawSecondaryShape(centerX, centerY);
    }
  }

  drawPrimaryShape(centerX, centerY) {
    const { shapes } = this.settings;
    const { primary } = shapes;
    const shapeCenterX = centerX + primary.position.offsetX;
    const shapeCenterY = centerY + primary.position.offsetY;

    this.drawShape(
      primary.type,
      shapeCenterX,
      shapeCenterY,
      primary.size,
      primary.thickness,
      primary.opacity,
      primary.fractal.depth,
      this.time,
      primary
    );

    if (primary.stacking && primary.stacking.enabled) {
      for (let i = 0; i < primary.stacking.count; i++) {
        this.drawShape(
          primary.type,
          shapeCenterX,
          shapeCenterY,
          primary.size,
          primary.thickness,
          primary.opacity,
          primary.fractal.depth,
          this.time + primary.stacking.timeOffset + i * primary.stacking.interval,
          primary
        );
      }
    }
  }

  drawSecondaryShape(centerX, centerY) {
    const { shapes } = this.settings;
    const { primary, secondary } = shapes;

    let shapeCenterX = centerX + secondary.position.offsetX;
    let shapeCenterY = centerY + secondary.position.offsetY;
    const primaryCenterX = centerX + primary.position.offsetX;
    const primaryCenterY = centerY + primary.position.offsetY;

    let shapeType = secondary.type;
    let shapeSize = secondary.size;
    let shapeThickness = secondary.thickness;
    let shapeOpacity = secondary.opacity;
    let shapeFractalDepth = secondary.fractal.depth;
    let shapeRotation = secondary.rotation;

    if (secondary.mathRelationships && secondary.mathRelationships.useHarmonicRatios === true) {
      const harmonicRatio = secondary.mathRelationships.harmonicRatio || "1:1";
      let ratio = 1;
      if (harmonicRatio === "1:1.618") {
        ratio = 1 / 1.618;
      } else {
        const [numerator, denominator] = harmonicRatio.split(':').map(Number);
        if (numerator && denominator) {
          ratio = numerator / denominator;
        }
      }
      shapeSize = primary.size * ratio;
      shapeThickness = primary.thickness * Math.sqrt(ratio);
      const orbitSpeed = 0.0005;
      const orbitRadius = primary.size * 0.2 * ratio;
      const orbitPhase = this.time * orbitSpeed;
      shapeCenterX += Math.cos(orbitPhase) * orbitRadius;
      shapeCenterY += Math.sin(orbitPhase) * orbitRadius;
    }

    if (secondary.mathRelationships && secondary.mathRelationships.useSymmetryGroup === true) {
      const operation = secondary.mathRelationships.symmetryOperation || "rotation";
      const animTime = this.time * 0.001;

      switch (operation) {
        case "rotation":
          const rotAngle = Math.PI/2 + Math.sin(animTime * 0.5) * Math.PI/4;
          const dx = shapeCenterX - primaryCenterX;
          const dy = shapeCenterY - primaryCenterY;
          shapeCenterX = primaryCenterX + dx * Math.cos(rotAngle) - dy * Math.sin(rotAngle);
          shapeCenterY = primaryCenterY + dx * Math.sin(rotAngle) + dy * Math.cos(rotAngle);
          shapeRotation = (secondary.rotation + Math.sin(animTime) * 30) % 360;
          break;
        case "reflection":
          const axisAngle = Math.sin(animTime * 0.7) * Math.PI/6;
          const dist = Math.hypot(shapeCenterX - primaryCenterX, shapeCenterY - primaryCenterY);
          const curAngle = Math.atan2(shapeCenterY - primaryCenterY, shapeCenterX - primaryCenterX);
          const reflectedAngle = Math.PI - curAngle + 2 * axisAngle;
          shapeCenterX = primaryCenterX + dist * Math.cos(reflectedAngle);
          shapeCenterY = primaryCenterY + dist * Math.sin(reflectedAngle);
          break;
        case "rotation180":
          const pulseFactor = 0.8 + 0.2 * Math.sin(animTime * 1.5);
          shapeCenterX = primaryCenterX - (shapeCenterX - primaryCenterX) * pulseFactor;
          shapeCenterY = primaryCenterY - (shapeCenterY - primaryCenterY) * pulseFactor;
          break;
      }
    }

    const modifiedSecondary = {
      ...secondary,
      size: shapeSize,
      thickness: shapeThickness,
      opacity: shapeOpacity,
      rotation: shapeRotation
    };

    this.drawShape(
      shapeType,
      shapeCenterX,
      shapeCenterY,
      shapeSize,
      shapeThickness,
      shapeOpacity,
      shapeFractalDepth,
      this.time,
      modifiedSecondary
    );

    if (secondary.stacking && secondary.stacking.enabled) {
      for (let i = 0; i < secondary.stacking.count; i++) {
        this.drawShape(
          shapeType,
          shapeCenterX,
          shapeCenterY,
          shapeSize,
          shapeThickness,
          shapeOpacity,
          shapeFractalDepth,
          this.time + secondary.stacking.timeOffset + i * secondary.stacking.interval,
          modifiedSecondary
        );
      }
    }
  }

  updateSettings(newSettings) {
    const oldSettings = this.settings;
    this.settings = { ...this.settings, ...newSettings };

    if (
      newSettings.grid && (
        (oldSettings.grid.size !== this.settings.grid.size) ||
        (oldSettings.grid.spacing !== this.settings.grid.spacing)
      )
    ) {
      if (SacredGridRenderer.noiseCache) {
        SacredGridRenderer.noiseCache.clear();
      }
      this.generateGridPoints();
    }
  }

  dispose() {
    this.stopAnimation();
    if (SacredGridRenderer.noiseCache) {
      SacredGridRenderer.noiseCache.clear();
    }
    this.gridPoints = [];
    if (this.renderer) {
      this.renderer.dispose && this.renderer.dispose();
      this.renderer = null;
    }
  }

  exportAsImage() {
    if (!this.renderer) {
      console.error('Renderer not initialized');
      return null;
    }
    if (this.renderer.canvas) {
      const wasAnimating = this.animationFrame !== null;
      if (wasAnimating) this.stopAnimation();
      this.drawFrame();
      const dataURL = this.renderer.canvas.toDataURL('image/png');
      if (wasAnimating) this.startAnimation();
      return dataURL;
    }
    return null;
  }
}

// Static noise cache
SacredGridRenderer.noiseCache = null;
`;
}

/**
 * Returns just the core rendering class without the utility functions
 * (for when utilities are already bundled separately)
 */
export function getBundledSacredGridRendererClassOnly(): string {
  return `
class SacredGridRenderer {
  constructor(container, settings, rendererType = 'canvas2d') {
    this.container = container;
    this.settings = settings;
    this.rendererType = rendererType;
    this.renderer = null;
    this.animationFrame = null;
    this.gridPoints = [];
    this.PHI = (1 + Math.sqrt(5)) / 2;
    this.time = 0;
    this._shapePatternTypes = new Map();
    this.shapeDrawers = typeof ShapeDrawers !== 'undefined' ? ShapeDrawers : {};
  }

  // Methods would be included here - use getBundledSacredGridRenderer() for the full version
}
SacredGridRenderer.noiseCache = null;
`;
}
