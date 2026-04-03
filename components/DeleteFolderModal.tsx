import React from 'react';

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  onDeleteWithPalettes: () => void;
  onDeleteAndMovePalettes: () => void;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  isOpen,
  onClose,
  folderName,
  onDeleteWithPalettes,
  onDeleteAndMovePalettes,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-6 flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
            <i className="ri-folder-warning-line text-2xl text-red-600"></i>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">Delete "{folderName}"?</h2>
            <p className="text-sm text-gray-500 mt-1">This folder may contain color palettes. Choose how you'd like to proceed.</p>
          </div>
        </header>
        <main className="px-6 pb-6 space-y-3">
            <button
                onClick={onDeleteAndMovePalettes}
                className="w-full flex items-start text-left gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <i className="ri-inbox-unarchive-line text-2xl text-indigo-500 mt-1"></i>
                <div>
                    <h3 className="font-semibold text-gray-800">Delete folder only</h3>
                    <p className="text-sm text-gray-500">Move all color palettes in this folder to "Uncategorized".</p>
                </div>
            </button>
            <button
                onClick={onDeleteWithPalettes}
                className="w-full flex items-start text-left gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                <i className="ri-delete-bin-2-line text-2xl text-red-500 mt-1"></i>
                <div>
                    <h3 className="font-semibold text-gray-800">Delete folder AND palettes</h3>
                    <p className="text-sm text-gray-500">Permanently delete this folder and all color palettes within it. This cannot be undone.</p>
                </div>
            </button>
        </main>
        <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DeleteFolderModal;
