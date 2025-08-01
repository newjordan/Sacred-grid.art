// src/utils/PackageOptimizer.js - Package Optimization System (JavaScript version)
// Removes unused elements and optimizes exported files for minimal size

export class PackageOptimizer {
  /**
   * Optimize an application snapshot for minimal size
   */
  static optimizeSnapshot(snapshot, options) {
    console.log('🔧 Starting package optimization...');
    
    const originalSnapshot = JSON.stringify(snapshot);
    const originalSize = originalSnapshot.length;
    const removedElements = [];
    const optimizations = [];
    
    let optimizedSnapshot = this.deepClone(snapshot);
    
    // Remove unused settings
    if (options.removeUnusedSettings) {
      const result = this.removeUnusedSettings(optimizedSnapshot);
      optimizedSnapshot = result.snapshot;
      removedElements.push(...result.removed);
      optimizations.push('Removed unused settings');
    }
    
    // Compress canvas data
    if (options.compressCanvasData) {
      const result = this.compressCanvasData(optimizedSnapshot);
      optimizedSnapshot = result.snapshot;
      if (result.compressed) {
        optimizations.push('Compressed canvas data');
      }
    }
    
    // Remove debug information
    if (options.removeDebugCode) {
      const result = this.removeDebugInfo(optimizedSnapshot);
      optimizedSnapshot = result.snapshot;
      removedElements.push(...result.removed);
      optimizations.push('Removed debug information');
    }
    
    const optimizedSize = JSON.stringify(optimizedSnapshot).length;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;
    
    console.log(`✅ Optimization complete: ${compressionRatio.toFixed(1)}% size reduction`);
    
    return {
      snapshot: optimizedSnapshot,
      result: {
        originalSize,
        optimizedSize,
        compressionRatio,
        removedElements,
        optimizations
      }
    };
  }
  
  /**
   * Optimize HTML content for minimal size
   */
  static optimizeHTML(htmlContent, options) {
    let optimized = htmlContent;
    
    if (options.removeComments) {
      // Remove HTML comments
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    if (options.minifyHTML) {
      // Remove extra whitespace
      optimized = optimized.replace(/\s+/g, ' ');
      optimized = optimized.replace(/>\s+</g, '><');
      optimized = optimized.trim();
    }
    
    if (options.optimizeCSS) {
      optimized = this.optimizeCSS(optimized);
    }
    
    if (options.optimizeJS) {
      optimized = this.optimizeJS(optimized);
    }
    
    if (options.removeDebugCode) {
      // Remove console.log statements
      optimized = optimized.replace(/console\.(log|warn|error|info)\([^)]*\);?\s*/g, '');
    }
    
    return optimized;
  }
  
  /**
   * Remove unused settings from snapshot
   */
  static removeUnusedSettings(snapshot) {
    const removed = [];
    const optimized = this.deepClone(snapshot);
    
    // Remove settings that are at default values or unused
    const settings = optimized.settings;
    
    // Check grid settings
    if (settings.grid) {
      if (settings.grid.noiseIntensity === 0) {
        delete settings.grid.noiseIntensity;
        removed.push('grid.noiseIntensity (default value)');
      }
      
      if (settings.grid.breathingIntensity === 0) {
        delete settings.grid.breathingIntensity;
        removed.push('grid.breathingIntensity (default value)');
      }
      
      if (!settings.grid.showVertices) {
        // Remove vertex-related settings if vertices are not shown
        if (settings.grid.vertexSize) {
          delete settings.grid.vertexSize;
          removed.push('grid.vertexSize (vertices not shown)');
        }
      }
    }
    
    // Remove unused animation settings
    if (settings.animation && !settings.animation.enabled) {
      const animationKeys = Object.keys(settings.animation).filter(key => key !== 'enabled');
      animationKeys.forEach(key => {
        delete settings.animation[key];
        removed.push(`animation.${key} (animation disabled)`);
      });
    }
    
    // Remove unused fractal settings if no fractals are enabled
    if (settings.fractals && !this.hasFractalsEnabled(settings)) {
      delete settings.fractals;
      removed.push('fractals (no fractals enabled)');
    }
    
    // Remove unused mouse settings if mouse interaction is disabled
    if (settings.mouse && settings.mouse.influenceRadius === 0) {
      delete settings.mouse.maxScale;
      removed.push('mouse.maxScale (mouse influence disabled)');
    }
    
    return { snapshot: optimized, removed };
  }
  
  /**
   * Compress canvas data if possible
   */
  static compressCanvasData(snapshot) {
    const optimized = this.deepClone(snapshot);
    
    // If canvas data is very large, we might want to reduce quality or remove imageData
    if (optimized.canvas.imageData && optimized.canvas.dataURL) {
      // Keep only dataURL, remove raw imageData to save space
      delete optimized.canvas.imageData;
      return { snapshot: optimized, compressed: true };
    }
    
    return { snapshot: optimized, compressed: false };
  }
  
  /**
   * Remove debug information from snapshot
   */
  static removeDebugInfo(snapshot) {
    const removed = [];
    const optimized = this.deepClone(snapshot);
    
    // Remove performance metrics if not needed
    if (optimized.performance) {
      delete optimized.performance;
      removed.push('performance metrics');
    }
    
    // Remove detailed metadata
    if (optimized.metadata) {
      delete optimized.metadata.userAgent;
      delete optimized.metadata.screenResolution;
      removed.push('detailed metadata');
    }
    
    return { snapshot: optimized, removed };
  }
  
  /**
   * Optimize CSS content
   */
  static optimizeCSS(htmlContent) {
    return htmlContent.replace(/<style>([\s\S]*?)<\/style>/g, (match, css) => {
      // Remove CSS comments
      let optimized = css.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove extra whitespace
      optimized = optimized.replace(/\s+/g, ' ');
      optimized = optimized.replace(/;\s*}/g, '}');
      optimized = optimized.replace(/{\s*/g, '{');
      optimized = optimized.replace(/;\s*/g, ';');
      optimized = optimized.trim();
      
      return `<style>${optimized}</style>`;
    });
  }
  
  /**
   * Optimize JavaScript content
   */
  static optimizeJS(htmlContent) {
    return htmlContent.replace(/<script>([\s\S]*?)<\/script>/g, (match, js) => {
      // Remove JS comments (simple regex, not perfect but good enough)
      let optimized = js.replace(/\/\/.*$/gm, '');
      optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove extra whitespace (basic minification)
      optimized = optimized.replace(/\s+/g, ' ');
      optimized = optimized.replace(/;\s*}/g, ';}');
      optimized = optimized.replace(/{\s*/g, '{');
      optimized = optimized.replace(/;\s*/g, ';');
      optimized = optimized.trim();
      
      return `<script>${optimized}</script>`;
    });
  }
  
  /**
   * Check if any fractals are enabled in settings
   */
  static hasFractalsEnabled(settings) {
    if (!settings.fractals) return false;
    
    // Check if any fractal type is enabled
    const fractalTypes = ['mandelbrot', 'julia', 'sierpinski', 'dragon'];
    return fractalTypes.some(type => settings.fractals[type]?.enabled);
  }
  
  /**
   * Deep clone an object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    
    return obj;
  }
  
  /**
   * Get default optimization options
   */
  static getDefaultOptions() {
    return {
      removeUnusedSettings: true,
      compressCanvasData: true,
      minifyHTML: true,
      removeComments: true,
      optimizeCSS: true,
      optimizeJS: true,
      removeDebugCode: true,
      compressJSON: true
    };
  }
  
  /**
   * Get conservative optimization options (safer but less compression)
   */
  static getConservativeOptions() {
    return {
      removeUnusedSettings: false,
      compressCanvasData: true,
      minifyHTML: true,
      removeComments: true,
      optimizeCSS: true,
      optimizeJS: false,
      removeDebugCode: true,
      compressJSON: true
    };
  }
  
  /**
   * Get aggressive optimization options (maximum compression)
   */
  static getAggressiveOptions() {
    return {
      removeUnusedSettings: true,
      compressCanvasData: true,
      minifyHTML: true,
      removeComments: true,
      optimizeCSS: true,
      optimizeJS: true,
      removeDebugCode: true,
      compressJSON: true
    };
  }
  
  /**
   * Generate optimization report
   */
  static generateOptimizationReport(result) {
    const report = [
      '📊 Package Optimization Report',
      '================================',
      `📦 Original Size: ${(result.originalSize / 1024).toFixed(1)} KB`,
      `🗜️ Optimized Size: ${(result.optimizedSize / 1024).toFixed(1)} KB`,
      `📉 Size Reduction: ${result.compressionRatio.toFixed(1)}%`,
      `💾 Bytes Saved: ${((result.originalSize - result.optimizedSize) / 1024).toFixed(1)} KB`,
      '',
      '🔧 Applied Optimizations:',
      ...result.optimizations.map(opt => `  ✅ ${opt}`),
      '',
      '🗑️ Removed Elements:',
      ...result.removedElements.map(elem => `  ❌ ${elem}`)
    ].join('\n');
    
    return report;
  }
}
