// src/components/ui/Slider.tsx - Range inputs with glass styling

import React, { useState, useRef, useCallback, useEffect } from 'react';
import '../../styles/glassmorphism.css';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  showValue?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  formatValue?: (value: number) => string;
  label?: string;
  description?: string;
  className?: string;
  vertical?: boolean;
  gradient?: boolean;
  animated?: boolean;
  onChangeStart?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  size = 'md',
  variant = 'default',
  showValue = true,
  showTicks = false,
  tickCount = 5,
  formatValue = (val) => val.toString(),
  label,
  description,
  className = '',
  vertical = false,
  gradient = false,
  animated = true,
  onChangeStart,
  onChangeEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Calculate percentage
  const percentage = ((localValue - min) / (max - min)) * 100;

  // Handle mouse/touch events
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (disabled) return;

    setIsDragging(true);
    onChangeStart?.(localValue);
    
    // Capture pointer for smooth dragging
    if (thumbRef.current) {
      thumbRef.current.setPointerCapture(event.pointerId);
    }
  }, [disabled, localValue, onChangeStart]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!isDragging || !sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    let newPercentage: number;

    if (vertical) {
      newPercentage = ((rect.bottom - event.clientY) / rect.height) * 100;
    } else {
      newPercentage = ((event.clientX - rect.left) / rect.width) * 100;
    }

    // Clamp percentage
    newPercentage = Math.max(0, Math.min(100, newPercentage));
    
    // Convert to value
    const newValue = min + (newPercentage / 100) * (max - min);
    
    // Apply step
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    setLocalValue(clampedValue);
    onChange(clampedValue);
  }, [isDragging, disabled, vertical, min, max, step, onChange]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    onChangeEnd?.(localValue);

    // Release pointer capture
    if (thumbRef.current) {
      thumbRef.current.releasePointerCapture(event.pointerId);
    }
  }, [isDragging, localValue, onChangeEnd]);

  // Handle track click
  const handleTrackClick = useCallback((event: React.MouseEvent) => {
    if (disabled || isDragging) return;

    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;

    let newPercentage: number;

    if (vertical) {
      newPercentage = ((rect.bottom - event.clientY) / rect.height) * 100;
    } else {
      newPercentage = ((event.clientX - rect.left) / rect.width) * 100;
    }

    // Clamp percentage
    newPercentage = Math.max(0, Math.min(100, newPercentage));
    
    // Convert to value
    const newValue = min + (newPercentage / 100) * (max - min);
    
    // Apply step
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    setLocalValue(clampedValue);
    onChange(clampedValue);
  }, [disabled, isDragging, vertical, min, max, step, onChange]);

  // Generate tick marks
  const generateTicks = () => {
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const tickValue = min + (i / (tickCount - 1)) * (max - min);
      const tickPercentage = ((tickValue - min) / (max - min)) * 100;
      
      ticks.push(
        <div
          key={i}
          className={`absolute w-1 h-1 bg-white/30 rounded-full ${
            vertical ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2'
          }`}
          style={{
            [vertical ? 'bottom' : 'left']: `${tickPercentage}%`
          }}
        />
      );
    }
    return ticks;
  };

  // Size classes
  const sizeClasses = {
    sm: {
      track: vertical ? 'w-2 h-32' : 'h-2 w-full',
      thumb: 'w-4 h-4',
      text: 'text-xs'
    },
    md: {
      track: vertical ? 'w-3 h-40' : 'h-3 w-full',
      thumb: 'w-5 h-5',
      text: 'text-sm'
    },
    lg: {
      track: vertical ? 'w-4 h-48' : 'h-4 w-full',
      thumb: 'w-6 h-6',
      text: 'text-base'
    }
  };

  // Variant colors
  const variantClasses = {
    default: 'bg-blue-500',
    primary: 'bg-blue-600',
    secondary: 'bg-cyan-500',
    accent: 'bg-pink-500'
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className={`slider-container ${vertical ? 'flex flex-row items-center' : 'flex flex-col'} ${className}`}>
      {/* Label */}
      {label && (
        <label className={`block font-medium text-white/90 mb-2 ${currentSize.text}`}>
          {label}
          {showValue && (
            <span className="ml-2 text-white/70">
              ({formatValue(localValue)})
            </span>
          )}
        </label>
      )}

      {/* Slider Track */}
      <div
        className={`
          relative 
          ${currentSize.track} 
          ${vertical ? 'mr-4' : 'mb-2'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Background Track */}
        <div
          ref={sliderRef}
          className={`
            glass-slider
            relative 
            ${currentSize.track} 
            glass 
            rounded-full 
            ${animated ? 'transition-all duration-200' : ''}
          `}
          onClick={handleTrackClick}
        >
          {/* Progress Fill */}
          <div
            className={`
              absolute 
              ${vertical ? 'bottom-0 left-0 right-0' : 'left-0 top-0 bottom-0'} 
              rounded-full 
              ${gradient 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                : currentVariant
              }
              ${animated ? 'transition-all duration-200' : ''}
            `}
            style={{
              [vertical ? 'height' : 'width']: `${percentage}%`
            }}
          />

          {/* Tick Marks */}
          {showTicks && generateTicks()}

          {/* Thumb */}
          <div
            ref={thumbRef}
            className={`
              absolute 
              ${currentSize.thumb} 
              glass-button 
              border-2 
              ${isDragging ? 'border-white scale-110' : 'border-white/50'} 
              rounded-full 
              cursor-grab 
              ${isDragging ? 'cursor-grabbing' : ''} 
              transform 
              -translate-x-1/2 
              ${vertical ? '-translate-y-1/2' : '-translate-y-1/2'}
              ${animated ? 'transition-all duration-200' : ''}
              ${disabled ? 'cursor-not-allowed' : ''}
              hover:scale-105
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/50
            `}
            style={{
              [vertical ? 'bottom' : 'left']: `${percentage}%`,
              [vertical ? 'left' : 'top']: '50%'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={localValue}
            aria-label={label || 'Slider'}
            onKeyDown={(e) => {
              if (disabled) return;
              
              let newValue = localValue;
              
              switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                  newValue = Math.max(min, localValue - step);
                  break;
                case 'ArrowRight':
                case 'ArrowUp':
                  newValue = Math.min(max, localValue + step);
                  break;
                case 'Home':
                  newValue = min;
                  break;
                case 'End':
                  newValue = max;
                  break;
                case 'PageDown':
                  newValue = Math.max(min, localValue - (max - min) / 10);
                  break;
                case 'PageUp':
                  newValue = Math.min(max, localValue + (max - min) / 10);
                  break;
                default:
                  return;
              }
              
              e.preventDefault();
              setLocalValue(newValue);
              onChange(newValue);
            }}
          >
            {/* Thumb Glow Effect */}
            {isDragging && (
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Value Display */}
      {showValue && !label && (
        <div className={`text-center text-white/70 ${currentSize.text}`}>
          {formatValue(localValue)}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-white/50 mt-1">
          {description}
        </p>
      )}

      {/* Min/Max Labels */}
      <div className={`flex justify-between text-xs text-white/50 ${vertical ? 'flex-col-reverse h-full' : 'w-full'}`}>
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default Slider;