

import React, { useState, useRef, useMemo } from 'react';
import { OklchColor } from '../types';
import { oklchToHex, calculateContrastRatio, oklchToRgb, generateShades } from '../services/colorService';

interface ActionButtonProps {
    icon: string;
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    cursor?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, cursor = 'cursor-pointer' }) => (
    <button
        onClick={onClick}
        className={`relative group/button w-10 h-10 flex items-center justify-center rounded-lg bg-black/10 hover:bg-black/20 text-white transition-colors ${cursor}`}
        aria-label={label}
    >
        <i className={`ri-${icon}-line text-xl`}></i>
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-sm opacity-0 group-hover/button:opacity-100 transition-opacity pointer-events-none z-10">
            {label}
        </span>
    </button>
);

const ContrastInfo: React.FC<{ color: OklchColor, onClose: () => void }> = ({ color, onClose }) => {
    const whiteContrast = useMemo(() => {
        const whiteRgb = { r: 1, g: 1, b: 1 };
        const colorRgb = oklchToRgb(color);
        return calculateContrastRatio(colorRgb, whiteRgb);
    }, [color]);

    const blackContrast = useMemo(() => {
        const blackRgb = { r: 0, g: 0, b: 0 };
        const colorRgb = oklchToRgb(color);
        return calculateContrastRatio(colorRgb, blackRgb);
    }, [color]);
    
    const ComplianceRow: React.FC<{label: string, pass: boolean}> = ({label, pass}) => (
        <div className="flex items-center justify-between text-xs">
            <span className={pass ? 'font-medium' : 'opacity-70'}>{label}</span>
            <div className={`flex items-center gap-1 font-semibold ${pass ? '' : 'opacity-70'}`}>
                <span>{pass ? 'Pass' : 'Fail'}</span>
                <i className={`ri-${pass ? 'check' : 'close'}-line text-base`}></i>
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-full flex flex-col items-stretch justify-around p-4">
             <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors z-10"
                aria-label="Close contrast view"
            >
                <i className="ri-close-line text-xl"></i>
            </button>
            
            <div className="text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-bold">Aa</span>
                    <span className="text-3xl font-mono font-bold">{whiteContrast.toFixed(2)}</span>
                </div>
                <div className="mt-2 space-y-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1">WCAG AA</h4>
                    <ComplianceRow label="UI & Large Text" pass={whiteContrast >= 3} />
                    <ComplianceRow label="Normal Text" pass={whiteContrast >= 4.5} />
                    <h4 className="text-xs font-bold uppercase tracking-wider mt-2 mb-1">WCAG AAA</h4>
                    <ComplianceRow label="Large Text" pass={whiteContrast >= 4.5} />
                    <ComplianceRow label="Normal Text" pass={whiteContrast >= 7} />
                </div>
            </div>

            <hr className="border-t border-white/20 my-1" />

            <div className="text-black" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
                 <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-bold">Aa</span>
                    <span className="text-3xl font-mono font-bold">{blackContrast.toFixed(2)}</span>
                </div>
                <div className="mt-2 space-y-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1">WCAG AA</h4>
                    <ComplianceRow label="UI & Large Text" pass={blackContrast >= 3} />
                    <ComplianceRow label="Normal Text" pass={blackContrast >= 4.5} />
                    <h4 className="text-xs font-bold uppercase tracking-wider mt-2 mb-1">WCAG AAA</h4>
                    <ComplianceRow label="Large Text" pass={blackContrast >= 4.5} />
                    <ComplianceRow label="Normal Text" pass={blackContrast >= 7} />
                </div>
            </div>
        </div>
    );
};

const ShadesSelectorView: React.FC<{
    baseColor: OklchColor;
    type: 'tints' | 'shades' | 'tones';
    onSelect: (color: OklchColor) => void;
    onClose: () => void;
}> = ({ baseColor, type, onSelect, onClose }) => {
    const { tints, shades, tones } = useMemo(() => generateShades(baseColor, 8), [baseColor]);

    const displayColors = useMemo(() => {
        let colors;
        switch (type) {
            case 'tints':
                colors = tints;
                break;
            case 'shades':
                colors = shades;
                break;
            case 'tones':
                colors = tones;
                break;
        }
        const all = [baseColor, ...colors];
        if (type === 'tones') {
            all.sort((a, b) => b.c - a.c); // most chroma first
        } else {
            all.sort((a, b) => b.l - a.l); // lightest first
        }
        return all;
    }, [baseColor, type, tints, shades, tones]);

    return (
        <div className="relative h-full w-full flex flex-col justify-end items-center" style={{ backgroundColor: oklchToHex(baseColor) }}>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-stretch justify-center p-2 gap-1 z-20">
                {displayColors.map((color, idx) => {
                    const isBase = color.l === baseColor.l && color.c === baseColor.c && color.h === baseColor.h;
                    return (
                        <button
                            key={idx}
                            className="relative w-full flex-1 rounded-md flex items-center justify-center transition-transform hover:scale-105"
                            style={{ backgroundColor: oklchToHex(color) }}
                            onClick={() => onSelect(color)}
                            aria-label={`Select shade ${oklchToHex(color)}`}
                        >
                            {isBase && <div className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-black/50 shadow-lg"></div>}
                        </button>
                    );
                })}
            </div>
            <button 
                onClick={onClose} 
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors z-30"
                aria-label="Close shades view"
            >
                <i className="ri-close-line text-xl"></i>
            </button>
        </div>
    );
};


interface ColorStripProps {
    color: OklchColor;
    isLocked: boolean;
    isCheckingContrast: boolean;
    onToggleLock: () => void;
    onRemove: () => void;
    onCopy: (hex: string) => void;
    onGenerateTints: () => void;
    onGenerateShades: () => void;
    onGenerateTones: () => void;
    onCheckContrast: () => void;
    onCloseContrastCheck: () => void;
}

const ColorStrip: React.FC<ColorStripProps> = ({ 
    color, isLocked, isCheckingContrast, 
    onToggleLock, onRemove, onCopy, 
    onGenerateTints, onGenerateShades, onGenerateTones,
    onCheckContrast, onCloseContrastCheck 
}) => {
    const hex = oklchToHex(color);
    const textColor = color.l > 0.6 ? 'text-gray-900' : 'text-white';
    const [justCopied, setJustCopied] = useState(false);
    
    const handleCopy = (e: React.MouseEvent<HTMLButtonElement | HTMLParagraphElement>) => {
        e.stopPropagation();
        onCopy(hex);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 1500);
    };

    return (
        <div className="relative h-full w-full flex flex-col justify-end items-center p-4 group/strip" style={{ backgroundColor: hex }}>
           {isCheckingContrast ? (
                <ContrastInfo color={color} onClose={onCloseContrastCheck} />
            ) : (
                <>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 items-center opacity-0 group-hover/strip:opacity-100 transition-opacity duration-200`}>
                        <ActionButton icon="drag-move-2" label="Drag to reorder" onClick={(e) => e.preventDefault()} cursor="cursor-grab" />
                        <ActionButton icon={isLocked ? 'lock' : 'lock-unlock'} label={isLocked ? "Unlock" : "Lock"} onClick={onToggleLock} />
                        <ActionButton icon="sun" label="Generate Tints" onClick={onGenerateTints} />
                        <ActionButton icon="moon" label="Generate Shades" onClick={onGenerateShades} />
                        <ActionButton icon="contrast" label="Generate Tones" onClick={onGenerateTones} />
                        <ActionButton icon="contrast-2" label="Check Contrast" onClick={onCheckContrast} />
                        <ActionButton icon="file-copy" label="Copy Hex" onClick={handleCopy} />
                        <ActionButton icon="close" label="Remove Color" onClick={onRemove} />
                    </div>
                    <p
                        className={`font-mono font-semibold text-lg tracking-wider cursor-pointer hover:underline ${textColor}`}
                        onClick={handleCopy}
                    >
                        {justCopied ? 'Copied!' : hex.toUpperCase()}
                    </p>
                </>
            )}
        </div>
    );
};

interface PaletteEditorProps {
    palette: OklchColor[];
    setPalette: (update: OklchColor[] | ((prev: OklchColor[]) => OklchColor[])) => void;
    lockedColors: boolean[];
    setLockedColors: (update: boolean[] | ((prev: boolean[]) => boolean[])) => void;
    applySimulation: (color: OklchColor) => OklchColor;
}

const PaletteEditor: React.FC<PaletteEditorProps> = ({ palette, setPalette, lockedColors, setLockedColors, applySimulation }) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [contrastCheckIndex, setContrastCheckIndex] = useState<number | null>(null);
    const [shadesView, setShadesView] = useState<{ index: number; type: 'tints' | 'shades' | 'tones' } | null>(null);

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;

        const newPalette = [...palette];
        const item = newPalette.splice(dragItem.current, 1)[0];
        newPalette.splice(dragOverItem.current, 0, item);
        setPalette(newPalette);

        const newLocked = [...lockedColors];
        const lockedItem = newLocked.splice(dragItem.current, 1)[0];
        newLocked.splice(dragOverItem.current, 0, lockedItem);
        setLockedColors(newLocked);

        dragItem.current = null;
        dragOverItem.current = null;
    };

    const closeAllOverlays = () => {
        setContrastCheckIndex(null);
        setShadesView(null);
    };

    const openShadesView = (index: number, type: 'tints' | 'shades' | 'tones') => {
        closeAllOverlays();
        setShadesView({ index, type });
    };

    const openContrastView = (index: number) => {
        closeAllOverlays();
        setContrastCheckIndex(index);
    };
    
    const handleToggleLock = (index: number) => {
        const newLocked = [...lockedColors];
        newLocked[index] = !newLocked[index];
        setLockedColors(newLocked);
        closeAllOverlays();
    };

    const handleRemoveColor = (index: number) => {
        if (palette.length <= 2) return;
        setPalette(palette.filter((_, i) => i !== index));
        setLockedColors(lockedColors.filter((_, i) => i !== index));
        closeAllOverlays();
    };

    const handleAddColor = (index: number) => {
        if (palette.length >= 10) return;

        let newColor: OklchColor;
        const isAtEnd = index === 0 || index === palette.length;

        if (isAtEnd) {
            const referenceColor = index === 0 ? palette[0] : palette[palette.length - 1];
            const isLight = referenceColor.l > 0.5;
            const lightnessChange = 0.15;
            
            let newLightness;
            if (isLight) {
                // It's light, add a darker shade.
                newLightness = referenceColor.l - lightnessChange;
            } else {
                // It's dark, add a lighter shade.
                newLightness = referenceColor.l + lightnessChange;
            }

            newColor = { 
                ...referenceColor,
                l: Math.max(0, Math.min(1, newLightness)) 
            };

        } else {
            // Case: Between two colors. Average them.
            const color1 = palette[index - 1];
            const color2 = palette[index];
            
            // Averaging OKLCH. Hue needs careful averaging because it's circular.
            const h1 = color1.h;
            const h2 = color2.h;
            let avgH: number;
            const diff = Math.abs(h1 - h2);
            if (diff > 180) {
                // The shorter path is across the 0/360 degree line
                const hMax = Math.max(h1, h2);
                const hMin = Math.min(h1, h2);
                avgH = (hMin + 360 + hMax) / 2;
                if (avgH >= 360) {
                    avgH -= 360;
                }
            } else {
                // The shorter path is direct
                avgH = (h1 + h2) / 2;
            }

            newColor = {
                l: (color1.l + color2.l) / 2,
                c: (color1.c + color2.c) / 2,
                h: avgH,
            };
        }
        
        const newPalette = [...palette];
        newPalette.splice(index, 0, newColor);
        setPalette(newPalette);

        const newLocked = [...lockedColors];
        newLocked.splice(index, 0, false);
        setLockedColors(newLocked);
        closeAllOverlays();
    };
    
    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
    };

    const handleSelectShade = (newColor: OklchColor) => {
        if (shadesView) {
            const newPalette = [...palette];
            newPalette[shadesView.index] = newColor;
            setPalette(newPalette);
            setShadesView(null);
        }
    };

    return (
        <main className="flex w-full flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200/80">
            {palette.map((color, index) => (
                <div 
                    key={`${color.h}-${color.l}-${color.c}-${index}`}
                    className="relative flex-grow flex group/paletteitem"
                    draggable={contrastCheckIndex === null && shadesView === null}
                    onDragStart={() => dragItem.current = index}
                    onDragEnter={() => dragOverItem.current = index}
                    onDragEnd={handleSort}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {shadesView === null && (
                        <button
                            onClick={() => handleAddColor(index)}
                            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-md opacity-0 group-hover/paletteitem:opacity-100 hover:bg-gray-100 hover:scale-110 transition-all duration-200"
                            aria-label="Add color before this one"
                        >
                            <i className="ri-add-line text-gray-600"></i>
                        </button>
                    )}

                    {shadesView?.index === index ? (
                         <ShadesSelectorView 
                            baseColor={color}
                            type={shadesView.type}
                            onSelect={handleSelectShade}
                            onClose={() => setShadesView(null)}
                        />
                    ) : (
                        <ColorStrip
                            color={applySimulation(color)}
                            isLocked={lockedColors[index]}
                            isCheckingContrast={contrastCheckIndex === index}
                            onToggleLock={() => handleToggleLock(index)}
                            onRemove={() => handleRemoveColor(index)}
                            onCopy={handleCopy}
                            onGenerateTints={() => openShadesView(index, 'tints')}
                            onGenerateShades={() => openShadesView(index, 'shades')}
                            onGenerateTones={() => openShadesView(index, 'tones')}
                            onCheckContrast={() => openContrastView(index)}
                            onCloseContrastCheck={closeAllOverlays}
                        />
                    )}
                     
                     {index === palette.length - 1 && shadesView === null && (
                        <button
                            onClick={() => handleAddColor(index + 1)}
                            className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-md opacity-0 group-hover/paletteitem:opacity-100 hover:bg-gray-100 hover:scale-110 transition-all duration-200"
                            aria-label="Add color after this one"
                        >
                            <i className="ri-add-line text-gray-600"></i>
                        </button>
                    )}
                </div>
            ))}
        </main>
    );
};

export default PaletteEditor;
