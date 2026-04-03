
import { HarmonyRule, HarmonyRuleDef, VisionDeficiency, VisionDeficiencyDef, PantoneSystem, PantoneSystemDef } from './types';

export const HARMONY_RULES: HarmonyRuleDef[] = [
  { id: HarmonyRule.Analogous, label: 'Analogous' },
  { id: HarmonyRule.Monochromatic, label: 'Monochromatic' },
  { id: HarmonyRule.Complementary, label: 'Complementary' },
  { id: HarmonyRule.SplitComplementary, label: 'Split complementary' },
  { id: HarmonyRule.Triadic, label: 'Triadic' },
  { id: HarmonyRule.RectangularTetradic, label: 'Tetradic' },
  { id: HarmonyRule.Tetradic, label: 'Square' },
  { id: HarmonyRule.Lightness, label: 'Lightness' },
];

export const VISION_DEFICIENCIES: VisionDeficiencyDef[] = [
  { id: VisionDeficiency.Normal, label: 'Normal Vision', description: 'No simulation applied' },
  { id: VisionDeficiency.Protanopia, label: 'Protanopia', description: 'Red-blind (difficulty with red/green)' },
  { id: VisionDeficiency.Protanomaly, label: 'Protanomaly', description: 'Red-weak (reds appear greener)' },
  { id: VisionDeficiency.Deuteranopia, label: 'Deuteranopia', description: 'Green-blind (difficulty with red/green)' },
  { id: VisionDeficiency.Deuteranomaly, label: 'Deuteranomaly', description: 'Green-weak (greens appear redder)' },
  { id: VisionDeficiency.Tritanopia, label: 'Tritanopia', description: 'Blue-blind (difficulty with blue/green & yellow/violet)' },
  { id: VisionDeficiency.Tritanomaly, label: 'Tritanomaly', description: 'Blue-weak (blue appears greener)' },
  { id: VisionDeficiency.Achromatopsia, label: 'Achromatopsia', description: 'Total color blindness (grayscale)' },
  { id: VisionDeficiency.Dyschromatopsia, label: 'Dyschromatopsia', description: 'Generic color confusion (e.g. blue/purple)' },
];

export const PANTONE_SYSTEMS: PantoneSystemDef[] = [
  { id: PantoneSystem.C, label: 'Coated (C)', description: 'For coated paper stock' },
  { id: PantoneSystem.U, label: 'Uncoated (U)', description: 'For uncoated paper stock' },
  { id: PantoneSystem.TCX, label: 'Cotton (TCX)', description: 'Fashion, Home + Interiors cotton' },
  { id: PantoneSystem.TPG, label: 'Paper Green (TPG)', description: 'Fashion, Home + Interiors paper' },
  { id: PantoneSystem.TPX, label: 'Paper eXtended (TPX)', description: 'Older FHI paper version' },
  { id: PantoneSystem.CP_UP, label: 'Process (CP/UP)', description: 'CMYK process colors' },
  { id: PantoneSystem.P, label: 'Plastics (P)', description: 'Plastics Opaque Selector' },
  { id: PantoneSystem.XGC, label: 'Extended Gamut (XGC)', description: '7-color process printing' },
  { id: PantoneSystem.C_8xxx, label: 'Metallics (8xxx C)', description: 'Premium metallic coated' },
  { id: PantoneSystem.C_10xxx, label: 'Pastels/Neons (10xxx C)', description: 'Coated pastels and neons' },
  { id: PantoneSystem.CU_9xxx, label: 'Pastels/Neons (9xxx C/U)', description: 'Coated/uncoated pastels & neons' },
  { id: PantoneSystem.Q_Prefix, label: 'Plastics (Q)', description: 'Plastics Transparent Selector' },
  { id: PantoneSystem.T_Prefix, label: 'Plastics (T)', description: 'Plastics Transparent Selector (older)' },
  { id: PantoneSystem.N, label: 'Nylon (N)', description: 'Nylon brights' },
  { id: PantoneSystem.WebSafe, label: 'Web Safe', description: '216 web-safe colors' },
];
