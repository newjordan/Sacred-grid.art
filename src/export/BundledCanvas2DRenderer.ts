// src/export/BundledCanvas2DRenderer.ts
// Generates a self-contained Canvas2DRenderer class as a string for embedding in HTML exports

/**
 * Returns a string containing the complete Canvas2DRenderer class
 * converted to work standalone without any imports or external dependencies.
 * The output is vanilla JavaScript that can be embedded in an HTML file's script tag.
 */
export function getBundledCanvas2DRenderer(): string {
  return `
// ============================================
// Canvas2DRenderer - Self-Contained Version
// ============================================
// This is a bundled standalone version of the Canvas2DRenderer class.
// It includes all necessary functionality without external dependencies.

class Canvas2DRenderer {
  /**
   * Initialize the Canvas2D renderer
   * @param {HTMLElement} container - DOM element to attach the canvas to
   * @param {Object} options - Canvas-specific initialization options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.width = 0;
    this.height = 0;
    this.mousePosition = { x: 0, y: 0 };
    this._listeners = {};
    this.canvas = null;
    this.ctx = null;
    this.initialized = false;
    this.time = 0;
  }

  /**
   * Set up the canvas element and context
   * @returns {HTMLCanvasElement} The created canvas element
   */
  initialize() {
    if (this.initialized) return this.canvas;

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'sacred-grid-canvas';

    // Set canvas styles to ensure it fills container properly
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';

    // Get 2D context
    this.ctx = this.canvas.getContext('2d');

    // Add event listeners
    this._setupEventListeners();

    // Add to container
    this.container.appendChild(this.canvas);

    // Initial resize
    this._handleResize();

    this.initialized = true;
    return this.canvas;
  }

  /**
   * Set up event listeners for the canvas
   * @private
   */
  _setupEventListeners() {
    const self = this;

    // Mouse move handler
    const handleMouseMove = function(e) {
      const rect = self.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      self.updateMousePosition(x, y);

      if (self._listeners['mousemove']) {
        self._listeners['mousemove'].forEach(function(callback) {
          callback(x, y);
        });
      }
    };

    // Mouse leave handler
    const handleMouseLeave = function() {
      self.updateMousePosition(-1000, -1000);

      if (self._listeners['mouseleave']) {
        self._listeners['mouseleave'].forEach(function(callback) {
          callback();
        });
      }
    };

    // Resize handler
    const handleResize = function() {
      self._handleResize();

      if (self._listeners['resize']) {
        self._listeners['resize'].forEach(function(callback) {
          callback(self.width, self.height);
        });
      }
    };

    // Attach event listeners
    this.canvas.addEventListener('mousemove', handleMouseMove);
    this.canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Store cleanup function
    this._cleanup = function() {
      self.canvas.removeEventListener('mousemove', handleMouseMove);
      self.canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }

  /**
   * Handle canvas resizing, maintaining proper DPI scaling
   * @private
   */
  _handleResize() {
    if (!this.canvas) {
      console.error('_handleResize: Canvas is null');
      return;
    }

    if (!this.container || !this.container.parentNode) {
      console.error('_handleResize: Container or parent is null');
      return;
    }

    // Get the display size of the canvas
    const rect = this.container.getBoundingClientRect();

    // Make sure we have valid dimensions
    if (rect.width === 0 || rect.height === 0) {
      if (this.container.parentNode) {
        const parentRect = this.container.parentNode.getBoundingClientRect();
        if (parentRect.width > 0 && parentRect.height > 0) {
          rect.width = parentRect.width;
          rect.height = parentRect.height;
        } else {
          rect.width = window.innerWidth;
          rect.height = window.innerHeight;
        }
      }
    }

    // Resize canvas with proper DPI scaling
    const pixelRatio = window.devicePixelRatio || 1;
    const displayWidth = Math.max(10, Math.floor(rect.width));
    const displayHeight = Math.max(10, Math.floor(rect.height));

    // Always save context state before resizing
    if (this.ctx) {
      try {
        this.ctx.save();
      } catch (e) {
        console.error('Error saving context state:', e);
      }
    }

    try {
      // Set new dimensions
      this.canvas.width = displayWidth * pixelRatio;
      this.canvas.height = displayHeight * pixelRatio;

      // Store logical dimensions
      this.width = displayWidth;
      this.height = displayHeight;

      // Also set style dimensions explicitly to match container
      this.canvas.style.width = displayWidth + 'px';
      this.canvas.style.height = displayHeight + 'px';

      if (this.ctx) {
        // Clear previous transformations
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Scale all drawing operations by the device pixel ratio
        this.ctx.scale(pixelRatio, pixelRatio);

        // Restore saved state
        this.ctx.restore();
      }
    } catch (e) {
      console.error('Error during canvas resize:', e);
    }
  }

  /**
   * Resize the rendering surface
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  /**
   * Begin a new frame
   */
  beginFrame() {
    this.time = performance.now();
  }

  /**
   * End a frame
   */
  endFrame() {
    // Per-frame cleanup if needed
  }

  /**
   * Clear the canvas with a background color
   * @param {string} color - CSS color string
   */
  clear(color) {
    if (!this.ctx) return;
    color = color || 'black';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Set global alpha value
   * @param {number} alpha - Alpha value between 0 and 1
   */
  setGlobalAlpha(alpha) {
    if (!this.ctx) return;
    this.ctx.globalAlpha = alpha;
  }

  /**
   * Reset global alpha to 1
   */
  resetGlobalAlpha() {
    if (!this.ctx) return;
    this.ctx.globalAlpha = 1;
  }

  /**
   * Update mouse position
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   */
  updateMousePosition(x, y) {
    this.mousePosition = { x: x, y: y };
  }

  /**
   * Add event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Event handler
   */
  addEventListener(eventType, callback) {
    if (!this._listeners[eventType]) {
      this._listeners[eventType] = [];
    }
    this._listeners[eventType].push(callback);
  }

  /**
   * Draw a circle
   * @param {number} x - Center X coordinate
   * @param {number} y - Center Y coordinate
   * @param {number} radius - Circle radius
   * @param {string} color - Fill color
   * @param {string} strokeColor - Stroke color (optional)
   * @param {number} lineWidth - Line width for stroke (optional)
   */
  drawCircle(x, y, radius, color, strokeColor, lineWidth) {
    if (!this.ctx) return;
    lineWidth = lineWidth || 1;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }

  /**
   * Draw a polygon
   * @param {Array} vertices - Array of {x, y} points
   * @param {string} fillColor - Fill color (optional)
   * @param {string} strokeColor - Stroke color (optional)
   * @param {number} lineWidth - Line width for stroke (optional)
   */
  drawPolygon(vertices, fillColor, strokeColor, lineWidth) {
    if (!this.ctx || !vertices || vertices.length < 3) return;
    lineWidth = lineWidth || 1;

    this.ctx.beginPath();
    this.ctx.moveTo(vertices[0].x, vertices[0].y);

    for (var i = 1; i < vertices.length; i++) {
      this.ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    this.ctx.closePath();

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }

  /**
   * Draw text at a specified position
   * @param {string} text - The text to draw
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Text color
   * @param {string} font - Font specification
   */
  drawText(text, x, y, color, font) {
    if (!this.ctx) return;
    font = font || '12px Arial';
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw a line with optional line factory effects
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   * @param {string} color - Line color
   * @param {number} lineWidth - Line width
   * @param {Object} lineSettings - Optional line factory settings
   */
  drawLine(x1, y1, x2, y2, color, lineWidth, lineSettings) {
    if (!this.ctx) return;
    lineWidth = lineWidth || 1;

    // If no line factory settings provided, draw a standard line
    if (!lineSettings) {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
      return;
    }

    // Save context state
    this.ctx.save();

    // Apply glow effect if needed
    if (lineSettings.glow && lineSettings.glow.intensity > 0) {
      this.ctx.shadowBlur = lineSettings.glow.intensity;
      this.ctx.shadowColor = lineSettings.glow.color || color;
    }

    // Draw outline if enabled
    if (lineSettings.outline && lineSettings.outline.enabled) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = lineSettings.outline.color || '#000000';
      this.ctx.lineWidth = lineWidth + (lineSettings.outline.width || 1) * 2;

      if (lineSettings.sineWave && lineSettings.sineWave.type !== 'none') {
        var adjustedSettings = Object.assign({}, lineSettings);
        if (lineSettings.sineWave.phaseOffset !== undefined) {
          adjustedSettings.sineWave = Object.assign({}, lineSettings.sineWave, {
            phase: (lineSettings.sineWave.phase || 0) + lineSettings.sineWave.phaseOffset
          });
        }
        this._drawSineWaveLine(x1, y1, x2, y2, lineWidth + (lineSettings.outline.width || 1) * 2, adjustedSettings);
      } else {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
      }

      if (lineSettings.style === 'dashed' && lineSettings.dash) {
        this.ctx.setLineDash(lineSettings.dash.pattern || [5, 5]);
        this.ctx.lineDashOffset = lineSettings.dash.offset || 0;
      } else if (lineSettings.style === 'dotted') {
        this.ctx.setLineDash([2, 4]);
      } else {
        this.ctx.setLineDash([]);
      }

      this.ctx.stroke();
    }

    // Reset shadow for main line
    this.ctx.shadowBlur = 0;

    // Draw the main line
    this.ctx.strokeStyle = color;

    var adjustedSettings = Object.assign({}, lineSettings);
    if (lineSettings.sineWave && lineSettings.sineWave.phaseOffset !== undefined) {
      adjustedSettings.sineWave = Object.assign({}, lineSettings.sineWave, {
        phase: (lineSettings.sineWave.phase || 0) + lineSettings.sineWave.phaseOffset
      });
    }

    // Handle different line styles
    if (adjustedSettings.sineWave && adjustedSettings.sineWave.type !== 'none') {
      this._drawSineWaveLine(x1, y1, x2, y2, lineWidth, adjustedSettings);
    } else if (adjustedSettings.style === 'wavy') {
      var tempSineSettings = Object.assign({ type: 'sine', amplitude: 5, frequency: 0.1, phase: 0 }, adjustedSettings.sineWave);
      this._drawSineWaveLine(x1, y1, x2, y2, lineWidth, Object.assign({}, adjustedSettings, { sineWave: tempSineSettings }));
    } else if (adjustedSettings.style === 'zigzag') {
      var tempSineSettings = Object.assign({ type: 'square', amplitude: 5, frequency: 0.1, phase: 0 }, adjustedSettings.sineWave);
      this._drawSineWaveLine(x1, y1, x2, y2, lineWidth, Object.assign({}, adjustedSettings, { sineWave: tempSineSettings }));
    } else if (adjustedSettings.style === 'spiral') {
      this._drawSpiralLine(x1, y1, x2, y2, lineWidth, adjustedSettings);
    } else if (adjustedSettings.style === 'ribbon') {
      this._drawRibbonLine(x1, y1, x2, y2, lineWidth, adjustedSettings);
    } else if (adjustedSettings.style === 'double') {
      this._drawDoubleLine(x1, y1, x2, y2, lineWidth, adjustedSettings);
    } else if (adjustedSettings.style === 'complex') {
      this._drawComplexLine(x1, y1, x2, y2, lineWidth, adjustedSettings);
    } else {
      if (adjustedSettings.taper && adjustedSettings.taper.type !== 'none') {
        this._drawTaperedLine(x1, y1, x2, y2, lineWidth, color, adjustedSettings);
      } else {
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;

        if (adjustedSettings.style === 'dashed' && adjustedSettings.dash) {
          this.ctx.setLineDash(adjustedSettings.dash.pattern || [5, 5]);
          this.ctx.lineDashOffset = adjustedSettings.dash.offset || 0;
        } else if (adjustedSettings.style === 'dotted') {
          this.ctx.setLineDash([2, 4]);
        } else {
          this.ctx.setLineDash([]);
        }

        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    }

    // Restore context state
    this.ctx.restore();
  }

  /**
   * Helper method to draw a tapered line
   * @private
   */
  _drawTaperedLine(x1, y1, x2, y2, baseWidth, color, lineSettings) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var segments = 40;

    var taperType = lineSettings.taper.type || 'none';
    var startWidth = lineSettings.taper.startWidth !== undefined ? lineSettings.taper.startWidth : 1;
    var endWidth = lineSettings.taper.endWidth !== undefined ? lineSettings.taper.endWidth : 1;

    for (var i = 0; i < segments; i++) {
      var progress = i / segments;
      var nextProgress = (i + 1) / segments;

      var width = baseWidth;

      if (taperType === 'start') {
        width = baseWidth * (startWidth + progress * (1 - startWidth));
      } else if (taperType === 'end') {
        width = baseWidth * (1 - (1 - endWidth) * progress);
      } else if (taperType === 'both') {
        if (progress < 0.5) {
          width = baseWidth * (startWidth + progress * 2 * (1 - startWidth));
        } else {
          width = baseWidth * (1 - (1 - endWidth) * (progress - 0.5) * 2);
        }
      } else if (taperType === 'middle') {
        if (progress < 0.5) {
          width = baseWidth * (1 - (1 - startWidth) * ((0.5 - progress) * 2));
        } else {
          width = baseWidth * (1 - (1 - endWidth) * ((progress - 0.5) * 2));
        }
      }

      var segX1 = x1 + dx * progress;
      var segY1 = y1 + dy * progress;
      var segX2 = x1 + dx * nextProgress;
      var segY2 = y1 + dy * nextProgress;

      this.ctx.beginPath();
      this.ctx.lineWidth = width;
      this.ctx.moveTo(segX1, segY1);
      this.ctx.lineTo(segX2, segY2);
      this.ctx.stroke();
    }
  }

  /**
   * Helper method to draw a sine wave line
   * @private
   */
  _drawSineWaveLine(x1, y1, x2, y2, baseWidth, lineSettings) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var length = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx);
    var segments = 40;

    var waveType = lineSettings.sineWave.type || 'sine';
    var amplitude = lineSettings.sineWave.amplitude || 5;
    var frequency = lineSettings.sineWave.frequency || 0.1;
    var phase = lineSettings.sineWave.phase || 0;

    if (lineSettings.sineWave.animated) {
      phase += this.time * 0.001 * lineSettings.sineWave.speed;
    }

    var shouldLoop = lineSettings.loopLine !== undefined ? lineSettings.loopLine : true;
    var useBidirectionalWaves = shouldLoop && lineSettings.bidirectionalWaves === true;

    var self = this;

    function calculateWaveOffset(waveAngle, waveType, amplitude) {
      switch (waveType) {
        case 'sine':
          return Math.sin(waveAngle) * amplitude;
        case 'cosine':
          return Math.cos(waveAngle) * amplitude;
        case 'square':
          return (Math.sin(waveAngle) > 0 ? 1 : -1) * amplitude;
        case 'triangle':
          return (Math.asin(Math.sin(waveAngle)) * 2 / Math.PI) * amplitude;
        default:
          return 0;
      }
    }

    if (lineSettings.taper && lineSettings.taper.type !== 'none') {
      for (var i = 0; i < segments; i++) {
        var progress = i / segments;
        var nextProgress = (i + 1) / segments;

        var width = baseWidth;
        var taperType = lineSettings.taper.type;
        var startWidth = lineSettings.taper.startWidth !== undefined ? lineSettings.taper.startWidth : 1;
        var endWidth = lineSettings.taper.endWidth !== undefined ? lineSettings.taper.endWidth : 1;

        if (taperType === 'start') {
          width = baseWidth * (startWidth + progress * (1 - startWidth));
        } else if (taperType === 'end') {
          width = baseWidth * (1 - (1 - endWidth) * progress);
        } else if (taperType === 'both') {
          if (progress < 0.5) {
            width = baseWidth * (startWidth + progress * 2 * (1 - startWidth));
          } else {
            width = baseWidth * (1 - (1 - endWidth) * (progress - 0.5) * 2);
          }
        } else if (taperType === 'middle') {
          if (progress < 0.5) {
            width = baseWidth * (1 - (1 - startWidth) * ((0.5 - progress) * 2));
          } else {
            width = baseWidth * (1 - (1 - endWidth) * ((progress - 0.5) * 2));
          }
        }

        var xPos = x1 + dx * progress;
        var yPos = y1 + dy * progress;
        var nextXPos = x1 + dx * nextProgress;
        var nextYPos = y1 + dy * nextProgress;

        var waveAngle, nextWaveAngle;

        if (shouldLoop) {
          var exactCycles = Math.max(1, Math.round(frequency * length / 30));

          if (useBidirectionalWaves) {
            var forwardAngle = progress * Math.PI * 2 * exactCycles + phase;
            var forwardNextAngle = nextProgress * Math.PI * 2 * exactCycles + phase;
            var reversePhase = phase + Math.PI;
            var reverseAngle = (1 - progress) * Math.PI * 2 * exactCycles + reversePhase;
            var reverseNextAngle = (1 - nextProgress) * Math.PI * 2 * exactCycles + reversePhase;
            var blendFactor = Math.sin(progress * Math.PI);
            waveAngle = forwardAngle * blendFactor + reverseAngle * (1 - blendFactor);
            nextWaveAngle = forwardNextAngle * blendFactor + reverseNextAngle * (1 - blendFactor);
          } else {
            waveAngle = progress * Math.PI * 2 * exactCycles + phase;
            nextWaveAngle = nextProgress * Math.PI * 2 * exactCycles + phase;
          }
        } else {
          waveAngle = progress * Math.PI * 2 * frequency + phase;
          nextWaveAngle = nextProgress * Math.PI * 2 * frequency + phase;
        }

        var waveOffset = calculateWaveOffset(waveAngle, waveType, amplitude);
        var nextWaveOffset = calculateWaveOffset(nextWaveAngle, waveType, amplitude);

        var perpX = Math.sin(angle);
        var perpY = -Math.cos(angle);

        var waveX = xPos + perpX * waveOffset;
        var waveY = yPos + perpY * waveOffset;
        var nextWaveX = nextXPos + perpX * nextWaveOffset;
        var nextWaveY = nextYPos + perpY * nextWaveOffset;

        this.ctx.beginPath();
        this.ctx.lineWidth = width;
        this.ctx.moveTo(waveX, waveY);
        this.ctx.lineTo(nextWaveX, nextWaveY);
        this.ctx.stroke();
      }
    } else {
      this.ctx.lineWidth = baseWidth;
      this.ctx.beginPath();

      var perpX = Math.sin(angle);
      var perpY = -Math.cos(angle);

      var exactCycles;
      if (shouldLoop) {
        exactCycles = Math.max(1, Math.round(frequency * length / 30));
      } else {
        exactCycles = frequency;
      }

      var initialOffset = calculateWaveOffset(phase, waveType, amplitude);
      this.ctx.moveTo(x1 + perpX * initialOffset, y1 + perpY * initialOffset);

      for (var i = 1; i <= segments; i++) {
        var progress = i / segments;
        var xPos = x1 + dx * progress;
        var yPos = y1 + dy * progress;

        var waveAngle;
        if (shouldLoop && useBidirectionalWaves) {
          var forwardAngle = progress * Math.PI * 2 * exactCycles + phase;
          var reversePhase = phase + Math.PI;
          var reverseAngle = (1 - progress) * Math.PI * 2 * exactCycles + reversePhase;
          var blendFactor = Math.sin(progress * Math.PI);
          waveAngle = forwardAngle * blendFactor + reverseAngle * (1 - blendFactor);
        } else {
          waveAngle = progress * Math.PI * 2 * exactCycles + phase;
        }

        var waveOffset = calculateWaveOffset(waveAngle, waveType, amplitude);
        var waveX = xPos + perpX * waveOffset;
        var waveY = yPos + perpY * waveOffset;
        this.ctx.lineTo(waveX, waveY);
      }

      this.ctx.stroke();
    }
  }

  /**
   * Helper method to draw a spiral/vortex line
   * @private
   */
  _drawSpiralLine(x1, y1, x2, y2, baseWidth, lineSettings) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var length = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx);
    var segments = Math.max(20, Math.floor(length / 5));

    var shouldLoop = lineSettings.loopLine !== undefined ? lineSettings.loopLine : true;

    var spiralTightness = (lineSettings.spiral && lineSettings.spiral.tightness) || 0.1;
    var spiralGrowth = (lineSettings.spiral && lineSettings.spiral.growth) || 1.5;
    var maxRadius = (lineSettings.spiral && lineSettings.spiral.maxRadius) || baseWidth * 2;

    this.ctx.beginPath();

    var revolutions = shouldLoop ? Math.round(5 * length / 100) : 5;

    for (var i = 0; i <= segments; i++) {
      var progress = i / segments;
      var xPos = x1 + dx * progress;
      var yPos = y1 + dy * progress;

      var spiralRadius = Math.min(maxRadius, progress * spiralGrowth * baseWidth);
      var spiralAngle = progress * Math.PI * 2 * revolutions + this.time * 0.001;

      var perpX = Math.sin(angle);
      var perpY = -Math.cos(angle);

      var offsetX = (Math.cos(spiralAngle) * spiralRadius) * perpX;
      var offsetY = (Math.cos(spiralAngle) * spiralRadius) * perpY;

      var spiralX = xPos + offsetX;
      var spiralY = yPos + offsetY;

      if (i === 0) {
        this.ctx.moveTo(spiralX, spiralY);
      } else {
        this.ctx.lineTo(spiralX, spiralY);
      }
    }

    this.ctx.lineWidth = baseWidth * 0.5;
    this.ctx.stroke();
  }

  /**
   * Helper method to draw a ribbon line
   * @private
   */
  _drawRibbonLine(x1, y1, x2, y2, baseWidth, lineSettings) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var length = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx);
    var segments = Math.max(20, Math.floor(length / 5));

    var shouldLoop = lineSettings.loopLine !== undefined ? lineSettings.loopLine : true;

    var ribbonWidth = (lineSettings.ribbon && lineSettings.ribbon.width) || baseWidth * 3;
    var twistRate = (lineSettings.ribbon && lineSettings.ribbon.twist) || 2;

    if (shouldLoop) {
      var twists = Math.round(twistRate * length / 100);
      twistRate = twists / (length / 100);
    }

    var perpX = Math.sin(angle);
    var perpY = -Math.cos(angle);

    var topPoints = [];
    var bottomPoints = [];

    for (var i = 0; i <= segments; i++) {
      var progress = i / segments;
      var xPos = x1 + dx * progress;
      var yPos = y1 + dy * progress;

      var twistAngle = progress * Math.PI * 2 * twistRate + (this.time * 0.001);
      var ribbonOffset = Math.sin(twistAngle) * (ribbonWidth / 2);

      topPoints.push({
        x: xPos + perpX * ribbonOffset,
        y: yPos + perpY * ribbonOffset
      });

      bottomPoints.push({
        x: xPos - perpX * ribbonOffset,
        y: yPos - perpY * ribbonOffset
      });
    }

    this.ctx.beginPath();

    this.ctx.moveTo(topPoints[0].x, topPoints[0].y);
    for (var i = 1; i < topPoints.length; i++) {
      this.ctx.lineTo(topPoints[i].x, topPoints[i].y);
    }

    for (var i = bottomPoints.length - 1; i >= 0; i--) {
      this.ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
    }

    this.ctx.closePath();

    var gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, this.ctx.strokeStyle);
    gradient.addColorStop(0.5, this.ctx.strokeStyle + '44');
    gradient.addColorStop(1, this.ctx.strokeStyle);

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.lineWidth = baseWidth * 0.3;
    this.ctx.stroke();
  }

  /**
   * Helper method to draw a double line
   * @private
   */
  _drawDoubleLine(x1, y1, x2, y2, baseWidth, lineSettings) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var angle = Math.atan2(dy, dx);

    var spacing = (lineSettings.double && lineSettings.double.spacing) || baseWidth * 1.5;
    var secondLineWidth = (lineSettings.double && lineSettings.double.secondLineWidth) || baseWidth * 0.7;

    var perpX = Math.sin(angle) * spacing;
    var perpY = -Math.cos(angle) * spacing;

    this.ctx.beginPath();
    this.ctx.lineWidth = baseWidth;
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.lineWidth = secondLineWidth;
    this.ctx.moveTo(x1 + perpX, y1 + perpY);
    this.ctx.lineTo(x2 + perpX, y2 + perpY);
    this.ctx.stroke();
  }

  /**
   * Helper method to draw a complex dotted/dashed line
   * @private
   */
  _drawComplexLine(x1, y1, x2, y2, baseWidth, lineSettings) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var length = Math.sqrt(dx * dx + dy * dy);

    var shouldLoop = lineSettings.loopLine !== undefined ? lineSettings.loopLine : true;

    var pattern = (lineSettings.complex && lineSettings.complex.pattern) || [5, 2, 2, 2, 10, 2];
    var dashOffset = (lineSettings.complex && lineSettings.complex.offset) || 0;

    var adjustedPattern = pattern.slice();
    if (shouldLoop) {
      var patternLength = pattern.reduce(function(sum, val) { return sum + val; }, 0);
      var patternCount = Math.round(length / patternLength);
      var adjustedLength = patternCount * patternLength;
      var scale = length / adjustedLength;
      adjustedPattern = pattern.map(function(val) { return val * scale; });
    }

    dashOffset += (this.time * 0.01);
    if (shouldLoop) {
      var patternLength = adjustedPattern.reduce(function(sum, val) { return sum + val; }, 0);
      dashOffset = dashOffset % patternLength;
    }

    this.ctx.beginPath();
    this.ctx.lineWidth = baseWidth;
    this.ctx.setLineDash(adjustedPattern);
    this.ctx.lineDashOffset = dashOffset;

    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
  }

  /**
   * Draw a custom shape using a drawing function
   * @param {Function} drawFunction - Function that will perform the actual drawing
   * @param {Object} params - Parameters for the drawing function
   */
  drawCustomShape(drawFunction, params) {
    if (typeof drawFunction === 'function') {
      var self = this;
      if (!this.ctx.drawLine) {
        this.ctx.drawLine = function(x1, y1, x2, y2, color, width, lineSettings) {
          self.drawLine(x1, y1, x2, y2, color, width, lineSettings);
        };
      }

      drawFunction(this.ctx, params);

      delete this.ctx.drawLine;
    }
  }

  /**
   * Get the current 2D context
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this.ctx;
  }

  /**
   * Remove all event listeners and clean up resources
   */
  dispose() {
    this._listeners = {};
    if (this._cleanup) {
      this._cleanup();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }
}
`;
}
