// src/SacredGridFull.jsx - Sacred Grid with ALL original UI controls
import React, { useState, useRef, useEffect, useCallback } from 'react';

// All the same implementations as SacredGridAdvanced but with FULL UI
const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const PI = Math.PI;
const TWO_PI = Math.PI * 2;

// Same class implementations as before...
class MetatronsCube {
  static generateCirclePattern(center, radius) {
    const circles = [];
    circles.push({ center: { ...center }, radius: radius * 0.3, id: 'center' });
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI;
      const distance = radius * 0.5;
      circles.push({
        center: {
          x: center.x + Math.cos(angle) * distance,
          y: center.y + Math.sin(angle) * distance
        },
        radius: radius * 0.3,
        id: `inner_${i}`
      });
    }
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI + PI / 6;
      const distance = radius * 0.866;
      circles.push({
        center: {
          x: center.x + Math.cos(angle) * distance,
          y: center.y + Math.sin(angle) * distance
        },
        radius: radius * 0.3,
        id: `outer_${i}`
      });
    }
    
    return circles;
  }
  
  static generateConnections(circles) {
    const connections = [];
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const distance = Math.sqrt(
          Math.pow(circles[j].center.x - circles[i].center.x, 2) +
          Math.pow(circles[j].center.y - circles[i].center.y, 2)
        );
        if (distance < circles[i].radius * 4) {
          connections.push({
            start: circles[i].center,
            end: circles[j].center
          });
        }
      }
    }
    return connections;
  }
}

const SacredGridFull = ({ width = window.innerWidth, height = window.innerHeight }) => {