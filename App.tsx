

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { OklchColor, HarmonyRule, VisionDeficiency, SavedPalette, HistoryState, SamplePoint, Folder, PantoneSystem } from './types';
import { generateHarmony, oklchToRgb, simulateVisionDeficiency, rgbToOklch, generateRandomOklch, oklchToHex, hexToOklch } from './services/colorService';
import Controls from './components/Controls';
import Palette from './components/Palette';
import ColorWheel from './components/ColorWheel';
import ImageControls from './components/ImageControls';
import ImagePreview from './components/ImagePreview';
import PaletteEditor from './components/PaletteEditor';
import PaletteEditorControls from './components/PaletteEditorControls';
import { VISION_DEFICIENCIES } from './constants';
import SavedPalettesView from './components/SavedPalettesView';
import { useHistoryState } from './hooks/useHistoryState';
import ConfirmationModal from './components/ConfirmationModal';
import FolderSidebar from './components/FolderSidebar';
import AddPalettesView from './components/AddPalettesView';
import DeleteFolderModal from './components/DeleteFolderModal';
import MovePaletteMenu from './components/MovePaletteMenu';
import ColorConverterControls from './components/ColorConverterControls';
import ColorConverterResults from './components/ColorConverterResults';
import ExportPage from './components/ExportPage';
import PantoneView from './components/PantoneView';
import VisionSimulatorDropdown from './components/VisionSimulatorDropdown';
import VisualizationView from './components/VisualizationView';

type AppMode = 'color' | 'image' | 'editor' | 'saved' | 'convert' | 'export' | 'pantone' | 'visualize';

interface SavePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: OklchColor[] | null;
  folders: Folder[];
  onSave: (name: string, folderInfo: { folderId?: string, newFolderName?: string }) => void;
}

const SavePaletteModal: React.FC<SavePaletteModalProps> = ({ isOpen, onClose, palette, folders, onSave }) => {
  const [paletteName, setPaletteName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('none'); // 'none', 'new', or folder.id
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaletteName('');
      setSelectedFolder('none');
      setNewFolderName('');
    }
  }, [isOpen]);

  if (!isOpen || !palette) return null;

  const handleSave = () => {
    if (paletteName.trim() && (selectedFolder !== 'new' || newFolderName.trim())) {
      const folderInfo: { folderId?: string, newFolderName?: string } = {};
      if (selectedFolder === 'new') {
        folderInfo.newFolderName = newFolderName.trim();
      } else if (selectedFolder !== 'none') {
        folderInfo.folderId = selectedFolder;
      }
      onSave(paletteName.trim(), folderInfo);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Save Palette</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </header>
        <main className="p-6 flex-1 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="palette-name" className="block text-sm font-medium text-gray-600 mb-1">Palette Name</label>
            <input
              id="palette-name"
              type="text"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              placeholder="e.g., Warm Sunset"
              className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg pl-4 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div>
            <label htmlFor="folder-select" className="block text-sm font-medium text-gray-600 mb-1">Folder (Optional)</label>
            <select
              id="folder-select"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg pl-3 pr-8 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
               style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="none">No Folder</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
              <option value="new">Create new folder...</option>
            </select>
          </div>
          {selectedFolder === 'new' && (
            <div>
              <label htmlFor="new-folder-name" className="block text-sm font-medium text-gray-600 mb-1">New Folder Name</label>
              <input
                id="new-folder-name"
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Project X"
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg pl-4 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
          )}
          <div>
            <p className="block text-sm font-medium text-gray-600 mb-2">Preview</p>
            <div className="flex gap-1">
              {palette.map((color, index) => (
                <div
                  key={`${index}-${color.h}`}
                  className="h-16 flex-1 rounded"
                  style={{ backgroundColor: oklchToHex(color) }}
                />
              ))}
            </div>
          </div>
        </main>
        <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!paletteName.trim() || (selectedFolder === 'new' && !newFolderName.trim())}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Save Palette
          </button>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // State for undo/redo history
  const {
    state,
    set: setHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistoryState<HistoryState>({
    baseColor: { l: 0.7, c: 0.15, h: 230 },
    harmonyRule: HarmonyRule.Analogous,
    harmonyDistance: 0.1,
    analogousAngle: 30,
    triadicAngle: 120,
    splitComplementaryAngle: 30,
    rectangularTetradicAngle: 60,
    analogousColorCount: 3,
    monochromaticColorCount: 5,
    lightnessColorCount: 5,
    imagePalette: [],
    samplePoints: [],
    numImageColors: 5,
    editorPalette: [],
    lockedColors: []
  });

  // Live state for real-time updates during slider/drag interactions
  const [liveState, setLiveState] = useState<HistoryState | null>(null);

  // The state to be displayed is the live state if it exists, otherwise the history state
  const displayState = liveState || state;
  
  const {
    baseColor, harmonyRule, harmonyDistance, analogousAngle, triadicAngle,
    splitComplementaryAngle, rectangularTetradicAngle, analogousColorCount,
    monochromaticColorCount, lightnessColorCount, imagePalette, samplePoints,
    numImageColors, editorPalette, lockedColors
  } = displayState;

  // Create individual setters that update the history state object
  const setBaseColor = useCallback((value: OklchColor | ((prev: OklchColor) => OklchColor)) => {
    setHistory(prev => ({ ...prev, baseColor: value instanceof Function ? value(prev.baseColor) : value }));
  }, [setHistory]);
  const setHarmonyRule = useCallback((rule: HarmonyRule) => setHistory(prev => ({ ...prev, harmonyRule: rule })), [setHistory]);
  const setHarmonyDistance = useCallback((distance: number) => setHistory(prev => ({ ...prev, harmonyDistance: distance })), [setHistory]);
  const setAnalogousAngle = useCallback((angle: number) => setHistory(prev => ({ ...prev, analogousAngle: angle })), [setHistory]);
  const setTriadicAngle = useCallback((angle: number) => setHistory(prev => ({ ...prev, triadicAngle: angle })), [setHistory]);
  const setSplitComplementaryAngle = useCallback((angle: number) => setHistory(prev => ({ ...prev, splitComplementaryAngle: angle })), [setHistory]);
  const setRectangularTetradicAngle = useCallback((angle: number) => setHistory(prev => ({ ...prev, rectangularTetradicAngle: angle })), [setHistory]);
  const setAnalogousColorCount = useCallback((count: number) => setHistory(prev => ({ ...prev, analogousColorCount: count })), [setHistory]);
  const setMonochromaticColorCount = useCallback((count: number) => setHistory(prev => ({ ...prev, monochromaticColorCount: count })), [setHistory]);
  const setLightnessColorCount = useCallback((count: number) => setHistory(prev => ({ ...prev, lightnessColorCount: count })), [setHistory]);
  const setImagePalette = useCallback((palette: OklchColor[]) => setHistory(prev => ({ ...prev, imagePalette: palette })), [setHistory]);
  const setSamplePoints = useCallback((points: SamplePoint[]) => setHistory(prev => ({ ...prev, samplePoints: points })), [setHistory]);
  const setNumImageColors = useCallback((count: number) => setHistory(prev => ({ ...prev, numImageColors: count })), [setHistory]);
  const setEditorPalette = useCallback((palette: OklchColor[] | ((prev: OklchColor[]) => OklchColor[])) => {
    setHistory(prev => ({ ...prev, editorPalette: palette instanceof Function ? palette(prev.editorPalette) : palette }));
  }, [setHistory]);
  const setLockedColors = useCallback((locked: boolean[] | ((prev: boolean[]) => boolean[])) => {
    setHistory(prev => ({ ...prev, lockedColors: locked instanceof Function ? locked(prev.lockedColors) : locked }));
  }, [setHistory]);

  // Non-history UI state
  const [visionDeficiency, setVisionDeficiency] = useState<VisionDeficiency>(VisionDeficiency.Normal);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeSamplePoint, setActiveSamplePoint] = useState<number | null>(null);
  const [mode, setMode] = useState<AppMode>('color');
  const [previousMode, setPreviousMode] = useState<AppMode>('color');
  const [converterColor, setConverterColor] = useState<OklchColor>({ l: 0.7, c: 0.15, h: 230 });
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'UI Kits' },
    { id: '2', name: 'Brand Colors' },
    { id: '3', name: 'Inspiration' },
  ]);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([
    { name: "Vibrant Sunset", palette: [{"l":0.80,"c":0.18,"h":29},{"l":0.69,"c":0.24,"h":57},{"l":0.89,"c":0.10,"h":85},{"l":0.58,"c":0.17,"h":138},{"l":0.75,"c":0.13,"h":199}], folderId: '3' },
    { name: "Cool Ocean", palette: [{"l":0.45,"c":0.15,"h":320},{"l":0.65,"c":0.12,"h":280},{"l":0.85,"c":0.09,"h":240},{"l":0.95,"c":0.06,"h":200},{"l":0.75,"c":0.10,"h":160}], folderId: '1' },
    { name: "Earthy Tones", palette: [{"l":0.92,"c":0.08,"h":120},{"l":0.82,"c":0.12,"h":100},{"l":0.72,"c":0.16,"h":80},{"l":0.62,"c":0.20,"h":60},{"l":0.52,"c":0.24,"h":40}], folderId: '2' }
  ]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [paletteToSave, setPaletteToSave] = useState<OklchColor[] | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const [editingSavedPaletteIndex, setEditingSavedPaletteIndex] = useState<number | null>(null);


  // Local state for image point dragging to avoid flooding history
  const [liveImageState, setLiveImageState] = useState<{ points: SamplePoint[], palette: OklchColor[] } | null>(null);

  // State for delete confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [paletteIndexToDelete, setPaletteIndexToDelete] = useState<number | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);


  // State for saved palettes view
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [isAddingPalettesMode, setIsAddingPalettesMode] = useState(false);

  // State for move palette popover
  const [movePaletteState, setMovePaletteState] = useState<{ paletteIndex: number; anchorEl: HTMLElement | null } | null>(null);

  const [paletteToExport, setPaletteToExport] = useState<OklchColor[] | null>(null);
  const [paletteToSimulate, setPaletteToSimulate] = useState<OklchColor[] | null>(null);
  const [paletteToVisualize, setPaletteToVisualize] = useState<OklchColor[] | null>(null);
  
  const handleOpenMoveMenu = useCallback((paletteIndex: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setMovePaletteState({ paletteIndex, anchorEl: event.currentTarget as HTMLElement });
  }, []);

  const handleCloseMoveMenu = useCallback(() => {
    setMovePaletteState(null);
  }, []);

  const handleMovePalette = useCallback((paletteIndex: number, destinationFolderId: string | 'uncategorized') => {
    setSavedPalettes(prevPalettes =>
      prevPalettes.map((palette, index) => {
        if (index === paletteIndex) {
          if (destinationFolderId === 'uncategorized') {
            const { folderId, ...rest } = palette;
            return rest;
          } else {
            return { ...palette, folderId: destinationFolderId };
          }
        }
        return palette;
      })
    );
    handleCloseMoveMenu();
  }, [handleCloseMoveMenu]);

  const handleLiveStateChange = useCallback((updater: (prevState: HistoryState) => HistoryState) => {
    setLiveState(prev => updater(prev ?? state));
  }, [state]);

  const handleInteractionEnd = useCallback(() => {
    setLiveState(currentLiveState => {
      if (currentLiveState) {
        setHistory(currentLiveState);
      }
      return null;
    });
  }, [setHistory]);

  const getColorFromCanvas = useCallback((point: SamplePoint): OklchColor | null => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const x = Math.floor(point.x * canvas.width);
    const y = Math.floor(point.y * canvas.height);
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    
    return rgbToOklch({ r: r / 255, g: g / 255, b: b / 255 });
  }, []);

  const generateInitialPalette = useCallback(() => {
    if (!imageSrc) return;

    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const points: SamplePoint[] = [];
      const side = Math.ceil(Math.sqrt(numImageColors));
      for (let i = 0; i < numImageColors; i++) {
        points.push({
          x: ((i % side) + 0.5) / side,
          y: (Math.floor(i / side) + 0.5) / side,
        });
      }
      
      const newPalette = points.map(p => getColorFromCanvas(p)).filter(Boolean) as OklchColor[];
      
      setHistory(prev => ({
          ...prev,
          samplePoints: points,
          imagePalette: newPalette
      }));
    };
  }, [imageSrc, numImageColors, getColorFromCanvas, setHistory]);

  useEffect(() => {
    if (imageSrc) {
      generateInitialPalette();
    } else {
        setImagePalette([]);
        setSamplePoints([]);
    }
  }, [imageSrc, numImageColors, generateInitialPalette, setImagePalette, setSamplePoints]);

  useEffect(() => {
    if (harmonyRule === HarmonyRule.Analogous) {
      if ((analogousColorCount - 1) > 0) {
        const maxAngle = Math.floor(178 / (analogousColorCount - 1));
        if (analogousAngle > maxAngle) {
          setAnalogousAngle(maxAngle);
        }
      }
    }
  }, [analogousColorCount, harmonyRule, analogousAngle, setAnalogousAngle]);

  const harmonyPalette = useMemo(() => {
    return generateHarmony(
        baseColor, 
        harmonyRule, 
        harmonyDistance, 
        analogousAngle, 
        triadicAngle, 
        splitComplementaryAngle, 
        rectangularTetradicAngle,
        analogousColorCount,
        monochromaticColorCount,
        lightnessColorCount
    );
  }, [
    baseColor, harmonyRule, harmonyDistance, analogousAngle, triadicAngle, 
    splitComplementaryAngle, rectangularTetradicAngle, analogousColorCount,
    monochromaticColorCount, lightnessColorCount
  ]);
  
  const applySimulation = useCallback((color: OklchColor): OklchColor => {
    if (visionDeficiency === VisionDeficiency.Normal) {
        return color;
    }
    const rgb = oklchToRgb(color);
    const simulatedRgb = simulateVisionDeficiency(rgb, visionDeficiency);
    return rgbToOklch(simulatedRgb);
  }, [visionDeficiency]);

  const simulatedHarmonyPalette = useMemo(() => harmonyPalette.map(applySimulation), [harmonyPalette, applySimulation]);
  const simulatedImagePalette = useMemo(() => imagePalette.map(applySimulation), [imagePalette, applySimulation]);
  const simulatedEditorPalette = useMemo(() => editorPalette.map(applySimulation), [editorPalette, applySimulation]);
  const simulatedBaseColor = useMemo(() => applySimulation(baseColor), [baseColor, applySimulation]);

  const handleLiveHueChange = useCallback((hue: number) => {
    handleLiveStateChange(prev => ({
        ...prev,
        baseColor: { ...prev.baseColor, h: hue }
    }));
  }, [handleLiveStateChange]);
  
  const handlePointDragStart = useCallback(() => {
    setLiveImageState({ points: samplePoints, palette: imagePalette });
  }, [samplePoints, imagePalette]);

  const handleLivePointUpdate = useCallback((index: number, newPoint: SamplePoint) => {
    const newColor = getColorFromCanvas(newPoint);
    if (newColor) {
      setLiveImageState(prevState => {
        if (!prevState) return null;
        const updatedPoints = [...prevState.points];
        updatedPoints[index] = newPoint;
        const updatedPalette = [...prevState.palette];
        updatedPalette[index] = newColor;
        return { points: updatedPoints, palette: updatedPalette };
      });
    }
  }, [getColorFromCanvas]);

  const handlePointDragEnd = useCallback(() => {
    setLiveImageState(currentLiveImageState => {
      if (currentLiveImageState) {
        setHistory(prevHistoryState => {
          // Only update if points have actually changed from the last committed state
          if (JSON.stringify(currentLiveImageState.points) !== JSON.stringify(prevHistoryState.samplePoints)) {
            return {
              ...prevHistoryState,
              samplePoints: currentLiveImageState.points,
              imagePalette: currentLiveImageState.palette,
            };
          }
          return prevHistoryState;
        });
      }
      return null;
    });
  }, [setHistory]);

  const handleRandomizePoints = useCallback(() => {
    if (!imageSrc) return;
    const newPoints: SamplePoint[] = Array.from({ length: numImageColors }, () => ({ x: Math.random(), y: Math.random() }));
    const newPalette = newPoints.map(p => getColorFromCanvas(p)).filter(Boolean) as OklchColor[];
    if (newPalette.length === newPoints.length) {
        setHistory(prev => ({
            ...prev,
            samplePoints: newPoints,
            imagePalette: newPalette
        }));
    }
  }, [numImageColors, imageSrc, getColorFromCanvas, setHistory]);

  // Palette Editor Handlers
  const handleGenerateEditorPalette = useCallback(() => {
    setEditorPalette(prevPalette => prevPalette.map((color, index) => 
      lockedColors[index] ? color : generateRandomOklch()
    ));
  }, [lockedColors, setEditorPalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'editor' && e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        handleGenerateEditorPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleGenerateEditorPalette]);

  const handleModeChange = (newMode: AppMode) => {
    if (newMode !== mode) {
      setPreviousMode(mode);
       if(newMode !== 'editor') { // when navigating away from editor, reset the index
        setEditingSavedPaletteIndex(null);
      }
    }
    if (newMode === 'editor' && mode !== 'editor') {
        let currentPalette = [...(mode === 'color' ? harmonyPalette : imagePalette)];
        const targetSize = 5;
        if (currentPalette.length > targetSize) {
            currentPalette = currentPalette.slice(0, targetSize);
        } else {
            while (currentPalette.length < targetSize) {
                currentPalette.push(generateRandomOklch());
            }
        }
        setEditingSavedPaletteIndex(null);
        setHistory(prev => ({
            ...prev,
            editorPalette: currentPalette,
            lockedColors: new Array(currentPalette.length).fill(false)
        }));
    }
    if (newMode === 'saved') {
      setSelectedFolderId('all');
      setIsAddingPalettesMode(false);
    }
    setMode(newMode);
  };
  
  const handleOpenSaveModal = useCallback(() => {
    let currentPalette: OklchColor[] | null = null;
    
    switch (mode) {
        case 'color':
            currentPalette = harmonyPalette;
            break;
        case 'image':
            if (imagePalette.length > 0) {
                currentPalette = imagePalette;
            }
            break;
        case 'editor':
            currentPalette = editorPalette;
            break;
        case 'pantone':
            currentPalette = paletteToSimulate;
            break;
        case 'export':
            currentPalette = paletteToExport;
            break;
        case 'saved':
        case 'convert':
        case 'visualize':
            return; // Cannot save from these views
    }

    if (currentPalette && currentPalette.length > 0) {
        setPaletteToSave(currentPalette);
        setIsSaveModalOpen(true);
    }
  }, [mode, harmonyPalette, imagePalette, editorPalette, paletteToExport, paletteToSimulate]);

  const handleConfirmSave = useCallback((name: string, folderInfo: { folderId?: string, newFolderName?: string }) => {
      if (!paletteToSave) return;
      
      let finalFolderId = folderInfo.folderId;

      if (folderInfo.newFolderName) {
        const newFolder: Folder = { id: Date.now().toString(), name: folderInfo.newFolderName };
        finalFolderId = newFolder.id;
        setFolders(prev => [...prev, newFolder]);
      }

      const newSavedPalette: SavedPalette = { 
        name, 
        palette: paletteToSave,
        ...(finalFolderId && { folderId: finalFolderId })
      };
      
      const isDuplicate = savedPalettes.some(p => JSON.stringify(p.palette) === JSON.stringify(newSavedPalette.palette));
      
      if (!isDuplicate) {
        setSavedPalettes(prev => [newSavedPalette, ...prev]);
      }
      
      setIsSaveModalOpen(false);
      setPaletteToSave(null);
  }, [paletteToSave, savedPalettes]);

  const requestDeletePalette = useCallback((index: number) => {
    setPaletteIndexToDelete(index);
    setIsConfirmModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (paletteIndexToDelete !== null) {
      setSavedPalettes(prev => prev.filter((_, index) => index !== paletteIndexToDelete));
    }
    setIsConfirmModalOpen(false);
    setPaletteIndexToDelete(null);
  }, [paletteIndexToDelete]);

  const handleCancelPaletteDelete = useCallback(() => {
    setIsConfirmModalOpen(false);
    setPaletteIndexToDelete(null);
  }, []);

  const handleLoadPalette = useCallback((paletteToLoad: OklchColor[], index: number) => {
    setHistory(prev => ({
        ...prev,
        editorPalette: paletteToLoad,
        lockedColors: new Array(paletteToLoad.length).fill(false)
    }));
    setEditingSavedPaletteIndex(index);
    setMode('editor');
  }, [setHistory]);

  const handleUpdatePalette = useCallback(() => {
    if (editingSavedPaletteIndex === null) return;
    
    setSavedPalettes(prev => 
        prev.map((palette, index) => {
            if (index === editingSavedPaletteIndex) {
                return { ...palette, palette: editorPalette };
            }
            return palette;
        })
    );
    // Maybe add a toast notification here in a future update.
  }, [editingSavedPaletteIndex, editorPalette]);
  
  const handleViewAllSaved = useCallback(() => {
    setPreviousMode(mode);
    setMode('saved');
  }, [mode]);

  const finalPalette = mode === 'color' ? simulatedHarmonyPalette : (liveImageState ? liveImageState.palette.map(applySimulation) : simulatedImagePalette);

  const handleNavigateToExport = useCallback((palette: OklchColor[]) => {
    if (palette && palette.length > 0) {
        setPaletteToExport(palette);
        handleModeChange('export');
    }
  }, [handleModeChange]);

    const handleNavigateToPantone = useCallback(() => {
        let currentPalette: OklchColor[] | null = null;
        switch (mode) {
            case 'color':
                currentPalette = harmonyPalette;
                break;
            case 'image':
                currentPalette = imagePalette;
                break;
            case 'editor':
                currentPalette = editorPalette;
                break;
        }

        if (currentPalette && currentPalette.length > 0) {
            setPaletteToSimulate(currentPalette);
            handleModeChange('pantone');
        }
    }, [mode, harmonyPalette, imagePalette, editorPalette, handleModeChange]);
    
    const handleNavigateToVisualize = useCallback((palette: OklchColor[]) => {
        if (palette && palette.length > 0) {
            setPaletteToVisualize(palette);
            handleModeChange('visualize');
        }
    }, [handleModeChange]);

  const canExportOrSave = useMemo(() => {
    switch (mode) {
        case 'color':
            return harmonyPalette.length > 0;
        case 'image':
            return imagePalette.length > 0;
        case 'editor':
            return editorPalette.length > 0;
        case 'export':
            return paletteToExport && paletteToExport.length > 0;
        default:
            return false;
    }
  }, [mode, harmonyPalette, imagePalette, editorPalette, paletteToExport]);
  
  const canSimulateOrVisualize = useMemo(() => {
    switch (mode) {
        case 'color':
            return harmonyPalette.length > 0;
        case 'image':
            return imagePalette.length > 0;
        case 'editor':
            return editorPalette.length > 0;
        default:
            return false;
    }
  }, [mode, harmonyPalette, imagePalette, editorPalette]);

  const handleHeaderExport = useCallback(() => {
    if (!canExportOrSave) return;
    
    let currentPalette: OklchColor[] | null = null;
    
    switch (mode) {
        case 'color':
            currentPalette = harmonyPalette;
            break;
        case 'image':
            currentPalette = imagePalette;
            break;
        case 'editor':
            currentPalette = editorPalette;
            break;
    }

    if (currentPalette && currentPalette.length > 0) {
        handleNavigateToExport(currentPalette);
    }
  }, [mode, harmonyPalette, imagePalette, editorPalette, handleNavigateToExport, canExportOrSave]);
  
  const handleEditCurrentPalette = useCallback(() => {
    const currentPalette = mode === 'color' ? harmonyPalette : imagePalette;

    if (currentPalette && currentPalette.length > 0) {
        setEditingSavedPaletteIndex(null);
        setHistory(prev => ({
            ...prev,
            editorPalette: currentPalette,
            lockedColors: new Array(currentPalette.length).fill(false)
        }));
        
        if (mode !== 'editor') {
          setPreviousMode(mode);
        }
        setMode('editor');
    }
  }, [mode, harmonyPalette, imagePalette, setHistory]);

  const handleCreateFolder = useCallback((name: string) => {
    const newFolder = { id: Date.now().toString(), name };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id);
  }, []);

  const handleRenameFolder = useCallback((id: string, newName: string) => {
    setFolders(prev => prev.map(f => (f.id === id ? { ...f, name: newName } : f)));
  }, []);

  const requestDeleteFolder = useCallback((id: string) => {
    const folder = folders.find(f => f.id === id);
    if (folder) {
      setFolderToDelete(folder);
      setIsDeleteFolderModalOpen(true);
    }
  }, [folders]);

  const handleDeleteFolderAndMovePalettes = useCallback(() => {
    if (!folderToDelete) return;

    // Move palettes from the deleted folder to uncategorized
    setSavedPalettes(prev =>
      prev.map(p => {
        if (p.folderId === folderToDelete.id) {
          const { folderId, ...rest } = p;
          return rest;
        }
        return p;
      })
    );
    // Delete the folder itself
    setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));
    // If the active folder was the one deleted, switch to all
    if (selectedFolderId === folderToDelete.id) {
      setSelectedFolderId('all');
    }
    
    setFolderToDelete(null);
    setIsDeleteFolderModalOpen(false);
  }, [folderToDelete, selectedFolderId]);
  
  const handleDeleteFolderWithPalettes = useCallback(() => {
    if (!folderToDelete) return;

    // Filter out palettes that are in the folder to be deleted
    setSavedPalettes(prev => prev.filter(p => p.folderId !== folderToDelete.id));

    // Delete the folder itself
    setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));
    
    // If the active folder was the one deleted, switch to all
    if (selectedFolderId === folderToDelete.id) {
        setSelectedFolderId('all');
    }

    setFolderToDelete(null);
    setIsDeleteFolderModalOpen(false);
  }, [folderToDelete, selectedFolderId]);

  const handleDropPaletteOnFolder = useCallback((folderId: string, paletteOriginalIndex: number) => {
    setSavedPalettes(prevPalettes =>
      prevPalettes.map((palette, index) => {
        if (index === paletteOriginalIndex) {
          return { ...palette, folderId };
        }
        return palette;
      })
    );
  }, []);
  
  const handleMovePalettesToFolder = useCallback((paletteIndices: number[], folderId: string) => {
    if (!folderId || folderId === 'all' || folderId === 'uncategorized') return;
    
    setSavedPalettes(prevPalettes =>
      prevPalettes.map((palette, index) => {
        if (paletteIndices.includes(index)) {
          return { ...palette, folderId: folderId };
        }
        return palette;
      })
    );
    setIsAddingPalettesMode(false);
  }, []);

  const activeDeficiencyLabel = useMemo(() => 
    VISION_DEFICIENCIES.find(def => def.id === visionDeficiency)?.label || 'Simulation',
  [visionDeficiency]);

  const showRightPalette = useMemo(() => mode === 'color' || mode === 'image', [mode]);

  const gridLayout = useMemo(() => {
    if (mode === 'convert' || mode === 'export' || mode === 'pantone' || mode === 'visualize') {
      return ''; // These modes have their own layout
    }
    if (mode === 'editor') {
        return 'lg:grid-cols-[384px_1fr]';
    }
    if (mode === 'saved') {
        return isAddingPalettesMode
            ? 'lg:grid-cols-[384px_1fr_384px]'
            : 'lg:grid-cols-[384px_1fr]';
    }
    return showRightPalette
        ? 'lg:grid-cols-[384px_1fr_320px]'
        : 'lg:grid-cols-[384px_1fr]';
    }, [mode, showRightPalette, isAddingPalettesMode]);

  
  const palettesForSavedView = useMemo(() => {
    const withOriginalIndex = savedPalettes.map((p, i) => ({ ...p, originalIndex: i }));
    if (selectedFolderId === 'all') {
      return withOriginalIndex;
    }
    if (selectedFolderId === 'uncategorized') {
      return withOriginalIndex.filter(p => !p.folderId);
    }
    return withOriginalIndex.filter(p => p.folderId === selectedFolderId);
  }, [savedPalettes, selectedFolderId]);
  
  const uncategorizedPalettes = useMemo(() => {
    return savedPalettes
      .map((p, i) => ({ ...p, originalIndex: i }))
      .filter(p => !p.folderId);
  }, [savedPalettes]);

  const currentFolderName = useMemo(() => {
    if (selectedFolderId === 'all') return 'All Palettes';
    if (selectedFolderId === 'uncategorized') return 'Uncategorized';
    return folders.find(f => f.id === selectedFolderId)?.name || 'Saved Palettes';
  }, [selectedFolderId, folders]);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <SavePaletteModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        palette={paletteToSave}
        folders={folders}
        onSave={handleConfirmSave}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelPaletteDelete}
        onConfirm={handleConfirmDelete}
        title={"Delete Palette"}
        message={"Are you sure you want to permanently delete this palette? This action cannot be undone."}
      />
      {folderToDelete && (
        <DeleteFolderModal
          isOpen={isDeleteFolderModalOpen}
          onClose={() => {
            setIsDeleteFolderModalOpen(false);
            setFolderToDelete(null);
          }}
          folderName={folderToDelete.name}
          onDeleteWithPalettes={handleDeleteFolderWithPalettes}
          onDeleteAndMovePalettes={handleDeleteFolderAndMovePalettes}
        />
      )}
      {movePaletteState && (
        <MovePaletteMenu
            anchorEl={movePaletteState.anchorEl}
            onClose={handleCloseMoveMenu}
            folders={folders}
            currentFolderId={savedPalettes[movePaletteState.paletteIndex]?.folderId}
            // FIX: Corrected function name from handleMove to handleMovePalette.
            onMove={(folderId) => handleMovePalette(movePaletteState.paletteIndex, folderId)}
        />
      )}
      <canvas ref={imageCanvasRef} className="hidden" />
      <header className="py-4 px-8 bg-white/70 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-200/80 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">OKLCH Color Harmony Generator</h1>
          <p className="text-sm text-gray-500">Perceptually uniform color palettes</p>
        </div>
        <nav>
          <ul className="flex items-center gap-2">
            <li>
              <button onClick={() => handleModeChange('image')} className={`relative group block p-2 rounded-lg transition-colors duration-200 ${mode === 'image' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`} aria-label="Generate palette from image" aria-pressed={mode === 'image'}>
                <i className="ri-image-line text-2xl leading-none"></i>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Generate from image</span>
              </button>
            </li>
            <li>
               <button onClick={() => handleModeChange('color')} className={`relative group block p-2 rounded-lg transition-colors duration-200 ${mode === 'color' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`} aria-label="Generate palette from color" aria-pressed={mode === 'color'}>
                <i className="ri-color-filter-line text-2xl leading-none"></i>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Generate from color</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleModeChange('editor')} className={`relative group block p-2 rounded-lg transition-colors duration-200 ${mode === 'editor' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`} aria-label="Edit palette" aria-pressed={mode === 'editor'}>
                <i className="ri-palette-line text-2xl leading-none"></i>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Edit Palette</span>
              </button>
            </li>
             <li>
              <button onClick={() => handleModeChange('convert')} className={`relative group block p-2 rounded-lg transition-colors duration-200 ${mode === 'convert' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`} aria-label="Convert color code" aria-pressed={mode === 'convert'}>
                <i className="ri-exchange-line text-2xl leading-none"></i>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Convert Color</span>
              </button>
            </li>
            <li>
                <button
                    onClick={handleNavigateToPantone}
                    disabled={!canSimulateOrVisualize}
                    className={`relative group block p-2 rounded-lg transition-colors duration-200 ${mode === 'pantone' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                    aria-label="Simulate Pantone® colors"
                    aria-pressed={mode === 'pantone'}
                >
                    <i className="ri-paint-brush-line text-2xl leading-none"></i>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Simulate Pantone®
                    </span>
                </button>
            </li>
            <li>
              <button onClick={() => handleModeChange('saved')} className={`relative group block p-2 rounded-lg transition-colors duration-200 ${mode === 'saved' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`} aria-label="View saved palettes" aria-pressed={mode === 'saved'}>
                <i className="ri-bookmark-line text-2xl leading-none"></i>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Saved Palettes</span>
              </button>
            </li>
             <li>
                <button
                    onClick={() => {
                        let currentPalette: OklchColor[] | null = null;
                        if (mode === 'color') currentPalette = harmonyPalette;
                        else if (mode === 'image') currentPalette = imagePalette;
                        else if (mode === 'editor') currentPalette = editorPalette;
                        if (currentPalette) handleNavigateToVisualize(currentPalette);
                    }}
                    disabled={!canSimulateOrVisualize}
                    className={`relative group block p-2 rounded-lg transition-colors duration-200 ${mode === 'visualize' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                    aria-label="Visualize color palette"
                    aria-pressed={mode === 'visualize'}
                >
                    <i className="ri-magic-line text-2xl leading-none"></i>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Visualize Palette</span>
                </button>
            </li>
            <div className="w-px h-6 bg-gray-200 mx-2" aria-hidden="true"></div>
             <li>
                <button 
                    onClick={undo} 
                    disabled={!canUndo} 
                    className="relative group block p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" 
                    aria-label="Undo last action"
                >
                    <i className="ri-arrow-go-back-line text-2xl leading-none"></i>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Undo</span>
                </button>
            </li>
            <li>
                <button 
                    onClick={redo} 
                    disabled={!canRedo} 
                    className="relative group block p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" 
                    aria-label="Redo last action"
                >
                    <i className="ri-arrow-go-forward-line text-2xl leading-none"></i>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Redo</span>
                </button>
            </li>
            <div className="w-px h-6 bg-gray-200 mx-2" aria-hidden="true"></div>
            <li>
                <button
                    onClick={handleHeaderExport}
                    disabled={!canExportOrSave}
                    className={`relative group block p-2 rounded-lg transition-colors duration-200 ${mode === 'export' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                    aria-label="Export current palette"
                >
                    <i className="ri-download-2-line text-2xl leading-none"></i>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Export Palette</span>
                </button>
            </li>
            <li>
              <button
                onClick={handleOpenSaveModal}
                disabled={!canExportOrSave}
                className="relative group block p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                aria-label="Save current palette"
              >
                <i className="ri-save-line text-2xl leading-none"></i>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-gray-700 text-xs px-2 py-1 rounded-lg shadow-sm border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Save Palette</span>
              </button>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className="flex-1 min-h-0">
        {mode === 'visualize' ? (
          <div className="p-4 h-full">
            <VisualizationView 
              palette={paletteToVisualize || []}
              onBack={() => handleModeChange(previousMode)}
            />
          </div>
        ) : mode === 'pantone' ? (
          <div className="p-4 h-full">
            <PantoneView 
              palette={paletteToSimulate || []}
              onBack={() => handleModeChange(previousMode)}
              onExport={handleNavigateToExport}
              onSave={handleOpenSaveModal}
            />
          </div>
        ) : mode === 'export' ? (
          <ExportPage palette={paletteToExport || []} onBack={() => handleModeChange(previousMode)} />
        ) : mode === 'convert' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 p-4 h-full">
              <ColorConverterControls color={converterColor} setColor={setConverterColor} />
              <ColorConverterResults color={converterColor} />
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridLayout} gap-4 p-4`}>
            {/* Column 1: Controls */}
            {mode === 'color' ? (
              <Controls
                baseColor={baseColor}
                setBaseColor={setBaseColor}
                harmonyRule={harmonyRule}
                setHarmonyRule={setHarmonyRule}
                harmonyDistance={harmonyDistance}
                setHarmonyDistance={setHarmonyDistance}
                analogousAngle={analogousAngle}
                setAnalogousAngle={setAnalogousAngle}
                triadicAngle={triadicAngle}
                setTriadicAngle={setTriadicAngle}
                splitComplementaryAngle={splitComplementaryAngle}
                setSplitComplementaryAngle={setSplitComplementaryAngle}
                rectangularTetradicAngle={rectangularTetradicAngle}
                setRectangularTetradicAngle={setRectangularTetradicAngle}
                analogousColorCount={analogousColorCount}
                setAnalogousColorCount={setAnalogousColorCount}
                monochromaticColorCount={monochromaticColorCount}
                setMonochromaticColorCount={setMonochromaticColorCount}
                lightnessColorCount={lightnessColorCount}
                setLightnessColorCount={setLightnessColorCount}
                onLiveStateChange={handleLiveStateChange}
                onInteractionEnd={handleInteractionEnd}
                simulatedPalette={simulatedHarmonyPalette}
                onEdit={handleEditCurrentPalette}
                onExport={() => handleNavigateToExport(harmonyPalette)}
                onSave={handleOpenSaveModal}
                onNavigateToPantone={handleNavigateToPantone}
                onNavigateToVisualize={() => handleNavigateToVisualize(harmonyPalette)}
              />
            ) : mode === 'image' ? (
              <ImageControls 
                onImageLoad={setImageSrc}
                onColorCountChange={setNumImageColors}
                initialColorCount={numImageColors}
                onRandomize={handleRandomizePoints}
                imageSrc={imageSrc}
                simulatedPalette={simulatedImagePalette}
                onEdit={handleEditCurrentPalette}
                onExport={() => handleNavigateToExport(imagePalette)}
                onSave={handleOpenSaveModal}
                onNavigateToPantone={handleNavigateToPantone}
                onNavigateToVisualize={() => handleNavigateToVisualize(imagePalette)}
              />
            ) : mode === 'editor' ? (
              <PaletteEditorControls 
                onGenerate={handleGenerateEditorPalette}
                onExport={() => handleNavigateToExport(editorPalette)}
                onSave={handleOpenSaveModal}
                simulatedPalette={simulatedEditorPalette}
                onNavigateToPantone={handleNavigateToPantone}
                onNavigateToVisualize={() => handleNavigateToVisualize(editorPalette)}
                editingSavedPaletteIndex={editingSavedPaletteIndex}
                onUpdatePalette={handleUpdatePalette}
              />
            ) : ( // mode === 'saved'
              <FolderSidebar 
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={setSelectedFolderId}
                  onCreateFolder={handleCreateFolder}
                  onRenameFolder={handleRenameFolder}
                  onDeleteFolder={requestDeleteFolder}
                  onDropOnFolder={handleDropPaletteOnFolder}
              />
            )}
            
            {/* Column 2: Main View */}
            {mode === 'editor' ? (
              <div className="lg:h-[calc(100vh-4rem)] flex flex-col gap-4">
                <div className="flex justify-end">
                  <div className="w-full max-w-xs">
                    <VisionSimulatorDropdown
                        visionDeficiency={visionDeficiency}
                        setVisionDeficiency={setVisionDeficiency}
                    />
                  </div>
                </div>
                <PaletteEditor 
                  palette={editorPalette}
                  setPalette={setEditorPalette}
                  lockedColors={lockedColors}
                  setLockedColors={setLockedColors}
                  applySimulation={applySimulation}
                />
              </div>
            ) : mode === 'saved' ? (
              <SavedPalettesView
                palettes={palettesForSavedView}
                folders={folders}
                onLoad={handleLoadPalette}
                onDelete={requestDeletePalette}
                selectedFolderId={selectedFolderId}
                currentFolderName={currentFolderName}
                onAddPaletteClick={() => setIsAddingPalettesMode(true)}
                onDropPalettes={(indices) => handleMovePalettesToFolder(indices, selectedFolderId)}
                onOpenMoveMenu={handleOpenMoveMenu}
                onExport={(index) => handleNavigateToExport(savedPalettes[index].palette)}
                onVisualize={(index) => handleNavigateToVisualize(savedPalettes[index].palette)}
              />
            ) : mode === 'color' ? (
              <main className="relative flex flex-col items-center justify-center gap-4 lg:h-[calc(100vh-4rem)] p-4">
                <div className="flex-shrink-0">
                  {visionDeficiency === VisionDeficiency.Normal ? (
                    <ColorWheel baseColor={baseColor} palette={harmonyPalette} onHueChange={handleLiveHueChange} onHueChangeEnd={handleInteractionEnd} className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96" />
                  ) : (
                    <div className="flex flex-row items-start justify-center gap-8">
                      <div className="flex flex-col items-center gap-3"><h2 className="text-base font-semibold text-gray-700">Normal Vision</h2><ColorWheel baseColor={baseColor} palette={harmonyPalette} onHueChange={handleLiveHueChange} onHueChangeEnd={handleInteractionEnd} className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64"/></div>
                      <div className="flex flex-col items-center gap-3"><h2 className="text-base font-semibold text-gray-700">{activeDeficiencyLabel}</h2><ColorWheel baseColor={simulatedBaseColor} palette={simulatedHarmonyPalette} className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64"/></div>
                    </div>
                  )}
                </div>
              </main>
            ) : mode === 'image' && imageSrc ? (
                <main className="relative flex items-center justify-center lg:h-[calc(100vh-4rem)] p-4">
                  <ImagePreview
                    src={imageSrc}
                    palette={liveImageState ? liveImageState.palette : imagePalette}
                    points={liveImageState ? liveImageState.points : samplePoints}
                    onPointDragStart={handlePointDragStart}
                    onPointUpdate={handleLivePointUpdate}
                    onPointDragEnd={handlePointDragEnd}
                    activePointIndex={activeSamplePoint}
                  />
                </main>
            ) : (
              <div className="flex items-center justify-center bg-gray-100 rounded-2xl lg:h-[calc(100vh-4rem)]">
                <div className="text-center text-gray-500"><i className="ri-image-add-line text-6xl"></i><p className="mt-4 font-medium">Upload an image to start</p><p className="text-sm">Generate a beautiful palette from your own images.</p></div>
              </div>
            )}
            
            {/* Column 3: Right Palette */}
            {showRightPalette && (
              <aside className="p-6 lg:h-[calc(100vh-4rem)] flex flex-col gap-4">
                <div className="w-full">
                    <VisionSimulatorDropdown
                        visionDeficiency={visionDeficiency}
                        setVisionDeficiency={setVisionDeficiency}
                    />
                </div>
                <Palette 
                    colors={finalPalette} 
                    onSwatchHover={mode === 'image' ? setActiveSamplePoint : undefined}
                />
              </aside>
            )}

            {mode === 'saved' && isAddingPalettesMode && (
              <AddPalettesView
                  onClose={() => setIsAddingPalettesMode(false)}
                  onAdd={(indices) => handleMovePalettesToFolder(indices, selectedFolderId)}
                  palettes={uncategorizedPalettes}
                  folderName={currentFolderName}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;