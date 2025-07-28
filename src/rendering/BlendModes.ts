// src/rendering/BlendModes.ts - Canvas composite operations and custom blend modes

import { BlendMode } from '../types';

/**
 * Blend mode utilities for Canvas2D rendering
 */
export class BlendModes {
  /**
   * Apply blend mode to canvas context
   */
  static applyBlendMode(ctx: CanvasRenderingContext2D, blendMode: BlendMode): void {
    ctx.globalCompositeOperation = blendMode;
  }

  /**
   * Get all available blend modes
   */
  static getAllBlendModes(): BlendMode[] {
    return [
      BlendMode.NORMAL,
      BlendMode.MULTIPLY,
      BlendMode.SCREEN,
      BlendMode.OVERLAY,
      BlendMode.DARKEN,
      BlendMode.LIGHTEN,
      BlendMode.COLOR_DODGE,
      BlendMode.COLOR_BURN,
      BlendMode.HARD_LIGHT,
      BlendMode.SOFT_LIGHT,
      BlendMode.DIFFERENCE,
      BlendMode.EXCLUSION
    ];
  }

  /**
   * Get blend mode description
   */
  static getBlendModeDescription(blendMode: BlendMode): string {
    const descriptions: Record<BlendMode, string> = {
      [BlendMode.NORMAL]: 'Normal - Default blending mode',
      [BlendMode.MULTIPLY]: 'Multiply - Darkens by multiplying colors',
      [BlendMode.SCREEN]: 'Screen - Lightens by inverting, multiplying, and inverting again',
      [BlendMode.OVERLAY]: 'Overlay - Combines multiply and screen based on base color',
      [BlendMode.DARKEN]: 'Darken - Keeps the darker of the two colors',
      [BlendMode.LIGHTEN]: 'Lighten - Keeps the lighter of the two colors',
      [BlendMode.COLOR_DODGE]: 'Color Dodge - Brightens base color to reflect blend color',
      [BlendMode.COLOR_BURN]: 'Color Burn - Darkens base color to reflect blend color',
      [BlendMode.HARD_LIGHT]: 'Hard Light - Combines multiply and screen with 50% threshold',
      [BlendMode.SOFT_LIGHT]: 'Soft Light - Similar to overlay but softer',
      [BlendMode.DIFFERENCE]: 'Difference - Subtracts darker from lighter color',
      [BlendMode.EXCLUSION]: 'Exclusion - Similar to difference but with lower contrast'
    };

    return descriptions[blendMode] || 'Unknown blend mode';
  }

  /**
   * Check if blend mode is supported by browser
   */
  static isBlendModeSupported(blendMode: BlendMode): boolean {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return false;

    try {
      ctx.globalCompositeOperation = blendMode;
      return ctx.globalCompositeOperation === blendMode;
    } catch {
      return false;
    }
  }

  /**
   * Get supported blend modes for current browser
   */
  static getSupportedBlendModes(): BlendMode[] {
    return this.getAllBlendModes().filter(mode => this.isBlendModeSupported(mode));
  }

  /**
   * Custom blend function for RGB values (software implementation)
   */
  static customBlend(
    baseR: number, baseG: number, baseB: number,
    blendR: number, blendG: number, blendB: number,
    blendMode: BlendMode,
    opacity: number = 1
  ): { r: number; g: number; b: number } {
    let resultR: number, resultG: number, resultB: number;

    switch (blendMode) {
      case BlendMode.MULTIPLY:
        resultR = (baseR * blendR) / 255;
        resultG = (baseG * blendG) / 255;
        resultB = (baseB * blendB) / 255;
        break;

      case BlendMode.SCREEN:
        resultR = 255 - ((255 - baseR) * (255 - blendR)) / 255;
        resultG = 255 - ((255 - baseG) * (255 - blendG)) / 255;
        resultB = 255 - ((255 - baseB) * (255 - blendB)) / 255;
        break;

      case BlendMode.OVERLAY:
        resultR = baseR < 128 
          ? (2 * baseR * blendR) / 255
          : 255 - (2 * (255 - baseR) * (255 - blendR)) / 255;
        resultG = baseG < 128 
          ? (2 * baseG * blendG) / 255
          : 255 - (2 * (255 - baseG) * (255 - blendG)) / 255;
        resultB = baseB < 128 
          ? (2 * baseB * blendB) / 255
          : 255 - (2 * (255 - baseB) * (255 - blendB)) / 255;
        break;

      case BlendMode.DARKEN:
        resultR = Math.min(baseR, blendR);
        resultG = Math.min(baseG, blendG);
        resultB = Math.min(baseB, blendB);
        break;

      case BlendMode.LIGHTEN:
        resultR = Math.max(baseR, blendR);
        resultG = Math.max(baseG, blendG);
        resultB = Math.max(baseB, blendB);
        break;

      case BlendMode.COLOR_DODGE:
        resultR = blendR === 255 ? 255 : Math.min(255, (baseR * 255) / (255 - blendR));
        resultG = blendG === 255 ? 255 : Math.min(255, (baseG * 255) / (255 - blendG));
        resultB = blendB === 255 ? 255 : Math.min(255, (baseB * 255) / (255 - blendB));
        break;

      case BlendMode.COLOR_BURN:
        resultR = blendR === 0 ? 0 : Math.max(0, 255 - ((255 - baseR) * 255) / blendR);
        resultG = blendG === 0 ? 0 : Math.max(0, 255 - ((255 - baseG) * 255) / blendG);
        resultB = blendB === 0 ? 0 : Math.max(0, 255 - ((255 - baseB) * 255) / blendB);
        break;

      case BlendMode.HARD_LIGHT:
        resultR = blendR < 128 
          ? (2 * baseR * blendR) / 255
          : 255 - (2 * (255 - baseR) * (255 - blendR)) / 255;
        resultG = blendG < 128 
          ? (2 * baseG * blendG) / 255
          : 255 - (2 * (255 - baseG) * (255 - blendG)) / 255;
        resultB = blendB < 128 
          ? (2 * baseB * blendB) / 255
          : 255 - (2 * (255 - baseB) * (255 - blendB)) / 255;
        break;

      case BlendMode.SOFT_LIGHT:
        resultR = this.softLightBlend(baseR, blendR);
        resultG = this.softLightBlend(baseG, blendG);
        resultB = this.softLightBlend(baseB, blendB);
        break;

      case BlendMode.DIFFERENCE:
        resultR = Math.abs(baseR - blendR);
        resultG = Math.abs(baseG - blendG);
        resultB = Math.abs(baseB - blendB);
        break;

      case BlendMode.EXCLUSION:
        resultR = baseR + blendR - (2 * baseR * blendR) / 255;
        resultG = baseG + blendG - (2 * baseG * blendG) / 255;
        resultB = baseB + blendB - (2 * baseB * blendB) / 255;
        break;

      default: // NORMAL
        resultR = blendR;
        resultG = blendG;
        resultB = blendB;
        break;
    }

    // Apply opacity
    resultR = baseR + (resultR - baseR) * opacity;
    resultG = baseG + (resultG - baseG) * opacity;
    resultB = baseB + (resultB - baseB) * opacity;

    return {
      r: Math.round(Math.max(0, Math.min(255, resultR))),
      g: Math.round(Math.max(0, Math.min(255, resultG))),
      b: Math.round(Math.max(0, Math.min(255, resultB)))
    };
  }

  /**
   * Soft light blend calculation
   */
  private static softLightBlend(base: number, blend: number): number {
    const baseNorm = base / 255;
    const blendNorm = blend / 255;
    
    let result: number;
    
    if (blendNorm <= 0.5) {
      result = baseNorm - (1 - 2 * blendNorm) * baseNorm * (1 - baseNorm);
    } else {
      const d = baseNorm <= 0.25 
        ? ((16 * baseNorm - 12) * baseNorm + 4) * baseNorm
        : Math.sqrt(baseNorm);
      result = baseNorm + (2 * blendNorm - 1) * (d - baseNorm);
    }
    
    return result * 255;
  }

  /**
   * Blend two colors using specified blend mode
   */
  static blendColors(
    baseColor: string,
    blendColor: string,
    blendMode: BlendMode,
    opacity: number = 1
  ): string {
    const baseRgb = this.hexToRgb(baseColor);
    const blendRgb = this.hexToRgb(blendColor);
    
    if (!baseRgb || !blendRgb) return baseColor;
    
    const result = this.customBlend(
      baseRgb.r, baseRgb.g, baseRgb.b,
      blendRgb.r, blendRgb.g, blendRgb.b,
      blendMode,
      opacity
    );
    
    return this.rgbToHex(result.r, result.g, result.b);
  }

  /**
   * Convert hex color to RGB
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
   * Convert RGB to hex color
   */
  private static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Create gradient with blend modes
   */
  static createBlendedGradient(
    ctx: CanvasRenderingContext2D,
    x0: number, y0: number, x1: number, y1: number,
    colorStops: Array<{ offset: number; color: string; blendMode?: BlendMode }>,
    baseColor: string = '#000000'
  ): CanvasGradient {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    
    for (const stop of colorStops) {
      const blendedColor = stop.blendMode 
        ? this.blendColors(baseColor, stop.color, stop.blendMode)
        : stop.color;
      gradient.addColorStop(stop.offset, blendedColor);
    }
    
    return gradient;
  }

  /**
   * Apply multiple blend modes in sequence
   */
  static applyMultipleBlends(
    ctx: CanvasRenderingContext2D,
    renderFunctions: Array<{
      render: () => void;
      blendMode: BlendMode;
      opacity?: number;
    }>
  ): void {
    ctx.save();
    
    for (const { render, blendMode, opacity = 1 } of renderFunctions) {
      ctx.globalCompositeOperation = blendMode;
      ctx.globalAlpha = opacity;
      render();
    }
    
    ctx.restore();
  }

  /**
   * Create a blend mode preview
   */
  static createBlendModePreview(
    canvas: HTMLCanvasElement,
    blendMode: BlendMode,
    baseColor: string = '#ff0000',
    blendColor: string = '#0000ff'
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Apply blend mode and draw blend color
    ctx.globalCompositeOperation = blendMode;
    ctx.fillStyle = blendColor;
    ctx.fillRect(width * 0.25, height * 0.25, width * 0.5, height * 0.5);

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Get blend mode performance rating
   */
  static getBlendModePerformance(blendMode: BlendMode): 'fast' | 'medium' | 'slow' {
    const fastModes = [BlendMode.NORMAL, BlendMode.MULTIPLY, BlendMode.SCREEN];
    const mediumModes = [BlendMode.OVERLAY, BlendMode.DARKEN, BlendMode.LIGHTEN];
    
    if (fastModes.includes(blendMode)) return 'fast';
    if (mediumModes.includes(blendMode)) return 'medium';
    return 'slow';
  }
}

export default BlendModes;