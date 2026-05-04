import React, { useMemo } from 'react';
import { useEditorStore } from '../store/editor.store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Type, Square, Image as ImageIcon, Minus, QrCode, Grid3X3, GripVertical, Eye, EyeOff, Lock, Unlock, AlignJustify } from 'lucide-react';

const ELEMENT_ICONS: Record<string, React.ElementType> = {
    text: Type,
    shape: Square,
    image: ImageIcon,
    line: Minus,
    qr: QrCode,
    barcode: AlignJustify, // using AlignJustify as barcode
    table: Grid3X3
};

function SortableLayerItem({ element }: { element: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: element.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
    };

    const { selectedNodeIds, toggleNodeSelection, updateElement, setSelectedNodeIds } = useEditorStore();
    const isSelected = selectedNodeIds.includes(element.id);

    const Icon = ELEMENT_ICONS[element.type] || Square;
    let label = element.name || element.type;
    if (element.type === 'text') label = element.text || 'Text';

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                    toggleNodeSelection(element.id);
                } else {
                    setSelectedNodeIds([element.id]);
                }
            }}
            className={cn(
                "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border",
                isSelected 
                    ? "bg-[#ffdad8]/50 border-[#b7102a] shadow-sm" 
                    : "bg-white border-transparent hover:bg-slate-50",
                isDragging ? "opacity-50" : "opacity-100",
                element.visible === false ? "opacity-40" : ""
            )}
        >
            <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="w-4 h-4" />
            </div>
            
            <Icon className="w-4 h-4 text-slate-500 shrink-0" />
            
            <span className="text-xs font-medium text-slate-700 truncate flex-1 select-none">
                {label}
            </span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        updateElement(element.id, { locked: !element.locked });
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title={element.locked ? "Unlock" : "Lock"}
                >
                    {element.locked ? <Lock className="w-3 h-3 text-[#b7102a]" /> : <Unlock className="w-3 h-3" />}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        updateElement(element.id, { visible: element.visible === false ? true : false });
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title={element.visible === false ? "Show" : "Hide"}
                >
                    {element.visible === false ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3" />}
                </button>
            </div>
        </div>
    );
}

export default function LayersPanel() {
    const { pages, currentPageId, setElementsOrder } = useEditorStore();
    const currentPage = pages.find(p => p.id === currentPageId);
    
    // We reverse the array so the top element (highest zIndex) appears at the top of the list
    const items = useMemo(() => {
        return currentPage ? [...currentPage.elements].reverse() : [];
    }, [currentPage]);
    
    const itemIds = useMemo(() => items.map(el => el.id), [items]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            const oldIndex = itemIds.indexOf(active.id as string);
            const newIndex = itemIds.indexOf(over.id as string);
            
            // Reorder the visual (reversed) list
            const newVisualItems = arrayMove(itemIds, oldIndex, newIndex);
            
            // The actual array order (in store) is the reverse of visual order
            const newActualItems = [...newVisualItems].reverse();
            
            setElementsOrder(newActualItems);
        }
    };

    if (!currentPage) return null;

    return (
        <div className="flex flex-col h-full bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="px-6 pt-6 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Layers</p>
            </div>

            <ScrollArea className="flex-1 px-4 pb-8">
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={itemIds}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-1">
                            {items.map(element => (
                                <SortableLayerItem key={element.id} element={element} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </ScrollArea>
        </div>
    );
}
