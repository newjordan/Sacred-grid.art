// src/audioVisualizer/FrequencyBars.js
import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

// FrequencyBars component for displaying frequency spectrum data
const FrequencyBars = ({
  audioData,
  width = '100%',
  height = 200,
  barWidth = 4,
  barSpacing = 1,
  barCornerRadius = 0,
  barDirection = 'up', // 'up', 'down', 'both'
  minHeight = 2, // Minimum height for bars even when no audio
  maxFrequency = null, // Limit displayed frequency (null = show all)
  logarithmic = true, // Use logarithmic scale for frequencies
  smoothingFactor = 0.7, // 0 = no smoothing, 1 = max smoothing
  color = '#00FFFF', // Can be string or function(index, value)
  gradient = null, // Array of color stops or {start: color, end: color}
  shadowHeight = 0, // Add 3D shadow effect
  shadowColor = 'rgba(0,0,0,0.5)',
  energyFactor = 1.0, // Amplify the visualization
}) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [barValues, setBarValues] = useState([]);
  
  // Animation properties
  const animatedProps = useSpring({
    energyFactor: energyFactor,
    config: { tension: 120, friction: 14 }
  });
  
  // Effect to handle canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const parentWidth = canvas.parentElement.clientWidth;
      const parentHeight = canvas.parentElement.clientHeight;
      
      // Calculate dimensions
      const canvasWidth = width === '100%' ? parentWidth : width;
      const canvasHeight = height === '100%' ? parentHeight : height;
      
      // Set canvas size with device pixel ratio for sharpness
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      
      // Set display size
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      
      setCanvasSize({ width: canvasWidth, height: canvasHeight });
    };
    
    // Initial resize
    resizeCanvas();
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, [width, height]);
  
  // Calculate an appropriate number of bars based on canvas width
  const calculateBarCount = () => {
    if (!canvasSize.width) return 0;
    
    const totalBarWidth = barWidth + barSpacing;
    return Math.floor(canvasSize.width / totalBarWidth);
  };
  
  // Process frequency data and apply logarithmic scaling if needed
  const processFrequencyData = (frequencyData) => {
    if (!frequencyData) return [];
    
    const barCount = calculateBarCount();
    if (barCount <= 0) return [];
    
    // Limit the maximum frequency if specified
    const maxFreqIndex = maxFrequency 
      ? Math.floor(maxFrequency * frequencyData.length / 22050) 
      : frequencyData.length;
    
    const limitedData = frequencyData.slice(0, maxFreqIndex);
    const values = [];
    
    if (logarithmic) {
      // Logarithmic scale (emphasizes lower frequencies)
      for (let i = 0; i < barCount; i++) {
        // Map the bar index to a position in the frequency data using logarithmic scale
        const percent = i / barCount;
        const logIndex = Math.floor(Math.pow(percent, 2) * limitedData.length);
        const value = limitedData[logIndex] || 0;
        values.push(value / 255); // Normalize to 0-1
      }
    } else {
      // Linear scale (evenly distributed)
      const step = limitedData.length / barCount;
      for (let i = 0; i < barCount; i++) {
        const index = Math.min(Math.floor(i * step), limitedData.length - 1);
        const value = limitedData[index] || 0;
        values.push(value / 255); // Normalize to 0-1
      }
    }
    
    return values;
  };
  
  // Apply smoothing to bar values
  useEffect(() => {
    if (!audioData || !audioData.frequencyData) return;
    
    const newValues = processFrequencyData(audioData.frequencyData);
    
    // Apply smoothing if there are previous values
    if (barValues.length > 0 && barValues.length === newValues.length) {
      const smoothedValues = newValues.map((newVal, i) => {
        return barValues[i] * smoothingFactor + newVal * (1 - smoothingFactor);
      });
      setBarValues(smoothedValues);
    } else {
      // No previous values or length mismatch - use new values directly
      setBarValues(newValues);
    }
  }, [audioData, canvasSize, logarithmic, smoothingFactor, maxFrequency]);
  
  // Draw frequency bars
  const drawBars = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || barValues.length === 0) return;
    
    // Apply device pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Get the current energy factor
    const currentEnergyFactor = animatedProps.energyFactor.get();
    
    // Set up bar dimensions
    const totalBarWidth = barWidth + barSpacing;
    const centerY = canvasSize.height / 2;
    
    // Prepare gradient if needed
    let barGradient = null;
    if (gradient) {
      if (Array.isArray(gradient)) {
        // Create gradient from array of stops
        barGradient = ctx.createLinearGradient(0, canvasSize.height, 0, 0);
        gradient.forEach((stop, index) => {
          barGradient.addColorStop(index / (gradient.length - 1), stop);
        });
      } else if (gradient.start && gradient.end) {
        // Create gradient from start/end colors
        barGradient = ctx.createLinearGradient(0, canvasSize.height, 0, 0);
        barGradient.addColorStop(0, gradient.start);
        barGradient.addColorStop(1, gradient.end);
      }
    }
    
    // Draw each bar
    barValues.forEach((value, i) => {
      // Calculate bar height with energy factor applied
      const scaledValue = value * currentEnergyFactor;
      const maxBarHeight = barDirection === 'both' ? centerY - minHeight : canvasSize.height - minHeight;
      const rawHeight = Math.max(minHeight, scaledValue * maxBarHeight);
      
      // Calculate bar position
      const barHeight = Math.min(
        barDirection === 'both' ? centerY - minHeight : canvasSize.height - minHeight,
        rawHeight
      );
      const barX = i * totalBarWidth;
      
      // Determine bar y position and height based on direction
      let barY, effectiveHeight;
      
      switch (barDirection) {
        case 'down':
          barY = 0;
          effectiveHeight = barHeight;
          break;
        
        case 'both':
          barY = centerY - barHeight / 2;
          effectiveHeight = barHeight;
          break;
        
        case 'up':
        default:
          barY = canvasSize.height - barHeight;
          effectiveHeight = barHeight;
          break;
      }
      
      // Determine bar color - can be function, string, or gradient
      if (typeof color === 'function') {
        ctx.fillStyle = color(i, value);
      } else if (barGradient) {
        ctx.fillStyle = barGradient;
      } else {
        ctx.fillStyle = color;
      }
      
      // Draw the bar (with rounded corners if specified)
      if (barCornerRadius > 0) {
        // Draw a rounded rectangle
        const radius = Math.min(barCornerRadius, barWidth / 2, effectiveHeight / 2);
        
        ctx.beginPath();
        ctx.moveTo(barX + radius, barY);
        ctx.lineTo(barX + barWidth - radius, barY);
        ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + radius);
        ctx.lineTo(barX + barWidth, barY + effectiveHeight - radius);
        ctx.quadraticCurveTo(barX + barWidth, barY + effectiveHeight, barX + barWidth - radius, barY + effectiveHeight);
        ctx.lineTo(barX + radius, barY + effectiveHeight);
        ctx.quadraticCurveTo(barX, barY + effectiveHeight, barX, barY + effectiveHeight - radius);
        ctx.lineTo(barX, barY + radius);
        ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
        ctx.closePath();
        ctx.fill();
      } else {
        // Simple rectangle
        ctx.fillRect(barX, barY, barWidth, effectiveHeight);
      }
      
      // Add shadow effect if enabled
      if (shadowHeight > 0) {
        ctx.fillStyle = shadowColor;
        
        // Draw shadow based on bar direction
        if (barDirection === 'up') {
          // Shadow at bottom
          ctx.fillRect(
            barX, 
            canvasSize.height, 
            barWidth, 
            shadowHeight * (effectiveHeight / canvasSize.height)
          );
        } else if (barDirection === 'down') {
          // Shadow at top
          ctx.fillRect(
            barX, 
            effectiveHeight, 
            barWidth, 
            shadowHeight * (effectiveHeight / canvasSize.height)
          );
        } else if (barDirection === 'both') {
          // Shadows on both ends
          const shadowSize = shadowHeight * (effectiveHeight / canvasSize.height);
          ctx.fillRect(barX, barY - shadowSize, barWidth, shadowSize);
          ctx.fillRect(barX, barY + effectiveHeight, barWidth, shadowSize);
        }
      }
    });
  };
  
  // Effect to draw frame on each render or when state updates
  useEffect(() => {
    drawBars();
  }, [barValues, canvasSize, barWidth, barSpacing, barCornerRadius, 
      barDirection, minHeight, color, gradient, shadowHeight, shadowColor]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block', 
        width: '100%', 
        height: '100%'
      }} 
    />
  );
};

export default FrequencyBars;