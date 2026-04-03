import React, { useMemo } from 'react';

interface InfographicVisualizationProps {
  colors: string[];
}

const teaData = [
    { name: "Black Tea", units: { tea: 7, milk: 0, ginger: 0, lemon: 0, ice: 0, water: 3, greenBlend: 0, herbalPowder: 0, honey: 0 }, desc: "Strong, simple black tea infusion." },
    { name: "Green Tea", units: { tea: 4, milk: 0, ginger: 0, lemon: 0, ice: 0, water: 5, greenBlend: 1, herbalPowder: 0, honey: 0 }, desc: "Lighter, more delicate tea base with a hint of green." },
    { name: "Milk Tea", units: { tea: 4, milk: 6, ginger: 0, lemon: 0, ice: 0, water: 0, greenBlend: 0, herbalPowder: 0, honey: 0 }, desc: "Classic combination of tea and creamer." },
    { name: "Herbal Tea", units: { tea: 2, milk: 0, ginger: 0, lemon: 0, ice: 0, water: 7, greenBlend: 0, herbalPowder: 1, honey: 0 }, desc: "Mostly hot water infused with herbs and botanicals." },
    { name: "Ginger Tea", units: { tea: 3, milk: 0, ginger: 2, lemon: 0, ice: 0, water: 5, greenBlend: 0, herbalPowder: 0, honey: 0 }, desc: "A spicy blend with real ginger flavor." }, 
    { name: "Lemon Tea", units: { tea: 4, milk: 0, ginger: 0, lemon: 2, ice: 0, water: 4, greenBlend: 0, herbalPowder: 0, honey: 0 }, desc: "A bright, tart blend with lemon flavor." }, 
    { name: "Iced Tea", units: { tea: 4, milk: 0, ginger: 0, lemon: 0, ice: 4, water: 2, greenBlend: 0, herbalPowder: 0, honey: 0 }, desc: "Sweetened tea concentrate chilled with ice." }, 
    { name: "Honey Tea", units: { tea: 4, milk: 0, ginger: 0, lemon: 0, ice: 0, water: 5, greenBlend: 0, herbalPowder: 0, honey: 1 }, desc: "Classic black tea base sweetened with a touch of honey." }
];

const MAX_TOTAL_UNITS = 10;

const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const isDark = (hexColor: string): boolean => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return false;
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance < 0.5;
};


const InfographicVisualization: React.FC<InfographicVisualizationProps> = ({ colors }) => {
    const fullPalette = useMemo(() => {
        if (!colors || colors.length === 0) {
            const defaults = ['#7f1d1d', '#e5e7eb', '#ea580c', '#facc15', '#0ea5e9', '#34d399', '#a16207', '#ca8a04', '#7dd3fc'];
            return Array.from({ length: 9 }, (_, i) => defaults[i]);
        }
        return Array.from({ length: 9 }, (_, i) => colors[i % colors.length]);
    }, [colors]);

    const INGREDIENT_COLORS = useMemo(() => ({
        tea: fullPalette[0],
        milk: fullPalette[1],
        ginger: fullPalette[2],
        lemon: fullPalette[3],
        ice: fullPalette[4],
        greenBlend: fullPalette[5],
        herbalPowder: fullPalette[6],
        honey: fullPalette[7],
        water: fullPalette[8],
    }), [fullPalette]);

    const teaCupStyles = `
        .tea-cup-container {
            width: 48%;      
            max-width: 280px; 
            height: 120px;     
            border: 4px solid #303030;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border-bottom-left-radius: 25px; 
            border-bottom-right-radius: 25px; 
            position: relative;
            margin-bottom: 0.75rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            display: flex; 
            flex-direction: column-reverse;
        }
        
        .tea-cup-container::after {
            content: '';
            position: absolute;
            right: -27px;
            top: 25px;
            width: 50px;
            height: 55px;
            background-color: transparent;
            border: 4px solid #303030;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 20px;
            border-left-color: transparent;
            z-index: 5; 
        }

        .ingredient-layer {
            position: relative;
            width: 100%;
            z-index: 10;
        }

        .text-on-dark {
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
        }

        .texture-overlay::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 10% 20%, rgba(255,255,255,0.08) 0%, transparent 10%),
                radial-gradient(circle at 90% 80%, rgba(0,0,0,0.05) 0%, transparent 10%);
            background-size: 15px 15px;
            opacity: 0.8;
            pointer-events: none;
            mix-blend-mode: soft-light;
        }
    `;
    
    return (
        <>
            <style>{teaCupStyles}</style>
            <div className="max-w-7xl mx-auto w-full">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: fullPalette[0] }}>The Anatomy of Tea</h1>
                    <p className="text-xl text-gray-600">
                        A visual guide to what's inside your perfect brew.
                    </p>
                </header>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {teaData.map(tea => {
                        const targetTeas = ["Black Tea", "Green Tea", "Milk Tea", "Herbal Tea", "Ginger Tea", "Lemon Tea", "Honey Tea"];
                        const isTargetTea = targetTeas.includes(tea.name);
                        const currentBottomRadius = isTargetTea ? '22px' : '25px';

                        const layerComponents = [
                            { size: (tea.units.water / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.water, label: 'Water Base' },
                            { size: (tea.units.ginger / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.ginger, label: 'Ginger Flavor' }, 
                            { size: (tea.units.lemon / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.lemon, label: 'Lemon Flavor' },
                            { size: (tea.units.honey / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.honey, label: 'Honey' }, 
                            { size: (tea.units.greenBlend / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.greenBlend, label: 'Green Blend' }, 
                            { size: (tea.units.herbalPowder / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.herbalPowder, label: 'Herbal Powder' }, 
                            { size: (tea.units.tea / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.tea, label: 'Tea Infusion' },   
                            { size: (tea.units.milk / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.milk, label: 'Milk/Creamer' }, 
                            { size: (tea.units.ice / MAX_TOTAL_UNITS) * 100, color: INGREDIENT_COLORS.ice, label: 'Ice' }, 
                        ].filter(l => l.size > 0); 

                        return (
                            <div key={tea.name} className="flex flex-col items-center bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                                <div className="tea-cup-container">
                                    {layerComponents.map((layer, index) => {
                                        const separatorClass = index > 0 ? 'border-t border-white/40' : '';
                                        const textColorClass = isDark(layer.color) ? 'text-on-dark' : 'text-gray-900';
                                        const bottomRadiusStyle = index === 0 ? { borderBottomLeftRadius: currentBottomRadius, borderBottomRightRadius: currentBottomRadius, marginBottom: '-1px' } : {};
                                        
                                        return (
                                            <div
                                                key={layer.label}
                                                className={`ingredient-layer ${separatorClass} texture-overlay`} 
                                                style={{ height: `${layer.size}%`, width: '100%', backgroundColor: layer.color, ...bottomRadiusStyle }}
                                                title={`${layer.label}: ${layer.size.toFixed(1)}%`}
                                            >
                                                <span className={`absolute inset-0 flex items-center justify-center text-xs font-semibold text-center ${textColorClass} opacity-80 p-1`}>
                                                    {layer.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mt-2 text-center">{tea.name}</h3>
                                <p className="text-xs text-gray-500 text-center mt-1 h-10">{tea.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default InfographicVisualization;