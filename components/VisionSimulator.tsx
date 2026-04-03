import React from 'react';
import { OklchColor } from '../types';
import { VISION_DEFICIENCIES } from '../constants';
import { oklchToRgb, simulateVisionDeficiency, rgbToHex } from '../services/colorService';

interface VisionSimulatorProps {
  colors: OklchColor[];
}

const VisionSimulator: React.FC<VisionSimulatorProps> = ({ colors }) => {
  return (
    <aside className="p-6 bg-white rounded-2xl lg:h-[calc(100vh-4rem)] lg:overflow-y-auto border border-gray-200/80 shadow-sm">
      <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-1">Vision Simulation</h2>
      <p className="text-sm text-gray-500 mb-6">Preview palette under different color vision deficiencies.</p>
      <div className="flex flex-col gap-6">
        {VISION_DEFICIENCIES.map((def) => {
          const simulatedColors = colors.map(oklchColor => {
            const rgbColor = oklchToRgb(oklchColor);
            const simulatedRgb = simulateVisionDeficiency(rgbColor, def.id);
            return rgbToHex(simulatedRgb);
          });

          return (
            <div key={def.id}>
              <h3 className="font-semibold text-gray-800">{def.label}</h3>
              <p className="text-xs text-gray-500 mb-2">{def.description}</p>
              <div className="flex items-center gap-1">
                {simulatedColors.map((hex, index) => (
                  <div
                    key={`${def.id}-${index}-${hex}`}
                    className="w-full h-8 rounded-md border border-gray-200/80"
                    style={{ backgroundColor: hex }}
                    title={hex.toUpperCase()}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default VisionSimulator;
