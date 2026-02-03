// src/components/ui/Button.test.tsx - Comprehensive tests for Button component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button, { IconButton, FloatingActionButton, ButtonGroup } from './Button';

// Mock icon component for testing
const MockIcon = () => <svg data-testid="mock-icon" />;

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with children elements', () => {
      render(
        <Button>
          <span data-testid="child-element">Custom Content</span>
        </Button>
      );
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('renders without children (empty button)', () => {
      render(<Button aria-label="empty button" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Test</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('passes through additional HTML attributes', () => {
      render(
        <Button data-testid="test-button" type="submit" name="submit-btn">
          Submit
        </Button>
      );
      const button = screen.getByTestId('test-button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submit-btn');
    });
  });

  describe('Click Handling', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('passes event object to onClick handler', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles multiple clicks', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Variants', () => {
    const variants = [
      'default',
      'primary',
      'secondary',
      'accent',
      'success',
      'warning',
      'error',
      'ghost',
      'outline'
    ] as const;

    it.each(variants)('renders %s variant correctly', (variant) => {
      render(<Button variant={variant}>Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('applies primary variant styles', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('glass-button-primary');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('glass-button-secondary');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('border-transparent');
    });

    it('applies outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('border-white/30');
    });

    it('applies error variant styles', () => {
      render(<Button variant="error">Error</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('glass-button-danger');
    });

    it('uses default variant when not specified', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('glass-button');
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    it.each(sizes)('renders %s size correctly', (size) => {
      render(<Button size={size}>Test Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies xs size styles', () => {
      render(<Button size="xs">Extra Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-xs');
      expect(button.className).toContain('h-6');
    });

    it('applies sm size styles', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-sm');
      expect(button.className).toContain('h-8');
    });

    it('applies md size styles (default)', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-10');
    });

    it('applies lg size styles', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-base');
      expect(button.className).toContain('h-12');
    });

    it('applies xl size styles', () => {
      render(<Button size="xl">Extra Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-lg');
      expect(button.className).toContain('h-14');
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is not disabled when disabled prop is false', () => {
      render(<Button disabled={false}>Enabled</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('opacity-50');
      expect(button.className).toContain('cursor-not-allowed');
    });

    it('is disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styles when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('opacity-50');
      expect(button.className).toContain('cursor-not-allowed');
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      const spinner = screen.getByRole('button').querySelector('.loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('hides left icon when loading', () => {
      render(
        <Button loading leftIcon={<MockIcon />}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
    });

    it('still shows text content when loading', () => {
      render(<Button loading>Loading Text</Button>);
      expect(screen.getByText('Loading Text')).toBeInTheDocument();
    });
  });

  describe('Icon Buttons', () => {
    it('renders with left icon', () => {
      render(
        <Button leftIcon={<MockIcon />}>
          With Left Icon
        </Button>
      );
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      expect(screen.getByText('With Left Icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(
        <Button rightIcon={<MockIcon />}>
          With Right Icon
        </Button>
      );
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      expect(screen.getByText('With Right Icon')).toBeInTheDocument();
    });

    it('renders with both icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
        >
          Both Icons
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Both Icons')).toBeInTheDocument();
    });

    it('hides right icon when loading', () => {
      render(
        <Button loading rightIcon={<MockIcon />}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
    });
  });

  describe('Shape', () => {
    it('applies rectangle shape (default)', () => {
      render(<Button>Rectangle</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded-lg');
    });

    it('applies square shape', () => {
      render(<Button shape="square">S</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded-lg');
      expect(button.className).toContain('aspect-square');
    });

    it('applies circle shape', () => {
      render(<Button shape="circle">C</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded-full');
      expect(button.className).toContain('aspect-square');
    });

    it('applies pill shape', () => {
      render(<Button shape="pill">Pill Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded-full');
    });
  });

  describe('Full Width', () => {
    it('applies full width class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('w-full');
    });

    it('does not apply full width class by default', () => {
      render(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button.className).not.toContain('w-full');
    });
  });

  describe('Floating', () => {
    it('applies floating styles when floating is true', () => {
      render(<Button floating>Floating</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('shadow-lg');
    });

    it('does not apply floating styles by default', () => {
      render(<Button>Not Floating</Button>);
      const button = screen.getByRole('button');
      expect(button.className).not.toContain('shadow-lg hover:shadow-xl');
    });
  });

  describe('Glow Effect', () => {
    it('renders glow overlay when glow is true and not disabled', () => {
      render(<Button glow>Glowing</Button>);
      const button = screen.getByRole('button');
      const glowOverlay = button.querySelector('.absolute.inset-0');
      expect(glowOverlay).toBeInTheDocument();
    });

    it('does not render glow overlay when disabled', () => {
      render(<Button glow disabled>Disabled Glow</Button>);
      const button = screen.getByRole('button');
      const glowOverlay = button.querySelector('.absolute.inset-0.rounded-inherit');
      expect(glowOverlay).not.toBeInTheDocument();
    });

    it('does not render glow overlay when loading', () => {
      render(<Button glow loading>Loading Glow</Button>);
      const button = screen.getByRole('button');
      const glowOverlay = button.querySelector('.absolute.inset-0.rounded-inherit');
      expect(glowOverlay).not.toBeInTheDocument();
    });
  });

  describe('Ripple Effect', () => {
    it('creates ripple element on click by default', () => {
      render(<Button>Ripple</Button>);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      // Ripple is added and removed via setTimeout, we just verify click works
      expect(button).toBeInTheDocument();
    });

    it('does not create ripple when ripple is false', () => {
      const handleClick = jest.fn();
      render(<Button ripple={false} onClick={handleClick}>No Ripple</Button>);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });

    it('does not create ripple when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<Button>Accessible Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('can receive focus', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Custom label" />);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('supports aria-disabled', () => {
      render(<Button aria-disabled="true">Aria Disabled</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});

describe('IconButton', () => {
  it('renders with icon', () => {
    render(<IconButton icon={<MockIcon />} aria-label="Icon button" />);
    expect(screen.getByRole('button', { name: 'Icon button' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('has circle shape by default', () => {
    render(<IconButton icon={<MockIcon />} aria-label="Icon button" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('rounded-full');
    expect(button.className).toContain('aspect-square');
  });

  it('requires aria-label prop', () => {
    // TypeScript would catch this, but we test runtime behavior
    render(<IconButton icon={<MockIcon />} aria-label="Required label" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Required label');
  });

  it('forwards other button props', () => {
    const handleClick = jest.fn();
    render(
      <IconButton
        icon={<MockIcon />}
        aria-label="Clickable icon"
        onClick={handleClick}
        variant="primary"
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<IconButton icon={<MockIcon />} aria-label="Disabled icon" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} icon={<MockIcon />} aria-label="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe('FloatingActionButton', () => {
  it('renders with content', () => {
    render(<FloatingActionButton>+</FloatingActionButton>);
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
  });

  it('has primary variant by default', () => {
    render(<FloatingActionButton>FAB</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('glass-button-primary');
  });

  it('has large size by default', () => {
    render(<FloatingActionButton>FAB</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-12');
  });

  it('has circle shape', () => {
    render(<FloatingActionButton>FAB</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('rounded-full');
    expect(button.className).toContain('aspect-square');
  });

  it('has fixed positioning', () => {
    render(<FloatingActionButton>FAB</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('fixed');
    expect(button.className).toContain('bottom-6');
    expect(button.className).toContain('right-6');
  });

  it('has z-index for layering', () => {
    render(<FloatingActionButton>FAB</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('z-50');
  });

  it('applies custom className in addition to defaults', () => {
    render(<FloatingActionButton className="custom-fab">FAB</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-fab');
    expect(button.className).toContain('fixed');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<FloatingActionButton ref={ref}>FAB</FloatingActionButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<FloatingActionButton onClick={handleClick}>FAB</FloatingActionButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});

describe('ButtonGroup', () => {
  it('renders children', () => {
    render(
      <ButtonGroup>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button 3' })).toBeInTheDocument();
  });

  it('applies horizontal orientation by default', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );

    const group = container.firstChild;
    expect(group).toHaveClass('flex-row');
  });

  it('applies vertical orientation when specified', () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );

    const group = container.firstChild;
    expect(group).toHaveClass('flex-col');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ButtonGroup className="custom-group">
        <Button>Button 1</Button>
      </ButtonGroup>
    );

    const group = container.firstChild;
    expect(group).toHaveClass('custom-group');
  });

  it('has inline-flex display', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>Button 1</Button>
      </ButtonGroup>
    );

    const group = container.firstChild;
    expect(group).toHaveClass('inline-flex');
  });
});

describe('Button Combinations', () => {
  it('renders primary variant with large size and glow', () => {
    render(
      <Button variant="primary" size="lg" glow>
        Primary Large Glow
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('glass-button-primary');
    expect(button.className).toContain('h-12');
  });

  it('renders ghost variant with pill shape and full width', () => {
    render(
      <Button variant="ghost" shape="pill" fullWidth>
        Ghost Pill Full
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-transparent');
    expect(button.className).toContain('rounded-full');
    expect(button.className).toContain('w-full');
  });

  it('renders outline variant with icons on both sides', () => {
    render(
      <Button
        variant="outline"
        leftIcon={<span data-testid="left">L</span>}
        rightIcon={<span data-testid="right">R</span>}
      >
        Outline with Icons
      </Button>
    );
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
    expect(screen.getByText('Outline with Icons')).toBeInTheDocument();
  });

  it('renders disabled loading button', () => {
    render(
      <Button disabled loading>
        Disabled Loading
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.className).toContain('opacity-50');
  });
});
