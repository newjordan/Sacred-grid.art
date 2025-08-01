import React, { useState, useCallback, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const VideoConverter = ({ pngFiles, fps = 15, width = 512, height = 512, onProgress, onComplete, onError }) => {
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const ffmpegRef = useRef(null);

    const initializeFFmpeg = useCallback(async () => {
        if (ffmpegRef.current) return ffmpegRef.current;

        try {
            setStatus('Initializing FFmpeg...');
            const ffmpeg = new FFmpeg();
            
            // Load FFmpeg with CDN URLs
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            // Set up progress listener
            ffmpeg.on('progress', ({ progress: ffmpegProgress }) => {
                const progressPercent = Math.round(ffmpegProgress * 100);
                setProgress(progressPercent);
                setStatus(`Converting to MP4: ${progressPercent}%`);
                if (onProgress) onProgress(progressPercent);
            });

            ffmpegRef.current = ffmpeg;
            return ffmpeg;
        } catch (error) {
            console.error('Failed to initialize FFmpeg:', error);
            throw new Error('Failed to initialize video converter');
        }
    }, [onProgress]);

    const convertPNGsToMP4 = useCallback(async () => {
        if (!pngFiles || pngFiles.length === 0) {
            throw new Error('No PNG files provided');
        }

        setIsConverting(true);
        setProgress(0);

        try {
            const ffmpeg = await initializeFFmpeg();
            
            setStatus('Loading PNG files...');
            
            // Write PNG files to FFmpeg filesystem
            for (let i = 0; i < pngFiles.length; i++) {
                const file = pngFiles[i];
                const fileName = `frame_${String(i).padStart(4, '0')}.png`;
                
                // Convert data URL to blob
                const response = await fetch(file.dataURL);
                const blob = await response.blob();
                
                // Write to FFmpeg filesystem
                await ffmpeg.writeFile(fileName, await fetchFile(blob));
                
                // Update progress for file loading
                const loadProgress = Math.round((i / pngFiles.length) * 30); // 30% for loading
                setProgress(loadProgress);
                setStatus(`Loading PNG files: ${i + 1}/${pngFiles.length}`);
            }

            setStatus('Converting to MP4...');
            
            // Run FFmpeg conversion
            await ffmpeg.exec([
                '-framerate', fps.toString(),
                '-i', 'frame_%04d.png',
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-crf', '18', // High quality
                '-preset', 'medium',
                '-s', `${width}x${height}`,
                'output.mp4'
            ]);

            // Read the output file
            const data = await ffmpeg.readFile('output.mp4');
            
            // Create download blob
            const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
            
            // Clean up FFmpeg filesystem
            for (let i = 0; i < pngFiles.length; i++) {
                const fileName = `frame_${String(i).padStart(4, '0')}.png`;
                try {
                    await ffmpeg.deleteFile(fileName);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
            
            try {
                await ffmpeg.deleteFile('output.mp4');
            } catch (e) {
                // Ignore cleanup errors
            }

            setProgress(100);
            setStatus('Conversion complete!');
            setIsConverting(false);

            if (onComplete) {
                onComplete(videoBlob);
            }

            return videoBlob;

        } catch (error) {
            console.error('Video conversion error:', error);
            setIsConverting(false);
            setStatus('Conversion failed');
            if (onError) {
                onError(error);
            }
            throw error;
        }
    }, [pngFiles, fps, width, height, initializeFFmpeg, onComplete, onError]);

    const downloadVideo = useCallback((videoBlob, filename = 'sacred-grid-animation.mp4') => {
        const url = URL.createObjectURL(videoBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    return {
        isConverting,
        progress,
        status,
        convertPNGsToMP4,
        downloadVideo
    };
};

export default VideoConverter;
