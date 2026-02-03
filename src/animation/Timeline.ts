// src/animation/Timeline.ts - Keyframe animation system

import { Vector2D } from '../types';

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Keyframe data structure
 */
export interface Keyframe<T = any> {
  time: number;
  value: T;
  easing?: EasingFunction;
  id?: string;
}

/**
 * Animation track for a specific property
 */
export interface AnimationTrack<T = any> {
  property: string;
  keyframes: Keyframe<T>[];
  interpolate: (from: T, to: T, t: number) => T;
}

/**
 * Timeline configuration
 */
export interface TimelineConfig {
  duration: number;
  loop: boolean;
  autoPlay: boolean;
  playbackRate: number;
}

/**
 * Timeline playback state
 */
export type TimelineState = 'playing' | 'paused' | 'stopped';

/**
 * Timeline event types
 */
export interface TimelineEvents {
  play: () => void;
  pause: () => void;
  stop: () => void;
  complete: () => void;
  loop: () => void;
  update: (time: number, progress: number) => void;
}

/**
 * Keyframe animation timeline system
 */
export class Timeline {
  private tracks: Map<string, AnimationTrack> = new Map();
  private config: TimelineConfig;
  private currentTime: number = 0;
  private state: TimelineState = 'stopped';
  private startTime: number = 0;
  private pauseTime: number = 0;
  private eventListeners: Partial<TimelineEvents> = {};

  constructor(config: Partial<TimelineConfig> = {}) {
    this.config = {
      duration: 1000, // 1 second default
      loop: false,
      autoPlay: false,
      playbackRate: 1,
      ...config
    };

    if (this.config.autoPlay) {
      this.play();
    }
  }

  /**
   * Add an animation track
   */
  addTrack<T>(
    trackId: string,
    property: string,
    keyframes: Keyframe<T>[],
    interpolate: (from: T, to: T, t: number) => T
  ): void {
    // Sort keyframes by time
    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

    this.tracks.set(trackId, {
      property,
      keyframes: sortedKeyframes,
      interpolate
    });
  }

  /**
   * Remove an animation track
   */
  removeTrack(trackId: string): boolean {
    return this.tracks.delete(trackId);
  }

  /**
   * Add a keyframe to an existing track
   */
  addKeyframe<T>(trackId: string, keyframe: Keyframe<T>): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    track.keyframes.push(keyframe);
    track.keyframes.sort((a, b) => a.time - b.time);
    return true;
  }

  /**
   * Remove a keyframe from a track
   */
  removeKeyframe(trackId: string, keyframeId: string): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    const index = track.keyframes.findIndex(kf => kf.id === keyframeId);
    if (index === -1) return false;

    track.keyframes.splice(index, 1);
    return true;
  }

  /**
   * Play the timeline
   */
  play(): void {
    if (this.state === 'playing') return;

    const wasPaused = this.state === 'paused';
    this.state = 'playing';

    if (wasPaused) {
      this.startTime = performance.now() - this.pauseTime;
    } else {
      this.startTime = performance.now() - this.currentTime;
    }

    this.eventListeners.play?.();
    this.animate();
  }

  /**
   * Pause the timeline
   */
  pause(): void {
    if (this.state !== 'playing') return;

    this.state = 'paused';
    this.pauseTime = this.currentTime;
    this.eventListeners.pause?.();
  }

  /**
   * Stop the timeline
   */
  stop(): void {
    this.state = 'stopped';
    this.currentTime = 0;
    this.startTime = 0;
    this.pauseTime = 0;
    this.eventListeners.stop?.();
  }

  /**
   * Seek to a specific time
   */
  seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.config.duration));
    this.startTime = performance.now() - this.currentTime;
    
    if (this.state === 'playing') {
      this.update();
    }
  }

  /**
   * Animation loop
   */
  private animate(): void {
    if (this.state !== 'playing') return;

    const now = performance.now();
    this.currentTime = (now - this.startTime) * this.config.playbackRate;

    // Check if animation is complete
    if (this.currentTime >= this.config.duration) {
      if (this.config.loop) {
        this.currentTime = 0;
        this.startTime = now;
        this.eventListeners.loop?.();
      } else {
        this.currentTime = this.config.duration;
        this.state = 'stopped';
        this.eventListeners.complete?.();
        return;
      }
    }

    this.update();
    requestAnimationFrame(() => this.animate());
  }

  /**
   * Update animation values
   */
  private update(): void {
    const progress = this.currentTime / this.config.duration;
    this.eventListeners.update?.(this.currentTime, progress);
  }

  /**
   * Get animated value for a track at current time
   */
  getValue<T>(trackId: string): T | null {
    const track = this.tracks.get(trackId);
    if (!track || track.keyframes.length === 0) return null;

    const keyframes = track.keyframes;
    
    // If before first keyframe
    if (this.currentTime <= keyframes[0].time) {
      return keyframes[0].value;
    }

    // If after last keyframe
    if (this.currentTime >= keyframes[keyframes.length - 1].time) {
      return keyframes[keyframes.length - 1].value;
    }

    // Find surrounding keyframes
    let fromIndex = 0;
    let toIndex = 1;

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (this.currentTime >= keyframes[i].time && 
          this.currentTime <= keyframes[i + 1].time) {
        fromIndex = i;
        toIndex = i + 1;
        break;
      }
    }

    const fromKeyframe = keyframes[fromIndex];
    const toKeyframe = keyframes[toIndex];

    // Calculate interpolation factor
    const duration = toKeyframe.time - fromKeyframe.time;
    const elapsed = this.currentTime - fromKeyframe.time;
    let t = duration > 0 ? elapsed / duration : 0;

    // Apply easing function
    if (fromKeyframe.easing) {
      t = fromKeyframe.easing(t);
    }

    // Interpolate between values
    return track.interpolate(fromKeyframe.value, toKeyframe.value, t);
  }

  /**
   * Get all animated values at current time
   */
  getAllValues(): Record<string, any> {
    const values: Record<string, any> = {};
    
    this.tracks.forEach((track, trackId) => {
      values[track.property] = this.getValue(trackId);
    });

    return values;
  }

  /**
   * Set timeline duration
   */
  setDuration(duration: number): void {
    this.config.duration = duration;
  }

  /**
   * Set playback rate
   */
  setPlaybackRate(rate: number): void {
    this.config.playbackRate = rate;
  }

  /**
   * Set loop mode
   */
  setLoop(loop: boolean): void {
    this.config.loop = loop;
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Get progress (0-1)
   */
  getProgress(): number {
    return this.currentTime / this.config.duration;
  }

  /**
   * Get timeline state
   */
  getState(): TimelineState {
    return this.state;
  }

  /**
   * Get timeline duration
   */
  getDuration(): number {
    return this.config.duration;
  }

  /**
   * Add event listener
   */
  on<K extends keyof TimelineEvents>(event: K, listener: TimelineEvents[K]): void {
    this.eventListeners[event] = listener;
  }

  /**
   * Remove event listener
   */
  off<K extends keyof TimelineEvents>(event: K): void {
    delete this.eventListeners[event];
  }

  /**
   * Clear all tracks
   */
  clear(): void {
    this.tracks.clear();
  }

  /**
   * Get track count
   */
  getTrackCount(): number {
    return this.tracks.size;
  }

  /**
   * Get track IDs
   */
  getTrackIds(): string[] {
    return Array.from(this.tracks.keys());
  }
}

/**
 * Common interpolation functions
 */
export class Interpolators {
  /**
   * Linear interpolation for numbers
   */
  static number(from: number, to: number, t: number): number {
    return from + (to - from) * t;
  }

  /**
   * Linear interpolation for Vector2D
   */
  static vector2D(from: Vector2D, to: Vector2D, t: number): Vector2D {
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t
    };
  }

  /**
   * Color interpolation (hex colors)
   */
  static color(from: string, to: string, t: number): string {
    const fromRgb = this.hexToRgb(from);
    const toRgb = this.hexToRgb(to);
    
    if (!fromRgb || !toRgb) return from;

    const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * t);
    const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * t);
    const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * t);

    return this.rgbToHex(r, g, b);
  }

  /**
   * Array interpolation (for paths, etc.)
   */
  static array<T>(
    from: T[],
    to: T[],
    t: number,
    itemInterpolator: (from: T, to: T, t: number) => T
  ): T[] {
    const maxLength = Math.max(from.length, to.length);
    const result: T[] = [];

    for (let i = 0; i < maxLength; i++) {
      const fromItem = from[i] || from[from.length - 1];
      const toItem = to[i] || to[to.length - 1];
      result.push(itemInterpolator(fromItem, toItem, t));
    }

    return result;
  }

  /**
   * Helper: Convert hex to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Helper: Convert RGB to hex
   */
  private static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

/**
 * Common easing functions
 */
export class Easing {
  static linear(t: number): number {
    return t;
  }

  static easeInQuad(t: number): number {
    return t * t;
  }

  static easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeInCubic(t: number): number {
    return t * t * t;
  }

  static easeOutCubic(t: number): number {
    return (--t) * t * t + 1;
  }

  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  static easeInSine(t: number): number {
    return 1 - Math.cos(t * Math.PI / 2);
  }

  static easeOutSine(t: number): number {
    return Math.sin(t * Math.PI / 2);
  }

  static easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  static easeInElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  }

  static easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  static easeInBounce(t: number): number {
    return 1 - this.easeOutBounce(1 - t);
  }

  static easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
}

/**
 * Timeline builder for easier timeline creation
 */
export class TimelineBuilder {
  private timeline: Timeline;

  constructor(config?: Partial<TimelineConfig>) {
    this.timeline = new Timeline(config);
  }

  /**
   * Add a number animation track
   */
  animateNumber(
    trackId: string,
    property: string,
    keyframes: Array<{ time: number; value: number; easing?: EasingFunction }>
  ): TimelineBuilder {
    this.timeline.addTrack(trackId, property, keyframes, Interpolators.number);
    return this;
  }

  /**
   * Add a vector animation track
   */
  animateVector(
    trackId: string,
    property: string,
    keyframes: Array<{ time: number; value: Vector2D; easing?: EasingFunction }>
  ): TimelineBuilder {
    this.timeline.addTrack(trackId, property, keyframes, Interpolators.vector2D);
    return this;
  }

  /**
   * Add a color animation track
   */
  animateColor(
    trackId: string,
    property: string,
    keyframes: Array<{ time: number; value: string; easing?: EasingFunction }>
  ): TimelineBuilder {
    this.timeline.addTrack(trackId, property, keyframes, Interpolators.color);
    return this;
  }

  /**
   * Build and return the timeline
   */
  build(): Timeline {
    return this.timeline;
  }
}