import React, { useEffect, useState } from 'react';
import { OklchColor, HarmonyRule, HarmonyRuleDef, ColorFormat, SavedPalette, HistoryState, PantoneSystem } from '../types';
import { HARMONY_RULES } from '../constants';
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

const ruleIcons: Record<HarmonyRule, React.FC<{ className?: string }>> = {
  [HarmonyRule.Analogous]: ({ className }) => (
    <svg viewBox="0 0 56 56" className={className}>
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <g className="text-indigo-500" fill="currentColor">
        <circle cx="45" cy="16" r="3.5" />
        <circle cx="49" cy="23.5" r="3.5" />
        <circle cx="50" cy="31.5" r="3.5" />
        <circle cx="48" cy="39" r="3.5" />
      </g>
    </svg>
  ),
  [HarmonyRule.Monochromatic]: ({ className }) => (
    <svg viewBox="0 0 56 56" className={className}>
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <g fill="currentColor">
        <circle cx="47" cy="18" r="3.5" />
        <circle cx="49.5" cy="25" r="3.5" />
        <circle cx="49.5" cy="32" r="3.5" />
        <circle cx="47" cy="39" r="3.5" />
      </g>
    </svg>
  ),
  [HarmonyRule.Complementary]: ({ className }) => (
    <svg viewBox="0 0 56 56" className={className}>
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <g fill="currentColor">
        <circle cx="50" cy="28" r="3.5" />
        <circle cx="6" cy="28" r="3.5" />
      </g>
    </svg>
  ),
  [HarmonyRule.SplitComplementary]: ({ className }) => (
    <svg viewBox="0 0 56 56" className={className}>
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <g fill="currentColor">
        <circle cx="50" cy="28" r="3.5" />
        <circle cx="15" cy="13" r="3.5" />
        <circle cx="15" cy="43" r="3.5" />
      </g>
    </svg>
  ),
  [HarmonyRule.Triadic]: ({ className }) => (
    <svg viewBox="0 0 56 56" className={className}>
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <g fill="currentColor">
        <circle cx="50" cy="28" r="3.5" />
        <circle cx="17" cy="47" r="3.5" />
        <circle cx="17" cy="9" r="3.5" />
      </g>
    </svg>
  ),
  [HarmonyRule.RectangularTetradic]: ({ className }) => (
    <svg viewBox="0 0 56 56" className={className}>
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <g fill="currentColor">
        <circle cx="50" cy="28" r="3.5" />
        <circle cx="28" cy="6" r="3.5" />
        <circle cx="6" cy="28" r="3.5" />
        <circle cx="28" cy="50" r="3.5" />
      </g>
    </svg>
  ),
  [HarmonyRule.Tetradic]: ({ className }) => (
    <svg viewBox="0 0 56 56" className={className}>
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <g fill="currentColor">
        <circle cx="43.5" cy="12.5" r="3.5" />
        <circle cx="43.5" cy="43.5" r="3.5" />
        <circle cx="12.5" cy="43.5" r="3.5" />
        <circle cx="12.5" cy="12.5" r="3.5" />
      </g>
    </svg>
  ),
  [HarmonyRule.Lightness]: ({ className }) => (
    <svg viewBox="0 0 56 56" className={className}>
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
      <g fill="currentColor">
        <circle cx="28" cy="28" r="2.5" opacity="0.5"/>
        <circle cx="34" cy="28" r="3" opacity="0.65"/>
        <circle cx="40" cy="28" r="3.5" opacity="0.8"/>
        <circle cx="46" cy="28" r="4" opacity="1"/>
      </g>
    </svg>
  ),
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInteractionEnd?: () => void;
  onReset?: () => void;
  color: string;
  unit?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, onInteractionEnd, onReset, color, unit = '' }) => (
  <div className="w-full">
    <label className="flex justify-between items-center text-sm text-gray-500 mb-1">
      <span>{label}</span>
      <span>{value.toFixed(step < 1 ? 2 : 0)}{unit}</span>
    </label>
    <div className="relative flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        onMouseUp={onInteractionEnd}
        onTouchEnd={onInteractionEnd}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, #e5e7eb 100%)`,
        }}
      />
      {onReset && (
        <button
          onClick={onReset}
          className="ml-2 h-7 w-7 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors duration-200 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Reset ${label}`}
        >
          <i className="ri-restart-line text-lg"></i>
        </button>
      )}
    </div>
  </div>
);

interface ControlsProps {
  baseColor: OklchColor;
  setBaseColor: (color: OklchColor | ((prev: OklchColor) => OklchColor)) => void;
  harmonyRule: HarmonyRule;
  setHarmonyRule: (rule: HarmonyRule) => void;
  harmonyDistance: number;
  setHarmonyDistance: (distance: number) => void;
  analogousAngle: number;
  setAnalogousAngle: (angle: number) => void;
  triadicAngle: number;
  setTriadicAngle: (angle: number) => void;
  splitComplementaryAngle: number;
  setSplitComplementaryAngle: (angle: number) => void;
  rectangularTetradicAngle: number;
  setRectangularTetradicAngle: (angle: number) => void;
  analogousColorCount: number;
  setAnalogousColorCount: (count: number) => void;
  monochromaticColorCount: number;
  setMonochromaticColorCount: (count: number) => void;
  lightnessColorCount: number;
  setLightnessColorCount: (count: number) => void;
  onLiveStateChange: (updater: (prevState: HistoryState) => HistoryState) => void;
  onInteractionEnd: () => void;
  simulatedPalette: OklchColor[];
  onEdit: () => void;
  onExport: () => void;
  onSave: () => void;
  onNavigateToPantone: () => void;
  onNavigateToVisualize: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
    baseColor, setBaseColor, harmonyRule, setHarmonyRule, 
    harmonyDistance, setHarmonyDistance, analogousAngle, setAnalogousAngle, 
    triadicAngle, setTriadicAngle, splitComplementaryAngle, setSplitComplementaryAngle, 
    rectangularTetradicAngle, setRectangularTetradicAngle,
    analogousColorCount, setAnalogousColorCount,
    monochromaticColorCount, setMonochromaticColorCount,
    lightnessColorCount, setLightnessColorCount,
    onLiveStateChange, onInteractionEnd,
    simulatedPalette,
    onEdit, onExport, onSave,
    onNavigateToPantone,
    onNavigateToVisualize,
}) => {
  const [colorFormat, setColorFormat] = useState<ColorFormat>(ColorFormat.Hex);
  const [colorInput, setColorInput] = useState('');
  const [isColorInvalid, setIsColorInvalid] = useState(false);

  const formatColor = (color: OklchColor, format: ColorFormat): string => {
    switch (format) {
      case ColorFormat.Rgb:
        return formatRgbString(oklchToRgb(color));
      case ColorFormat.Hsl:
        return formatHslString(oklchToHsl(color));
      case ColorFormat.Hsb:
        return formatHsbString(oklchToHsb(color));
      case ColorFormat.Hwb:
        return formatHwbString(oklchToHwb(color));
      case ColorFormat.Cmyk:
        return formatCmykString(oklchToCmyk(color));
      case ColorFormat.Ncol:
        return formatNcolString(oklchToHwb(color));
      case ColorFormat.Hex:
      default:
        return oklchToHex(color);
    }
  };
  
  useEffect(() => {
    setColorInput(formatColor(baseColor, colorFormat));
    setIsColorInvalid(false);
  }, [baseColor, colorFormat]);

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const l = parseFloat(e.target.value);
    onLiveStateChange(prev => ({ ...prev, baseColor: { ...prev.baseColor, l } }));
  };
  
  const handleChromaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = parseFloat(e.target.value);
    onLiveStateChange(prev => ({ ...prev, baseColor: { ...prev.baseColor, c } }));
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const harmonyDistance = parseFloat(e.target.value);
    onLiveStateChange(prev => ({ ...prev, harmonyDistance }));
  };

  const handleAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const analogousAngle = parseFloat(e.target.value);
    onLiveStateChange(prev => ({ ...prev, analogousAngle }));
  };

  const handleTriadicAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const triadicAngle = parseFloat(e.target.value);
    onLiveStateChange(prev => ({ ...prev, triadicAngle }));
  };

  const handleSplitComplementaryAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const splitComplementaryAngle = parseFloat(e.target.value);
    onLiveStateChange(prev => ({ ...prev, splitComplementaryAngle }));
  };

  const handleRectangularTetradicAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rectangularTetradicAngle = parseFloat(e.target.value);
    onLiveStateChange(prev => ({ ...prev, rectangularTetradicAngle }));
  };

  const handleAnalogousColorCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const analogousColorCount = parseInt(e.target.value, 10);
    onLiveStateChange(prev => ({ ...prev, analogousColorCount }));
  };

  const handleMonochromaticColorCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const monochromaticColorCount = parseInt(e.target.value, 10);
      onLiveStateChange(prev => ({ ...prev, monochromaticColorCount }));
  };
  
  const handleLightnessColorCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const lightnessColorCount = parseInt(e.target.value, 10);
      onLiveStateChange(prev => ({ ...prev, lightnessColorCount }));
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorInput(e.target.value);
    setIsColorInvalid(false);
  };

  const commitColorInput = () => {
    let newColor: OklchColor | null = null;
    const trimmedInput = colorInput.trim();

    switch (colorFormat) {
        case ColorFormat.Rgb: {
            const parsed = parseRgbString(trimmedInput);
            if (parsed) newColor = rgbToOklch(parsed);
            break;
        }
        case ColorFormat.Hsl: {
            const parsed = parseHslString(trimmedInput);
            if (parsed) newColor = hslToOklch(parsed);
            break;
        }
        case ColorFormat.Hsb: {
            const parsed = parseHsbString(trimmedInput);
            if (parsed) newColor = hsbToOklch(parsed);
            break;
        }
        case ColorFormat.Hwb: {
            const parsed = parseHwbString(trimmedInput);
            if (parsed) newColor = hwbToOklch(parsed);
            break;
        }
        case ColorFormat.Cmyk: {
            const parsed = parseCmykString(trimmedInput);
            if (parsed) newColor = cmykToOklch(parsed);
            break;
        }
        case ColorFormat.Ncol: {
            const parsed = parseNcolString(trimmedInput);
            if (parsed) newColor = hwbToOklch(parsed);
            break;
        }
        case ColorFormat.Hex:
        default: {
            newColor = hexToOklch(trimmedInput);
            break;
        }
    }

    if (newColor) {
      setBaseColor(newColor);
      setIsColorInvalid(false);
    } else {
      setIsColorInvalid(true);
    }
  };
  
  const handleColorInputBlur = () => {
    commitColorInput();
  };

  const handleColorInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitColorInput();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setColorInput(formatColor(baseColor, colorFormat));
      setIsColorInvalid(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  const showAnalogousControls = harmonyRule === HarmonyRule.Analogous;
  const showMonochromaticControls = harmonyRule === HarmonyRule.Monochromatic;
  const showLightnessControls = harmonyRule === HarmonyRule.Lightness;
  const showTriadicControls = harmonyRule === HarmonyRule.Triadic;
  const showSplitComplementaryControls = harmonyRule === HarmonyRule.SplitComplementary;
  const showRectangularTetradicControls = harmonyRule === HarmonyRule.RectangularTetradic;
  
  const maxAnalogousAngle = showAnalogousControls ? Math.floor(178 / (analogousColorCount - 1)) : 89;

  const handleAnalogousAngleReset = () => {
    let newAngle;
    switch (analogousColorCount) {
      case 9:
        newAngle = 22;
        break;
      case 7:
        newAngle = 29;
        break;
      case 5:
      case 3:
        newAngle = 30;
        break;
      default:
        newAngle = 30;
    }
    setAnalogousAngle(newAngle);
  };

  let contextualControlCount = 0;
  if (showAnalogousControls || showMonochromaticControls || showLightnessControls) {
    contextualControlCount = 2;
  } else if (showTriadicControls || showSplitComplementaryControls || showRectangularTetradicControls) {
    contextualControlCount = 1;
  }

  const showContextualContainer = contextualControlCount > 0;
  const containerHeightClass = contextualControlCount === 1 ? 'max-h-24' : 'max-h-48';
  
  const lightnessGradient = oklchToHex({ l: 0.5, c: baseColor.c, h: baseColor.h });
  const chromaGradient = oklchToHex({ l: baseColor.l, c: 0.2, h: baseColor.h });

  return (
    <aside className="p-6 bg-white rounded-2xl flex flex-col gap-6 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto border border-gray-200/80 shadow-sm">
      
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Generate from Color</h2>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
            <label htmlFor="color-input" className="text-sm text-gray-500">Color Value</label>
            <div role="radiogroup" className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                {Object.values(ColorFormat).map((format) => (
                    <label 
                        key={format} 
                        className={`relative cursor-pointer px-2 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                            colorFormat === format ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                        aria-checked={colorFormat === format}
                    >
                        <input
                            type="radio"
                            name="color-format"
                            value={format}
                            checked={colorFormat === format}
                            onChange={() => setColorFormat(format)}
                            className="sr-only"
                            aria-label={`Color format: ${format}`}
                        />
                        {format}
                    </label>
                ))}
            </div>
        </div>
        <div className="relative">
            <input 
              id="color-input"
              type="text"
              value={colorInput}
              onChange={handleColorInputChange}
              onBlur={handleColorInputBlur}
              onKeyDown={handleColorInputKeyDown}
              className={`w-full bg-gray-100 border-2 rounded-lg pl-4 pr-3 py-2 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${isColorInvalid ? 'border-red-500' : 'border-gray-200 focus:border-indigo-500'}`}
              aria-invalid={isColorInvalid}
            />
        </div>
      </div>
        
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="grid grid-cols-4 gap-2">
            {HARMONY_RULES.map((rule: HarmonyRuleDef) => {
                const Icon = ruleIcons[rule.id];
                const isActive = harmonyRule === rule.id;
                const iconClassName = `w-8 h-8 transition-colors duration-200 ${isActive ? 'text-indigo-500' : 'text-gray-300 group-hover:text-gray-400'}`;
                return (
                    <button
                        key={rule.id}
                        onClick={() => setHarmonyRule(rule.id)}
                        className={`group p-1 flex flex-col items-center justify-center aspect-square rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 ${
                            isActive
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        } border`}
                    >
                        <Icon className={iconClassName} />
                        <span className={`block text-xs font-medium mt-1 text-center leading-tight ${isActive ? 'text-indigo-700' : 'text-gray-600'}`}>
                            {rule.label}
                        </span>
                    </button>
                )
            })}
        </div>
        
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
                <Slider label="Lightness" value={baseColor.l} min={0} max={1} step={0.01} onChange={handleLightnessChange} onInteractionEnd={onInteractionEnd} onReset={() => setBaseColor(prev => ({...prev, l: 0.7}))} color={lightnessGradient}/>
                <Slider label="Chroma" value={baseColor.c} min={0} max={0.4} step={0.001} onChange={handleChromaChange} onInteractionEnd={onInteractionEnd} onReset={() => setBaseColor(prev => ({...prev, c: 0.15}))} color={chromaGradient}/>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showContextualContainer ? `${containerHeightClass} opacity-100` : 'max-h-0 opacity-0'}`}>
                 <div className="space-y-2">
                    {showAnalogousControls && (
                        <div className="flex flex-col gap-2">
                            <Slider 
                                label="Angle" 
                                value={analogousAngle} 
                                min={1} 
                                max={maxAnalogousAngle} 
                                step={1} 
                                onChange={handleAngleChange}
                                onInteractionEnd={onInteractionEnd}
                                onReset={handleAnalogousAngleReset}
                                color="#a5b4fc"
                                unit="°"
                            />
                            <Slider 
                                label="No. of Colors"
                                value={analogousColorCount}
                                min={3}
                                max={9}
                                step={2}
                                onChange={handleAnalogousColorCountChange}
                                onInteractionEnd={onInteractionEnd}
                                onReset={() => setAnalogousColorCount(3)}
                                color="#a5b4fc"
                            />
                        </div>
                    )}
                    {showTriadicControls && (
                        <Slider 
                            label="Angle" 
                            value={triadicAngle} 
                            min={90} 
                            max={120} 
                            step={1} 
                            onChange={handleTriadicAngleChange}
                            onInteractionEnd={onInteractionEnd}
                            onReset={() => setTriadicAngle(120)}
                            color="#a5b4fc"
                            unit="°"
                        />
                    )}
                    {showSplitComplementaryControls && (
                        <Slider 
                            label="Angle" 
                            value={splitComplementaryAngle} 
                            min={1} 
                            max={59} 
                            step={1} 
                            onChange={handleSplitComplementaryAngleChange}
                            onInteractionEnd={onInteractionEnd}
                            onReset={() => setSplitComplementaryAngle(30)}
                            color="#a5b4fc"
                            unit="°"
                        />
                    )}
                    {showRectangularTetradicControls && (
                        <Slider 
                            label="Angle" 
                            value={rectangularTetradicAngle} 
                            min={1} 
                            max={89} 
                            step={1} 
                            onChange={handleRectangularTetradicAngleChange}
                            onInteractionEnd={onInteractionEnd}
                            onReset={() => setRectangularTetradicAngle(60)}
                            color="#a5b4fc"
                            unit="°"
                        />
                    )}
                    {showMonochromaticControls && (
                        <div className="flex flex-col gap-2">
                            <Slider 
                                label="Distance" 
                                value={harmonyDistance} 
                                min={0.01} 
                                max={0.25} 
                                step={0.01} 
                                onChange={handleDistanceChange}
                                onInteractionEnd={onInteractionEnd}
                                onReset={() => setHarmonyDistance(0.1)}
                                color="#a5b4fc"
                            />
                            <Slider 
                                label="No. of Colors"
                                value={monochromaticColorCount}
                                min={3}
                                max={10}
                                step={1}
                                onChange={handleMonochromaticColorCountChange}
                                onInteractionEnd={onInteractionEnd}
                                onReset={() => setMonochromaticColorCount(5)}
                                color="#a5b4fc"
                            />
                        </div>
                    )}
                    {showLightnessControls && (
                         <div className="flex flex-col gap-2">
                            <Slider 
                                label="Distance" 
                                value={harmonyDistance} 
                                min={0.01} 
                                max={0.25} 
                                step={0.01} 
                                onChange={handleDistanceChange}
                                onInteractionEnd={onInteractionEnd}
                                onReset={() => setHarmonyDistance(0.1)}
                                color="#a5b4fc"
                            />
                            <Slider 
                                label="No. of Colors"
                                value={lightnessColorCount}
                                min={3}
                                max={10}
                                step={1}
                                onChange={handleLightnessColorCountChange}
                                onInteractionEnd={onInteractionEnd}
                                onReset={() => setLightnessColorCount(5)}
                                color="#a5b4fc"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {simulatedPalette.length > 0 && (
          <div className="mt-auto pt-6 flex flex-col gap-2">
                <button
                    onClick={onNavigateToVisualize}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <i className="ri-magic-line mr-2"></i>
                    Visualize Palette
                </button>
                <button
                    onClick={onNavigateToPantone}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <i className="ri-paint-brush-line mr-2"></i>
                    Simulate Pantone®
                </button>
                <button
                    onClick={onEdit}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <i className="ri-palette-line mr-2"></i>
                    Edit in Editor
                </button>
                <button
                    onClick={onExport}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                    <i className="ri-download-2-line mr-2"></i>
                    Export Color Palette
                    </button>
                <button
                    onClick={onSave}
                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                    <i className="ri-save-line mr-2"></i>
                    Save Color Palette
                    </button>
          </div>
      )}
    </aside>
  );
};

export default Controls;