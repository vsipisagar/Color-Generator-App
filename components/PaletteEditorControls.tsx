import React from 'react';
import { OklchColor, SavedPalette, VisionDeficiency, PantoneSystem } from '../types';
import { oklchToHex } from '../services/colorService';
import VisionSimulatorDropdown from './VisionSimulatorDropdown';
import PantoneSimulator from './PantoneSimulator';

interface PaletteEditorControlsProps {
    onGenerate: () => void;
    onExport: () => void;
    onSave: () => void;
    simulatedPalette: OklchColor[];
    onNavigateToPantone: () => void;
    onNavigateToVisualize: () => void;
    editingSavedPaletteIndex: number | null;
    onUpdatePalette: () => void;
}

const PaletteEditorControls: React.FC<PaletteEditorControlsProps> = ({ 
    onGenerate, onExport, onSave,
    simulatedPalette, onNavigateToPantone, onNavigateToVisualize,
    editingSavedPaletteIndex, onUpdatePalette
}) => {
    return (
        <aside className="p-6 bg-white rounded-2xl flex flex-col gap-4 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto border border-gray-200/80 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Palette Editor</h2>
            </div>
            
            <div>
                <p className="text-sm text-gray-500">
                    Press the <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Spacebar</kbd> to generate new colors for unlocked swatches.
                </p>
            </div>
            
            <div className="flex flex-col gap-2">
                <button
                    onClick={onGenerate}
                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    aria-label="Generate new palette for unlocked colors"
                >
                    <i className="ri-refresh-line mr-2"></i>
                    Generate Palette
                </button>
                
                {editingSavedPaletteIndex !== null ? (
                    <>
                        <button
                            onClick={onUpdatePalette}
                            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            <i className="ri-check-double-line mr-2"></i>
                            Update Palette
                        </button>
                        <button
                            onClick={onSave}
                            className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                             <i className="ri-save-3-line mr-2"></i>
                            Save as New Palette
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onSave}
                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        <i className="ri-save-line mr-2"></i>
                        Save Palette
                    </button>
                )}

                <button
                    onClick={onNavigateToVisualize}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <i className="ri-magic-line mr-2"></i>
                    Visualize Palette
                </button>
                <button
                    onClick={onNavigateToPantone}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <i className="ri-paint-brush-line mr-2"></i>
                    Simulate Pantone®
                </button>
                <button
                    onClick={onExport}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <i className="ri-download-2-line mr-2"></i>
                    Export Palette
                </button>
            </div>
        </aside>
    );
};

export default PaletteEditorControls;