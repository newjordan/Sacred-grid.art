// src/export/SVGExporter.ts - Vector export system for scalable graphics

import { Vector2D } from '../types';

/**
 * SVG export configuration
 */
export interface SVGExportConfig {
  width: number;
  height: number;
  viewBox?: string;
  preserveAspectRatio?: string;
  backgroundColor?: string;
  precision: number; // Decimal places for coordinates
  optimize: boolean; // Optimize output for smaller file size
  includeMetadata: boolean;
  filename?: string;
}

/**
 * SVG element types
 */
export type SVGElementType = 
  | 'circle'
  | 'ellipse'
  | 'rect'
  | 'line'
  | 'polyline'
  | 'polygon'
  | 'path'
  | 'text'
  | 'group';

/**
 * SVG element data
 */
export interface SVGElement {
  type: SVGElementType;
  attributes: Record<string, string | number>;
  content?: string;
  children?: SVGElement[];
  id?: string;
  classes?: string[];
  styles?: Record<string, string>;
}

/**
 * SVG path command
 */
export interface SVGPathCommand {
  command: 'M' | 'L' | 'C' | 'Q' | 'A' | 'Z' | 'm' | 'l' | 'c' | 'q' | 'a' | 'z';
  points: number[];
}

/**
 * Renderable content for SVG export
 */
export interface SVGRenderableContent {
  renderToSVG(config: SVGExportConfig): SVGElement[];
}

/**
 * SVG exporter for scalable vector graphics
 */
export class SVGExporter {
  private elements: SVGElement[] = [];
  private defs: SVGElement[] = [];
  private gradientCounter = 0;
  private patternCounter = 0;

  /**
   * Export content as SVG
   */
  export(
    content: SVGRenderableContent,
    config: SVGExportConfig
  ): string {
    // Clear previous export
    this.elements = [];
    this.defs = [];
    this.gradientCounter = 0;
    this.patternCounter = 0;

    // Generate SVG elements from content
    const contentElements = content.renderToSVG(config);
    this.elements.push(...contentElements);

    // Build SVG string
    return this.buildSVGString(config);
  }

  /**
   * Export geometric shapes
   */
  exportShapes(
    shapes: Array<{
      type: 'circle' | 'rectangle' | 'polygon' | 'path';
      data: any;
      style?: Record<string, string>;
    }>,
    config: SVGExportConfig
  ): string {
    this.elements = [];
    this.defs = [];

    shapes.forEach(shape => {
      const element = this.convertShapeToSVG(shape);
      if (element) {
        this.elements.push(element);
      }
    });

    return this.buildSVGString(config);
  }

  /**
   * Add circle element
   */
  addCircle(
    center: Vector2D,
    radius: number,
    style?: Record<string, string>,
    id?: string
  ): void {
    this.elements.push({
      type: 'circle',
      attributes: {
        cx: this.formatNumber(center.x),
        cy: this.formatNumber(center.y),
        r: this.formatNumber(radius)
      },
      styles: style,
      id
    });
  }

  /**
   * Add rectangle element
   */
  addRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    style?: Record<string, string>,
    id?: string
  ): void {
    this.elements.push({
      type: 'rect',
      attributes: {
        x: this.formatNumber(x),
        y: this.formatNumber(y),
        width: this.formatNumber(width),
        height: this.formatNumber(height)
      },
      styles: style,
      id
    });
  }

  /**
   * Add line element
   */
  addLine(
    start: Vector2D,
    end: Vector2D,
    style?: Record<string, string>,
    id?: string
  ): void {
    this.elements.push({
      type: 'line',
      attributes: {
        x1: this.formatNumber(start.x),
        y1: this.formatNumber(start.y),
        x2: this.formatNumber(end.x),
        y2: this.formatNumber(end.y)
      },
      styles: style,
      id
    });
  }

  /**
   * Add polygon element
   */
  addPolygon(
    points: Vector2D[],
    style?: Record<string, string>,
    id?: string
  ): void {
    const pointsString = points
      .map(p => `${this.formatNumber(p.x)},${this.formatNumber(p.y)}`)
      .join(' ');

    this.elements.push({
      type: 'polygon',
      attributes: {
        points: pointsString
      },
      styles: style,
      id
    });
  }

  /**
   * Add polyline element
   */
  addPolyline(
    points: Vector2D[],
    style?: Record<string, string>,
    id?: string
  ): void {
    const pointsString = points
      .map(p => `${this.formatNumber(p.x)},${this.formatNumber(p.y)}`)
      .join(' ');

    this.elements.push({
      type: 'polyline',
      attributes: {
        points: pointsString
      },
      styles: style,
      id
    });
  }

  /**
   * Add path element
   */
  addPath(
    commands: SVGPathCommand[],
    style?: Record<string, string>,
    id?: string
  ): void {
    const pathData = this.buildPathData(commands);

    this.elements.push({
      type: 'path',
      attributes: {
        d: pathData
      },
      styles: style,
      id
    });
  }

  /**
   * Add text element
   */
  addText(
    text: string,
    position: Vector2D,
    style?: Record<string, string>,
    id?: string
  ): void {
    this.elements.push({
      type: 'text',
      attributes: {
        x: this.formatNumber(position.x),
        y: this.formatNumber(position.y)
      },
      content: text,
      styles: style,
      id
    });
  }

  /**
   * Add group element
   */
  addGroup(
    children: SVGElement[],
    transform?: string,
    style?: Record<string, string>,
    id?: string
  ): void {
    const attributes: Record<string, string | number> = {};
    
    if (transform) {
      attributes.transform = transform;
    }

    this.elements.push({
      type: 'group',
      attributes,
      children,
      styles: style,
      id
    });
  }

  /**
   * Create linear gradient
   */
  createLinearGradient(
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stops: Array<{ offset: number; color: string; opacity?: number }>
  ): string {
    const gradientId = id || `gradient_${this.gradientCounter++}`;

    const stopElements: SVGElement[] = stops.map(stop => ({
      type: 'stop' as SVGElementType,
      attributes: {
        offset: `${stop.offset * 100}%`,
        'stop-color': stop.color,
        ...(stop.opacity !== undefined && { 'stop-opacity': stop.opacity })
      }
    }));

    this.defs.push({
      type: 'linearGradient' as SVGElementType,
      attributes: {
        id: gradientId,
        x1: `${x1 * 100}%`,
        y1: `${y1 * 100}%`,
        x2: `${x2 * 100}%`,
        y2: `${y2 * 100}%`
      },
      children: stopElements
    });

    return `url(#${gradientId})`;
  }

  /**
   * Create radial gradient
   */
  createRadialGradient(
    id: string,
    cx: number,
    cy: number,
    r: number,
    stops: Array<{ offset: number; color: string; opacity?: number }>
  ): string {
    const gradientId = id || `radial_gradient_${this.gradientCounter++}`;

    const stopElements: SVGElement[] = stops.map(stop => ({
      type: 'stop' as SVGElementType,
      attributes: {
        offset: `${stop.offset * 100}%`,
        'stop-color': stop.color,
        ...(stop.opacity !== undefined && { 'stop-opacity': stop.opacity })
      }
    }));

    this.defs.push({
      type: 'radialGradient' as SVGElementType,
      attributes: {
        id: gradientId,
        cx: `${cx * 100}%`,
        cy: `${cy * 100}%`,
        r: `${r * 100}%`
      },
      children: stopElements
    });

    return `url(#${gradientId})`;
  }

  /**
   * Convert shape to SVG element
   */
  private convertShapeToSVG(shape: {
    type: 'circle' | 'rectangle' | 'polygon' | 'path';
    data: any;
    style?: Record<string, string>;
  }): SVGElement | null {
    switch (shape.type) {
      case 'circle':
        return {
          type: 'circle',
          attributes: {
            cx: this.formatNumber(shape.data.center.x),
            cy: this.formatNumber(shape.data.center.y),
            r: this.formatNumber(shape.data.radius)
          },
          styles: shape.style
        };

      case 'rectangle':
        return {
          type: 'rect',
          attributes: {
            x: this.formatNumber(shape.data.x),
            y: this.formatNumber(shape.data.y),
            width: this.formatNumber(shape.data.width),
            height: this.formatNumber(shape.data.height)
          },
          styles: shape.style
        };

      case 'polygon':
        const pointsString = shape.data.points
          .map((p: Vector2D) => `${this.formatNumber(p.x)},${this.formatNumber(p.y)}`)
          .join(' ');
        
        return {
          type: 'polygon',
          attributes: {
            points: pointsString
          },
          styles: shape.style
        };

      case 'path':
        return {
          type: 'path',
          attributes: {
            d: shape.data.pathData
          },
          styles: shape.style
        };

      default:
        return null;
    }
  }

  /**
   * Build path data string from commands
   */
  private buildPathData(commands: SVGPathCommand[]): string {
    return commands
      .map(cmd => {
        const formattedPoints = cmd.points.map(p => this.formatNumber(p)).join(' ');
        return `${cmd.command} ${formattedPoints}`;
      })
      .join(' ');
  }

  /**
   * Build complete SVG string
   */
  private buildSVGString(config: SVGExportConfig): string {
    const { width, height, viewBox, preserveAspectRatio, backgroundColor } = config;

    let svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
    
    if (config.includeMetadata) {
      svg += '<!-- Generated by Sacred Grid Canvas2D SVG Exporter -->\n';
      svg += `<!-- Export Date: ${new Date().toISOString()} -->\n`;
    }

    // SVG opening tag
    svg += '<svg';
    svg += ` width="${width}"`;
    svg += ` height="${height}"`;
    svg += ` viewBox="${viewBox || `0 0 ${width} ${height}`}"`;
    
    if (preserveAspectRatio) {
      svg += ` preserveAspectRatio="${preserveAspectRatio}"`;
    }
    
    svg += ' xmlns="http://www.w3.org/2000/svg"';
    svg += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
    svg += '>\n';

    // Background
    if (backgroundColor) {
      svg += `  <rect width="100%" height="100%" fill="${backgroundColor}"/>\n`;
    }

    // Definitions
    if (this.defs.length > 0) {
      svg += '  <defs>\n';
      this.defs.forEach(def => {
        svg += this.elementToString(def, 4);
      });
      svg += '  </defs>\n';
    }

    // Main content
    this.elements.forEach(element => {
      svg += this.elementToString(element, 2);
    });

    svg += '</svg>';

    return config.optimize ? this.optimizeSVG(svg) : svg;
  }

  /**
   * Convert SVG element to string
   */
  private elementToString(element: SVGElement, indent: number = 0): string {
    const indentStr = ' '.repeat(indent);
    const tagName = this.getTagName(element.type);
    
    let result = `${indentStr}<${tagName}`;

    // Add attributes
    Object.entries(element.attributes).forEach(([key, value]) => {
      result += ` ${key}="${value}"`;
    });

    // Add ID
    if (element.id) {
      result += ` id="${element.id}"`;
    }

    // Add classes
    if (element.classes && element.classes.length > 0) {
      result += ` class="${element.classes.join(' ')}"`;
    }

    // Add styles
    if (element.styles && Object.keys(element.styles).length > 0) {
      const styleString = Object.entries(element.styles)
        .map(([prop, value]) => `${prop}:${value}`)
        .join(';');
      result += ` style="${styleString}"`;
    }

    // Handle self-closing tags
    if (!element.content && (!element.children || element.children.length === 0)) {
      result += '/>\n';
      return result;
    }

    result += '>';

    // Add content
    if (element.content) {
      result += element.content;
    }

    // Add children
    if (element.children && element.children.length > 0) {
      result += '\n';
      element.children.forEach(child => {
        result += this.elementToString(child, indent + 2);
      });
      result += indentStr;
    }

    result += `</${tagName}>\n`;
    return result;
  }

  /**
   * Get SVG tag name for element type
   */
  private getTagName(type: SVGElementType): string {
    switch (type) {
      case 'group':
        return 'g';
      default:
        return type;
    }
  }

  /**
   * Format number with specified precision
   */
  private formatNumber(num: number, precision: number = 2): string {
    return Number(num.toFixed(precision)).toString();
  }

  /**
   * Optimize SVG output
   */
  private optimizeSVG(svg: string): string {
    // Remove unnecessary whitespace
    svg = svg.replace(/>\s+</g, '><');
    
    // Remove empty attributes
    svg = svg.replace(/\s+[a-zA-Z-]+=""/g, '');
    
    // Optimize path data
    svg = svg.replace(/d="([^"]+)"/g, (match, pathData) => {
      // Remove unnecessary spaces in path data
      const optimized = pathData
        .replace(/\s+/g, ' ')
        .replace(/([MLHVCSQTAZ])\s+/gi, '$1')
        .replace(/\s+([MLHVCSQTAZ])/gi, '$1')
        .trim();
      return `d="${optimized}"`;
    });

    return svg;
  }

  /**
   * Create SVG from canvas
   */
  exportFromCanvas(
    canvas: HTMLCanvasElement,
    config: SVGExportConfig
  ): string {
    // Note: This is a simplified conversion
    // For full canvas-to-SVG conversion, you'd need to trace the canvas content
    
    const dataURL = canvas.toDataURL('image/png');
    
    this.elements = [{
      type: 'image' as SVGElementType,
      attributes: {
        x: 0,
        y: 0,
        width: config.width,
        height: config.height,
        href: dataURL
      }
    }];

    return this.buildSVGString(config);
  }

  /**
   * Export spiral patterns to SVG
   */
  exportSpiral(
    points: Vector2D[],
    config: SVGExportConfig,
    style?: Record<string, string>
  ): string {
    this.elements = [];
    this.defs = [];

    if (points.length < 2) return this.buildSVGString(config);

    // Create path commands for spiral
    const commands: SVGPathCommand[] = [
      { command: 'M', points: [points[0].x, points[0].y] }
    ];

    for (let i = 1; i < points.length; i++) {
      commands.push({
        command: 'L',
        points: [points[i].x, points[i].y]
      });
    }

    this.addPath(commands, style);
    return this.buildSVGString(config);
  }

  /**
   * Export mandala patterns to SVG
   */
  exportMandala(
    elements: Array<{
      type: 'circle' | 'line' | 'polygon';
      data: any;
      style?: Record<string, string>;
    }>,
    config: SVGExportConfig
  ): string {
    this.elements = [];
    this.defs = [];

    elements.forEach(element => {
      const svgElement = this.convertShapeToSVG(element);
      if (svgElement) {
        this.elements.push(svgElement);
      }
    });

    return this.buildSVGString(config);
  }

  /**
   * Get default export configuration
   */
  static getDefaultConfig(width: number, height: number): SVGExportConfig {
    return {
      width,
      height,
      precision: 2,
      optimize: true,
      includeMetadata: true,
      preserveAspectRatio: 'xMidYMid meet'
    };
  }

  /**
   * Download SVG as file
   */
  downloadSVG(svgContent: string, filename: string): void {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all elements
   */
  clear(): void {
    this.elements = [];
    this.defs = [];
    this.gradientCounter = 0;
    this.patternCounter = 0;
  }

  /**
   * Get current elements
   */
  getElements(): SVGElement[] {
    return [...this.elements];
  }

  /**
   * Get current definitions
   */
  getDefs(): SVGElement[] {
    return [...this.defs];
  }
}