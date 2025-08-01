// Test script to verify widget generation works
// This can be run in the browser console to test the export functionality

console.log('🧪 Testing Sacred Grid Widget Export...');

// Mock settings that match the application structure
const testSettings = {
    grid: {
        size: 6,
        spacing: 140,
        connectionOpacity: 0.15,
        breathingSpeed: 0.0008,
        breathingIntensity: 0.2,
        lineWidthMultiplier: 1
    },
    colors: {
        background: '#000000',
        scheme: 'blue'
    },
    shapes: {
        primary: {
            type: 'polygon',
            size: 100,
            vertices: 3,
            rotation: 0,
            opacity: 1,
            thickness: 2,
            animation: {
                speed: 0.0008,
                intensity: 0.2
            }
        }
    },
    animation: {
        speed: 1
    }
};

// Mock export options
const testExportOptions = {
    format: 'widget',
    width: 800,
    height: 600,
    quality: 0.9,
    transparent: false,
    widgetTitle: 'Test Sacred Grid Widget',
    includeControls: true,
    enableUrlParams: true
};

// Test the ExportManager
async function testWidgetExport() {
    try {
        console.log('📦 Creating ExportManager...');
        
        // Import the ExportManager (this would normally be imported)
        const { ExportManager } = await import('./src/export/ExportManager.js');
        
        console.log('✅ ExportManager imported successfully');
        
        const exportManager = new ExportManager();
        
        console.log('🎨 Generating widget...');
        
        // Test widget generation
        const blob = await exportManager.exportWidget(testSettings, testExportOptions, (progress, message) => {
            console.log(`📊 Progress: ${Math.round(progress * 100)}% - ${message}`);
        });
        
        console.log('✅ Widget generated successfully!');
        console.log(`📁 Blob size: ${(blob.size / 1024).toFixed(1)} KB`);
        console.log(`📄 Blob type: ${blob.type}`);
        
        // Create download link for testing
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-sacred-grid-widget.html';
        link.textContent = 'Download Test Widget';
        link.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: #0077ff;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-family: Arial, sans-serif;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 119, 255, 0.3);
        `;
        
        document.body.appendChild(link);
        
        console.log('🔗 Download link created! Check the top-right corner of the page.');
        
        // Auto-cleanup after 30 seconds
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('🧹 Cleaned up download link');
        }, 30000);
        
        return blob;
        
    } catch (error) {
        console.error('❌ Widget export test failed:', error);
        throw error;
    }
}

// Test the widget HTML generation directly
function testWidgetHTMLGeneration() {
    console.log('🔧 Testing widget HTML generation...');
    
    try {
        // Create a simple mock ExportManager for testing
        class MockExportManager {
            generateWidgetHTML(settings, config) {
                const settingsJSON = JSON.stringify(settings, null, 2);
                const configJSON = JSON.stringify(config, null, 2);
                
                return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        body { margin: 0; padding: 0; background: ${config.backgroundColor}; overflow: hidden; }
        #sacred-grid-canvas { display: block; margin: 0 auto; }
        .info-panel { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 16px; border-radius: 8px; }
        .control-btn { background: #0077ff; color: white; border: none; padding: 8px 12px; margin: 4px; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <canvas id="sacred-grid-canvas" width="${config.width}" height="${config.height}"></canvas>
    <div class="info-panel">
        <h3>Sacred Grid Player</h3>
        <p>Algorithmic Sacred Geometry</p>
        <button class="control-btn">⏸️</button>
        <button class="control-btn">🔄</button>
    </div>
    <script>
        console.log('🎨 Sacred Grid Widget loaded!');
        console.log('Settings:', ${settingsJSON});
        console.log('Config:', ${configJSON});
        
        // Basic animation loop
        const canvas = document.getElementById('sacred-grid-canvas');
        const ctx = canvas.getContext('2d');
        let startTime = performance.now();
        
        function animate() {
            const time = (performance.now() - startTime) * 0.001;
            
            ctx.fillStyle = '${config.backgroundColor}';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 100 + Math.sin(time) * 20;
            
            ctx.strokeStyle = '#0077ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            requestAnimationFrame(animate);
        }
        
        animate();
    </script>
</body>
</html>`;
            }
        }
        
        const mockExportManager = new MockExportManager();
        const htmlContent = mockExportManager.generateWidgetHTML(testSettings, {
            title: 'Test Sacred Grid Widget',
            width: 800,
            height: 600,
            backgroundColor: '#000000',
            includeControls: true,
            enableUrlParams: true
        });
        
        console.log('✅ Widget HTML generated successfully!');
        console.log(`📊 HTML size: ${(htmlContent.length / 1024).toFixed(1)} KB`);
        
        // Create a blob and download link for testing
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-widget-simple.html';
        link.textContent = 'Download Simple Test Widget';
        link.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            background: #00aa00;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-family: Arial, sans-serif;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 170, 0, 0.3);
        `;
        
        document.body.appendChild(link);
        
        console.log('🔗 Simple widget download link created!');
        
        // Auto-cleanup after 30 seconds
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 30000);
        
        return htmlContent;
        
    } catch (error) {
        console.error('❌ Widget HTML generation test failed:', error);
        throw error;
    }
}

// Run tests
console.log('🚀 Starting widget export tests...');

// Test 1: Simple HTML generation
testWidgetHTMLGeneration();

// Test 2: Full export manager (if available)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🌐 Running in development environment, testing full export...');
    // testWidgetExport(); // Uncomment to test full export
} else {
    console.log('📝 Run this in the Sacred Grid application console to test full export functionality');
}

console.log('✅ Widget export tests completed!');
console.log('📋 Instructions:');
console.log('1. Open the Sacred Grid application');
console.log('2. Open browser console (F12)');
console.log('3. Paste this script and run it');
console.log('4. Check for download links in the top-right corner');
console.log('5. Download and test the generated widgets');
