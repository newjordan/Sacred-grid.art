// Testing Library matchers (toBeInTheDocument, toHaveClass, ...).
// The Vitest entry registers them on Vitest's expect.
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Tests were written against Jest's `jest.fn` / `jest.spyOn` (react-scripts).
// Vitest's `vi` implements the same calls.
globalThis.jest = vi;
