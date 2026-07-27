import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Users, Briefcase } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useClasses, useStreams, useSections, useStudents, useTemplates } from '@/lib/queries';
import { useStaff } from '@/lib/queries/hr/hr-queries';
import { type AudienceType } from '@vidyaverse/shared-validation';

const selectCls =
    'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#b7102a]/20 focus:border-[#b7102a] outline-none transition-all';

export interface GenerateResult {
    successful: number;
    failed: number;
}

/**
 * Shared "Generate New" modal for every printable, mirroring the ID-card
 * BulkGenerateModal: Class → Stream (when enabled) → Section → [type-specific
 * fields] → Template, then resolves the section's students and calls onGenerate.
 * Institution comes from the global switcher (usePageInstitution) — the same
 * source the page's list uses — so context never diverges.
 */
export function GenerateDocsModal({
    isOpen,
    onClose,
    title,
    description,
    serviceType,
    institutionId,
    children,
    canSubmit = true,
    submitLabel = 'Generate',
    requireSection = false,
    selectionMode = 'bulk-section',
    requiresDestructiveConfirmation = false,
    destructiveConfirmationMessage = 'Are you sure you want to proceed?',
    audienceType = 'students',
    onGenerate,
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    serviceType: string;
    institutionId?: string;
    /** Type-specific fields rendered between Section and Template. */
    children?: ReactNode;
    /** Extra validity gate for the type-specific fields. */
    canSubmit?: boolean;
    submitLabel?: string;
    /** When true, a Section must be picked (else class-wide is allowed). */
    requireSection?: boolean;
    selectionMode?: 'bulk-section' | 'manual-students';
    requiresDestructiveConfirmation?: boolean;
    destructiveConfirmationMessage?: string;
    audienceType?: AudienceType;
    onGenerate: (args: {
        studentIds?: string[];
        userIds?: string[];
        institutionId: string;
        classId?: string;
        sectionId?: string;
        templateId?: string;
    }) => Promise<GenerateResult>;
}) {
    const { toast } = useToast();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedStreamId, setSelectedStreamId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<GenerateResult | null>(null);

    // New State for enhanced features
    const [activeAudience, setActiveAudience] = useState<'students' | 'staff'>(
        audienceType === 'both' ? 'students' : (audienceType as 'students' | 'staff')
    );
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Synchronize active audience if prop changes
    useEffect(() => {
        if (audienceType !== 'both') setActiveAudience(audienceType);
    }, [audienceType]);

    const classesRaw = useClasses(institutionId).data;
    const classes: any[] = Array.isArray(classesRaw) ? classesRaw : (classesRaw as any)?.data || [];

    const selectedClassObj = useMemo(
        () => classes.find((c: any) => c.id === selectedClassId),
        [classes, selectedClassId]
    );
    const streamsEnabled = selectedClassObj?.streamsEnabled ?? false;

    const streamsRaw = useStreams(streamsEnabled ? selectedClassId : undefined, institutionId).data;
    const streams: any[] = Array.isArray(streamsRaw) ? streamsRaw : (streamsRaw as any)?.data || [];

    const sectionsRaw = useSections(
        selectedClassId || undefined,
        institutionId,
        streamsEnabled ? selectedStreamId || undefined : undefined
    ).data;
    const sections: any[] = Array.isArray(sectionsRaw) ? sectionsRaw : (sectionsRaw as any)?.data || [];

    const templatesRaw = useTemplates({ serviceType, ...(institutionId ? { institutionId } : {}) }).data;
    const templates: any[] = (templatesRaw as any)?.data || [];

    // Students for the chosen scope (section, else whole class).
    const { data: studentsData } = useStudents(
        institutionId && selectedClassId
            ? { institutionId, classId: selectedClassId, sectionId: selectedSectionId, limit: '500' }
            : undefined
    );
    const students: any[] = studentsData?.data || [];

    // Staff for department scope
    const { data: staffData } = useStaff(
        (audienceType === 'staff' || audienceType === 'both') && institutionId 
            ? { institutionId } 
            : undefined
    );
    const staff = staffData || [];

    const departments = useMemo(() => {
        const deps = new Set(staff.map((s: any) => s.department).filter(Boolean));
        return Array.from(deps);
    }, [staff]);

    const filteredStaff = useMemo(() => {
        if (!selectedDepartment) return staff;
        return staff.filter((s: any) => s.department === selectedDepartment);
    }, [staff, selectedDepartment]);

    // Update selectedIds when scope changes in manual mode
    useEffect(() => {
        if (selectionMode === 'manual-students') {
            const scopeIds = activeAudience === 'staff' ? filteredStaff.map((s: any) => s.id) : students.map((s) => s.id);
            setSelectedIds(scopeIds);
        }
    }, [students, filteredStaff, selectionMode, activeAudience]);

    // Cascading resets
    useEffect(() => {
        setSelectedStreamId('');
        setSelectedSectionId('');
    }, [selectedClassId]);
    useEffect(() => {
        setSelectedSectionId('');
    }, [selectedStreamId]);
    useEffect(() => {
        setSelectedDepartment('');
    }, [activeAudience]);

    const resetAndClose = () => {
        setSelectedClassId('');
        setSelectedStreamId('');
        setSelectedSectionId('');
        setSelectedDepartment('');
        setSelectedTemplate('');
        setSelectedIds([]);
        setIsConfirmed(false);
        setResult(null);
        setIsSubmitting(false);
        onClose();
    };

    const scopeReady = activeAudience === 'staff' 
        ? true // Staff can be all or by department
        : !!selectedClassId && (!requireSection || !!selectedSectionId);

    const handleGenerate = async () => {
        if (!institutionId) {
            toast({ title: 'Select an institution from the top-bar switcher first', variant: 'destructive' });
            return;
        }
        if (!scopeReady) {
            toast({ title: requireSection ? 'Please select a section' : 'Please select a class', variant: 'destructive' });
            return;
        }

        let payloadIds: string[] = [];
        if (selectionMode === 'manual-students') {
            payloadIds = selectedIds;
        } else {
            payloadIds = activeAudience === 'staff' ? filteredStaff.map((s: any) => s.id) : students.map((s) => s.id);
        }

        if (payloadIds.length === 0) {
            toast({ title: 'No recipients found in the selected scope', variant: 'destructive' });
            return;
        }
        
        if (requiresDestructiveConfirmation && !isConfirmed) {
            toast({ title: 'Please confirm the action to proceed', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await onGenerate({
                [activeAudience === 'staff' ? 'userIds' : 'studentIds']: payloadIds,
                institutionId,
                classId: selectedClassId || undefined,
                sectionId: selectedSectionId || undefined,
                templateId: selectedTemplate || undefined,
            });
            setResult(res);
            if (res.failed === 0) {
                toast({ title: `Generated ${res.successful} document(s).` });
            } else {
                toast({ title: `Completed: ${res.successful} ok, ${res.failed} failed.`, variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ title: err?.response?.data?.message || 'Generation failed', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && resetAndClose()}>
            <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description || 'Select a class and section, then generate. Runs for everyone in the chosen scope.'}
                    </DialogDescription>
                </DialogHeader>

                {result ? (
                    <div className="space-y-6 py-8 flex flex-col items-center justify-center text-center">
                        {result.failed === 0 ? (
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        ) : (
                            <AlertCircle className="w-16 h-16 text-amber-500" />
                        )}
                        <div>
                            <h3 className="text-lg font-semibold">
                                {result.failed === 0 ? 'Generation Complete' : 'Completed with errors'}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {result.successful} generated{result.failed ? ` · ${result.failed} failed` : ''}
                            </p>
                        </div>
                        <Button variant="outline" onClick={resetAndClose}>Close</Button>
                    </div>
                ) : !institutionId ? (
                    <div className="py-10 text-center text-sm text-amber-600">
                        Select an institution from the top-bar switcher to generate documents.
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* Audience Toggle */}
                        {audienceType === 'both' && (
                            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 mb-4 bg-slate-50 dark:bg-slate-800">
                                <button
                                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${activeAudience === 'students' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    onClick={() => setActiveAudience('students')}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Students
                                </button>
                                <button
                                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${activeAudience === 'staff' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    onClick={() => setActiveAudience('staff')}
                                >
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Staff
                                </button>
                            </div>
                        )}

                        {activeAudience === 'students' ? (
                            <>
                                {/* Class */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Class <span className="text-red-500">*</span>
                                    </label>
                                    <select className={selectCls} value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                                <option value="">Select a class...</option>
                                {classes.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}{c.streamsEnabled ? ' (has streams)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stream (conditional) */}
                        {selectedClassId && streamsEnabled && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stream</label>
                                <select className={selectCls} value={selectedStreamId} onChange={(e) => setSelectedStreamId(e.target.value)}>
                                    <option value="">All Streams</option>
                                    {streams.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Section */}
                        {selectedClassId && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Section {requireSection && <span className="text-red-500">*</span>}
                                </label>
                                <select
                                    className={selectCls}
                                    value={selectedSectionId}
                                    onChange={(e) => setSelectedSectionId(e.target.value)}
                                    disabled={streamsEnabled && !selectedStreamId}
                                >
                                    <option value="">{requireSection ? 'Select a section...' : 'All Sections'}</option>
                                    {sections.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                            </>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                                <select className={selectCls} value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                                    <option value="">All Departments</option>
                                    {departments.map((d: any) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Manual Selection List */}
                        {selectionMode === 'manual-students' && scopeReady && (
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mt-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Recipients</span>
                                    <div className="flex gap-2">
                                        <button 
                                            className="text-xs text-[#b7102a] hover:text-[#8f0c21] font-medium transition-colors"
                                            onClick={() => setSelectedIds(activeAudience === 'staff' ? filteredStaff.map((s: any) => s.id) : students.map(s => s.id))}
                                        >Select All</button>
                                        <span className="text-slate-300">|</span>
                                        <button 
                                            className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                                            onClick={() => setSelectedIds([])}
                                        >Clear</button>
                                    </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                                    {(activeAudience === 'staff' ? filteredStaff : students).map((person: any) => (
                                        <label key={person.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md cursor-pointer transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-slate-300 text-[#b7102a] focus:ring-[#b7102a]"
                                                checked={selectedIds.includes(person.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedIds(prev => [...prev, person.id]);
                                                    else setSelectedIds(prev => prev.filter(id => id !== person.id));
                                                }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {activeAudience === 'staff' ? `${person.firstName} ${person.lastName || ''}` : person.name}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {activeAudience === 'staff' ? person.employeeCode : person.admissionNumber}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                    {(activeAudience === 'staff' ? filteredStaff : students).length === 0 && (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No {activeAudience} found in this scope.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Type-specific fields */}
                        {children}

                        {/* Template */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</label>
                            <select className={selectCls} value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                                <option value="">Default (auto)</option>
                                {templates.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {scopeReady && selectionMode === 'bulk-section' && (
                            <p className="text-xs text-slate-500">
                                {activeAudience === 'staff' ? filteredStaff.length : students.length} {activeAudience} in scope.
                            </p>
                        )}

                        {scopeReady && selectionMode === 'manual-students' && (
                            <p className="text-xs text-slate-500">
                                {selectedIds.length} {activeAudience} selected.
                            </p>
                        )}

                        {requiresDestructiveConfirmation && (
                            <label className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="mt-0.5 rounded border-red-300 text-red-600 focus:ring-red-500"
                                    checked={isConfirmed}
                                    onChange={(e) => setIsConfirmed(e.target.checked)}
                                />
                                <span className="text-sm text-red-800 dark:text-red-400 font-medium">
                                    {destructiveConfirmationMessage}
                                </span>
                            </label>
                        )}

                        <Button
                            className="w-full mt-2 bg-[#b7102a] hover:bg-[#8f0c21] text-white h-11 text-sm font-medium rounded-lg disabled:bg-slate-300 disabled:text-slate-500"
                            onClick={handleGenerate}
                            disabled={
                                isSubmitting || 
                                !scopeReady || 
                                !canSubmit || 
                                (requiresDestructiveConfirmation && !isConfirmed)
                            }
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {submitLabel}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
