// src/utils/constants.ts - Consolidated constants for Sacred Grid

import { ShapeType, AnimationMode, LineStyleType, TaperType, SineWaveType, BlendMode } from '../types';

// Mathematical Constants
export const GOLDEN_RATIO = 1.618033988749895;
export const PHI = GOLDEN_RATIO;
export const PI = Math.PI;
export const TWO_PI = 2 * Math.PI;
export const HALF_PI = Math.PI / 2;
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

// Sacred Geometry Constants
export const SACRED_RATIOS = {
  GOLDEN: GOLDEN_RATIO,
  SILVER: 1 + Math.sqrt(2),
  BRONZE: (3 + Math.sqrt(13)) / 2,
  VESICA_PISCIS: Math.sqrt(3),
  ROOT_2: Math.sqrt(2),
  ROOT_3: Math.sqrt(3),
  ROOT_5: Math.sqrt(5)
} as const;

// Platonic Solids Vertex Counts
export const PLATONIC_VERTICES = {
  TETRAHEDRON: 4,
  CUBE: 8,
  OCTAHEDRON: 6,
  DODECAHEDRON: 20,
  ICOSAHEDRON: 12
} as const;

// Tree of Life Sephirot
export const SEPHIROT = [
  'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
  'Tiphareth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
] as const;

// Hebrew Letters for Tree of Life Paths
export const HEBREW_LETTERS = [
  'Aleph', 'Beth', 'Gimel', 'Daleth', 'Heh', 'Vav', 'Zayin',
  'Cheth', 'Teth', 'Yod', 'Kaph', 'Lamed', 'Mem', 'Nun',
  'Samekh', 'Ayin', 'Peh', 'Tzaddi', 'Qoph', 'Resh', 'Shin', 'Tav'
] as const;

// Performance Constants
export const PERFORMANCE = {
  TARGET_FPS: 60,
  FRAME_BUDGET_MS: 16.67, // 1000ms / 60fps
  LOW_FPS_THRESHOLD: 30,
  HIGH_MEMORY_THRESHOLD_MB: 100,
  MAX_PARTICLES: 10000,
  MAX_SHAPES: 1000
} as const;

// Canvas Constants
export const CANVAS = {
  DEFAULT_WIDTH: 1920,
  DEFAULT_HEIGHT: 1080,
  MIN_WIDTH: 320,
  MIN_HEIGHT: 240,
  MAX_WIDTH: 7680, // 8K width
  MAX_HEIGHT: 4320, // 8K height
  DEVICE_PIXEL_RATIO: window.devicePixelRatio || 1
} as const;

// Animation Constants
export const ANIMATION = {
  DEFAULT_DURATION: 1000,
  MIN_DURATION: 100,
  MAX_DURATION: 10000,
  DEFAULT_EASING: 'ease-in-out',
  STAGGER_DELAY: 50
} as const;

// Color Constants
export const COLORS = {
  TRANSPARENT: 'rgba(0, 0, 0, 0)',
  BLACK: '#000000',
  WHITE: '#ffffff',
  SACRED_BLUE: '#0077ff',
  SACRED_GOLD: '#ffd700',
  SACRED_PURPLE: '#8a2be2',
  SACRED_GREEN: '#00ff7f'
} as const;

// Default Color Schemes
export const COLOR_SCHEMES = {
  blue: {
    primary: '#0077ff',
    secondary: '#00aaff',
    accent: '#ffffff',
    background: '#000000'
  },
  gold: {
    primary: '#ffd700',
    secondary: '#ffed4e',
    accent: '#ffffff',
    background: '#1a1a1a'
  },
  purple: {
    primary: '#8a2be2',
    secondary: '#9966cc',
    accent: '#ffffff',
    background: '#0a0a0a'
  },
  rainbow: {
    primary: '#ff0000',
    secondary: '#00ff00',
    accent: '#0000ff',
    background: '#000000'
  }
} as const;

// Grid Constants
export const GRID = {
  MIN_SIZE: 2,
  MAX_SIZE: 50,
  DEFAULT_SIZE: 6,
  MIN_SPACING: 20,
  MAX_SPACING: 500,
  DEFAULT_SPACING: 140,
  MIN_DOT_SIZE: 0.5,
  MAX_DOT_SIZE: 20,
  DEFAULT_DOT_SIZE: 2
} as const;

// Shape Constants
export const SHAPE = {
  MIN_SIZE: 10,
  MAX_SIZE: 2000,
  DEFAULT_SIZE: 350,
  MIN_VERTICES: 3,
  MAX_VERTICES: 50,
  MIN_THICKNESS: 0.1,
  MAX_THICKNESS: 50,
  DEFAULT_THICKNESS: 6
} as const;

// Fractal Constants
export const FRACTAL = {
  MIN_DEPTH: 1,
  MAX_DEPTH: 10,
  DEFAULT_DEPTH: 3,
  MIN_SCALE: 0.1,
  MAX_SCALE: 0.9,
  DEFAULT_SCALE: 0.5,
  MIN_CHILD_COUNT: 1,
  MAX_CHILD_COUNT: 20,
  DEFAULT_CHILD_COUNT: 3
} as const;

// Export Constants
export const EXPORT = {
  DEFAULT_QUALITY: 0.9,
  MAX_DIMENSION: 8192,
  SUPPORTED_FORMATS: ['png', 'jpg', 'svg', 'gif', 'webm'] as const,
  DEFAULT_FORMAT: 'png' as const
} as const;

// UI Constants
export const UI = {
  PANEL_WIDTH: 300,
  PANEL_PADDING: 20,
  CONTROL_HEIGHT: 40,
  ANIMATION_DURATION: 300,
  GLASS_BLUR: 10,
  GLASS_OPACITY: 0.1
} as const;

// Physics Constants (for Phase 4)
export const PHYSICS = {
  GRAVITY: 9.81,
  AIR_RESISTANCE: 0.99,
  BOUNCE_DAMPING: 0.8,
  SPRING_STIFFNESS: 0.1,
  SPRING_DAMPING: 0.9,
  MIN_VELOCITY: 0.01
} as const;

// Particle Constants (for Phase 4)
export const PARTICLES = {
  DEFAULT_LIFE: 3000,
  MIN_LIFE: 100,
  MAX_LIFE: 10000,
  DEFAULT_SIZE: 2,
  MIN_SIZE: 0.5,
  MAX_SIZE: 20,
  DEFAULT_EMISSION_RATE: 10,
  MAX_EMISSION_RATE: 1000
} as const;

// Layer Constants (for Phase 5)
export const LAYERS = {
  MAX_LAYERS: 50,
  DEFAULT_OPACITY: 1,
  MIN_OPACITY: 0,
  MAX_OPACITY: 1
} as const;

// Keyboard Shortcuts
export const SHORTCUTS = {
  TOGGLE_CONTROLS: ' ', // Spacebar
  EXPORT_IMAGE: 'e',
  RESET_VIEW: 'r',
  TOGGLE_FULLSCREEN: 'f',
  TOGGLE_PERFORMANCE: 'p',
  SAVE_PRESET: 's',
  LOAD_PRESET: 'l'
} as const;

// Error Messages
export const ERRORS = {
  CANVAS_NOT_SUPPORTED: 'Canvas 2D is not supported in this browser',
  WEBGL_NOT_SUPPORTED: 'WebGL is not supported in this browser',
  EXPORT_FAILED: 'Failed to export image',
  PRESET_LOAD_FAILED: 'Failed to load preset',
  PRESET_SAVE_FAILED: 'Failed to save preset',
  PERFORMANCE_WARNING: 'Performance warning: Consider reducing complexity'
} as const;

// Feature Flags (for progressive enhancement)
export const FEATURES = {
  ENABLE_WEBGL: false, // Future WebGL support
  ENABLE_WEBWORKERS: true,
  ENABLE_OFFSCREEN_CANVAS: 'OffscreenCanvas' in window,
  ENABLE_PERFORMANCE_OBSERVER: 'PerformanceObserver' in window,
  ENABLE_INTERSECTION_OBSERVER: 'IntersectionObserver' in window
} as const;

// Re-export enums for convenience
export {
  ShapeType,
  AnimationMode,
  LineStyleType,
  TaperType,
  SineWaveType,
  BlendMode
};

// Default Settings Template
export const DEFAULT_SETTINGS = {
  grid: {
    size: GRID.DEFAULT_SIZE,
    spacing: GRID.DEFAULT_SPACING,
    baseDotSize: GRID.DEFAULT_DOT_SIZE,
    connectionOpacity: 0.15,
    noiseIntensity: 1,
    lineWidthMultiplier: 1,
    breathingSpeed: 0.0008,
    breathingIntensity: 0.2,
    showVertices: true,
    useLineFactorySettings: false
  },
  mouse: {
    influenceRadius: 200,
    maxScale: 2,
    position: { x: 0, y: 0 }
  },
  colors: {
    background: COLORS.BLACK,
    scheme: 'blue',
    lineColor: COLORS.SACRED_BLUE,
    gradient: {
      lines: { enabled: false, colors: ['#ff0000', '#00ff00', '#0000ff'] },
      dots: { enabled: false, colors: ['#ff00ff', '#00ffff', '#ffff00'] },
      shapes: { enabled: false, colors: ['#ffffff', '#aaaaaa', '#000000'] },
      easing: 'linear',
      cycleDuration: 6000
    }
  },
  animation: {
    speed: 1
  },
  shapes: {
    primary: {
      type: ShapeType.POLYGON,
      size: SHAPE.DEFAULT_SIZE,
      opacity: 1.0,
      thickness: SHAPE.DEFAULT_THICKNESS,
      vertices: 3,
      rotation: 0,
      position: { x: 0, y: 0 },
      useLineFactory: false,
      fractal: {
        depth: FRACTAL.DEFAULT_DEPTH,
        scale: FRACTAL.DEFAULT_SCALE,
        thicknessFalloff: 0.8,
        childCount: FRACTAL.DEFAULT_CHILD_COUNT,
        sacredPositioning: true,
        sacredIntensity: 0.5
      },
      animation: {
        mode: AnimationMode.GROW,
        reverse: false,
        speed: 0.0008,
        intensity: 0.2,
        fadeIn: 0.2,
        fadeOut: 0.2,
        variableTiming: true,
        staggerDelay: 100
      },
      stacking: {
        enabled: true,
        count: 3,
        timeOffset: -3000,
        interval: 1000
      }
    }
  }
} as const;