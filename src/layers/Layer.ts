// src/layers/Layer.ts - Individual layer class for rendering system

import { Vector2D } from '../types';

/**
 * Layer blend modes
 */
export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion';

/**
 * Layer transform properties
 */
export interface LayerTransform {
  position: Vector2D;
  scale: Vector2D;
  rotation: number;
  opacity: number;
}

/**
 * Layer configuration
 */
export interface LayerConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  blendMode: BlendMode;
  transform: LayerTransform;
  parentId?: string;
}

/**
 * Renderable object interface
 */
export interface RenderableObject {
  render(ctx: CanvasRenderingContext2D, transform: LayerTransform): void;
  getBounds(): { x: number; y: number; width: number; height: number };
  isVisible(): boolean;
}

/**
 * Individual layer class
 */
export class Layer {
  private config: LayerConfig;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private objects: Map<string, RenderableObject> = new Map();
  private isDirty: boolean = true;
  private parent: Layer | null = null;
  private children: Layer[] = [];

  constructor(config: LayerConfig) {
    this.config = { ...config };
    
    // Create layer canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Add a renderable object to the layer
   */
  addObject(id: string, object: RenderableObject): void {
    this.objects.set(id, object);
    this.markDirty();
  }

  /**
   * Remove an object from the layer
   */
  removeObject(id: string): boolean {
    const removed = this.objects.delete(id);
    if (removed) {
      this.markDirty();
    }
    return removed;
  }

  /**
   * Get an object by ID
   */
  getObject(id: string): RenderableObject | undefined {
    return this.objects.get(id);
  }

  /**
   * Clear all objects from the layer
   */
  clearObjects(): void {
    this.objects.clear();
    this.markDirty();
  }

  /**
   * Render the layer
   */
  render(forceRender: boolean = false): void {
    if (!this.config.visible) return;
    if (!this.isDirty && !forceRender) return;

    // Clear the layer canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply layer transform
    this.ctx.save();
    this.applyTransform();

    // Render all objects
    this.objects.forEach(object => {
      if (object.isVisible()) {
        object.render(this.ctx, this.config.transform);
      }
    });

    this.ctx.restore();
    this.isDirty = false;
  }

  /**
   * Apply layer transform to context
   */
  private applyTransform(): void {
    const transform = this.config.transform;
    
    // Apply translation
    this.ctx.translate(transform.position.x, transform.position.y);
    
    // Apply rotation
    if (transform.rotation !== 0) {
      this.ctx.rotate(transform.rotation);
    }
    
    // Apply scale
    if (transform.scale.x !== 1 || transform.scale.y !== 1) {
      this.ctx.scale(transform.scale.x, transform.scale.y);
    }
    
    // Apply opacity
    this.ctx.globalAlpha = transform.opacity;
  }

  /**
   * Composite this layer onto a target canvas
   */
  composite(
    targetCtx: CanvasRenderingContext2D,
    targetX: number = 0,
    targetY: number = 0
  ): void {
    if (!this.config.visible || this.config.transform.opacity <= 0) return;

    targetCtx.save();
    
    // Set blend mode
    targetCtx.globalCompositeOperation = this.config.blendMode;
    
    // Set layer opacity
    targetCtx.globalAlpha = this.config.transform.opacity;
    
    // Draw layer canvas onto target
    targetCtx.drawImage(this.canvas, targetX, targetY);
    
    targetCtx.restore();
  }

  /**
   * Get layer bounds including transform
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    const transform = this.config.transform;
    
    // Calculate transformed bounds
    const width = this.canvas.width * Math.abs(transform.scale.x);
    const height = this.canvas.height * Math.abs(transform.scale.y);
    
    return {
      x: transform.position.x - width / 2,
      y: transform.position.y - height / 2,
      width,
      height
    };
  }

  /**
   * Check if a point is within the layer
   */
  containsPoint(point: Vector2D): boolean {
    const bounds = this.getBounds();
    return point.x >= bounds.x && 
           point.x <= bounds.x + bounds.width &&
           point.y >= bounds.y && 
           point.y <= bounds.y + bounds.height;
  }

  /**
   * Mark layer as dirty (needs re-render)
   */
  markDirty(): void {
    this.isDirty = true;
    
    // Mark parent as dirty too
    if (this.parent) {
      this.parent.markDirty();
    }
  }

  /**
   * Set layer visibility
   */
  setVisible(visible: boolean): void {
    if (this.config.visible !== visible) {
      this.config.visible = visible;
      this.markDirty();
    }
  }

  /**
   * Set layer opacity
   */
  setOpacity(opacity: number): void {
    opacity = Math.max(0, Math.min(1, opacity));
    if (this.config.transform.opacity !== opacity) {
      this.config.transform.opacity = opacity;
      this.markDirty();
    }
  }

  /**
   * Set layer position
   */
  setPosition(position: Vector2D): void {
    this.config.transform.position = { ...position };
    this.markDirty();
  }

  /**
   * Set layer scale
   */
  setScale(scale: Vector2D): void {
    this.config.transform.scale = { ...scale };
    this.markDirty();
  }

  /**
   * Set layer rotation
   */
  setRotation(rotation: number): void {
    this.config.transform.rotation = rotation;
    this.markDirty();
  }

  /**
   * Set layer blend mode
   */
  setBlendMode(blendMode: BlendMode): void {
    this.config.blendMode = blendMode;
    this.markDirty();
  }

  /**
   * Set layer z-index
   */
  setZIndex(zIndex: number): void {
    this.config.zIndex = zIndex;
  }

  /**
   * Lock/unlock layer
   */
  setLocked(locked: boolean): void {
    this.config.locked = locked;
  }

  /**
   * Set parent layer
   */
  setParent(parent: Layer | null): void {
    // Remove from old parent
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      if (index !== -1) {
        this.parent.children.splice(index, 1);
      }
    }

    this.parent = parent;
    this.config.parentId = parent?.getId();

    // Add to new parent
    if (parent) {
      parent.children.push(this);
    }
  }

  /**
   * Add child layer
   */
  addChild(child: Layer): void {
    child.setParent(this);
  }

  /**
   * Remove child layer
   */
  removeChild(child: Layer): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.setParent(null);
    }
  }

  /**
   * Get world transform (including parent transforms)
   */
  getWorldTransform(): LayerTransform {
    if (!this.parent) {
      return { ...this.config.transform };
    }

    const parentTransform = this.parent.getWorldTransform();
    const localTransform = this.config.transform;

    // Combine transforms
    return {
      position: {
        x: parentTransform.position.x + localTransform.position.x,
        y: parentTransform.position.y + localTransform.position.y
      },
      scale: {
        x: parentTransform.scale.x * localTransform.scale.x,
        y: parentTransform.scale.y * localTransform.scale.y
      },
      rotation: parentTransform.rotation + localTransform.rotation,
      opacity: parentTransform.opacity * localTransform.opacity
    };
  }

  /**
   * Resize layer canvas
   */
  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.markDirty();
  }

  /**
   * Clone layer
   */
  clone(newId?: string): Layer {
    const clonedConfig: LayerConfig = {
      ...this.config,
      id: newId || `${this.config.id}_clone`,
      name: `${this.config.name} Copy`,
      transform: {
        position: { ...this.config.transform.position },
        scale: { ...this.config.transform.scale },
        rotation: this.config.transform.rotation,
        opacity: this.config.transform.opacity
      }
    };

    const clonedLayer = new Layer(clonedConfig);
    
    // Copy objects (shallow copy)
    this.objects.forEach((object, id) => {
      clonedLayer.addObject(id, object);
    });

    return clonedLayer;
  }

  /**
   * Export layer as image data URL
   */
  toDataURL(type: string = 'image/png', quality?: number): string {
    this.render(true);
    return this.canvas.toDataURL(type, quality);
  }

  /**
   * Get layer statistics
   */
  getStats(): {
    objectCount: number;
    memoryUsage: number;
    isDirty: boolean;
    childCount: number;
  } {
    const memoryUsage = this.canvas.width * this.canvas.height * 4; // RGBA bytes
    
    return {
      objectCount: this.objects.size,
      memoryUsage,
      isDirty: this.isDirty,
      childCount: this.children.length
    };
  }

  // Getters
  getId(): string { return this.config.id; }
  getName(): string { return this.config.name; }
  getWidth(): number { return this.config.width; }
  getHeight(): number { return this.config.height; }
  getZIndex(): number { return this.config.zIndex; }
  isVisible(): boolean { return this.config.visible; }
  isLocked(): boolean { return this.config.locked; }
  getBlendMode(): BlendMode { return this.config.blendMode; }
  getTransform(): LayerTransform { return { ...this.config.transform }; }
  getCanvas(): HTMLCanvasElement { return this.canvas; }
  getContext(): CanvasRenderingContext2D { return this.ctx; }
  getParent(): Layer | null { return this.parent; }
  getChildren(): Layer[] { return [...this.children]; }
  getObjectCount(): number { return this.objects.size; }
  isDirtyFlag(): boolean { return this.isDirty; }

  // Setters
  setName(name: string): void { 
    this.config.name = name; 
  }
}