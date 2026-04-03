import React, { useState, useRef, useEffect } from 'react';
import { VisionDeficiency } from '../types';
import { VISION_DEFICIENCIES } from '../constants';

interface VisionSimulatorDropdownProps {
  visionDeficiency: VisionDeficiency;
  setVisionDeficiency: (deficiency: VisionDeficiency) => void;
}

const VisionSimulatorDropdown: React.FC<VisionSimulatorDropdownProps> = ({ visionDeficiency, setVisionDeficiency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeDeficiency = VISION_DEFICIENCIES.find(def => def.id === visionDeficiency);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (defId: VisionDeficiency) => {
    setVisionDeficiency(defId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative z-30 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-white border border-gray-200/80 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
            <i className="ri-eye-line text-lg"></i>
            <span className="font-medium">{activeDeficiency?.label || 'Normal Vision'}</span>
        </span>
        <i className={`ri-arrow-down-s-line text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`} style={{ transformOrigin: 'top' }}>
        <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200/80">
            <p className="p-3 text-xs text-gray-500 border-b border-gray-200/80">Select a vision deficiency to simulate</p>
          <ul className="py-1">
            {VISION_DEFICIENCIES.map(def => (
              <li key={def.id}>
                <button
                  onClick={() => handleSelect(def.id)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-start justify-between transition-colors ${visionDeficiency === def.id ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex-1 pr-2">
                    <p className={`font-medium ${visionDeficiency === def.id ? 'text-indigo-700' : 'text-gray-800'}`}>{def.label}</p>
                    <p className="text-xs text-gray-500">{def.description}</p>
                  </div>
                  {visionDeficiency === def.id && <i className="ri-check-line text-indigo-600 text-lg mt-0.5"></i>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default VisionSimulatorDropdown;