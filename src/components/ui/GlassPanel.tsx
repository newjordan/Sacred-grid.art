// src/components/ui/GlassPanel.tsx - Base glass container component

import React, { forwardRef, HTMLAttributes, ReactNode } from 'react';
import '../../styles/glassmorphism.css';

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'light' | 'heavy' | 'subtle' | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  blur?: 'light' | 'normal' | 'heavy';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animated?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  error?: string | null;
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(({
  children,
  variant = 'default',
  size = 'md',
  padding = 'md',
  blur = 'normal',
  border = true,
  shadow = 'md',
  rounded = 'lg',
  animated = true,
  collapsible = false,
  collapsed = false,
  onToggle,
  header,
  footer,
  loading = false,
  error = null,
  className = '',
  style,
  ...props
}, ref) => {
  // Build CSS classes
  const baseClasses = 'glass-panel';
  
  const variantClasses = {
    default: 'glass',
    light: 'glass-light',
    heavy: 'glass-heavy',
    subtle: 'glass-subtle',
    floating: 'glass-panel-floating'
  };

  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[28rem]',
    full: 'w-full'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    paddingClasses[padding],
    shadowClasses[shadow],
    roundedClasses[rounded],
    animated ? 'transition-all duration-300 ease-out' : '',
    collapsible ? 'cursor-pointer' : '',
    loading ? 'loading' : '',
    error ? 'border-red-500' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (collapsible && onToggle) {
      onToggle();
    }
  };

  const panelStyle = {
    ...style,
    ...(blur === 'light' && { backdropFilter: 'blur(5px)' }),
    ...(blur === 'heavy' && { backdropFilter: 'blur(20px)' }),
  };

  return (
    <div
      ref={ref}
      className={classes}
      style={panelStyle}
      onClick={handleClick}
      {...props}
    >
      {/* Header */}
      {header && (
        <div className="glass-panel-header mb-4 pb-4 border-b border-white/10">
          {header}
          {collapsible && (
            <button
              className="ml-auto p-1 rounded-md hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.();
              }}
              aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            >
              <svg
                className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className={`glass-panel-content ${
          collapsible && collapsed ? 'hidden' : ''
        } ${animated ? 'animate-fade-in' : ''}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner" />
            <span className="ml-3 text-sm text-white/70">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-400">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="glass-panel-footer mt-4 pt-4 border-t border-white/10">
          {footer}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
});

GlassPanel.displayName = 'GlassPanel';

export default GlassPanel;