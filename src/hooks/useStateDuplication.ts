// src/hooks/useStateDuplication.ts - React hook for state duplication functionality

import { useCallback, useRef } from 'react';
import { StateDuplicator, ApplicationSnapshot } from '../utils/StateDuplicator';
import { useAppContext } from '../contexts/AppContext';
import { SacredGridSettings } from '../types';

export interface StateDuplicationHook {
  createSnapshot: (canvas?: HTMLCanvasElement | null) => Promise<ApplicationSnapshot>;
  restoreSnapshot: (snapshot: ApplicationSnapshot, canvas?: HTMLCanvasElement | null) => Promise<boolean>;
  exportSnapshot: (snapshot: ApplicationSnapshot) => string;
  importSnapshot: (jsonString: string) => ApplicationSnapshot | null;
  validateSnapshot: (snapshot: ApplicationSnapshot) => boolean;
  getSnapshotSummary: (snapshot: ApplicationSnapshot) => string;
}

/**
 * Hook for managing application state duplication
 */
export const useStateDuplication = (): StateDuplicationHook => {
  const { state, updateSettings, setLoading, setError } = useAppContext();
  const animationStateRef = useRef<any>(null);
  const mouseStateRef = useRef<any>(null);

  /**
   * Create a snapshot of the current application state
   */
  const createSnapshot = useCallback(async (canvas?: HTMLCanvasElement | null): Promise<ApplicationSnapshot> => {
    try {
      setLoading(true);

      // Gather additional state information
      const additionalState = {
        performance: state.performance,
        layers: state.layers,
        ui: state.ui,
        animation: animationStateRef.current,
        mouse: mouseStateRef.current
      };
      
      // Create the snapshot
      const snapshot = await StateDuplicator.createSnapshot(
        canvas ?? null,
        state.settings,
        additionalState
      );

      return snapshot;
    } catch (error) {
      setError(`Failed to create snapshot: ${(error as Error).message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state, setLoading, setError]);

  /**
   * Restore application state from a snapshot
   */
  const restoreSnapshot = useCallback(async (
    snapshot: ApplicationSnapshot, 
    canvas?: HTMLCanvasElement | null
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Restore the application state
      const success = await StateDuplicator.restoreFromSnapshot(
        snapshot,
        canvas ?? null,
        updateSettings,
        (uiState) => {
          // Update UI state if needed
        }
      );
      
      if (!success) {
        throw new Error('Failed to restore application state');
      }
      
      return success;
    } catch (error) {
      setError(`Failed to restore snapshot: ${(error as Error).message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateSettings, setLoading, setError]);

  /**
   * Export snapshot to JSON string
   */
  const exportSnapshot = useCallback((snapshot: ApplicationSnapshot): string => {
    return StateDuplicator.exportSnapshot(snapshot);
  }, []);

  /**
   * Import snapshot from JSON string
   */
  const importSnapshot = useCallback((jsonString: string): ApplicationSnapshot | null => {
    try {
      return StateDuplicator.importSnapshot(jsonString);
    } catch (error) {
      setError(`Failed to import snapshot: ${(error as Error).message}`);
      return null;
    }
  }, [setError]);

  /**
   * Validate a snapshot
   */
  const validateSnapshot = useCallback((snapshot: ApplicationSnapshot): boolean => {
    return StateDuplicator.validateSnapshot(snapshot);
  }, []);

  /**
   * Get snapshot summary
   */
  const getSnapshotSummary = useCallback((snapshot: ApplicationSnapshot): string => {
    return StateDuplicator.getSnapshotSummary(snapshot);
  }, []);

  /**
   * Update animation state reference (to be called by animation components)
   */
  const updateAnimationState = useCallback((animationState: any) => {
    animationStateRef.current = animationState;
  }, []);

  /**
   * Update mouse state reference (to be called by mouse tracking components)
   */
  const updateMouseState = useCallback((mouseState: any) => {
    mouseStateRef.current = mouseState;
  }, []);

  return {
    createSnapshot,
    restoreSnapshot,
    exportSnapshot,
    importSnapshot,
    validateSnapshot,
    getSnapshotSummary,
    // Internal methods for state tracking
    updateAnimationState,
    updateMouseState
  } as StateDuplicationHook & {
    updateAnimationState: (state: any) => void;
    updateMouseState: (state: any) => void;
  };
};

/**
 * Utility hook for capturing current renderer state
 */
export const useRendererStateCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<any>(null);

  /**
   * Set canvas reference
   */
  const setCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  /**
   * Set renderer reference
   */
  const setRenderer = useCallback((renderer: any) => {
    rendererRef.current = renderer;
  }, []);

  /**
   * Get current canvas
   */
  const getCanvas = useCallback(() => {
    return canvasRef.current;
  }, []);

  /**
   * Get current renderer
   */
  const getRenderer = useCallback(() => {
    return rendererRef.current;
  }, []);

  /**
   * Capture current renderer state
   */
  const captureRendererState = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer) return null;

    return {
      time: renderer.time || performance.now(),
      isPlaying: renderer.isPlaying ?? true,
      speed: renderer.speed || 1,
      mousePosition: renderer.mousePos || { x: -1000, y: -1000 }
    };
  }, []);

  return {
    setCanvas,
    setRenderer,
    getCanvas,
    getRenderer,
    captureRendererState
  };
};

/**
 * Utility function to create a snapshot with current canvas
 */
export const createSnapshotWithCanvas = async (
  canvas: HTMLCanvasElement | null,
  settings: SacredGridSettings,
  additionalState?: any
): Promise<ApplicationSnapshot> => {
  return StateDuplicator.createSnapshot(canvas, settings, additionalState);
};
