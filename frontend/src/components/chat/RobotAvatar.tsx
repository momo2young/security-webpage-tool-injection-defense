import React from 'react';

export type RobotVariant =
    | 'idle'
    | 'observer' // V14: Searching
    | 'jumper'   // V15: Action
    | 'snoozer'  // V16: Sleep
    | 'peeker'   // V17: Hide/Seek
    | 'shaker'   // V18: Error/Panic
    | 'skeptic'  // V19: Thinking
    | 'love'     // V20: Heart Eyes
    | 'rage'     // V21: Angry
    | 'party'    // V22: Cool
    | 'eater'    // V23: Munching
    | 'dj'       // V24: Music
    | 'ghost'    // V25: 404
    | 'workout'  // V26: Training
    | 'portal'   // V27: Teleport
    | 'scanner'; // V28: OCR

interface RobotAvatarProps {
    variant?: RobotVariant;
    className?: string;
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
    variant = 'idle',
    className = ''
}) => {

    // Base SVG structure reuse for many variants
    const BaseRobot = ({ children, eyesClass = '', eyeStyle = {}, bodyStyle = {} }: any) => (
        <svg className="w-full h-full overflow-visible" viewBox="0 0 24 24" style={bodyStyle}>
            <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" stroke="none" />
            <rect x="4" y="4" width="16" height="16" rx="3" fill="#000000" />
            {children}
            <rect className={`eye left ${eyesClass}`} style={eyeStyle} x="5.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" />
            <rect className={`eye right ${eyesClass}`} style={eyeStyle} x="13.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" />
        </svg>
    );

    // --- Variant Renderers ---

    // V14: Observer (Searching/Active)
    if (variant === 'observer') {
        return (
            <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
                <svg className="w-full h-full overflow-visible" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
                    <rect x="4" y="4" width="16" height="16" rx="3" fill="#000000" />
                    <g style={{ animation: 'robot-look-around 4s infinite step-end' }}>
                        <rect className="eye" x="5.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" />
                        <rect className="eye" x="13.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" />
                    </g>
                </svg>
            </div>
        );
    }

    // V15: Jumper (Action)
    if (variant === 'jumper') {
        return (
            <div className={`relative w-full h-full flex flex-col justify-end items-center ${className}`}>
                <div style={{ animation: 'robot-jump-body 1.2s infinite cubic-bezier(0.28, 0.84, 0.42, 1)', width: '100%', height: '100%' }}>
                    <BaseRobot />
                </div>
            </div>
        );
    }

    // V16: Snoozer (Idle/Sleep)
    if (variant === 'snoozer') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute -top-3 -right-2 flex flex-col text-[8px] font-bold text-brutal-black opacity-60">
                    <span style={{ animation: 'robot-float-z 3s infinite linear', animationDelay: '0s' }}>Z</span>
                    <span style={{ animation: 'robot-float-z 3s infinite linear', animationDelay: '1s' }}>z</span>
                </div>
                <div style={{ animation: 'robot-breathe-body 4s infinite ease-in-out', width: '100%', height: '100%' }}>
                    <BaseRobot eyeStyle={{ animation: 'robot-breathe-eyes 4s infinite ease-in-out', transformOrigin: 'center' }} />
                </div>
            </div>
        );
    }

    // V17: Peeker (Active/HideAndSeek)
    if (variant === 'peeker') {
        return (
            <div className={`relative w-full h-full overflow-hidden ${className}`}>
                <div style={{ animation: 'robot-peek-up 3s infinite ease-in-out', width: '100%', height: '100%' }}>
                    <BaseRobot />
                </div>
            </div>
        );
    }

    // V18: Shaker (Error/Panic)
    if (variant === 'shaker') {
        return (
            <div className={`relative w-full h-full flex flex-col items-center ${className}`}>
                <div className="absolute top-0 -left-1 w-1.5 h-2 bg-brutal-black rounded-full opacity-0" style={{ animation: 'robot-sweat-drop 0.8s infinite' }} />
                <div className="absolute top-0 -right-1 w-1.5 h-2 bg-brutal-black rounded-full opacity-0" style={{ animation: 'robot-sweat-drop 0.8s infinite 0.4s' }} />
                <div style={{ animation: 'robot-shake-hard 0.2s infinite', width: '100%', height: '100%' }}>
                    <BaseRobot eyeStyle={{ animation: 'robot-dilate 2s infinite alternate', transformOrigin: 'center' }} />
                </div>
            </div>
        );
    }

    // V19: Skeptic (Thinking/Pondering)
    if (variant === 'skeptic') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute -top-4 -right-1 text-lg font-bold text-brutal-black" style={{ animation: 'robot-float-q 3s infinite ease-in-out' }}>?</div>
                <div style={{ animation: 'robot-ponder-tilt 3s infinite ease-in-out', transformOrigin: 'bottom center', width: '100%', height: '100%' }}>
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
                        <rect x="4" y="4" width="16" height="16" rx="3" fill="#000000" />
                        {/* Left Eye Squint */}
                        <rect className="eye" x="5.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" style={{ transformOrigin: 'center', animation: 'robot-squint 3s infinite ease-in-out' }} />
                        {/* Right Eye Raised */}
                        <rect className="eye" x="13.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" style={{ animation: 'robot-raise-brow 3s infinite ease-in-out' }} />
                    </svg>
                </div>
            </div>
        );
    }

    // V20: Love (Heart Eyes)
    if (variant === 'love') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute -top-3 left-0 text-xs text-brutal-black" style={{ animation: 'robot-float-up 2s infinite linear' }}>♥</div>
                <div className="absolute -top-3 right-0 text-xs text-brutal-black" style={{ animation: 'robot-float-up 2s infinite linear 1s' }}>♥</div>
                <div style={{ animation: 'robot-heartbeat 1s infinite', width: '100%', height: '100%' }}>
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
                        <rect x="4" y="4" width="16" height="16" rx="3" fill="#000000" />
                        {/* Heart Eyes */}
                        <text x="5" y="11" fontSize="8" fill="currentColor" style={{ animation: 'robot-pulse-eye 1s infinite alternate', transformOrigin: 'center' }}>♥</text>
                        <text x="13" y="11" fontSize="8" fill="currentColor" style={{ animation: 'robot-pulse-eye 1s infinite alternate', transformOrigin: 'center' }}>♥</text>
                    </svg>
                </div>
            </div>
        );
    }

    // V21: Rage (Angry/Error)
    if (variant === 'rage') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute -top-2 left-1 w-1.5 h-1.5 bg-neutral-600 rounded-full opacity-0" style={{ animation: 'robot-steam-rise 0.5s infinite linear' }} />
                <div className="absolute -top-2 right-1 w-1.5 h-1.5 bg-neutral-600 rounded-full opacity-0" style={{ animation: 'robot-steam-rise 0.5s infinite linear 0.2s' }} />
                <div style={{ animation: 'robot-vibrate 0.1s infinite', width: '100%', height: '100%' }}>
                    {/* Eyebrows Overlay */}
                    <div className="absolute z-10 w-3 h-1 bg-neutral-800 top-[6px] left-[6px] rotate-[20deg]" />
                    <div className="absolute z-10 w-3 h-1 bg-neutral-800 top-[6px] right-[6px] -rotate-[20deg]" />
                    <BaseRobot />
                </div>
            </div>
        );
    }

    // V22: Party/Cool (Success)
    if (variant === 'party') {
        return (
            <div className={`relative w-full h-full ${className}`} style={{ animation: 'robot-strobe 0.2s infinite' }}>
                <div style={{ animation: 'robot-bounce-beat 0.5s infinite', width: '100%', height: '100%' }}>
                    {/* Sunglasses */}
                    <div className="absolute w-[18px] h-[5px] bg-black z-10 left-[3px]" style={{ animation: 'robot-slide-glasses 2s forwards' }}>
                        <div className="absolute w-[2px] h-[2px] bg-black top-[1px] left-[8px]" /> {/* Bridge */}
                    </div>
                    <BaseRobot />
                </div>
            </div>
        );
    }

    // V23: Eater (Munching/Action)
    if (variant === 'eater') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[8px] font-bold text-brutal-black opacity-0" style={{ animation: 'robot-feed 1.5s infinite linear' }}>01</div>
                <div style={{ animation: 'robot-chomp 0.4s infinite alternate', width: '100%', height: '100%', transformOrigin: 'center' }}>
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
                        <rect x="4" y="4" width="16" height="16" rx="3" fill="#000000" />
                        <rect x="6.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" />
                        <rect x="14.5" y="7" width="5" height="5" rx="1.5" fill="currentColor" />
                    </svg>
                </div>
            </div>
        );
    }

    // V25: Ghost (404/Not Found)
    if (variant === 'ghost') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute -top-2 -right-2 text-[8px] font-bold" style={{ animation: 'robot-boo-fade 2s infinite' }}>404</div>
                <div style={{ animation: 'robot-float-ghost 3s infinite ease-in-out', width: '100%', height: '100%' }}>
                    {/* Sheet Overlay */}
                    <div className="absolute top-[-2px] left-[-2px] w-[28px] h-[28px] bg-neutral-200 border-2 border-black rounded-t-xl z-10"
                        style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 70% 85%, 55% 100%, 40% 85%, 25% 100%, 10% 85%, 0% 100%)' }}>
                        <div className="absolute top-[8px] left-[6px] w-[3px] h-[3px] bg-black rounded-full" />
                        <div className="absolute top-[8px] right-[6px] w-[3px] h-[3px] bg-black rounded-full" />
                    </div>
                    <BaseRobot />
                </div>
            </div>
        );
    }

    // V26: Workout (Training)
    if (variant === 'workout') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute -top-4 w-full h-1 bg-black z-20" style={{ animation: 'robot-lift 1.5s infinite' }}>
                    <div className="absolute -top-1 left-0 w-1 h-3 bg-black border border-black" />
                    <div className="absolute -top-1 right-0 w-1 h-3 bg-black border border-black" />
                </div>
                <div className="absolute top-2 -right-1 w-1 h-1 bg-black rounded-full opacity-0" style={{ animation: 'robot-sweat-fall 1.5s infinite 0.5s' }} />
                <div style={{ animation: 'robot-squat 1.5s infinite', width: '100%', height: '100%' }}>
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
                        <rect x="4" y="4" width="16" height="16" rx="3" fill="#000000" />
                        <rect x="5.5" y="9" width="5" height="2" fill="currentColor" /> {/* Squint eyes */}
                        <rect x="13.5" y="9" width="5" height="2" fill="currentColor" />
                    </svg>
                </div>
            </div>
        );
    }

    // V27: Portal (Teleport)
    if (variant === 'portal') {
        return (
            <div className={`relative w-full h-full flex flex-col items-center justify-center ${className}`}>
                <div className="absolute top-0 w-3/4 h-1 bg-black rounded-full" style={{ animation: 'robot-hole-pulse 2s infinite' }} />
                <div style={{ animation: 'robot-teleport 2s infinite ease-in-out', width: '100%', height: '100%', zIndex: 10 }}>
                    <BaseRobot />
                </div>
                <div className="absolute bottom-0 w-3/4 h-1 bg-black rounded-full" style={{ animation: 'robot-hole-pulse 2s infinite' }} />
            </div>
        );
    }

    // V28: Scanner (OCR/Analyzer)
    if (variant === 'scanner') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent z-20 pointer-events-none border-r border-black/50"
                    style={{ animation: 'robot-scan-pass 2s infinite linear' }} />
                <div style={{ opacity: 0.8 }} className="w-full h-full">
                    <BaseRobot />
                </div>
            </div>
        );
    }

    // Base/Idle
    return (
        <div className={`relative w-full h-full ${className}`}>
            <BaseRobot eyesClass="robot-eye robot-eye-idle" />
        </div>
    );
};
