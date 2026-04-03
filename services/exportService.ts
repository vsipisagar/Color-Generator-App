import { OklchColor } from '../types';
import * as colorService from './colorService';
import { triggerDownload } from '../utils';

declare const jspdf: any;
declare const XLSX: any;
declare const html2canvas: any;

export enum ExportFormat {
    CSS = 'CSS',
    SCSS = 'SCSS',
    LESS = 'LESS',
    JSON = 'JSON',
    XML = 'XML',
    CSV = 'CSV',
    TXT = 'TXT',
    GPL = 'GPL',
    JASC_PAL = 'JASC Palette',
    SVG = 'SVG',
    PNG = 'PNG',
    JPEG = 'JPEG',
    PDF = 'PDF',
    XLSX = 'XLSX',
}

export enum ColorCodeFormat {
    Hex = 'Hexadecimal (#rrggbb)',
    HexShorthand = 'Hexadecimal (#rgb)',
    Hex8 = 'Hexadecimal (#rrggbbaa)',
    RGB = 'RGB Function',
    RGBA = 'RGBA Function (Legacy)',
    HSL = 'HSL Function',
    HSLA = 'HSLA Function (Legacy)',
    HSB = 'HSB/HSV Function',
    HSBA = 'HSBA Function (Legacy)',
    ARGB = 'ARGB Function (LESS)',
    HWB = 'HWB Function',
    LAB = 'LAB (CIELAB)',
    LCH = 'LCH (CIELCH)',
    Oklab = 'Oklab',
    Oklch = 'Oklch',
    CMYK = 'device-cmyk()',
    NCol = 'NCol',
    // New color() formats
    DisplayP3 = 'Display P3',
    A98Rgb = 'A98 RGB',
    ProphotoRgb = 'ProPhoto RGB',
    Rec2020 = 'Rec. 2020',
    SrgbLinear = 'sRGB Linear',
    XyzD65 = 'XYZ D65',
}

export const formatCategories: Record<string, ExportFormat[]> = {
    'Web Environment': [ExportFormat.CSS, ExportFormat.SCSS, ExportFormat.LESS],
    'Structured Data': [ExportFormat.JSON, ExportFormat.XML, ExportFormat.CSV],
    'Plain Text': [ExportFormat.TXT],
    'Palette File': [ExportFormat.GPL, ExportFormat.JASC_PAL],
    'Image & Document': [ExportFormat.SVG, ExportFormat.PNG, ExportFormat.JPEG, ExportFormat.PDF, ExportFormat.XLSX]
};

const structuredDataColorFormats = [
    ColorCodeFormat.Hex,
    ColorCodeFormat.RGB,
    ColorCodeFormat.HSL,
    ColorCodeFormat.HWB,
    ColorCodeFormat.LAB,
    ColorCodeFormat.LCH,
    ColorCodeFormat.Oklab,
    ColorCodeFormat.Oklch,
    ColorCodeFormat.CMYK,
    ColorCodeFormat.DisplayP3,
    ColorCodeFormat.A98Rgb,
    ColorCodeFormat.ProphotoRgb,
    ColorCodeFormat.Rec2020,
    ColorCodeFormat.SrgbLinear,
    ColorCodeFormat.XyzD65
];

const lessColorFormats = [
    ColorCodeFormat.HexShorthand,
    ColorCodeFormat.Hex,
    ColorCodeFormat.Hex8,
    ColorCodeFormat.RGB,
    ColorCodeFormat.RGBA,
    ColorCodeFormat.HSL,
    ColorCodeFormat.HSLA,
    ColorCodeFormat.HSB,
    ColorCodeFormat.HSBA,
    ColorCodeFormat.ARGB,
    ColorCodeFormat.HWB,
    ColorCodeFormat.LAB,
    ColorCodeFormat.LCH,
    ColorCodeFormat.Oklab,
    ColorCodeFormat.Oklch,
    ColorCodeFormat.DisplayP3,
    ColorCodeFormat.A98Rgb,
    ColorCodeFormat.ProphotoRgb,
    ColorCodeFormat.Rec2020,
    ColorCodeFormat.SrgbLinear,
    ColorCodeFormat.XyzD65,
];

// Map file formats to their supported color formats. `null` means no user choice.
export const FILE_FORMAT_COLOR_SUPPORT: Record<ExportFormat, ColorCodeFormat[] | null> = {
    [ExportFormat.CSS]: [
        ColorCodeFormat.Hex, ColorCodeFormat.RGB, ColorCodeFormat.RGBA, ColorCodeFormat.HSL, 
        ColorCodeFormat.HSLA, ColorCodeFormat.HWB, ColorCodeFormat.LAB, ColorCodeFormat.LCH, 
        ColorCodeFormat.Oklab, ColorCodeFormat.Oklch, ColorCodeFormat.CMYK,
        ColorCodeFormat.DisplayP3, ColorCodeFormat.A98Rgb, ColorCodeFormat.ProphotoRgb,
        ColorCodeFormat.Rec2020, ColorCodeFormat.SrgbLinear, ColorCodeFormat.XyzD65
    ],
    [ExportFormat.SCSS]: [
        ColorCodeFormat.Hex,
        ColorCodeFormat.HexShorthand,
        ColorCodeFormat.Hex8,
        ColorCodeFormat.RGB,
        ColorCodeFormat.RGBA,
        ColorCodeFormat.HSL,
        ColorCodeFormat.HSLA,
        ColorCodeFormat.HWB,
        ColorCodeFormat.LAB,
        ColorCodeFormat.LCH,
        ColorCodeFormat.Oklab,
        ColorCodeFormat.Oklch,
        ColorCodeFormat.CMYK,
        ColorCodeFormat.DisplayP3,
        ColorCodeFormat.A98Rgb,
        ColorCodeFormat.ProphotoRgb,
        ColorCodeFormat.Rec2020,
        ColorCodeFormat.SrgbLinear,
        ColorCodeFormat.XyzD65,
    ],
    [ExportFormat.LESS]: lessColorFormats,
    [ExportFormat.SVG]: [ColorCodeFormat.Hex, ColorCodeFormat.RGB],
    [ExportFormat.TXT]: [
        ColorCodeFormat.Hex,
        ColorCodeFormat.RGB,
        ColorCodeFormat.RGBA,
        ColorCodeFormat.HSL,
        ColorCodeFormat.HSLA,
        ColorCodeFormat.HWB,
        ColorCodeFormat.LAB,
        ColorCodeFormat.LCH,
        ColorCodeFormat.Oklab,
        ColorCodeFormat.Oklch,
        ColorCodeFormat.CMYK,
        ColorCodeFormat.DisplayP3,
        ColorCodeFormat.A98Rgb,
        ColorCodeFormat.ProphotoRgb,
        ColorCodeFormat.Rec2020,
        ColorCodeFormat.SrgbLinear,
        ColorCodeFormat.XyzD65,
        ColorCodeFormat.NCol,
    ],
    [ExportFormat.JSON]: structuredDataColorFormats,
    [ExportFormat.XML]: structuredDataColorFormats,
    [ExportFormat.CSV]: structuredDataColorFormats,
    // These formats have fixed or no color code options
    [ExportFormat.GPL]: null,
    [ExportFormat.JASC_PAL]: null,
    [ExportFormat.PNG]: lessColorFormats,
    [ExportFormat.JPEG]: lessColorFormats,
    [ExportFormat.PDF]: lessColorFormats,
    [ExportFormat.XLSX]: lessColorFormats,
};


export const isTextBased = (format: ExportFormat): boolean => {
    return formatCategories['Web Environment'].includes(format) ||
           formatCategories['Structured Data'].includes(format) ||
           formatCategories['Plain Text'].includes(format) ||
           formatCategories['Palette File'].includes(format) ||
           format === ExportFormat.SVG;
};


// ----- HELPERS -----
const colorToRgb255 = (c: OklchColor) => {
    const rgb = colorService.oklchToRgb(c);
    return {
        r: Math.round(rgb.r * 255),
        g: Math.round(rgb.g * 255),
        b: Math.round(rgb.b * 255),
    };
};

export const getFormattedColorString = (color: OklchColor, format: ColorCodeFormat): string => {
    switch (format) {
        case ColorCodeFormat.Hex: return colorService.oklchToHex(color);
        case ColorCodeFormat.HexShorthand: return colorService.oklchToHexShorthand(color);
        case ColorCodeFormat.Hex8: return colorService.oklchToHex8(color);
        case ColorCodeFormat.RGB: return colorService.formatRgbStringCss(colorService.oklchToRgb(color));
        case ColorCodeFormat.RGBA: return colorService.formatRgbaStringLegacy(colorService.oklchToRgb(color));
        case ColorCodeFormat.HSL: return colorService.formatHslStringCss(colorService.oklchToHsl(color));
        case ColorCodeFormat.HSLA: return colorService.formatHslaStringLegacy(colorService.oklchToHsl(color));
        case ColorCodeFormat.HSB: return colorService.formatHsbStringCss(colorService.oklchToHsb(color));
        case ColorCodeFormat.HSBA: return colorService.formatHsbaStringLegacy(colorService.oklchToHsb(color));
        case ColorCodeFormat.ARGB: return colorService.formatArgbStringLess(color);
        case ColorCodeFormat.HWB: return colorService.formatHwbStringCss(colorService.oklchToHwb(color));
        case ColorCodeFormat.LAB: return colorService.formatLabStringCss(colorService.oklchToLab(color));
        case ColorCodeFormat.LCH: return colorService.formatLchStringCss(colorService.oklchToLch(color));
        case ColorCodeFormat.Oklab: return colorService.formatOklabStringCss(colorService.oklchToOklab(color));
        case ColorCodeFormat.Oklch: return colorService.formatOklchStringCss(color);
        case ColorCodeFormat.CMYK: return colorService.formatDeviceCmykStringCss(colorService.oklchToCmyk(color));
        case ColorCodeFormat.NCol: return colorService.formatNcolString(colorService.oklchToHwb(color));
        case ColorCodeFormat.DisplayP3: return colorService.formatDisplayP3StringCss(colorService.oklchToDisplayP3(color));
        case ColorCodeFormat.A98Rgb: return colorService.formatA98RgbStringCss(colorService.oklchToA98Rgb(color));
        case ColorCodeFormat.ProphotoRgb: return colorService.formatProphotoRgbStringCss(colorService.oklchToProphotoRgb(color));
        case ColorCodeFormat.Rec2020: return colorService.formatRec2020StringCss(colorService.oklchToRec2020(color));
        case ColorCodeFormat.SrgbLinear: return colorService.formatSrgbLinearStringCss(colorService.oklchToLinearSrgb(color));
        case ColorCodeFormat.XyzD65: return colorService.formatXyzStringCss(colorService.oklchToXyz(color));
        default: return colorService.oklchToHex(color);
    }
};

const getJsonColorObject = (color: OklchColor, colorFormat: ColorCodeFormat): object => {
    switch (colorFormat) {
        case ColorCodeFormat.Hex: return { hex: colorService.oklchToHex(color) };
        case ColorCodeFormat.RGB: case ColorCodeFormat.RGBA: { const { r, g, b } = colorService.oklchToRgb(color); return { model: 'rgb', r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: 1.0 }; }
        case ColorCodeFormat.HSL: case ColorCodeFormat.HSLA: { const { h, s, l } = colorService.oklchToHsl(color); return { model: 'hsl', h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100), a: 1.0 }; }
        case ColorCodeFormat.HWB: { const { h, w, b } = colorService.oklchToHwb(color); return { model: 'hwb', h: Math.round(h), w: Math.round(w * 100), b: Math.round(b * 100), a: 1.0 }; }
        case ColorCodeFormat.LAB: { const { l, a, b } = colorService.oklchToLab(color); return { model: 'lab-d65', l: +l.toFixed(2), a: +a.toFixed(2), b: +b.toFixed(2) }; }
        case ColorCodeFormat.LCH: { const { l, c, h } = colorService.oklchToLch(color); return { model: 'lch', l: +l.toFixed(2), c: +c.toFixed(2), h: +h.toFixed(2) }; }
        case ColorCodeFormat.Oklch: { const { l, c, h } = color; return { model: 'oklch', l: +l.toFixed(5), c: +c.toFixed(5), h: +h.toFixed(2) }; }
        case ColorCodeFormat.Oklab: { const { l, a, b } = colorService.oklchToOklab(color); return { model: 'oklab', l: +l.toFixed(5), a: +a.toFixed(5), b: +b.toFixed(5) }; }
        case ColorCodeFormat.CMYK: { const { c, m, y, k } = colorService.oklchToCmyk(color); return { model: 'cmyk', c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) }; }
        case ColorCodeFormat.DisplayP3: { const { r, g, b } = colorService.oklchToDisplayP3(color); return { model: 'display-p3', c1: +r.toFixed(4), c2: +g.toFixed(4), c3: +b.toFixed(4) }; }
        case ColorCodeFormat.A98Rgb: { const { r, g, b } = colorService.oklchToA98Rgb(color); return { model: 'a98-rgb', c1: +r.toFixed(4), c2: +g.toFixed(4), c3: +b.toFixed(4) }; }
        case ColorCodeFormat.ProphotoRgb: { const { r, g, b } = colorService.oklchToProphotoRgb(color); return { model: 'prophoto-rgb', c1: +r.toFixed(4), c2: +g.toFixed(4), c3: +b.toFixed(4) }; }
        case ColorCodeFormat.Rec2020: { const { r, g, b } = colorService.oklchToRec2020(color); return { model: 'rec2020', c1: +r.toFixed(4), c2: +g.toFixed(4), c3: +b.toFixed(4) }; }
        case ColorCodeFormat.SrgbLinear: { const { r, g, b } = colorService.oklchToLinearSrgb(color); return { model: 'srgb-linear', c1: +r.toFixed(4), c2: +g.toFixed(4), c3: +b.toFixed(4) }; }
        case ColorCodeFormat.XyzD65: { const { x, y, z } = colorService.oklchToXyz(color); return { model: 'xyz-d65', x: +(x/100).toFixed(5), y: +(y/100).toFixed(5), z: +(z/100).toFixed(5) }; }
        default: return { value: getFormattedColorString(color, colorFormat) };
    }
}
export const getJsonColorString = (color: OklchColor, colorFormat: ColorCodeFormat): string => JSON.stringify(getJsonColorObject(color, colorFormat), null, 2);

export const getXmlColorString = (color: OklchColor, colorFormat: ColorCodeFormat): string => {
    switch (colorFormat) {
        case ColorCodeFormat.Hex: return `<color hex="${colorService.oklchToHex(color)}"/>`;
        case ColorCodeFormat.RGB: case ColorCodeFormat.RGBA: { const { r, g, b } = colorService.oklchToRgb(color); return `<color model="rgb" r="${Math.round(r * 255)}" g="${Math.round(g * 255)}" b="${Math.round(b * 255)}" a="1.0"/>`; }
        case ColorCodeFormat.HSL: case ColorCodeFormat.HSLA: { const { h, s, l } = colorService.oklchToHsl(color); return `<color model="hsl" h="${Math.round(h)}" s="${Math.round(s * 100)}" l="${Math.round(l * 100)}" a="1.0"/>`; }
        case ColorCodeFormat.HWB: { const { h, w, b } = colorService.oklchToHwb(color); return `<color model="hwb" h="${Math.round(h)}" w="${Math.round(w * 100)}%" b="${Math.round(b * 100)}%" a="1.0"/>`; }
        case ColorCodeFormat.LAB: { const { l, a, b } = colorService.oklchToLab(color); return `<color model="lab-d65" l="${l.toFixed(2)}" a="${a.toFixed(2)}" b="${b.toFixed(2)}"/>`; }
        case ColorCodeFormat.LCH: { const { l, c, h } = colorService.oklchToLch(color); return `<color model="lch" l="${l.toFixed(2)}" c="${c.toFixed(2)}" h="${h.toFixed(2)}"/>`; }
        case ColorCodeFormat.Oklch: { const { l, c, h } = color; return `<color model="oklch" l="${l.toFixed(5)}" c="${c.toFixed(5)}" h="${h.toFixed(2)}"/>`; }
        case ColorCodeFormat.Oklab: { const { l, a, b } = colorService.oklchToOklab(color); return `<color model="oklab" l="${l.toFixed(5)}" a="${a.toFixed(5)}" b="${b.toFixed(5)}"/>`; }
        case ColorCodeFormat.CMYK: { const { c, m, y, k } = colorService.oklchToCmyk(color); return `<color model="cmyk" c="${Math.round(c * 100)}%" m="${Math.round(m * 100)}%" y="${Math.round(y * 100)}%" k="${Math.round(k * 100)}%"/>`; }
        case ColorCodeFormat.DisplayP3: { const { r, g, b } = colorService.oklchToDisplayP3(color); return `<color space="display-p3" c1="${r.toFixed(4)}" c2="${g.toFixed(4)}" c3="${b.toFixed(4)}"/>`; }
        case ColorCodeFormat.A98Rgb: { const { r, g, b } = colorService.oklchToA98Rgb(color); return `<color space="a98-rgb" c1="${r.toFixed(4)}" c2="${g.toFixed(4)}" c3="${b.toFixed(4)}"/>`; }
        case ColorCodeFormat.ProphotoRgb: { const { r, g, b } = colorService.oklchToProphotoRgb(color); return `<color space="prophoto-rgb" c1="${r.toFixed(4)}" c2="${g.toFixed(4)}" c3="${b.toFixed(4)}"/>`; }
        case ColorCodeFormat.Rec2020: { const { r, g, b } = colorService.oklchToRec2020(color); return `<color space="rec2020" c1="${r.toFixed(4)}" c2="${g.toFixed(4)}" c3="${b.toFixed(4)}"/>`; }
        case ColorCodeFormat.SrgbLinear: { const { r, g, b } = colorService.oklchToLinearSrgb(color); return `<color space="srgb-linear" c1="${r.toFixed(4)}" c2="${g.toFixed(4)}" c3="${b.toFixed(4)}"/>`; }
        case ColorCodeFormat.XyzD65: { const { x, y, z } = colorService.oklchToXyz(color); return `<color space="xyz-d65" c1="${(x/100).toFixed(5)}" c2="${(y/100).toFixed(5)}" c3="${(z/100).toFixed(5)}"/>`; }
        default: return `<color value="${getFormattedColorString(color, colorFormat).replace(/"/g, '&quot;')}"/>`;
    }
}

const toCsvRow = (arr: (string | number)[]) => arr.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
const getCsvHeaders = (colorFormat: ColorCodeFormat): string[] => {
    switch (colorFormat) {
        case ColorCodeFormat.Hex: return ['Hex_Code'];
        case ColorCodeFormat.RGB: case ColorCodeFormat.RGBA: return ['RGB_R', 'RGB_G', 'RGB_B', 'RGB_A'];
        case ColorCodeFormat.HSL: case ColorCodeFormat.HSLA: return ['HSL_H', 'HSL_S', 'HSL_L', 'HSL_A'];
        case ColorCodeFormat.HWB: return ['HWB_H', 'HWB_W', 'HWB_B', 'HWB_A'];
        case ColorCodeFormat.LAB: return ['LAB_L', 'LAB_A', 'LAB_B'];
        case ColorCodeFormat.LCH: return ['LCH_L', 'LCH_C', 'LCH_H'];
        case ColorCodeFormat.Oklab: return ['OKLAB_L', 'OKLAB_A', 'OKLAB_B'];
        case ColorCodeFormat.Oklch: return ['OKLCH_L', 'OKLCH_C', 'OKLCH_H'];
        case ColorCodeFormat.CMYK: return ['CMYK_C', 'CMYK_M', 'CMYK_Y', 'CMYK_K'];
        case ColorCodeFormat.DisplayP3: case ColorCodeFormat.A98Rgb: case ColorCodeFormat.ProphotoRgb: case ColorCodeFormat.Rec2020:
        case ColorCodeFormat.SrgbLinear: case ColorCodeFormat.XyzD65: return ['COLORSPACE', 'C1', 'C2', 'C3'];
        default: return ['Value'];
    }
};
const getCsvColorRowArray = (color: OklchColor, colorFormat: ColorCodeFormat): (string|number)[] => {
     switch (colorFormat) {
        case ColorCodeFormat.Hex: return [colorService.oklchToHex(color)];
        case ColorCodeFormat.RGB: case ColorCodeFormat.RGBA: { const { r, g, b } = colorService.oklchToRgb(color); return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 1.0]; }
        case ColorCodeFormat.HSL: case ColorCodeFormat.HSLA: { const { h, s, l } = colorService.oklchToHsl(color); return [Math.round(h), Math.round(s * 100), Math.round(l * 100), 1.0]; }
        case ColorCodeFormat.HWB: { const { h, w, b } = colorService.oklchToHwb(color); return [Math.round(h), Math.round(w * 100), Math.round(b * 100), 1.0]; }
        case ColorCodeFormat.LAB: { const { l, a, b } = colorService.oklchToLab(color); return [l.toFixed(2), a.toFixed(2), b.toFixed(2)]; }
        case ColorCodeFormat.LCH: { const { l, c, h } = colorService.oklchToLch(color); return [l.toFixed(2), c.toFixed(2), h.toFixed(2)]; }
        case ColorCodeFormat.Oklab: { const { l, a, b } = colorService.oklchToOklab(color); return [l.toFixed(5), a.toFixed(5), b.toFixed(5)]; }
        case ColorCodeFormat.Oklch: return [color.l.toFixed(5), color.c.toFixed(5), color.h.toFixed(2)];
        case ColorCodeFormat.CMYK: { const { c: cy, m, y, k } = colorService.oklchToCmyk(color); return [Math.round(cy * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)]; }
        case ColorCodeFormat.DisplayP3: case ColorCodeFormat.A98Rgb: case ColorCodeFormat.ProphotoRgb: case ColorCodeFormat.Rec2020: {
            let spaceName: string; let colorValues: {r:number, g:number, b:number};
            if (colorFormat === ColorCodeFormat.DisplayP3) { spaceName = 'display-p3'; colorValues = colorService.oklchToDisplayP3(color); }
            else if (colorFormat === ColorCodeFormat.A98Rgb) { spaceName = 'a98-rgb'; colorValues = colorService.oklchToA98Rgb(color); }
            else if (colorFormat === ColorCodeFormat.ProphotoRgb) { spaceName = 'prophoto-rgb'; colorValues = colorService.oklchToProphotoRgb(color); }
            else { spaceName = 'rec2020'; colorValues = colorService.oklchToRec2020(color); }
            return [spaceName, colorValues.r.toFixed(4), colorValues.g.toFixed(4), colorValues.b.toFixed(4)];
        }
        case ColorCodeFormat.SrgbLinear: { const { r, g, b } = colorService.oklchToLinearSrgb(color); return ['srgb-linear', r.toFixed(4), g.toFixed(4), b.toFixed(4)]; }
        case ColorCodeFormat.XyzD65: { const { x, y, z } = colorService.oklchToXyz(color); return ['xyz-d65', (x/100).toFixed(5), (y/100).toFixed(5), (z/100).toFixed(5)]; }
        default: return [getFormattedColorString(color, colorFormat)];
    }
};
export const getCsvColorString = (color: OklchColor, colorFormat: ColorCodeFormat): string => toCsvRow(getCsvColorRowArray(color, colorFormat));

// ----- CONTENT GENERATORS (for preview) -----
export const getPreviewContent = (palette: OklchColor[], fileFormat: ExportFormat, colorFormats: ColorCodeFormat[]): string => {
    const colorFormat = colorFormats[0] || ColorCodeFormat.Hex;
    switch (fileFormat) {
        case ExportFormat.CSS: return palette.map((c, i) => `--color-${i + 1}: ${getFormattedColorString(c, colorFormat)};`).join('\n');
        case ExportFormat.SCSS: return palette.map((c, i) => `$color-${i + 1}: ${getFormattedColorString(c, colorFormat)};`).join('\n');
        case ExportFormat.LESS: return palette.map((c, i) => `@color-${i + 1}: ${getFormattedColorString(c, colorFormat)};`).join('\n');
        case ExportFormat.SVG: {
            const swatchSize = 100;
            const svgContent = palette.map((c, i) => `<rect x="${i * swatchSize}" y="0" width="${swatchSize}" height="${swatchSize}" fill="${getFormattedColorString(c, colorFormat)}" />`).join('');
            return `<svg width="${palette.length * swatchSize}" height="${swatchSize}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
        }
        case ExportFormat.TXT: return palette.map(c => getFormattedColorString(c, colorFormat)).join('\n');
        case ExportFormat.JSON: {
            const data = palette.map(color => getJsonColorObject(color, colorFormat));
            return JSON.stringify(data, null, 2);
        }
        case ExportFormat.XML: {
            const colorsXml = palette.map(color => `  ${getXmlColorString(color, colorFormat)}`).join('\n');
            return `<?xml version="1.0" encoding="UTF-8"?>\n<palette>\n${colorsXml}\n</palette>`;
        }
        case ExportFormat.CSV: {
            const headers = getCsvHeaders(colorFormat);
            const headerRow = headers.join(',');
            const contentRows = palette.map(c => toCsvRow(getCsvColorRowArray(c, colorFormat))).join('\n');
            return `${headerRow}\n${contentRows}`;
        }
        case ExportFormat.GPL: {
            const data = palette.map(c => ({rgb: colorToRgb255(c), hex: colorService.oklchToHex(c)}));
            const colorsGpl = data.map(c => `${c.rgb.r} ${c.rgb.g} ${c.rgb.b}\t${c.hex}`).join('\n');
            return `GIMP Palette\nName: Exported Palette\n#\n${colorsGpl}`;
        }
        case ExportFormat.JASC_PAL: {
            const data = palette.map(c => colorToRgb255(c));
            const colorsJasc = data.map(c => `${c.r} ${c.g} ${c.b}`).join('\n');
            return `JASC-PAL\n0100\n${data.length}\n${colorsJasc}`;
        }
        default: return `Preview for ${fileFormat} is not available.`;
    }
};

// ----- EXPORT FUNCTIONS -----
const exportAsPdf = (palette: OklchColor[], colorFormats: ColorCodeFormat[]) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const swatchSize = 20;
    const margin = 10;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.height;
    const blockHeight = swatchSize + 5 + (colorFormats.length * lineHeight);

    doc.setFontSize(18);
    doc.text("Color Palette", margin, margin + 10);

    let y = margin + 20;

    palette.forEach((color) => {
        if (y + blockHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        const { r, g, b } = colorToRgb255(color);
        
        doc.setFillColor(r, g, b);
        doc.rect(margin, y, swatchSize, swatchSize, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const textX = margin + swatchSize + 5;
        let textY = y + 5;

        colorFormats.forEach(format => {
            const value = getFormattedColorString(color, format);
            doc.setFont('helvetica', 'bold');
            doc.text(`${format}:`, textX, textY, { align: 'left' });
            doc.setFont('courier', 'normal');
            doc.text(value, textX + 60, textY, { align: 'left', maxWidth: 100 });
            textY += lineHeight;
        });

        y += blockHeight + 5;
    });

    doc.save('palette.pdf');
};

const exportAsXlsx = (palette: OklchColor[], colorFormats: ColorCodeFormat[]) => {
     const data = palette.map((c, i) => {
        const row: { [key: string]: string | number } = {
            '#': i + 1,
            'Preview': colorService.oklchToHex(c)
        };
        
        colorFormats.forEach(format => {
            row[format] = getFormattedColorString(c, format);
        });
        
        return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Colors');
    XLSX.writeFile(workbook, 'palette.xlsx');
};

export const exportPalette = (
    palette: OklchColor[], 
    fileFormat: ExportFormat, 
    colorFormats: ColorCodeFormat[],
    elementToCapture?: HTMLElement | null
) => {
    if ((fileFormat === ExportFormat.PNG || fileFormat === ExportFormat.JPEG) && elementToCapture) {
        html2canvas(elementToCapture, { 
            scale: 2, // for higher resolution
            useCORS: true, 
            allowTaint: true,
            backgroundColor: '#f3f4f6' // bg-gray-100
        }).then((canvas: HTMLCanvasElement) => {
            const mimeType = fileFormat === ExportFormat.PNG ? 'image/png' : 'image/jpeg';
            const format = fileFormat === ExportFormat.PNG ? 'png' : 'jpeg';
            canvas.toBlob(blob => {
                if (blob) triggerDownload(`palette.${format}`, blob, mimeType);
            }, mimeType, 0.95);
        });
        return;
    }

    if (!isTextBased(fileFormat)) {
        switch (fileFormat) {
            case ExportFormat.PDF: return exportAsPdf(palette, colorFormats);
            case ExportFormat.XLSX: return exportAsXlsx(palette, colorFormats);
        }
    } else {
        const content = getPreviewContent(palette, fileFormat, colorFormats);
        const extensionMap: Record<string, string> = {
            [ExportFormat.CSS]: 'css',
            [ExportFormat.SCSS]: 'scss',
            [ExportFormat.LESS]: 'less',
            [ExportFormat.JSON]: 'json',
            [ExportFormat.XML]: 'xml',
            [ExportFormat.CSV]: 'csv',
            [ExportFormat.TXT]: 'txt',
            [ExportFormat.GPL]: 'gpl',
            [ExportFormat.JASC_PAL]: 'pal',
            [ExportFormat.SVG]: 'svg',
        };
        const extension = extensionMap[fileFormat] || 'txt';
        const mimeType = fileFormat === ExportFormat.SVG ? 'image/svg+xml' : 'text/plain';
        triggerDownload(`palette.${extension}`, content, mimeType);
    }
};