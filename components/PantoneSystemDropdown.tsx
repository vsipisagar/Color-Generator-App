import React, { useState, useRef, useEffect } from 'react';
import { PantoneSystem } from '../types';
import { PANTONE_SYSTEMS } from '../constants';

interface PantoneSystemDropdownProps {
  activeSystem: PantoneSystem | null;
  setActiveSystem: (system: PantoneSystem | null) => void;
}

const PantoneSystemDropdown: React.FC<PantoneSystemDropdownProps> = ({ activeSystem, setActiveSystem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSystemDef = PANTONE_SYSTEMS.find(def => def.id === activeSystem);

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

  const handleSelect = (sysId: PantoneSystem | null) => {
    setActiveSystem(sysId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-200/80 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <i className="ri-paint-brush-line text-lg"></i>
        <span className="font-medium">{activeSystemDef?.label || 'Simulate Pantone®'}</span>
        <i className={`ri-arrow-down-s-line text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`} style={{ transformOrigin: 'top left' }}>
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200/80 max-h-96 overflow-y-auto">
            <p className="p-3 text-xs text-gray-500 border-b border-gray-200/80">Select a Pantone system to simulate</p>
          <ul className="py-1">
             <li>
                <button
                  onClick={() => handleSelect(null)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-start justify-between transition-colors ${!activeSystem ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex-1 pr-2">
                    <p className={`font-medium ${!activeSystem ? 'text-indigo-700' : 'text-gray-800'}`}>Off</p>
                    <p className="text-xs text-gray-500">Disable Pantone simulation</p>
                  </div>
                  {!activeSystem && <i className="ri-check-line text-indigo-600 text-lg mt-0.5"></i>}
                </button>
              </li>
              <li className="border-t border-gray-200/80 my-1"></li>
            {PANTONE_SYSTEMS.map(def => (
              <li key={def.id}>
                <button
                  onClick={() => handleSelect(def.id)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-start justify-between transition-colors ${activeSystem === def.id ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex-1 pr-2">
                    <p className={`font-medium ${activeSystem === def.id ? 'text-indigo-700' : 'text-gray-800'}`}>{def.label}</p>
                    <p className="text-xs text-gray-500">{def.description}</p>
                  </div>
                  {activeSystem === def.id && <i className="ri-check-line text-indigo-600 text-lg mt-0.5"></i>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default PantoneSystemDropdown;