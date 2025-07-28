// src/components/ui/Accordion.tsx - Collapsible sections with animated expand/collapse

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import '../../styles/glassmorphism.css';
import '../../styles/animations.css';

export interface AccordionItemProps {
  id: string;
  title: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  variant?: 'default' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
}

const AccordionItem: React.FC<{
  item: AccordionItemProps;
  isOpen: boolean;
  onToggle: () => void;
  variant: 'default' | 'glass' | 'minimal';
  size: 'sm' | 'md' | 'lg';
  animated: boolean;
}> = ({ item, isOpen, onToggle, variant, size, animated }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  // Update content height when open state changes
  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setContentHeight(contentRef.current.scrollHeight);
      } else {
        setContentHeight(0);
      }
    }
  }, [isOpen]);

  // Size configurations
  const sizeConfig = {
    sm: {
      header: 'px-3 py-2',
      content: 'px-3 pb-2',
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    md: {
      header: 'px-4 py-3',
      content: 'px-4 pb-3',
      text: 'text-base',
      icon: 'w-5 h-5'
    },
    lg: {
      header: 'px-6 py-4',
      content: 'px-6 pb-4',
      text: 'text-lg',
      icon: 'w-6 h-6'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'glass-card border border-white/10',
      header: 'hover:bg-white/5',
      content: 'border-t border-white/10'
    },
    glass: {
      container: 'glass-panel',
      header: 'hover:bg-white/10',
      content: 'border-t border-white/20'
    },
    minimal: {
      container: 'border-b border-white/10 last:border-b-0',
      header: 'hover:bg-white/5',
      content: ''
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div className={`${currentVariant.container} ${item.className || ''}`}>
      {/* Header */}
      <button
        type="button"
        className={`
          w-full
          flex
          items-center
          justify-between
          ${currentSize.header}
          ${currentSize.text}
          text-left
          text-white/90
          font-medium
          transition-all
          duration-200
          ease-out
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/50
          focus:ring-inset
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${!item.disabled ? currentVariant.header : ''}
        `}
        onClick={item.disabled ? undefined : onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
        disabled={item.disabled}
      >
        <div className="flex items-center gap-3">
          {/* Custom Icon */}
          {item.icon && (
            <span className={`${currentSize.icon} text-white/70`}>
              {item.icon}
            </span>
          )}

          {/* Title */}
          <span className="flex-1">
            {item.title}
          </span>

          {/* Badge */}
          {item.badge && (
            <span className="ml-2">
              {item.badge}
            </span>
          )}
        </div>

        {/* Chevron Icon */}
        <svg
          className={`
            ${currentSize.icon}
            text-white/50
            transition-transform
            duration-200
            ease-out
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `}
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

      {/* Content */}
      <div
        id={`accordion-content-${item.id}`}
        className={`
          overflow-hidden
          ${animated ? 'transition-all duration-300 ease-out' : ''}
        `}
        style={{
          height: animated ? contentHeight : isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
      >
        <div
          ref={contentRef}
          className={`
            ${currentSize.content}
            ${currentVariant.content}
            text-white/80
            ${currentSize.text}
          `}
        >
          {item.children}
        </div>
      </div>
    </div>
  );
};

const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  variant = 'default',
  size = 'md',
  animated = true,
  className = '',
  onItemToggle
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    const defaultOpen = new Set<string>();
    items.forEach(item => {
      if (item.defaultOpen) {
        defaultOpen.add(item.id);
      }
    });
    return defaultOpen;
  });

  const handleItemToggle = (itemId: string) => {
    setOpenItems(prev => {
      const newOpenItems = new Set(prev);
      
      if (newOpenItems.has(itemId)) {
        newOpenItems.delete(itemId);
        onItemToggle?.(itemId, false);
      } else {
        if (!allowMultiple) {
          newOpenItems.clear();
        }
        newOpenItems.add(itemId);
        onItemToggle?.(itemId, true);
      }
      
      return newOpenItems;
    });
  };

  const containerClasses = [
    'accordion',
    variant === 'minimal' ? 'space-y-0' : 'space-y-2',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => handleItemToggle(item.id)}
          variant={variant}
          size={size}
          animated={animated}
        />
      ))}
    </div>
  );
};

// Preset accordion components
export const SettingsAccordion: React.FC<{
  sections: Array<{
    id: string;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
  }>;
  className?: string;
}> = ({ sections, className }) => {
  const items: AccordionItemProps[] = sections.map(section => ({
    id: section.id,
    title: section.title,
    icon: section.icon,
    children: section.children
  }));

  return (
    <Accordion
      items={items}
      variant="glass"
      allowMultiple
      className={className}
    />
  );
};

export const FAQAccordion: React.FC<{
  faqs: Array<{
    id: string;
    question: string;
    answer: ReactNode;
  }>;
  className?: string;
}> = ({ faqs, className }) => {
  const items: AccordionItemProps[] = faqs.map(faq => ({
    id: faq.id,
    title: faq.question,
    children: faq.answer
  }));

  return (
    <Accordion
      items={items}
      variant="minimal"
      className={className}
    />
  );
};

export const NavigationAccordion: React.FC<{
  sections: Array<{
    id: string;
    title: string;
    icon?: ReactNode;
    badge?: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
  }>;
  className?: string;
}> = ({ sections, className }) => {
  const items: AccordionItemProps[] = sections.map(section => ({
    id: section.id,
    title: section.title,
    icon: section.icon,
    badge: section.badge,
    children: section.children,
    defaultOpen: section.defaultOpen
  }));

  return (
    <Accordion
      items={items}
      variant="default"
      allowMultiple
      className={className}
    />
  );
};

export default Accordion;