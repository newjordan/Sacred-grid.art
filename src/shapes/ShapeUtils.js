// src/shapes/ShapeUtils.js
import { AnimationMode } from '../constants/ShapeTypes';

// Utility function for easing animations
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// Generate a stable pseudo-random value based on seed
function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

export function calculateAnimationParams(time, shapeSettings, globalSettings) {
    const { animation } = shapeSettings;
    
    // Unique variation factors based on shape properties
    const uniqueId = (shapeSettings.type?.charCodeAt(0) || 0) + 
                     (shapeSettings.vertices || 0) * 10 + 
                     (shapeSettings.position?.offsetX || 0) * 0.1 +
                     (shapeSettings.position?.offsetY || 0) * 0.1;
    
    // Variable loop duration for more organic feel
    const baseLoopDuration = 6000;
    const durationVariation = animation.variableTiming ? 
        (seededRandom(uniqueId) * 2000) - 1000 : 0; // +/- 1000ms variation if enabled
    const loopDuration = baseLoopDuration + durationVariation;
    
    // Add delay to stagger shape initialization
    const delay = animation.staggerDelay ? uniqueId % animation.staggerDelay : 0;
    
    // Apply child-specific phase shift for fractal children
    // This creates more varied and organic movement in child shapes
    const childPhaseShift = animation.childPhaseShift || 0;
    const childPhaseOffset = childPhaseShift * 500; // Scale the phase shift
    
    const adjustedTime = Math.max(0, time - delay + childPhaseOffset);
    
    const rawProgress = (adjustedTime % loopDuration) / loopDuration;

    // Apply reverse animation if configured
    const progress = animation.reverse ? 1 - rawProgress : rawProgress;

    let dynamicRadius, finalOpacity;
    // Additional movement parameters for the new animation modes
    let offsetX = 0;
    let offsetY = 0;
    let rotationOffset = 0;
    
    // Apply different animation modes with enhanced effects
    if (animation.mode === AnimationMode.GROW) {
        dynamicRadius = shapeSettings.size * progress;
        let fadeValue;
        if (progress < animation.fadeIn) {
            fadeValue = progress / animation.fadeIn;
        } else if (progress > 1 - animation.fadeOut) {
            fadeValue = (1 - progress) / animation.fadeOut;
        } else {
            fadeValue = 1;
        }
        finalOpacity = Math.max(0, Math.min(1, shapeSettings.opacity * fadeValue));
    } else if (animation.mode === AnimationMode.PULSE) {
        // Enhanced pulsing with harmonic variations
        const basePhase = progress * 2 * Math.PI;
        
        // Primary breathing phase 
        const breathingPhase = adjustedTime * animation.speed;
        
        // Add secondary harmonic for more complex movement
        const secondaryPhase = adjustedTime * animation.speed * 1.5;
        const secondaryStrength = 0.3; // Strength of secondary harmonic
        
        const breathingFactor = 1 + 
            (Math.sin(breathingPhase) * animation.intensity) +
            (Math.sin(secondaryPhase) * animation.intensity * secondaryStrength);
            
        const pulse = 0.5 + 0.5 * Math.sin(basePhase);
        dynamicRadius = shapeSettings.size * pulse * breathingFactor;
        
        // Vary opacity slightly with pulse for more dynamic effect
        const opacityPulse = 1 + (Math.sin(breathingPhase * 1.3) * 0.15);
        finalOpacity = Math.min(1, shapeSettings.opacity * opacityPulse);
    } else if (animation.mode === AnimationMode.ORBIT) {
        // Orbital motion animation - with circular path
        const orbitPhase = adjustedTime * animation.speed;
        const baseRadius = shapeSettings.size * (0.8 + 0.2 * Math.sin(orbitPhase * 0.5));
        dynamicRadius = baseRadius;
        finalOpacity = shapeSettings.opacity;
        
        // Add orbital movement - shapes move in a circular pattern
        const orbitRadius = shapeSettings.size * 0.3 * animation.intensity;
        offsetX = Math.cos(orbitPhase) * orbitRadius;
        offsetY = Math.sin(orbitPhase) * orbitRadius;
        
        // Add slight rotation with orbit
        rotationOffset = Math.sin(orbitPhase * 0.25) * 15; // ±15 degrees rotation
    } else if (animation.mode === AnimationMode.WAVEFORM) {
        // Waveform-based animation with harmonic oscillation
        const wavePhase = adjustedTime * animation.speed;
        
        // Combine multiple sine waves at different frequencies
        const wave1 = Math.sin(wavePhase);
        const wave2 = Math.sin(wavePhase * 2.5) * 0.3;
        const wave3 = Math.sin(wavePhase * 0.6) * 0.1;
        
        const waveform = wave1 + wave2 + wave3;
        const normalizedWave = (waveform / 1.4) * animation.intensity; // Normalize amplitude
        
        dynamicRadius = shapeSettings.size * (1 + normalizedWave);
        
        // Subtle opacity oscillation for waveform mode
        const opacityWave = 1 + (Math.sin(wavePhase * 1.7) * 0.1);
        finalOpacity = Math.min(1, shapeSettings.opacity * opacityWave);
        
        // Add wavy motion along an axis
        offsetX = Math.sin(wavePhase) * shapeSettings.size * 0.2 * animation.intensity;
        offsetY = Math.cos(wavePhase * 0.7) * shapeSettings.size * 0.15 * animation.intensity;
    } else if (animation.mode === AnimationMode.SPIRAL) {
        // Spiral motion around the center
        const spiralPhase = adjustedTime * animation.speed;
        
        // Radius calculation with spiral effect
        dynamicRadius = shapeSettings.size * (0.9 + 0.1 * Math.sin(spiralPhase * 0.5));
        finalOpacity = shapeSettings.opacity * (0.8 + 0.2 * Math.sin(spiralPhase * 0.75));
        
        // Create spiral motion - increasing radius as the shape rotates
        const angle = spiralPhase * 2;
        const spiralGrowth = (1 - Math.cos(spiralPhase * 0.5)) * 0.5;
        const spiralRadius = shapeSettings.size * 0.4 * spiralGrowth * animation.intensity;
        
        offsetX = Math.cos(angle) * spiralRadius;
        offsetY = Math.sin(angle) * spiralRadius;
        
        // Add continuous rotation
        rotationOffset = spiralPhase * 30; // Continuous rotation
    } else if (animation.mode === AnimationMode.HARMONIC) {
        // Harmonic oscillation with Lissajous patterns
        const harmonicPhase = adjustedTime * animation.speed;
        
        // Use variable frequency ratio for complexity
        const frequencyRatio = 1.5 + Math.sin(harmonicPhase * 0.1) * 0.5;
        
        // Dynamic radius with multiple harmonics
        const radiusWave = 
            Math.sin(harmonicPhase) * 0.3 + 
            Math.sin(harmonicPhase * 1.7) * 0.2 +
            Math.sin(harmonicPhase * 0.4) * 0.1;
            
        dynamicRadius = shapeSettings.size * (0.9 + radiusWave * animation.intensity * 0.3);
        
        // Harmonically varying opacity
        const opacityHarmonic = 0.85 + Math.sin(harmonicPhase * 1.3) * 0.15;
        finalOpacity = shapeSettings.opacity * opacityHarmonic;
        
        // Create Lissajous pattern movement
        const a = 3; // X frequency
        const b = frequencyRatio; // Y frequency - slightly off integer creates shifting pattern
        const delta = harmonicPhase * 0.2; // Phase difference that changes over time
        
        // Scale the pattern by shape size and animation intensity
        const patternScale = shapeSettings.size * 0.25 * animation.intensity;
        offsetX = Math.sin(a * harmonicPhase + delta) * patternScale;
        offsetY = Math.sin(b * harmonicPhase) * patternScale;
        
        // Add subtle rotation based on the pattern phase
        rotationOffset = Math.sin(harmonicPhase * 0.3) * 20;
    } else if (animation.mode === AnimationMode.SWARM) {
        // Swarm-like behavior with semi-random movements
        const swarmPhase = adjustedTime * animation.speed;
        
        // Get stable random values based on uniqueId for consistent behavior
        const randBase1 = seededRandom(uniqueId * 1.1);
        const randBase2 = seededRandom(uniqueId * 2.2);
        const randBase3 = seededRandom(uniqueId * 3.3);
        
        // Create multiple frequency components for organic movement
        const swarmFreq1 = 0.5 + randBase1;
        const swarmFreq2 = 0.7 + randBase2;
        const swarmFreq3 = 0.3 + randBase3;
        
        // Semi-random movement with multiple sine waves of varying frequencies
        offsetX = (
            Math.sin(swarmPhase * swarmFreq1) * 0.5 +
            Math.sin(swarmPhase * swarmFreq2 * 1.7) * 0.3 +
            Math.cos(swarmPhase * swarmFreq3 * 0.5) * 0.2
        ) * shapeSettings.size * 0.3 * animation.intensity;
        
        offsetY = (
            Math.cos(swarmPhase * swarmFreq1 * 0.8) * 0.5 +
            Math.sin(swarmPhase * swarmFreq3 * 1.3) * 0.3 +
            Math.cos(swarmPhase * swarmFreq2 * 0.7) * 0.2
        ) * shapeSettings.size * 0.3 * animation.intensity;
        
        // Pulse radius slightly
        dynamicRadius = shapeSettings.size * (0.95 + 0.05 * Math.sin(swarmPhase * randBase2 * 2));
        
        // Vary opacity 
        finalOpacity = shapeSettings.opacity * (0.9 + 0.1 * Math.sin(swarmPhase * randBase3));
        
        // Random rotation
        rotationOffset = Math.sin(swarmPhase * randBase1) * 25;
    } else if (animation.mode === AnimationMode.BREATHE) {
        // Breathing effect with gentle expansion and contraction
        const breathePhase = adjustedTime * animation.speed;
        
        // Use easeOutElastic for dynamic breathing
        const breatheCycle = (Math.sin(breathePhase) + 1) / 2; // Normalized 0-1
        const breatheEased = easeOutElastic(breatheCycle);
        
        // Radius varies with breathing
        dynamicRadius = shapeSettings.size * (0.8 + 0.3 * breatheEased * animation.intensity);
        
        // Subtle radial pulsing motion
        const pulseDir = breathePhase * 0.2; // Direction of pulse varies slowly
        offsetX = Math.cos(pulseDir) * (breatheEased * 0.1) * shapeSettings.size * animation.intensity;
        offsetY = Math.sin(pulseDir) * (breatheEased * 0.1) * shapeSettings.size * animation.intensity;
        
        // Opacity changes with breath
        finalOpacity = shapeSettings.opacity * (0.8 + 0.2 * breatheEased);
        
        // Subtle rotation with breathing
        rotationOffset = (breatheEased - 0.5) * 5 * animation.intensity;
    } else {
        // Fallback to basic animation
        dynamicRadius = shapeSettings.size;
        finalOpacity = shapeSettings.opacity;
    }

    return { 
        dynamicRadius, 
        finalOpacity,
        progress, // Return progress for additional effects
        uniqueId, // Return the unique ID for consistency in effects
        adjustedTime, // Return adjusted time for synchronization
        offsetX,    // New movement parameter
        offsetY,    // New movement parameter
        rotationOffset // New rotation parameter
    };
}