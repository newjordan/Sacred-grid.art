// src/export/WallpaperRenderer.ts
// Complete self-contained renderer for wallpaper/standalone exports
// This combines all bundled components into a single renderer

import { getBundledShapeDrawers } from './BundledShapeDrawers';
import { getBundledCanvas2DRenderer } from './BundledCanvas2DRenderer';
import { getBundledSacredGridRenderer } from './BundledSacredGridRenderer';

/**
 * Generate the bundled renderer classes (no initialization)
 * This produces the class definitions needed for rendering
 */
export function getBundledRendererClasses(): string {
  return `
// ============================================
// SACRED GRID RENDERER - BUNDLED CLASSES
// Complete Self-Contained Rendering Engine
// ============================================

${getBundledShapeDrawers()}

${getBundledCanvas2DRenderer()}

${getBundledSacredGridRenderer()}
`;
}

/**
 * Generate initialization code for the renderer
 * Handles both wallpaper and standalone modes based on EXPORT_CONFIG
 */
export function generateRendererInit(): string {
  return `
// ============================================
// SACRED GRID INITIALIZATION
// ============================================

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('sacred-grid-canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    var container = canvas.parentElement;
    var snapshot = window.SACRED_GRID_SNAPSHOT;
    var config = window.EXPORT_CONFIG;

    if (!snapshot || !snapshot.settings) {
      console.error('Snapshot not found or invalid');
      return;
    }

    var settings = snapshot.settings;

    // Disable mouse interaction if configured
    if (config.wallpaperMode || config.disableMouseInteraction) {
      settings.mouse = settings.mouse || {};
      settings.mouse.influenceRadius = 0;
      settings.mouse.maxScale = 1;
    }

    var animationSpeed = config.animationSpeed || 1;

    // Create the renderer
    var renderer = new SacredGridRenderer(container, settings);

    // Override the time calculation to apply speed modifier
    renderer.startAnimation = function() {
      var startTime = performance.now();
      var self = this;

      function animate() {
        self.time = (performance.now() - startTime) * 0.001 * animationSpeed;
        self.drawFrame();
        self.animationFrame = requestAnimationFrame(animate);
      }

      animate();
    };

    // Initialize and start
    renderer.initialize();

    // Handle window resize for fullscreen wallpaper
    if (config.wallpaperMode) {
      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (renderer.renderer) {
          renderer.renderer.width = window.innerWidth;
          renderer.renderer.height = window.innerHeight;
        }
        renderer.generateGridPoints();
      }

      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
    }

    // Wire up controls if present (standalone mode)
    var playPauseBtn = document.getElementById('play-pause-btn');
    var resetBtn = document.getElementById('reset-btn');
    var fullscreenBtn = document.getElementById('fullscreen-btn');

    var isPlaying = true;

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', function() {
        isPlaying = !isPlaying;
        if (isPlaying) {
          renderer.startAnimation();
          playPauseBtn.textContent = '⏸️';
        } else {
          if (renderer.animationFrame) {
            cancelAnimationFrame(renderer.animationFrame);
          }
          playPauseBtn.textContent = '▶️';
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        renderer.initialize();
      });
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        if (playPauseBtn) playPauseBtn.click();
      } else if (e.code === 'KeyF') {
        if (fullscreenBtn) fullscreenBtn.click();
      } else if (e.code === 'KeyR') {
        if (resetBtn) resetBtn.click();
      }
    });

    // Store renderer globally for debugging
    window.sacredGridRenderer = renderer;
  });
})();
`;
}

/**
 * Generate the complete wallpaper renderer with all dependencies bundled
 * (Legacy function - combines classes + init for backward compatibility)
 */
export function generateWallpaperRenderer(): string {
  return getBundledRendererClasses() + generateRendererInit();
}

/**
 * Generate a minimal wallpaper renderer (lighter weight, less features)
 * Use this when you don't need the full sacred geometry library
 */
export function generateMinimalWallpaperRenderer(): string {
  return `
// Minimal Sacred Grid Renderer
// Lightweight version for basic wallpaper use

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('sacred-grid-canvas');
    var ctx = canvas.getContext('2d');
    var snapshot = window.SACRED_GRID_SNAPSHOT;
    var config = window.EXPORT_CONFIG;
    var settings = snapshot.settings;
    var animationSpeed = config.animationSpeed || 0.5;
    var startTime = performance.now();

    // Resize to fill screen
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    function animate() {
      var time = (performance.now() - startTime) * 0.001 * animationSpeed;
      render(time);
      requestAnimationFrame(animate);
    }

    function render(time) {
      var width = canvas.width;
      var height = canvas.height;
      var centerX = width / 2;
      var centerY = height / 2;

      // Clear
      ctx.fillStyle = settings.colors?.background || '#000000';
      ctx.fillRect(0, 0, width, height);

      // Breathing animation
      var breathe = 1 + Math.sin(time * (settings.grid?.breathingSpeed || 0.005) * Math.PI * 2) * (settings.grid?.breathingIntensity || 0.2);

      // Draw grid
      var gridSize = settings.grid?.size || 6;
      var spacing = settings.grid?.spacing || 80;

      ctx.strokeStyle = settings.colors?.line || settings.colors?.primary || '#0077ff';
      ctx.lineWidth = (settings.grid?.lineWidthMultiplier || 1) * breathe;
      ctx.globalAlpha = (settings.grid?.connectionOpacity || 0.15) * breathe;

      // Draw connections
      var points = [];
      for (var i = -gridSize; i <= gridSize; i++) {
        for (var j = -gridSize; j <= gridSize; j++) {
          var offset = (j % 2 !== 0) ? spacing / 2 : 0;
          points.push({
            x: centerX + i * spacing + offset,
            y: centerY + j * spacing * 0.866
          });
        }
      }

      var maxDist = spacing * 1.5;
      for (var a = 0; a < points.length; a++) {
        for (var b = a + 1; b < points.length; b++) {
          var dx = points[b].x - points[a].x;
          var dy = points[b].y - points[a].y;
          if (dx * dx + dy * dy < maxDist * maxDist) {
            ctx.beginPath();
            ctx.moveTo(points[a].x, points[a].y);
            ctx.lineTo(points[b].x, points[b].y);
            ctx.stroke();
          }
        }
      }

      // Draw primary shape
      var primary = settings.shapes?.primary;
      if (primary) {
        ctx.globalAlpha = primary.opacity || 0.8;
        ctx.strokeStyle = settings.colors?.shape || settings.colors?.primary || '#0077ff';
        ctx.lineWidth = primary.thickness || 1;

        var size = (primary.size || 40) * breathe;
        var vertices = primary.vertices || 6;
        var rotation = ((primary.rotation || 0) * Math.PI / 180) + time * 0.1;

        ctx.beginPath();
        for (var v = 0; v <= vertices; v++) {
          var angle = rotation + v * 2 * Math.PI / vertices;
          var x = centerX + size * Math.cos(angle);
          var y = centerY + size * Math.sin(angle);
          if (v === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    animate();
  });
})();
`;
}
