// src/test/ExportSystemTest.ts - Test suite for the new export system

import { ExportManager } from '../export/ExportManager';
import { StateDuplicator, ApplicationSnapshot } from '../utils/StateDuplicator';
import { StandaloneExporter } from '../export/StandaloneExporter';
import { ExportOptions } from '../types';

export class ExportSystemTest {
  private exportManager: ExportManager;
  private testCanvas: HTMLCanvasElement;
  private testSettings: any;

  constructor() {
    this.exportManager = new ExportManager();
    this.setupTestEnvironment();
  }

  /**
   * Set up test environment with mock canvas and settings
   */
  private setupTestEnvironment() {
    // Create test canvas
    this.testCanvas = document.createElement('canvas');
    this.testCanvas.width = 800;
    this.testCanvas.height = 600;
    
    // Draw test content
    const ctx = this.testCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 800, 600);
      
      // Draw test grid
      ctx.strokeStyle = '#0077ff';
      ctx.lineWidth = 2;
      for (let x = 0; x < 800; x += 50) {
        for (let y = 0; y < 600; y += 50) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      // Draw test shape
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(400, 300, 100, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Create test settings
    this.testSettings = {
      grid: {
        size: 6,
        spacing: 50,
        baseDotSize: 3,
        connectionOpacity: 0.5,
        noiseIntensity: 0.1,
        lineWidthMultiplier: 1,
        breathingSpeed: 1,
        breathingIntensity: 0.2,
        showVertices: true,
        useLineFactorySettings: false
      },
      colors: {
        background: '#000000',
        primary: '#0077ff',
        secondary: '#00ff88',
        accent: '#ff0077'
      },
      shapes: {
        primary: {
          type: 'circle',
          vertices: 6,
          size: 100,
          opacity: 1,
          thickness: 3
        }
      },
      animation: {
        speed: 1,
        enabled: true,
        mode: 'continuous'
      }
    };
  }

  /**
   * Test PNG export functionality
   */
  async testPNGExport(): Promise<boolean> {
    console.log('🧪 Testing PNG export...');
    
    try {
      const options: ExportOptions = {
        format: 'png',
        quality: 0.9,
        width: 800,
        height: 600,
        transparent: false
      };

      let progressCalled = false;
      const progressCallback = (progress: number, message: string) => {
        progressCalled = true;
        console.log(`PNG Export Progress: ${Math.round(progress * 100)}% - ${message}`);
      };

      // Test export (this will download the file)
      await this.exportManager.export(
        this.testSettings,
        this.testCanvas,
        options,
        progressCallback
      );

      if (!progressCalled) {
        throw new Error('Progress callback was not called');
      }

      console.log('✅ PNG export test passed');
      return true;
    } catch (error) {
      console.error('❌ PNG export test failed:', error);
      return false;
    }
  }

  /**
   * Test state duplication functionality
   */
  async testStateDuplication(): Promise<boolean> {
    console.log('🧪 Testing state duplication...');
    
    try {
      // Create snapshot
      const snapshot = await StateDuplicator.createSnapshot(
        this.testCanvas,
        this.testSettings,
        {
          performance: { fps: 60, frameTime: 16.67, memoryUsage: 0, renderTime: 0, particleCount: 0, shapeCount: 0 },
          animation: { currentTime: performance.now(), isPlaying: true, speed: 1, startTime: performance.now() },
          mouse: { position: { x: 400, y: 300 }, isActive: true },
          ui: { showControls: true, activePanel: null, isLoading: false }
        }
      );

      // Validate snapshot
      if (!StateDuplicator.validateSnapshot(snapshot)) {
        throw new Error('Snapshot validation failed');
      }

      // Test snapshot summary
      const summary = StateDuplicator.getSnapshotSummary(snapshot);
      console.log('Snapshot Summary:', summary);

      // Test export/import
      const exported = StateDuplicator.exportSnapshot(snapshot);
      const imported = StateDuplicator.importSnapshot(exported);

      if (!imported) {
        throw new Error('Failed to import snapshot');
      }

      if (!StateDuplicator.validateSnapshot(imported)) {
        throw new Error('Imported snapshot validation failed');
      }

      console.log('✅ State duplication test passed');
      return true;
    } catch (error) {
      console.error('❌ State duplication test failed:', error);
      return false;
    }
  }

  /**
   * Test standalone export functionality
   */
  async testStandaloneExport(): Promise<boolean> {
    console.log('🧪 Testing standalone export...');
    
    try {
      const options: ExportOptions = {
        format: 'standalone',
        quality: 0.9,
        width: 800,
        height: 600,
        transparent: false,
        standaloneTitle: 'Test Sacred Grid',
        includeControls: true,
        enableFullscreen: true,
        showInfo: true
      };

      let progressCalled = false;
      const progressCallback = (progress: number, message: string) => {
        progressCalled = true;
        console.log(`Standalone Export Progress: ${Math.round(progress * 100)}% - ${message}`);
      };

      // Test export (this will download the file)
      await this.exportManager.export(
        this.testSettings,
        this.testCanvas,
        options,
        progressCallback
      );

      if (!progressCalled) {
        throw new Error('Progress callback was not called');
      }

      console.log('✅ Standalone export test passed');
      return true;
    } catch (error) {
      console.error('❌ Standalone export test failed:', error);
      return false;
    }
  }

  /**
   * Test standalone exporter directly
   */
  async testStandaloneExporterDirect(): Promise<boolean> {
    console.log('🧪 Testing StandaloneExporter directly...');
    
    try {
      // Create a snapshot first
      const snapshot = await StateDuplicator.createSnapshot(
        this.testCanvas,
        this.testSettings
      );

      // Test standalone export configuration
      const config = StandaloneExporter.getDefaultConfig(800, 600);
      config.title = 'Direct Test Sacred Grid';
      config.includeControls = true;
      config.showInfo = true;

      // Export standalone
      const blob = await StandaloneExporter.exportStandalone(snapshot, config);

      if (!blob || blob.size === 0) {
        throw new Error('Standalone export produced empty blob');
      }

      console.log(`✅ StandaloneExporter direct test passed - Generated ${(blob.size / 1024).toFixed(1)} KB file`);
      return true;
    } catch (error) {
      console.error('❌ StandaloneExporter direct test failed:', error);
      return false;
    }
  }

  /**
   * Test canvas content preservation
   */
  async testCanvasContentPreservation(): Promise<boolean> {
    console.log('🧪 Testing canvas content preservation...');
    
    try {
      // Create snapshot with canvas content
      const snapshot = await StateDuplicator.createSnapshot(
        this.testCanvas,
        this.testSettings
      );

      // Check if canvas data was captured
      if (!snapshot.canvas.dataURL) {
        throw new Error('Canvas data URL was not captured');
      }

      if (!snapshot.canvas.imageData) {
        console.warn('⚠️ Canvas image data was not captured (may be expected in some browsers)');
      }

      // Verify canvas dimensions
      if (snapshot.canvas.width !== this.testCanvas.width || 
          snapshot.canvas.height !== this.testCanvas.height) {
        throw new Error('Canvas dimensions not preserved correctly');
      }

      console.log('✅ Canvas content preservation test passed');
      return true;
    } catch (error) {
      console.error('❌ Canvas content preservation test failed:', error);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<{ passed: number; failed: number; results: Array<{ test: string; passed: boolean }> }> {
    console.log('🚀 Starting Export System Test Suite...');
    
    const tests = [
      { name: 'PNG Export', test: () => this.testPNGExport() },
      { name: 'State Duplication', test: () => this.testStateDuplication() },
      { name: 'Canvas Content Preservation', test: () => this.testCanvasContentPreservation() },
      { name: 'StandaloneExporter Direct', test: () => this.testStandaloneExporterDirect() },
      { name: 'Standalone Export', test: () => this.testStandaloneExport() }
    ];

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const { name, test } of tests) {
      try {
        const result = await test();
        results.push({ test: name, passed: result });
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Test "${name}" threw an error:`, error);
        results.push({ test: name, passed: false });
        failed++;
      }
    }

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    results.forEach(({ test, passed: testPassed }) => {
      console.log(`${testPassed ? '✅' : '❌'} ${test}`);
    });

    return { passed, failed, results };
  }
}

// Export for use in browser console or test runner
if (typeof window !== 'undefined') {
  (window as any).ExportSystemTest = ExportSystemTest;
}
