// src/math/Interpolation.ts - Easing and morphing calculations

import { Vector2D } from '../types';

/**
 * Easing function types
 */
export type EasingFunction = (t: number) => number;

/**
 * Easing functions for smooth animations
 */
export class Easing {
  // Linear
  static linear: EasingFunction = (t: number) => t;

  // Quadratic
  static easeInQuad: EasingFunction = (t: number) => t * t;
  static easeOutQuad: EasingFunction = (t: number) => t * (2 - t);
  static easeInOutQuad: EasingFunction = (t: number) => 
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // Cubic
  static easeInCubic: EasingFunction = (t: number) => t * t * t;
  static easeOutCubic: EasingFunction = (t: number) => (--t) * t * t + 1;
  static easeInOutCubic: EasingFunction = (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  // Quartic
  static easeInQuart: EasingFunction = (t: number) => t * t * t * t;
  static easeOutQuart: EasingFunction = (t: number) => 1 - (--t) * t * t * t;
  static easeInOutQuart: EasingFunction = (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;

  // Quintic
  static easeInQuint: EasingFunction = (t: number) => t * t * t * t * t;
  static easeOutQuint: EasingFunction = (t: number) => 1 + (--t) * t * t * t * t;
  static easeInOutQuint: EasingFunction = (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;

  // Sine
  static easeInSine: EasingFunction = (t: number) => 1 - Math.cos(t * Math.PI / 2);
  static easeOutSine: EasingFunction = (t: number) => Math.sin(t * Math.PI / 2);
  static easeInOutSine: EasingFunction = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

  // Exponential
  static easeInExpo: EasingFunction = (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
  static easeOutExpo: EasingFunction = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  static easeInOutExpo: EasingFunction = (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  };

  // Circular
  static easeInCirc: EasingFunction = (t: number) => 1 - Math.sqrt(1 - t * t);
  static easeOutCirc: EasingFunction = (t: number) => Math.sqrt(1 - (t - 1) * (t - 1));
  static easeInOutCirc: EasingFunction = (t: number) =>
    t < 0.5
      ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
      : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;

  // Back
  static easeInBack: EasingFunction = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  };

  static easeOutBack: EasingFunction = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  static easeInOutBack: EasingFunction = (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  };

  // Elastic
  static easeInElastic: EasingFunction = (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  };

  static easeOutElastic: EasingFunction = (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  };

  static easeInOutElastic: EasingFunction = (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  };

  // Bounce
  static easeInBounce: EasingFunction = (t: number) => 1 - Easing.easeOutBounce(1 - t);

  static easeOutBounce: EasingFunction = (t: number) => {
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
  };

  static easeInOutBounce: EasingFunction = (t: number) =>
    t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2;

  /**
   * Get easing function by name
   */
  static getEasing(name: string): EasingFunction {
    const easingMap: { [key: string]: EasingFunction } = {
      linear: Easing.linear,
      easeInQuad: Easing.easeInQuad,
      easeOutQuad: Easing.easeOutQuad,
      easeInOutQuad: Easing.easeInOutQuad,
      easeInCubic: Easing.easeInCubic,
      easeOutCubic: Easing.easeOutCubic,
      easeInOutCubic: Easing.easeInOutCubic,
      easeInQuart: Easing.easeInQuart,
      easeOutQuart: Easing.easeOutQuart,
      easeInOutQuart: Easing.easeInOutQuart,
      easeInQuint: Easing.easeInQuint,
      easeOutQuint: Easing.easeOutQuint,
      easeInOutQuint: Easing.easeInOutQuint,
      easeInSine: Easing.easeInSine,
      easeOutSine: Easing.easeOutSine,
      easeInOutSine: Easing.easeInOutSine,
      easeInExpo: Easing.easeInExpo,
      easeOutExpo: Easing.easeOutExpo,
      easeInOutExpo: Easing.easeInOutExpo,
      easeInCirc: Easing.easeInCirc,
      easeOutCirc: Easing.easeOutCirc,
      easeInOutCirc: Easing.easeInOutCirc,
      easeInBack: Easing.easeInBack,
      easeOutBack: Easing.easeOutBack,
      easeInOutBack: Easing.easeInOutBack,
      easeInElastic: Easing.easeInElastic,
      easeOutElastic: Easing.easeOutElastic,
      easeInOutElastic: Easing.easeInOutElastic,
      easeInBounce: Easing.easeInBounce,
      easeOutBounce: Easing.easeOutBounce,
      easeInOutBounce: Easing.easeInOutBounce
    };

    return easingMap[name] || Easing.linear;
  }

  /**
   * Create custom cubic bezier easing
   */
  static cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
    return (t: number) => {
      // Simplified cubic bezier calculation
      // For more accuracy, use a proper bezier solver
      const cx = 3 * x1;
      const bx = 3 * (x2 - x1) - cx;
      const ax = 1 - cx - bx;
      
      const cy = 3 * y1;
      const by = 3 * (y2 - y1) - cy;
      const ay = 1 - cy - by;
      
      const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
      const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
      
      // Binary search to find t for given x
      let t0 = 0;
      let t1 = 1;
      let t2 = t;
      
      for (let i = 0; i < 8; i++) {
        const x = sampleCurveX(t2) - t;
        if (Math.abs(x) < 0.000001) break;
        
        if (x > 0) {
          t1 = t2;
        } else {
          t0 = t2;
        }
        t2 = (t1 + t0) / 2;
      }
      
      return sampleCurveY(t2);
    };
  }
}

/**
 * Interpolation utilities
 */
export class Interpolation {
  /**
   * Linear interpolation between two values
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Interpolate between two 2D points
   */
  static lerpVector2D(a: Vector2D, b: Vector2D, t: number): Vector2D {
    return {
      x: this.lerp(a.x, b.x, t),
      y: this.lerp(a.y, b.y, t)
    };
  }

  /**
   * Smooth step interpolation
   */
  static smoothStep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /**
   * Smoother step interpolation
   */
  static smootherStep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * Catmull-Rom spline interpolation
   */
  static catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  }

  /**
   * Hermite interpolation
   */
  static hermite(p0: number, p1: number, t0: number, t1: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    
    return h00 * p0 + h10 * t0 + h01 * p1 + h11 * t1;
  }

  /**
   * Bezier curve interpolation
   */
  static bezier(points: number[], t: number): number {
    const n = points.length - 1;
    let result = 0;
    
    for (let i = 0; i <= n; i++) {
      const binomial = this.binomialCoefficient(n, i);
      const term = binomial * Math.pow(1 - t, n - i) * Math.pow(t, i) * points[i];
      result += term;
    }
    
    return result;
  }

  /**
   * Calculate binomial coefficient
   */
  static binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    
    return result;
  }

  /**
   * Interpolate between multiple values using weights
   */
  static weightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length) {
      throw new Error('Values and weights arrays must have the same length');
    }
    
    let sum = 0;
    let weightSum = 0;
    
    for (let i = 0; i < values.length; i++) {
      sum += values[i] * weights[i];
      weightSum += weights[i];
    }
    
    return weightSum === 0 ? 0 : sum / weightSum;
  }

  /**
   * Interpolate color values
   */
  static lerpColor(color1: string, color2: string, t: number): string {
    // Convert hex colors to RGB
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(this.lerp(rgb1.r, rgb2.r, t));
    const g = Math.round(this.lerp(rgb1.g, rgb2.g, t));
    const b = Math.round(this.lerp(rgb1.b, rgb2.b, t));
    
    return this.rgbToHex(r, g, b);
  }

  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to hex color
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Animate a value over time with easing
   */
  static animate(
    startValue: number,
    endValue: number,
    duration: number,
    easingFunction: EasingFunction = Easing.linear
  ): (currentTime: number) => number {
    return (currentTime: number) => {
      const t = Math.max(0, Math.min(1, currentTime / duration));
      const easedT = easingFunction(t);
      return this.lerp(startValue, endValue, easedT);
    };
  }
}

export default { Easing, Interpolation };