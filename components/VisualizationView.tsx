import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { OklchColor } from '../types';
import { oklchToHex } from '../services/colorService';
import DashboardVisualization from './DashboardVisualization';
import InfographicVisualization from './InfographicVisualization';

const VIZ_TYPES = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { id: 'illustration', label: 'Illustration', icon: 'ri-quill-pen-line' },
    { id: 'pattern', label: 'Pattern', icon: 'ri-layout-grid-line' },
    { id: 'mobile-dashboard', label: 'Mobile UI', icon: 'ri-smartphone-line' },
    { id: 'infographic', label: 'Infographic', icon: 'ri-bar-chart-horizontal-line' },
    { id: 'map', label: 'Map / Choropleth', icon: 'ri-map-pin-line' },
    { id: 'data-visualization', label: 'Data Visualization', icon: 'ri-pie-chart-2-line' },
];

const addAlpha = (hex: string, alphaHex: string): string => {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return hex;
    const hexVal = hex.startsWith('#') ? hex.slice(1) : hex;
    if (hexVal.length === 3) {
        return `#${hexVal.split('').map(c => c + c).join('')}${alphaHex}`;
    }
    if (hexVal.length === 6) {
        return `#${hexVal}${alphaHex}`;
    }
    return hex;
};

const MobileAppVisualization: React.FC<{ colors: string[] }> = ({ colors }) => {
    const fullPalette = useMemo(() => Array.from({ length: 6 }, (_, i) => {
        if (!colors || colors.length === 0) {
            const defaults = ['#4F46E5', '#10B981', '#EC4899', '#EF4444', '#F59E0B', '#8B5CF6']; // primary, accent1, accent2, red, yellow, purple
            return defaults[i];
        }
        return colors[i % colors.length];
    }), [colors]);

    const [primary, accent1, accent2, red, yellow, purple] = fullPalette;

    const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
        if (!hex) return null;
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const shadowRgb = useMemo(() => hexToRgb(purple), [purple]);
    
    const boxShadowStyle = useMemo(() => {
        return shadowRgb
            ? `0 10px 15px -3px rgba(${shadowRgb.r}, ${shadowRgb.g}, ${shadowRgb.b}, 0.4), 0 4px 6px -2px rgba(${shadowRgb.r}, ${shadowRgb.g}, ${shadowRgb.b}, 0.2)`
            : `0 10px 15px -3px rgba(109, 40, 217, 0.4), 0 4px 6px -2px rgba(109, 40, 217, 0.2)`;
    }, [shadowRgb]);


    const dynamicKeyframes = `
        @keyframes pulse-fill {
            0%, 100% { height: 10%; } 20% { height: 70%; } 40% { height: 30%; } 60% { height: 90%; } 80% { height: 50%; }
        }
        .chart-bar { animation: pulse-fill 4s ease-in-out infinite alternate; }
        .chart-bar:nth-child(2) { animation-delay: 0.2s; height: 50%; }
        .chart-bar:nth-child(3) { animation-delay: 0.4s; height: 20%; }
        .chart-bar:nth-child(4) { animation-delay: 0.6s; height: 60%; }
        .chart-bar:nth-child(5) { animation-delay: 0.8s; height: 40%; }
        .chart-bar:nth-child(6) { animation-delay: 1.0s; height: 80%; }
        .chart-bar:nth-child(7) { animation-delay: 1.2s; height: 15%; }
    `;

    return (
        <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl p-2.5 border-4 border-gray-800 relative flex-shrink-0">
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
            <div className="w-full h-full rounded-[30px] overflow-y-auto">
                <style>{dynamicKeyframes}</style>
                 <div className="max-w-md mx-auto bg-white shadow-xl min-h-full flex flex-col font-sans">

                    <header className="p-5 flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white z-10">
                        <h1 className="text-xl font-bold text-gray-900">My Wallet</h1>
                        <button className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md" style={{ backgroundColor: accent1 }}>
                            <span className="font-semibold text-sm">JS</span>
                        </button>
                    </header>

                    <main className="flex-grow p-4 space-y-6 bg-gray-50">

                        <div className="text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden" style={{ backgroundImage: `linear-gradient(135deg, ${primary} 0%, ${purple} 50%, ${accent2} 100%)`, boxShadow: boxShadowStyle}}>
                            <div className="absolute inset-0 opacity-10">
                                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100">
                                    <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="80" cy="50" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="5" y="80" width="10" height="10" fill="currentColor"/>
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <p className="text-sm opacity-70 mb-1">Total Balance</p>
                                <h2 className="text-4xl font-extrabold mb-4">$14,567<span className="text-2xl font-light">.89</span></h2>
                                <div className="flex h-12 space-x-1 mt-6 items-end justify-end">
                                    <div className="chart-bar w-1.5 bg-white/70 rounded-t-sm" style={{height: '40%'}}></div>
                                    <div className="chart-bar w-1.5 bg-white/70 rounded-t-sm" style={{height: '80%'}}></div>
                                    <div className="chart-bar w-1.5 bg-white/70 rounded-t-sm" style={{height: '30%'}}></div>
                                    <div className="chart-bar w-1.5 bg-white/70 rounded-t-sm" style={{height: '90%'}}></div>
                                    <div className="chart-bar w-1.5 bg-white/70 rounded-t-sm" style={{height: '50%'}}></div>
                                    <div className="chart-bar w-1.5 bg-white/70 rounded-t-sm" style={{height: '70%'}}></div>
                                    <div className="chart-bar w-1.5 bg-white/70 rounded-t-sm" style={{height: '20%'}}></div>
                                </div>
                                <p className="text-xs text-right mt-2 opacity-80">+5.2% Today</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-2">
                            <button className="flex flex-col items-center space-y-1 w-1/4">
                                <div className="w-14 h-14 rounded-full shadow-lg transition duration-200 flex items-center justify-center" style={{ backgroundColor: addAlpha(primary, '1A'), color: primary }}>
                                    <i className="ri-send-plane-2-line text-2xl"></i>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Send</span>
                            </button>
                            <button className="flex flex-col items-center space-y-1 w-1/4">
                                <div className="w-14 h-14 rounded-full shadow-lg transition duration-200 flex items-center justify-center" style={{ backgroundColor: addAlpha(accent1, '33'), color: accent1 }}>
                                    <i className="ri-arrow-down-circle-line text-2xl"></i>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Receive</span>
                            </button>
                            <button className="flex flex-col items-center space-y-1 w-1/4">
                                <div className="w-14 h-14 rounded-full shadow-lg transition duration-200 flex items-center justify-center" style={{ backgroundColor: addAlpha(yellow, '33'), color: yellow }}>
                                    <i className="ri-bank-card-line text-2xl"></i>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Cards</span>
                            </button>
                            <button className="flex flex-col items-center space-y-1 w-1/4">
                                <div className="w-14 h-14 rounded-full shadow-lg transition duration-200 flex items-center justify-center" style={{ backgroundColor: addAlpha(accent2, '33'), color: accent2 }}>
                                    <i className="ri-bar-chart-line text-2xl"></i>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Insights</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex justify-between items-center">
                                Recent Activity
                                <a href="#" className="text-xs font-medium" style={{color: primary}}>See All</a>
                            </h3>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition duration-150">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: addAlpha(accent1, '33'), color: accent1 }}>
                                        <i className="ri-money-dollar-circle-line text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Salary Deposit</p>
                                        <p className="text-xs text-gray-500">Today, 10:30 AM</p>
                                    </div>
                                </div>
                                <p className="font-semibold" style={{ color: accent1 }}>+$2,100.00</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition duration-150">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: addAlpha(red, '1A'), color: red }}>
                                        <i className="ri-shopping-bag-line text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Online Shopping</p>
                                        <p className="text-xs text-gray-500">Yesterday, 4:15 PM</p>
                                    </div>
                                </div>
                                <p className="font-semibold" style={{ color: red }}>-$125.50</p>
                            </div>
                             <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition duration-150">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: addAlpha(primary, '33'), color: primary }}>
                                        <i className="ri-arrow-left-right-line text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Bank Transfer</p>
                                        <p className="text-xs text-gray-500">2 days ago</p>
                                    </div>
                                </div>
                                <p className="font-semibold" style={{ color: red }}>-$450.00</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition duration-150">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: addAlpha(purple, '1A'), color: purple }}>
                                        <i className="ri-film-line text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Streaming Service</p>
                                        <p className="text-xs text-gray-500">3 days ago</p>
                                    </div>
                                </div>
                                <p className="font-semibold" style={{ color: red }}>-$15.99</p>
                            </div>
                        </div>

                    </main>

                    <footer className="w-full bg-white border-t border-gray-200 shadow-2xl p-3 z-20 rounded-t-3xl sticky bottom-0">
                        <nav className="flex justify-around items-center">
                            <a href="#" className="flex flex-col items-center transition duration-150" style={{ color: primary }}>
                                <i className="ri-home-5-line text-xl"></i>
                                <span className="text-xs mt-1 font-medium">Home</span>
                            </a>
                            <a href="#" className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition duration-150">
                                <i className="ri-pie-chart-line text-xl"></i>
                                <span className="text-xs mt-1 font-medium">Budget</span>
                            </a>
                            <button className="w-14 h-14 rounded-full -mt-7 text-white shadow-xl flex items-center justify-center hover:shadow-2xl transition duration-200 transform hover:scale-105" style={{ backgroundColor: accent1 }}>
                                <i className="ri-add-line text-xl"></i>
                            </button>
                            <a href="#" className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition duration-150">
                                <i className="ri-history-line text-xl"></i>
                                <span className="text-xs mt-1 font-medium">History</span>
                            </a>
                            <a href="#" className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition duration-150">
                                <i className="ri-settings-3-line text-xl"></i>
                                <span className="text-xs mt-1 font-medium">Settings</span>
                            </a>
                        </nav>
                    </footer>

                </div>
            </div>
        </div>
    );
};

interface VisualizationViewProps {
  palette: OklchColor[];
  onBack: () => void;
}

const VisualizationView: React.FC<VisualizationViewProps> = ({ palette, onBack }) => {
    const [activeViz, setActiveViz] = useState('dashboard');
    
    // Original hex colors, memoized
    const hexColors = useMemo(() => palette.map(oklchToHex), [palette]);
    
    // State for the colors that are actually displayed, can be shuffled
    const [displayColors, setDisplayColors] = useState<string[]>(hexColors);

    // When the input palette changes, reset the displayed colors
    useEffect(() => {
        setDisplayColors(hexColors);
    }, [hexColors]);

    const shuffleArray = useCallback((array: string[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }, []);

    const handleRandomize = useCallback(() => {
        setDisplayColors(prevColors => shuffleArray(prevColors));
    }, [shuffleArray]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 w-full h-full flex flex-col">
            <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors" aria-label="Go back">
                        <i className="ri-arrow-left-line text-2xl"></i>
                    </button>
                    <div className="flex items-baseline gap-4">
                        <h2 className="text-lg font-bold text-gray-800">Visualize Palette</h2>
                        <div className="flex items-center gap-2">
                            {hexColors.map((hex) => (
                                <div key={hex} className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: hex }} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <button 
                        onClick={handleRandomize}
                        className="flex items-center px-3 py-1.5 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        <i className="ri-shuffle-line mr-2"></i>
                        Randomize
                    </button>
                </div>
            </header>
            <main className="flex-1 flex min-h-0">
                <aside className="w-64 p-4 border-r border-gray-200 overflow-y-auto flex-shrink-0">
                    <nav className="flex flex-col gap-1">
                        {VIZ_TYPES.map(viz => (
                            <button
                                key={viz.id}
                                disabled={viz.id !== 'dashboard' && viz.id !== 'mobile-dashboard' && viz.id !== 'infographic'}
                                onClick={() => setActiveViz(viz.id)}
                                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center gap-3 transition-colors ${
                                    activeViz === viz.id
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                } ${viz.id !== 'dashboard' && viz.id !== 'mobile-dashboard' && viz.id !== 'infographic' ? 'text-gray-400 cursor-not-allowed' : ''}`}
                            >
                                <i className={`${viz.icon} text-lg`}></i>
                                <span>{viz.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 flex items-center justify-center bg-gray-100/50 overflow-auto p-4">
                    {activeViz === 'mobile-dashboard' ? (
                        <MobileAppVisualization colors={displayColors} />
                    ) : activeViz === 'dashboard' ? (
                        <div className="w-full h-full transform scale-[0.9] origin-center">
                             <DashboardVisualization colors={displayColors} />
                        </div>
                    ) : activeViz === 'infographic' ? (
                        <div className="w-full h-full transform scale-[0.9] origin-center">
                             <InfographicVisualization colors={displayColors} />
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <i className="ri-flask-line text-5xl"></i>
                            <p className="mt-2 font-medium">Visualization Coming Soon</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default VisualizationView;