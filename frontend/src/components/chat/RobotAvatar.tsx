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

    const ROBOT_SCALE = 0.75;

    // Wrapper for consistent scaling and centering
    const RobotBody = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
        <div className="w-full h-full flex items-center justify-center" style={style}>
            <svg className="w-full h-full" viewBox="0 0 24 24" style={{ transform: `scale(${ROBOT_SCALE})` }}>
                {children}
            </svg>
        </div>
    );

    // Standard robot face (black square with two eyes)
    const RobotFace = ({ eyesClass = '', eyeStyle = {} }: { eyesClass?: string; eyeStyle?: React.CSSProperties }) => (
        <>
            <rect x="0" y="0" width="24" height="24" rx="4" fill="#000000" />
            <rect className={`eye left ${eyesClass}`} style={eyeStyle} x="5" y="8" width="5" height="5" rx="1.5" fill="currentColor" />
            <rect className={`eye right ${eyesClass}`} style={eyeStyle} x="14" y="8" width="5" height="5" rx="1.5" fill="currentColor" />
        </>
    );

    // Combined BaseRobot for simple cases
    const BaseRobot = ({ eyesClass = '', eyeStyle = {}, style = {} }: { eyesClass?: string; eyeStyle?: React.CSSProperties; style?: React.CSSProperties }) => (
        <RobotBody style={style}>
            <RobotFace eyesClass={eyesClass} eyeStyle={eyeStyle} />
        </RobotBody>
    );

    // --- Variant Renderers ---

    // V14: Observer (Searching/Active)
    if (variant === 'observer') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <RobotBody>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#000000" />
                    <g style={{ animation: 'robot-look-around 4s infinite step-end' }}>
                        <rect className="eye" x="5" y="8" width="5" height="5" rx="1.5" fill="currentColor" />
                        <rect className="eye" x="14" y="8" width="5" height="5" rx="1.5" fill="currentColor" />
                    </g>
                </RobotBody>
            </div>
        );
    }

    // V15: Jumper (Action)
    if (variant === 'jumper') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <BaseRobot style={{ animation: 'robot-jump-body 1.2s infinite cubic-bezier(0.28, 0.84, 0.42, 1)' }} />
            </div>
        );
    }

    // V16: Snoozer (Idle/Sleep) -> More Zzzs
    if (variant === 'snoozer') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-1 right-2 flex flex-col text-[12px] font-bold text-brutal-black opacity-60 leading-none z-20">
                    <span style={{ animation: 'robot-float-z 3s infinite linear', animationDelay: '0s' }}>Z</span>
                    <span style={{ animation: 'robot-float-z 3s infinite linear', animationDelay: '1s' }}>z</span>
                    <span style={{ animation: 'robot-float-z 3s infinite linear', animationDelay: '2s' }}>.</span>
                </div>
                <BaseRobot
                    style={{ animation: 'robot-breathe-body 4s infinite ease-in-out' }}
                    eyeStyle={{ animation: 'robot-breathe-eyes 4s infinite ease-in-out', transformOrigin: 'center' }}
                />
            </div>
        );
    }

    // V17: Peeker (Active/HideAndSeek)
    if (variant === 'peeker') {
        return (
            <div className={`relative w-full h-full overflow-hidden ${className}`}>
                <BaseRobot style={{ animation: 'robot-peek-up 3s infinite ease-in-out' }} />
            </div>
        );
    }

    // V18: Shaker (Error/Panic)
    if (variant === 'shaker') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-2 left-1 w-1.5 h-2 bg-brutal-black rounded-full opacity-0" style={{ animation: 'robot-sweat-drop 0.8s infinite' }} />
                <div className="absolute top-3 left-0 w-1 h-1.5 bg-brutal-black rounded-full opacity-0" style={{ animation: 'robot-sweat-drop 0.7s infinite 0.2s' }} />
                <div className="absolute top-2 right-1 w-1.5 h-2 bg-brutal-black rounded-full opacity-0" style={{ animation: 'robot-sweat-drop 0.8s infinite 0.4s' }} />
                <div className="absolute top-3 right-0 w-1 h-1.5 bg-brutal-black rounded-full opacity-0" style={{ animation: 'robot-sweat-drop 0.7s infinite 0.1s' }} />
                <BaseRobot
                    style={{ animation: 'robot-shake-hard 0.2s infinite' }}
                    eyeStyle={{ animation: 'robot-dilate 2s infinite alternate', transformOrigin: 'center' }}
                />
            </div>
        );
    }

    // V19: Skeptic (Thinking/Pondering)
    if (variant === 'skeptic') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-1 right-2 text-lg font-bold text-brutal-black z-20" style={{ animation: 'robot-float-q 3s infinite ease-in-out' }}>?</div>
                <RobotBody style={{ animation: 'robot-ponder-tilt 3s infinite ease-in-out', transformOrigin: 'bottom center' }}>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#000000" />
                    <rect className="eye" x="5" y="8" width="5" height="5" rx="1.5" fill="currentColor" style={{ transformOrigin: 'center', animation: 'robot-squint 3s infinite ease-in-out' }} />
                    <rect className="eye" x="14" y="8" width="5" height="5" rx="1.5" fill="currentColor" style={{ animation: 'robot-raise-brow 3s infinite ease-in-out' }} />
                </RobotBody>
            </div>
        );
    }

    // V20: Love (Heart Eyes)
    if (variant === 'love') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-2 left-2 text-[11px] text-brutal-black z-20" style={{ animation: 'robot-float-up 2s infinite linear' }}>♥</div>
                <div className="absolute top-1 left-4 text-[9px] text-brutal-black z-20" style={{ animation: 'robot-float-up 2s infinite linear 0.5s' }}>♥</div>
                <div className="absolute top-3 right-1 text-[11px] text-brutal-black z-20" style={{ animation: 'robot-float-up 2s infinite linear 1s' }}>♥</div>
                <div className="absolute top-0 right-3 text-[9px] text-brutal-black z-20" style={{ animation: 'robot-float-up 2s infinite linear 1.5s' }}>♥</div>
                <RobotBody style={{ animation: 'robot-heartbeat 1s infinite' }}>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#000000" />
                    <text x="5.5" y="12" fontSize="5" fill="currentColor" style={{ animation: 'robot-pulse-eye 1s infinite alternate', transformOrigin: 'center' }}>♥</text>
                    <text x="14.5" y="12" fontSize="5" fill="currentColor" style={{ animation: 'robot-pulse-eye 1s infinite alternate', transformOrigin: 'center' }}>♥</text>
                </RobotBody>
            </div>
        );
    }

    // V21: Rage (Angry/Error)
    if (variant === 'rage') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-neutral-600 rounded-full opacity-0" style={{ animation: 'robot-steam-rise 0.5s infinite linear' }} />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-neutral-600 rounded-full opacity-0" style={{ animation: 'robot-steam-rise 0.5s infinite linear 0.2s' }} />
                <RobotBody style={{ animation: 'robot-vibrate 0.1s infinite' }}>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#000000" />
                    <rect className="eye left" x="5" y="8" width="5" height="5" rx="1.5" fill="currentColor" />
                    <rect className="eye right" x="14" y="8" width="5" height="5" rx="1.5" fill="currentColor" />
                    <rect x="7" y="9" width="5" height="2" fill="#000000" transform="rotate(20, 7.5, 8)" />
                    <rect x="12" y="9" width="5" height="2" fill="#000000" transform="rotate(-20, 16.5, 8)" />
                </RobotBody>
            </div>
        );
    }

    // V22: Party/Cool (Visor look)
    if (variant === 'party') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <RobotBody style={{ animation: 'robot-bounce-beat 0.5s infinite' }}>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#000000" />
                    <rect x="4" y="8" width="16" height="6" rx="1" fill="currentColor" />
                    <rect x="5" y="9" width="14" height="1" fill="#FFFFFF" opacity="0.5" />
                </RobotBody>
            </div>
        );
    }

    // V23: Eater (Munching/Action)
    if (variant === 'eater') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[10px] font-bold text-brutal-black opacity-0" style={{ animation: 'robot-feed 1.5s infinite linear' }}>0000 0100 0001 0110</div>
                <RobotBody style={{ animation: 'robot-chomp 0.4s infinite alternate', transformOrigin: 'center' }}>
                    <RobotFace />
                </RobotBody>
            </div>
        );
    }

    // V24: DJ (With Headphones)
    if (variant === 'dj') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="w-full h-full" style={{ animation: 'robot-head-bop 0.5s infinite alternate ease-in-out' }}>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="relative" style={{ width: '95%', height: '85%' }}>
                            <div className="absolute -top-[5%] left-1/2 -translate-x-1/2 w-[100%] h-[40%] border-[4px] border-b-0 border-neutral-800 rounded-t-full" />
                            <div className="absolute top-[20%] -left-[8%] w-[20%] h-[45%] bg-neutral-800 rounded-lg" />
                            <div className="absolute top-[20%] -right-[8%] w-[20%] h-[45%] bg-neutral-800 rounded-lg" />
                        </div>
                    </div>
                    <BaseRobot />
                </div>
            </div>
        );
    }

    // V25: Ghost (404)
    if (variant === 'ghost') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-3 right-3 text-[10px] font-bold text-neutral-400" style={{ animation: 'robot-boo-fade 2s infinite' }}>404</div>
                <div className="w-full h-full flex items-center justify-center" style={{ animation: 'robot-float-ghost 3s infinite ease-in-out' }}>
                    <svg className="w-full h-full" viewBox="0 0 24 24" overflow="visible" style={{ transform: `scale(${ROBOT_SCALE})` }}>
                        <path d="M2,25 L0,23 L0,13 A12,12 0 0,1 24,13 L24,23 L22,25 L18,21 L14,25 L12,23 L10,25 L6,21 L2,25 Z" fill="#000000" />
                        <rect className="eye" x="5" y="10" width="5" height="5" rx="1.5" fill="currentColor" />
                        <rect className="eye" x="14" y="10" width="5" height="5" rx="1.5" fill="currentColor" />
                    </svg>
                </div>
            </div>
        );
    }

    // V26: Workout (Training)
    if (variant === 'workout') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[75%] h-2 z-20 flex items-center justify-center" style={{ animation: 'robot-lift 1.5s infinite' }}>
                    <div className="w-full h-[2px] bg-black rounded-full" />
                    <div className="absolute left-0 w-[3px] h-[8px] bg-black rounded-sm" />
                    <div className="absolute right-0 w-[3px] h-[8px] bg-black rounded-sm" />
                </div>
                <div className="absolute top-2 -right-1 w-1 h-1 bg-black rounded-full opacity-0" style={{ animation: 'robot-sweat-fall 1.5s infinite 0.5s' }} />
                <RobotBody style={{ animation: 'robot-squat 1.5s infinite' }}>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#000000" />
                    <rect x="5" y="10" width="5" height="2" fill="currentColor" />
                    <rect x="14" y="10" width="5" height="2" fill="currentColor" />
                </RobotBody>
            </div>
        );
    }

    // V27: Portal (Teleport)
    if (variant === 'portal') {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute top-[8%] left-1/2 w-[70%] h-[15%] bg-black rounded-[50%]" style={{ animation: 'robot-hole-top 2s infinite ease-in-out' }} />
                <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'robot-teleport 2s infinite ease-in-out', zIndex: 10 }}>
                    <div className="w-[50%] h-[50%]">
                        <BaseRobot />
                    </div>
                </div>
                <div className="absolute bottom-[8%] left-1/2 w-[70%] h-[15%] bg-black rounded-[50%]" style={{ animation: 'robot-hole-bottom 2s infinite ease-in-out' }} />
            </div>
        );
    }

    // V28: Scanner (OCR/Analyzer)
    if (variant === 'scanner') {
        return (
            <div className={`relative w-full h-full ${className}`} style={{ perspective: '100px' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent z-20 pointer-events-none"
                    style={{ animation: 'robot-scan-pass 2s infinite linear' }} />
                <BaseRobot style={{ transform: 'rotateX(30deg)', transformOrigin: 'center' }} />
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
