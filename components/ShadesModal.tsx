
import React, { useState } from 'react';
import { OklchColor } from '../types';
import { generateShades, oklchToHex } from '../services/colorService';

interface ShadeSwatchProps {
  hex: string;
}

const ShadeSwatch: React.FC<ShadeSwatchProps> = ({ hex }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative text-center">
      <div
        className="w-full h-16 rounded-lg cursor-pointer border border-gray-200/80"
        style={{ backgroundColor: hex }}
        onClick={handleCopy}
      />
      <p className="mt-1 text-xs text-gray-500 font-mono">{copied ? 'Copied!' : hex.toUpperCase()}</p>
    </div>
  );
};


interface ShadesModalProps {
  color: OklchColor;
  onClose: () => void;
}

const ShadesModal: React.FC<ShadesModalProps> = ({ color, onClose }) => {
  const { tints, shades, tones } = generateShades(color, 8);
  const baseHex = oklchToHex(color);

  return (
    <div 
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{backgroundColor: baseHex}}></div>
            <div>
                <h2 className="text-lg font-bold text-gray-800">Shade & Tone Generator</h2>
                <p className="text-sm text-gray-500 font-mono">Base Color: {baseHex.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </header>
        <main className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">Tints (Mixed with White)</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {tints.map(c => <ShadeSwatch key={`tint-${c.l}`} hex={oklchToHex(c)} />)}
              </div>
            </section>
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">Shades (Mixed with Black)</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {shades.map(c => <ShadeSwatch key={`shade-${c.l}`} hex={oklchToHex(c)} />)}
              </div>
            </section>
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">Tones (Mixed with Gray)</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {tones.map(c => <ShadeSwatch key={`tone-${c.c}`} hex={oklchToHex(c)} />)}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShadesModal;
