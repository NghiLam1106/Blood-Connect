import React from 'react';
import logoRedBridge from '../../assets/logo_RedBridge.png';

interface LogoProps {
    className?: string;
    autoHideTextOnMobile?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', autoHideTextOnMobile = false }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* The image should be placed in frontend/src/assets/logo_RedBridge.png */}
            <img
                src={logoRedBridge}
                alt="RedBridge AI Logo"
                className="w-11 h-11 object-contain shrink-0 drop-shadow-sm"
                onError={(e) => {
                    // Fallback in case the image is not found
                    if (e.currentTarget.src !== '/logo.svg') {
                        e.currentTarget.src = '/logo.svg';
                    }
                }}
            />

            {/* Brand Text */}
            <div className={`flex flex-col justify-center ${autoHideTextOnMobile ? 'hidden sm:flex' : 'flex'}`}>
                <span className="text-2xl font-extrabold leading-none tracking-tight text-dark" style={{ letterSpacing: '-0.03em' }}>
                    RedBridge<span className="text-primary font-black">AI</span>.
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-[0.2em] mt-1 pl-0.5">
                    HealthTech Startup
                </span>
            </div>
        </div>
    );
};
