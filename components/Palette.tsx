import React, { useState } from 'react';
import { OklchColor } from '../types';
import { oklchToHex } from '../services/colorService';

interface ColorSwatchProps {
  color: OklchColor;
  onHover: (isHovering: boolean) => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, onHover }) => {
  const [copied, setCopied] = useState(false);
  const hex = oklchToHex(color);
  
  const textColor = color.l > 0.65 ? 'text-gray-900' : 'text-gray-50';

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="relative w-full aspect-square rounded-xl flex flex-col justify-end p-4 cursor-pointer transition-transform duration-200 hover:scale-105"
      style={{ backgroundColor: hex }}
      onClick={handleCopy}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
        <div className={`font-mono text-sm ${textColor}`}>
            <p className="font-bold text-lg">{hex.toUpperCase()}</p>
            <p>L: {color.l.toFixed(3)}</p>
            <p>C: {color.c.toFixed(3)}</p>
            <p>H: {color.h.toFixed(1)}°</p>
        </div>
        {copied && (
            <div className="absolute top-2 right-2 bg-gray-900/80 text-white text-xs font-bold px-2 py-1 rounded-full">
                Copied!
            </div>
        )}
    </div>
  );
};

interface PaletteProps {
  colors: OklchColor[];
  onSwatchHover?: (index: number | null) => void;
}

const Palette: React.FC<PaletteProps> = ({ colors, onSwatchHover }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
        {colors.map((color, index) => (
            <ColorSwatch 
              key={`${color.h}-${color.l}-${color.c}-${index}`} 
              color={color} 
              onHover={(isHovering) => onSwatchHover?.(isHovering ? index : null)}
            />
        ))}
    </div>
  );
};

export default Palette;