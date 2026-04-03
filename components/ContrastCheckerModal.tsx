
import React, { useState, useMemo, useEffect } from 'react';
import { OklchColor } from '../types';
import { calculateContrastRatio, hexToOklch, oklchToHex, oklchToRgb } from '../services/colorService';

interface ComplianceRowProps {
    label: string;
    ratio: number;
    threshold: number;
}

const ComplianceRow: React.FC<ComplianceRowProps> = ({ label, ratio, threshold }) => {
    const pass = ratio >= threshold;
    return (
        <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md">
            <span className="text-gray-600">{label}</span>
            <div className={`flex items-center gap-2 font-semibold ${pass ? 'text-green-600' : 'text-red-600'}`}>
                <span>{pass ? 'Pass' : 'Fail'}</span>
                <i className={`ri-${pass ? 'check' : 'close'}-line text-lg`}></i>
            </div>
        </div>
    );
};

interface ContrastCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: OklchColor[];
  initialColor: OklchColor | null;
}

const ContrastCheckerModal: React.FC<ContrastCheckerModalProps> = ({ isOpen, onClose, initialColor }) => {
    const [textColorHex, setTextColorHex] = useState('#FFFFFF');
    const [bgColorHex, setBgColorHex] = useState('#4F46E5');

    useEffect(() => {
        if (isOpen && initialColor) {
            const initialHex = oklchToHex(initialColor);
            setBgColorHex(initialHex);
            
            if (initialColor.l < 0.55) {
                setTextColorHex('#FFFFFF');
            } else {
                setTextColorHex('#000000');
            }
        }
    }, [isOpen, initialColor]);

    const liveContrastRatio = useMemo(() => {
        const bgOklch = hexToOklch(bgColorHex);
        const textOklch = hexToOklch(textColorHex);
        if (!bgOklch || !textOklch) return 1;
        return calculateContrastRatio(oklchToRgb(textOklch), oklchToRgb(bgOklch));
    }, [textColorHex, bgColorHex]);

    const whiteOklch = useMemo(() => hexToOklch('#FFFFFF'), []);
    const blackOklch = useMemo(() => hexToOklch('#000000'), []);

    const whiteTextContrastRatio = useMemo(() => {
        const bgOklch = hexToOklch(bgColorHex);
        if (!bgOklch || !whiteOklch) return 1;
        return calculateContrastRatio(oklchToRgb(whiteOklch), oklchToRgb(bgOklch));
    }, [bgColorHex, whiteOklch]);
    
    const blackTextContrastRatio = useMemo(() => {
        const bgOklch = hexToOklch(bgColorHex);
        if (!bgOklch || !blackOklch) return 1;
        return calculateContrastRatio(oklchToRgb(blackOklch), oklchToRgb(bgOklch));
    }, [bgColorHex, blackOklch]);

    const handleSwap = () => {
        const temp = textColorHex;
        setTextColorHex(bgColorHex);
        setBgColorHex(temp);
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Accessibility Contrast Checker</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </header>
                <main className="grid grid-cols-1 md:grid-cols-2 gap-x-8 p-6 overflow-y-auto">
                    {/* Left Column: Controls */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Text Color</label>
                                <input type="text" value={textColorHex} onChange={e => setTextColorHex(e.target.value.trim())} className="w-full mt-1 bg-gray-100 border-2 border-gray-200 rounded-lg pl-4 pr-3 py-2 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
                            </div>
                            <button onClick={handleSwap} className="h-11 w-11 flex items-center justify-center text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-100 border-2 border-gray-200 rounded-lg transition-colors duration-200" aria-label="Swap text and background colors">
                                <i className="ri-swap-line text-2xl"></i>
                            </button>
                             <div>
                                <label className="text-sm font-medium text-gray-600">Background Color</label>
                                <input type="text" value={bgColorHex} onChange={e => setBgColorHex(e.target.value.trim())} className="w-full mt-1 bg-gray-100 border-2 border-gray-200 rounded-lg pl-4 pr-3 py-2 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Previews */}
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-base font-semibold text-gray-700 mb-2">Live Preview</h3>
                            <div className="relative w-full p-6 rounded-lg overflow-hidden" style={{ backgroundColor: bgColorHex, color: textColorHex }}>
                                <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-lg p-2 text-white text-center">
                                    <p className="text-2xl font-bold font-mono">{liveContrastRatio.toFixed(2)}</p>
                                    <p className="text-xs font-mono">Ratio</p>
                                </div>
                                <h4 className="text-3xl font-bold">Large Text (24px)</h4>
                                <p className="mt-2 text-lg">Normal Text (18px)</p>
                                <p className="mt-2 text-base">Body text and <b className="font-bold">bold text</b> are important for readability.</p>
                                <p className="mt-4 text-7xl font-bold opacity-20 absolute bottom-0 right-4 -mb-4">Aa</p>
                            </div>
                            <div className="mt-3 bg-gray-50 border border-gray-200/80 rounded-lg p-2 space-y-1">
                                <h4 className="text-sm font-semibold text-gray-800 px-2 pb-1">WCAG Compliance</h4>
                                <ComplianceRow label="UI / Large Text (AA)" ratio={liveContrastRatio} threshold={3} />
                                <ComplianceRow label="Normal Text (AA)" ratio={liveContrastRatio} threshold={4.5} />
                                <ComplianceRow label="Large Text (AAA)" ratio={liveContrastRatio} threshold={4.5} />
                                <ComplianceRow label="Normal Text (AAA)" ratio={liveContrastRatio} threshold={7} />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-base font-semibold text-gray-700 mb-2">Default Previews</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/80 space-y-2">
                                    <div className="w-full h-20 rounded-md flex items-center justify-center text-4xl font-bold" style={{ backgroundColor: bgColorHex, color: '#FFFFFF' }}>Aa</div>
                                    <div className="mt-2 text-center">
                                        <p className="text-sm font-medium text-gray-800">{whiteTextContrastRatio.toFixed(2)}:1</p>
                                        <p className="text-xs text-gray-500">vs White Text</p>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 space-y-1">
                                        <ComplianceRow label="UI/Large (AA)" ratio={whiteTextContrastRatio} threshold={3} />
                                        <ComplianceRow label="Normal (AA)" ratio={whiteTextContrastRatio} threshold={4.5} />
                                        <ComplianceRow label="Large (AAA)" ratio={whiteTextContrastRatio} threshold={4.5} />
                                        <ComplianceRow label="Normal (AAA)" ratio={whiteTextContrastRatio} threshold={7} />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/80 space-y-2">
                                    <div className="w-full h-20 rounded-md flex items-center justify-center text-4xl font-bold" style={{ backgroundColor: bgColorHex, color: '#000000' }}>Aa</div>
                                    <div className="mt-2 text-center">
                                        <p className="text-sm font-medium text-gray-800">{blackTextContrastRatio.toFixed(2)}:1</p>
                                        <p className="text-xs text-gray-500">vs Black Text</p>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 space-y-1">
                                        <ComplianceRow label="UI/Large (AA)" ratio={blackTextContrastRatio} threshold={3} />
                                        <ComplianceRow label="Normal (AA)" ratio={blackTextContrastRatio} threshold={4.5} />
                                        <ComplianceRow label="Large (AAA)" ratio={blackTextContrastRatio} threshold={4.5} />
                                        <ComplianceRow label="Normal (AAA)" ratio={blackTextContrastRatio} threshold={7} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ContrastCheckerModal;
