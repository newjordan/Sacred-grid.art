// src/shapes/KabbalahPaths.ts - 22 connecting paths with Hebrew letters

import { Vector2D } from '../types';
import { TreeOfLife, SephirahConfig, PathConfig, HebrewLetter } from './TreeOfLife';

/**
 * Tarot correspondences for the paths
 */
export interface TarotCorrespondence {
  card: string;
  number: number;
  element?: 'fire' | 'water' | 'air' | 'earth';
  planet?: string;
  zodiac?: string;
  meaning: string;
}

/**
 * Hebrew letter properties
 */
export interface HebrewLetterProperties {
  letter: HebrewLetter;
  hebrew: string;
  name: string;
  meaning: string;
  gematria: number;
  motherLetter?: boolean;
  doubleLetter?: boolean;
  simpleLetter?: boolean;
  element?: 'fire' | 'water' | 'air';
  planet?: string;
  zodiac?: string;
}

/**
 * Path visualization properties
 */
export interface PathVisualization {
  path: PathConfig;
  startPoint: Vector2D;
  endPoint: Vector2D;
  controlPoints?: Vector2D[];
  width: number;
  opacity: number;
  animated: boolean;
  glowIntensity: number;
}

/**
 * Kabbalah paths implementation with Hebrew letters and Tarot correspondences
 */
export class KabbalahPaths {
  /**
   * Get Hebrew letter properties
   */
  static getHebrewLetterProperties(): Record<HebrewLetter, HebrewLetterProperties> {
    return {
      [HebrewLetter.ALEPH]: {
        letter: HebrewLetter.ALEPH,
        hebrew: 'א',
        name: 'Aleph',
        meaning: 'Ox, Leader',
        gematria: 1,
        motherLetter: true,
        element: 'air'
      },
      [HebrewLetter.BETH]: {
        letter: HebrewLetter.BETH,
        hebrew: 'ב',
        name: 'Beth',
        meaning: 'House, Container',
        gematria: 2,
        doubleLetter: true,
        planet: 'Mercury'
      },
      [HebrewLetter.GIMEL]: {
        letter: HebrewLetter.GIMEL,
        hebrew: 'ג',
        name: 'Gimel',
        meaning: 'Camel, Bridge',
        gematria: 3,
        doubleLetter: true,
        planet: 'Moon'
      },
      [HebrewLetter.DALETH]: {
        letter: HebrewLetter.DALETH,
        hebrew: 'ד',
        name: 'Daleth',
        meaning: 'Door, Pathway',
        gematria: 4,
        doubleLetter: true,
        planet: 'Venus'
      },
      [HebrewLetter.HEH]: {
        letter: HebrewLetter.HEH,
        hebrew: 'ה',
        name: 'Heh',
        meaning: 'Window, Breath',
        gematria: 5,
        simpleLetter: true,
        zodiac: 'Aries'
      },
      [HebrewLetter.VAV]: {
        letter: HebrewLetter.VAV,
        hebrew: 'ו',
        name: 'Vav',
        meaning: 'Hook, Connection',
        gematria: 6,
        simpleLetter: true,
        zodiac: 'Taurus'
      },
      [HebrewLetter.ZAYIN]: {
        letter: HebrewLetter.ZAYIN,
        hebrew: 'ז',
        name: 'Zayin',
        meaning: 'Sword, Weapon',
        gematria: 7,
        simpleLetter: true,
        zodiac: 'Gemini'
      },
      [HebrewLetter.CHETH]: {
        letter: HebrewLetter.CHETH,
        hebrew: 'ח',
        name: 'Cheth',
        meaning: 'Fence, Enclosure',
        gematria: 8,
        simpleLetter: true,
        zodiac: 'Cancer'
      },
      [HebrewLetter.TETH]: {
        letter: HebrewLetter.TETH,
        hebrew: 'ט',
        name: 'Teth',
        meaning: 'Serpent, Coiled',
        gematria: 9,
        simpleLetter: true,
        zodiac: 'Leo'
      },
      [HebrewLetter.YOD]: {
        letter: HebrewLetter.YOD,
        hebrew: 'י',
        name: 'Yod',
        meaning: 'Hand, Divine Spark',
        gematria: 10,
        simpleLetter: true,
        zodiac: 'Virgo'
      },
      [HebrewLetter.KAPH]: {
        letter: HebrewLetter.KAPH,
        hebrew: 'כ',
        name: 'Kaph',
        meaning: 'Palm, Grasp',
        gematria: 20,
        doubleLetter: true,
        planet: 'Jupiter'
      },
      [HebrewLetter.LAMED]: {
        letter: HebrewLetter.LAMED,
        hebrew: 'ל',
        name: 'Lamed',
        meaning: 'Goad, Teaching',
        gematria: 30,
        simpleLetter: true,
        zodiac: 'Libra'
      },
      [HebrewLetter.MEM]: {
        letter: HebrewLetter.MEM,
        hebrew: 'מ',
        name: 'Mem',
        meaning: 'Water, Flow',
        gematria: 40,
        motherLetter: true,
        element: 'water'
      },
      [HebrewLetter.NUN]: {
        letter: HebrewLetter.NUN,
        hebrew: 'נ',
        name: 'Nun',
        meaning: 'Fish, Activity',
        gematria: 50,
        simpleLetter: true,
        zodiac: 'Scorpio'
      },
      [HebrewLetter.SAMEKH]: {
        letter: HebrewLetter.SAMEKH,
        hebrew: 'ס',
        name: 'Samekh',
        meaning: 'Support, Prop',
        gematria: 60,
        simpleLetter: true,
        zodiac: 'Sagittarius'
      },
      [HebrewLetter.AYIN]: {
        letter: HebrewLetter.AYIN,
        hebrew: 'ע',
        name: 'Ayin',
        meaning: 'Eye, Perception',
        gematria: 70,
        simpleLetter: true,
        zodiac: 'Capricorn'
      },
      [HebrewLetter.PEH]: {
        letter: HebrewLetter.PEH,
        hebrew: 'פ',
        name: 'Peh',
        meaning: 'Mouth, Expression',
        gematria: 80,
        doubleLetter: true,
        planet: 'Mars'
      },
      [HebrewLetter.TZADDI]: {
        letter: HebrewLetter.TZADDI,
        hebrew: 'צ',
        name: 'Tzaddi',
        meaning: 'Fishhook, Righteousness',
        gematria: 90,
        simpleLetter: true,
        zodiac: 'Aquarius'
      },
      [HebrewLetter.QOPH]: {
        letter: HebrewLetter.QOPH,
        hebrew: 'ק',
        name: 'Qoph',
        meaning: 'Back of Head, Reflection',
        gematria: 100,
        simpleLetter: true,
        zodiac: 'Pisces'
      },
      [HebrewLetter.RESH]: {
        letter: HebrewLetter.RESH,
        hebrew: 'ר',
        name: 'Resh',
        meaning: 'Head, Beginning',
        gematria: 200,
        doubleLetter: true,
        planet: 'Sun'
      },
      [HebrewLetter.SHIN]: {
        letter: HebrewLetter.SHIN,
        hebrew: 'ש',
        name: 'Shin',
        meaning: 'Tooth, Transformation',
        gematria: 300,
        motherLetter: true,
        element: 'fire'
      },
      [HebrewLetter.TAV]: {
        letter: HebrewLetter.TAV,
        hebrew: 'ת',
        name: 'Tav',
        meaning: 'Cross, Completion',
        gematria: 400,
        doubleLetter: true,
        planet: 'Saturn'
      }
    };
  }

  /**
   * Get Tarot correspondences for paths
   */
  static getTarotCorrespondences(): Record<HebrewLetter, TarotCorrespondence> {
    return {
      [HebrewLetter.ALEPH]: {
        card: 'The Fool',
        number: 0,
        element: 'air',
        meaning: 'New beginnings, innocence, spontaneity'
      },
      [HebrewLetter.BETH]: {
        card: 'The Magician',
        number: 1,
        planet: 'Mercury',
        meaning: 'Manifestation, resourcefulness, power'
      },
      [HebrewLetter.GIMEL]: {
        card: 'The High Priestess',
        number: 2,
        planet: 'Moon',
        meaning: 'Intuition, sacred knowledge, divine feminine'
      },
      [HebrewLetter.DALETH]: {
        card: 'The Empress',
        number: 3,
        planet: 'Venus',
        meaning: 'Femininity, beauty, nature, abundance'
      },
      [HebrewLetter.HEH]: {
        card: 'The Emperor',
        number: 4,
        zodiac: 'Aries',
        meaning: 'Authority, establishment, structure'
      },
      [HebrewLetter.VAV]: {
        card: 'The Hierophant',
        number: 5,
        zodiac: 'Taurus',
        meaning: 'Spiritual wisdom, religious beliefs, conformity'
      },
      [HebrewLetter.ZAYIN]: {
        card: 'The Lovers',
        number: 6,
        zodiac: 'Gemini',
        meaning: 'Love, harmony, relationships, values alignment'
      },
      [HebrewLetter.CHETH]: {
        card: 'The Chariot',
        number: 7,
        zodiac: 'Cancer',
        meaning: 'Control, willpower, success, determination'
      },
      [HebrewLetter.TETH]: {
        card: 'Strength',
        number: 8,
        zodiac: 'Leo',
        meaning: 'Strength, courage, persuasion, influence'
      },
      [HebrewLetter.YOD]: {
        card: 'The Hermit',
        number: 9,
        zodiac: 'Virgo',
        meaning: 'Soul searching, seeking inner guidance'
      },
      [HebrewLetter.KAPH]: {
        card: 'Wheel of Fortune',
        number: 10,
        planet: 'Jupiter',
        meaning: 'Good luck, karma, life cycles, destiny'
      },
      [HebrewLetter.LAMED]: {
        card: 'Justice',
        number: 11,
        zodiac: 'Libra',
        meaning: 'Justice, fairness, truth, cause and effect'
      },
      [HebrewLetter.MEM]: {
        card: 'The Hanged Man',
        number: 12,
        element: 'water',
        meaning: 'Suspension, restriction, letting go'
      },
      [HebrewLetter.NUN]: {
        card: 'Death',
        number: 13,
        zodiac: 'Scorpio',
        meaning: 'Endings, beginnings, change, transformation'
      },
      [HebrewLetter.SAMEKH]: {
        card: 'Temperance',
        number: 14,
        zodiac: 'Sagittarius',
        meaning: 'Balance, moderation, patience, purpose'
      },
      [HebrewLetter.AYIN]: {
        card: 'The Devil',
        number: 15,
        zodiac: 'Capricorn',
        meaning: 'Bondage, addiction, sexuality, materialism'
      },
      [HebrewLetter.PEH]: {
        card: 'The Tower',
        number: 16,
        planet: 'Mars',
        meaning: 'Sudden change, upheaval, chaos, revelation'
      },
      [HebrewLetter.TZADDI]: {
        card: 'The Star',
        number: 17,
        zodiac: 'Aquarius',
        meaning: 'Hope, faith, purpose, renewal, spirituality'
      },
      [HebrewLetter.QOPH]: {
        card: 'The Moon',
        number: 18,
        zodiac: 'Pisces',
        meaning: 'Illusion, fear, anxiety, subconscious, intuition'
      },
      [HebrewLetter.RESH]: {
        card: 'The Sun',
        number: 19,
        planet: 'Sun',
        meaning: 'Positivity, fun, warmth, success, vitality'
      },
      [HebrewLetter.SHIN]: {
        card: 'Judgement',
        number: 20,
        element: 'fire',
        meaning: 'Judgement, rebirth, inner calling, absolution'
      },
      [HebrewLetter.TAV]: {
        card: 'The World',
        number: 21,
        planet: 'Saturn',
        meaning: 'Completion, accomplishment, travel, fulfillment'
      }
    };
  }

  /**
   * Generate path visualizations with proper curves
   */
  static generatePathVisualizations(
    sephirot: SephirahConfig[],
    paths: PathConfig[],
    animationTime: number = 0
  ): PathVisualization[] {
    const sephirahMap = new Map(sephirot.map(s => [s.id, s]));
    
    return paths.map(path => {
      const startSephirah = sephirahMap.get(path.from);
      const endSephirah = sephirahMap.get(path.to);
      
      if (!startSephirah || !endSephirah) {
        throw new Error(`Invalid path: ${path.from} -> ${path.to}`);
      }

      // Calculate control points for curved paths
      const controlPoints = this.calculatePathCurve(
        startSephirah.position,
        endSephirah.position,
        path.letter
      );

      // Calculate path properties based on Hebrew letter
      const letterProps = this.getHebrewLetterProperties()[path.letter];
      const width = letterProps.motherLetter ? 3 : letterProps.doubleLetter ? 2 : 1.5;
      const opacity = 0.7 + Math.sin(animationTime * 0.001 + path.number * 0.1) * 0.2;
      const glowIntensity = letterProps.motherLetter ? 15 : 8;

      return {
        path,
        startPoint: startSephirah.position,
        endPoint: endSephirah.position,
        controlPoints,
        width,
        opacity: Math.max(0.3, opacity),
        animated: true,
        glowIntensity
      };
    });
  }

  /**
   * Calculate curved path between two points
   */
  private static calculatePathCurve(
    start: Vector2D,
    end: Vector2D,
    letter: HebrewLetter
  ): Vector2D[] {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Calculate perpendicular offset for curve
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return [];
    
    // Normalize perpendicular vector
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // Curve intensity based on letter type
    const letterProps = this.getHebrewLetterProperties()[letter];
    let curveIntensity = 20;
    
    if (letterProps.motherLetter) curveIntensity = 40;
    else if (letterProps.doubleLetter) curveIntensity = 30;
    
    // Create control point
    const controlPoint = {
      x: midX + perpX * curveIntensity,
      y: midY + perpY * curveIntensity
    };
    
    return [controlPoint];
  }

  /**
   * Generate Hebrew letter symbols for path labels
   */
  static generateHebrewLetterSymbols(
    pathVisualizations: PathVisualization[]
  ): Array<{ position: Vector2D; letter: string; name: string; gematria: number }> {
    const letterProps = this.getHebrewLetterProperties();
    
    return pathVisualizations.map(viz => {
      const props = letterProps[viz.path.letter];
      
      // Position letter at midpoint of path
      const midX = (viz.startPoint.x + viz.endPoint.x) / 2;
      const midY = (viz.startPoint.y + viz.endPoint.y) / 2;
      
      // Offset slightly if there are control points
      let position = { x: midX, y: midY };
      if (viz.controlPoints && viz.controlPoints.length > 0) {
        const control = viz.controlPoints[0];
        position = {
          x: (midX + control.x) / 2,
          y: (midY + control.y) / 2
        };
      }
      
      return {
        position,
        letter: props.hebrew,
        name: props.name,
        gematria: props.gematria
      };
    });
  }

  /**
   * Generate Tarot card positions along paths
   */
  static generateTarotCardPositions(
    pathVisualizations: PathVisualization[]
  ): Array<{ position: Vector2D; card: string; number: number; meaning: string }> {
    const tarotCorrespondences = this.getTarotCorrespondences();
    
    return pathVisualizations.map(viz => {
      const tarot = tarotCorrespondences[viz.path.letter];
      
      // Position card slightly offset from Hebrew letter
      const midX = (viz.startPoint.x + viz.endPoint.x) / 2;
      const midY = (viz.startPoint.y + viz.endPoint.y) / 2;
      
      return {
        position: { x: midX + 15, y: midY - 15 },
        card: tarot.card,
        number: tarot.number,
        meaning: tarot.meaning
      };
    });
  }

  /**
   * Calculate path energies based on Sephirot connections
   */
  static calculatePathEnergies(
    sephirot: SephirahConfig[],
    paths: PathConfig[]
  ): Record<string, { energy: number; polarity: 'positive' | 'negative' | 'neutral' }> {
    const sephirahMap = new Map(sephirot.map(s => [s.id, s]));
    const energies: Record<string, { energy: number; polarity: 'positive' | 'negative' | 'neutral' }> = {};
    
    paths.forEach(path => {
      const startSephirah = sephirahMap.get(path.from);
      const endSephirah = sephirahMap.get(path.to);
      
      if (!startSephirah || !endSephirah) return;
      
      // Calculate energy based on pillar interaction
      let energy = 50; // Base energy
      let polarity: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      if (startSephirah.pillar === 'right' && endSephirah.pillar === 'left') {
        energy = 80;
        polarity = 'positive';
      } else if (startSephirah.pillar === 'left' && endSephirah.pillar === 'right') {
        energy = 80;
        polarity = 'negative';
      } else if (startSephirah.pillar === 'middle' || endSephirah.pillar === 'middle') {
        energy = 90;
        polarity = 'neutral';
      }
      
      // Adjust based on Hebrew letter properties
      const letterProps = this.getHebrewLetterProperties()[path.letter];
      if (letterProps.motherLetter) energy += 20;
      else if (letterProps.doubleLetter) energy += 10;
      
      energies[path.id] = { energy, polarity };
    });
    
    return energies;
  }

  /**
   * Generate meditation path sequences
   */
  static generateMeditationPaths(): Array<{
    name: string;
    description: string;
    sequence: HebrewLetter[];
    duration: number;
  }> {
    return [
      {
        name: 'Lightning Flash',
        description: 'The path of divine emanation from Kether to Malkuth',
        sequence: [
          HebrewLetter.ALEPH, HebrewLetter.BETH, HebrewLetter.GIMEL,
          HebrewLetter.DALETH, HebrewLetter.HEH, HebrewLetter.VAV,
          HebrewLetter.ZAYIN, HebrewLetter.CHETH, HebrewLetter.TETH,
          HebrewLetter.YOD
        ],
        duration: 600000 // 10 minutes
      },
      {
        name: 'Serpent Path',
        description: 'The path of return from Malkuth to Kether',
        sequence: [
          HebrewLetter.TAV, HebrewLetter.SHIN, HebrewLetter.RESH,
          HebrewLetter.QOPH, HebrewLetter.TZADDI, HebrewLetter.PEH,
          HebrewLetter.AYIN, HebrewLetter.SAMEKH, HebrewLetter.NUN,
          HebrewLetter.MEM
        ],
        duration: 900000 // 15 minutes
      },
      {
        name: 'Middle Pillar',
        description: 'Balancing meditation through the central pillar',
        sequence: [
          HebrewLetter.GIMEL, HebrewLetter.SAMEKH, HebrewLetter.TAV
        ],
        duration: 300000 // 5 minutes
      },
      {
        name: 'Three Mother Letters',
        description: 'Meditation on the three elements',
        sequence: [
          HebrewLetter.ALEPH, HebrewLetter.MEM, HebrewLetter.SHIN
        ],
        duration: 180000 // 3 minutes
      }
    ];
  }

  /**
   * Calculate gematria for path combinations
   */
  static calculatePathGematria(letters: HebrewLetter[]): number {
    const letterProps = this.getHebrewLetterProperties();
    return letters.reduce((sum, letter) => sum + letterProps[letter].gematria, 0);
  }

  /**
   * Get path by Hebrew letter
   */
  static getPathByLetter(
    paths: PathConfig[],
    letter: HebrewLetter
  ): PathConfig | undefined {
    return paths.find(path => path.letter === letter);
  }

  /**
   * Get paths connected to a Sephirah
   */
  static getPathsForSephirah(
    paths: PathConfig[],
    sephirah: string
  ): PathConfig[] {
    return paths.filter(path => path.from === sephirah || path.to === sephirah);
  }
}

export default KabbalahPaths;