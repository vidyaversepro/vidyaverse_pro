import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, AlertCircle, Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
    useTemplates, 
    useGenerateBulkIdCards,
    useInstitutions,
    useClasses,
    useStreams,
    useSections
} from '@/lib/queries';
import { api } from '@/lib/api';

export function BulkGenerateModal({ 
    isOpen, 
    onClose 
}: { 
    isOpen: boolean; 
    onClose: () => void;
}) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const generateBulk = useGenerateBulkIdCards();

    // ── Form state (cascading) ──
    const [selectedInstitution, setSelectedInstitution] = useState<string>('');
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStreamId, setSelectedStreamId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');

    // ── Data fetching ──
    // Always fetch institutions — admin picks which one to generate for
    const { data: institutionsData } = useInstitutions({ page: 1, limit: 100 });
    const institutions = institutionsData?.data || [];

    // Classes for the selected institution
    const { data: classesRaw } = useClasses(selectedInstitution || undefined);
    const classes: any[] = Array.isArray(classesRaw) ? classesRaw : (classesRaw as any)?.data || [];

    // Determine if selected class has streams enabled
    const selectedClassObj = useMemo(
        () => classes.find((c: any) => c.id === selectedClassId),
        [classes, selectedClassId]
    );
    const streamsEnabled = selectedClassObj?.streamsEnabled ?? false;

    // Streams for the selected class (only fetched when streamsEnabled)
    const { data: streamsRaw } = useStreams(
        streamsEnabled ? selectedClassId : undefined,
        selectedInstitution || undefined
    );
    const streams: any[] = Array.isArray(streamsRaw) ? streamsRaw : (streamsRaw as any)?.data || [];

    // Sections — filtered by class + optional stream
    const { data: sectionsRaw } = useSections(
        selectedClassId || undefined,
        selectedInstitution || undefined,
        streamsEnabled ? (selectedStreamId || undefined) : undefined
    );
    const sections: any[] = Array.isArray(sectionsRaw) ? sectionsRaw : (sectionsRaw as any)?.data || [];

    // Templates — only id_card type, scoped to institution
    const { data: templatesRaw } = useTemplates({ 
        serviceType: 'id_card',
        ...(selectedInstitution ? { institutionId: selectedInstitution } : {})
    });
    const templates: any[] = (templatesRaw as any)?.data || [];

    // ── Generation state ──
    const [isGenerating, setIsGenerating] = useState(false);
    const [batchId, setBatchId] = useState<string | null>(null);

    // ── Cascading resets ──
    useEffect(() => {
        setSelectedClassId('');
        setSelectedStreamId('');
        setSelectedSectionId('');
        setSelectedTemplate('');
    }, [selectedInstitution]);

    useEffect(() => {
        setSelectedStreamId('');
        setSelectedSectionId('');
    }, [selectedClassId]);

    useEffect(() => {
        setSelectedSectionId('');
    }, [selectedStreamId]);

    // ── Batch polling ──
    const { data: batchStatus } = useQuery({
        queryKey: ['id-card-batch', batchId],
        queryFn: async () => {
            if (!batchId) return null;
            const res = await api.get(`/id-cards/batches/${batchId}`);
            return res.data;
        },
        enabled: !!batchId && isGenerating,
        refetchInterval: (data) => {
            if (!isGenerating) return false;
            const status = (data as any)?.data?.status || (data as any)?.status;
            if (status === 'completed' || status === 'failed') return false;
            return 2000;
        },
    });

    // ── Submit handler ──
    const handleGenerateClick = async () => {
        if (!selectedInstitution) {
            toast({ title: 'Please select an institution', variant: 'destructive' });
            return;
        }
        if (!selectedTemplate) {
            toast({ title: 'Please select a template', variant: 'destructive' });
            return;
        }

        const payload: any = {
            templateId: selectedTemplate,
            institutionId: selectedInstitution,
        };
        
        if (selectedClassId) payload.classId = selectedClassId;
        if (streamsEnabled && selectedStreamId) payload.streamId = selectedStreamId;
        if (selectedSectionId) payload.sectionId = selectedSectionId;

        generateBulk.mutate(payload, {
            onSuccess: (data: any) => {
                const newBatchId = data.batchId;
                if (newBatchId) {
                    setBatchId(newBatchId);
                    setIsGenerating(true);
                } else {
                    toast({ title: 'Bulk generation started successfully' });
                    onClose();
                }
            },
            onError: (err: any) => {
                toast({ title: err?.response?.data?.message || 'Failed to start bulk generation', variant: 'destructive' });
            }
        });
    };

    // ── Batch completion handler ──
    useEffect(() => {
        if (isGenerating && batchStatus?.data) {
            const status = batchStatus.data.status;
            if (status === 'completed' || status === 'failed') {
                setIsGenerating(false);
                queryClient.invalidateQueries({ queryKey: ['id-cards'] });
                
                const failedCount = batchStatus.data.totalFailed || 0;

                if (status === 'completed' && failedCount === 0) {
                    toast({ title: `Successfully generated ${batchStatus.data.totalSucceeded} ID cards.` });
                } else if (status === 'completed' && failedCount > 0) {
                    toast({ title: `Completed with errors. ${batchStatus.data.totalSucceeded} succeeded, ${failedCount} failed.`, variant: 'destructive' });
                } else {
                    toast({ title: 'Batch generation failed.', variant: 'destructive' });
                }
            }
        }
    }, [batchStatus, isGenerating, queryClient, toast]);

    const resetAndClose = () => {
        setIsGenerating(false);
        setBatchId(null);
        setSelectedTemplate('');
        setSelectedClassId('');
        setSelectedStreamId('');
        setSelectedSectionId('');
        setSelectedInstitution('');
        onClose();
    };

    const isSubmitting = generateBulk.isPending;

    // ── Render ──
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && resetAndClose()}>
            <DialogContent className="sm:max-w-[480px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Generate Bulk ID Cards</DialogTitle>
                    <DialogDescription>
                        Select institution, filters, and template to bulk-generate ID cards. Runs in the background.
                    </DialogDescription>
                </DialogHeader>

                {!isGenerating && !batchId ? (
                    <div className="space-y-4 py-4">

                        {/* 1. Institution (always visible) */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Institution <span className="text-red-500">*</span>
                            </label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#b7102a]/20 focus:border-[#b7102a] outline-none transition-all"
                                value={selectedInstitution}
                                onChange={(e) => setSelectedInstitution(e.target.value)}
                            >
                                <option value="">Select an institution...</option>
                                {institutions.map((inst: any) => (
                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Class */}
                        {selectedInstitution && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#b7102a]/20 focus:border-[#b7102a] outline-none transition-all"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                >
                                    <option value="">All Classes</option>
                                    {classes.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                            {c.streamsEnabled ? ' (has streams)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 3. Stream (conditional — only when class has streamsEnabled) */}
                        {selectedClassId && streamsEnabled && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Stream
                                    <span className="text-xs text-gray-400 ml-1.5 font-normal">(this class uses streams)</span>
                                </label>
                                <select 
                                    className="w-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-400 outline-none transition-all"
                                    value={selectedStreamId}
                                    onChange={(e) => setSelectedStreamId(e.target.value)}
                                >
                                    <option value="">All Streams</option>
                                    {streams.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 4. Section */}
                        {selectedClassId && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Section</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#b7102a]/20 focus:border-[#b7102a] outline-none transition-all"
                                    value={selectedSectionId}
                                    onChange={(e) => setSelectedSectionId(e.target.value)}
                                    disabled={streamsEnabled && !selectedStreamId}
                                >
                                    <option value="">All Sections</option>
                                    {sections.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {streamsEnabled && !selectedStreamId && (
                                    <p className="text-xs text-amber-600 mt-1">Select a stream first to filter sections</p>
                                )}
                            </div>
                        )}

                        {/* Separator */}
                        <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

                        {/* 5. Template */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Template <span className="text-red-500">*</span>
                            </label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#b7102a]/20 focus:border-[#b7102a] outline-none transition-all"
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                disabled={!selectedInstitution}
                            >
                                <option value="">Select a template...</option>
                                {templates.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {selectedInstitution && templates.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">No ID card templates found for this institution. Create one first.</p>
                            )}
                        </div>

                        <Button 
                            className="w-full mt-4 bg-[#b7102a] hover:bg-[#8f0c21] text-white h-11 text-sm font-medium rounded-lg" 
                            onClick={handleGenerateClick}
                            disabled={isSubmitting || !selectedTemplate || !selectedInstitution}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Start Bulk Generation
                        </Button>
                    </div>
                ) : (
                    /* ── Progress / Completion View ── */
                    <div className="space-y-6 py-6 flex flex-col items-center justify-center text-center">
                        {batchStatus?.data?.status === 'completed' ? (
                            <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                        ) : batchStatus?.data?.status === 'failed' ? (
                            <AlertCircle className="w-16 h-16 text-red-500 mb-2" />
                        ) : (
                            <Loader2 className="w-16 h-16 text-[#b7102a] animate-spin mb-2" />
                        )}
                        
                        <div className="space-y-2 w-full">
                            <h3 className="text-lg font-semibold">
                                {batchStatus?.data?.status === 'completed' ? 'Generation Complete' :
                                 batchStatus?.data?.status === 'failed' ? 'Generation Failed' :
                                 'Generating ID Cards...'}
                            </h3>
                            
                            {batchStatus?.data && (
                                <div className="space-y-1">
                                    <div className="w-full bg-muted rounded-full h-2.5 mb-1 overflow-hidden">
                                        <div 
                                            className={`h-2.5 rounded-full transition-all duration-500 ${batchStatus.data.status === 'failed' ? 'bg-destructive' : 'bg-primary'}`}
                                            style={{ width: `${Math.max(5, (((batchStatus.data.totalSucceeded || 0) + (batchStatus.data.totalFailed || 0)) / (batchStatus.data.totalRequested || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {(batchStatus.data.totalSucceeded || 0) + (batchStatus.data.totalFailed || 0)} / {batchStatus.data.totalRequested} Students Processed
                                        {batchStatus.data.totalFailed > 0 && <span className="text-red-500 ml-1">({batchStatus.data.totalFailed} failed)</span>}
                                    </p>
                                </div>
                            )}
                        </div>

                        {(!isGenerating && batchId) && (
                            <div className="flex gap-3 mt-4">
                                {batchStatus?.data?.pdfUrl && (
                                    <Button 
                                        variant="default"
                                        className="bg-[#b7102a] hover:bg-[#8f0c21] text-white"
                                        onClick={() => window.open(batchStatus.data.pdfUrl, '_blank')}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download All
                                    </Button>
                                )}
                                <Button variant="outline" onClick={resetAndClose}>
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
