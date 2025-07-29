// src/rendering/PathRenderer.ts - Path-specific rendering for Tree of Life

import { Vector2D } from '../types';
import CanvasRenderer from './CanvasRenderer';
import { PathVisualization } from '../shapes/KabbalahPaths';

export interface PathRenderOptions {
  showPaths: boolean;
  showHebrewLetters: boolean;
  showTarotCards: boolean;
  animateFlow: boolean;
  glowEffect: boolean;
  pathOpacity: number;
  letterSize: number;
  flowSpeed: number;
  colorMode: 'traditional' | 'rainbow' | 'energy';
}

/**
 * Specialized renderer for Kabbalistic paths with Hebrew letters and energy flow
 */
export class PathRenderer {
  private renderer: CanvasRenderer;
  private animationTime: number = 0;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
  }

  /**
   * Render all paths with Hebrew letters and energy flow
   */
  renderPaths(
    pathVisualizations: PathVisualization[],
    options: PathRenderOptions,
    time: number = 0
  ): void {
    this.animationTime = time;

    if (!options.showPaths) return;

    this.renderer.save();

    // Render paths in order of importance
    const sortedPaths = this.sortPathsByImportance(pathVisualizations);

    // Render path lines first
    sortedPaths.forEach(viz => {
      this.renderPathLine(viz, options);
    });

    // Render energy flow animation
    if (options.animateFlow) {
      sortedPaths.forEach(viz => {
        this.renderEnergyFlow(viz, options);
      });
    }

    // Render Hebrew letters
    if (options.showHebrewLetters) {
      sortedPaths.forEach(viz => {
        this.renderHebrewLetter(viz, options);
      });
    }

    // Render Tarot correspondences
    if (options.showTarotCards) {
      sortedPaths.forEach(viz => {
        this.renderTarotSymbol(viz, options);
      });
    }

    this.renderer.restore();
  }

  /**
   * Render individual path line with curves
   */
  private renderPathLine(viz: PathVisualization, options: PathRenderOptions): void {
    const ctx = this.renderer.getContext();
    
    // Set path properties
    ctx.globalAlpha = viz.opacity * options.pathOpacity;
    ctx.lineWidth = viz.width;
    ctx.strokeStyle = this.getPathColor(viz, options);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Apply glow effect
    if (options.glowEffect && viz.glowIntensity > 0) {
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = viz.glowIntensity;
    }

    // Draw curved path
 