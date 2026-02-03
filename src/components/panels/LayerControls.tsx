// src/components/panels/LayerControls.tsx - Layer management interface

import React, { useState } from 'react';
import { LayerConfig, BlendMode } from '../../types';
import GlassPanel from '../ui/GlassPanel';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';

export interface LayerControlsProps {
  layers: LayerConfig[];
  activeLayerId?: string;
  onLayerAdd: () => void;
  onLayerRemove: (layerId: string) => void;
  onLayerUpdate: (layerId: string, updates: Partial<LayerConfig>) => void;
  onLayerReorder: (layerIds: string[]) => void;
  onLayerSelect: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  className?: string;
}

const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  activeLayerId,
  onLayerAdd,
  onLayerRemove,
  onLayerUpdate,
  onLayerReorder,
  onLayerSelect,
  onLayerDuplicate,
  className = ''
}) => {
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null);
  const [dragOverLayer, setDragOverLayer] = useState<string | null>(null);

  // Blend mode options
  const blendModes = [
    { value: BlendMode.NORMAL, label: 'Normal' },
    { value: BlendMode.MULTIPLY, label: 'Multiply' },
    { value: BlendMode.SCREEN, label: 'Screen' },
    { value: BlendMode.OVERLAY, label: 'Overlay' },
    { value: BlendMode.DARKEN, label: 'Darken' },
    { value: BlendMode.LIGHTEN, label: 'Lighten' },
    { value: BlendMode.COLOR_DODGE, label: 'Color Dodge' },
    { value: BlendMode.COLOR_BURN, label: 'Color Burn' },
    { value: BlendMode.HARD_LIGHT, label: 'Hard Light' },
    { value: BlendMode.SOFT_LIGHT, label: 'Soft Light' },
    { value: BlendMode.DIFFERENCE, label: 'Difference' },
    { value: BlendMode.EXCLUSION, label: 'Exclusion' }
  ];

  // Handle drag and drop reordering
  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayer(layerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLayer(layerId);
  };

  const handleDragLeave = () => {
    setDragOverLayer(null);
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    
    if (!draggedLayer || draggedLayer === targetLayerId) {
      setDraggedLayer(null);
      setDragOverLayer(null);
      return;
    }

    const draggedIndex = layers.findIndex(l => l.id === draggedLayer);
    const targetIndex = layers.findIndex(l => l.id === targetLayerId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newLayers = [...layers];
    const [draggedItem] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(targetIndex, 0, draggedItem);

    onLayerReorder(newLayers.map(l => l.id));
    setDraggedLayer(null);
    setDragOverLayer(null);
  };

  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <GlassPanel
      variant="floating"
      className={`w-80 max-h-[70vh] ${className}`}
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white/90">Layers</h3>
          <Button
            size="sm"
            variant="primary"
            onClick={onLayerAdd}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Layer
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Layer List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              draggable
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, layer.id)}
              className={`
                glass-card p-3 cursor-pointer transition-all duration-200
                ${activeLayerId === layer.id ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''}
                ${dragOverLayer === layer.id ? 'ring-2 ring-cyan-500/50' : ''}
                ${draggedLayer === layer.id ? 'opacity-50' : ''}
                hover:bg-white/5
              `}
              onClick={() => onLayerSelect(layer.id)}
            >
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-white/50">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </div>

                {/* Visibility Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerUpdate(layer.id, { visible: !layer.visible });
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {layer.visible ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/90 truncate">
                      {layer.name}
                    </span>
                    <span className="text-xs text-white/50">
                      {index + 1}
                    </span>
                  </div>
                  <div className="text-xs text-white/60">
                    {blendModes.find(m => m.value === layer.blendMode)?.label} • {Math.round(layer.opacity * 100)}%
                  </div>
                </div>

                {/* Lock Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerUpdate(layer.id, { locked: !layer.locked });
                  }}
                  className={`text-white/70 hover:text-white transition-colors ${layer.locked ? 'text-yellow-400' : ''}`}
                >
                  {layer.locked ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                  )}
                </button>

                {/* Layer Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDuplicate(layer.id);
                    }}
                    className="text-white/50 hover:text-white/80 transition-colors"
                    title="Duplicate layer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  {layers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerRemove(layer.id);
                      }}
                      className="text-red-400/70 hover:text-red-400 transition-colors"
                      title="Delete layer"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Layer Properties */}
        {activeLayer && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white/90">Layer Properties</h4>
            
            {/* Layer Name */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Name
              </label>
              <input
                type="text"
                value={activeLayer.name}
                onChange={(e) => onLayerUpdate(activeLayer.id, { name: e.target.value })}
                className="glass-input w-full"
                placeholder="Layer name"
              />
            </div>

            {/* Opacity */}
            <Slider
              label="Opacity"
              value={activeLayer.opacity * 100}
              onChange={(value) => onLayerUpdate(activeLayer.id, { opacity: value / 100 })}
              min={0}
              max={100}
              step={1}
              formatValue={(val) => `${val}%`}
            />

            {/* Blend Mode */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Blend Mode
              </label>
              <select
                value={activeLayer.blendMode}
                onChange={(e) => onLayerUpdate(activeLayer.id, { blendMode: e.target.value as BlendMode })}
                className="glass-input w-full"
              >
                {blendModes.map(mode => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Z-Index */}
            <Slider
              label="Z-Index"
              value={activeLayer.zIndex}
              onChange={(value) => onLayerUpdate(activeLayer.id, { zIndex: value })}
              min={-10}
              max={10}
              step={1}
              description="Layer stacking order"
            />

            {/* Layer Toggles */}
            <div className="space-y-3">
              <Toggle
                checked={activeLayer.visible}
                onChange={(checked) => onLayerUpdate(activeLayer.id, { visible: checked })}
                label="Visible"
                description="Show/hide this layer"
              />

              <Toggle
                checked={activeLayer.locked}
                onChange={(checked) => onLayerUpdate(activeLayer.id, { locked: checked })}
                label="Locked"
                description="Prevent modifications to this layer"
              />
            </div>
          </div>
        )}

        {/* Layer Actions */}
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Merge all visible layers
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            }
            className="flex-1"
          >
            Merge
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Flatten all layers
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            className="flex-1"
          >
            Flatten
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
};

export default LayerControls;