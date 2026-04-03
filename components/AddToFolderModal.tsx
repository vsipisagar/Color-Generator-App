import React, { useState } from 'react';
import { SavedPalette } from '../types';
import { oklchToHex } from '../services/colorService';

interface AddPalettesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (paletteIndices: number[]) => void;
  palettes: (SavedPalette & { originalIndex: number })[];
  folderName: string;
}

const AddPalettesSidebar: React.FC<AddPalettesSidebarProps> = ({ isOpen, onClose, onAdd, palettes, folderName }) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const handleToggleSelection = (index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleConfirmAdd = () => {
    if (selectedIndices.size > 0) {
      onAdd(Array.from(selectedIndices));
      setSelectedIndices(new Set());
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, draggedIndex: number) => {
    // If the dragged item is not selected, select only it.
    // Otherwise, drag all selected items.
    const indicesToDrag = selectedIndices.has(draggedIndex) ? Array.from(selectedIndices) : [draggedIndex];
    e.dataTransfer.setData('paletteIndices', JSON.stringify(indicesToDrag));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-palettes-sidebar-title"
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 id="add-palettes-sidebar-title" className="text-lg font-bold text-gray-800 truncate pr-2">Add to "{folderName}"</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </header>
        <main className="p-4 flex-1 overflow-y-auto">
          {palettes.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
               <p className="text-sm text-gray-500 mb-2">Select one or more palettes to drag into the folder, or use the button at the bottom.</p>
              {palettes.map((item) => {
                const isSelected = selectedIndices.has(item.originalIndex);
                return (
                  <div
                    key={item.originalIndex}
                    onClick={() => handleToggleSelection(item.originalIndex)}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, item.originalIndex)}
                    className={`relative p-3 rounded-lg border-2 cursor-grab transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full pointer-events-none">
                            <i className="ri-check-line text-lg"></i>
                        </div>
                    )}
                    <p className="text-sm font-medium text-gray-800 truncate mb-2 pointer-events-none">{item.name}</p>
                    <div className="flex gap-1 pointer-events-none">
                      {item.palette.map((color, cIndex) => (
                        <div
                          key={`${cIndex}-${color.h}`}
                          className="h-10 flex-1 rounded"
                          style={{ backgroundColor: oklchToHex(color) }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <i className="ri-inbox-2-line text-5xl text-gray-300"></i>
              <p className="mt-4 font-medium">No Uncategorized Palettes</p>
              <p className="text-sm">All your palettes are already in folders.</p>
            </div>
          )}
        </main>
        <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleConfirmAdd}
            disabled={selectedIndices.size === 0}
            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Add {selectedIndices.size > 0 ? selectedIndices.size : ''} Selected Palette{selectedIndices.size === 1 ? '' : 's'}
          </button>
        </footer>
      </aside>
    </>
  );
};

export default AddPalettesSidebar;
