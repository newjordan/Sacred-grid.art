// src/shapes/WaveFunctions.js
// This file contains parametric wave functions and modulation logic for the Sacred Grid

// Basic wave function implementations
export const basicWaveFunctions = {
    // Standard wave functions
    sine: (angle, amplitude) => Math.sin(angle) * amplitude,
    cosine: (angle, amplitude) => Math.cos(angle) * amplitude,
    square: (angle, amplitude) => (Math.sin(angle) > 0 ? 1 : -1) * amplitude,
    triangle: (angle, amplitude) => (Math.asin(Math.sin(angle)) * 2 / Math.PI) * amplitude,

    // New additional wave functions
    sawtooth: (angle, amplitude) => {
        // Normalized sawtooth wave
        const normalized = (angle % (2 * Math.PI)) / (2 * Math.PI);
        return (normalized * 2 - 1) * amplitude;
    },
    pulse: (angle, amplitude, pulseWidth = 0.5) => {
        // Pulse wave with configurable width (0-1)
        const normalized = (angle % (2 * Math.PI)) / (2 * Math.PI);
        return (normalized < pulseWidth ? 1 : -1) * amplitude;
    },
    noise: (angle, amplitude) => {
        // Pseudo-random noise with angle as seed
        // Use sin as a simple pseudo-random function but multiply by large numbers
        return Math.sin(angle * 100 + Math.cos(angle * 50)) * amplitude;
    }
};

// Parametric wave functions (Lissajous and others)
export const parametricWaveFunctions = {
    // Lissajous curve parameters
    lissajous: (angle, params) => {
        const { amplitude, a = 3, b = 2, delta = Math.PI/4 } = params;
        return {
            x: Math.sin(a * angle + delta) * amplitude,
            y: Math.sin(b * angle) * amplitude
        };
    },
    
    // Figure-8 pattern
    figure8: (angle, params) => {
        const { amplitude, scale = 1 } = params;
        return {
            x: Math.sin(angle) * amplitude * scale,
            y: Math.sin(angle * 2) * amplitude * 0.5
        };
    },
    
    // Spiral pattern (expanding or contracting)
    spiral: (angle, params) => {
        const { amplitude, decay = 0.1, growth = false } = params;
        const radiusFactor = growth 
            ? 1 + ((angle % (2 * Math.PI)) / (2 * Math.PI)) * decay
            : 1 - ((angle % (2 * Math.PI)) / (2 * Math.PI)) * decay;
        
        return {
            x: Math.cos(angle) * amplitude * radiusFactor,
            y: Math.sin(angle) * amplitude * radiusFactor
        };
    },
    
    // Rose curve (rhodonea) pattern
    rose: (angle, params) => {
        const { amplitude, n = 3, d = 1 } = params;
        const k = n / d;
        const r = amplitude * Math.cos(k * angle);
        
        return {
            x: r * Math.cos(angle),
            y: r * Math.sin(angle)
        };
    },
    
    // Butterfly curve
    butterfly: (angle, params) => {
        const { amplitude, scale = 1 } = params;
        const r = amplitude * Math.exp(Math.sin(angle)) - 
                 2 * Math.cos(4 * angle) + 
                 Math.pow(Math.sin(angle/12), 5);
        
        return {
            x: Math.sin(angle) * r * scale,
            y: Math.cos(angle) * r * scale
        };
    }
};

// Frequency modulation functions
export const modulationFunctions = {
    // Simple frequency modulation
    frequencyModulation: (baseAngle, params) => {
        const { modFrequency = 0.1, modDepth = 0.5, time = 0 } = params;
        // Apply modulation to the base angle
        return baseAngle + Math.sin(time * modFrequency) * modDepth;
    },
    
    // Amplitude modulation
    amplitudeModulation: (amplitude, params) => {
        const { modFrequency = 0.1, modDepth = 0.5, time = 0 } = params;
        // Apply modulation to the amplitude
        const modFactor = 1 + Math.sin(time * modFrequency) * modDepth;
        return amplitude * modFactor;
    },
    
    // Phase modulation
    phaseModulation: (baseAngle, params) => {
        const { modFrequency = 0.1, modDepth = Math.PI/2, time = 0 } = params;
        // Apply phase shift that varies with time
        return baseAngle + Math.sin(time * modFrequency) * modDepth;
    },
    
    // Harmonic modulation (adds harmonics)
    harmonicModulation: (baseAngle, baseAmplitude, params) => {
        const { harmonics = [1, 0.5, 0.25], time = 0 } = params;
        
        // Start with fundamental frequency
        let result = Math.sin(baseAngle) * baseAmplitude * harmonics[0];
        
        // Add harmonics
        for (let i = 1; i < harmonics.length; i++) {
            const harmonic = i + 1; // harmonic number (2nd, 3rd, etc)
            result += Math.sin(baseAngle * harmonic + time * 0.1 * i) * 
                     baseAmplitude * harmonics[i];
        }
        
        return result;
    }
};

// Compound wave generator (combines multiple wave types)
export function generateCompoundWave(angle, amplitude, components) {
    if (!components || components.length === 0) {
        // Default to sine wave if no components
        return Math.sin(angle) * amplitude;
    }
    
    // Sum all component waves
    let result = 0;
    for (const component of components) {
        // Extract wave properties
        const { type = 'sine', weight = 1.0, frequency = 1.0, phase = 0 } = component;
        
        // Calculate the wave angle with this component's frequency and phase
        const waveAngle = angle * frequency + phase;
        
        // Get the wave function (or default to sine)
        const waveFn = basicWaveFunctions[type] || basicWaveFunctions.sine;
        
        // Add this component's contribution
        result += waveFn(waveAngle, amplitude * weight);
    }
    
    // Normalize the result by the sum of weights
    const totalWeight = components.reduce((sum, comp) => sum + (comp.weight || 1.0), 0);
    if (totalWeight > 0) {
        result = result / totalWeight;
    }
    
    return result;
}

// Wave transformation helper functions
export const waveTransforms = {
    // Apply inversion to a wave value
    invert: (value) => -value,
    
    // Apply exponential transform
    exponential: (value, amplitude, exponent = 2) => {
        const normalized = value / amplitude;
        return Math.sign(normalized) * Math.pow(Math.abs(normalized), exponent) * amplitude;
    },
    
    // Apply clipping
    clip: (value, amplitude, threshold = 0.8) => {
        const limit = amplitude * threshold;
        return Math.max(Math.min(value, limit), -limit);
    },
    
    // Apply folding (wave folding distortion)
    fold: (value, amplitude) => {
        // Normalized value
        const normalized = value / amplitude;
        
        // Apply folding using triangle wave shaping
        if (normalized > 1) {
            return amplitude * (2 - normalized);
        } else if (normalized < -1) {
            return amplitude * (-2 - normalized);
        }
        return value;
    }
};