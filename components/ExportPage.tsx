import React, { useState, useEffect, useRef } from 'react';
import { OklchColor } from '../types';
import {
    exportPalette,
    getPreviewContent,
    ExportFormat,
    ColorCodeFormat,
    formatCategories,
    isTextBased,
    FILE_FORMAT_COLOR_SUPPORT,
    getFormattedColorString,
    getJsonColorString,
    getXmlColorString,
    getCsvColorString,
} from '../services/exportService';
import { oklchToHex } from '../services/colorService';

interface ExportPageProps {
  onBack: () => void;
  palette: OklchColor[];
}

const formatIcons: Record<ExportFormat, string> = {
    [ExportFormat.CSS]: 'ri-css3-line',
    [ExportFormat.SCSS]: 'ri-braces-line',
    [ExportFormat.LESS]: 'ri-at-line',
    [ExportFormat.JSON]: 'ri-code-s-slash-line',
    [ExportFormat.XML]: 'ri-code-box-line',
    [ExportFormat.CSV]: 'ri-file-list-3-line',
    [ExportFormat.TXT]: 'ri-file-text-line',
    [ExportFormat.GPL]: 'ri-palette-line',
    [ExportFormat.JASC_PAL]: 'ri-brush-line',
    [ExportFormat.SVG]: 'ri-compasses-2-line',
    [ExportFormat.PNG]: 'ri-image-2-line',
    [ExportFormat.JPEG]: 'ri-camera-lens-line',
    [ExportFormat.PDF]: 'ri-file-pdf-2-line',
    [ExportFormat.XLSX]: 'ri-file-excel-2-line',
};

const FullBleedSwatch: React.FC<{ color: OklchColor; textLines: string[]; showCopyButton: boolean; }> = ({ color, textLines, showCopyButton }) => {
    const hex = oklchToHex(color);
    const textColor = color.l > 0.6 ? 'text-gray-900' : 'text-white';
    const textShadow = color.l > 0.6 ? '1px 1px 3px rgba(255,255,255,0.4)' : '1px 1px 3px rgba(0,0,0,0.4)';
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textLines.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div
            className="group/swatch flex-1 h-full relative flex flex-col justify-end p-2 overflow-hidden"
            style={{ backgroundColor: hex }}
            title={hex.toUpperCase()}
        >
            {showCopyButton && (
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-all opacity-0 group-hover/swatch:opacity-100 focus:opacity-100"
                    aria-label="Copy color code"
                >
                    {copied ? <i className="ri-check-line text-xl"></i> : <i className="ri-file-copy-line text-lg"></i>}
                </button>
            )}
            {textLines.length > 0 && (
                <div
                    className={`font-mono text-xs ${textColor} break-words whitespace-pre-wrap leading-snug`}
                    style={{ textShadow }}
                >
                    {textLines.join('\n')}
                </div>
            )}
        </div>
    );
};


const ExportPage: React.FC<ExportPageProps> = ({ onBack, palette }) => {
    const [fileFormat, setFileFormat] = useState<ExportFormat>(ExportFormat.CSS);
    const [selectedColorFormats, setSelectedColorFormats] = useState<ColorCodeFormat[]>([ColorCodeFormat.Hex]);
    const [headerCopied, setHeaderCopied] = useState(false);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const supportedColorFormats = FILE_FORMAT_COLOR_SUPPORT[fileFormat];
    const isMultiSelect = fileFormat === ExportFormat.PDF || fileFormat === ExportFormat.XLSX || fileFormat === ExportFormat.PNG || fileFormat === ExportFormat.JPEG;
    const currentIsTextBased = isTextBased(fileFormat);

    const getFormattedLine = (color: OklchColor, colorFormat: ColorCodeFormat, index: number): string => {
        const value = getFormattedColorString(color, colorFormat);
        const name = `color-${index + 1}`;
        switch (fileFormat) {
            case ExportFormat.CSS: return `--${name}: ${value};`;
            case ExportFormat.SCSS: return `$${name}: ${value};`;
            case ExportFormat.LESS: return `@${name}: ${value};`;
            case ExportFormat.JSON: return getJsonColorString(color, colorFormat);
            case ExportFormat.XML: return getXmlColorString(color, colorFormat);
            case ExportFormat.CSV: return getCsvColorString(color, colorFormat);
            case ExportFormat.SVG: {
                const swatchSize = 100;
                return `<rect x="${index * swatchSize}" y="0" width="${swatchSize}" height="${swatchSize}" fill="${getFormattedColorString(color, colorFormat)}" />`;
            }
            default: return value;
        }
    };


    useEffect(() => {
        const newSupported = FILE_FORMAT_COLOR_SUPPORT[fileFormat];
        if (newSupported && newSupported.length > 0) {
            // For multi-select formats, start with all selected for a better default experience.
            if (isMultiSelect) {
                setSelectedColorFormats([...newSupported]);
            } else {
                setSelectedColorFormats([newSupported[0]]);
            }
        } else {
            setSelectedColorFormats([]);
        }
    }, [fileFormat]);


    useEffect(() => {
        setHeaderCopied(false);
    }, [palette, fileFormat, selectedColorFormats]);

    const handleCopy = () => {
        const textToCopy = getPreviewContent(palette, fileFormat, selectedColorFormats);
        navigator.clipboard.writeText(textToCopy);
        setHeaderCopied(true);
        setTimeout(() => setHeaderCopied(false), 2000);
    };

    const handleDownload = () => {
        exportPalette(palette, fileFormat, selectedColorFormats, previewContainerRef.current);
    };

    const handleToggleColorFormat = (cf: ColorCodeFormat) => {
        if (isMultiSelect) {
            setSelectedColorFormats(prev => {
                const newSet = new Set(prev);
                if (newSet.has(cf)) {
                    if (newSet.size > 1) { // Prevent deselecting the last one
                        newSet.delete(cf);
                    }
                } else {
                    newSet.add(cf);
                }
                return Array.from(newSet);
            });
        } else {
            setSelectedColorFormats([cf]);
        }
    };

    const areAllFormatsSelected = supportedColorFormats && selectedColorFormats.length === supportedColorFormats.length;

    const handleToggleSelectAll = () => {
        if (!supportedColorFormats || !isMultiSelect) return;

        if (areAllFormatsSelected) {
            setSelectedColorFormats([supportedColorFormats[0]]);
        } else {
            setSelectedColorFormats([...supportedColorFormats]);
        }
    };

    return (
        <div className="p-4 h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 w-full h-full flex flex-col">
                <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors" aria-label="Go back">
                            <i className="ri-arrow-left-line text-2xl"></i>
                        </button>
                        <h2 className="text-lg font-bold text-gray-800">Export Palette</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {currentIsTextBased && (
                            <button 
                                onClick={handleCopy}
                                className="flex items-center px-3 py-1.5 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                <i className="ri-file-copy-line mr-2"></i>
                                {headerCopied ? 'Copied!' : 'Copy Code'}
                            </button>
                        )}
                        <button onClick={handleDownload} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                             <i className="ri-download-2-line mr-2"></i>
                            Download File
                        </button>
                    </div>
                </header>
                <main className="flex-1 flex min-h-0">
                    {/* Palette Column */}
                    <aside className="w-24 p-4 border-r border-gray-200 flex flex-col gap-2 flex-shrink-0">
                        {palette.map((color, index) => (
                            <div 
                                key={index} 
                                className="w-full flex-1 rounded-lg shadow-inner" 
                                style={{ backgroundColor: oklchToHex(color) }}
                                title={oklchToHex(color).toUpperCase()}
                            />
                        ))}
                    </aside>
                
                    {/* File Format Column */}
                    <aside className="w-56 p-4 border-r border-gray-200 overflow-y-auto flex-shrink-0">
                        <nav className="flex flex-col gap-4">
                            {Object.entries(formatCategories).map(([category, formats]) => (
                                <div key={category}>
                                    <h3 className="px-2 text-xs font-bold uppercase text-gray-400 mb-2">{category}</h3>
                                    <ul className="flex flex-col gap-1">
                                        {formats.map(f => (
                                            <li key={f}>
                                                <button 
                                                    onClick={() => setFileFormat(f)}
                                                    className={`w-full text-left px-2 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${fileFormat === f ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    <i className={`${formatIcons[f]} text-lg`}></i>
                                                    <span>{f}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                     {/* Color Format Column */}
                    {supportedColorFormats && (
                        <aside className="w-64 p-4 border-r border-gray-200 overflow-y-auto flex-shrink-0 bg-gray-50/50">
                             <div key={fileFormat} className="animate-fade-in">
                                <h3 className="px-2 text-xs font-bold uppercase text-gray-400 mb-2">Color Format{isMultiSelect && ' (Select multiple)'}</h3>
                                {isMultiSelect && (
                                    <div className="mb-2 border-b border-gray-200 pb-2">
                                        <button
                                            onClick={handleToggleSelectAll}
                                            className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-3 text-gray-700 hover:bg-gray-200 cursor-pointer"
                                        >
                                            <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${areAllFormatsSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                                                {areAllFormatsSelected && <i className="ri-check-line text-white text-[10px] font-bold"></i>}
                                            </div>
                                            <span className="truncate font-semibold">{areAllFormatsSelected ? 'Deselect All' : 'Select All'}</span>
                                        </button>
                                    </div>
                                )}
                                <ul className="flex flex-col gap-1">
                                    {supportedColorFormats.map(cf => {
                                        const isSelected = selectedColorFormats.includes(cf);
                                        return (
                                            <li key={cf}>
                                                <button
                                                    onClick={() => handleToggleColorFormat(cf)}
                                                    className={`w-full text-left px-2 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-3 ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    {isMultiSelect && (
                                                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                                                            {isSelected && <i className="ri-check-line text-white text-[10px] font-bold"></i>}
                                                        </div>
                                                    )}
                                                    <span className="truncate">{cf}</span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </aside>
                    )}

                    {/* Preview Column */}
                    <div ref={previewContainerRef} className="flex-1 flex flex-col overflow-hidden bg-gray-100">
                        {(() => {
                            const numColors = palette.length;

                            const renderRow = (colors: OklchColor[], offset = 0) => (
                                <div className="flex flex-row w-full flex-1">
                                    {colors.map((color, index) => {
                                        const originalIndex = index + offset;
                                        const textLines = selectedColorFormats.map(cf => getFormattedLine(color, cf, originalIndex));
                                        return (
                                            <FullBleedSwatch
                                                key={originalIndex}
                                                color={color}
                                                textLines={textLines}
                                                showCopyButton={true}
                                            />
                                        );
                                    })}
                                </div>
                            );
                            
                            if (numColors === 0) return null;

                            if (numColors < 6) {
                                return renderRow(palette);
                            }
                            
                            const getSplitIndex = (count: number) => {
                                return Math.ceil(count / 2);
                            };

                            const splitIndex = getSplitIndex(numColors);
                            const row1Colors = palette.slice(0, splitIndex);
                            const row2Colors = palette.slice(splitIndex);

                            return (
                                <>
                                    {renderRow(row1Colors, 0)}
                                    {row2Colors.length > 0 && renderRow(row2Colors, splitIndex)}
                                </>
                            );
                        })()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ExportPage;
