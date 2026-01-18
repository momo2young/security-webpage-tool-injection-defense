import React, { useMemo, useState, useEffect } from 'react';
import { RobotAvatar, RobotVariant } from './RobotAvatar';

interface ThinkingAnimationProps {
  isThinking: boolean;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ isThinking }) => {
  const variants = ['idle', 'observer', 'jumper', 'peeker'];

  // Randomly select 3 variants only when the component mounts
  // This prevents the robots from changing types during a re-render
  const selectedVariants = useMemo(() => {
    return [0, 1, 2].map(() =>
      variants[Math.floor(Math.random() * variants.length)]
    );
  }, []);

  return (
    <div className={`
      absolute inset-0 pointer-events-none
      transition-opacity duration-500
      ${isThinking ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className="scanner-beam"></div>
      <div className="conveyor-track"></div>

      {selectedVariants.map((variant, i) => (
        <div
          key={i}
          className="conveyor-item"
          style={{ animationDelay: `${i * 0.7}s` }}
        >
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="w-8 h-8">
              <RobotAvatar variant={variant as any} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface RobotIconProps {
  className?: string;
  isStreaming?: boolean;
  eyeClass?: string;
  rightEyeStyle?: React.CSSProperties;
}

export const RobotIcon: React.FC<RobotIconProps> = ({
  className = '',
  isStreaming = false,
  eyeClass = 'robot-eye robot-eye-idle',
  rightEyeStyle
}) => {
  return (
    <svg
      className={`w-4 h-4 shrink-0 ${isStreaming ? 'robot-streaming' : ''} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
      <rect x="4" y="4" width="16" height="16" rx="3" fill="#000000" />
      <rect className={eyeClass} x="5.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" />
      <rect className={eyeClass} style={rightEyeStyle} x="13.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" />
    </svg>
  );
};

interface AgentBadgeProps {
  isThinking: boolean;
  isStreaming: boolean;
  eyeClass?: string;
  rightEyeStyle?: React.CSSProperties;
}

// All robot variants for showcase
const SHOWCASE_VARIANTS: RobotVariant[] = [
  'idle', 'observer', 'jumper', 'snoozer', 'peeker', 'shaker', 'skeptic',
  'love', 'rage', 'party', 'eater', 'dj', 'ghost', 'workout', 'portal', 'scanner'
];

export const AgentBadge: React.FC<AgentBadgeProps> = ({
  isThinking,
  isStreaming,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_VARIANTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentVariant = SHOWCASE_VARIANTS[currentIndex];

  return (
    <div className={`
      absolute inset-0 flex items-center justify-center text-white
      transition-opacity duration-500 delay-200
      ${isThinking ? 'opacity-0 pointer-events-none' : 'opacity-100'}
    `}>
      <div
        key={currentIndex}
        className="w-8 h-8 animate-robot-slide-in"
      >
        <RobotAvatar variant={currentVariant} />
      </div>
    </div>
  );
};
