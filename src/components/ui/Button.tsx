// src/components/ui/Button.tsx - Floating action buttons with glass styling

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import '../../styles/glassmorphism.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rectangle' | 'square' | 'circle' | 'pill';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  floating?: boolean;
  glow?: boolean;
  ripple?: boolean;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rectangle',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  floating = false,
  glow = false,
  ripple = true,
  className = '',
  onClick,
  ...props
}, ref) => {
  // Size configurations
  const sizeConfig = {
    xs: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      height: 'h-6',
      icon: 'w-3 h-3',
      gap: 'gap-1'
    },
    sm: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      height: 'h-8',
      icon: 'w-4 h-4',
      gap: 'gap-1.5'
    },
    md: {
      padding: 'px-4 py-2',
      text: 'text-sm',
      height: 'h-10',
      icon: 'w-4 h-4',
      gap: 'gap-2'
    },
    lg: {
      padding: 'px-6 py-3',
      text: 'text-base',
      height: 'h-12',
      icon: 'w-5 h-5',
      gap: 'gap-2'
    },
    xl: {
      padding: 'px-8 py-4',
      text: 'text-lg',
      height: 'h-14',
      icon: 'w-6 h-6',
      gap: 'gap-3'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      base: 'glass-button bg-white/5 border-white/20 text-white hover:bg-white/10',
      glow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
    },
    primary: {
      base: 'glass-button-primary bg-blue-500/20 border-blue-400/40 text-blue-200 hover:bg-blue-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
    },
    secondary: {
      base: 'glass-button-secondary bg-cyan-500/20 border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
    },
    accent: {
      base: 'bg-pink-500/20 border-pink-400/40 text-pink-200 hover:bg-pink-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]'
    },
    success: {
      base: 'bg-green-500/20 border-green-400/40 text-green-200 hover:bg-green-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
    },
    warning: {
      base: 'bg-yellow-500/20 border-yellow-400/40 text-yellow-200 hover:bg-yellow-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
    },
    error: {
      base: 'glass-button-danger bg-red-500/20 border-red-400/40 text-red-200 hover:bg-red-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
    },
    ghost: {
      base: 'bg-transparent border-transparent text-white hover:bg-white/10',
      glow: 'hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
    },
    outline: {
      base: 'bg-transparent border-white/30 text-white hover:bg-white/5',
      glow: 'hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
    }
  };

  // Shape configurations
  const shapeConfig = {
    rectangle: 'rounded-lg',
    square: 'rounded-lg aspect-square',
    circle: 'rounded-full aspect-square',
    pill: 'rounded-full'
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];
  const currentShape = shapeConfig[shape];

  // Handle click with ripple effect
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Ripple effect
    if (ripple) {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const rippleElement = document.createElement('span');
      rippleElement.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;

      button.appendChild(rippleElement);

      setTimeout(() => {
        rippleElement.remove();
      }, 600);
    }

    onClick?.(event);
  };

  // Build CSS classes
  const classes = [
    // Base styles
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-300',
    'ease-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500/50',
    'focus:ring-offset-2',
    'focus:ring-offset-transparent',
    'select-none',
    'overflow-hidden',
    
    // Size
    currentSize.padding,
    currentSize.text,
    currentSize.height,
    currentSize.gap,
    
    // Shape
    currentShape,
    
    // Variant
    currentVariant.base,
    
    // States
    disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    !disabled && !loading ? 'hover:scale-105 active:scale-95' : '',
    
    // Effects
    glow ? currentVariant.glow : '',
    floating ? 'shadow-lg hover:shadow-xl' : '',
    
    // Width
    fullWidth ? 'w-full' : '',
    
    // Custom classes
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className={`loading-spinner ${currentSize.icon} mr-2`} />
      )}

      {/* Left icon */}
      {leftIcon && !loading && (
        <span className={currentSize.icon}>
          {leftIcon}
        </span>
      )}

      {/* Content */}
      <span className={leftIcon || rightIcon || loading ? '' : ''}>
        {children}
      </span>

      {/* Right icon */}
      {rightIcon && !loading && (
        <span className={currentSize.icon}>
          {rightIcon}
        </span>
      )}

      {/* Glow effect overlay */}
      {glow && !disabled && !loading && (
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Preset button components
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'children'> & { icon: ReactNode; 'aria-label': string }>(
  ({ icon, ...props }, ref) => (
    <Button ref={ref} shape="circle" {...props}>
      {icon}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

export const FloatingActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', ...props }, ref) => (
    <Button
      ref={ref}
      variant="primary"
      size="lg"
      shape="circle"
      floating
      glow
      className={`fixed bottom-6 right-6 z-50 ${className}`}
      {...props}
    />
  )
);

FloatingActionButton.displayName = 'FloatingActionButton';

export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}> = ({ children, orientation = 'horizontal', className = '' }) => (
  <div
    className={`
      inline-flex
      ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}
      ${orientation === 'horizontal' ? '[&>*:not(:first-child)]:ml-[-1px]' : '[&>*:not(:first-child)]:mt-[-1px]'}
      [&>*:not(:first-child):not(:last-child)]:rounded-none
      ${orientation === 'horizontal' 
        ? '[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none' 
        : '[&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none'
      }
      ${className}
    `}
  >
    {children}
  </div>
);

// Add ripple animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Button;