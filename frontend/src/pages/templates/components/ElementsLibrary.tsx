import { useEditorStore } from '../store/editor.store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ElementsLibrary() {
    const { addElement, template } = useEditorStore();
    const serviceType = template?.serviceType;

    const { data: variablesResp, isLoading } = useQuery({
        queryKey: ['template-variables', serviceType],
        queryFn: async () => {
            const res = await api.get(`/templates/variables?serviceType=${serviceType}`);
            const variablesArray = res.data.data || [];
            
            // Group by category
            const grouped = variablesArray.reduce((acc: any, curr: any) => {
                const cat = curr.category || 'General';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(curr);
                return acc;
            }, {});
            
            return grouped;
        },
        enabled: !!serviceType,
    });

    return (
        <div className="flex flex-col h-full bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="px-6 pt-6 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Design Assets</p>
            </div>

            <ScrollArea className="flex-1">
                <div className="px-6 pb-8 space-y-8">

                    {/* ── TEXT STYLES ─────────────────────────── */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Text Styles</h3>
                        <div className="space-y-2.5">
                            <button
                                onClick={() => addElement({ type: 'text', text: 'Add Heading', fontSize: 32, fontWeight: 'bold', fill: '#191c1d', width: 300, height: 50 })}
                                className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors text-left border-l-4 border-[#b7102a]"
                            >
                                <span className="text-xl font-extrabold block text-slate-800">Add Heading</span>
                            </button>
                            <button
                                onClick={() => addElement({ type: 'text', text: 'Add Subheading', fontSize: 20, fontWeight: 'bold', fill: '#191c1d', width: 250, height: 40 })}
                                className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors text-left"
                            >
                                <span className="text-base font-semibold block text-slate-700">Add Subheading</span>
                            </button>
                            <button
                                onClick={() => addElement({ type: 'text', text: 'Add body text here', fontSize: 14, fill: '#5b403f', width: 220, height: 30 })}
                                className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors text-left"
                            >
                                <span className="text-sm block text-slate-500">Add body text</span>
                            </button>
                        </div>
                    </section>

                    {/* ── SHAPES ──────────────────────────────── */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Shapes</h3>
                        <div className="grid grid-cols-3 gap-2.5">
                            <button
                                onClick={() => addElement({ type: 'shape', shapeType: 'rect', fill: '#e1e3e4', width: 120, height: 80, stroke: '#8f6f6e', strokeWidth: 0 })}
                                className="aspect-square bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"
                            >
                                <div className="w-9 h-9 bg-slate-300 rounded" />
                            </button>
                            <button
                                onClick={() => addElement({ type: 'shape', shapeType: 'circle', fill: '#e1e3e4', width: 100, height: 100, stroke: '#8f6f6e', strokeWidth: 0 })}
                                className="aspect-square bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"
                            >
                                <div className="w-9 h-9 bg-slate-300 rounded-full" />
                            </button>
                            <button
                                onClick={() => addElement({ type: 'line', direction: 'horizontal', stroke: '#191c1d', strokeWidth: 2, width: 200, height: 2 })}
                                className="aspect-square bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"
                            >
                                <div className="w-8 h-0.5 bg-slate-400 rounded" />
                            </button>
                        </div>
                    </section>

                    {/* ── QR & BARCODE ──────────────────────────── */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Codes</h3>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                onClick={() => addElement({ type: 'qr', data: '{{student.id}}', width: 100, height: 100 })}
                                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center gap-2 transition-colors"
                            >
                                <div className="w-8 h-8 border-2 border-slate-400 rounded grid grid-cols-3 gap-px p-1">
                                    <div className="bg-slate-400" /><div className="bg-slate-400" /><div className="bg-slate-400" />
                                    <div className="bg-slate-400" /><div /><div className="bg-slate-400" />
                                    <div className="bg-slate-400" /><div className="bg-slate-400" /><div className="bg-slate-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">QR Code</span>
                            </button>
                            <button
                                onClick={() => addElement({ type: 'barcode', data: '{{student.admissionNumber}}', width: 200, height: 60 })}
                                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center gap-2 transition-colors"
                            >
                                <div className="flex gap-px items-end h-8">
                                    {[3, 5, 2, 4, 6, 3, 5, 2, 4, 6, 3, 5].map((h, i) => (
                                        <div key={i} className="w-0.5 bg-slate-400" style={{ height: h * 4 }} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Barcode</span>
                            </button>
                        </div>
                    </section>

                    {/* ── DYNAMIC FIELDS ──────────────────────── */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-700">Dynamic Fields</h3>
                            <span className="px-1.5 py-0.5 bg-[#ffdad8] text-[#410007] text-[10px] font-bold rounded">LIVE</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                            These fields are replaced with real student data when generating documents.
                        </p>
                        
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            </div>
                        ) : !serviceType ? (
                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Template type not set</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(variablesResp || {}).map(([categoryName, fields]) => (
                                    <div key={categoryName} className="w-full mb-2">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{categoryName}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(fields as any[]).map((field) => (
                                                <button
                                                    key={field.handlebarsExpression}
                                                    onClick={() => addElement({
                                                        type: 'text',
                                                        text: field.handlebarsExpression,
                                                        fontSize: 14,
                                                        fill: '#b7102a',
                                                        fontWeight: 'bold',
                                                        width: 180,
                                                        height: 28
                                                    })}
                                                    title={`Add ${field.label}`}
                                                    className={cn(
                                                        'px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-[11px] font-medium rounded-full',
                                                        'hover:border-[#b7102a] hover:bg-[#ffdad8]/20 hover:text-[#b7102a]',
                                                        'transition-all flex items-center gap-1.5 cursor-pointer'
                                                    )}
                                                >
                                                    <span className="font-mono text-[9px] text-slate-400">{field.handlebarsExpression}</span>
                                                    <span>{field.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ── BACKGROUND PATTERNS ─────────────────── */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Backgrounds</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {['#ffffff', '#ffdad8', '#f0fdf4', '#eff6ff', '#fefce8', '#f5f3ff'].map(color => (
                                <button
                                    key={color}
                                    title={color}
                                    className="aspect-square rounded-xl border-2 border-white shadow-sm hover:scale-105 transition-transform"
                                    style={{ backgroundColor: color, outline: '1px solid #e1e3e4' }}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}
