
export interface OklchColor {
  l: number; // Lightness [0, 1]
  c: number; // Chroma [0, 0.4]
  h: number; // Hue [0, 360]
}

export interface RgbColor {
  r: number; // [0, 1]
  g: number; // [0, 1]
  b: number; // [0, 1]
}

export interface DisplayP3Color extends RgbColor {}
export interface A98RgbColor extends RgbColor {}
export interface ProphotoRgbColor extends RgbColor {}
export interface Rec2020Color extends RgbColor {}

export interface HslColor {
  h: number; // Hue [0, 360]
  s: number; // Saturation [0, 1]
  l: number; // Lightness [0, 1]
}

export interface HsbColor { // Also known as HSV
  h: number; // Hue [0, 360]
  s: number; // Saturation [0, 1]
  b: number; // Brightness/Value [0, 1]
}

export interface HwbColor {
  h: number; // Hue [0, 360]
  w: number; // Whiteness [0, 1]
  b: number; // Blackness [0, 1]
}

export interface CmykColor {
  c: number; // Cyan [0, 1]
  m: number; // Magenta [0, 1]
  y: number; // Yellow [0, 1]
  k: number; // Key (Black) [0, 1]
}

export interface XyzColor {
  x: number;
  y: number;
  z: number;
}

export interface LabColor {
  l: number;
  a: number;
  b: number;
}

export interface LchColor {
  l: number;
  c: number;
  h: number;
}

export interface OklabColor {
  l: number;
  a: number;
  b: number;
}


export enum ColorFormat {
  Hex = 'HEX',
  Rgb = 'RGB',
  Hsl = 'HSL',
  Hsb = 'HSB',
  Hwb = 'HWB',
  Cmyk = 'CMYK',
  Ncol = 'NCol',
}

export enum HarmonyRule {
  Complementary = 'COMPLEMENTARY',
  Analogous = 'ANALOGOUS',
  Triadic = 'TRIADIC',
  Tetradic = 'TETRADIC',
  SplitComplementary = 'SPLIT_COMPLEMENTARY',
  Monochromatic = 'MONOCHROMATIC',
  RectangularTetradic = 'RECTANGULAR_TETRADIC',
  Lightness = 'LIGHTNESS',
}

export interface HarmonyRuleDef {
  id: HarmonyRule;
  label: string;
}

export enum VisionDeficiency {
  Normal = 'NORMAL',
  Protanopia = 'PROTANOPIA',
  Protanomaly = 'PROTANOMALY',
  Deuteranopia = 'DEUTERANOPIA',
  Deuteranomaly = 'DEUTERANOMALY',
  Tritanopia = 'TRITANOPIA',
  Tritanomaly = 'TRITANOMALY',
  Achromatopsia = 'ACHROMATOPIA',
  Dyschromatopsia = 'DYSCHROMATPSIA',
}

export interface VisionDeficiencyDef {
  id: VisionDeficiency;
  label: string;
  description: string;
}

export enum PantoneSystem {
  C = 'C',
  U = 'U',
  TCX = 'TCX',
  TPG = 'TPG',
  TPX = 'TPX',
  CP_UP = 'CP_UP',
  P = 'P',
  XGC = 'XGC',
  C_8xxx = 'C_8xxx',
  C_10xxx = 'C_10xxx',
  CU_9xxx = 'CU_9xxx',
  Q_Prefix = 'Q_Prefix',
  T_Prefix = 'T_Prefix',
  N = 'N',
  WebSafe = 'WebSafe'
}

export interface PantoneSystemDef {
  id: PantoneSystem;
  label: string;
  description: string;
}


export interface Folder {
  id: string;
  name: string;
}

export interface SavedPalette {
  name: string;
  palette: OklchColor[];
  folderId?: string;
}

export interface SamplePoint {
  x: number; // 0-1 percentage
  y: number; // 0-1 percentage
}

export interface HistoryState {
  baseColor: OklchColor;
  harmonyRule: HarmonyRule;
  harmonyDistance: number;
  analogousAngle: number;
  triadicAngle: number;
  splitComplementaryAngle: number;
  rectangularTetradicAngle: number;
  analogousColorCount: number;
  monochromaticColorCount: number;
  lightnessColorCount: number;
  imagePalette: OklchColor[];
  samplePoints: SamplePoint[];
  numImageColors: number;
  editorPalette: OklchColor[];
  lockedColors: boolean[];
}
