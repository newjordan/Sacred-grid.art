// src/export/BundledShapeDrawers.ts
// This module exports a function that returns a bundled JavaScript string
// containing all essential drawing functions for standalone export.
// The output is vanilla JavaScript that can be embedded in an HTML file's script tag.

export function getBundledShapeDrawers(): string {
  return `
// ============================================
// BUNDLED SHAPE DRAWERS - Self-contained renderer
// ============================================

// -------------------- CONSTANTS --------------------

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
  CUSTOM_MANDALA: 'customMandala',
  SECONDARY: 'secondary'
};

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

const ShapeTemplate = {
  CIRCLE: function(ctx, x, y, radius) {
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    return true;
  },
  HEXAGON: function(ctx, x, y, radius) {
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      const pointX = x + radius * Math.cos(angle);
      const pointY = y + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
    return true;
  },
  PENTAGON: function(ctx, x, y, radius) {
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
      const pointX = x + radius * Math.cos(angle);
      const pointY = y + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
    return true;
  },
  STAR: function(ctx, x, y, radius, points, innerRadius) {
    points = points || 5;
    innerRadius = innerRadius || 0.4;
    for (let i = 0; i < points * 2; i++) {
      const angle = i * Math.PI / points - Math.PI / 2;
      const r = i % 2 === 0 ? radius : radius * innerRadius;
      const pointX = x + r * Math.cos(angle);
      const pointY = y + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
    return true;
  },
  LISSAJOUS: function(ctx, x, y, radius, a, b, delta, segments) {
    a = a || 3;
    b = b || 2;
    delta = delta || Math.PI / 2;
    segments = segments || 100;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const pointX = x + radius * Math.sin(a * t + delta);
      const pointY = y + radius * Math.sin(b * t);
      if (i === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    return false;
  },
  SPIRAL: function(ctx, x, y, radius, turns, spiralType, segments) {
    turns = turns || 4;
    spiralType = spiralType || 'golden';
    segments = segments || 200;
    const PHI = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let angle, r;
      switch (spiralType) {
        case 'golden':
          angle = t * turns * 2 * Math.PI;
          r = radius * Math.pow(PHI, -2 * t * turns) * 0.8;
          break;
        case 'archimedean':
          angle = t * turns * 2 * Math.PI;
          r = radius * (1 - t * 0.85);
          break;
        case 'logarithmic':
          angle = t * turns * 2 * Math.PI;
          r = radius * Math.exp(-0.2 * t * turns) * 0.9;
          break;
        default:
          angle = t * turns * 2 * Math.PI;
          r = radius * Math.pow(PHI, -2 * t * turns) * 0.8;
      }
      const pointX = x + r * Math.cos(angle);
      const pointY = y + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    return false;
  }
};

// -------------------- COLOR UTILITIES --------------------

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
    case 'easeInOutElastic':
      const c5 = (2 * Math.PI) / 4.5;
      if (t === 0) return 0;
      if (t === 1) return 1;
      return t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    case 'linear':
    default:
      return t;
  }
}

function parseHexColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return [r, g, b];
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
  const precision = 1000;
  const finalR = Math.round(r * precision) / precision;
  const finalG = Math.round(g * precision) / precision;
  const finalB = Math.round(b * precision) / precision;
  return 'rgba(' + Math.round(finalR) + ', ' + Math.round(finalG) + ', ' + Math.round(finalB) + ', ' + alpha + ')';
}

function isWebGLRenderer(context, settings) {
  return (context && context.isWebGLContext) || (settings && settings.rendererType === 'webgl');
}

function getShapeColor(alpha, colorScheme, context, settings) {
  const usingWebGL = isWebGLRenderer(context, settings);
  if (usingWebGL && colorScheme !== 'red' && colorScheme !== 'green' &&
      colorScheme !== 'purple' && colorScheme !== 'blue' && colorScheme !== 'grayscale') {
    return 'rgba(220,220,220,' + alpha + ')';
  }
  switch (colorScheme) {
    case 'red':
      return 'rgba(255,100,100,' + alpha + ')';
    case 'green':
      return 'rgba(100,255,100,' + alpha + ')';
    case 'purple':
      return 'rgba(200,100,255,' + alpha + ')';
    case 'grayscale':
      return 'rgba(220,220,220,' + alpha + ')';
    case 'blue':
    default:
      return 'rgba(200,220,255,' + alpha + ')';
  }
}

// -------------------- ANIMATION UTILITIES --------------------

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

function calculateSymmetricFractalTiming(baseTime, fractalDepth, childIndex, totalChildren) {
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const tau = Math.PI * 2;
  const phaseOffset = (childIndex / totalChildren) * tau;
  const depthScale = Math.pow(goldenRatio, -fractalDepth);
  return baseTime + (phaseOffset * depthScale * 1000);
}

function calculateAnimationParams(time, shapeSettings, globalSettings, fractalDepth, childIndex, totalChildren) {
  fractalDepth = fractalDepth || 0;
  childIndex = childIndex || 0;
  totalChildren = totalChildren || 1;

  const animation = shapeSettings.animation;
  let adjustedTime = time;

  if (fractalDepth > 0 && totalChildren > 1) {
    adjustedTime = calculateSymmetricFractalTiming(time, fractalDepth, childIndex, totalChildren);
  }

  const uniqueId = ((shapeSettings.type && shapeSettings.type.charCodeAt(0)) || 0) +
                   (shapeSettings.vertices || 0) * 10 +
                   ((shapeSettings.position && shapeSettings.position.offsetX) || 0) * 0.1 +
                   ((shapeSettings.position && shapeSettings.position.offsetY) || 0) * 0.1;

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

  let dynamicRadius, finalOpacity;
  let offsetX = 0;
  let offsetY = 0;
  let rotationOffset = 0;

  if (animation.mode === AnimationMode.GROW) {
    dynamicRadius = shapeSettings.size * progress;
    let fadeValue;
    if (progress < animation.fadeIn) {
      fadeValue = progress / animation.fadeIn;
    } else if (progress > 1 - animation.fadeOut) {
      fadeValue = (1 - progress) / animation.fadeOut;
    } else {
      fadeValue = 1;
    }
    finalOpacity = Math.max(0, Math.min(1, shapeSettings.opacity * fadeValue));
  } else if (animation.mode === AnimationMode.PULSE) {
    const basePhase = progress * 2 * Math.PI;
    const breathingPhase = adjustedTime * animation.speed;
    const secondaryPhase = adjustedTime * animation.speed * 1.5;
    const secondaryStrength = 0.3;
    const breathingFactor = 1 +
      (Math.sin(breathingPhase) * animation.intensity) +
      (Math.sin(secondaryPhase) * animation.intensity * secondaryStrength);
    const pulse = 0.5 + 0.5 * Math.sin(basePhase);
    dynamicRadius = shapeSettings.size * pulse * breathingFactor;
    const opacityPulse = 1 + (Math.sin(breathingPhase * 1.3) * 0.15);
    finalOpacity = Math.min(1, shapeSettings.opacity * opacityPulse);
  } else if (animation.mode === AnimationMode.ORBIT) {
    const orbitPhase = adjustedTime * animation.speed;
    const baseRadius = shapeSettings.size * (0.8 + 0.2 * Math.sin(orbitPhase * 0.5));
    dynamicRadius = baseRadius;
    finalOpacity = shapeSettings.opacity;
    const orbitRadius = shapeSettings.size * 0.3 * animation.intensity;
    offsetX = Math.cos(orbitPhase) * orbitRadius;
    offsetY = Math.sin(orbitPhase) * orbitRadius;
    rotationOffset = Math.sin(orbitPhase * 0.25) * 15;
  } else if (animation.mode === AnimationMode.WAVEFORM) {
    const wavePhase = adjustedTime * animation.speed;
    const wave1 = Math.sin(wavePhase);
    const wave2 = Math.sin(wavePhase * 2.5) * 0.3;
    const wave3 = Math.sin(wavePhase * 0.6) * 0.1;
    const waveform = wave1 + wave2 + wave3;
    const normalizedWave = (waveform / 1.4) * animation.intensity;
    dynamicRadius = shapeSettings.size * (1 + normalizedWave);
    const opacityWave = 1 + (Math.sin(wavePhase * 1.7) * 0.1);
    finalOpacity = Math.min(1, shapeSettings.opacity * opacityWave);
    offsetX = Math.sin(wavePhase) * shapeSettings.size * 0.2 * animation.intensity;
    offsetY = Math.cos(wavePhase * 0.7) * shapeSettings.size * 0.15 * animation.intensity;
  } else if (animation.mode === AnimationMode.SPIRAL) {
    const spiralPhase = adjustedTime * animation.speed;
    dynamicRadius = shapeSettings.size * (0.9 + 0.1 * Math.sin(spiralPhase * 0.5));
    finalOpacity = shapeSettings.opacity * (0.8 + 0.2 * Math.sin(spiralPhase * 0.75));
    const angle = spiralPhase * 2;
    const spiralGrowth = (1 - Math.cos(spiralPhase * 0.5)) * 0.5;
    const spiralRadius = shapeSettings.size * 0.4 * spiralGrowth * animation.intensity;
    offsetX = Math.cos(angle) * spiralRadius;
    offsetY = Math.sin(angle) * spiralRadius;
    rotationOffset = spiralPhase * 30;
  } else if (animation.mode === AnimationMode.HARMONIC) {
    const harmonicPhase = adjustedTime * animation.speed;
    const frequencyRatio = 1.5 + Math.sin(harmonicPhase * 0.1) * 0.5;
    const radiusWave =
      Math.sin(harmonicPhase) * 0.3 +
      Math.sin(harmonicPhase * 1.7) * 0.2 +
      Math.sin(harmonicPhase * 0.4) * 0.1;
    dynamicRadius = shapeSettings.size * (0.9 + radiusWave * animation.intensity * 0.3);
    const opacityHarmonic = 0.85 + Math.sin(harmonicPhase * 1.3) * 0.15;
    finalOpacity = shapeSettings.opacity * opacityHarmonic;
    const a = 3;
    const b = frequencyRatio;
    const delta = harmonicPhase * 0.2;
    const patternScale = shapeSettings.size * 0.25 * animation.intensity;
    offsetX = Math.sin(a * harmonicPhase + delta) * patternScale;
    offsetY = Math.sin(b * harmonicPhase) * patternScale;
    rotationOffset = Math.sin(harmonicPhase * 0.3) * 20;
  } else if (animation.mode === AnimationMode.SWARM) {
    const swarmPhase = adjustedTime * animation.speed;
    const randBase1 = seededRandom(uniqueId * 1.1);
    const randBase2 = seededRandom(uniqueId * 2.2);
    const randBase3 = seededRandom(uniqueId * 3.3);
    const swarmFreq1 = 0.5 + randBase1;
    const swarmFreq2 = 0.7 + randBase2;
    const swarmFreq3 = 0.3 + randBase3;
    offsetX = (
      Math.sin(swarmPhase * swarmFreq1) * 0.5 +
      Math.sin(swarmPhase * swarmFreq2 * 1.7) * 0.3 +
      Math.cos(swarmPhase * swarmFreq3 * 0.5) * 0.2
    ) * shapeSettings.size * 0.3 * animation.intensity;
    offsetY = (
      Math.cos(swarmPhase * swarmFreq1 * 0.8) * 0.5 +
      Math.sin(swarmPhase * swarmFreq3 * 1.3) * 0.3 +
      Math.cos(swarmPhase * swarmFreq2 * 0.7) * 0.2
    ) * shapeSettings.size * 0.3 * animation.intensity;
    dynamicRadius = shapeSettings.size * (0.95 + 0.05 * Math.sin(swarmPhase * randBase2 * 2));
    finalOpacity = shapeSettings.opacity * (0.9 + 0.1 * Math.sin(swarmPhase * randBase3));
    rotationOffset = Math.sin(swarmPhase * randBase1) * 25;
  } else if (animation.mode === AnimationMode.BREATHE) {
    const breathePhase = adjustedTime * animation.speed;
    const breatheCycle = (Math.sin(breathePhase) + 1) / 2;
    const breatheEased = easeOutElastic(breatheCycle);
    dynamicRadius = shapeSettings.size * (0.8 + 0.3 * breatheEased * animation.intensity);
    const pulseDir = breathePhase * 0.2;
    offsetX = Math.cos(pulseDir) * (breatheEased * 0.1) * shapeSettings.size * animation.intensity;
    offsetY = Math.sin(pulseDir) * (breatheEased * 0.1) * shapeSettings.size * animation.intensity;
    finalOpacity = shapeSettings.opacity * (0.8 + 0.2 * breatheEased);
    rotationOffset = (breatheEased - 0.5) * 5 * animation.intensity;
  } else {
    dynamicRadius = shapeSettings.size;
    finalOpacity = shapeSettings.opacity;
  }

  return {
    dynamicRadius: dynamicRadius,
    finalOpacity: finalOpacity,
    progress: progress,
    uniqueId: uniqueId,
    adjustedTime: adjustedTime,
    offsetX: offsetX,
    offsetY: offsetY,
    rotationOffset: rotationOffset
  };
}

// -------------------- DRAWING HELPERS --------------------

function drawShapeTemplate(ctx, params, templateFn, isClosedPath) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const strokeColor = params.strokeColor;
  const dynamicRadius = params.dynamicRadius;

  if (typeof ctx.beginPath !== 'function') {
    if (typeof ctx.drawCircle === 'function' && templateFn === ShapeTemplate.CIRCLE) {
      ctx.drawCircle(cx, cy, dynamicRadius, strokeColor);
      return;
    }
    return;
  }

  ctx.beginPath();
  try {
    templateFn(ctx, cx, cy, dynamicRadius);
  } catch (err) {
    // Template execution error
  }

  if (!isClosedPath) {
    ctx.closePath();
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = thickness;
  ctx.stroke();
}

// -------------------- SHAPE DRAWING FUNCTIONS --------------------

function drawPolygon(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';
  let finalOpacity;

  if (isWebGL) {
    finalOpacity = 1.0;
  } else {
    finalOpacity = calculateAnimationParams(time, shapeSettings, globalSettings).finalOpacity;
  }

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const sides = shapeSettings.vertices || 3;
  const rotation = (shapeSettings.rotation * Math.PI) / 180;

  let vertices = [];

  if (shapeSettings.useCustomVertices && shapeSettings.customVertices && shapeSettings.customVertices.length > 2) {
    const customVertices = shapeSettings.customVertices;
    const maxCustomRadius = Math.max.apply(null, customVertices.map(function(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y);
    }));
    const scaleFactor = maxCustomRadius > 0 ? dynamicRadius / maxCustomRadius : 1;
    vertices = customVertices.map(function(v) {
      return { x: cx + v.x * scaleFactor, y: cy + v.y * scaleFactor };
    });
  } else {
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides + rotation;
      vertices.push({
        x: cx + dynamicRadius * Math.cos(angle),
        y: cy + dynamicRadius * Math.sin(angle)
      });
    }
  }

  if (vertices.length > 0) {
    const firstV = vertices[0];
    const lastV = vertices[vertices.length - 1];
    if (Math.abs(firstV.x - lastV.x) > 0.001 || Math.abs(firstV.y - lastV.y) > 0.001) {
      vertices.push({ x: vertices[0].x, y: vertices[0].y });
    }
  }

  if (isWebGL) {
    if (ctx.drawPolygon && vertices && vertices.length > 2) {
      ctx.drawPolygon(vertices, null, strokeColor, thickness);
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(thickness, 1.0);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawFlowerOfLife(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const rotation = (shapeSettings.rotation * Math.PI) / 180;
  const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';

  if (isWebGL) {
    if (typeof ctx.drawCircle === 'function') {
      ctx.drawCircle(cx, cy, dynamicRadius, strokeColor);
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (i * 2 * Math.PI) / 6;
        const x = cx + dynamicRadius * Math.cos(angle);
        const y = cy + dynamicRadius * Math.sin(angle);
        ctx.drawCircle(x, y, dynamicRadius, strokeColor);
      }
    }
  } else {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const angle = rotation + (i * 2 * Math.PI) / 6;
      const x = cx + dynamicRadius * Math.cos(angle);
      const y = cy + dynamicRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, dynamicRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

function drawMerkaba(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    strokeColor = getShapeColor(finalOpacity, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    ctx.globalAlpha = 1;
  }

  const rotation = (shapeSettings.rotation * Math.PI) / 180;

  const vertices1 = [];
  for (let i = 0; i < 3; i++) {
    const angle = rotation + (i * 2 * Math.PI) / 3 + Math.PI / 6;
    vertices1.push({
      x: cx + dynamicRadius * Math.cos(angle),
      y: cy + dynamicRadius * Math.sin(angle)
    });
  }

  const vertices2 = [];
  for (let i = 0; i < 3; i++) {
    const angle = rotation + (i * 2 * Math.PI) / 3 + Math.PI / 6 + Math.PI;
    vertices2.push({
      x: cx + dynamicRadius * Math.cos(angle),
      y: cy + dynamicRadius * Math.sin(angle)
    });
  }

  const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';

  if (isWebGL) {
    if (ctx.drawPolygon) {
      ctx.drawPolygon(vertices1, null, strokeColor, thickness);
      ctx.drawPolygon(vertices2, null, strokeColor, thickness);
    }
  } else {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = thickness;

    ctx.beginPath();
    ctx.moveTo(vertices1[0].x, vertices1[0].y);
    for (let i = 1; i < vertices1.length; i++) {
      ctx.lineTo(vertices1[i].x, vertices1[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(vertices2[0].x, vertices2[0].y);
    for (let i = 1; i < vertices2.length; i++) {
      ctx.lineTo(vertices2[i].x, vertices2[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawMetatronsCube(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const rotation = (shapeSettings.rotation * Math.PI) / 180;
  const circleRadius = dynamicRadius / 6;
  const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';

  if (isWebGL) {
    if (typeof ctx.drawCircle === 'function') {
      ctx.drawCircle(cx, cy, circleRadius, strokeColor);
      const innerRadius = circleRadius * 2;
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (i / 6) * Math.PI * 2;
        const x = cx + innerRadius * Math.cos(angle);
        const y = cy + innerRadius * Math.sin(angle);
        ctx.drawCircle(x, y, circleRadius, strokeColor);
      }
      const outerRadius = circleRadius * 4;
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (i / 6) * Math.PI * 2 + (Math.PI / 6);
        const x = cx + outerRadius * Math.cos(angle);
        const y = cy + outerRadius * Math.sin(angle);
        ctx.drawCircle(x, y, circleRadius, strokeColor);
      }
    }
  } else {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = thickness;

    ctx.beginPath();
    ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    const innerRadius = circleRadius * 2;
    for (let i = 0; i < 6; i++) {
      const angle = rotation + (i / 6) * Math.PI * 2;
      const x = cx + innerRadius * Math.cos(angle);
      const y = cy + innerRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    const outerRadius = circleRadius * 4;
    for (let i = 0; i < 6; i++) {
      const angle = rotation + (i / 6) * Math.PI * 2 + (Math.PI / 6);
      const x = cx + outerRadius * Math.cos(angle);
      const y = cy + outerRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

function drawTreeOfLife(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const rotation = (shapeSettings.rotation * Math.PI) / 180;
  const sephirahRadius = dynamicRadius / 12;

  const sephirot = [
    { x: 0, y: -dynamicRadius * 0.8 },
    { x: -dynamicRadius * 0.3, y: -dynamicRadius * 0.5 },
    { x: dynamicRadius * 0.3, y: -dynamicRadius * 0.5 },
    { x: -dynamicRadius * 0.4, y: -dynamicRadius * 0.1 },
    { x: dynamicRadius * 0.4, y: -dynamicRadius * 0.1 },
    { x: 0, y: 0 },
    { x: -dynamicRadius * 0.4, y: dynamicRadius * 0.3 },
    { x: dynamicRadius * 0.4, y: dynamicRadius * 0.3 },
    { x: 0, y: dynamicRadius * 0.5 },
    { x: 0, y: dynamicRadius * 0.8 }
  ];

  const rotatedSephirot = sephirot.map(function(seph) {
    return {
      x: cx + seph.x * Math.cos(rotation) - seph.y * Math.sin(rotation),
      y: cy + seph.x * Math.sin(rotation) + seph.y * Math.cos(rotation)
    };
  });

  const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';

  const paths = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5],
    [5, 6], [5, 7], [5, 8], [6, 7], [6, 8], [7, 8], [8, 9]
  ];

  if (isWebGL) {
    if (typeof ctx.drawCircle === 'function' && typeof ctx.drawLine === 'function') {
      paths.forEach(function(path) {
        const fromSeph = rotatedSephirot[path[0]];
        const toSeph = rotatedSephirot[path[1]];
        ctx.drawLine(fromSeph.x, fromSeph.y, toSeph.x, toSeph.y, strokeColor, thickness * 0.5);
      });
      rotatedSephirot.forEach(function(seph) {
        ctx.drawCircle(seph.x, seph.y, sephirahRadius, strokeColor);
      });
    }
  } else {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = thickness * 0.5;

    paths.forEach(function(path) {
      const fromSeph = rotatedSephirot[path[0]];
      const toSeph = rotatedSephirot[path[1]];
      ctx.beginPath();
      ctx.moveTo(fromSeph.x, fromSeph.y);
      ctx.lineTo(toSeph.x, toSeph.y);
      ctx.stroke();
    });

    ctx.lineWidth = thickness;
    rotatedSephirot.forEach(function(seph) {
      ctx.beginPath();
      ctx.arc(seph.x, seph.y, sephirahRadius, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  ctx.globalAlpha = 1;
}

function drawMandala(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const rotation = (shapeSettings.rotation * Math.PI) / 180;
  const symmetry = shapeSettings.mandalaSymmetry || 8;
  const layers = shapeSettings.mandalaLayers || 4;
  const petalCount = shapeSettings.mandalaPetals || 6;
  const complexity = shapeSettings.mandalaComplexity || 0.5;

  const isWebGL = ctx.isWebGLContext === true || typeof ctx.beginPath !== 'function';

  if (!isWebGL) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = thickness;
  }

  for (let layer = layers; layer >= 1; layer--) {
    const layerRadius = dynamicRadius * (layer / layers);
    const layerOpacity = finalOpacity * (0.6 + 0.4 * (layer / layers));

    if (!isWebGL) {
      ctx.globalAlpha = layerOpacity;
    }

    for (let i = 0; i < symmetry; i++) {
      const baseAngle = rotation + (i * 2 * Math.PI) / symmetry;
      drawGeometricMandalaElement(ctx, cx, cy, layerRadius, baseAngle, layer, petalCount, complexity, isWebGL, strokeColor, thickness);
    }

    if (!isWebGL) {
      ctx.beginPath();
      ctx.arc(cx, cy, layerRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (ctx.drawCircle) {
      ctx.drawCircle(cx, cy, layerRadius, strokeColor);
    }
  }

  const centralSize = dynamicRadius * 0.1;
  if (!isWebGL) {
    ctx.globalAlpha = finalOpacity;
    ctx.beginPath();
    ctx.arc(cx, cy, centralSize, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < symmetry; i++) {
      const angle = rotation + (i * 2 * Math.PI) / symmetry;
      const x1 = cx + centralSize * 0.5 * Math.cos(angle);
      const y1 = cy + centralSize * 0.5 * Math.sin(angle);
      const x2 = cx + centralSize * 1.5 * Math.cos(angle);
      const y2 = cy + centralSize * 1.5 * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  } else if (ctx.drawCircle && ctx.drawLine) {
    ctx.drawCircle(cx, cy, centralSize, strokeColor);
    for (let i = 0; i < symmetry; i++) {
      const angle = rotation + (i * 2 * Math.PI) / symmetry;
      const x1 = cx + centralSize * 0.5 * Math.cos(angle);
      const y1 = cy + centralSize * 0.5 * Math.sin(angle);
      const x2 = cx + centralSize * 1.5 * Math.cos(angle);
      const y2 = cy + centralSize * 1.5 * Math.sin(angle);
      ctx.drawLine(x1, y1, x2, y2, strokeColor, thickness);
    }
  }

  ctx.globalAlpha = 1;
}

function drawGeometricMandalaElement(ctx, cx, cy, radius, angle, layer, petalCount, complexity, isWebGL, strokeColor, thickness) {
  const elementRadius = radius * 0.15;
  const elementX = cx + radius * 0.8 * Math.cos(angle);
  const elementY = cy + radius * 0.8 * Math.sin(angle);

  if (!isWebGL) {
    for (let p = 0; p < petalCount; p++) {
      const petalAngle = angle + (p * 2 * Math.PI) / petalCount;
      const petalRadius = elementRadius * (0.5 + 0.5 * complexity);
      ctx.beginPath();
      ctx.arc(
        elementX + petalRadius * Math.cos(petalAngle),
        elementY + petalRadius * Math.sin(petalAngle),
        elementRadius * 0.3,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    if (complexity > 0.3) {
      for (let p = 0; p < petalCount; p++) {
        const petalAngle = angle + (p * 2 * Math.PI) / petalCount;
        const petalRadius = elementRadius * (0.5 + 0.5 * complexity);
        ctx.beginPath();
        ctx.moveTo(elementX, elementY);
        ctx.lineTo(
          elementX + petalRadius * Math.cos(petalAngle),
          elementY + petalRadius * Math.sin(petalAngle)
        );
        ctx.stroke();
      }
    }
  } else if (ctx.drawCircle && ctx.drawLine) {
    for (let p = 0; p < petalCount; p++) {
      const petalAngle = angle + (p * 2 * Math.PI) / petalCount;
      const petalRadius = elementRadius * (0.5 + 0.5 * complexity);
      ctx.drawCircle(
        elementX + petalRadius * Math.cos(petalAngle),
        elementY + petalRadius * Math.sin(petalAngle),
        elementRadius * 0.3,
        strokeColor
      );
      if (complexity > 0.3) {
        ctx.drawLine(
          elementX, elementY,
          elementX + petalRadius * Math.cos(petalAngle),
          elementY + petalRadius * Math.sin(petalAngle),
          strokeColor, thickness * 0.5
        );
      }
    }
  }
}

function drawCircle(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  if (typeof ctx.beginPath === 'function') {
    drawShapeTemplate(ctx,
      { cx: cx, cy: cy, radius: params.radius, thickness: thickness, strokeColor: strokeColor, dynamicRadius: dynamicRadius },
      ShapeTemplate.CIRCLE,
      true
    );
  } else if (ctx.drawCircle) {
    ctx.drawCircle(cx, cy, dynamicRadius, strokeColor);
  }

  ctx.globalAlpha = 1;
}

function drawStar(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const points = shapeSettings.vertices || 5;
  const innerRadius = shapeSettings.innerRadiusRatio || 0.4;
  const rotation = (shapeSettings.rotation * Math.PI) / 180;

  const vertices = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = rotation + i * Math.PI / points - Math.PI / 2;
    const r = i % 2 === 0 ? dynamicRadius : dynamicRadius * innerRadius;
    vertices.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    });
  }

  if (vertices.length > 0) {
    vertices.push({ x: vertices[0].x, y: vertices[0].y });
  }

  if (typeof ctx.beginPath === 'function') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);

    drawShapeTemplate(ctx,
      { cx: cx, cy: cy, radius: params.radius, thickness: thickness, strokeColor: strokeColor, dynamicRadius: dynamicRadius },
      function(ctx, x, y, r) { return ShapeTemplate.STAR(ctx, x, y, r, points, innerRadius); },
      true
    );

    ctx.restore();
  } else if (ctx.isWebGLContext === true && ctx.drawPolygon) {
    if (vertices && vertices.length > 2) {
      ctx.drawPolygon(vertices, null, strokeColor, thickness);
    }
  }

  ctx.globalAlpha = 1;
}

function drawLissajous(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    strokeColor = getShapeColor(finalOpacity, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
    ctx.globalAlpha = 1;
  }

  const a = shapeSettings.paramA || 3;
  const b = shapeSettings.paramB || 2;
  const delta = shapeSettings.paramDelta || (shapeSettings.rotation * Math.PI) / 180;
  const segments = 100;

  const vertices = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    vertices.push({
      x: cx + dynamicRadius * Math.sin(a * t + delta),
      y: cy + dynamicRadius * Math.sin(b * t)
    });
  }

  if (typeof ctx.beginPath === 'function') {
    drawShapeTemplate(ctx,
      { cx: cx, cy: cy, radius: params.radius, thickness: thickness, strokeColor: strokeColor, dynamicRadius: dynamicRadius },
      function(ctx, x, y, r) { return ShapeTemplate.LISSAJOUS(ctx, x, y, r, a, b, delta, segments); },
      false
    );
  } else if (ctx.isWebGLContext === true && ctx.drawPolygon) {
    if (vertices && vertices.length > 2) {
      ctx.drawPolygon(vertices, null, strokeColor, thickness);
    }
  }

  ctx.globalAlpha = 1;
}

function drawSpiral(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const turns = shapeSettings.turns || 4;
  const spiralType = shapeSettings.spiralType || 'golden';
  const segments = Math.max(100, turns * 50);
  const rotation = (shapeSettings.rotation * Math.PI) / 180;
  const PHI = (1 + Math.sqrt(5)) / 2;

  const vertices = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let angle, r;
    switch (spiralType) {
      case 'golden':
        angle = rotation + t * turns * 2 * Math.PI;
        r = dynamicRadius * Math.pow(PHI, -2 * t * turns) * 0.8;
        break;
      case 'archimedean':
        angle = rotation + t * turns * 2 * Math.PI;
        r = dynamicRadius * (1 - t * 0.85);
        break;
      case 'logarithmic':
        angle = rotation + t * turns * 2 * Math.PI;
        r = dynamicRadius * Math.exp(-0.2 * t * turns) * 0.9;
        break;
      default:
        angle = rotation + t * turns * 2 * Math.PI;
        r = dynamicRadius * Math.pow(PHI, -2 * t * turns) * 0.8;
    }
    vertices.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    });
  }

  const arms = shapeSettings.arms || 1;

  for (let arm = 0; arm < arms; arm++) {
    const armRotation = (arm * 2 * Math.PI) / arms;
    const armVertices = vertices.map(function(v) {
      return {
        x: cx + (v.x - cx) * Math.cos(armRotation) - (v.y - cy) * Math.sin(armRotation),
        y: cy + (v.x - cx) * Math.sin(armRotation) + (v.y - cy) * Math.cos(armRotation)
      };
    });

    if (typeof ctx.beginPath === 'function') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      armVertices.forEach(function(vertex, index) {
        if (index === 0) {
          ctx.moveTo(vertex.x, vertex.y);
        } else {
          ctx.lineTo(vertex.x, vertex.y);
        }
      });
      ctx.stroke();
    } else if (ctx.isWebGLContext === true && ctx.drawPolygon) {
      if (armVertices && armVertices.length > 2) {
        ctx.drawPolygon(armVertices, null, strokeColor, thickness);
      }
    }
  }

  ctx.globalAlpha = 1;
}

function drawHexagon(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const rotation = (shapeSettings.rotation * Math.PI) / 180;

  const vertices = [];
  for (let i = 0; i < 6; i++) {
    const angle = rotation + i * Math.PI / 3;
    vertices.push({
      x: cx + dynamicRadius * Math.cos(angle),
      y: cy + dynamicRadius * Math.sin(angle)
    });
  }
  vertices.push({ x: vertices[0].x, y: vertices[0].y });

  if (typeof ctx.beginPath === 'function') {
    drawShapeTemplate(ctx,
      { cx: cx, cy: cy, radius: params.radius, thickness: thickness, strokeColor: strokeColor, dynamicRadius: dynamicRadius },
      ShapeTemplate.HEXAGON,
      true
    );
  } else if (ctx.drawPolygon) {
    ctx.drawPolygon(vertices, null, strokeColor, thickness);
  }

  ctx.globalAlpha = 1;
}

function drawPentagon(ctx, params) {
  const cx = params.cx;
  const cy = params.cy;
  const thickness = params.thickness;
  const shapeSettings = params.shapeSettings;
  const time = params.time;
  const globalSettings = params.globalSettings;

  const animParams = calculateAnimationParams(time, shapeSettings, globalSettings);
  const dynamicRadius = animParams.dynamicRadius;
  const finalOpacity = animParams.finalOpacity;

  let strokeColor;
  if (globalSettings.colors.gradient.shapes.enabled) {
    strokeColor = getMultiEasedColor(
      time,
      globalSettings.colors.gradient.shapes.colors,
      1,
      globalSettings.colors.gradient.cycleDuration,
      globalSettings.colors.gradient.easing
    );
    ctx.globalAlpha = finalOpacity;
  } else {
    ctx.globalAlpha = finalOpacity;
    strokeColor = getShapeColor(1.0, globalSettings.colors.scheme, ctx, { rendererType: globalSettings.rendererType });
  }

  const rotation = (shapeSettings.rotation * Math.PI) / 180;

  const vertices = [];
  for (let i = 0; i < 5; i++) {
    const angle = rotation + i * Math.PI * 2 / 5 - Math.PI / 2;
    vertices.push({
      x: cx + dynamicRadius * Math.cos(angle),
      y: cy + dynamicRadius * Math.sin(angle)
    });
  }
  vertices.push({ x: vertices[0].x, y: vertices[0].y });

  if (typeof ctx.beginPath === 'function') {
    drawShapeTemplate(ctx,
      { cx: cx, cy: cy, radius: params.radius, thickness: thickness, strokeColor: strokeColor, dynamicRadius: dynamicRadius },
      ShapeTemplate.PENTAGON,
      true
    );
  } else if (ctx.drawPolygon) {
    ctx.drawPolygon(vertices, null, strokeColor, thickness);
  }

  ctx.globalAlpha = 1;
}

// -------------------- SHAPE DRAWERS MAP --------------------

const ShapeDrawers = {
  polygon: drawPolygon,
  flowerOfLife: drawFlowerOfLife,
  merkaba: drawMerkaba,
  metatronsCube: drawMetatronsCube,
  treeOfLife: drawTreeOfLife,
  mandala: drawMandala,
  circle: drawCircle,
  star: drawStar,
  lissajous: drawLissajous,
  spiral: drawSpiral,
  hexagon: drawHexagon,
  pentagon: drawPentagon
};

// -------------------- EXPORTS FOR STANDALONE USE --------------------

if (typeof window !== 'undefined') {
  window.ShapeType = ShapeType;
  window.AnimationMode = AnimationMode;
  window.ShapeTemplate = ShapeTemplate;
  window.ShapeDrawers = ShapeDrawers;
  window.calculateAnimationParams = calculateAnimationParams;
  window.getMultiEasedColor = getMultiEasedColor;
  window.getShapeColor = getShapeColor;
  window.drawPolygon = drawPolygon;
  window.drawFlowerOfLife = drawFlowerOfLife;
  window.drawMerkaba = drawMerkaba;
  window.drawMetatronsCube = drawMetatronsCube;
  window.drawTreeOfLife = drawTreeOfLife;
  window.drawMandala = drawMandala;
  window.drawCircle = drawCircle;
  window.drawStar = drawStar;
  window.drawLissajous = drawLissajous;
  window.drawSpiral = drawSpiral;
  window.drawHexagon = drawHexagon;
  window.drawPentagon = drawPentagon;
}
`;
}

// Export individual components for use in TypeScript/ES6 modules if needed
export const BUNDLED_CONSTANTS = `
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
  CUSTOM_MANDALA: 'customMandala',
  SECONDARY: 'secondary'
};

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
`;
