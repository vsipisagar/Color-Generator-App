import React, { useState } from 'react';
import { OklchColor, SavedPalette, Folder } from '../types';
import { oklchToHex } from '../services/colorService';

interface SavedPalettesViewProps {
    palettes: (SavedPalette & { originalIndex: number })[];
    folders: Folder[];
    onLoad: (palette: OklchColor[], index: number) => void;
    onDelete: (index: number) => void;
    selectedFolderId: string;
    currentFolderName: string;
    onAddPaletteClick: () => void;
    onDropPalettes: (indices: number[]) => void;
    onOpenMoveMenu: (index: number, event: React.MouseEvent) => void;
    onExport: (index: number) => void;
    onVisualize: (index: number) => void;
}

const SavedPalettesView: React.FC<SavedPalettesViewProps> = ({ 
    palettes, 
    folders,
    onLoad, 
    onDelete, 
    selectedFolderId, 
    currentFolderName, 
    onAddPaletteClick, 
    onDropPalettes, 
    onOpenMoveMenu, 
    onExport,
    onVisualize,
}) => {
    const isCategorizedFolder = selectedFolderId !== 'all' && selectedFolderId !== 'uncategorized';
    const [isDragOver, setIsDragOver] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, paletteIndex: number) => {
        e.dataTransfer.setData('paletteIndex', paletteIndex.toString());
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (isCategorizedFolder) {
            const hasPaletteData = e.dataTransfer.types.includes('paletteindices');
            if (hasPaletteData) {
              e.dataTransfer.dropEffect = 'move';
              setIsDragOver(true);
            }
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (isCategorizedFolder) {
            const indicesStr = e.dataTransfer.getData('paletteIndices');
            if (indicesStr) {
                try {
                    const indices = JSON.parse(indicesStr);
                    if (Array.isArray(indices) && indices.every(i => typeof i === 'number')) {
                        onDropPalettes(indices);
                    }
                } catch (error) {
                    console.error("Failed to parse dropped palette indices:", error);
                }
            }
        }
    };

    const getFolderName = (folderId?: string): string => {
        if (!folderId) return 'Uncategorized';
        return folders.find(f => f.id === folderId)?.name || 'Uncategorized';
    };

    const filteredPalettes = palettes.filter(palette =>
        palette.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main 
            className="lg:h-[calc(100vh-4rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200/80 transition-all"
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
        >
            <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0 gap-4">
                 <div className="flex items-center gap-4 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">{currentFolderName}</h2>
                    <p className="hidden md:block text-sm text-gray-500">
                        <i className="ri-drag-move-2-line mr-1 align-bottom"></i>
                        Drag palettes to move them between folders.
                    </p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="relative">
                        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Search palettes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 bg-gray-100 border-2 border-transparent rounded-lg pl-10 pr-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            aria-label="Search saved palettes"
                        />
                    </div>
                    {isCategorizedFolder && (
                        <button
                            onClick={onAddPaletteClick}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            <i className="ri-add-line"></i>
                            Add Palettes
                        </button>
                    )}
                 </div>
            </header>
            <div className={`overflow-y-auto flex-1 relative ${isDragOver ? 'bg-indigo-50' : ''}`}>
                {isDragOver && (
                    <div className="absolute inset-4 border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center pointer-events-none">
                        <span className="text-indigo-600 font-semibold">Drop to add palettes here</span>
                    </div>
                )}
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="text-left font-semibold text-gray-600 p-3 w-1/4">Palette Name</th>
                            <th className="text-left font-semibold text-gray-600 p-3 w-1/4">Folder</th>
                            <th className="text-left font-semibold text-gray-600 p-3 w-2/4">Preview</th>
                            <th className="text-left font-semibold text-gray-600 p-3 w-auto">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPalettes.length > 0 ? (
                            filteredPalettes.map((savedItem) => (
                                <tr 
                                    key={savedItem.originalIndex} 
                                    className="border-b border-gray-200 hover:bg-gray-50 cursor-grab"
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, savedItem.originalIndex)}
                                >
                                    <td className="p-3 font-medium text-gray-800 truncate" title={savedItem.name}>
                                        {savedItem.name}
                                    </td>
                                    <td className="p-3 text-gray-500">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                                            {getFolderName(savedItem.folderId)}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-1 cursor-pointer" onClick={() => onLoad(savedItem.palette, savedItem.originalIndex)}>
                                            {savedItem.palette.map((color, cIndex) => (
                                                <div 
                                                    key={`${cIndex}-${color.h}`}
                                                    className="h-8 flex-1 rounded"
                                                    style={{ backgroundColor: oklchToHex(color) }}
                                                    title={oklchToHex(color).toUpperCase()}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3 text-left">
                                        <div className="flex items-center justify-start gap-1 flex-shrink-0">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onOpenMoveMenu(savedItem.originalIndex, e); }}
                                                className="relative group w-8 h-8 flex items-center justify-center text-gray-500 bg-white rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                                aria-label={`Move palette ${savedItem.name}`}
                                            >
                                                <i className="ri-folder-transfer-line text-lg"></i>
                                                <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Move</span>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onLoad(savedItem.palette, savedItem.originalIndex); }}
                                                className="relative group w-8 h-8 flex items-center justify-center text-gray-500 bg-white rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                                aria-label={`Edit palette ${savedItem.name}`}
                                            >
                                                <i className="ri-pencil-line text-lg"></i>
                                                <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Edit</span>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onVisualize(savedItem.originalIndex); }}
                                                className="relative group w-8 h-8 flex items-center justify-center text-gray-500 bg-white rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                                aria-label={`Visualize palette ${savedItem.name}`}
                                            >
                                                <i className="ri-magic-line text-lg"></i>
                                                <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Visualize</span>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onExport(savedItem.originalIndex); }}
                                                className="relative group w-8 h-8 flex items-center justify-center text-gray-500 bg-white rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                                aria-label={`Export palette ${savedItem.name}`}
                                            >
                                                <i className="ri-download-2-line text-lg"></i>
                                                <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Export</span>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(savedItem.originalIndex); }}
                                                className="relative group w-8 h-8 flex items-center justify-center text-gray-500 bg-white rounded-full hover:bg-red-50 hover:text-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                                                aria-label={`Delete palette ${savedItem.name}`}
                                            >
                                                <i className="ri-delete-bin-line text-lg"></i>
                                                 <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4}>
                                    <div className="w-full h-full flex items-center justify-center text-center p-20">
                                        <div>
                                            <i className={`text-6xl text-gray-300 ${searchQuery ? 'ri-search-eye-line' : 'ri-inbox-line'}`}></i>
                                            <p className="text-base font-medium text-gray-500 mt-4">
                                                {searchQuery 
                                                    ? 'No palettes found' 
                                                    : (selectedFolderId === 'uncategorized'
                                                        ? 'No uncategorized palettes'
                                                        : 'This folder is empty')
                                                }
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {searchQuery 
                                                    ? `Your search for "${searchQuery}" did not return any results.`
                                                    : (selectedFolderId === 'uncategorized'
                                                        ? 'Palettes not in a folder will appear here.'
                                                        : 'Palettes you save in this folder will appear here.')
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    )
};

export default SavedPalettesView;