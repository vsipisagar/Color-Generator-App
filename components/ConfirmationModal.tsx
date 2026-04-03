import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel',
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-6 flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </header>
        <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            {confirmButtonText}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;
