import React, { useState } from 'react';
import { OklchColor } from '../types';
import { 
    oklchToHex, 
    oklchToRgb,
    oklchToHsl,
    oklchToHsb,
    oklchToHwb,
    oklchToCmyk,
    oklchToLab,
    oklchToLch,
    oklchToXyz,
    oklchToOklab,
    formatHsbString,
    formatHwbString,
    formatNcolString,
    formatCmykString,
    // CSS Formatters
    formatRgbStringCss,
    formatHslStringCss,
    formatLabStringCss,
    formatLchStringCss,
    formatOklabStringCss,
    formatOklchStringCss,
    formatDeviceCmykStringCss,
    // Wide Gamut
    oklchToDisplayP3,
    oklchToA98Rgb,
    oklchToProphotoRgb,
    oklchToRec2020,
    oklchToLinearSrgb,
    formatDisplayP3StringCss,
    formatA98RgbStringCss,
    formatProphotoRgbStringCss,
    formatRec2020StringCss,
    formatSrgbLinearStringCss,
    formatXyzStringCss,
} from '../services/colorService';

interface ConversionRowProps {
    label: string;
    value: string;
}

const ConversionRow: React.FC<ConversionRowProps> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50/70 rounded-lg">
            <span className="text-sm font-medium text-gray-500 truncate pr-2">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-800">{value}</span>
                <button
                    onClick={handleCopy}
                    className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors duration-200 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={`Copy ${label} value`}
                >
                    {copied ? <i className="ri-check-line text-lg text-green-600"></i> : <i className="ri-file-copy-line text-base"></i>}
                </button>
            </div>
        </div>
    );
};

interface ColorConverterResultsProps {
    color: OklchColor;
}

const ColorConverterResults: React.FC<ColorConverterResultsProps> = ({ color }) => {
    // sRGB
    const hex = oklchToHex(color);
    const rgb = oklchToRgb(color);
    const hsl = oklchToHsl(color);
    const hsb = oklchToHsb(color);
    const hwb = oklchToHwb(color);
    const cmyk = oklchToCmyk(color);

    // Perceptual
    const lab = oklchToLab(color);
    const lch = oklchToLch(color);
    const oklab = oklchToOklab(color);
    
    // Wide Gamut
    const xyz = oklchToXyz(color);
    const displayP3 = oklchToDisplayP3(color);
    const a98Rgb = oklchToA98Rgb(color);
    const prophotoRgb = oklchToProphotoRgb(color);
    const rec2020 = oklchToRec2020(color);
    const linearSrgb = oklchToLinearSrgb(color);
    
    return (
        <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col gap-4 h-full overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800">Conversion Results</h2>
            <div className="space-y-1.5 flex-1 flex flex-col">
                <h3 className="text-sm font-semibold text-gray-500 px-3 mb-1">sRGB Gamut</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="space-y-1.5">
                        <ConversionRow label="HEX" value={hex} />
                        <ConversionRow label="RGB" value={formatRgbStringCss(rgb)} />
                        <ConversionRow label="HSL" value={formatHslStringCss(hsl)} />
                        <ConversionRow label="HWB" value={formatHwbString(hwb)} />
                    </div>
                    <div className="space-y-1.5">
                        <ConversionRow label="CMYK" value={formatCmykString(cmyk)} />
                        <ConversionRow label="device-cmyk()" value={formatDeviceCmykStringCss(cmyk)} />
                        <ConversionRow label="HSB/HSV" value={formatHsbString(hsb)} />
                        <ConversionRow label="NCol" value={formatNcolString(hwb)} />
                    </div>
                </div>

                <div className="!mt-4 pt-3 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 px-3 mb-1">Perceptual Models</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-1.5">
                        <div className="space-y-1.5">
                            <ConversionRow label="OKLCH" value={formatOklchStringCss(color)} />
                            <ConversionRow label="OKLAB" value={formatOklabStringCss(oklab)} />
                        </div>
                        <div className="space-y-1.5">
                            <ConversionRow label="CIELAB" value={formatLabStringCss(lab)} />
                            <ConversionRow label="CIELCH" value={formatLchStringCss(lch)} />
                        </div>
                    </div>
                </div>

                 <div className="!mt-4 pt-3 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 px-3 mb-1">Wide Gamut & Other Spaces</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-1.5">
                        <div className="space-y-1.5">
                            <ConversionRow label="Display P3" value={formatDisplayP3StringCss(displayP3)} />
                            <ConversionRow label="A98 RGB" value={formatA98RgbStringCss(a98Rgb)} />
                            <ConversionRow label="ProPhoto RGB" value={formatProphotoRgbStringCss(prophotoRgb)} />
                        </div>
                        <div className="space-y-1.5">
                             <ConversionRow label="Rec. 2020" value={formatRec2020StringCss(rec2020)} />
                             <ConversionRow label="sRGB Linear" value={formatSrgbLinearStringCss(linearSrgb)} />
                             <ConversionRow label="XYZ D65" value={formatXyzStringCss(xyz)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorConverterResults;