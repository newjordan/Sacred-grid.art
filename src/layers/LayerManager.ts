// src/layers/LayerManager.ts - Layer orchestration and management

import { Layer, LayerConfig, BlendMode, LayerTransform } from './Layer';
import { Vector2D } from '../types';

/**
 * Layer manager events
 */
export interface LayerManagerEvents {
  layerAdded: (layer: Layer) => void;
  layerRemoved: (layerId: string) => void;
  layerReordered: (layerId: string, newIndex: number) => void;
  layerVisibilityChanged: (layerId: string, visible: boolean) => void;
  layerTransformChanged: (layerId: string, transform: LayerTransform) => void;
}

/**
 * Layer selection state
 */
export interface LayerSelection {
  selectedLayers: Set<string>;
  activeLayer: string | null;
}

/**
 * Layer manager for orchestrating multiple layers
 */
export class LayerManager {
  private layers: Map<string, Layer> = new Map();
  private layerOrder: string[] = [];
  private selection: LayerSelection = {
    selectedLayers: new Set(),
    activeLayer: null
  };
  private eventListeners: Partial<LayerManagerEvents> = {};
  private compositeCanvas: HTMLCanvasElement;
  private compositeCtx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    // Create composite canvas for final rendering
    this.compositeCanvas = document.createElement('canvas');
    this.compositeCanvas.width = width;
    this.compositeCanvas.height = height;
    this.compositeCtx = this.compositeCanvas.getContext('2d')!;
  }

  /**
   * Add a layer
   */
  addLayer(config: LayerConfig): Layer {
    const layer = new Layer(config);
    this.layers.set(config.id, layer);
    
    // Insert in correct z-index order
    this.insertLayerInOrder(config.id, config.zIndex);
    
    this.eventListeners.layerAdded?.(layer);
    return layer;
  }

  /**
   * Remove a layer
   */
  removeLayer(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    // Remove from selection
    this.deselectLayer(layerId);
    if (this.selection.activeLayer === layerId) {
      this.selection.activeLayer = null;
    }

    // Remove from parent/children relationships
    layer.setParent(null);
    layer.getChildren().forEach(child => {
      child.setParent(null);
    });

    // Remove from maps and order
    this.layers.delete(layerId);
    const orderIndex = this.layerOrder.indexOf(layerId);
    if (orderIndex !== -1) {
      this.layerOrder.splice(orderIndex, 1);
    }

    this.eventListeners.layerRemoved?.(layerId);
    return true;
  }

  /**
   * Get a layer by ID
   */
  getLayer(layerId: string): Layer | undefined {
    return this.layers.get(layerId);
  }

  /**
   * Get all layers
   */
  getAllLayers(): Layer[] {
    return this.layerOrder.map(id => this.layers.get(id)!).filter(Boolean);
  }

  /**
   * Get visible layers in render order
   */
  getVisibleLayers(): Layer[] {
    return this.getAllLayers().filter(layer => layer.isVisible());
  }

  /**
   * Insert layer in correct z-index order
   */
  private insertLayerInOrder(layerId: string, zIndex: number): void {
    // Remove if already exists
    const existingIndex = this.layerOrder.indexOf(layerId);
    if (existingIndex !== -1) {
      this.layerOrder.splice(existingIndex, 1);
    }

    // Find insertion point
    let insertIndex = 0;
    for (let i = 0; i < this.layerOrder.length; i++) {
      const layer = this.layers.get(this.layerOrder[i]);
      if (layer && layer.getZIndex() > zIndex) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }

    this.layerOrder.splice(insertIndex, 0, layerId);
  }

  /**
   * Reorder layer
   */
  reorderLayer(layerId: string, newZIndex: number): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.setZIndex(newZIndex);
    this.insertLayerInOrder(layerId, newZIndex);
    
    this.eventListeners.layerReordered?.(layerId, newZIndex);
    return true;
  }

  /**
   * Move layer up in order
   */
  moveLayerUp(layerId: string): boolean {
    const currentIndex = this.layerOrder.indexOf(layerId);
    if (currentIndex === -1 || currentIndex === this.layerOrder.length - 1) {
      return false;
    }

    // Swap with next layer
    const nextLayerId = this.layerOrder[currentIndex + 1];
    const currentLayer = this.layers.get(layerId)!;
    const nextLayer = this.layers.get(nextLayerId)!;

    const tempZIndex = currentLayer.getZIndex();
    currentLayer.setZIndex(nextLayer.getZIndex());
    nextLayer.setZIndex(tempZIndex);

    // Update order
    this.layerOrder[currentIndex] = nextLayerId;
    this.layerOrder[currentIndex + 1] = layerId;

    return true;
  }

  /**
   * Move layer down in order
   */
  moveLayerDown(layerId: string): boolean {
    const currentIndex = this.layerOrder.indexOf(layerId);
    if (currentIndex === -1 || currentIndex === 0) {
      return false;
    }

    // Swap with previous layer
    const prevLayerId = this.layerOrder[currentIndex - 1];
    const currentLayer = this.layers.get(layerId)!;
    const prevLayer = this.layers.get(prevLayerId)!;

    const tempZIndex = currentLayer.getZIndex();
    currentLayer.setZIndex(prevLayer.getZIndex());
    prevLayer.setZIndex(tempZIndex);

    // Update order
    this.layerOrder[currentIndex] = prevLayerId;
    this.layerOrder[currentIndex - 1] = layerId;

    return true;
  }

  /**
   * Duplicate a layer
   */
  duplicateLayer(layerId: string, newId?: string): Layer | null {
    const layer = this.layers.get(layerId);
    if (!layer) return null;

    const duplicatedLayer = layer.clone(newId);
    this.layers.set(duplicatedLayer.getId(), duplicatedLayer);
    this.insertLayerInOrder(duplicatedLayer.getId(), duplicatedLayer.getZIndex() + 1);

    this.eventListeners.layerAdded?.(duplicatedLayer);
    return duplicatedLayer;
  }

  /**
   * Group selected layers
   */
  groupLayers(groupId: string, groupName: string): Layer | null {
    const selectedLayers = Array.from(this.selection.selectedLayers)
      .map(id => this.layers.get(id))
      .filter(Boolean) as Layer[];

    if (selectedLayers.length < 2) return null;

    // Create group layer
    const groupConfig: LayerConfig = {
      id: groupId,
      name: groupName,
      width: this.compositeCanvas.width,
      height: this.compositeCanvas.height,
      zIndex: Math.max(...selectedLayers.map(l => l.getZIndex())),
      visible: true,
      locked: false,
      blendMode: 'normal',
      transform: {
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        opacity: 1
      }
    };

    const groupLayer = this.addLayer(groupConfig);

    // Move selected layers to group
    selectedLayers.forEach(layer => {
      layer.setParent(groupLayer);
    });

    return groupLayer;
  }

  /**
   * Ungroup layers
   */
  ungroupLayer(groupId: string): boolean {
    const groupLayer = this.layers.get(groupId);
    if (!groupLayer) return false;

    const children = groupLayer.getChildren();
    
    // Move children back to root level
    children.forEach(child => {
      child.setParent(null);
    });

    // Remove group layer
    return this.removeLayer(groupId);
  }

  /**
   * Render all layers to composite canvas
   */
  render(clearCanvas: boolean = true): void {
    if (clearCanvas) {
      this.compositeCtx.clearRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);
    }

    // Render layers in order (bottom to top)
    const visibleLayers = this.getVisibleLayers();
    
    visibleLayers.forEach(layer => {
      // Render layer to its own canvas
      layer.render();
      
      // Composite onto main canvas
      layer.composite(this.compositeCtx);
    });
  }

  /**
   * Render specific layers
   */
  renderLayers(layerIds: string[], clearCanvas: boolean = true): void {
    if (clearCanvas) {
      this.compositeCtx.clearRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);
    }

    const layersToRender = layerIds
      .map(id => this.layers.get(id))
      .filter(layer => layer && layer.isVisible()) as Layer[];

    // Sort by z-index
    layersToRender.sort((a, b) => a.getZIndex() - b.getZIndex());

    layersToRender.forEach(layer => {
      layer.render();
      layer.composite(this.compositeCtx);
    });
  }

  /**
   * Select layer
   */
  selectLayer(layerId: string, addToSelection: boolean = false): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    if (!addToSelection) {
      this.selection.selectedLayers.clear();
    }

    this.selection.selectedLayers.add(layerId);
    this.selection.activeLayer = layerId;

    return true;
  }

  /**
   * Deselect layer
   */
  deselectLayer(layerId: string): boolean {
    const wasSelected = this.selection.selectedLayers.has(layerId);
    this.selection.selectedLayers.delete(layerId);

    if (this.selection.activeLayer === layerId) {
      // Set new active layer from remaining selection
      const remaining = Array.from(this.selection.selectedLayers);
      this.selection.activeLayer = remaining.length > 0 ? remaining[0] : null;
    }

    return wasSelected;
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selection.selectedLayers.clear();
    this.selection.activeLayer = null;
  }

  /**
   * Get selected layers
   */
  getSelectedLayers(): Layer[] {
    return Array.from(this.selection.selectedLayers)
      .map(id => this.layers.get(id))
      .filter(Boolean) as Layer[];
  }

  /**
   * Get active layer
   */
  getActiveLayer(): Layer | null {
    return this.selection.activeLayer ? 
           this.layers.get(this.selection.activeLayer) || null : 
           null;
  }

  /**
   * Find layer at point
   */
  getLayerAtPoint(point: Vector2D): Layer | null {
    // Check layers from top to bottom
    const layers = this.getAllLayers().reverse();
    
    for (const layer of layers) {
      if (layer.isVisible() && !layer.isLocked() && layer.containsPoint(point)) {
        return layer;
      }
    }

    return null;
  }

  /**
   * Set layer visibility
   */
  setLayerVisibility(layerId: string, visible: boolean): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.setVisible(visible);
    this.eventListeners.layerVisibilityChanged?.(layerId, visible);
    return true;
  }

  /**
   * Set layer transform
   */
  setLayerTransform(layerId: string, transform: Partial<LayerTransform>): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    const currentTransform = layer.getTransform();
    const newTransform = { ...currentTransform, ...transform };

    if (transform.position) layer.setPosition(transform.position);
    if (transform.scale) layer.setScale(transform.scale);
    if (transform.rotation !== undefined) layer.setRotation(transform.rotation);
    if (transform.opacity !== undefined) layer.setOpacity(transform.opacity);

    this.eventListeners.layerTransformChanged?.(layerId, newTransform);
    return true;
  }

  /**
   * Apply transform to selected layers
   */
  transformSelectedLayers(transform: Partial<LayerTransform>): void {
    this.getSelectedLayers().forEach(layer => {
      this.setLayerTransform(layer.getId(), transform);
    });
  }

  /**
   * Resize composite canvas
   */
  resize(width: number, height: number): void {
    this.compositeCanvas.width = width;
    this.compositeCanvas.height = height;

    // Optionally resize all layers
    this.layers.forEach(layer => {
      layer.resize(width, height);
    });
  }

  /**
   * Export composite as data URL
   */
  exportComposite(type: string = 'image/png', quality?: number): string {
    this.render();
    return this.compositeCanvas.toDataURL(type, quality);
  }

  /**
   * Get layer manager statistics
   */
  getStats(): {
    layerCount: number;
    visibleLayerCount: number;
    selectedLayerCount: number;
    totalMemoryUsage: number;
  } {
    const visibleLayerCount = this.getVisibleLayers().length;
    const selectedLayerCount = this.selection.selectedLayers.size;
    
    let totalMemoryUsage = 0;
    this.layers.forEach(layer => {
      totalMemoryUsage += layer.getStats().memoryUsage;
    });

    return {
      layerCount: this.layers.size,
      visibleLayerCount,
      selectedLayerCount,
      totalMemoryUsage
    };
  }

  /**
   * Add event listener
   */
  on<K extends keyof LayerManagerEvents>(event: K, listener: LayerManagerEvents[K]): void {
    this.eventListeners[event] = listener;
  }

  /**
   * Remove event listener
   */
  off<K extends keyof LayerManagerEvents>(event: K): void {
    delete this.eventListeners[event];
  }

  /**
   * Clear all layers
   */
  clear(): void {
    this.layers.clear();
    this.layerOrder = [];
    this.clearSelection();
  }

  /**
   * Get composite canvas
   */
  getCompositeCanvas(): HTMLCanvasElement {
    return this.compositeCanvas;
  }

  /**
   * Get layer count
   */
  getLayerCount(): number {
    return this.layers.size;
  }

  /**
   * Get layer order
   */
  getLayerOrder(): string[] {
    return [...this.layerOrder];
  }
}