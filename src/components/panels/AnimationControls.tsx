// src/components/panels/AnimationControls.tsx - Animation timeline and controls

import React, { useState, useRef, useEffect } from 'react';
import GlassPanel from '../ui/GlassPanel';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';
import { AnimationMode } from '../../types';

export interface AnimationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  loop: boolean;
}

export interface AnimationControlsProps {
  animationState: AnimationState;
  onStateChange: (updates: Partial<AnimationState>) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  className?: string;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  animationState,
  onStateChange,
  onPlay,
  onPause,
  onStop,
  onSeek,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Format time for display
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Handle timeline scrubbing
  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * animationState.duration;
    
    onSeek(newTime);
  };

  const handleTimelineDrag = (event: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * animationState.duration;
    
    onSeek(newTime);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          animationState.isPlaying ? onPause() : onPlay();
          break;
        case 'KeyS':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onStop();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onSeek(Math.max(0, animationState.currentTime - 1000));
          break;
        case 'ArrowRight':
          event.preventDefault();
          onSeek(Math.min(animationState.duration, animationState.currentTime + 1000));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animationState, onPlay, onPause, onStop, onSeek]);

  const progress = animationState.duration > 0 
    ? (animationState.currentTime / animationState.duration) * 100 
    : 0;

  return (
    <GlassPanel
      variant="floating"
      className={`w-96 ${className}`}
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white/90">Animation Timeline</h3>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>{formatTime(animationState.currentTime)}</span>
            <span>/</span>
            <span>{formatTime(animationState.duration)}</span>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Timeline</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          
          <div
            ref={timelineRef}
            className="relative h-8 glass rounded-lg cursor-pointer overflow-hidden"
            onClick={handleTimelineClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseMove={handleTimelineDrag}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {/* Progress Bar */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            
            {/* Playhead */}
            <div
              className="absolute top-0 w-1 h-full bg-white shadow-lg transition-all duration-100"
              style={{ left: `${progress}%` }}
            />
            
            {/* Time markers */}
            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white/50 pointer-events-none">
              <span>0:00</span>
              <span>{formatTime(animationState.duration)}</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            shape="circle"
            onClick={onStop}
            disabled={!animationState.isPlaying && animationState.currentTime === 0}
            leftIcon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            }
            aria-label="Stop"
          />

          <Button
            size="sm"
            variant="ghost"
            shape="circle"
            onClick={() => onSeek(Math.max(0, animationState.currentTime - 5000))}
            leftIcon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            }
            aria-label="Rewind 5 seconds"
          />

          <Button
            size="lg"
            variant="primary"
            shape="circle"
            onClick={animationState.isPlaying ? onPause : onPlay}
            glow
            leftIcon={
              animationState.isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )
            }
            aria-label={animationState.isPlaying ? 'Pause' : 'Play'}
          />

          <Button
            size="sm"
            variant="ghost"
            shape="circle"
            onClick={() => onSeek(Math.min(animationState.duration, animationState.currentTime + 5000))}
            leftIcon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            }
            aria-label="Forward 5 seconds"
          />

          <Button
            size="sm"
            variant="ghost"
            shape="circle"
            onClick={() => onSeek(animationState.duration)}
            leftIcon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4zM11 6a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1V6z" />
              </svg>
            }
            aria-label="Go to end"
          />
        </div>

        {/* Animation Settings */}
        <div className="space-y-4">
          {/* Speed Control */}
          <Slider
            label="Playback Speed"
            value={animationState.speed * 100}
            onChange={(value) => onStateChange({ speed: value / 100 })}
            min={10}
            max={300}
            step={5}
            formatValue={(val) => `${val}%`}
            showTicks
            tickCount={7}
          />

          {/* Duration Control */}
          <Slider
            label="Animation Duration"
            value={animationState.duration / 1000}
            onChange={(value) => onStateChange({ duration: value * 1000 })}
            min={1}
            max={60}
            step={0.5}
            formatValue={(val) => `${val}s`}
          />

          {/* Loop Toggle */}
          <Toggle
            checked={animationState.loop}
            onChange={(checked) => onStateChange({ loop: checked })}
            label="Loop Animation"
            description="Automatically restart when animation completes"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onSeek(0);
              onPlay();
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.333 4z" />
              </svg>
            }
          >
            Restart
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newDuration = animationState.duration * 2;
              onStateChange({ duration: newDuration });
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            Extend
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-white/50 space-y-1">
          <div className="font-medium">Keyboard Shortcuts:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div><kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Space</kbd> Play/Pause</div>
            <div><kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Ctrl+S</kbd> Stop</div>
            <div><kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">←</kbd> -1s</div>
            <div><kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">→</kbd> +1s</div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};

export default AnimationControls;