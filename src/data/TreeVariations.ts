// src/data/TreeVariations.ts - Different tree configurations and variations

import { TreeVariation, SephirahConfig, PathConfig } from '../shapes/TreeOfLife';
import { Vector2D } from '../types';

/**
 * Color schemes for different tree variations
 */
export interface TreeColorScheme {
  name: string;
  sephirotColors: Record<string, string>;
  pathColors: Record<string, string>;
  backgroundColor: string;
  pillarColors: {
    left: string;
    middle: string;
    right: string;
  };
}

/**
 * Tree configuration templates
 */
export interface TreeTemplate {
  variation: TreeVariation;
  name: string;
  description: string;
  colorScheme: TreeColorScheme;
  specialFeatures: string[];
  historicalContext: string;
}

/**
 * Predefined color schemes for different traditions
 */
export const TreeColorSchemes: Record<string, TreeColorScheme> = {
  traditi