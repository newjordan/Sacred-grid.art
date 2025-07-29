// src/shapes/TreeOfLife.ts - Kabbalistic Tree of Life implementation

import { Vector2D } from '../types';
import { GOLDEN_RATIO, PI, TWO_PI } from '../utils/constants';

/**
 * Sephirot (Divine Emanations) - The 10 spheres of the Tree of Life
 */
export enum Sephirah {
  KETHER = 'kether',           // Crown - Divine Will
  CHOKMAH = 'chokmah',         // Wisdom - Divine Wisdom
  BINAH = 'binah',             // Understanding - Divine Understanding
  CHESED = 'chesed',           // Mercy - Divine Love
  GEBURAH = 'geburah',         // Severity - Divine Judgment
  TIPHARETH = 'tiphareth',     // Beauty - Divine Harmony
  NETZACH = 'netzach',         // Victory - Divine Eternity
  HOD = 'hod',                 // Glory - Divine Splendor
  YESOD = 'yesod',             // Foundation - Divine Foundation
  MALKUTH = 'malkuth'          // Kingdom - Divine Manifestation
}

/**
 * Hebrew Letters corresponding to the 22 paths
 */
export enum HebrewLetter {
  ALEPH = 'aleph', BETH = 'beth', GIMEL = 'gimel', DALETH = 'daleth',
  HEH = 'heh', VAV = 'vav', ZAYIN = 'zayin', CHETH = 'cheth',
  TETH = 'teth', YOD = 'yod', KAPH = 'kaph', LAMED = 'lamed',
  MEM = 'mem', NUN = 'nun', SAMEKH = 'samekh', AYIN = 'ayin',
  PEH = 'peh', TZADDI = 'tzaddi', QOPH = 'qoph', RESH = 'resh',
  SHIN = 'shin', TAV = 'tav'
}

/**
 * Tree of Life variations
 */
export enum TreeVariation {
  TRADITIONAL = 'traditional',     // Classical Kabbalistic arrangement
  GOLDEN_DAWN = 'golden_dawn',     // Hermetic Order arrangement
  HERMETIC = 'hermetic',           // Hermetic Qabalah
  MODERN = 'modern'                // Contemporary interpretations
}

/**
 * Sephirah configuration
 */
export interface SephirahConfig {
  id: Sephirah;
  name: string;
  position: Vector2D;
  radius: number;
  color: string;
  pillar: 'left' | 'middle' | 'right';
  world: 'atziluth' | 'briah' | 'yetzirah' | 'assiah';
  number: number;
  hebrewName: string;
  meaning: string;
}

/**
 * Path configuration
 */
export interface PathConfig {
  id: string;
  from: Sephirah;
  to: Sephirah;
  letter: HebrewLetter;
  number: number;
  color: string;
  meaning: string;
  tarotCard?: string;
}

/**
 * Tree of Life sacred geometry implementation
 */
export class TreeOfLife {
  /**
   * Generate Sephirot positions for different tree variations
   */
  static generateSephirot(
    center: Vector2D,
    scale: number,
    variation: TreeVariation = TreeVariation.TRADITIONAL
  ): SephirahConfig[] {
    const baseRadius = scale * 0.08;
    
    switch (variation) {
      case TreeVariation.TRADITIONAL:
        return this.generateTraditionalTree(center, scale, baseRadius);
      case TreeVariation.GOLDEN_DAWN:
        return this.generateGoldenDawnTree(center, scale, baseRadius);
      case TreeVariation.HERMETIC:
        return this.generateHermeticTree(center, scale, baseRadius);
      case TreeVariation.MODERN:
        return this.generateModernTree(center, scale, baseRadius);
      default:
        return this.generateTraditionalTree(center, scale, baseRadius);
    }
  }

  /**
   * Generate traditional Kabbalistic Tree arrangement
   */
  private static generateTraditionalTree(
    center: Vector2D,
    scale: number,
    baseRadius: number
  ): SephirahConfig[] {
    const spacing = scale * 0.15;
    const pillarWidth = scale * 0.25;

    return [
      // Crown - Kether (Top center)
      {
        id: Sephirah.KETHER,
        name: 'Kether',
        position: { x: center.x, y: center.y - scale * 0.4 },
        radius: baseRadius * 1.2,
        color: '#ffffff',
        pillar: 'middle',
        world: 'atziluth',
        number: 1,
        hebrewName: 'כתר',
        meaning: 'Crown - Divine Will'
      },
      // Wisdom - Chokmah (Top right)
      {
        id: Sephirah.CHOKMAH,
        name: 'Chokmah',
        position: { x: center.x + pillarWidth, y: center.y - scale * 0.25 },
        radius: baseRadius,
        color: '#87ceeb',
        pillar: 'right',
        world: 'atziluth',
        number: 2,
        hebrewName: 'חכמה',
        meaning: 'Wisdom - Divine Wisdom'
      },
      // Understanding - Binah (Top left)
      {
        id: Sephirah.BINAH,
        name: 'Binah',
        position: { x: center.x - pillarWidth, y: center.y - scale * 0.25 },
        radius: baseRadius,
        color: '#8b0000',
        pillar: 'left',
        world: 'atziluth',
        number: 3,
        hebrewName: 'בינה',
        meaning: 'Understanding - Divine Understanding'
      },
      // Mercy - Chesed (Middle right)
      {
        id: Sephirah.CHESED,
        name: 'Chesed',
        position: { x: center.x + pillarWidth, y: center.y - scale * 0.05 },
        radius: baseRadius,
        color: '#4169e1',
        pillar: 'right',
        world: 'briah',
        number: 4,
        hebrewName: 'חסד',
        meaning: 'Mercy - Divine Love'
      },
      // Severity - Geburah (Middle left)
      {
        id: Sephirah.GEBURAH,
        name: 'Geburah',
        position: { x: center.x - pillarWidth, y: center.y - scale * 0.05 },
        radius: baseRadius,
        color: '#dc143c',
        pillar: 'left',
        world: 'briah',
        number: 5,
        hebrewName: 'גבורה',
        meaning: 'Severity - Divine Judgment'
      },
      // Beauty - Tiphareth (Center)
      {
        id: Sephirah.TIPHARETH,
        name: 'Tiphareth',
        position: { x: center.x, y: center.y },
        radius: baseRadius * 1.1,
        color: '#ffd700',
        pillar: 'middle',
        world: 'briah',
        number: 6,
        hebrewName: 'תפארת',
        meaning: 'Beauty - Divine Harmony'
      },
      // Victory - Netzach (Lower right)
      {
        id: Sephirah.NETZACH,
        name: 'Netzach',
        position: { x: center.x + pillarWidth, y: center.y + scale * 0.15 },
        radius: baseRadius,
        color: '#32cd32',
        pillar: 'right',
        world: 'yetzirah',
        number: 7,
        hebrewName: 'נצח',
        meaning: 'Victory - Divine Eternity'
      },
      // Glory - Hod (Lower left)
      {
        id: Sephirah.HOD,
        name: 'Hod',
        position: { x: center.x - pillarWidth, y: center.y + scale * 0.15 },
        radius: baseRadius,
        color: '#ff8c00',
        pillar: 'left',
        world: 'yetzirah',
        number: 8,
        hebrewName: 'הוד',
        meaning: 'Glory - Divine Splendor'
      },
      // Foundation - Yesod (Lower center)
      {
        id: Sephirah.YESOD,
        name: 'Yesod',
        position: { x: center.x, y: center.y + scale * 0.25 },
        radius: baseRadius,
        color: '#9370db',
        pillar: 'middle',
        world: 'yetzirah',
        number: 9,
        hebrewName: 'יסוד',
        meaning: 'Foundation - Divine Foundation'
      },
      // Kingdom - Malkuth (Bottom)
      {
        id: Sephirah.MALKUTH,
        name: 'Malkuth',
        position: { x: center.x, y: center.y + scale * 0.4 },
        radius: baseRadius,
        color: '#8b4513',
        pillar: 'middle',
        world: 'assiah',
        number: 10,
        hebrewName: 'מלכות',
        meaning: 'Kingdom - Divine Manifestation'
      }
    ];
  }

  /**
   * Generate Golden Dawn variation
   */
  private static generateGoldenDawnTree(
    center: Vector2D,
    scale: number,
    baseRadius: number
  ): SephirahConfig[] {
    // Golden Dawn uses slightly different positioning and colors
    const traditional = this.generateTraditionalTree(center, scale, baseRadius);
    
    // Modify colors for Golden Dawn system
    const goldenDawnColors = {
      [Sephirah.KETHER]: '#ffffff',
      [Sephirah.CHOKMAH]: '#808080',
      [Sephirah.BINAH]: '#000000',
      [Sephirah.CHESED]: '#0000ff',
      [Sephirah.GEBURAH]: '#ff0000',
      [Sephirah.TIPHARETH]: '#ffff00',
      [Sephirah.NETZACH]: '#00ff00',
      [Sephirah.HOD]: '#ff8000',
      [Sephirah.YESOD]: '#800080',
      [Sephirah.MALKUTH]: '#654321'
    };

    return traditional.map(sephirah => ({
      ...sephirah,
      color: goldenDawnColors[sephirah.id] || sephirah.color
    }));
  }

  /**
   * Generate Hermetic variation
   */
  private static generateHermeticTree(
    center: Vector2D,
    scale: number,
    baseRadius: number
  ): SephirahConfig[] {
    const traditional = this.generateTraditionalTree(center, scale, baseRadius);
    
    // Hermetic system emphasizes different aspects
    return traditional.map(sephirah => ({
      ...sephirah,
      radius: sephirah.id === Sephirah.TIPHARETH ? baseRadius * 1.3 : baseRadius
    }));
  }

  /**
   * Generate modern interpretation
   */
  private static generateModernTree(
    center: Vector2D,
    scale: number,
    baseRadius: number
  ): SephirahConfig[] {
    const traditional = this.generateTraditionalTree(center, scale, baseRadius);
    
    // Modern interpretation with updated colors
    const modernColors = {
      [Sephirah.KETHER]: '#f0f8ff',
      [Sephirah.CHOKMAH]: '#4682b4',
      [Sephirah.BINAH]: '#2f4f4f',
      [Sephirah.CHESED]: '#1e90ff',
      [Sephirah.GEBURAH]: '#b22222',
      [Sephirah.TIPHARETH]: '#ffa500',
      [Sephirah.NETZACH]: '#228b22',
      [Sephirah.HOD]: '#ff6347',
      [Sephirah.YESOD]: '#9932cc',
      [Sephirah.MALKUTH]: '#8b7355'
    };

    return traditional.map(sephirah => ({
      ...sephirah,
      color: modernColors[sephirah.id] || sephirah.color
    }));
  }

  /**
   * Generate the 22 paths connecting the Sephirot
   */
  static generatePaths(variation: TreeVariation = TreeVariation.TRADITIONAL): PathConfig[] {
    const basePaths: Omit<PathConfig, 'color'>[] = [
      // Paths from Kether
      { id: 'path_11', from: Sephirah.KETHER, to: Sephirah.CHOKMAH, letter: HebrewLetter.ALEPH, number: 11, meaning: 'The Fool', tarotCard: 'The Fool' },
      { id: 'path_12', from: Sephirah.KETHER, to: Sephirah.BINAH, letter: HebrewLetter.BETH, number: 12, meaning: 'The Magician', tarotCard: 'The Magician' },
      { id: 'path_13', from: Sephirah.KETHER, to: Sephirah.TIPHARETH, letter: HebrewLetter.GIMEL, number: 13, meaning: 'The High Priestess', tarotCard: 'The High Priestess' },
      
      // Paths from Chokmah
      { id: 'path_14', from: Sephirah.CHOKMAH, to: Sephirah.BINAH, letter: HebrewLetter.DALETH, number: 14, meaning: 'The Empress', tarotCard: 'The Empress' },
      { id: 'path_15', from: Sephirah.CHOKMAH, to: Sephirah.TIPHARETH, letter: HebrewLetter.HEH, number: 15, meaning: 'The Emperor', tarotCard: 'The Emperor' },
      { id: 'path_16', from: Sephirah.CHOKMAH, to: Sephirah.CHESED, letter: HebrewLetter.VAV, number: 16, meaning: 'The Hierophant', tarotCard: 'The Hierophant' },
      
      // Paths from Binah
      { id: 'path_17', from: Sephirah.BINAH, to: Sephirah.TIPHARETH, letter: HebrewLetter.ZAYIN, number: 17, meaning: 'The Lovers', tarotCard: 'The Lovers' },
      { id: 'path_18', from: Sephirah.BINAH, to: Sephirah.GEBURAH, letter: HebrewLetter.CHETH, number: 18, meaning: 'The Chariot', tarotCard: 'The Chariot' },
      
      // Paths from Chesed
      { id: 'path_19', from: Sephirah.CHESED, to: Sephirah.GEBURAH, letter: HebrewLetter.TETH, number: 19, meaning: 'Strength', tarotCard: 'Strength' },
      { id: 'path_20', from: Sephirah.CHESED, to: Sephirah.TIPHARETH, letter: HebrewLetter.YOD, number: 20, meaning: 'The Hermit', tarotCard: 'The Hermit' },
      { id: 'path_21', from: Sephirah.CHESED, to: Sephirah.NETZACH, letter: HebrewLetter.KAPH, number: 21, meaning: 'Wheel of Fortune', tarotCard: 'Wheel of Fortune' },
      
      // Paths from Geburah
      { id: 'path_22', from: Sephirah.GEBURAH, to: Sephirah.TIPHARETH, letter: HebrewLetter.LAMED, number: 22, meaning: 'Justice', tarotCard: 'Justice' },
      { id: 'path_23', from: Sephirah.GEBURAH, to: Sephirah.HOD, letter: HebrewLetter.MEM, number: 23, meaning: 'The Hanged Man', tarotCard: 'The Hanged Man' },
      
      // Paths from Tiphareth
      { id: 'path_24', from: Sephirah.TIPHARETH, to: Sephirah.NETZACH, letter: HebrewLetter.NUN, number: 24, meaning: 'Death', tarotCard: 'Death' },
      { id: 'path_25', from: Sephirah.TIPHARETH, to: Sephirah.HOD, letter: HebrewLetter.SAMEKH, number: 25, meaning: 'Temperance', tarotCard: 'Temperance' },
      { id: 'path_26', from: Sephirah.TIPHARETH, to: Sephirah.YESOD, letter: HebrewLetter.AYIN, number: 26, meaning: 'The Devil', tarotCard: 'The Devil' },
      
      // Paths from Netzach
      { id: 'path_27', from: Sephirah.NETZACH, to: Sephirah.HOD, letter: HebrewLetter.PEH, number: 27, meaning: 'The Tower', tarotCard: 'The Tower' },
      { id: 'path_28', from: Sephirah.NETZACH, to: Sephirah.YESOD, letter: HebrewLetter.TZADDI, number: 28, meaning: 'The Star', tarotCard: 'The Star' },
      { id: 'path_29', from: Sephirah.NETZACH, to: Sephirah.MALKUTH, letter: HebrewLetter.QOPH, number: 29, meaning: 'The Moon', tarotCard: 'The Moon' },
      
      // Paths from Hod
      { id: 'path_30', from: Sephirah.HOD, to: Sephirah.YESOD, letter: HebrewLetter.RESH, number: 30, meaning: 'The Sun', tarotCard: 'The Sun' },
      { id: 'path_31', from: Sephirah.HOD, to: Sephirah.MALKUTH, letter: HebrewLetter.SHIN, number: 31, meaning: 'Judgement', tarotCard: 'Judgement' },
      
      // Path from Yesod
      { id: 'path_32', from: Sephirah.YESOD, to: Sephirah.MALKUTH, letter: HebrewLetter.TAV, number: 32, meaning: 'The World', tarotCard: 'The World' }
    ];

    // Add colors based on variation
    return basePaths.map(path => ({
      ...path,
      color: this.getPathColor(path.letter, variation)
    }));
  }

  /**
   * Get path color based on Hebrew letter and variation
   */
  private static getPathColor(letter: HebrewLetter, variation: TreeVariation): string {
    const traditionalColors: Record<HebrewLetter, string> = {
      [HebrewLetter.ALEPH]: '#ffff00',
      [HebrewLetter.BETH]: '#9370db',
      [HebrewLetter.GIMEL]: '#0000ff',
      [HebrewLetter.DALETH]: '#00ff00',
      [HebrewLetter.HEH]: '#ff0000',
      [HebrewLetter.VAV]: '#ff8c00',
      [HebrewLetter.ZAYIN]: '#ff69b4',
      [HebrewLetter.CHETH]: '#8b4513',
      [HebrewLetter.TETH]: '#ffd700',
      [HebrewLetter.YOD]: '#32cd32',
      [HebrewLetter.KAPH]: '#800080',
      [HebrewLetter.LAMED]: '#00ffff',
      [HebrewLetter.MEM]: '#4169e1',
      [HebrewLetter.NUN]: '#228b22',
      [HebrewLetter.SAMEKH]: '#dc143c',
      [HebrewLetter.AYIN]: '#8b0000',
      [HebrewLetter.PEH]: '#ff6347',
      [HebrewLetter.TZADDI]: '#87ceeb',
      [HebrewLetter.QOPH]: '#9932cc',
      [HebrewLetter.RESH]: '#ffa500',
      [HebrewLetter.SHIN]: '#b22222',
      [HebrewLetter.TAV]: '#2f4f4f'
    };

    return traditionalColors[letter] || '#ffffff';
  }

  /**
   * Generate the Four Worlds (Olamot) boundaries
   */
  static generateWorlds(
    center: Vector2D,
    scale: number
  ): Array<{ name: string; boundary: Vector2D[]; color: string }> {
    const worldHeight = scale * 0.2;
    const worldWidth = scale * 0.8;

    return [
      {
        name: 'Atziluth (Emanation)',
        boundary: [
          { x: center.x - worldWidth/2, y: center.y - scale * 0.5 },
          { x: center.x + worldWidth/2, y: center.y - scale * 0.5 },
          { x: center.x + worldWidth/2, y: center.y - scale * 0.15 },
          { x: center.x - worldWidth/2, y: center.y - scale * 0.15 }
        ],
        color: '#ffffff'
      },
      {
        name: 'Briah (Creation)',
        boundary: [
          { x: center.x - worldWidth/2, y: center.y - scale * 0.15 },
          { x: center.x + worldWidth/2, y: center.y - scale * 0.15 },
          { x: center.x + worldWidth/2, y: center.y + scale * 0.1 },
          { x: center.x - worldWidth/2, y: center.y + scale * 0.1 }
        ],
        color: '#87ceeb'
      },
      {
        name: 'Yetzirah (Formation)',
        boundary: [
          { x: center.x - worldWidth/2, y: center.y + scale * 0.1 },
          { x: center.x + worldWidth/2, y: center.y + scale * 0.1 },
          { x: center.x + worldWidth/2, y: center.y + scale * 0.35 },
          { x: center.x - worldWidth/2, y: center.y + scale * 0.35 }
        ],
        color: '#ffd700'
      },
      {
        name: 'Assiah (Action)',
        boundary: [
          { x: center.x - worldWidth/2, y: center.y + scale * 0.35 },
          { x: center.x + worldWidth/2, y: center.y + scale * 0.35 },
          { x: center.x + worldWidth/2, y: center.y + scale * 0.5 },
          { x: center.x - worldWidth/2, y: center.y + scale * 0.5 }
        ],
        color: '#8b4513'
      }
    ];
  }

  /**
   * Generate the Three Pillars
   */
  static generatePillars(
    center: Vector2D,
    scale: number
  ): Array<{ name: string; line: { start: Vector2D; end: Vector2D }; color: string }> {
    const pillarWidth = scale * 0.25;
    const pillarHeight = scale * 0.8;

    return [
      {
        name: 'Pillar of Severity (Left)',
        line: {
          start: { x: center.x - pillarWidth, y: center.y - pillarHeight/2 },
          end: { x: center.x - pillarWidth, y: center.y + pillarHeight/2 }
        },
        color: '#8b0000'
      },
      {
        name: 'Pillar of Equilibrium (Middle)',
        line: {
          start: { x: center.x, y: center.y - pillarHeight/2 },
          end: { x: center.x, y: center.y + pillarHeight/2 }
        },
        color: '#ffd700'
      },
      {
        name: 'Pillar of Mercy (Right)',
        line: {
          start: { x: center.x + pillarWidth, y: center.y - pillarHeight/2 },
          end: { x: center.x + pillarWidth, y: center.y + pillarHeight/2 }
        },
        color: '#4169e1'
      }
    ];
  }

  /**
   * Calculate sacred numbers and gematria
   */
  static calculateGematria(text: string): number {
    const hebrewValues: Record<string, number> = {
      'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
      'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
      'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400
    };

    return text.split('').reduce((sum, char) => sum + (hebrewValues[char] || 0), 0);
  }

  /**
   * Generate lightning flash path (order of emanation)
   */
  static generateLightningFlash(sephirot: SephirahConfig[]): Vector2D[] {
    const order = [
      Sephirah.KETHER, Sephirah.CHOKMAH, Sephirah.BINAH, Sephirah.CHESED,
      Sephirah.GEBURAH, Sephirah.TIPHARETH, Sephirah.NETZACH, Sephirah.HOD,
      Sephirah.YESOD, Sephirah.MALKUTH
    ];

    return order.map(id => {
      const sephirah = sephirot.find(s => s.id === id);
      return sephirah ? sephirah.position : { x: 0, y: 0 };
    });
  }

  /**
   * Generate serpent path (path of return)
   */
  static generateSerpentPath(sephirot: SephirahConfig[]): Vector2D[] {
    const order = [
      Sephirah.MALKUTH, Sephirah.YESOD, Sephirah.HOD, Sephirah.NETZACH,
      Sephirah.TIPHARETH, Sephirah.GEBURAH, Sephirah.CHESED, Sephirah.BINAH,
      Sephirah.CHOKMAH, Sephirah.KETHER
    ];

    return order.map(id => {
      const sephirah = sephirot.find(s => s.id === id);
      return sephirah ? sephirah.position : { x: 0, y: 0 };
    });
  }

  /**
   * Check if a point is within a Sephirah
   */
  static isPointInSephirah(
    point: Vector2D,
    sephirah: SephirahConfig
  ): boolean {
    const distance = Math.sqrt(
      Math.pow(point.x - sephirah.position.x, 2) + 
      Math.pow(point.y - sephirah.position.y, 2)
    );
    return distance <= sephirah.radius;
  }

  /**
   * Get Sephirah by position
   */
  static getSephirahAtPoint(
    point: Vector2D,
    sephirot: SephirahConfig[]
  ): SephirahConfig | null {
    return sephirot.find(sephirah => this.isPointInSephirah(point, sephirah)) || null;
  }
}

export default TreeOfLife;