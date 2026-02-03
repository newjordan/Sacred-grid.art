// src/export/WallpaperRenderer.ts
// Self-contained renderer for wallpaper/standalone exports
// This bundles all necessary drawing logic into a single string that can be embedded in HTML

export function generateWallpaperRenderer(): string {
  return `
// ============================================
// Sacred Grid Wallpaper Renderer (Self-Contained)
// ============================================

class SacredGridWallpaperRenderer {
  constructor(canvas, snapshot, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.snapshot = snapshot;
    this.settings = snapshot.settings;
    this.config = config;

    this.isPlaying = true;
    this.time = 0;
    this.startTime = performance.now();
    this.animationFrame = null;
    this.animationSpeed = config.animationSpeed || 0.5;
    this.isWallpaperMode = config.wallpaperMode || false;
    this.scale = config.scale || 1;

    // Grid points cache
    this.gridPoints = [];

    // Golden ratio
    this.PHI = (1 + Math.sqrt(5)) / 2;

    // Mouse position (disabled in wallpaper mode)
    this.mousePos = { x: -1000, y: -1000 };

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.generateGridPoints();
    this.setupEventListeners();
    this.start();
  }

  resizeCanvas() {
    if (this.isWallpaperMode) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  generateGridPoints() {
    this.gridPoints = [];
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const gridSize = this.settings.grid?.size || 6;
    const spacing = this.settings.grid?.spacing || 80;

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        // Hexagonal offset for odd rows
        const offset = (j % 2 !== 0) ? spacing / 2 : 0;
        const x = centerX + i * spacing + offset;
        const y = centerY + j * spacing * 0.866; // sqrt(3)/2 for hex grid

        // Only include points within reasonable bounds
        const margin = spacing * 2;
        if (x > -margin && x < this.canvas.width + margin &&
            y > -margin && y < this.canvas.height + margin) {
          this.gridPoints.push({ x, y, baseX: x, baseY: y });
        }
      }
    }
  }

  setupEventListeners() {
    if (!this.isWallpaperMode) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.mousePos.x = -1000;
        this.mousePos.y = -1000;
      });
    }

    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.generateGridPoints();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      }
    });
  }

  start() {
    if (this.isPlaying) {
      this.animate();
    }
  }

  animate() {
    if (!this.isPlaying) return;

    this.time = (performance.now() - this.startTime) * 0.001 * this.animationSpeed;
    this.render();

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startTime = performance.now() - this.time * 1000 / this.animationSpeed;
      this.animate();
    } else {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }
  }

  // ============================================
  // RENDERING
  // ============================================

  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear with background color
    ctx.fillStyle = this.settings.colors?.background || '#000000';
    ctx.fillRect(0, 0, width, height);

    // Apply scale transform
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-width / 2, -height / 2);

    // Draw grid connections
    this.drawConnections(ctx);

    // Draw shapes at grid points
    this.drawShapes(ctx);

    // Draw vertices/dots
    if (this.settings.grid?.showVertices !== false) {
      this.drawVertices(ctx);
    }

    ctx.restore();
  }

  drawConnections(ctx) {
    const colors = this.settings.colors || {};
    const lineColor = colors.line || colors.primary || '#0077ff';
    const opacity = this.settings.grid?.connectionOpacity || 0.15;
    const breathingSpeed = this.settings.grid?.breathingSpeed || 0.005;
    const breathingIntensity = this.settings.grid?.breathingIntensity || 0.2;

    // Breathing animation
    const breathe = 1 + Math.sin(this.time * breathingSpeed * Math.PI * 2) * breathingIntensity;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = (this.settings.grid?.lineWidthMultiplier || 1) * breathe;
    ctx.globalAlpha = opacity * breathe;

    // Draw connections between nearby points
    const maxDist = (this.settings.grid?.spacing || 80) * 1.5;

    for (let i = 0; i < this.gridPoints.length; i++) {
      for (let j = i + 1; j < this.gridPoints.length; j++) {
        const p1 = this.gridPoints[i];
        const p2 = this.gridPoints[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  drawShapes(ctx) {
    const primary = this.settings.shapes?.primary;
    if (!primary) return;

    const colors = this.settings.colors || {};
    const shapeColor = colors.shape || colors.primary || '#0077ff';

    // Animation parameters
    const breathingSpeed = this.settings.grid?.breathingSpeed || 0.005;
    const breathingIntensity = this.settings.grid?.breathingIntensity || 0.2;
    const breathe = 1 + Math.sin(this.time * breathingSpeed * Math.PI * 2) * breathingIntensity;

    const vertices = primary.vertices || 6;
    const size = (primary.size || 40) * breathe;
    const thickness = primary.thickness || 1;
    const rotation = ((primary.rotation || 0) * Math.PI / 180) + this.time * 0.1;
    const opacity = primary.opacity || 0.8;

    ctx.strokeStyle = shapeColor;
    ctx.lineWidth = thickness;
    ctx.globalAlpha = opacity;

    // Draw shape at center
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.drawPolygon(ctx, cx, cy, size, vertices, rotation);

    // Draw at grid points if enabled
    if (this.gridPoints.length > 0 && primary.showAtGridPoints) {
      const smallSize = size * 0.3;
      ctx.globalAlpha = opacity * 0.5;

      for (const point of this.gridPoints) {
        this.drawPolygon(ctx, point.x, point.y, smallSize, vertices, rotation);
      }
    }

    ctx.globalAlpha = 1;
  }

  drawPolygon(ctx, cx, cy, radius, sides, rotation) {
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = rotation + (i * 2 * Math.PI / sides);
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  drawVertices(ctx) {
    const colors = this.settings.colors || {};
    const dotColor = colors.dot || colors.primary || '#ffffff';
    const dotSize = this.settings.grid?.baseDotSize || 2;

    ctx.fillStyle = dotColor;
    ctx.globalAlpha = 0.8;

    for (const point of this.gridPoints) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  // ============================================
  // SACRED GEOMETRY SHAPES
  // ============================================

  drawFlowerOfLife(ctx, cx, cy, radius, rings = 3) {
    const circleRadius = radius / (rings * 2);

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Surrounding circles in rings
    for (let ring = 1; ring <= rings; ring++) {
      const numCircles = ring * 6;
      const ringRadius = circleRadius * ring * 2;

      for (let i = 0; i < numCircles; i++) {
        const angle = (i / numCircles) * Math.PI * 2;
        const x = cx + ringRadius * Math.cos(angle);
        const y = cy + ringRadius * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  drawMerkaba(ctx, cx, cy, size) {
    // Upward triangle
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI / 3);
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Downward triangle
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = Math.PI / 2 + (i * 2 * Math.PI / 3);
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  drawMetatronsCube(ctx, cx, cy, size) {
    // Draw 13 circles (fruit of life pattern)
    const circleRadius = size / 6;

    // Center
    ctx.beginPath();
    ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      const x = cx + circleRadius * 2 * Math.cos(angle);
      const y = cy + circleRadius * 2 * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3 + Math.PI / 6;
      const x = cx + circleRadius * 4 * Math.cos(angle);
      const y = cy + circleRadius * 4 * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Connect all centers with lines
    const centers = [{ x: cx, y: cy }];
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      centers.push({
        x: cx + circleRadius * 2 * Math.cos(angle),
        y: cy + circleRadius * 2 * Math.sin(angle)
      });
    }
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3 + Math.PI / 6;
      centers.push({
        x: cx + circleRadius * 4 * Math.cos(angle),
        y: cy + circleRadius * 4 * Math.sin(angle)
      });
    }

    ctx.globalAlpha = 0.3;
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        ctx.beginPath();
        ctx.moveTo(centers[i].x, centers[i].y);
        ctx.lineTo(centers[j].x, centers[j].y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('sacred-grid-canvas');
  const renderer = new SacredGridWallpaperRenderer(canvas, SACRED_GRID_SNAPSHOT, EXPORT_CONFIG);
  window.sacredGridRenderer = renderer;
});
`;
}
