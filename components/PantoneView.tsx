import React, { useState } from 'react';
import { OklchColor, PantoneSystem } from '../types';
import { PANTONE_SYSTEMS } from '../constants';
import PantoneSimulator from './PantoneSimulator';

interface PantoneViewProps {
  palette: OklchColor[];
  onBack: () => void;
  onExport: (palette: OklchColor[]) => void;
  onSave: () => void;
}

const PantoneView: React.FC<PantoneViewProps> = ({ palette, onBack, onExport, onSave }) => {
  const [system, setSystem] = useState<PantoneSystem>(PantoneSystem.C); // Default to Coated

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 w-full h-full flex flex-col">
      <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors" aria-label="Go back">
                <i className="ri-arrow-left-line text-2xl"></i>
            </button>
            <h2 className="text-lg font-bold text-gray-800">Pantone® Simulation</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onExport(palette)} className="flex items-center px-3 py-1.5 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
            <i className="ri-download-2-line mr-2"></i>
            Export
          </button>
          <button onClick={onSave} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            <i className="ri-save-line mr-2"></i>
            Save
          </button>
        </div>
      </header>
      <main className="flex-1 flex min-h-0">
        {/* System Selection Column */}
        <aside className="w-72 p-4 border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <h3 className="px-2 text-sm font-bold text-gray-800 mb-2">Select Pantone System</h3>
          <ul className="flex flex-col gap-1">
            {PANTONE_SYSTEMS.map(def => (
              <li key={def.id}>
                <button
                  onClick={() => setSystem(def.id)}
                  className={`w-full text-left p-2 text-sm rounded-md transition-colors ${system === def.id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                >
                  <p className={`font-medium ${system === def.id ? 'text-indigo-700' : 'text-gray-800'}`}>{def.label}</p>
                  <p className="text-xs text-gray-500">{def.description}</p>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        
        {/* Simulation Preview Column */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/70">
            <PantoneSimulator palette={palette} system={system} />
        </div>
      </main>
    </div>
  );
};

export default PantoneView;