import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { type Student, useInstitutions } from '@/lib/queries';
import { api } from '@/lib/api';
import { normalizeAcademics, NormalizedClass, NormalizedStream, NormalizedSection } from '@/lib/normalizeAcademics';
import { StudentTabForm } from '@/components/students/StudentTabForm';

interface StudentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: Student | null;
    defaultInstitutionId?: string;
    mode?: 'view' | 'edit' | 'create';
}

export default function StudentModal({
    open,
    onOpenChange,
    student,
    defaultInstitutionId,
    mode = 'edit'
}: StudentModalProps) {
    const isEditing = !!student && mode !== 'create';
    const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);

    // Fallback if institution isn't available from props but might be inside student
    const activeInstId = student?.institutionId || defaultInstitutionId || '';

    // Reset when modal closes or opens with new student
    useEffect(() => {
        if (!open) setCreatedStudentId(null);
    }, [open, student]);

    const activeStudentId = student?.id || createdStudentId;
    const needsInitialPhase = !isEditing && !createdStudentId;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900 border-none">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {mode === 'view' ? 'Student Details' : isEditing ? 'Continue Student Onboarding' : 'Begin Student Onboarding'}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'view'
                                ? 'Viewing student records in read-only mode.'
                                : isEditing
                                    ? 'Update student draft progress through the sequential tabs.'
                                    : 'Complete the following sections accurately. You can save progress and return later.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 relative min-h-0">
                    {needsInitialPhase ? (
                        <NewStudentInitialPhase
                            institutionId={activeInstId}
                            onCreated={(id) => setCreatedStudentId(id)}
                        />
                    ) : !activeInstId ? (
                        <div className="p-8 text-center text-red-500">
                            Error: No institution context available. Cannot start onboarding.
                        </div>
                    ) : (
                        <StudentTabForm
                            institutionId={activeInstId}
                            studentId={activeStudentId || undefined}
                            mode={mode === 'view' ? 'view' : 'admin'}
                            onClose={() => onOpenChange(false)}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial Phase component for new students (select section & name)
// ─────────────────────────────────────────────────────────────────────────────
function NewStudentInitialPhase({
    institutionId,
    onCreated
}: {
    institutionId: string,
    onCreated: (studentId: string) => void
}) {
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(institutionId || '');
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStreamId, setSelectedStreamId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');

    // Fetch Academic Hierarchy
    const { data: instData, isLoading: loadingInst } = useInstitutions({});
    const institutions = instData?.data || [];

    const { data: rawClasses, isLoading: loadingClasses } = useQuery<NormalizedClass[]>({
        queryKey: ['classes', selectedInstitutionId],
        queryFn: async () => { const res = await api.get('/class', { params: { institutionId: selectedInstitutionId } }); return res.data.data; },
        enabled: !!selectedInstitutionId
    });
    const { data: rawStreams, isLoading: loadingStreams } = useQuery<NormalizedStream[]>({
        queryKey: ['streams', 'all', selectedInstitutionId],
        queryFn: async () => { const res = await api.get('/stream', { params: { institutionId: selectedInstitutionId } }); return res.data.data; },
        enabled: !!selectedInstitutionId
    });
    const { data: rawSections, isLoading: loadingSections } = useQuery<NormalizedSection[]>({
        queryKey: ['sections', 'all', selectedInstitutionId],
        queryFn: async () => { const res = await api.get('/section', { params: { institutionId: selectedInstitutionId, limit: 1000 } }); return res.data.data; },
        enabled: !!selectedInstitutionId
    });

    const normalizedData = useMemo(() => {
        return normalizeAcademics(rawClasses || [], rawStreams || [], rawSections || []);
    }, [rawClasses, rawStreams, rawSections]);

    // Derived states
    const selectedClass = useMemo(() => normalizedData.find(c => c.id === selectedClassId), [normalizedData, selectedClassId]);
    const streamsEnabled = selectedClass?.streamsEnabled ?? false;
    const activeStreams = selectedClass?.streams || [];
    const activeSections = useMemo(() => {
        if (!selectedClass) return [];
        if (streamsEnabled) {
            if (!selectedStreamId) return [];
            const stream = selectedClass.streams.find(s => s.id === selectedStreamId);
            return stream?.sections || [];
        } else {
            return selectedClass.sections;
        }
    }, [selectedClass, streamsEnabled, selectedStreamId]);

    // Reset dependents when ancestors change
    useEffect(() => {
        setSelectedStreamId('');
        setSelectedSectionId('');
    }, [selectedClassId]);

    useEffect(() => {
        setSelectedSectionId('');
    }, [selectedStreamId]);

    const createStudentMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/student', {
                institutionId: selectedInstitutionId,
                sectionId: selectedSectionId,
                name: name.trim()
            });
            return response.data.data;
        },
        onSuccess: (data) => {
            toast.success('Student allocated to section successfully.');
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['student-counts-by-section'] });
            onCreated(data.id);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to allocate student');
        }
    });

    const isSubmitting = createStudentMutation.isPending;
    const isValid = name.trim().length > 0 && selectedInstitutionId && selectedSectionId;

    if (loadingInst || loadingClasses || loadingStreams || loadingSections) {
        return <div className="p-8 text-center text-gray-500 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
    }

    return (
        <div className="p-8 max-w-xl mx-auto space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-900/30">
                To begin onboarding, you must first allocate the student to a section.
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Institution *</Label>
                    <Select value={selectedInstitutionId} onValueChange={setSelectedInstitutionId} disabled={isSubmitting || !!institutionId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Institution" />
                        </SelectTrigger>
                        <SelectContent>
                            {institutions.map((inst: any) => (
                                <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Student Full Name *</Label>
                    <Input
                        placeholder="Enter student's full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={isSubmitting || !selectedInstitutionId}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Class *</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={isSubmitting || !selectedInstitutionId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {normalizedData.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {streamsEnabled && (
                    <div className="space-y-2">
                        <Label>Stream *</Label>
                        <Select value={selectedStreamId} onValueChange={setSelectedStreamId} disabled={isSubmitting || activeStreams.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder={activeStreams.length === 0 ? "No streams available" : "Select Stream"} />
                            </SelectTrigger>
                            <SelectContent>
                                {activeStreams.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Section *</Label>
                    <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={isSubmitting || activeSections.length === 0 || (!selectedStreamId && streamsEnabled)}>
                        <SelectTrigger>
                            <SelectValue placeholder={activeSections.length === 0 ? "No sections available" : "Select Section"} />
                        </SelectTrigger>
                        <SelectContent>
                            {activeSections.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} ({s._count?.students || 0} / {s.expectedStudentCount})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <Button
                    onClick={() => createStudentMutation.mutate()}
                    disabled={!isValid || isSubmitting}
                    className="w-full sm:w-auto"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Allocate & Continue
                </Button>
            </div>
        </div>
    );
}
