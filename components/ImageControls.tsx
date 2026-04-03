import React, { useState, useEffect, useRef } from 'react';
import { SavedPalette, OklchColor, PantoneSystem } from '../types';
import { oklchToHex } from '../services/colorService';

interface ImageControlsProps {
    onImageLoad: (src: string | null) => void;
    onColorCountChange: (count: number) => void;
    initialColorCount: number;
    onRandomize: () => void;
    imageSrc: string | null;
    simulatedPalette: OklchColor[];
    onEdit: () => void;
    onExport: () => void;
    onSave: () => void;
    onNavigateToPantone: () => void;
    onNavigateToVisualize: () => void;
}

const ImageControls: React.FC<ImageControlsProps> = ({ 
    onImageLoad, 
    onColorCountChange, 
    initialColorCount, 
    onRandomize,
    imageSrc,
    simulatedPalette,
    onEdit,
    onExport,
    onSave,
    onNavigateToPantone,
    onNavigateToVisualize,
}) => {
    const [numColors, setNumColors] = useState(initialColorCount);
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        onColorCountChange(numColors);
    }, [numColors, onColorCountChange]);

    useEffect(() => {
        // Cleanup timeout on unmount
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);


    const processAndLoadImage = (src: string) => {
        if (!src || (!src.startsWith('http') && !src.startsWith('data:image'))) {
            setError('Please provide a valid image URL.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setImageUrl(src);

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;

        img.onload = () => {
            onImageLoad(src);
            setIsLoading(false);
        };

        img.onerror = () => {
            setError('Could not load image. If using a URL, check for CORS issues or try downloading and uploading it.');
            onImageLoad(null);
            setIsLoading(false);
        };
    };

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                setImageUrl('');
                processAndLoadImage(url);
            };
            reader.readAsDataURL(file);
        } else {
            setError('Please select a valid image file.');
        }
    };
    
    const handleDragEvent = (e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        handleDragEvent(e, false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };
    
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const newUrl = e.target.value;
        setImageUrl(newUrl);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            if (newUrl) {
                processAndLoadImage(newUrl);
            }
        }, 400);
    };

    const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            processAndLoadImage(imageUrl);
        }
    };
    
    return (
        <aside className="p-6 bg-white rounded-2xl flex flex-col gap-6 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto border border-gray-200/80 shadow-sm">
             <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Generate from Image</h2>
            </div>
            
             <div>
                <label
                    onDragEnter={(e) => handleDragEvent(e, true)}
                    onDragLeave={(e) => handleDragEvent(e, false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`group relative flex flex-col items-center justify-center p-4 w-full border-2 border-dashed rounded-lg transition-colors duration-200 ${
                        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                >
                    <div 
                        className="text-center cursor-pointer" 
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <i className="ri-upload-cloud-2-line text-4xl text-gray-400 group-hover:text-indigo-500"></i>
                        <p className="mt-2 text-sm text-gray-500">
                            <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP, etc.</p>
                    </div>

                    <div className="relative flex items-center w-full my-4">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    
                    <div className="w-full" onClick={e => e.stopPropagation()}>
                        <label htmlFor="image-url" className="sr-only">Paste image URL</label>
                        <div className="relative">
                            <input
                                id="image-url"
                                type="text"
                                value={imageUrl}
                                onChange={handleUrlChange}
                                onKeyDown={handleUrlKeyDown}
                                placeholder="Paste or type URL (loads automatically)"
                                className="w-full bg-white border-2 border-gray-300 rounded-lg pl-4 pr-10 py-2 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                            {isLoading && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <i className="ri-loader-4-line animate-spin text-gray-400"></i>
                                </div>
                            )}
                        </div>
                    </div>

                    <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                </label>
            </div>
            
            <div className="pt-4">
                 <div className="w-full">
                    <label className="flex justify-between items-center text-sm text-gray-500 mb-1">
                      <span>Number of Colors</span>
                      <span>{numColors}</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min={2}
                        max={10}
                        step={1}
                        value={numColors}
                        onChange={(e) => setNumColors(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{ background: 'linear-gradient(to right, #818cf8 0%, #e5e7eb 100%)' }}
                        disabled={isLoading}
                      />
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={onRandomize}
                        className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={isLoading || !imageSrc}
                    >
                        <i className="ri-shuffle-line mr-2"></i>
                        Randomize Points
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            
             {simulatedPalette.length > 0 && (
                <div className="mt-auto pt-6 flex flex-col gap-2">
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
                            onClick={onEdit}
                            className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            <i className="ri-palette-line mr-2"></i>
                            Edit in Editor
                        </button>
                        <button
                            onClick={onExport}
                            className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            <i className="ri-download-2-line mr-2"></i>
                            Export Color Palette
                        </button>
                        <button
                            onClick={onSave}
                            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            <i className="ri-save-line mr-2"></i>
                            Save Color Palette
                        </button>
                </div>
            )}
        </aside>
    );
};

export default ImageControls;