// src/audioVisualizer/WaveformVisualizer.js
import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

// Waveform visualizer component
const WaveformVisualizer = ({ 
  audioData, 
  width = '100%', 
  height = 200,
  lineColor = 'rgba(0, 255, 255, 0.8)',
  lineWidth = 2,
  showCenterLine = true,
  centerLineColor = 'rgba(255, 255, 255, 0.3)',
  radial = false,
  radialRadius = 75,
  progressColor = 'rgba(255, 100, 100, 0.5)',
  showProgress = false,
  progress = 0,
  fillColor = null,
  symmetric = false, // Mirror the waveform top/bottom
  smoothingFactor = 0.5, // 0 = no smoothing, 1 = max smoothing
  energyFactor = 1, // Scale the waveform amplitude
}) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Animated properties
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
  
  // Helper function to draw a waveform path
  const drawWaveformPath = (ctx, timeData, width, height, centerY, energyFactor) => {
    if (!timeData || !timeData.length) return;
    
    const sliceWidth = width / timeData.length;
    let x = 0;
    
    // Start the path
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    // Previous point for smoothing
    let prevY = centerY;
    
    // Draw the waveform
    for (let i = 0; i < timeData.length; i++) {
      // Normalize to [-1, 1] range
      const normalized = ((timeData[i] / 128.0) - 1.0);
      
      // Apply energy factor to scale the amplitude
      const scaledValue = normalized * energyFactor;
      
      // Calculate y position
      let y = centerY + scaledValue * (height / 2);
      
      // Apply smoothing if enabled
      if (smoothingFactor > 0 && i > 0) {
        y = prevY * smoothingFactor + y * (1 - smoothingFactor);
      }
      
      // Draw line to this point
      ctx.lineTo(x, y);
      
      // Update for next iteration
      x += sliceWidth;
      prevY = y;
    }
    
    // Complete the path
    if (fillColor) {
      ctx.lineTo(width, centerY);
      ctx.closePath();
    }
  };
  
  // Helper function to draw a radial waveform
  const drawRadialWaveform = (ctx, timeData, centerX, centerY, radius, energyFactor) => {
    if (!timeData || !timeData.length) return;
    
    const angleStep = (2 * Math.PI) / timeData.length;
    
    // Start the path
    ctx.beginPath();
    
    // Previous point for smoothing
    let prevX = centerX + radius;
    let prevY = centerY;
    
    // Draw the radial waveform
    for (let i = 0; i < timeData.length; i++) {
      const angle = i * angleStep;
      
      // Normalize to [-1, 1] range
      const normalized = ((timeData[i] / 128.0) - 1.0);
      
      // Apply energy factor and calculate the radius for this point
      const pointRadius = radius + (normalized * radius * 0.5 * energyFactor);
      
      // Calculate point coordinates
      const x = centerX + Math.cos(angle) * pointRadius;
      const y = centerY + Math.sin(angle) * pointRadius;
      
      // Apply smoothing if enabled
      let smoothX = x;
      let smoothY = y;
      if (smoothingFactor > 0 && i > 0) {
        smoothX = prevX * smoothingFactor + x * (1 - smoothingFactor);
        smoothY = prevY * smoothingFactor + y * (1 - smoothingFactor);
      }
      
      // First point or line to next point
      if (i === 0) {
        ctx.moveTo(smoothX, smoothY);
      } else {
        ctx.lineTo(smoothX, smoothY);
      }
      
      // Update previous point
      prevX = smoothX;
      prevY = smoothY;
    }
    
    // Close the path for filled mode
    if (fillColor) {
      ctx.closePath();
    }
  };
  
  // Main drawing function
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !audioData || !audioData.timeData) return;
    
    // Apply device pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Get central Y position
    const centerY = canvasSize.height / 2;
    
    // Draw center line if enabled
    if (showCenterLine) {
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvasSize.width, centerY);
      ctx.strokeStyle = centerLineColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Set up styling
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    
    if (fillColor) {
      ctx.fillStyle = fillColor;
    }
    
    // Draw progress indicator if enabled
    if (showProgress && progress >= 0 && progress <= 1) {
      const progressX = canvasSize.width * progress;
      ctx.fillStyle = progressColor;
      ctx.fillRect(0, 0, progressX, canvasSize.height);
    }
    
    // Get the energy factor from animated props
    const currentEnergyFactor = animatedProps.energyFactor.get();
    
    if (radial) {
      // Calculate center coordinates
      const centerX = canvasSize.width / 2;
      
      // Draw the radial waveform
      drawRadialWaveform(
        ctx, 
        audioData.timeData, 
        centerX, 
        centerY, 
        radialRadius,
        currentEnergyFactor
      );
      
      // Fill or stroke based on settings
      if (fillColor) {
        ctx.fill();
      }
      ctx.stroke();
    } else {
      // Draw main waveform
      drawWaveformPath(
        ctx, 
        audioData.timeData, 
        canvasSize.width, 
        canvasSize.height, 
        centerY,
        currentEnergyFactor
      );
      
      // Fill or stroke based on settings
      if (fillColor) {
        ctx.fill();
      }
      ctx.stroke();
      
      // Draw mirrored waveform if symmetric is enabled
      if (symmetric) {
        ctx.save();
        ctx.scale(1, -1);
        ctx.translate(0, -canvasSize.height);
        
        drawWaveformPath(
          ctx, 
          audioData.timeData, 
          canvasSize.width, 
          canvasSize.height, 
          centerY,
          currentEnergyFactor
        );
        
        if (fillColor) {
          ctx.fill();
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  };
  
  // Effect to draw frame on each render or when audio data updates
  useEffect(() => {
    drawWaveform();
  }, [audioData, canvasSize, radial, lineColor, lineWidth, fillColor, 
      showCenterLine, centerLineColor, radialRadius, showProgress, 
      progress, symmetric, smoothingFactor]);
  
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

export default WaveformVisualizer;