// src/components/ui/Toggle.tsx - Switch components with glass styling

import React, { useState, useRef } from 'react';
import '../../styles/glassmorphism.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  label?: string;
  description?: string;
  labelPosition?: 'left' | 'right';
  showIcons?: boolean;
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
  animated?: boolean;
  className?: string;
  id?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  label,
  description,
  labelPosition = 'right',
  showIcons = false,
  checkedIcon,
  uncheckedIcon,
  animated = true,
  className = '',
  id
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleToggle();
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      text: 'text-sm',
      icon: 'w-2 h-2'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      text: 'text-base',
      icon: 'w-3 h-3'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
      text: 'text-lg',
      icon: 'w-4 h-4'
    }
  };

  // Variant colors
  const variantConfig = {
    default: {
      checked: 'bg-blue-500 border-blue-400',
      unchecked: 'bg-white/10 border-white/20'
    },
    primary: {
      checked: 'bg-blue-600 border-blue-500',
      unchecked: 'bg-white/10 border-white/20'
    },
    secondary: {
      checked: 'bg-cyan-500 border-cyan-400',
      unchecked: 'bg-white/10 border-white/20'
    },
    accent: {
      checked: 'bg-pink-500 border-pink-400',
      unchecked: 'bg-white/10 border-white/20'
    },
    success: {
      checked: 'bg-green-500 border-green-400',
      unchecked: 'bg-white/10 border-white/20'
    },
    warning: {
      checked: 'bg-yellow-500 border-yellow-400',
      unchecked: 'bg-white/10 border-white/20'
    },
    error: {
      checked: 'bg-red-500 border-red-400',
      unchecked: 'bg-white/10 border-white/20'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Default icons
  const defaultCheckedIcon = (
    <svg className={currentSize.icon} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  const defaultUncheckedIcon = (
    <svg className={currentSize.icon} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  const renderToggle = () => (
    <button
      ref={toggleRef}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={description ? `${id}-description` : undefined}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`
        relative
        inline-flex
        items-center
        ${currentSize.track}
        border-2
        rounded-full
        cursor-pointer
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/50
        focus:ring-offset-2
        focus:ring-offset-transparent
        ${animated ? 'transition-all duration-300 ease-out' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${checked ? currentVariant.checked : currentVariant.unchecked}
        ${isFocused ? 'ring-2 ring-blue-500/50' : ''}
      `}
    >
      {/* Track Background */}
      <div className="absolute inset-0 rounded-full glass" />

      {/* Thumb */}
      <div
        className={`
          relative
          ${currentSize.thumb}
          bg-white
          rounded-full
          shadow-lg
          flex
          items-center
          justify-center
          ${animated ? 'transition-all duration-300 ease-out' : ''}
          ${checked ? currentSize.translate : 'translate-x-0.5'}
          ${disabled ? '' : 'hover:scale-105'}
        `}
      >
        {/* Icon */}
        {showIcons && (
          <div className="text-gray-600">
            {checked 
              ? (checkedIcon || defaultCheckedIcon)
              : (uncheckedIcon || defaultUncheckedIcon)
            }
          </div>
        )}

        {/* Ripple Effect */}
        {!disabled && (
          <div
            className={`
              absolute
              inset-0
              rounded-full
              bg-white/30
              scale-0
              ${animated ? 'transition-transform duration-200' : ''}
              ${isFocused ? 'scale-150' : ''}
            `}
          />
        )}
      </div>

      {/* Glow Effect */}
      {checked && !disabled && (
        <div
          className={`
            absolute
            inset-0
            rounded-full
            ${currentVariant.checked}
            opacity-30
            blur-sm
            scale-110
            ${animated ? 'transition-all duration-300' : ''}
          `}
        />
      )}
    </button>
  );

  const renderLabel = () => (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={id}
          className={`
            font-medium
            text-white/90
            cursor-pointer
            ${currentSize.text}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          {label}
        </label>
      )}
      {description && (
        <p
          id={`${id}-description`}
          className="text-sm text-white/60 mt-1"
        >
          {description}
        </p>
      )}
    </div>
  );

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {labelPosition === 'left' && renderLabel()}
      {renderToggle()}
      {labelPosition === 'right' && renderLabel()}
    </div>
  );
};

// Preset toggle variants
export const ToggleCard: React.FC<ToggleProps & { children?: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <div className="glass-card p-4">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {children}
      </div>
      <Toggle {...props} />
    </div>
  </div>
);

export const ToggleGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {children}
  </div>
);

export default Toggle;