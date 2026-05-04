import { useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Upload, Loader2, Copy, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { useEditorStore, TemplateElement } from '../store/editor.store';
import { useParams } from 'react-router-dom';
import { useUploadTemplateAsset } from '@/lib/queries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Tab = 'style' | 'position' | 'effects';

const BRAND_COLORS = ['#b7102a', '#191c1d', '#64748b', '#006860', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

export default function PropertiesInspector() {
    const [activeTab, setActiveTab] = useState<Tab>('style');
    const [bgTarget, setBgTarget] = useState<'all' | 'page'>('page');
    const { id: templateId } = useParams();
    const store = useEditorStore();
    const currentPage = store.pages.find(p => p.id === store.currentPageId);
    const elements = currentPage?.elements || [];
    const { selectedNodeIds, updateElement, removeElement, canvasConfig, setCanvasConfig, updatePageBackground, moveElement, duplicateElement } = store;
    const selectedElements = elements.filter(el => selectedNodeIds.includes(el.id));
    const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
    
    const { mutate: uploadAsset, isPending: isUploading } = useUploadTemplateAsset();

    const activeBgColor = bgTarget === 'page' ? (currentPage?.bgColor || canvasConfig.bgColor || '#ffffff') : (canvasConfig.bgColor || '#ffffff');
    const activeBgImage = bgTarget === 'page' ? (currentPage?.bgImage !== undefined ? (currentPage.bgImage === null ? undefined : currentPage.bgImage) : canvasConfig.bgImage) : canvasConfig.bgImage;

    const handleBgColorChange = (color: string) => {
        if (bgTarget === 'all') setCanvasConfig({ bgColor: color });
        else updatePageBackground(store.currentPageId, { bgColor: color });
    };

    const handleBgRemove = () => {
        if (bgTarget === 'all') setCanvasConfig({ bgImage: undefined });
        else updatePageBackground(store.currentPageId, { bgImage: null });
    };

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !templateId) return;

        uploadAsset({ id: templateId, file }, {
            onSuccess: (url: string) => {
                if (bgTarget === 'all') setCanvasConfig({ bgImage: url });
                else updatePageBackground(store.currentPageId, { bgImage: url });
            }
        });
    };

    const update = (updates: Partial<TemplateElement>) => {
        if (selectedElement) updateElement(selectedElement.id, updates);
    };

    // ── Multi-select Properties ──────────────────────────────
    if (selectedNodeIds.length > 1) {
        return (
            <div className="flex flex-col h-full bg-slate-50/50 items-center justify-center text-center p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-3 text-[#b7102a]">
                    <Copy className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">{selectedNodeIds.length} Elements Selected</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">Group editing features coming soon.</p>
                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => {
                            selectedNodeIds.forEach(id => removeElement(id));
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors border border-red-100 bg-white"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete All
                    </button>
                </div>
            </div>
        );
    }

    // ── Canvas Properties (no element selected) ──────────────
    if (!selectedElement) {
        return (
            <div className="flex flex-col h-full bg-slate-50/50" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="px-6 py-4 border-b border-slate-100 bg-white">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#191c1d]">Canvas Properties</h3>
                </div>
                
                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                        {/* Target Selection Toggle */}
                        <div className="flex bg-slate-50 p-1 rounded-xl">
                            <button
                                onClick={() => setBgTarget('all')}
                                className={cn(
                                    'flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                                    bgTarget === 'all' ? 'bg-white shadow-sm text-[#b7102a]' : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                All Pages
                            </button>
                            <button
                                onClick={() => setBgTarget('page')}
                                className={cn(
                                    'flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
                                    bgTarget === 'page' ? 'bg-white shadow-sm text-[#b7102a]' : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                This Page Only
                                {(currentPage?.bgImage !== undefined || currentPage?.bgColor !== undefined) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7102a]" />
                                )}
                            </button>
                        </div>

                        {/* Background Color */}
                        <section>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Background Color</label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    value={activeBgColor}
                                    onChange={(e) => handleBgColorChange(e.target.value)}
                                    className="w-10 h-10 rounded-xl cursor-pointer bg-white border border-slate-200 p-1"
                                />
                                <input
                                    type="text"
                                    value={activeBgColor}
                                    onChange={(e) => handleBgColorChange(e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#b7102a]"
                                />
                            </div>
                        </section>

                        {/* Background Image */}
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Background Image/SVG</label>
                                {activeBgImage && (
                                    <button 
                                        onClick={handleBgRemove}
                                        className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            
                            {activeBgImage ? (
                                <div className="relative group rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                                    <img src={activeBgImage} alt="Canvas Background" className="max-w-full max-h-full object-contain" />
                                </div>
                            ) : (
                                <label className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center py-8 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                                    {isUploading ? (
                                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-2" />
                                    ) : (
                                        <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                    )}
                                    <span className="text-xs font-semibold text-slate-500">{isUploading ? 'Uploading...' : 'Upload Image or SVG'}</span>
                                    <input type="file" accept="image/png, image/jpeg, image/svg+xml, image/webp" className="hidden" onChange={handleBgUpload} disabled={isUploading} />
                                </label>
                            )}
                        </section>
                    </div>
                </ScrollArea>
            </div>
        );
    }

    // ── Element Properties ────────────────────────────────────
    return (
        <div className="flex flex-col h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Element header with quick actions */}
            <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{selectedElement.type}</span>
                    {selectedElement.name && <span className="ml-2 text-xs text-slate-500">{selectedElement.name}</span>}
                </div>
                <div className="flex items-center gap-0.5">
                    <button onClick={() => update({ locked: !selectedElement.locked })} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title={selectedElement.locked ? 'Unlock' : 'Lock'}>
                        {selectedElement.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <button onClick={() => update({ visible: !selectedElement.visible })} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title={selectedElement.visible ? 'Hide' : 'Show'}>
                        {selectedElement.visible ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 shrink-0">
                {(['style', 'position', 'effects'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            'flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors border-b-2',
                            activeTab === tab
                                ? 'border-[#b7102a] text-[#b7102a]'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-7">

                    {/* ── STYLE TAB ─────────────────────────────── */}
                    {activeTab === 'style' && (
                        <>
                            {/* Text Typography */}
                            {selectedElement.type === 'text' && (
                                <section>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Typography</label>
                                    <div className="space-y-3">
                                        {/* Font & Size */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 relative">
                                                <select
                                                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-3 text-sm font-semibold focus:ring-0 appearance-none"
                                                    value={selectedElement.fontFamily || 'Inter'}
                                                    onChange={(e) => update({ fontFamily: e.target.value })}
                                                >
                                                    <option value="Inter">Inter</option>
                                                    <option value="Georgia">Georgia</option>
                                                    <option value="Helvetica">Helvetica</option>
                                                    <option value="Times New Roman">Times New Roman</option>
                                                    <option value="Courier New">Courier New</option>
                                                    <option value="Roboto">Roboto</option>
                                                    <option value="Outfit">Outfit</option>
                                                </select>
                                            </div>
                                            <div className="w-20 flex items-center bg-slate-50 rounded-xl px-2 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent border-none text-sm font-bold focus:outline-none text-center"
                                                    value={selectedElement.fontSize || 16}
                                                    onChange={(e) => update({ fontSize: Number(e.target.value) })}
                                                />
                                                <span className="text-slate-400 text-xs">px</span>
                                            </div>
                                        </div>

                                        {/* Alignment + Bold */}
                                        <div className="flex bg-slate-50 p-1 rounded-xl">
                                            {[
                                                { v: 'left', Icon: AlignLeft },
                                                { v: 'center', Icon: AlignCenter },
                                                { v: 'right', Icon: AlignRight },
                                                { v: 'justify', Icon: AlignJustify },
                                            ].map(({ v, Icon }) => (
                                                <button
                                                    key={v}
                                                    onClick={() => update({ align: v as 'left' | 'center' | 'right' | 'justify' })}
                                                    className={cn(
                                                        'flex-1 py-2 rounded-lg transition-all',
                                                        selectedElement.align === v ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4 mx-auto text-slate-600" />
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => update({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                                className={cn(
                                                    'flex-1 py-2 rounded-lg transition-all text-sm font-extrabold',
                                                    selectedElement.fontWeight === 'bold' ? 'bg-[#ffdad8] text-[#410007]' : 'hover:bg-white/50 text-slate-500'
                                                )}
                                            >B</button>
                                        </div>

                                        {/* Text content & Smart Variables Hub */}
                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-[10px] text-slate-400 font-medium block">Content</label>
                                                {/* Smart Variables Hub */}
                                                <div className="group relative">
                                                    <button type="button" className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold transition-colors">
                                                        <span>✨</span> Insert Variable
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                                        <div className="text-[9px] uppercase font-bold text-slate-400 mb-2 px-2">Student Data</div>
                                                        <div className="space-y-1">
                                                            {['{{studentName}}', '{{admissionNo}}', '{{rollNo}}', '{{className}}', '{{dob}}', '{{bloodGroup}}', '{{institutionName}}'].map((variable) => (
                                                                <button
                                                                    key={variable}
                                                                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs text-slate-600 font-mono transition-colors"
                                                                    onClick={() => update({ text: (selectedElement.text || '') + variable })}
                                                                >
                                                                    {variable}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <textarea
                                                value={selectedElement.text || ''}
                                                onChange={(e) => update({ text: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b7102a] resize-none"
                                                rows={3}
                                                placeholder="Enter text or variables..."
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Color */}
                            {(selectedElement.type === 'text' || selectedElement.type === 'shape') && (
                                <section>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">
                                        {selectedElement.type === 'text' ? 'Text Color' : 'Fill Color'}
                                    </label>
                                    <div className="grid grid-cols-8 gap-2 mb-3">
                                        {BRAND_COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => update({ fill: color })}
                                                className="w-8 h-8 rounded-lg hover:scale-110 transition-transform shadow-sm"
                                                style={{
                                                    backgroundColor: color,
                                                    outline: (selectedElement.fill === color) ? `2px solid ${color}` : 'none',
                                                    outlineOffset: '2px',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2">
                                        <input
                                            type="color"
                                            value={selectedElement.fill || '#191c1d'}
                                            onChange={(e) => update({ fill: e.target.value })}
                                            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={selectedElement.fill || '#191c1d'}
                                            onChange={(e) => update({ fill: e.target.value })}
                                            className="flex-1 bg-transparent text-sm font-mono focus:outline-none text-slate-700"
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Stroke (shapes & lines) */}
                            {(selectedElement.type === 'shape' || selectedElement.type === 'line') && (
                                <section>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Border / Stroke</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={selectedElement.stroke || '#000000'}
                                            onChange={(e) => update({ stroke: e.target.value })}
                                            className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-1"
                                        />
                                        <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                                            <span className="text-xs text-slate-400">Width</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                value={selectedElement.strokeWidth || 0}
                                                onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
                                                className="w-full bg-transparent text-sm font-bold focus:outline-none text-slate-700 text-right"
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Image Source */}
                            {selectedElement.type === 'image' && (
                                <section>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Image Source</label>
                                    <input
                                        type="text"
                                        value={selectedElement.src || ''}
                                        onChange={(e) => update({ src: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#b7102a] border-none"
                                    />
                                </section>
                            )}

                            {/* QR Data */}
                            {selectedElement.type === 'qr' && (
                                <section>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">QR Data</label>
                                    <input
                                        type="text"
                                        value={selectedElement.data || ''}
                                        onChange={(e) => update({ data: e.target.value })}
                                        placeholder="{{studentId}} or custom URL"
                                        className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#b7102a] border-none"
                                    />
                                    <div className="mt-3">
                                        <label className="text-[10px] text-slate-400 font-medium block mb-1">Error Correction</label>
                                        <select
                                            value={selectedElement.errorCorrection || 'M'}
                                            onChange={(e) => update({ errorCorrection: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
                                            className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-3 text-sm focus:ring-0"
                                        >
                                            <option value="L">Low (7%)</option>
                                            <option value="M">Medium (15%)</option>
                                            <option value="Q">Quartile (25%)</option>
                                            <option value="H">High (30%)</option>
                                        </select>
                                    </div>
                                </section>
                            )}

                            {/* Barcode Data */}
                            {selectedElement.type === 'barcode' && (
                                <section>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Barcode</label>
                                    <input
                                        type="text"
                                        value={selectedElement.data || ''}
                                        onChange={(e) => update({ data: e.target.value })}
                                        placeholder="{{admissionNo}}"
                                        className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#b7102a] border-none mb-3"
                                    />
                                    <select
                                        value={selectedElement.format || 'CODE128'}
                                        onChange={(e) => update({ format: e.target.value as 'CODE128' | 'CODE39' | 'EAN13' | 'QR' })}
                                        className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-3 text-sm focus:ring-0"
                                    >
                                        <option value="CODE128">CODE128</option>
                                        <option value="CODE39">CODE39</option>
                                        <option value="EAN13">EAN-13</option>
                                    </select>
                                </section>
                            )}
                        </>
                    )}

                    {/* ── POSITION TAB ──────────────────────────── */}
                    {activeTab === 'position' && (
                        <>
                            <section>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Position & Size</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'X', key: 'x', value: selectedElement.x },
                                        { label: 'Y', key: 'y', value: selectedElement.y },
                                        { label: 'W', key: 'width', value: selectedElement.width },
                                        { label: 'H', key: 'height', value: selectedElement.height },
                                        { label: 'Rotation', key: 'rotation', value: selectedElement.rotation || 0 },
                                    ].map(({ label, key, value }) => (
                                        <div key={key}>
                                            <label className="text-[10px] text-slate-400 font-medium block mb-1">{label}</label>
                                            <input
                                                type="number"
                                                value={Math.round(value as number)}
                                                onChange={(e) => update({ [key]: Number(e.target.value) } as Partial<TemplateElement>)}
                                                className="w-full text-xs font-bold bg-slate-50 border-none rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#b7102a]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Opacity</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedElement.opacity ?? 1}
                                        onChange={(e) => update({ opacity: Number(e.target.value) })}
                                        className="flex-1 accent-[#b7102a]"
                                    />
                                    <span className="text-sm font-bold w-10 text-right">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                                </div>
                            </section>

                            {/* Layer ordering */}
                            <section>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Layer Order</label>
                                <div className="flex gap-1.5">
                                    <button onClick={() => moveElement(selectedElement.id, 'top')} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1 text-xs font-medium text-slate-600" title="Bring to front">
                                        <ChevronsUp className="w-3.5 h-3.5" /> Top
                                    </button>
                                    <button onClick={() => moveElement(selectedElement.id, 'up')} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1 text-xs font-medium text-slate-600" title="Move up">
                                        <ArrowUp className="w-3.5 h-3.5" /> Up
                                    </button>
                                    <button onClick={() => moveElement(selectedElement.id, 'down')} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1 text-xs font-medium text-slate-600" title="Move down">
                                        <ArrowDown className="w-3.5 h-3.5" /> Down
                                    </button>
                                    <button onClick={() => moveElement(selectedElement.id, 'bottom')} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1 text-xs font-medium text-slate-600" title="Send to back">
                                        <ChevronsDown className="w-3.5 h-3.5" /> Bot
                                    </button>
                                </div>
                            </section>
                        </>
                    )}

                    {/* ── EFFECTS TAB ───────────────────────────── */}
                    {activeTab === 'effects' && (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">✨</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Effects coming soon</p>
                            <p className="text-xs text-slate-400 mt-1">Shadow, blur and glow effects will be available in the next update.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer: Duplicate + Delete */}
            <div className="border-t border-slate-100 p-3 shrink-0 flex gap-2">
                <button
                    onClick={() => duplicateElement(selectedElement.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    <Copy className="w-4 h-4" />
                    Duplicate
                </button>
                <button
                    onClick={() => removeElement(selectedElement.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Remove
                </button>
            </div>
        </div>
    );
}
