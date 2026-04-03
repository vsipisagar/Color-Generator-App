
import React, { useRef, useEffect } from 'react';
import { OklchColor } from '../types';
import { oklchToHex } from '../services/colorService';

interface ColorWheelProps {
    baseColor: OklchColor;
    palette: OklchColor[];
    onHueChange?: (hue: number) => void;
    onHueChangeEnd?: () => void;
    className?: string;
}

const ColorWheel: React.FC<ColorWheelProps> = ({ baseColor, palette, onHueChange, onHueChangeEnd, className }) => {
    const wheelRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    useEffect(() => {
        const wheel = wheelRef.current;
        if (!wheel || !onHueChange) return;

        const handleInteraction = (e: MouseEvent | TouchEvent) => {
            const rect = wheel.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const x = clientX - centerX;
            const y = clientY - centerY;

            let angle = Math.atan2(y, x) * (180 / Math.PI);
            if (angle < 0) angle += 360;

            onHueChange(angle);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                e.preventDefault();
                handleInteraction(e);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging.current) {
                e.preventDefault();
                handleInteraction(e);
            }
        };

        const stopDragging = () => {
            if (isDragging.current) {
                onHueChangeEnd?.();
            }
            isDragging.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', stopDragging);
        };

        const startDragging = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            isDragging.current = true;
            handleInteraction(e);

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', stopDragging);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', stopDragging);
        };

        wheel.addEventListener('mousedown', startDragging);
        wheel.addEventListener('touchstart', startDragging, { passive: false });

        return () => {
            wheel.removeEventListener('mousedown', startDragging);
            wheel.removeEventListener('touchstart', startDragging);

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', stopDragging);
        };
    }, [onHueChange, onHueChangeEnd]);

    return (
        <div className={`relative aspect-square ${className || ''}`} style={{touchAction: onHueChange ? 'none' : 'auto'}}>
            <div
                ref={wheelRef}
                className="w-full h-full rounded-full shadow-lg"
                style={{
                    background: `conic-gradient(from 90deg, 
                        oklch(${baseColor.l*100}% ${baseColor.c} 0), 
                        oklch(${baseColor.l*100}% ${baseColor.c} 60), 
                        oklch(${baseColor.l*100}% ${baseColor.c} 120), 
                        oklch(${baseColor.l*100}% ${baseColor.c} 180), 
                        oklch(${baseColor.l*100}% ${baseColor.c} 240), 
                        oklch(${baseColor.l*100}% ${baseColor.c} 300), 
                        oklch(${baseColor.l*100}% ${baseColor.c} 360))`,
                    cursor: onHueChange ? 'pointer' : 'default'
                }}
            />
            {palette.map((color, index) => {
                const isBase = color.h === baseColor.h && color.l === baseColor.l && color.c === baseColor.c;
                const handleSize = isBase ? 'w-6 h-6' : 'w-5 h-5';
                const borderWidth = isBase ? 'border-4' : 'border-2';
                const zIndex = isBase ? 'z-10' : 'z-0';

                return (
                    <div 
                        key={`${color.h}-${color.l}-${color.c}-${index}`}
                        className={`absolute top-1/2 left-1/2 w-1/2 h-px pointer-events-none ${zIndex} bg-gray-500/30`}
                        style={{
                            transformOrigin: 'left center',
                            transform: `rotate(${color.h}deg)`,
                        }}
                    >
                        <div
                            className={`absolute right-0 top-1/2 rounded-full border-white shadow-md ${handleSize} ${borderWidth} -translate-x-1/2 -translate-y-1/2`}
                            style={{ 
                                backgroundColor: oklchToHex(color)
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default ColorWheel;
