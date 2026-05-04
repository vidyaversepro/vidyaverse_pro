import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Eye, Undo2, Redo2,
    MousePointer2, Type, Square, Minus, Upload, QrCode,
    Grid3X3, ChevronDown, ZoomIn, ZoomOut, Maximize2,
    Bold, Italic, AlignLeft, AlignCenter, AlignRight,
    Trash2, ChevronUp, Copy, ArrowUpToLine, ArrowDownToLine, ChevronLeft, ChevronRight,
    Magnet, Layers
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Z_INDEX } from '@/styles/zIndex';
import { useEditorStore } from './store/editor.store';
import ElementsLibrary from './components/ElementsLibrary';
import LayersPanel from './components/LayersPanel';
import CanvasEditor from './components/CanvasEditor';
import PropertiesInspector from './components/PropertiesInspector';
import { useTemplate, useUpdateTemplate } from '@/lib/queries';

type Tool = 'select' | 'text' | 'shape' | 'line' | 'upload' | 'qrcode' | 'table' | 'layers';

const TOOLS: { id: Tool; icon: React.ElementType; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Cursor' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'shape', icon: Square, label: 'Shape' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'qrcode', icon: QrCode, label: 'QR Code' },
    { id: 'table', icon: Grid3X3, label: 'Table' },
    { id: 'layers', icon: Layers, label: 'Layers' },
];

export default function TemplateEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { 
        undo, redo, historyIndex, history, 
        pages, currentPageId, setCurrentPageId, addPage, addPageBefore, duplicatePage, deletePage,
        canvasConfig, setPages, setCanvasConfig, removeElement, updateElement, selectedNodeIds,
        isDirty, markClean,
        showGrid, snapToGrid, toggleGrid, toggleSnap, gridSizeMm, setGridSize,
    } = useEditorStore();

    // Derived state for the active page
    const currentPageIndex = pages.findIndex(p => p.id === currentPageId);
    const currentPage = pages[currentPageIndex] || pages[0];
    const elements = currentPage?.elements || [];
    const selectedElements = elements.filter(el => selectedNodeIds.includes(el.id));
    const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

    // Redirect /new/edit to /new dialog flow
    useEffect(() => {
        if (id === 'new') {
            navigate('/app/templates/new', { replace: true });
        }
    }, [id, navigate]);

    // Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [canvasSettingsOpen, setCanvasSettingsOpen] = useState(true);
    const [zoom, setZoom] = useState(85);
    const [templateName, setTemplateName] = useState('Untitled Template');
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const templateQuery = useTemplate(id as string, { enabled: id !== 'new' && !!id });
    const updateMutation = useUpdateTemplate();

    useEffect(() => {
        if (templateQuery.data) {
            if (templateQuery.data.name) setTemplateName(templateQuery.data.name);
            
            let content = templateQuery.data.content as any;
            if (typeof content === 'string') {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    console.error('Failed to parse template content:', e);
                }
            }
            
            if (content?.pages && Array.isArray(content.pages)) {
                setPages(content.pages);
            } else if (content?.elements && Array.isArray(content.elements)) {
                setPages([{ id: 'page_1', name: 'Page 1', elements: content.elements }]);
            }
            if (content?.canvasConfig) setCanvasConfig(content.canvasConfig);
        }
    }, [templateQuery.data, setPages, setCanvasConfig]);

    const handleSave = async () => {
        if (!id || id === 'new') {
            toast({ title: 'Please create a template first via the templates list', variant: 'destructive' });
            return;
        }
        try {
            await updateMutation.mutateAsync({ id, data: { content: { pages, canvasConfig } } });
            const now = new Date();
            setLastSaved(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
            markClean();
            toast({ title: 'Template saved successfully' });
        } catch {
            toast({ title: 'Failed to save template', variant: 'destructive' });
        }
    };

    const canvasLabelW = Math.round(canvasConfig.widthMm * 10) / 10;
    const canvasLabelH = Math.round(canvasConfig.heightMm * 10) / 10;
    const canvasLabel = `${canvasLabelW} × ${canvasLabelH} mm`;

    return (
        <div className="bg-[#f8f9fa] text-[#191c1d] h-screen flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* ── TOP NAVBAR ─────────────────────────────────────────────────── */}
            <header className="fixed top-0 w-full z-50 flex flex-wrap justify-between items-center px-4 sm:px-6 bg-white/70 backdrop-blur-md min-h-16 py-2 sm:py-0 border-b border-white/50 gap-2"
                style={{ boxShadow: '0px 4px 20px rgba(25,28,29,0.04)' }}>
                {/* Left: Back + Title */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                        onClick={() => navigate('/app/templates')}
                        className="p-2 hover:bg-slate-100/50 rounded-lg transition-colors active:scale-95 duration-150"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex flex-col">
                        <input
                            className="bg-transparent border-none p-0 font-bold text-[#b7102a] tracking-tighter text-lg focus:ring-0 w-48 focus:outline-none"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium flex items-center gap-1.5">
                            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                            {lastSaved ? (isDirty ? 'Unsaved changes' : `Saved at ${lastSaved}`) : id === 'new' ? 'Unsaved draft' : 'Draft'}
                        </span>
                    </div>
                </div>

                {/* Center: Canvas size badge */}
                <div className="hidden sm:block absolute left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-slate-50 border-b-2 border-[#b7102a] text-[#b7102a] font-bold text-sm tracking-tight">
                        {canvasLabel}
                    </span>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Undo / Redo / Zoom */}
                    <div className="flex items-center bg-slate-50/50 rounded-lg p-1 mr-2">
                        <button className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-30" onClick={undo} disabled={historyIndex === 0} title="Undo">
                            <Undo2 className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-30" onClick={redo} disabled={historyIndex === history.length - 1} title="Redo">
                            <Redo2 className="w-4 h-4 text-slate-500" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button className="flex items-center gap-1 px-2 py-1.5 hover:bg-white rounded transition-colors text-slate-500 text-sm font-medium">
                            {zoom}%
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleGrid}
                                    className={cn('p-1.5 rounded transition-colors', showGrid ? 'bg-[#ffdad8] text-[#b7102a]' : 'hover:bg-white text-slate-400')}
                                    title="Toggle Grid"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle Grid</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleSnap}
                                    className={cn('p-1.5 rounded transition-colors', snapToGrid ? 'bg-[#ffdad8] text-[#b7102a]' : 'hover:bg-white text-slate-400')}
                                    title="Snap to Grid"
                                >
                                    <Magnet className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Snap to Grid</TooltipContent>
                        </Tooltip>
                    </div>
                    <button className="px-4 py-2 text-[#b7102a] font-medium text-sm hover:bg-slate-100/50 rounded-lg transition-colors flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="px-6 py-2 bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {updateMutation.isPending ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </header>

            {/* ── MAIN 3-PANEL LAYOUT ────────────────────────────────────────── */}
            <main className="flex flex-1 mt-16 overflow-hidden">

                {/* LEFT ICON RAIL */}
                <nav className="fixed left-0 top-16 h-[calc(100vh-64px)] w-16 flex flex-col items-center py-4 bg-[#f3f4f5] border-r border-slate-200/60"
                    style={{ zIndex: Z_INDEX.STUDIO_LEFT_PANEL, boxShadow: '2px 0 8px rgba(25,28,29,0.04)' }}>
                    <div className="flex flex-col gap-1 w-full px-2">
                        {TOOLS.map(({ id: toolId, icon: Icon, label }) => (
                            <button
                                key={toolId}
                                onClick={() => {
                                    setActiveTool(toolId);
                                    if (toolId !== 'select') setLeftPanelOpen(true);
                                }}
                                className={cn(
                                    'rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200',
                                    activeTool === toolId
                                        ? 'bg-[#ffdad8] text-[#410007]'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                )}
                                title={label}
                            >
                                <Icon className="w-5 h-5" strokeWidth={activeTool === toolId ? 2.5 : 1.8} />
                                <span className="font-medium uppercase tracking-tighter mt-1" style={{ fontSize: '9px' }}>{label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                {/* LEFT SLIDING ELEMENTS PANEL */}
                <AnimatePresence>
                    {leftPanelOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="ml-16 bg-white border-r border-slate-100 overflow-y-auto shrink-0 overflow-hidden"
                            style={{ zIndex: Z_INDEX.STUDIO_LEFT_PANEL, boxShadow: '2px 0 8px rgba(25,28,29,0.04)' }}
                        >
                            <div style={{ width: 280 }}>
                                {activeTool === 'layers' ? <LayersPanel /> : <ElementsLibrary />}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Without AnimatePresence, reserve rail space */}
                {!leftPanelOpen && <div className="ml-16" />}

                {/* CENTER CANVAS WORKSPACE */}
                <section className="flex-1 relative overflow-auto flex items-center justify-center"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                        backgroundColor: '#f0f1f2',
                    }}>

                    {/* The Konva canvas */}
                    <CanvasEditor zoom={zoom} />
                    
                    {/* Floating Page Manager Panel */}
                    <TooltipProvider delayDuration={300}>
                        <div 
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 flex-wrap justify-center p-2 rounded-2xl shadow-2xl border border-white/50"
                            style={{ zIndex: Z_INDEX.STUDIO_FLOATING_TOOLS, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
                        >
                            <div className="flex items-center justify-between min-w-[100px] gap-2 px-2 border-r border-slate-200">
                                <button 
                                    onClick={() => setCurrentPageId(pages[currentPageIndex - 1]?.id)} 
                                    disabled={currentPageIndex === 0}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 text-slate-600"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-semibold tracking-wide text-slate-700 select-none">
                                    {currentPageIndex + 1} / {pages.length}
                                </span>
                                <button 
                                    onClick={() => setCurrentPageId(pages[currentPageIndex + 1]?.id)} 
                                    disabled={currentPageIndex === pages.length - 1}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 text-slate-600"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-1 px-1 border-r border-slate-200">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => addPageBefore(currentPageId)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
                                            <ArrowUpToLine className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Add blank page before</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => addPage(currentPageId)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
                                            <ArrowDownToLine className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Add blank page after</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center gap-1 px-1 border-r border-slate-200">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => duplicatePage(currentPageId)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate this page</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center px-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button 
                                            onClick={() => deletePage(currentPageId)} 
                                            disabled={pages.length <= 1}
                                            className="p-2 hover:bg-[#ffdad8] hover:text-[#ba1a1a] rounded-xl transition-colors text-slate-500 disabled:opacity-30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete this page</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </TooltipProvider>

                    {/* Floating context toolbar (shown when element is selected) */}
                    <AnimatePresence>
                        {selectedElement && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="fixed top-[72px] left-1/2 -translate-x-1/2 flex items-center gap-1 flex-wrap justify-center p-1.5 rounded-xl shadow-xl border border-white/50"
                                style={{ zIndex: Z_INDEX.STUDIO_FLOATING_TOOLS, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
                            >
                                {selectedElement.type === 'text' && (
                                    <>
                                        <button
                                            onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                            className={cn('p-1.5 hover:bg-white rounded transition-colors', selectedElement.fontWeight === 'bold' ? 'bg-[#ffdad8] text-[#410007]' : '')}
                                        ><Bold className="w-4 h-4" /></button>
                                        <button className="p-1.5 hover:bg-white rounded transition-colors">
                                            <Italic className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-slate-200/80 mx-1" />
                                        {(['left', 'center', 'right'] as const).map((a) => (
                                            <button
                                                key={a}
                                                onClick={() => updateElement(selectedElement.id, { align: a })}
                                                className={cn('p-1.5 hover:bg-white rounded transition-colors', selectedElement.align === a ? 'bg-slate-100' : '')}
                                            >
                                                {a === 'left' && <AlignLeft className="w-4 h-4" />}
                                                {a === 'center' && <AlignCenter className="w-4 h-4" />}
                                                {a === 'right' && <AlignRight className="w-4 h-4" />}
                                            </button>
                                        ))}
                                        <div className="w-px h-4 bg-slate-200/80 mx-1" />
                                        <button className="px-2 py-1 text-xs font-bold hover:bg-white rounded">
                                            {selectedElement.fontSize || 16}px
                                        </button>
                                        <div
                                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm cursor-pointer mx-1"
                                            style={{ backgroundColor: selectedElement.fill || '#191c1d' }}
                                        />
                                    </>
                                )}
                                <div className="w-px h-4 bg-slate-200/80 mx-1" />
                                <button
                                    onClick={() => removeElement(selectedElement.id)}
                                    className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                                ><Trash2 className="w-4 h-4" /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Floating zoom control */}
                    <div className="fixed bottom-6 right-4 sm:right-[304px] flex items-center gap-3 px-4 py-2 rounded-full border border-white z-30"
                        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="text-slate-500 hover:text-[#b7102a] transition-colors">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 w-9 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="text-slate-500 hover:text-[#b7102a] transition-colors">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-200" />
                        <button onClick={() => setZoom(100)} className="text-slate-500 hover:text-[#b7102a] transition-colors" title="Fit to screen">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* RIGHT PROPERTIES PANEL */}
                <aside className="w-72 bg-white border-l border-slate-100 flex flex-col z-30 shrink-0"
                    style={{ boxShadow: '-2px 0 8px rgba(25,28,29,0.04)', zIndex: Z_INDEX.STUDIO_RIGHT_PANEL }}>

                    {/* Main properties */}
                    <div className="flex-1 overflow-y-auto">
                        <PropertiesInspector />
                    </div>

                    {/* Canvas Settings collapsible footer */}
                    <div className="border-t border-slate-100 bg-slate-50/50">
                        <button
                            onClick={() => setCanvasSettingsOpen(!canvasSettingsOpen)}
                            className="flex items-center justify-between w-full px-6 py-4"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Canvas Settings</span>
                            {canvasSettingsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        <AnimatePresence>
                            {canvasSettingsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-medium block mb-1">Width (mm)</label>
                                                <input
                                                    type="number"
                                                    value={canvasConfig.widthMm}
                                                    onChange={(e) => setCanvasConfig({ widthMm: Number(e.target.value) })}
                                                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#b7102a]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-medium block mb-1">Height (mm)</label>
                                                <input
                                                    type="number"
                                                    value={canvasConfig.heightMm}
                                                    onChange={(e) => setCanvasConfig({ heightMm: Number(e.target.value) })}
                                                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#b7102a]"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-600">Grid Size (mm)</span>
                                            <input
                                                type="number"
                                                value={gridSizeMm}
                                                onChange={(e) => setGridSize(Number(e.target.value))}
                                                min={1}
                                                max={50}
                                                className="w-16 text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 text-center focus:outline-none focus:ring-1 focus:ring-[#b7102a]"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-600">Background Color</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={canvasConfig.bgColor || '#ffffff'}
                                                    onChange={(e) => setCanvasConfig({ bgColor: e.target.value })}
                                                    className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5"
                                                />
                                                <span className="text-xs font-mono text-slate-500">{canvasConfig.bgColor || '#ffffff'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>
            </main>
        </div>
    );
}
