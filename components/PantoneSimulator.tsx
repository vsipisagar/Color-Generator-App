import React, { useMemo, useState } from 'react';
import { OklchColor, PantoneSystem } from '../types';
import { oklchToHex } from '../services/colorService';
import { PANTONE_SYSTEMS } from '../constants';

const generatePantoneCode = (system: PantoneSystem, color: OklchColor): string => {
  // Use a pseudo-random but deterministic function based on color properties to avoid changing codes on every re-render
  const rand = (min: number, max: number, seed: number) => {
    const a = Math.sin(seed) * 10000;
    const val = a - Math.floor(a);
    return Math.floor(val * (max - min + 1)) + min;
  };
  const seed = color.l * 100 + color.c * 1000 + color.h;

  switch (system) {
    case PantoneSystem.C:
    case PantoneSystem.U:
      return `PMS ${rand(100, 7770, seed)} ${system}`;
    case PantoneSystem.TCX:
      return `PANTONE ${rand(11, 19, seed)}-${rand(1000, 6340, seed)} TCX`;
    case PantoneSystem.TPG:
    case PantoneSystem.TPX:
      return `PANTONE ${rand(11, 19, seed)}-${rand(1000, 6340, seed)} ${system}`;
    case PantoneSystem.CP_UP:
      return `PANTONE P ${rand(1, 150, seed)}-${rand(1, 16, seed)} ${system === 'CP_UP' ? 'C' : 'U'}`;
    case PantoneSystem.P:
      return `PANTONE ${rand(100, 999, seed)} P`;
    case PantoneSystem.XGC:
      return `PANTONE XGC ${rand(100, 2000, seed)} C`;
    case PantoneSystem.C_8xxx:
      return `PANTONE ${rand(8001, 8965, seed)} C`;
    case PantoneSystem.C_10xxx:
      return `PANTONE ${rand(10101, 10399, seed)} C`;
    case PantoneSystem.CU_9xxx:
      return `PANTONE ${rand(9020, 9603, seed)} C`;
    case PantoneSystem.Q_Prefix:
      return `PANTONE Q${rand(100, 999, seed)}-${rand(1, 9, seed)}-${rand(1, 9, seed)}`;
    case PantoneSystem.T_Prefix:
      return `PANTONE T${rand(100, 999, seed)}-${rand(1, 9, seed)}-${rand(1, 9, seed)}`;
    case PantoneSystem.N:
      return `PANTONE ${rand(1, 21, seed)}-${rand(100, 999, seed)} N`;
    case PantoneSystem.WebSafe:
      {
        const r = Math.round(rand(0, 5, seed) * 51).toString(16).padStart(2, '0');
        const g = Math.round(rand(0, 5, seed * 2) * 51).toString(16).padStart(2, '0');
        const b = Math.round(rand(0, 5, seed * 3) * 51).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`.toUpperCase();
      }
    default:
      return `PANTONE ${rand(1000, 9999, seed)}`;
  }
};

const simulateColorMatch = (color: OklchColor): OklchColor => {
  const seed = color.l + color.c + color.h;
  const rand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  return {
    l: Math.max(0, Math.min(1, color.l + (rand(seed) - 0.5) * 0.03)),
    c: Math.max(0, Math.min(0.4, color.c + (rand(seed * 2) - 0.5) * 0.02)),
    h: (color.h + (rand(seed * 3) - 0.5) * 5 + 360) % 360,
  };
};

interface PantoneSimulatorProps {
    palette: OklchColor[];
    system: PantoneSystem;
}

const PantoneSimulator: React.FC<PantoneSimulatorProps> = ({ palette, system }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const systemLabel = useMemo(() => PANTONE_SYSTEMS.find(s => s.id === system)?.label || '', [system]);
  
  const simulatedData = useMemo(() => {
    return palette.map(color => {
      const seed = color.l + color.c + color.h;
      const simulatedColor = simulateColorMatch(color);
      const pantoneCode = generatePantoneCode(system, color);
      const deltaE = ((Math.sin(seed * 5) * 10000 % 1) * 2 + 0.5).toFixed(2);
      return {
        originalColor: color,
        simulatedColor,
        pantoneCode,
        deltaE
      };
    });
  }, [palette, system]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
        setCopiedCode(null);
    }, 2000);
  };

  const containerClass = palette.length > 5 ? 'grid grid-cols-1 lg:grid-cols-2 gap-2' : 'space-y-2';

  return (
    <div className="w-full">
        <div className="flex justify-between items-baseline gap-4 mb-4">
            <h3 className="text-base font-bold text-gray-800">
                Pantone® Simulation: <span className="text-indigo-600">{systemLabel}</span>
            </h3>
            <p className="text-xs text-gray-400 text-right flex-shrink-0">
                Disclaimer: This is a simulation for illustrative purposes. Pantone is a registered trademark of Pantone LLC. For accurate color matching, please refer to official Pantone publications.
            </p>
        </div>
      <div className={containerClass}>
        {simulatedData.map((data, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200/80 shadow-sm">
              {/* Original Color */}
              <div title={`Original: ${oklchToHex(data.originalColor).toUpperCase()}`} className="flex-shrink-0 w-12 h-12 rounded-md border border-gray-200" style={{ backgroundColor: oklchToHex(data.originalColor) }} />
              {/* Arrow */}
              <i className="ri-arrow-right-line text-2xl text-gray-400"></i>
              {/* Simulated Color */}
              <div title={`Match: ${oklchToHex(data.simulatedColor).toUpperCase()}`} className="flex-shrink-0 w-12 h-12 rounded-md border border-gray-200" style={{ backgroundColor: oklchToHex(data.simulatedColor) }} />
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-800">{data.pantoneCode}</p>
                    <button
                        onClick={() => handleCopy(data.pantoneCode)}
                        className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors duration-200 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={`Copy Pantone code ${data.pantoneCode}`}
                    >
                        {copiedCode === data.pantoneCode ? (
                            <i className="ri-check-line text-lg text-green-600"></i>
                        ) : (
                            <i className="ri-file-copy-line text-base"></i>
                        )}
                    </button>
                </div>
                <p className="font-mono text-xs text-gray-500">
                  Closest Match for {oklchToHex(data.originalColor).toUpperCase()}
                </p>
                <p className="font-mono text-xs text-indigo-500">
                  ΔE ≈ {data.deltaE}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PantoneSimulator;