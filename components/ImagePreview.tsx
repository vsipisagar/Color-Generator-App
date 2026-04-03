import React, { useRef, useEffect, useState, useCallback } from 'react';
import { OklchColor, SamplePoint } from '../types';
import { oklchToHex } from '../services/colorService';

interface ImagePreviewProps {
    src: string;
    palette: OklchColor[];
    points: SamplePoint[];
    onPointUpdate: (index: number, point: SamplePoint) => void;
    onPointDragStart: () => void;
    onPointDragEnd: () => void;
    activePointIndex: number | null;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, palette, points, onPointUpdate, onPointDragStart, onPointDragEnd, activePointIndex }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [imageRenderInfo, setImageRenderInfo] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const calculateRenderInfo = useCallback(() => {
        const container = containerRef.current;
        const image = imageRef.current;
        if (!container || !image || !image.complete || image.naturalWidth === 0) {
            return;
        }

        const cWidth = container.offsetWidth;
        const cHeight = container.offsetHeight;
        const cRatio = cWidth / cHeight;
        const iRatio = image.naturalWidth / image.naturalHeight;

        let width, height, x, y;

        if (cRatio > iRatio) { // Image is constrained by height (letterboxed)
            height = cHeight;
            width = height * iRatio;
            x = (cWidth - width) / 2;
            y = 0;
        } else { // Image is constrained by width (pillarboxed)
            width = cWidth;
            height = width / iRatio;
            x = 0;
            y = (cHeight - height) / 2;
        }
        
        if (imageRenderInfo.x !== x || imageRenderInfo.y !== y || imageRenderInfo.width !== width || imageRenderInfo.height !== height) {
            setImageRenderInfo({ x, y, width, height });
        }
    }, [imageRenderInfo]);

    useEffect(() => {
        const image = imageRef.current;
        
        const handleLoad = () => calculateRenderInfo();

        if (image) {
            image.addEventListener('load', handleLoad);
            if (image.complete) {
                handleLoad();
            }
        }
        
        const resizeObserver = new ResizeObserver(calculateRenderInfo);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        
        return () => {
            if (image) {
                image.removeEventListener('load', handleLoad);
            }
            resizeObserver.disconnect();
        };
    }, [src, calculateRenderInfo]);

    const handleInteraction = useCallback((e: MouseEvent | TouchEvent, indexToUpdate: number) => {
        if (!containerRef.current || imageRenderInfo.width === 0 || imageRenderInfo.height === 0) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const containerX = clientX - rect.left;
        const containerY = clientY - rect.top;

        let imageX = (containerX - imageRenderInfo.x) / imageRenderInfo.width;
        let imageY = (containerY - imageRenderInfo.y) / imageRenderInfo.height;

        imageX = Math.max(0, Math.min(1, imageX));
        imageY = Math.max(0, Math.min(1, imageY));

        onPointUpdate(indexToUpdate, { x: imageX, y: imageY });
    }, [onPointUpdate, imageRenderInfo]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingIndex !== null) {
                handleInteraction(e, draggingIndex);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (draggingIndex !== null) {
                e.preventDefault();
                handleInteraction(e, draggingIndex);
            }
        };

        const stopDragging = () => {
            if (draggingIndex !== null) {
                onPointDragEnd();
                setDraggingIndex(null);
            }
        };

        if (draggingIndex !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', stopDragging);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', stopDragging);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', stopDragging);
        };
    }, [draggingIndex, handleInteraction, onPointDragEnd]);

    const startDragging = (e: React.MouseEvent | React.TouchEvent, index: number) => {
        e.preventDefault();
        onPointDragStart();
        setDraggingIndex(index);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-full max-h-full aspect-[4/3] select-none touch-none bg-gray-200 rounded-xl overflow-hidden shadow-lg">
            <img ref={imageRef} src={src} className="w-full h-full object-contain" alt="Color source" draggable="false" />
            {points.map((point, index) => {
                const color = palette[index];
                if (!color) return null; // Avoid errors if palette and points are out of sync

                const hex = oklchToHex(color);
                const isActive = index === activePointIndex || index === draggingIndex;
                
                const leftPx = imageRenderInfo.x + point.x * imageRenderInfo.width;
                const topPx = imageRenderInfo.y + point.y * imageRenderInfo.height;

                return (
                    <div
                        key={index}
                        className="absolute cursor-grab active:cursor-grabbing transition-all duration-150"
                        style={{
                            left: `${leftPx}px`,
                            top: `${topPx}px`,
                            transform: `translate(-50%, -50%) scale(${isActive ? 1.25 : 1})`,
                            willChange: 'left, top, transform'
                        }}
                        onMouseDown={(e) => startDragging(e, index)}
                        onTouchStart={(e) => startDragging(e, index)}
                    >
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-clip-content p-0.5 shadow-md" style={{ backgroundColor: hex }}>
                            <div className="w-full h-full rounded-full border-2 border-black/30"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ImagePreview;