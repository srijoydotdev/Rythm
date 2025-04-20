"use client";

import { FC } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  handleSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime: (seconds: number) => string;
}

const ProgressBar: FC<ProgressBarProps> = ({ currentTime, duration, handleSeek, formatTime }) => {
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex items-center space-x-2">
      <style jsx>{`
        .progress-bar {
          --thumb-color: white;
          --progress-color: white;
          --track-color: #333333;
          --progress-percentage: ${`${progressPercentage}%`};
          width: 100%;
          height: 4px; /* Increased height for better visibility */
          border-radius: 0.25rem;
          cursor: pointer;
          appearance: none;
          background: linear-gradient(to right, var(--progress-color) var(--progress-percentage), var(--track-color) var(--progress-percentage));
        }

        .progress-bar::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: var(--thumb-color);
          cursor: pointer;
          border-radius: 50%;
        }

        .progress-bar::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: var(--thumb-color);
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
      <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={duration}
        value={currentTime}
        onChange={handleSeek}
        className="w-full h-1 rounded-full cursor-pointer appearance-none" // Basic Tailwind classes
        aria-label="Seek song position"
        style={{ background: 'transparent' }} // Still needed to see the gradient
      />
      <span className="text-xs text-gray-400">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;