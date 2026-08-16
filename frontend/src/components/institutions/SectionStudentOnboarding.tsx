import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Users,
    GitBranch,
    Layers,
    Loader2,
    CheckCircle2,
    BookOpen,
    ChevronRight,
    Sparkles,
    UserCircle2,
    AlertCircle,
    Clock,
    Timer,
    Download
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogTitle
} from '@/components/ui/dialog';

import {
    useAdmissionSlots,
    useGenerateSectionForms
} from '@/lib/queries';
import { normalizeAcademics, NormalizedClass, NormalizedStream, NormalizedSection } from '@/lib/normalizeAcademics';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

import { StudentTabForm } from '../students/StudentTabForm';
import StudentActivityTimeline from '../students/StudentActivityTimeline';

export default function SectionStudentOnboarding({ institutionId }: { institutionId: string }) {
    // Fetch academic hierarchy
    const { data: rawClasses, isLoading: loadingClasses } = useQuery<NormalizedClass[]>({
        queryKey: ['classes', institutionId],
        queryFn: async () => { const res = await api.get('/class', { params: { institutionId } }); return res.data.data; },
        enabled: !!institutionId
    });
    const { data: rawStreams, isLoading: loadingStreams } = useQuery<NormalizedStream[]>({
        queryKey: ['streams', 'all', institutionId],
        queryFn: async () => { const res = await api.get('/stream', { params: { institutionId } }); return res.data.data; },
        enabled: !!institutionId
    });
    const { data: rawSections, isLoading: loadingSections } = useQuery<NormalizedSection[]>({
        queryKey: ['sections', 'all', institutionId],
        queryFn: async () => { const res = await api.get('/section', { params: { institutionId, limit: 1000 } }); return res.data.data; },
        enabled: !!institutionId
    });

    // Normalize hierarchy
    const normalizedData = useMemo(() => normalizeAcademics(rawClasses || [], rawStreams || [], rawSections || []), [rawClasses, rawStreams, rawSections]);

    // Selection state
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

    // Derived Selection Context
    const selectedClass = useMemo(() => normalizedData.find(c => c.id === selectedClassId), [normalizedData, selectedClassId]);
    const streamsEnabled = selectedClass?.streamsEnabled ?? false;
    const activeStreams = selectedClass?.streams || [];
    const activeSections = useMemo(() => {
        if (!selectedClass) return [];
        if (streamsEnabled) {
            if (!selectedStreamId) return [];
            const stream = selectedClass.streams.find(s => s.id === selectedStreamId);
            return stream?.sections || [];
        }
        return selectedClass.sections;
    }, [selectedClass, streamsEnabled, selectedStreamId]);

    const selectedSection = useMemo(() => activeSections.find(s => s.id === selectedSectionId), [activeSections, selectedSectionId]);

    // Auto-selection effects
    useEffect(() => { if (normalizedData.length > 0 && !selectedClassId) setSelectedClassId(normalizedData[0].id); }, [normalizedData, selectedClassId]);
    useEffect(() => { setSelectedStreamId(null); setSelectedSectionId(null); }, [selectedClassId]);
    useEffect(() => { if (streamsEnabled && activeStreams.length > 0 && !selectedStreamId) setSelectedStreamId(activeStreams[0].id); }, [activeStreams, streamsEnabled, selectedStreamId]);
    useEffect(() => { setSelectedSectionId(null); }, [selectedStreamId]);
    useEffect(() => { if (activeSections.length > 0 && !selectedSectionId) setSelectedSectionId(activeSections[0].id); }, [activeSections, selectedSectionId]);

    // ── DATA FETCHING ──
    const { data: sectionSlotsData, isLoading: loadingStudents, refetch: refetchStudents } = useAdmissionSlots(
        selectedSectionId || undefined
    );
    const sectionSlots = sectionSlotsData || [];

    // Form generation logic
    const { mutate: generateForms, isPending: isGenerating } = useGenerateSectionForms();

    const handleGenerateForms = () => {
        if (!selectedSectionId) return;
        generateForms({ sectionId: selectedSectionId, institutionId }, {
            onSuccess: () => {
                toast.success('Generated placeholder forms successfully!');
                refetchStudents();
            },
            onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to generate forms')
        });
    };

    // ── UI STATE ──
    const [activeDialog, setActiveDialog] = useState<'manual' | null>(null);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [isCreatingStudent, setIsCreatingStudent] = useState(false);

    // Export Dialog State
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const AVAILABLE_COLUMNS = [
        { id: 'rollNo', label: 'Roll No' },
        { id: 'admissionNumber', label: 'Admission No' },
        { id: 'name', label: 'Name' },
        { id: 'sex', label: 'Sex' },
        { id: 'dob', label: 'Date of Birth' },
        { id: 'contact', label: 'Contact' },
        { id: 'parentEmail', label: 'Parent Email' },
        { id: 'fatherName', label: 'Father Name' },
        { id: 'aadharNumber', label: 'Aadhar Number' },
        { id: 'academicYear', label: 'Academic Year' },
        { id: 'status', label: 'Status' },
        { id: 'dataStatus', label: 'Data Status' },
    ];
    const [selectedColumns, setSelectedColumns] = useState<string[]>(['rollNo', 'admissionNumber', 'name', 'sex', 'dob', 'contact', 'status', 'academicYear']);

    const handleExport = async () => {
        if (!selectedSectionId || selectedColumns.length === 0) return;
        setIsExporting(true);
        try {
            const cols = selectedColumns.join(',');
            const response = await api.get(`/student/export?sectionId=${selectedSectionId}&institutionId=${institutionId}&columns=${cols}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `students_${selectedSection?.name || 'export'}_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setExportDialogOpen(false);
        } catch (error: any) {
            toast.error('Failed to export students. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const openManualEdit = (studentId?: string) => {
        if (studentId) {
            setEditingStudentId(studentId);
            setIsCreatingStudent(false);
        } else {
            setEditingStudentId(null);
            setIsCreatingStudent(true);
        }
        setActiveDialog('manual');
    };

    const isLoading = loadingClasses || loadingStreams || loadingSections;
    const capacity = selectedSection?.expectedStudentCount || 0;
    const enrolled = sectionSlots.length;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* HEADER */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-lg text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Advanced Student Onboarding
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                        Select a section, generate placeholder forms based on its capacity, and then fill them individually or via CSV upload.
                    </p>
                </div>
            </div>

            {/* SECTION PICKER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[320px]">
                {/* CLASSES */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm text-foreground">Classes</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5">
                        {isLoading ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                            : normalizedData.map(cls => (
                                <button
                                    key={cls.id}
                                    onClick={() => setSelectedClassId(cls.id)}
                                    className={cn("w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all flex justify-between items-center",
                                        selectedClassId === cls.id ? "border-primary bg-primary/10 text-primary" : "border-transparent hover:border-border hover:bg-muted"
                                    )}
                                >
                                    <span>{cls.name}</span>
                                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform text-muted-foreground", selectedClassId === cls.id && "text-primary translate-x-0.5")} />
                                </button>
                            ))}
                    </div>
                </div>

                {/* STREAMS OR SECTIONS */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm text-foreground">{streamsEnabled ? 'Streams' : 'Sections'}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5">
                        {!selectedClassId ? <p className="text-center text-sm text-muted-foreground py-6">Select a class</p>
                            : streamsEnabled ? activeStreams.map(stream => (
                                <button
                                    key={stream.id}
                                    onClick={() => setSelectedStreamId(stream.id)}
                                    className={cn("w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all flex justify-between items-center",
                                        selectedStreamId === stream.id ? "border-primary bg-primary/10 text-primary" : "border-transparent hover:border-border hover:bg-muted"
                                    )}
                                >
                                    <span>{stream.name}</span>
                                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform text-muted-foreground", selectedStreamId === stream.id && "text-primary translate-x-0.5")} />
                                </button>
                            )) : activeSections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setSelectedSectionId(section.id)}
                                    className={cn("w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                                        selectedSectionId === section.id ? "border-primary bg-primary/10 text-primary" : "border-transparent hover:border-border hover:bg-muted"
                                    )}
                                >
                                    Section {section.name}
                                </button>
                            ))}
                    </div>
                </div>

                {/* SECTIONS OR PREVIEW INFO */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm text-foreground">{streamsEnabled ? 'Sections' : 'Summary'}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5">
                        {streamsEnabled && activeSections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setSelectedSectionId(section.id)}
                                className={cn("w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                                    selectedSectionId === section.id ? "border-primary bg-primary/10 text-primary" : "border-transparent hover:border-border hover:bg-muted"
                                )}
                            >
                                Section {section.name}
                            </button>
                        ))}

                        {(!streamsEnabled || selectedSectionId) && selectedSection && (
                            <div className="pt-4 space-y-4 text-center">
                                <div className="inline-flex items-center justify-center p-4 bg-muted/50 rounded-full mb-2">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Capacity</p>
                                    <p className="text-2xl font-bold font-mono">{capacity}</p>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-xs text-muted-foreground">Forms Generated</p>
                                    <p className="text-lg font-medium font-mono">{enrolled}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STUDENT GRID AREA */}
            {selectedSection && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                            {!capacity ? (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4" /> Ensure section capacity is set &gt; 0
                                </div>
                            ) : enrolled < capacity ? (
                                <Button onClick={handleGenerateForms} disabled={isGenerating} className="gap-2">
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {enrolled === 0
                                        ? `Generate ${capacity} Student Forms`
                                        : `Generate ${capacity - enrolled} Remaining Forms`}
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                    <CheckCircle2 className="w-4 h-4" /> All {capacity} forms generated
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="bg-card border-border"
                                onClick={() => setExportDialogOpen(true)}
                            >
                                <Download className="w-4 h-4 mr-2 text-muted-foreground" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {loadingStudents ? (
                        <div className="h-40 flex items-center justify-center bg-card rounded-xl border">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {sectionSlots.map((s: any) => {
                                const isEmpty = s.status === 'EMPTY';
                                const isPartial = s.status === 'INVITED';
                                const isComplete = s.status === 'FILLED';

                                // Determine token expiry status
                                const isTokenExpired = isEmpty && s.tokenExpiresAt && new Date(s.tokenExpiresAt) < new Date();
                                const isTokenActive = isEmpty && s.tokenExpiresAt && new Date(s.tokenExpiresAt) >= new Date();

                                return (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={s.id}
                                        onClick={() => openManualEdit(s.student?.id)}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center p-4 h-32 rounded-xl border-2 transition-all hover:shadow-md text-left",
                                            isEmpty && !isTokenExpired && "border-dashed border-border bg-muted/50",
                                            isEmpty && isTokenExpired && "border-dashed border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20",
                                            isPartial && "border-amber-400 bg-amber-50 dark:bg-amber-900/20",
                                            isComplete && "border-green-500 bg-green-50 dark:bg-green-900/10"
                                        )}
                                    >
                                        <Badge variant="outline" className="absolute top-2 left-2 text-[10px] font-mono bg-card">#{s.rollNo}</Badge>

                                        {/* Token expiry indicator */}
                                        {isTokenExpired && (
                                            <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] font-semibold text-red-600 dark:text-red-400" title="Token expired">
                                                <Timer className="w-3 h-3" /> Expired
                                            </span>
                                        )}
                                        {isTokenActive && (
                                            <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400" title="Token active">
                                                <Clock className="w-3 h-3" /> Active
                                            </span>
                                        )}

                                        <UserCircle2 className={cn("w-8 h-8 mb-2",
                                            isEmpty && !isTokenExpired ? "text-muted-foreground" :
                                                isEmpty && isTokenExpired ? "text-red-300 dark:text-red-700" :
                                                    isPartial ? "text-amber-500" : "text-green-600"
                                        )} />

                                        <div className="w-full text-center overflow-hidden">
                                            {isEmpty ? (
                                                <span className={cn("text-xs font-medium", isTokenExpired ? "text-red-500" : "text-muted-foreground")}>
                                                    {isTokenExpired ? 'Link Expired' : 'Empty Slot'}
                                                </span>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-bold truncate text-foreground">{s.student?.name || 'Reserved'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono truncate">{s.student?.admissionNumber || 'Invited'}</p>
                                                </>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* MANUAL EDIT DIALOG */}
            <Dialog open={activeDialog === 'manual'} onOpenChange={(o) => !o && setActiveDialog(null)}>
                <DialogContent aria-describedby={undefined} className="max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col bg-muted/30">
                    <div className="flex items-center p-4 border-b bg-card shrink-0">
                        <DialogTitle>Fill Student Data</DialogTitle>
                    </div>
                    <div className="flex-1 overflow-hidden p-6">
                        {(editingStudentId || isCreatingStudent) && (() => {
                            const slot = sectionSlots.find((s: any) => s.student?.id === editingStudentId);
                            return (
                                <StudentTabForm
                                    institutionId={institutionId}
                                    studentId={editingStudentId || undefined}
                                    mode="admin"
                                    onClose={() => { setActiveDialog(null); refetchStudents(); }}
                                    contextInfo={{
                                        className: selectedClass?.name || '',
                                        streamName: streamsEnabled ? activeStreams.find(s => s.id === selectedStreamId)?.name : undefined,
                                        sectionName: selectedSection?.name || '',
                                        rollNo: slot?.rollNo || sectionSlots.find((s: any) => s.status === 'EMPTY')?.rollNo,
                                        admissionNumber: slot?.student?.admissionNumber
                                    }}
                                />
                            );
                        })()}
                    </div>
                    {editingStudentId && (
                        <div className="shrink-0 px-6 pb-4 max-h-[30vh] overflow-y-auto border-t">
                            <StudentActivityTimeline studentId={editingStudentId} isOpen={activeDialog === 'manual'} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>


            {/* EXPORT DIALOG */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogContent aria-describedby={undefined} className="max-w-md">
                    <DialogTitle>Export Students</DialogTitle>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">Select the columns to include in the CSV export.</p>
                        <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto p-1">
                            {AVAILABLE_COLUMNS.map(col => (
                                <label key={col.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1.5 rounded-md">
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.includes(col.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedColumns(prev => [...prev, col.id]);
                                            } else {
                                                setSelectedColumns(prev => prev.filter(c => c !== col.id));
                                            }
                                        }}
                                        className="rounded border-border text-primary focus:ring-primary"
                                    />
                                    {col.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting || selectedColumns.length === 0}
                            className="bg-primary text-primary-foreground"
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                            Export
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </motion.div >
    );
}
