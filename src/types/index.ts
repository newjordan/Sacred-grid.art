// src/types/index.ts - Core TypeScript definitions for Sacred Grid

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D extends Vector2D {
  z: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface ColorHSL {
  h: number;
  s: number;
  l: number;
  a?: number;
}

// Shape Types
export interface ShapeConfig {
  type: ShapeType;
  size: number;
  opacity: number;
  thickness: number;
  vertices?: number;
  rotation: number;
  position: Vector2D;
  useLineFactory: boolean;
  fractal: FractalConfig;
  animation: AnimationConfig;
  stacking: StackingConfig;
}

export interface FractalConfig {
  depth: number;
  scale: number;
  thicknessFalloff: number;
  childCount: number;
  sacredPositioning: boolean;
  sacredIntensity: number;
}

export interface AnimationConfig {
  mode: AnimationMode;
  reverse: boolean;
  speed: number;
  intensity: number;
  fadeIn: number;
  fadeOut: number;
  variableTiming: boolean;
  staggerDelay: number;
}

export interface StackingConfig {
  enabled: boolean;
  count: number;
  timeOffset: number;
  interval: number;
}

// Grid Configuration
export interface GridConfig {
  size: number;
  spacing: number;
  baseDotSize: number;
  connectionOpacity: number;
  noiseIntensity: number;
  lineWidthMultiplier: number;
  breathingSpeed: number;
  breathingIntensity: number;
  showVertices: boolean;
  useLineFactorySettings: boolean;
}

// Mouse Interaction
export interface MouseConfig {
  influenceRadius: number;
  maxScale: number;
  position: Vector2D;
}

// Color System
export interface GradientConfig {
  enabled: boolean;
  colors: string[];
}

export interface ColorConfig {
  background: string;
  scheme: string;
  lineColor: string;
  gradient: {
    lines: GradientConfig;
    dots: GradientConfig;
    shapes: GradientConfig;
    easing: string;
    cycleDuration: number;
  };
}

// Line Factory
export interface TaperConfig {
  type: TaperType;
  startWidth: number;
  endWidth: number;
}

export interface GlowConfig {
  intensity: number;
  color: string;
}

export interface OutlineConfig {
  enabled: boolean;
  color: string;
  width: number;
}

export interface DashConfig {
  pattern: number[];
  offset: number;
}

export interface SineWaveConfig {
  type: SineWaveType;
  amplitude: number;
  frequency: number;
  phase: number;
}

export interface LineFactoryConfig {
  style: LineStyleType;
  taper: TaperConfig;
  glow: GlowConfig;
  outline: OutlineConfig;
  dash: DashConfig;
  sineWave: SineWaveConfig;
  loopLine: boolean;
  bidirectionalWaves: boolean;
}

// XY Grid
export interface XYGridConfig {
  show: boolean;
  size: number;
  spacing: number;
  opacity: number;
  lineWidth: number;
  color: string;
  showLabels: boolean;
}

// Complete Settings Interface
export interface SacredGridSettings {
  grid: GridConfig;
  mouse: MouseConfig;
  colors: ColorConfig;
  animation: {
    speed: number;
  };
  xyGrid: XYGridConfig;
  lineFactory: LineFactoryConfig;
  shapes: {
    primary: ShapeConfig;
    secondary: ShapeConfig & { enabled: boolean };
  };
}

// Performance Monitoring
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  particleCount: number;
  shapeCount: number;
}

// Enums (matching existing constants)
export enum ShapeType {
  POLYGON = 'polygon',
  FLOWER_OF_LIFE = 'flowerOfLife',
  MERKABA = 'merkaba',
  CIRCLE = 'circle',
  SPIRAL = 'spiral',
  STAR = 'star',
  LISSAJOUS = 'lissajous',
  HEXAGON = 'hexagon',
  PENTAGON = 'pentagon',
  SECONDARY = 'secondary',
  // New additions for Phase 3
  METATRONS_CUBE = 'metatronsCube',
  TREE_OF_LIFE = 'treeOfLife',
  FIBONACCI_SPIRAL = 'fibonacciSpiral',
  GOLDEN_RECTANGLE = 'goldenRectangle',
  PLATONIC_TETRAHEDRON = 'platonicTetrahedron',
  PLATONIC_CUBE = 'platonicCube',
  PLATONIC_OCTAHEDRON = 'platonicOctahedron',
  PLATONIC_DODECAHEDRON = 'platonicDodecahedron',
  PLATONIC_ICOSAHEDRON = 'platonicIcosahedron',
  MANDALA = 'mandala'
}

export enum AnimationMode {
  GROW = 'grow',
  PULSE = 'pulse',
  ORBIT = 'orbit',
  WAVEFORM = 'waveform',
  SPIRAL = 'spiral',
  HARMONIC = 'harmonic',
  SWARM = 'swarm',
  BREATHE = 'breathe'
}

export enum LineStyleType {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  WAVY = 'wavy',
  ZIGZAG = 'zigzag',
  SPIRAL = 'spiral',
  RIBBON = 'ribbon',
  DOUBLE = 'double',
  COMPLEX = 'complex'
}

export enum TaperType {
  NONE = 'none',
  START = 'start',
  END = 'end',
  BOTH = 'both',
  MIDDLE = 'middle'
}

export enum SineWaveType {
  NONE = 'none',
  SINE = 'sine',
  COSINE = 'cosine',
  TANGENT = 'tangent'
}

// Renderer Types
export enum RendererType {
  CANVAS_2D = 'canvas2d'
}

// Export/Import Types
export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'gif' | 'webm';
  quality: number;
  width: number;
  height: number;
  transparent: boolean;
}

// Layer System (Phase 5)
export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  zIndex: number;
  locked: boolean;
}

export enum BlendMode {
  NORMAL = 'source-over',
  MULTIPLY = 'multiply',
  SCREEN = 'screen',
  OVERLAY = 'overlay',
  DARKEN = 'darken',
  LIGHTEN = 'lighten',
  COLOR_DODGE = 'color-dodge',
  COLOR_BURN = 'color-burn',
  HARD_LIGHT = 'hard-light',
  SOFT_LIGHT = 'soft-light',
  DIFFERENCE = 'difference',
  EXCLUSION = 'exclusion'
}

// Particle System (Phase 4)
export interface ParticleConfig {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  life: number;
  maxLife: number;
  size: number;
  color: Color;
  opacity: number;
}

export interface EmitterConfig {
  position: Vector2D;
  rate: number;
  maxParticles: number;
  particleLife: number;
  initialVelocity: Vector2D;
  velocityVariation: Vector2D;
  size: number;
  sizeVariation: number;
}