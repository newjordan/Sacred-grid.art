// src/constants/ShapeTypes.js
export const ShapeType = {
    POLYGON: 'polygon',
    FLOWER_OF_LIFE: 'flowerOfLife',
    MERKABA: 'merkaba',
    CIRCLE: 'circle',
    SPIRAL: 'spiral',
    STAR: 'star',
    LISSAJOUS: 'lissajous',
    HEXAGON: 'hexagon',
    PENTAGON: 'pentagon',
    METATRONS_CUBE: 'metatronsCube',
    TREE_OF_LIFE: 'treeOfLife',
    MANDALA: 'mandala',
    SECONDARY: 'secondary', // Added for secondary shape option
    // Add more as needed
};

export const AnimationMode = {
    GROW: 'grow',
    PULSE: 'pulse',
    ORBIT: 'orbit',
    WAVEFORM: 'waveform',
    SPIRAL: 'spiral',
    HARMONIC: 'harmonic',
    SWARM: 'swarm',
    BREATHE: 'breathe',
    // Add more as needed
};

export const LineStyleType = {
    SOLID: 'solid',
    DASHED: 'dashed',
    DOTTED: 'dotted',
    WAVY: 'wavy',
    ZIGZAG: 'zigzag',
    SPIRAL: 'spiral',
    RIBBON: 'ribbon',
    DOUBLE: 'double',
    COMPLEX: 'complex',
};

export const TaperType = {
    NONE: 'none',
    START: 'start',
    END: 'end',
    BOTH: 'both',
    MIDDLE: 'middle',
};

export const SineWaveType = {
    NONE: 'none',
    SINE: 'sine',
    COSINE: 'cosine',
    SQUARE: 'square',
    TRIANGLE: 'triangle',
    SAWTOOTH: 'sawtooth',
    PULSE: 'pulse',
    NOISE: 'noise',
    COMPOUND: 'compound',
    LISSAJOUS: 'lissajous',
    FIGURE8: 'figure8',
    ROSE: 'rose',
    BUTTERFLY: 'butterfly',
};

// Modulation types for waves
export const ModulationType = {
    NONE: 'none',
    FREQUENCY: 'frequency',
    AMPLITUDE: 'amplitude',
    PHASE: 'phase',
    HARMONIC: 'harmonic',
};

// New shape template system that eliminates need for custom loop line closing
export const ShapeTemplate = {
    // Define each shape with its path function
    CIRCLE: (ctx, x, y, radius) => {
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        return true; // Indicates this is a closed path
    },
    HEXAGON: (ctx, x, y, radius) => {
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            const pointX = x + radius * Math.cos(angle);
            const pointY = y + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(pointX, pointY);
            else ctx.lineTo(pointX, pointY);
        }
        ctx.closePath();
        return true;
    },
    PENTAGON: (ctx, x, y, radius) => {
        for (let i = 0; i < 5; i++) {
            const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
            const pointX = x + radius * Math.cos(angle);
            const pointY = y + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(pointX, pointY);
            else ctx.lineTo(pointX, pointY);
        }
        ctx.closePath();
        return true;
    },
    STAR: (ctx, x, y, radius, points = 5, innerRadius = 0.4) => {
        for (let i = 0; i < points * 2; i++) {
            const angle = i * Math.PI / points - Math.PI / 2;
            const r = i % 2 === 0 ? radius : radius * innerRadius;
            const pointX = x + r * Math.cos(angle);
            const pointY = y + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(pointX, pointY);
            else ctx.lineTo(pointX, pointY);
        }
        ctx.closePath();
        return true;
    },
    LISSAJOUS: (ctx, x, y, radius, a = 3, b = 2, delta = Math.PI/2, segments = 100) => {
        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            const pointX = x + radius * Math.sin(a * t + delta);
            const pointY = y + radius * Math.sin(b * t);
            if (i === 0) ctx.moveTo(pointX, pointY);
            else ctx.lineTo(pointX, pointY);
        }
        // Automatically closes if start and end points match
        return false; // May not be a closed path depending on parameters
    },
    SPIRAL: (ctx, x, y, radius, turns = 4, spiralType = 'golden', segments = 200) => {
        const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            let angle, r;

            switch (spiralType) {
                case 'golden':
                    angle = t * turns * 2 * Math.PI;
                    r = radius * Math.pow(PHI, -2 * t * turns) * 0.8;
                    break;
                case 'archimedean':
                    angle = t * turns * 2 * Math.PI;
                    r = radius * (1 - t * 0.85);
                    break;
                case 'logarithmic':
                    angle = t * turns * 2 * Math.PI;
                    r = radius * Math.exp(-0.2 * t * turns) * 0.9;
                    break;
                default:
                    angle = t * turns * 2 * Math.PI;
                    r = radius * Math.pow(PHI, -2 * t * turns) * 0.8;
            }

            const pointX = x + r * Math.cos(angle);
            const pointY = y + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(pointX, pointY);
            else ctx.lineTo(pointX, pointY);
        }
        return false; // Spirals are not closed paths
    }
};