// src/components/ui/ColorPicker.tsx - Modern color selection component

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../types';
import '../../styles/glassmorphism.css';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  showAlpha?: boolean;
  showPresets?: boolean;
  presets?: string[];
  showHex?: boolean;
  showRgb?: boolean;
  showHsl?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  disabled = false,
  showAlpha = false,
  showPresets = true,
  presets = [
    '#ff0000', '#ff8800', '#ffff00', '#88ff00', '#00ff00', '#00ff88',
    '#00ffff', '#0088ff', '#0000ff', '#8800ff', '#ff00ff', '#ff0088',
    '#ffffff', '#cccccc', '#888888', '#444444', '#000000'
  ],
  showHex = true,
  showRgb = false,
  showHsl = false,
  size = 'md',
  className = '',
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>({ h: 0, s: 100, v: 100 });
  const [alpha, setAlpha] = useState(1);
  const [inputValue, setInputValue] = useState(value);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  // Convert hex to HSV
  const hexToHsv = useCallback((hex: string): HSV => {
    const rgb = hexToRgb(hex);
    if (!rgb) return { h: 0, s: 0, v: 0 };
    return rgbToHsv(rgb);
  }, []);

  // Convert hex to RGB
  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert RGB to HSV
  const rgbToHsv = (rgb: RGB): HSV => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;

    if (diff !== 0) {
      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  // Convert HSV to RGB
  const hsvToRgb = (hsv: HSV): RGB => {
    const h = hsv.h / 360;
    const s = hsv.s / 100;
    const v = hsv.v / 100;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r, g, b;

    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
      default: r = g = b = 0;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Convert RGB to hex
  const rgbToHex = (rgb: RGB): string => {
    return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
  };

  // Convert HSV to hex
  const hsvToHex = (hsv: HSV): string => {
    const rgb = hsvToRgb(hsv);
    return rgbToHex(rgb);
  };

  // Update HSV when value changes
  useEffect(() => {
    const newHsv = hexToHsv(value);
    setHsv(newHsv);
    setInputValue(value);
  }, [value, hexToHsv]);

  // Handle saturation/value picker
  const handleSaturationChange = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!saturationRef.current) return;

    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

    const s = (x / rect.width) * 100;
    const v = ((rect.height - y) / rect.height) * 100;

    const newHsv = { ...hsv, s, v };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv));
  };

  // Handle hue picker
  const handleHueChange = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!hueRef.current) return;

    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const h = (x / rect.width) * 360;

    const newHsv = { ...hsv, h };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv));
  };

  // Handle alpha picker
  const handleAlphaChange = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!alphaRef.current) return;

    const rect = alphaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const newAlpha = x / rect.width;

    setAlpha(newAlpha);
    // Note: Alpha handling would need to be implemented in the parent component
  };

  // Handle preset selection
  const handlePresetClick = (preset: string) => {
    onChange(preset);
    setIsOpen(false);
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const currentColor = hsvToHex(hsv);

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-white/90 mb-2">
          {label}
        </label>
      )}
      
      {/* Color Trigger */}
      <button
        type="button"
        className={`
          ${sizeClasses[size]} 
          glass-button 
          border-2 
          border-white/20 
          rounded-lg 
          overflow-hidden 
          transition-all 
          duration-200 
          hover:scale-105 
          focus:ring-2 
          focus:ring-blue-500/50
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{ backgroundColor: currentColor }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label="Open color picker"
      >
        <div className="w-full h-full" style={{ backgroundColor: currentColor }} />
      </button>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 animate-slide-in-down">
          <div className="glass-panel p-4 w-64">
            {/* Saturation/Value Picker */}
            <div
              ref={saturationRef}
              className="relative w-full h-32 mb-4 rounded-lg overflow-hidden cursor-crosshair"
              style={{
                background: `linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
              }}
              onClick={handleSaturationChange}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, #000, transparent)',
                }}
              />
              <div
                className="absolute w-3 h-3 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                }}
              />
            </div>

            {/* Hue Picker */}
            <div
              ref={hueRef}
              className="relative w-full h-4 mb-4 rounded-lg cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
              }}
              onClick={handleHueChange}
            >
              <div
                className="absolute w-3 h-6 bg-white border border-gray-300 rounded transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${(hsv.h / 360) * 100}%`, top: '50%' }}
              />
            </div>

            {/* Alpha Picker */}
            {showAlpha && (
              <div
                ref={alphaRef}
                className="relative w-full h-4 mb-4 rounded-lg cursor-pointer"
                style={{
                  background: `linear-gradient(to right, transparent, ${currentColor})`,
                  backgroundImage: 'url("data:image/svg+xml,%3csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cdefs%3e%3cpattern id=\'checkerboard\' patternUnits=\'userSpaceOnUse\' width=\'8\' height=\'8\'%3e%3crect width=\'4\' height=\'4\' fill=\'%23ffffff\'/%3e%3crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'%23ffffff\'/%3e%3crect x=\'4\' width=\'4\' height=\'4\' fill=\'%23cccccc\'/%3e%3crect y=\'4\' width=\'4\' height=\'4\' fill=\'%23cccccc\'/%3e%3c/pattern%3e%3c/defs%3e%3crect width=\'100%25\' height=\'100%25\' fill=\'url(%23checkerboard)\'/%3e%3c/svg%3e")',
                }}
                onClick={handleAlphaChange}
              >
                <div
                  className="absolute w-3 h-6 bg-white border border-gray-300 rounded transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: `${alpha * 100}%`, top: '50%' }}
                />
              </div>
            )}

            {/* Color Input */}
            {showHex && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Hex
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="glass-input w-full text-sm"
                  placeholder="#000000"
                />
              </div>
            )}

            {/* RGB Inputs */}
            {showRgb && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {['R', 'G', 'B'].map((channel, index) => {
                  const rgb = hsvToRgb(hsv);
                  const values = [rgb.r, rgb.g, rgb.b];
                  return (
                    <div key={channel}>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        {channel}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={values[index]}
                        onChange={(e) => {
                          const newValues = [...values];
                          newValues[index] = parseInt(e.target.value) || 0;
                          const newRgb = { r: newValues[0], g: newValues[1], b: newValues[2] };
                          const newHsv = rgbToHsv(newRgb);
                          setHsv(newHsv);
                          onChange(rgbToHex(newRgb));
                        }}
                        className="glass-input w-full text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Color Presets */}
            {showPresets && presets.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">
                  Presets
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {presets.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-8 h-8 rounded border border-white/20 hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset }}
                      onClick={() => handlePresetClick(preset)}
                      aria-label={`Select color ${preset}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;