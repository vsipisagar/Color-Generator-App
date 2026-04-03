import React, { useState, useRef, useEffect } from 'react';
import { Folder } from '../types';

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onDropOnFolder: (folderId: string, paletteIndex: number) => void;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({ 
    folders, selectedFolderId, onSelectFolder,
    onCreateFolder, onRenameFolder, onDeleteFolder, onDropOnFolder
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) {
      newFolderInputRef.current?.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
    }
  }, [renamingId]);

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
    }
    setIsCreating(false);
    setNewFolderName('');
  };

  const handleRename = () => {
    if (renamingId && renamingName.trim()) {
      onRenameFolder(renamingId, renamingName.trim());
    }
    setRenamingId(null);
    setRenamingName('');
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLButtonElement>, folderId: string) => {
    e.preventDefault();
    const paletteIndexStr = e.dataTransfer.getData('paletteIndex');
    if (paletteIndexStr) {
        onDropOnFolder(folderId, parseInt(paletteIndexStr, 10));
    }
    setDragOverFolderId(null);
  };
  
  const menuItems = [
    { id: 'all', name: 'All Palettes', icon: 'ri-archive-line' },
    { id: 'uncategorized', name: 'Uncategorized', icon: 'ri-inbox-unarchive-line' },
  ];

  return (
    <aside className="p-4 bg-white rounded-2xl flex flex-col gap-4 lg:h-[calc(100vh-4rem)] border border-gray-200/80 shadow-sm">
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectFolder(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              selectedFolderId === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span>{item.name}</span>
          </button>
        ))}
        
        <div className="border-t border-gray-200 my-2"></div>

        <div className="flex justify-between items-center px-3 mt-2 mb-1">
            <h3 className="text-xs font-bold uppercase text-gray-400">Folders</h3>
            <button
                onClick={() => setIsCreating(true)}
                className="relative group p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                aria-label="New Folder"
            >
                <i className="ri-add-line text-base"></i>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                New Folder
                </span>
            </button>
        </div>

        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => renamingId !== folder.id && onSelectFolder(folder.id)}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragOverFolderId(folder.id)}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={(e) => handleDrop(e, folder.id)}
            className={`group/folder w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              selectedFolderId === folder.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            } ${dragOverFolderId === folder.id ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
          >
            <i className="ri-folder-2-line text-lg"></i>
            {renamingId === folder.id ? (
              <input
                ref={renameInputRef}
                type="text"
                value={renamingName}
                onChange={(e) => setRenamingName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                className="flex-1 bg-transparent border border-indigo-300 rounded px-1 -my-0.5"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="truncate flex-1">{folder.name}</span>
                <div className="flex items-center opacity-0 group-hover/folder:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setRenamingId(folder.id); setRenamingName(folder.name); }} className="p-1 rounded hover:bg-indigo-200" aria-label={`Rename ${folder.name}`}><i className="ri-pencil-line"></i></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="p-1 rounded hover:bg-red-100 text-red-600" aria-label={`Delete ${folder.name}`}><i className="ri-delete-bin-line"></i></button>
                </div>
              </>
            )}
          </button>
        ))}
         {isCreating && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <i className="ri-folder-add-line text-lg text-gray-400"></i>
            <input
              ref={newFolderInputRef}
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={handleCreate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              placeholder="New folder name"
              className="flex-1 bg-transparent border border-indigo-300 rounded px-1 text-sm"
            />
          </div>
        )}
      </nav>
    </aside>
  );
};

export default FolderSidebar;