import { create } from 'zustand';

// ─── V2 Element Types ─────────────────────────────────────────────
// These are the _editor-local_ element types — a pragmatic superset
// of the shared TemplateDocument schema that includes Konva-specific
// rendering properties (shapeType, src as flat fields etc.).
// When SAVING, we serialize to the strict TemplateDocument format.
// When LOADING, we hydrate from it.

export type ElementType = 'text' | 'image' | 'shape' | 'line' | 'qr' | 'barcode' | 'table';

export interface TemplateElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    zIndex: number;
    locked: boolean;
    visible: boolean;
    name?: string;

    // ── Text-specific ─────────────────────────
    text?: string;               // rendered label / Handlebars template
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    fill?: string;               // text color
    align?: 'left' | 'center' | 'right' | 'justify';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    lineHeight?: number;
    letterSpacing?: number;
    textDecoration?: 'none' | 'underline' | 'line-through';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    wordWrap?: boolean;
    overflow?: 'visible' | 'hidden' | 'clip';

    // ── Image-specific ────────────────────────
    src?: string;
    fallbackSrc?: string;
    objectFit?: 'fill' | 'contain' | 'cover' | 'none';
    aspectRatioLocked?: boolean;

    // ── Shape-specific ────────────────────────
    shapeType?: 'rect' | 'circle' | 'ellipse' | 'rounded-rectangle' | 'triangle';
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;

    // ── Line-specific ─────────────────────────
    direction?: 'horizontal' | 'vertical' | 'diagonal';
    strokeDash?: number[];

    // ── QR-specific ───────────────────────────
    data?: string;
    errorCorrection?: 'L' | 'M' | 'Q' | 'H';
    fgColor?: string;
    bgColor?: string;

    // ── Barcode-specific ──────────────────────
    format?: 'CODE128' | 'CODE39' | 'EAN13' | 'QR';
    showText?: boolean;
    lineColor?: string;
    background?: string;
}

export interface TemplatePage {
    id: string;
    name: string;
    elements: TemplateElement[];
    bgImage?: string | null;
    bgColor?: string;
}

export interface CanvasConfig {
    widthMm: number;
    heightMm: number;
    scale: number;
    bgImage?: string;
    bgColor?: string;
    orientation?: 'portrait' | 'landscape';
    dpi?: 72 | 150 | 300;
    bleedMm?: number;
}

interface EditorState {
    pages: TemplatePage[];
    currentPageId: string;
    selectedNodeIds: string[];
    activeSide: 'front' | 'back';
    canvasConfig: CanvasConfig;
    history: TemplatePage[][];
    historyIndex: number;
    isDirty: boolean;

    // Grid & Snap
    showGrid: boolean;
    snapToGrid: boolean;
    gridSizeMm: number;

    // Element Actions (operate on currentPageId)
    addElement: (element: Partial<TemplateElement>) => void;
    updateElement: (id: string, updates: Partial<TemplateElement>) => void;
    removeElement: (id: string) => void;
    setSelectedElementId: (id: string | null) => void;
    setSelectedNodeIds: (ids: string[]) => void;
    toggleNodeSelection: (id: string) => void;
    selectAllNodes: () => void;
    moveElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
    setElementsOrder: (orderedIds: string[]) => void;
    duplicateElement: (id: string) => void;

    // Page Actions
    setPages: (pages: TemplatePage[]) => void;
    setCurrentPageId: (id: string) => void;
    updatePageBackground: (pageId: string, bg: { bgColor?: string; bgImage?: string | null }) => void;
    addPage: (afterPageId?: string) => void;
    addPageBefore: (beforePageId: string) => void;
    duplicatePage: (pageId: string) => void;
    deletePage: (pageId: string) => void;

    // Active Side Actions
    setActiveSide: (side: 'front' | 'back') => void;
    getActiveSidePage: () => TemplatePage | undefined;
    hasBackSide: () => boolean;
    ensureBackSide: () => void;

    // Grid & Snap Actions
    toggleGrid: () => void;
    toggleSnap: () => void;
    setGridSize: (size: number) => void;

    // Canvas Config
    setCanvasConfig: (config: Partial<CanvasConfig>) => void;
    
    // History Actions
    undo: () => void;
    redo: () => void;
    saveHistory: () => void;
    markClean: () => void;
}

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default values for new elements by type
const ELEMENT_DEFAULTS: Record<ElementType, Partial<TemplateElement>> = {
    text: {
        text: 'New Text',
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: '#191c1d',
        align: 'left',
        verticalAlign: 'top',
        lineHeight: 1.4,
        letterSpacing: 0,
        textDecoration: 'none',
        textTransform: 'none',
        wordWrap: true,
        overflow: 'visible',
        width: 200,
        height: 40,
    },
    image: {
        src: '',
        fallbackSrc: '',
        objectFit: 'cover',
        aspectRatioLocked: true,
        width: 150,
        height: 150,
    },
    shape: {
        shapeType: 'rect',
        fill: '#e1e3e4',
        stroke: '',
        strokeWidth: 0,
        cornerRadius: 0,
        width: 120,
        height: 80,
    },
    line: {
        direction: 'horizontal',
        stroke: '#191c1d',
        strokeWidth: 2,
        width: 200,
        height: 2,
    },
    qr: {
        data: '{{studentId}}',
        errorCorrection: 'M',
        fgColor: '#000000',
        bgColor: '#ffffff',
        width: 100,
        height: 100,
    },
    barcode: {
        data: '{{admissionNo}}',
        format: 'CODE128',
        showText: true,
        lineColor: '#000000',
        background: '#ffffff',
        width: 200,
        height: 60,
    },
    table: {
        width: 300,
        height: 150,
    },
};

export const useEditorStore = create<EditorState>((set, get) => ({
    pages: [{ id: 'page_1', name: 'Page 1', elements: [] }],
    currentPageId: 'page_1',
    selectedNodeIds: [],
    activeSide: 'front',
    showGrid: false,
    snapToGrid: false,
    gridSizeMm: 5,
    canvasConfig: {
        widthMm: 210,
        heightMm: 297,
        scale: 1,
        bgColor: '#ffffff',
        orientation: 'portrait',
        dpi: 96 as 72,
        bleedMm: 0,
    },
    history: [[{ id: 'page_1', name: 'Page 1', elements: [] }]],
    historyIndex: 0,
    isDirty: false,

    setPages: (pages) => {
        set({ pages, currentPageId: pages[0]?.id || 'page_1', selectedNodeIds: [] });
        get().saveHistory();
    },

    setCurrentPageId: (id) => {
        set({ currentPageId: id, selectedNodeIds: [] });
    },

    updatePageBackground: (pageId, bg) => {
        const { pages } = get();
        const newPages = pages.map((p) => {
            if (p.id !== pageId) return p;
            const updated = { ...p };
            if (bg.bgColor !== undefined) updated.bgColor = bg.bgColor;
            if (bg.bgImage !== undefined) updated.bgImage = bg.bgImage;
            return updated;
        });
        set({ pages: newPages, isDirty: true });
        get().saveHistory();
    },

    addPage: (afterPageId) => {
        const { pages } = get();
        const newPage: TemplatePage = { id: generateId(), name: `Page ${pages.length + 1}`, elements: [] };
        
        let newPages = [...pages];
        if (afterPageId) {
            const idx = pages.findIndex(p => p.id === afterPageId);
            if (idx >= 0) newPages.splice(idx + 1, 0, newPage);
            else newPages.push(newPage);
        } else {
            newPages.push(newPage);
        }

        newPages = newPages.map((p, i) => ({ ...p, name: `Page ${i + 1}` }));
        set({ pages: newPages, currentPageId: newPage.id, selectedNodeIds: [], isDirty: true });
        get().saveHistory();
    },

    addPageBefore: (beforePageId) => {
        const { pages } = get();
        const newPage: TemplatePage = { id: generateId(), name: `Page`, elements: [] };
        const idx = pages.findIndex(p => p.id === beforePageId);
        
        let newPages = [...pages];
        if (idx >= 0) newPages.splice(idx, 0, newPage);
        else newPages.unshift(newPage);

        newPages = newPages.map((p, i) => ({ ...p, name: `Page ${i + 1}` }));
        set({ pages: newPages, currentPageId: newPage.id, selectedNodeIds: [], isDirty: true });
        get().saveHistory();
    },

    duplicatePage: (pageId) => {
        const { pages } = get();
        const idx = pages.findIndex(p => p.id === pageId);
        if (idx === -1) return;

        const srcPage = pages[idx];
        const clonedElements = srcPage.elements.map(el => ({ ...el, id: generateId() }));
        const newPage: TemplatePage = {
            id: generateId(),
            name: `${srcPage.name} Copy`,
            elements: clonedElements,
            bgImage: srcPage.bgImage,
            bgColor: srcPage.bgColor,
        };
        
        let newPages = [...pages];
        newPages.splice(idx + 1, 0, newPage);
        newPages = newPages.map((p, i) => ({ ...p, name: `Page ${i + 1}` }));

        set({ pages: newPages, currentPageId: newPage.id, selectedNodeIds: [], isDirty: true });
        get().saveHistory();
    },

    deletePage: (pageId) => {
        const { pages, currentPageId } = get();
        if (pages.length <= 1) return;

        const newPages = pages.filter(p => p.id !== pageId).map((p, i) => ({ ...p, name: `Page ${i + 1}` }));
        let newCurrentId = currentPageId;

        if (currentPageId === pageId) {
            const oldIdx = pages.findIndex(p => p.id === pageId);
            newCurrentId = newPages[oldIdx > 0 ? oldIdx - 1 : 0].id;
        }

        set({ pages: newPages, currentPageId: newCurrentId, selectedNodeIds: [], isDirty: true });
        get().saveHistory();
    },

    addElement: (element) => {
        const { pages, currentPageId } = get();
        const type = element.type || 'text';
        const defaults = ELEMENT_DEFAULTS[type] || {};
        const newElement: TemplateElement = {
            id: generateId(),
            type,
            x: 50,
            y: 50,
            width: 100,
            height: 50,
            rotation: 0,
            opacity: 1,
            zIndex: (pages.find(p => p.id === currentPageId)?.elements.length || 0) + 1,
            locked: false,
            visible: true,
            ...defaults,
            ...element,
        };
        
        set({
            pages: pages.map(page => 
                page.id === currentPageId 
                    ? { ...page, elements: [...page.elements, newElement] } 
                    : page
            ),
            selectedNodeIds: [newElement.id],
            isDirty: true,
        });
        get().saveHistory();
    },

    updateElement: (id, updates) => {
        const { pages, currentPageId } = get();
        set({
            pages: pages.map(page => 
                page.id === currentPageId 
                    ? { ...page, elements: page.elements.map(el => el.id === id ? { ...el, ...updates } : el) } 
                    : page
            ),
            isDirty: true,
        });
    },

    removeElement: (id) => {
        const { pages, currentPageId, selectedNodeIds } = get();
        set({
            pages: pages.map(page => 
                page.id === currentPageId 
                    ? { ...page, elements: page.elements.filter(el => el.id !== id) } 
                    : page
            ),
            selectedNodeIds: selectedNodeIds.filter(selectedId => selectedId !== id),
            isDirty: true,
        });
        get().saveHistory();
    },

    moveElement: (id, direction) => {
        const { pages, currentPageId } = get();
        const page = pages.find(p => p.id === currentPageId);
        if (!page) return;
        const els = [...page.elements];
        const idx = els.findIndex(e => e.id === id);
        if (idx === -1) return;

        let newIdx = idx;
        if (direction === 'up' && idx < els.length - 1) newIdx = idx + 1;
        else if (direction === 'down' && idx > 0) newIdx = idx - 1;
        else if (direction === 'top') newIdx = els.length - 1;
        else if (direction === 'bottom') newIdx = 0;

        if (newIdx !== idx) {
            const [el] = els.splice(idx, 1);
            els.splice(newIdx, 0, el);
            // Reindex zIndex
            const reindexed = els.map((e, i) => ({ ...e, zIndex: i + 1 }));
            set({
                pages: pages.map(p => p.id === currentPageId ? { ...p, elements: reindexed } : p),
                isDirty: true,
            });
            get().saveHistory();
        }
    },

    setElementsOrder: (orderedIds) => {
        const { pages, currentPageId } = get();
        const page = pages.find(p => p.id === currentPageId);
        if (!page) return;
        
        const elementsMap = new Map(page.elements.map(e => [e.id, e]));
        const newElements = orderedIds.map(id => elementsMap.get(id)).filter(Boolean) as typeof page.elements;
        
        // Add back any elements that might have been missed
        const missed = page.elements.filter(e => !orderedIds.includes(e.id));
        const combined = [...newElements, ...missed];
        
        const reindexed = combined.map((e, i) => ({ ...e, zIndex: i + 1 }));
        
        set({
            pages: pages.map(p => p.id === currentPageId ? { ...p, elements: reindexed } : p),
            isDirty: true,
        });
        get().saveHistory();
    },

    duplicateElement: (id) => {
        const { pages, currentPageId } = get();
        const page = pages.find(p => p.id === currentPageId);
        if (!page) return;
        const el = page.elements.find(e => e.id === id);
        if (!el) return;

        const cloned: TemplateElement = {
            ...el,
            id: generateId(),
            x: el.x + 15,
            y: el.y + 15,
            name: el.name ? `${el.name} Copy` : undefined,
        };
        set({
            pages: pages.map(p =>
                p.id === currentPageId
                    ? { ...p, elements: [...p.elements, cloned] }
                    : p
            ),
            selectedNodeIds: [cloned.id],
            isDirty: true,
        });
        get().saveHistory();
    },

    setSelectedElementId: (id) => set({ selectedNodeIds: id ? [id] : [] }),
    setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
    toggleNodeSelection: (id) => {
        const { selectedNodeIds } = get();
        if (selectedNodeIds.includes(id)) {
            set({ selectedNodeIds: selectedNodeIds.filter(nId => nId !== id) });
        } else {
            set({ selectedNodeIds: [...selectedNodeIds, id] });
        }
    },
    selectAllNodes: () => {
        const { pages, currentPageId } = get();
        const page = pages.find(p => p.id === currentPageId);
        if (page) {
            set({ selectedNodeIds: page.elements.map(el => el.id) });
        }
    },

    setActiveSide: (side) => {
        set({ activeSide: side });
    },
    getActiveSidePage: () => {
        const { pages, activeSide } = get();
        if (activeSide === 'front') return pages[0];
        return pages[1];
    },
    hasBackSide: () => {
        const { pages } = get();
        return pages.length > 1;
    },
    ensureBackSide: () => {
        const { pages } = get();
        if (pages.length === 1) {
            get().addPage(); // adds page_2 essentially
        }
    },

    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
    setGridSize: (size) => set({ gridSizeMm: Math.max(1, Math.min(50, size)) }),

    setCanvasConfig: (config) => set((state) => ({
        canvasConfig: { ...state.canvasConfig, ...config },
        isDirty: true,
    })),

    markClean: () => set({ isDirty: false }),

    saveHistory: () => {
        const { pages, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        const snapshot = JSON.parse(JSON.stringify(pages)) as TemplatePage[];
        newHistory.push(snapshot);
        // Cap history at 50 steps to prevent memory bloat
        if (newHistory.length > 50) newHistory.shift();
        set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const prevSnapshot = history[historyIndex - 1];
            set({
                historyIndex: historyIndex - 1,
                pages: JSON.parse(JSON.stringify(prevSnapshot)),
                selectedNodeIds: [],
                isDirty: true,
            });
        }
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
            const nextSnapshot = history[historyIndex + 1];
            set({
                historyIndex: historyIndex + 1,
                pages: JSON.parse(JSON.stringify(nextSnapshot)),
                selectedNodeIds: [],
                isDirty: true,
            });
        }
    },
}));
