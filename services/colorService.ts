import { OklchColor, RgbColor, HslColor, HsbColor, HwbColor, CmykColor, HarmonyRule, VisionDeficiency, XyzColor, LabColor, LchColor, OklabColor, DisplayP3Color, A98RgbColor, ProphotoRgbColor, Rec2020Color } from '../types';

// Helper function to clamp a value between a min and max
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

// Converts an OKLCH color to an sRGB color object
// FIX: Export oklchToLinearSrgb to make it accessible to other modules.
export const oklchToLinearSrgb = (color: OklchColor): RgbColor => {
  const l = color.l;
  const c = color.c;
  const h = color.h;

  const hRad = h * (Math.PI / 180);
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l_cubed = l_ * l_ * l_;
  const m_cubed = m_ * m_ * m_;
  const s_cubed = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed,
    g: -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed,
    b: -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.7076147010 * s_cubed,
  };
};

const linearSrgbToSrgb = (c: number): number => {
  if (c <= 0.0031308) {
    return 12.92 * c;
  }
  return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};

// Main conversion function from OKLCH to HEX string
export const oklchToHex = (color: OklchColor): string => {
  const linearRgb = oklchToLinearSrgb(color);

  const r_srgb = linearSrgbToSrgb(clamp(linearRgb.r, 0, 1));
  const g_srgb = linearSrgbToSrgb(clamp(linearRgb.g, 0, 1));
  const b_srgb = linearSrgbToSrgb(clamp(linearRgb.b, 0, 1));

  const toHexPart = (c: number): string => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHexPart(r_srgb)}${toHexPart(g_srgb)}${toHexPart(b_srgb)}`;
};

export const oklchToHexShorthand = (color: OklchColor): string => {
  const linearRgb = oklchToLinearSrgb(color);

  const r_srgb = linearSrgbToSrgb(clamp(linearRgb.r, 0, 1));
  const g_srgb = linearSrgbToSrgb(clamp(linearRgb.g, 0, 1));
  const b_srgb = linearSrgbToSrgb(clamp(linearRgb.b, 0, 1));

  const toShortHexPart = (c: number): string => {
    const val = Math.round(c * 15);
    return val.toString(16);
  };

  return `#${toShortHexPart(r_srgb)}${toShortHexPart(g_srgb)}${toShortHexPart(b_srgb)}`;
};

export const oklchToHex8 = (color: OklchColor): string => {
  const hex6 = oklchToHex(color);
  // Appending FF for full opacity, as OKLCH has no alpha component.
  return `${hex6}ff`;
};

export const rgbToHex = (rgb: RgbColor): string => {
  const toHexPart = (c: number): string => {
    const hex = Math.round(clamp(c, 0, 1) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHexPart(rgb.r)}${toHexPart(rgb.g)}${toHexPart(rgb.b)}`;
};


// --- sRGB to Linear sRGB ---
const srgbToLinearSrgb = (c: number): number => {
  if (c <= 0.04045) {
    return c / 12.92;
  }
  return Math.pow((c + 0.055) / 1.055, 2.4);
};

// --- HEX to RGB ---
const hexToRgb = (hex: string): RgbColor | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    // Handle shorthand hex
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (!shorthand) return null;
    return {
      r: parseInt(shorthand[1] + shorthand[1], 16) / 255,
      g: parseInt(shorthand[2] + shorthand[2], 16) / 255,
      b: parseInt(shorthand[3] + shorthand[3], 16) / 255,
    };
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
};

// --- RGB <-> HSL ---
export const rgbToHsl = ({ r, g, b }: RgbColor): HslColor => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s, l };
};

export const hslToRgb = ({ h, s, l }: HslColor): RgbColor => {
    let r, g, b;
    const hue = h / 360;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, hue + 1 / 3);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1 / 3);
    }
    return { r, g, b };
};

// --- RGB <-> HSB (HSV) ---
export const rgbToHsb = ({ r, g, b }: RgbColor): HsbColor => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s, b: v };
};

export const hsbToRgb = ({ h, s, b }: HsbColor): RgbColor => {
    let r = 0, g = 0, v = 0;
    const hue = h / 360;
    const i = Math.floor(hue * 6);
    const f = hue * 6 - i;
    const p = b * (1 - s);
    const q = b * (1 - f * s);
    const t = b * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = b, g = t, v = p; break;
        case 1: r = q, g = b, v = p; break;
        case 2: r = p, g = b, v = t; break;
        case 3: r = p, g = q, v = b; break;
        case 4: r = t, g = p, v = b; break;
        case 5: r = b, g = p, v = q; break;
    }
    return { r, g, b: v };
};

// --- RGB <-> HWB ---
export const rgbToHwb = (rgb: RgbColor): HwbColor => {
    const { r, g, b } = rgb;
    const h = rgbToHsl(rgb).h;
    const w = Math.min(r, g, b);
    const bl = 1 - Math.max(r, g, b);
    return { h, w, b: bl };
};

export const hwbToRgb = ({ h, w, b }: HwbColor): RgbColor => {
    if (w + b >= 1) {
        const gray = w / (w + b);
        return { r: gray, g: gray, b: gray };
    }
    const rgbFromHue = hslToRgb({ h, s: 1, l: 0.5 });
    let r = rgbFromHue.r * (1 - w - b) + w;
    let g = rgbFromHue.g * (1 - w - b) + w;
    let bl = rgbFromHue.b * (1 - w - b) + w;
    return { r, g, b: bl };
};

// --- RGB <-> CMYK ---
export const rgbToCmyk = ({ r, g, b }: RgbColor): CmykColor => {
    const k = 1 - Math.max(r, g, b);
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 1 };
    }
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);
    return { c, m, y, k };
};

export const cmykToRgb = ({ c, m, y, k }: CmykColor): RgbColor => {
    const r = (1 - c) * (1 - k);
    const g = (1 - m) * (1 - k);
    const b = (1 - y) * (1 - k);
    return { r, g, b };
};


// --- OKLCH <-> Other Models ---
export const oklchToRgb = (color: OklchColor): RgbColor => {
  const linearRgb = oklchToLinearSrgb(color);
  return {
    r: linearSrgbToSrgb(clamp(linearRgb.r, 0, 1)),
    g: linearSrgbToSrgb(clamp(linearRgb.g, 0, 1)),
    b: linearSrgbToSrgb(clamp(linearRgb.b, 0, 1)),
  };
};

export const oklchToHsl = (color: OklchColor): HslColor => rgbToHsl(oklchToRgb(color));
export const oklchToHsb = (color: OklchColor): HsbColor => rgbToHsb(oklchToRgb(color));
export const oklchToHwb = (color: OklchColor): HwbColor => rgbToHwb(oklchToRgb(color));
export const oklchToCmyk = (color: OklchColor): CmykColor => rgbToCmyk(oklchToRgb(color));
export const oklchToOklab = ({ l, c, h }: OklchColor): OklabColor => {
  const hRad = h * (Math.PI / 180);
  return {
    l: l,
    a: c * Math.cos(hRad),
    b: c * Math.sin(hRad),
  };
};

// D65 reference white for XYZ
const D65 = { X: 95.047, Y: 100.0, Z: 108.883 };

// Linear sRGB -> XYZ
const linearSrgbToXyz = ({ r, g, b }: RgbColor): XyzColor => {
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
    return {
        x: x * 100,
        y: y * 100,
        z: z * 100,
    };
};

// XYZ -> CIELAB
const xyzToLab = ({ x, y, z }: XyzColor): LabColor => {
    const f = (t: number): number => {
        const d = 6 / 29;
        if (t > d * d * d) {
            return Math.cbrt(t);
        }
        return t / (3 * d * d) + 4 / 29;
    };
    
    const fx = f(x / D65.X);
    const fy = f(y / D65.Y);
    const fz = f(z / D65.Z);

    return {
        l: 116 * fy - 16,
        a: 500 * (fx - fy),
        b: 200 * (fy - fz),
    };
};

// CIELAB -> CIELCH
const labToLch = ({ l, a, b }: LabColor): LchColor => {
    const c = Math.sqrt(a * a + b * b);
    let h = Math.atan2(b, a) * (180 / Math.PI);
    if (h < 0) {
        h += 360;
    }
    return { l, c, h };
};

export const oklchToXyz = (color: OklchColor): XyzColor => {
    const linearRgb = oklchToLinearSrgb(color);
    return linearSrgbToXyz(linearRgb);
};

export const oklchToLab = (color: OklchColor): LabColor => {
    const xyz = oklchToXyz(color);
    return xyzToLab(xyz);
};

export const oklchToLch = (color: OklchColor): LchColor => {
    const lab = oklchToLab(color);
    return labToLch(lab);
};

// --- Other Models -> OKLCH ---
export const rgbToOklch = (rgb: RgbColor): OklchColor => {
    const r_linear = srgbToLinearSrgb(rgb.r);
    const g_linear = srgbToLinearSrgb(rgb.g);
    const b_linear = srgbToLinearSrgb(rgb.b);

    const l = 0.4122214708 * r_linear + 0.5363325363 * g_linear + 0.0514459929 * b_linear;
    const m = 0.2119034982 * r_linear + 0.6806995451 * g_linear + 0.1073969566 * b_linear;
    const s = 0.0883024619 * r_linear + 0.2817188376 * g_linear + 0.6299787005 * b_linear;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    const l_ok = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const a_ok = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const b_ok = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    const c = Math.sqrt(a_ok * a_ok + b_ok * b_ok);
    let h = Math.atan2(b_ok, a_ok) * (180 / Math.PI);
    if (h < 0) {
        h += 360;
    }

    return { l: l_ok, c, h };
};

export const hslToOklch = (hsl: HslColor): OklchColor => rgbToOklch(hslToRgb(hsl));
export const hsbToOklch = (hsb: HsbColor): OklchColor => rgbToOklch(hsbToRgb(hsb));
export const hwbToOklch = (hwb: HwbColor): OklchColor => rgbToOklch(hwbToRgb(hwb));
export const cmykToOklch = (cmyk: CmykColor): OklchColor => rgbToOklch(cmykToRgb(cmyk));

export const hexToOklch = (hex: string): OklchColor | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return rgbToOklch(rgb);
};

// --- String Formatters ---
export const formatRgbString = (rgb: RgbColor): string => `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;
export const formatHslString = (hsl: HslColor): string => `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
export const formatHsbString = (hsb: HsbColor): string => `hsb(${Math.round(hsb.h)}, ${Math.round(hsb.s * 100)}%, ${Math.round(hsb.b * 100)}%)`;
export const formatHwbString = (hwb: HwbColor): string => `hwb(${Math.round(hwb.h)}, ${Math.round(hwb.w * 100)}%, ${Math.round(hwb.b * 100)}%)`;
export const formatCmykString = (cmyk: CmykColor): string => `cmyk(${Math.round(cmyk.c * 100)}%, ${Math.round(cmyk.m * 100)}%, ${Math.round(cmyk.y * 100)}%, ${Math.round(cmyk.k * 100)}%)`;
export const formatNcolString = (ncol: HwbColor): string => `ncol(${Math.round(ncol.h)}, ${Math.round(ncol.w * 100)}%, ${Math.round(ncol.b * 100)}%)`;
export const formatXyzString = (xyz: XyzColor): string => `xyz(${xyz.x.toFixed(2)}, ${xyz.y.toFixed(2)}, ${xyz.z.toFixed(2)})`;
export const formatLabString = (lab: LabColor): string => `lab(${lab.l.toFixed(2)}, ${lab.a.toFixed(2)}, ${lab.b.toFixed(2)})`;
export const formatLchString = (lch: LchColor): string => `lch(${lch.l.toFixed(2)}, ${lch.c.toFixed(2)}, ${lch.h.toFixed(2)})`;
export const formatOklabString = (oklab: OklabColor): string => `oklab(${oklab.l.toFixed(5)}, ${oklab.a.toFixed(5)}, ${oklab.b.toFixed(5)})`;

// --- Wide Gamut & color() Conversions ---

const XYZ_TO_DISPLAY_P3_MATRIX = [
    [2.49349691, -0.93138361, -0.40370184],
    [-0.82948897, 1.76266406, 0.02362468],
    [0.03584583, -0.07617239, 0.95688452]
];
const XYZ_TO_A98_RGB_MATRIX = [
    [2.5843494, -0.9754966, -0.4496903],
    [-0.9169683, 1.8860641, 0.0401491],
    [0.0706859, -0.1287493, 1.0427926]
];
const XYZ_TO_PROPHOTO_RGB_MATRIX = [
    [1.82110493, -0.61331238, -0.19820129],
    [-0.22891538, 1.15388945, 0.03816503],
    [0.02693891, -0.07687948, 1.12155639]
];
const XYZ_TO_REC2020_MATRIX = [
    [1.71665119, -0.66672434, -0.25336628],
    [-0.66803417, 1.61641508, 0.01576815],
    [0.01763986, -0.04277061, 0.94210312]
];

const xyzToLinearRgb = (xyz: XyzColor, matrix: number[][]): RgbColor => {
    const [x, y, z] = [xyz.x / 100, xyz.y / 100, xyz.z / 100];
    const r = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z;
    const g = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z;
    const b = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z;
    return { r, g, b };
};

const a98RgbTransfer = (c: number): number => c < 0 ? 0 : Math.pow(c, 1 / 2.2);
const prophotoRgbTransfer = (c: number): number => {
    if (c < 0) return 0;
    return c >= 0.001953125 ? Math.pow(c, 1 / 1.8) : 16 * c;
};
const rec2020Transfer = (c: number): number => {
    if (c < 0) return 0;
    const alpha = 1.09929682680944;
    const beta = 0.018053968510807;
    return c < beta * 4.5 ? c * 4.5 : alpha * Math.pow(c, 0.45) - (alpha - 1);
};

export const oklchToDisplayP3 = (c: OklchColor): DisplayP3Color => {
    const linear = xyzToLinearRgb(oklchToXyz(c), XYZ_TO_DISPLAY_P3_MATRIX);
    return { r: linearSrgbToSrgb(linear.r), g: linearSrgbToSrgb(linear.g), b: linearSrgbToSrgb(linear.b) };
};
export const oklchToA98Rgb = (c: OklchColor): A98RgbColor => {
    const linear = xyzToLinearRgb(oklchToXyz(c), XYZ_TO_A98_RGB_MATRIX);
    return { r: a98RgbTransfer(linear.r), g: a98RgbTransfer(linear.g), b: a98RgbTransfer(linear.b) };
};
export const oklchToProphotoRgb = (c: OklchColor): ProphotoRgbColor => {
    const linear = xyzToLinearRgb(oklchToXyz(c), XYZ_TO_PROPHOTO_RGB_MATRIX);
    return { r: prophotoRgbTransfer(linear.r), g: prophotoRgbTransfer(linear.g), b: prophotoRgbTransfer(linear.b) };
};
export const oklchToRec2020 = (c: OklchColor): Rec2020Color => {
    const linear = xyzToLinearRgb(oklchToXyz(c), XYZ_TO_REC2020_MATRIX);
    return { r: rec2020Transfer(linear.r), g: rec2020Transfer(linear.g), b: rec2020Transfer(linear.b) };
};

// --- CSS-compliant formatters for export ---
export const formatRgbStringCss = (rgb: RgbColor): string => `rgb(${Math.round(rgb.r * 255)} ${Math.round(rgb.g * 255)} ${Math.round(rgb.b * 255)})`;
export const formatRgbaStringLegacy = (rgb: RgbColor): string => `rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, 1)`;
export const formatHslStringCss = (hsl: HslColor): string => `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s * 100)}% ${Math.round(hsl.l * 100)}%)`;
export const formatHslaStringLegacy = (hsl: HslColor): string => `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%, 1)`;
export const formatHsbStringCss = (hsb: HsbColor): string => `hsv(${Math.round(hsb.h)} ${Math.round(hsb.s * 100)}% ${Math.round(hsb.b * 100)}%)`;
export const formatHsbaStringLegacy = (hsb: HsbColor): string => `hsva(${Math.round(hsb.h)}, ${Math.round(hsb.s * 100)}%, ${Math.round(hsb.b * 100)}%, 1)`;
export const formatArgbStringLess = (color: OklchColor): string => `argb(${oklchToHex8(color)})`;
export const formatHwbStringCss = (hwb: HwbColor): string => `hwb(${Math.round(hwb.h)} ${Math.round(hwb.w * 100)}% ${Math.round(hwb.b * 100)}%)`;
export const formatLabStringCss = (lab: LabColor): string => `lab(${lab.l.toFixed(2)} ${lab.a.toFixed(2)} ${lab.b.toFixed(2)})`;
export const formatLchStringCss = (lch: LchColor): string => `lch(${lch.l.toFixed(2)} ${lch.c.toFixed(2)} ${lch.h.toFixed(2)})`;
export const formatOklabStringCss = (oklab: OklabColor): string => `oklab(${oklab.l.toFixed(5)} ${oklab.a.toFixed(5)} ${oklab.b.toFixed(5)})`;
export const formatOklchStringCss = (oklch: OklchColor): string => `oklch(${oklch.l.toFixed(5)} ${oklch.c.toFixed(5)} ${oklch.h.toFixed(2)})`;
export const formatDeviceCmykStringCss = (cmyk: CmykColor): string => `device-cmyk(${cmyk.c.toFixed(4)} ${cmyk.m.toFixed(4)} ${cmyk.y.toFixed(4)} ${cmyk.k.toFixed(4)})`;

// CSS color() function formatters
const formatColorFunc = (space: string, vals: { v1: number, v2: number, v3: number }, p: number = 4) => `color(${space} ${vals.v1.toFixed(p)} ${vals.v2.toFixed(p)} ${vals.v3.toFixed(p)})`;

export const formatDisplayP3StringCss = (p3: DisplayP3Color): string => formatColorFunc('display-p3', { v1: p3.r, v2: p3.g, v3: p3.b });
export const formatA98RgbStringCss = (a98: A98RgbColor): string => formatColorFunc('a98-rgb', { v1: a98.r, v2: a98.g, v3: a98.b });
export const formatProphotoRgbStringCss = (prophoto: ProphotoRgbColor): string => formatColorFunc('prophoto-rgb', { v1: prophoto.r, v2: prophoto.g, v3: prophoto.b });
export const formatRec2020StringCss = (rec2020: Rec2020Color): string => formatColorFunc('rec2020', { v1: rec2020.r, v2: rec2020.g, v3: rec2020.b });
export const formatSrgbLinearStringCss = (rgb: RgbColor): string => formatColorFunc('srgb-linear', { v1: rgb.r, v2: rgb.g, v3: rgb.b });
export const formatXyzStringCss = (xyz: XyzColor): string => formatColorFunc('xyz-d65', { v1: xyz.x / 100, v2: xyz.y / 100, v3: xyz.z / 100 }, 5);

// --- String Parsers ---
export const parseRgbString = (str: string): RgbColor | null => {
    const match = str.match(/rgba?\((\d{1,3}),?\s*(\d{1,3}),?\s*(\d{1,3})/i);
    if (!match) return null;
    const [, r, g, b] = match.map(Number);
    if (r > 255 || g > 255 || b > 255) return null;
    return { r: r / 255, g: g / 255, b: b / 255 };
};

export const parseHslString = (str: string): HslColor | null => {
    const match = str.match(/hsla?\((\d{1,3}),?\s*(\d{1,3})%?,?\s*(\d{1,3})%?/i);
    if (!match) return null;
    const [, h, s, l] = match.map(Number);
    if (h > 360 || s > 100 || l > 100) return null;
    return { h, s: s / 100, l: l / 100 };
};

export const parseHsbString = (str: string): HsbColor | null => {
    const match = str.match(/(?:hsv|hsb)a?\((\d{1,3}),?\s*(\d{1,3})%?,?\s*(\d{1,3})%?/i);
    if (!match) return null;
    const [, h, s, b] = match.map(Number);
    if (h > 360 || s > 100 || b > 100) return null;
    return { h, s: s / 100, b: b / 100 };
};

export const parseHwbString = (str: string): HwbColor | null => {
    const match = str.match(/hwb\((\d{1,3}),?\s*(\d{1,3})%?,?\s*(\d{1,3})%?/i);
    if (!match) return null;
    const [, h, w, b] = match.map(Number);
    if (h > 360 || w > 100 || b > 100) return null;
    return { h, w: w / 100, b: b / 100 };
};

export const parseCmykString = (str: string): CmykColor | null => {
    const match = str.match(/cmyk\((\d{1,3})%?,?\s*(\d{1,3})%?,?\s*(\d{1,3})%?,?\s*(\d{1,3})%?/i);
    if (!match) return null;
    const [, c, m, y, k] = match.map(Number);
    if (c > 100 || m > 100 || y > 100 || k > 100) return null;
    return { c: c / 100, m: m / 100, y: y / 100, k: k / 100 };
};

export const parseNcolString = (str: string): HwbColor | null => {
    const match = str.match(/ncol\((\d{1,3}),\s*(\d{1,3})%?,\s*(\d{1,3})%?/i);
    if (!match) return null;
    const [, h, w, b] = match.map(Number);
    if (h > 360 || w > 100 || b > 100) return null;
    return { h, w: w / 100, b: b / 100 };
};

export const generateHarmony = (
    baseColor: OklchColor, 
    rule: HarmonyRule, 
    distance: number, 
    analogousAngle: number, 
    triadicAngle: number, 
    splitComplementaryAngle: number, 
    rectangularTetradicAngle: number,
    analogousColorCount: number,
    monochromaticColorCount: number,
    lightnessColorCount: number
): OklchColor[] => {
  const { l, c, h } = baseColor;
  const palette: OklchColor[] = [];

  const normalizeHue = (hue: number): number => (hue % 360 + 360) % 360;

  switch (rule) {
    case HarmonyRule.Complementary:
      palette.push(baseColor);
      palette.push({ l, c, h: normalizeHue(h + 180) });
      break;
    case HarmonyRule.Analogous:
      {
        const numSteps = (analogousColorCount - 1) / 2;
        for (let i = numSteps; i > 0; i--) {
          palette.push({ l, c, h: normalizeHue(h - i * analogousAngle) });
        }
        palette.push(baseColor);
        for (let i = 1; i <= numSteps; i++) {
          palette.push({ l, c, h: normalizeHue(h + i * analogousAngle) });
        }
      }
      break;
    case HarmonyRule.Triadic:
      palette.push(baseColor);
      palette.push({ l, c, h: normalizeHue(h + triadicAngle) });
      palette.push({ l, c, h: normalizeHue(h - triadicAngle) });
      break;
    case HarmonyRule.Tetradic:
      palette.push(baseColor);
      palette.push({ l, c, h: normalizeHue(h + 90) });
      palette.push({ l, c, h: normalizeHue(h + 180) });
      palette.push({ l, c, h: normalizeHue(h + 270) });
      break;
    case HarmonyRule.RectangularTetradic:
      palette.push(baseColor);
      palette.push({ l, c, h: normalizeHue(h + rectangularTetradicAngle) });
      palette.push({ l, c, h: normalizeHue(h + 180) });
      palette.push({ l, c, h: normalizeHue(h + 180 + rectangularTetradicAngle) });
      break;
    case HarmonyRule.SplitComplementary:
      palette.push(baseColor);
      palette.push({ l, c, h: normalizeHue(h + 180 - splitComplementaryAngle) });
      palette.push({ l, c, h: normalizeHue(h + 180 + splitComplementaryAngle) });
      break;
    case HarmonyRule.Monochromatic:
        {
            const numLighter = Math.floor((monochromaticColorCount - 1) / 2);
            const numDarker = Math.ceil((monochromaticColorCount - 1) / 2);
            const cStep = distance / 4;

            // Lighter shades
            for (let i = numLighter; i > 0; i--) {
                palette.push({ l: clamp(l + i * distance, 0, 1), c: clamp(c - i * cStep, 0, 0.4), h });
            }
            
            palette.push(baseColor);

            // Darker shades
            for (let i = 1; i <= numDarker; i++) {
                palette.push({ l: clamp(l - i * distance, 0, 1), c: clamp(c + i * cStep, 0, 0.4), h });
            }
        }
        break;
    case HarmonyRule.Lightness:
        {
            const numDarker = Math.floor((lightnessColorCount - 1) / 2);
            const numLighter = Math.ceil((lightnessColorCount - 1) / 2);

            // Darker shades
            for (let i = numDarker; i > 0; i--) {
                palette.push({ l: clamp(l - i * distance, 0, 1), c, h });
            }
            palette.push(baseColor);
            // Lighter shades
            for (let i = 1; i <= numLighter; i++) {
                palette.push({ l: clamp(l + i * distance, 0, 1), c, h });
            }
        }
        break;
    default:
      palette.push(baseColor);
  }

  return palette;
};

export const simulateVisionDeficiency = (rgb: RgbColor, deficiency: VisionDeficiency): RgbColor => {
    if (deficiency === VisionDeficiency.Normal) {
        return rgb;
    }

    const linearRgb = {
        r: srgbToLinearSrgb(rgb.r),
        g: srgbToLinearSrgb(rgb.g),
        b: srgbToLinearSrgb(rgb.b),
    };
    
    let simLinearRgb: RgbColor;

    const anomalyInterpolation = (original: RgbColor, simulated: RgbColor, severity: number = 0.6): RgbColor => ({
        r: (1 - severity) * original.r + severity * simulated.r,
        g: (1 - severity) * original.g + severity * simulated.g,
        b: (1 - severity) * original.b + severity * simulated.b,
    });

    const protanopiaSim = (c: RgbColor): RgbColor => ({
        r: 0.56667 * c.r + 0.43333 * c.g + 0.00000 * c.b,
        g: 0.55833 * c.r + 0.44167 * c.g + 0.00000 * c.b,
        b: 0.00000 * c.r + 0.24167 * c.g + 0.75833 * c.b,
    });
    
    const deuteranopiaSim = (c: RgbColor): RgbColor => ({
        r: 0.62500 * c.r + 0.37500 * c.g + 0.00000 * c.b,
        g: 0.70000 * c.r + 0.30000 * c.g + 0.00000 * c.b,
        b: 0.00000 * c.r + 0.30000 * c.g + 0.70000 * c.b,
    });

    const tritanopiaSim = (c: RgbColor): RgbColor => ({
        r: 0.95000 * c.r + 0.05000 * c.g + 0.00000 * c.b,
        g: 0.00000 * c.r + 0.43333 * c.g + 0.56667 * c.b,
        b: 0.00000 * c.r + 0.47500 * c.g + 0.52500 * c.b,
    });
    
    switch (deficiency) {
        case VisionDeficiency.Protanopia:
            simLinearRgb = protanopiaSim(linearRgb);
            break;
        case VisionDeficiency.Protanomaly:
            simLinearRgb = anomalyInterpolation(linearRgb, protanopiaSim(linearRgb));
            break;
        case VisionDeficiency.Deuteranopia:
            simLinearRgb = deuteranopiaSim(linearRgb);
            break;
        case VisionDeficiency.Deuteranomaly:
            simLinearRgb = anomalyInterpolation(linearRgb, deuteranopiaSim(linearRgb));
            break;
        case VisionDeficiency.Tritanopia:
            simLinearRgb = tritanopiaSim(linearRgb);
            break;
        case VisionDeficiency.Tritanomaly:
            simLinearRgb = anomalyInterpolation(linearRgb, tritanopiaSim(linearRgb));
            break;
        case VisionDeficiency.Achromatopsia: {
            const gray = 0.2126 * linearRgb.r + 0.7152 * linearRgb.g + 0.0722 * linearRgb.b;
            simLinearRgb = { r: gray, g: gray, b: gray };
            break;
        }
        case VisionDeficiency.Dyschromatopsia: {
            const r = linearRgb.r;
            const g = linearRgb.g;
            const b = linearRgb.b;
            simLinearRgb = {
                r: 0.8 * r + 0.15 * g + 0.05 * b,
                g: 0.1 * r + 0.8 * g + 0.1 * b,
                b: 0.05 * r + 0.15 * g + 0.8 * b,
            };
            break;
        }
        default:
            simLinearRgb = linearRgb;
            break;
    }

    return {
        r: linearSrgbToSrgb(clamp(simLinearRgb.r, 0, 1)),
        g: linearSrgbToSrgb(clamp(simLinearRgb.g, 0, 1)),
        b: linearSrgbToSrgb(clamp(simLinearRgb.b, 0, 1)),
    };
};

export const generateRandomOklch = (): OklchColor => ({
    l: Math.random() * 0.7 + 0.15, // range 0.15 - 0.85
    c: Math.random() * 0.18 + 0.05, // range 0.05 - 0.23
    h: Math.random() * 360,
});

export const generateShades = (baseColor: OklchColor, count: number = 10) => {
    const { l, c, h } = baseColor;
    const tints: OklchColor[] = [];
    const shades: OklchColor[] = [];
    const tones: OklchColor[] = [];

    // Tints (mixing with white -> increasing lightness)
    for (let i = 1; i <= count; i++) {
        const newL = l + (1 - l) * (i / (count + 1));
        tints.push({ l: clamp(newL, 0, 1), c, h });
    }

    // Shades (mixing with black -> decreasing lightness)
    for (let i = 1; i <= count; i++) {
        const newL = l * (1 - (i / (count + 1)));
        shades.push({ l: clamp(newL, 0, 1), c, h });
    }

    // Tones (mixing with gray -> decreasing chroma)
    for (let i = 1; i <= count; i++) {
        const newC = c * (1 - (i / (count + 1)));
        tones.push({ l, c: clamp(newC, 0, 0.4), h });
    }

    return { tints, shades, tones };
};

const getRelativeLuminance = (rgb: RgbColor): number => {
    const { r, g, b } = rgb;
    const r_linear = srgbToLinearSrgb(r);
    const g_linear = srgbToLinearSrgb(g);
    const b_linear = srgbToLinearSrgb(b);
    return 0.2126 * r_linear + 0.7152 * g_linear + 0.0722 * b_linear;
};

export const calculateContrastRatio = (rgb1: RgbColor, rgb2: RgbColor): number => {
    const lum1 = getRelativeLuminance(rgb1);
    const lum2 = getRelativeLuminance(rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
};