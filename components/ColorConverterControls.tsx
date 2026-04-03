import React, { useEffect, useState } from 'react';
import { OklchColor, ColorFormat } from '../types';
import { 
    oklchToHex, 
    hexToOklch,
    oklchToRgb,
    oklchToHsl,
    oklchToHsb,
    oklchToHwb,
    oklchToCmyk,
    formatRgbString,
    formatHslString,
    formatHsbString,
    formatHwbString,
    formatCmykString,
    formatNcolString,
    parseRgbString,
    parseHslString,
    parseHsbString,
    parseHwbString,
    parseCmykString,
    parseNcolString,
    rgbToOklch,
    hslToOklch,
    hsbToOklch,
    hwbToOklch,
    cmykToOklch,
} from '../services/colorService';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color: string;
  unit?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, color, unit = '' }) => (
  <div className="w-full">
    <label className="flex justify-between items-center text-sm text-gray-500 mb-1">
      <span>{label}</span>
      <span>{value.toFixed(label === 'Hue' ? 0 : 3)}{unit}</span>
    </label>
    <div className="relative flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{ background: color }}
      />
    </div>
  </div>
);

interface ColorConverterControlsProps {
  color: OklchColor;
  setColor: (color: OklchColor) => void;
}

const ColorConverterControls: React.FC<ColorConverterControlsProps> = ({ color, setColor }) => {
  const [colorFormat, setColorFormat] = useState<ColorFormat>(ColorFormat.Hex);
  const [colorInput, setColorInput] = useState('');
  const [isColorInvalid, setIsColorInvalid] = useState(false);

  const formatColor = (c: OklchColor, format: ColorFormat): string => {
    switch (format) {
      case ColorFormat.Rgb: return formatRgbString(oklchToRgb(c));
      case ColorFormat.Hsl: return formatHslString(oklchToHsl(c));
      case ColorFormat.Hsb: return formatHsbString(oklchToHsb(c));
      case ColorFormat.Hwb: return formatHwbString(oklchToHwb(c));
      case ColorFormat.Cmyk: return formatCmykString(oklchToCmyk(c));
      case ColorFormat.Ncol: return formatNcolString(oklchToHwb(c));
      default: return oklchToHex(c);
    }
  };

  useEffect(() => {
    setColorInput(formatColor(color, colorFormat));
    setIsColorInvalid(false);
  }, [color, colorFormat]);

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorInput(e.target.value);
    setIsColorInvalid(false);
  };

  const commitColorInput = () => {
    let newColor: OklchColor | null = null;
    const trimmedInput = colorInput.trim();

    switch (colorFormat) {
      case ColorFormat.Rgb: newColor = parseRgbString(trimmedInput) ? rgbToOklch(parseRgbString(trimmedInput)!) : null; break;
      case ColorFormat.Hsl: newColor = parseHslString(trimmedInput) ? hslToOklch(parseHslString(trimmedInput)!) : null; break;
      case ColorFormat.Hsb: newColor = parseHsbString(trimmedInput) ? hsbToOklch(parseHsbString(trimmedInput)!) : null; break;
      case ColorFormat.Hwb: newColor = parseHwbString(trimmedInput) ? hwbToOklch(parseHwbString(trimmedInput)!) : null; break;
      case ColorFormat.Cmyk: newColor = parseCmykString(trimmedInput) ? cmykToOklch(parseCmykString(trimmedInput)!) : null; break;
      case ColorFormat.Ncol: newColor = parseNcolString(trimmedInput) ? hwbToOklch(parseNcolString(trimmedInput)!) : null; break;
      default: newColor = hexToOklch(trimmedInput); break;
    }

    if (newColor) {
      setColor(newColor);
      setIsColorInvalid(false);
    } else {
      setIsColorInvalid(true);
    }
  };
  
  const handleColorInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitColorInput();
      (e.target as HTMLInputElement).blur();
    }
  };

  const hex = oklchToHex(color);
  const lightnessGradient = `linear-gradient(to right, ${oklchToHex({l: 0, c: color.c, h: color.h})}, ${oklchToHex({l: 1, c: color.c, h: color.h})})`;
  const chromaGradient = `linear-gradient(to right, ${oklchToHex({l: color.l, c: 0, h: color.h})}, ${oklchToHex({l: color.l, c: 0.4, h: color.h})})`;
  const hueGradient = `linear-gradient(to right, oklch(${color.l*100}% ${color.c} 0), oklch(${color.l*100}% ${color.c} 60), oklch(${color.l*100}% ${color.c} 120), oklch(${color.l*100}% ${color.c} 180), oklch(${color.l*100}% ${color.c} 240), oklch(${color.l*100}% ${color.c} 300), oklch(${color.l*100}% ${color.c} 360))`;

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col gap-6 h-full">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="color-input-converter" className="text-sm font-medium text-gray-600">Color Value</label>
          <div role="radiogroup" className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
            {Object.values(ColorFormat).map((format) => (
              <label key={format} className={`relative cursor-pointer px-2 py-0.5 text-xs font-semibold rounded-md transition-colors duration-200 ${colorFormat === format ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`} aria-checked={colorFormat === format}>
                <input type="radio" name="color-format-converter" value={format} checked={colorFormat === format} onChange={() => setColorFormat(format)} className="sr-only" aria-label={`Color format: ${format}`} />
                {format}
              </label>
            ))}
          </div>
        </div>
        <div className="relative">
          <input id="color-input-converter" type="text" value={colorInput} onChange={handleColorInputChange} onBlur={commitColorInput} onKeyDown={handleColorInputKeyDown} className={`w-full bg-gray-100 border-2 rounded-lg pl-4 pr-3 py-2 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${isColorInvalid ? 'border-red-500' : 'border-gray-200 focus:border-indigo-500'}`} aria-invalid={isColorInvalid}/>
        </div>
      </div>
      
      <div 
        className="w-full flex-1 min-h-[12rem] rounded-xl shadow-inner"
        style={{ backgroundColor: hex }} 
      />
        
      <div className="space-y-4">
        <Slider label="Lightness" value={color.l} min={0} max={1} step={0.001} onChange={e => setColor({...color, l: +e.target.value})} color={lightnessGradient}/>
        <Slider label="Chroma" value={color.c} min={0} max={0.4} step={0.001} onChange={e => setColor({...color, c: +e.target.value})} color={chromaGradient}/>
        <Slider label="Hue" value={color.h} min={0} max={360} step={1} onChange={e => setColor({...color, h: +e.target.value})} color={hueGradient} unit="°"/>
      </div>
    </div>
  );
};

export default ColorConverterControls;