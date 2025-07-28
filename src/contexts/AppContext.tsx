// src/contexts/AppContext.tsx - Global state management for Sacred Grid

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { SacredGridSettings, PerformanceMetrics, LayerConfig } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';

// Action Types
type AppAction =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SacredGridSettings> }
  | { type: 'RESET_SETTINGS' }
  | { type: 'LOAD_PRESET'; payload: SacredGridSettings }
  | { type: 'UPDATE_PERFORMANCE'; payload: PerformanceMetrics }
  | { type: 'TOGGLE_CONTROLS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_LAYER'; payload: LayerConfig }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<LayerConfig> } }
  | { type: 'REMOVE_LAYER'; payload: string }
  | { type: 'REORDER_LAYERS'; payload: string[] };

// App State Interface
interface AppState {
  settings: SacredGridSettings;
  performance: PerformanceMetrics;
  ui: {
    showControls: boolean;
    isLoading: boolean;
    error: string | null;
    activePanel: string | null;
  };
  layers: LayerConfig[];
  history: {
    past: SacredGridSettings[];
    present: SacredGridSettings;
    future: SacredGridSettings[];
  };
}

// Initial State
const initialState: AppState = {
  settings: DEFAULT_SETTINGS as SacredGridSettings,
  performance: {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    particleCount: 0,
    shapeCount: 0
  },
  ui: {
    showControls: true,
    isLoading: false,
    error: null,
    activePanel: null
  },
  layers: [
    {
      id: 'main',
      name: 'Main Layer',
      visible: true,
      opacity: 1,
      blendMode: 'source-over' as any,
      zIndex: 0,
      locked: false
    }
  ],
  history: {
    past: [],
    present: DEFAULT_SETTINGS as SacredGridSettings,
    future: []
  }
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: newSettings,
        history: {
          past: [...state.history.past, state.history.present].slice(-50), // Keep last 50 states
          present: newSettings,
          future: []
        }
      };
    }

    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: DEFAULT_SETTINGS as SacredGridSettings,
        history: {
          past: [...state.history.past, state.history.present].slice(-50),
          present: DEFAULT_SETTINGS as SacredGridSettings,
          future: []
        }
      };

    case 'LOAD_PRESET':
      return {
        ...state,
        settings: action.payload,
        history: {
          past: [...state.history.past, state.history.present].slice(-50),
          present: action.payload,
          future: []
        }
      };

    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: action.payload
      };

    case 'TOGGLE_CONTROLS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showControls: !state.ui.showControls
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload
        }
      };

    case 'ADD_LAYER':
      return {
        ...state,
        layers: [...state.layers, action.payload]
      };

    case 'UPDATE_LAYER':
      return {
        ...state,
        layers: state.layers.map(layer =>
          layer.id === action.payload.id
            ? { ...layer, ...action.payload.updates }
            : layer
        )
      };

    case 'REMOVE_LAYER':
      return {
        ...state,
        layers: state.layers.filter(layer => layer.id !== action.payload)
      };

    case 'REORDER_LAYERS':
      const reorderedLayers = action.payload.map(id =>
        state.layers.find(layer => layer.id === id)!
      ).filter(Boolean);
      return {
        ...state,
        layers: reorderedLayers
      };

    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience methods
  updateSettings: (settings: Partial<SacredGridSettings>) => void;
  resetSettings: () => void;
  loadPreset: (preset: SacredGridSettings) => void;
  updatePerformance: (metrics: PerformanceMetrics) => void;
  toggleControls: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // History methods
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Layer methods
  addLayer: (layer: LayerConfig) => void;
  updateLayer: (id: string, updates: Partial<LayerConfig>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (layerIds: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Convenience methods
  const updateSettings = useCallback((settings: Partial<SacredGridSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const resetSettings = useCallback(() => {
    dispatch({ type: 'RESET_SETTINGS' });
  }, []);

  const loadPreset = useCallback((preset: SacredGridSettings) => {
    dispatch({ type: 'LOAD_PRESET', payload: preset });
  }, []);

  const updatePerformance = useCallback((metrics: PerformanceMetrics) => {
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: metrics });
  }, []);

  const toggleControls = useCallback(() => {
    dispatch({ type: 'TOGGLE_CONTROLS' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // History methods
  const undo = useCallback(() => {
    if (state.history.past.length > 0) {
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: previous
      });
    }
  }, [state.history.past]);

  const redo = useCallback(() => {
    if (state.history.future.length > 0) {
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: next
      });
    }
  }, [state.history.future]);

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  // Layer methods
  const addLayer = useCallback((layer: LayerConfig) => {
    dispatch({ type: 'ADD_LAYER', payload: layer });
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<LayerConfig>) => {
    dispatch({ type: 'UPDATE_LAYER', payload: { id, updates } });
  }, []);

  const removeLayer = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_LAYER', payload: id });
  }, []);

  const reorderLayers = useCallback((layerIds: string[]) => {
    dispatch({ type: 'REORDER_LAYERS', payload: layerIds });
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    updateSettings,
    resetSettings,
    loadPreset,
    updatePerformance,
    toggleControls,
    setLoading,
    setError,
    undo,
    redo,
    canUndo,
    canRedo,
    addLayer,
    updateLayer,
    removeLayer,
    reorderLayers
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Selector hooks for specific parts of state
export const useSettings = () => {
  const { state, updateSettings } = useAppContext();
  return { settings: state.settings, updateSettings };
};

export const usePerformanceMetrics = () => {
  const { state, updatePerformance } = useAppContext();
  return { performance: state.performance, updatePerformance };
};

export const useUI = () => {
  const { state, toggleControls, setLoading, setError } = useAppContext();
  return {
    ui: state.ui,
    toggleControls,
    setLoading,
    setError
  };
};

export const useLayers = () => {
  const { state, addLayer, updateLayer, removeLayer, reorderLayers } = useAppContext();
  return {
    layers: state.layers,
    addLayer,
    updateLayer,
    removeLayer,
    reorderLayers
  };
};

export const useHistory = () => {
  const { state, undo, redo, canUndo, canRedo } = useAppContext();
  return {
    history: state.history,
    undo,
    redo,
    canUndo,
    canRedo
  };
};

export default AppContext;