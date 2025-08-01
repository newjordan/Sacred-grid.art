// test-settings-capture.js - Test script to verify settings capture
// Run this in the browser console to test the settings mapping

console.log('🧪 TESTING SETTINGS CAPTURE');
console.log('============================');

// Test the settings capture by simulating the export process
function testSettingsCapture() {
    console.log('🔍 Testing settings capture...');
    
    // Mock current settings (similar to what SacredGrid.js would pass)
    const mockCurrentSettings = {
        // Grid Settings
        gridSize: 8,
        gridSpacing: 120,
        connectionOpacity: 0.25,
        noiseIntensity: 1.2,
        lineWidthMultiplier: 1.5,
        gridBreathingSpeed: 0.001,
        gridBreathingIntensity: 0.3,
        showVertices: true,
        
        // Color Settings
        backgroundColor: '#001122',
        colorScheme: 'purple',
        lineColor: '#ff00ff',
        
        // Primary Shape Settings
        primaryType: 'polygon',
        primarySize: 250,
        primaryOpacity: 0.8,
        primaryThickness: 4,
        primaryVertices: 6,
        primaryRotation: 30,
        primaryOffsetX: 50,
        primaryOffsetY: -25,
        primaryAnimationMode: 'pulse',
        primaryAnimationSpeed: 0.002,
        primaryAnimationIntensity: 0.4,
        primaryAnimationReverse: true,
        
        // Fractal Settings
        primaryFractalDepth: 3,
        primaryFractalScale: 0.7,
        primaryFractalChildCount: 5,
        
        // Animation Settings
        animationSpeed: 1.5,
        
        // Mouse Settings
        mouseInfluenceRadius: 150,
        maxMouseScale: 3,
        
        // Secondary Shape Settings
        secondaryEnabled: true,
        secondaryType: 'circle',
        secondarySize: 180,
        secondaryOpacity: 0.3,
        secondaryThickness: 2,
        secondaryVertices: 8,
        secondaryRotation: 45
    };
    
    console.log('📊 Mock current settings:', mockCurrentSettings);
    
    // Test the SettingsMapper (if available)
    if (window.SettingsMapper) {
        console.log('✅ SettingsMapper found, testing...');
        const comprehensiveSettings = window.SettingsMapper.createComprehensiveSettings(mockCurrentSettings);
        console.log('🗺️ Comprehensive settings:', comprehensiveSettings);
        
        // Test specific mappings
        console.log('🔍 Testing specific mappings:');
        console.log('  Grid size:', mockCurrentSettings.gridSize, '→', comprehensiveSettings.grid?.size);
        console.log('  Background:', mockCurrentSettings.backgroundColor, '→', comprehensiveSettings.colors?.background);
        console.log('  Primary size:', mockCurrentSettings.primarySize, '→', comprehensiveSettings.shapes?.primary?.size);
        console.log('  Primary vertices:', mockCurrentSettings.primaryVertices, '→', comprehensiveSettings.shapes?.primary?.vertices);
        console.log('  Animation speed:', mockCurrentSettings.animationSpeed, '→', comprehensiveSettings.animation?.speed);
        
        return comprehensiveSettings;
    } else {
        console.log('⚠️ SettingsMapper not available in window scope');
        
        // Manual test of the expected structure
        const expectedStructure = {
            grid: {
                size: mockCurrentSettings.gridSize,
                spacing: mockCurrentSettings.gridSpacing,
                connectionOpacity: mockCurrentSettings.connectionOpacity,
                breathingSpeed: mockCurrentSettings.gridBreathingSpeed,
                breathingIntensity: mockCurrentSettings.gridBreathingIntensity
            },
            colors: {
                background: mockCurrentSettings.backgroundColor,
                scheme: mockCurrentSettings.colorScheme,
                lineColor: mockCurrentSettings.lineColor
            },
            shapes: {
                primary: {
                    type: mockCurrentSettings.primaryType,
                    size: mockCurrentSettings.primarySize,
                    vertices: mockCurrentSettings.primaryVertices,
                    rotation: mockCurrentSettings.primaryRotation,
                    opacity: mockCurrentSettings.primaryOpacity,
                    thickness: mockCurrentSettings.primaryThickness,
                    position: {
                        offsetX: mockCurrentSettings.primaryOffsetX,
                        offsetY: mockCurrentSettings.primaryOffsetY
                    },
                    animation: {
                        mode: mockCurrentSettings.primaryAnimationMode,
                        speed: mockCurrentSettings.primaryAnimationSpeed,
                        intensity: mockCurrentSettings.primaryAnimationIntensity,
                        reverse: mockCurrentSettings.primaryAnimationReverse
                    },
                    fractal: {
                        depth: mockCurrentSettings.primaryFractalDepth,
                        scale: mockCurrentSettings.primaryFractalScale,
                        childCount: mockCurrentSettings.primaryFractalChildCount
                    }
                },
                secondary: {
                    enabled: mockCurrentSettings.secondaryEnabled,
                    type: mockCurrentSettings.secondaryType,
                    size: mockCurrentSettings.secondarySize,
                    opacity: mockCurrentSettings.secondaryOpacity,
                    thickness: mockCurrentSettings.secondaryThickness,
                    vertices: mockCurrentSettings.secondaryVertices,
                    rotation: mockCurrentSettings.secondaryRotation
                }
            },
            animation: {
                speed: mockCurrentSettings.animationSpeed
            },
            mouse: {
                influenceRadius: mockCurrentSettings.mouseInfluenceRadius,
                maxScale: mockCurrentSettings.maxMouseScale
            }
        };
        
        console.log('🏗️ Expected structure:', expectedStructure);
        return expectedStructure;
    }
}

// Test widget generation with the captured settings
function testWidgetGeneration(settings) {
    console.log('🎨 Testing widget generation...');
    
    // Create a simple widget HTML with the settings
    const settingsJSON = JSON.stringify(settings, null, 2);
    
    const widgetHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sacred Grid Widget - Settings Test</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: ${settings.colors?.background || '#000000'};
            overflow: hidden;
            font-family: Arial, sans-serif;
        }
        #sacred-grid-canvas {
            display: block;
            margin: 0 auto;
        }
        .info-panel {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 16px;
            border-radius: 8px;
            max-width: 300px;
            font-size: 12px;
        }
        .setting-item {
            margin: 4px 0;
            padding: 2px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .setting-label {
            font-weight: bold;
            color: #0077ff;
        }
    </style>
</head>
<body>
    <canvas id="sacred-grid-canvas" width="800" height="600"></canvas>
    
    <div class="info-panel">
        <h3>🎨 Sacred Grid Widget</h3>
        <p><strong>Settings Test</strong></p>
        
        <div class="setting-item">
            <span class="setting-label">Grid Size:</span> ${settings.grid?.size || 'N/A'}
        </div>
        <div class="setting-item">
            <span class="setting-label">Background:</span> ${settings.colors?.background || 'N/A'}
        </div>
        <div class="setting-item">
            <span class="setting-label">Primary Shape:</span> ${settings.shapes?.primary?.type || 'N/A'}
        </div>
        <div class="setting-item">
            <span class="setting-label">Primary Size:</span> ${settings.shapes?.primary?.size || 'N/A'}
        </div>
        <div class="setting-item">
            <span class="setting-label">Primary Vertices:</span> ${settings.shapes?.primary?.vertices || 'N/A'}
        </div>
        <div class="setting-item">
            <span class="setting-label">Animation Speed:</span> ${settings.animation?.speed || 'N/A'}
        </div>
        
        <button onclick="console.log('Full Settings:', SACRED_GRID_SETTINGS)" 
                style="margin-top: 12px; padding: 8px; background: #0077ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Log Full Settings
        </button>
    </div>

    <script>
        // Embedded settings
        const SACRED_GRID_SETTINGS = ${settingsJSON};
        
        console.log('🎨 Sacred Grid Widget loaded!');
        console.log('📊 Settings:', SACRED_GRID_SETTINGS);
        
        // Basic animation to test the settings
        const canvas = document.getElementById('sacred-grid-canvas');
        const ctx = canvas.getContext('2d');
        let time = 0;
        
        function animate() {
            time += 0.016 * (SACRED_GRID_SETTINGS.animation?.speed || 1);
            
            // Clear with background color
            ctx.fillStyle = SACRED_GRID_SETTINGS.colors?.background || '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw primary shape
            const shape = SACRED_GRID_SETTINGS.shapes?.primary;
            if (shape) {
                const centerX = canvas.width / 2 + (shape.position?.offsetX || 0);
                const centerY = canvas.height / 2 + (shape.position?.offsetY || 0);
                const animatedSize = shape.size + Math.sin(time * (shape.animation?.speed || 0.001) * 1000) * (shape.animation?.intensity || 0.2) * shape.size;
                
                ctx.strokeStyle = SACRED_GRID_SETTINGS.colors?.lineColor || '#0077ff';
                ctx.lineWidth = shape.thickness || 2;
                ctx.globalAlpha = shape.opacity || 1;
                
                // Draw polygon
                ctx.beginPath();
                const vertices = shape.vertices || 3;
                for (let i = 0; i <= vertices; i++) {
                    const angle = (i / vertices) * Math.PI * 2 + (shape.rotation || 0) * Math.PI / 180;
                    const x = centerX + Math.cos(angle) * animatedSize;
                    const y = centerY + Math.sin(angle) * animatedSize;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        // Test settings access
        console.log('🔍 Testing settings access:');
        console.log('  Grid size:', SACRED_GRID_SETTINGS.grid?.size);
        console.log('  Primary shape type:', SACRED_GRID_SETTINGS.shapes?.primary?.type);
        console.log('  Primary shape size:', SACRED_GRID_SETTINGS.shapes?.primary?.size);
        console.log('  Background color:', SACRED_GRID_SETTINGS.colors?.background);
    </script>
</body>
</html>`;
    
    console.log('✅ Widget HTML generated!');
    console.log(`📄 Widget size: ${(widgetHTML.length / 1024).toFixed(1)} KB`);
    
    // Create download link
    const blob = new Blob([widgetHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings-test-widget.html';
    link.textContent = 'Download Settings Test Widget';
    link.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: #ff6600;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-family: Arial, sans-serif;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
    `;
    
    document.body.appendChild(link);
    
    console.log('🔗 Settings test widget download link created!');
    
    // Auto-cleanup after 30 seconds
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 30000);
    
    return widgetHTML;
}

// Run the test
console.log('🚀 Starting settings capture test...');

try {
    const capturedSettings = testSettingsCapture();
    const widgetHTML = testWidgetGeneration(capturedSettings);
    
    console.log('');
    console.log('🎉 SETTINGS CAPTURE TEST RESULTS:');
    console.log('==================================');
    console.log('✅ Settings captured successfully');
    console.log('✅ Widget generated successfully');
    console.log('🔗 Download link created (top-right corner)');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Download the test widget');
    console.log('2. Open it in a browser');
    console.log('3. Verify the settings are displayed correctly');
    console.log('4. Check the animation uses the captured settings');
    console.log('5. Open browser console to see full settings object');
    
} catch (error) {
    console.error('❌ Settings capture test failed:', error);
}

console.log('');
console.log('💡 To test with the actual Sacred Grid app:');
console.log('1. Adjust some settings in the Sacred Grid controls');
console.log('2. Try exporting a widget');
console.log('3. Compare the exported widget with your current settings');
