import React, { useEffect, useRef } from 'react';
import { Folder } from '../types';

interface MovePaletteMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  folders: Folder[];
  currentFolderId?: string;
  onMove: (folderId: string | 'uncategorized') => void;
}

const MovePaletteMenu: React.FC<MovePaletteMenuProps> = ({ anchorEl, onClose, folders, currentFolderId, onMove }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          anchorEl && !anchorEl.contains(event.target as Node)) {
        onClose();
      }
    };
    if (anchorEl) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    transform: 'translateX(-50%)',
    marginLeft: `${rect.width / 2}px`
  };
  
  const handleMove = (id: string | 'uncategorized') => {
    onMove(id);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="z-50 bg-white rounded-lg shadow-xl border border-gray-200/80 w-56"
      style={style}
    >
      <div className="p-2">
        <p className="px-2 py-1 text-xs font-semibold text-gray-500">Move to...</p>
        <ul className="mt-1 max-h-60 overflow-y-auto">
          {currentFolderId && (
            <li>
              <button
                onClick={() => handleMove('uncategorized')}
                className="w-full text-left flex items-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <i className="ri-inbox-unarchive-line text-base"></i>
                <span>Uncategorized</span>
              </button>
            </li>
          )}
          {folders.map(folder => {
            if (folder.id === currentFolderId) return null;
            return (
              <li key={folder.id}>
                <button
                  onClick={() => handleMove(folder.id)}
                  className="w-full text-left flex items-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <i className="ri-folder-2-line text-base"></i>
                  <span className="truncate">{folder.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MovePaletteMenu;
