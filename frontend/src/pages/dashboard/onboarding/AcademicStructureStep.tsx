import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus, GraduationCap, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface ClassItem {
    id: string;
    name: string;
    displayOrder: number;
    sections: SectionItem[];
}

interface SectionItem {
    id: string;
    name: string;
    expectedStudentCount: number;
}

const DEFAULT_CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const DEFAULT_SECTIONS = ['A', 'B'];

export default function AcademicStructureStep() {
    const { id: institutionId } = useParams<{ id: string }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newClassName, setNewClassName] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [activeSectionClassId, setActiveSectionClassId] = useState<string | null>(null);

    // Fetch existing classes
    const { data: classesData, isLoading } = useQuery({
        queryKey: ['onboarding-classes', institutionId],
        queryFn: async () => {
            const res = await api.get('/class', { params: { institutionId, limit: 50 } });
            return res.data.data || [];
        },
        enabled: !!institutionId,
    });

    // Fetch sections for all classes
    const { data: sectionsData } = useQuery({
        queryKey: ['onboarding-sections', institutionId],
        queryFn: async () => {
            const res = await api.get('/section', { params: { institutionId, limit: 200 } });
            return res.data.data || [];
        },
        enabled: !!institutionId,
    });

    // Build merged class+section list
    const classes: ClassItem[] = (classesData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        displayOrder: c.displayOrder || 0,
        sections: (sectionsData || [])
            .filter((s: any) => s.classId === c.id)
            .map((s: any) => ({ id: s.id, name: s.name, expectedStudentCount: s.expectedStudentCount || 40 })),
    }));

    // Add class
    const addClassMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await api.post('/class', {
                institutionId,
                name,
                displayOrder: classes.length + 1,
            });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-classes', institutionId] });
            setNewClassName('');
            toast({ title: 'Class added' });
        },
        onError: () => toast({ title: 'Error', description: 'Failed to add class', variant: 'destructive' }),
    });

    // Delete class
    const deleteClassMutation = useMutation({
        mutationFn: async (classId: string) => {
            await api.delete(`/class/${classId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-classes', institutionId] });
            queryClient.invalidateQueries({ queryKey: ['onboarding-sections', institutionId] });
            toast({ title: 'Class removed' });
        },
        onError: () => toast({ title: 'Error', description: 'Failed to remove class', variant: 'destructive' }),
    });

    // Add section to a class
    const addSectionMutation = useMutation({
        mutationFn: async ({ classId, name }: { classId: string; name: string }) => {
            const res = await api.post('/section', {
                institutionId,
                classId,
                name,
                expectedStudentCount: 40,
            });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-sections', institutionId] });
            setNewSectionName('');
            setActiveSectionClassId(null);
            toast({ title: 'Section added' });
        },
        onError: () => toast({ title: 'Error', description: 'Failed to add section', variant: 'destructive' }),
    });

    // Delete section
    const deleteSectionMutation = useMutation({
        mutationFn: async (sectionId: string) => {
            await api.delete(`/section/${sectionId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-sections', institutionId] });
            toast({ title: 'Section removed' });
        },
        onError: () => toast({ title: 'Error', description: 'Failed to remove section', variant: 'destructive' }),
    });

    // Quick-add: Add all standard classes with default sections
    const quickSetupMutation = useMutation({
        mutationFn: async () => {
            for (let i = 0; i < DEFAULT_CLASSES.length; i++) {
                const className = DEFAULT_CLASSES[i];
                // Check if class already exists
                const existing = classes.find(c => c.name === className);
                if (existing) continue;

                const res = await api.post('/class', {
                    institutionId,
                    name: className,
                    displayOrder: i + 1,
                });
                const classId = res.data.data.id;

                // Add default sections
                for (const sectionName of DEFAULT_SECTIONS) {
                    await api.post('/section', {
                        institutionId,
                        classId,
                        name: sectionName,
                        expectedStudentCount: 40,
                    });
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-classes', institutionId] });
            queryClient.invalidateQueries({ queryKey: ['onboarding-sections', institutionId] });
            toast({ title: 'Quick Setup Complete', description: 'Added 1st-12th classes with sections A & B' });
        },
        onError: () => toast({ title: 'Error', description: 'Quick setup failed', variant: 'destructive' }),
    });

    if (isLoading) {
        return <div className="text-center text-muted-foreground py-8">Loading academic structure...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Academic Structure
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Set up classes and sections for your institution. You can always modify these later.
                </p>
            </div>

            {/* Quick Setup */}
            {classes.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-3">
                    <GraduationCap className="w-10 h-10 mx-auto text-primary/60" />
                    <div>
                        <h4 className="font-semibold">Quick Setup</h4>
                        <p className="text-sm text-muted-foreground">
                            Instantly create classes 1st through 12th with sections A & B each.
                        </p>
                    </div>
                    <Button
                        onClick={() => quickSetupMutation.mutate()}
                        disabled={quickSetupMutation.isPending}
                        className="bg-primary"
                    >
                        {quickSetupMutation.isPending ? 'Setting up...' : 'Use Standard K-12 Setup'}
                    </Button>
                </div>
            )}

            {/* Add Class Manually */}
            <div className="flex items-end gap-3">
                <div className="flex-1">
                    <Label>Add Class</Label>
                    <Input
                        placeholder="e.g. Nursery, LKG, UKG..."
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newClassName.trim()) {
                                addClassMutation.mutate(newClassName.trim());
                            }
                        }}
                    />
                </div>
                <Button
                    onClick={() => newClassName.trim() && addClassMutation.mutate(newClassName.trim())}
                    disabled={!newClassName.trim() || addClassMutation.isPending}
                    size="sm"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
            </div>

            {/* Classes & Sections List */}
            {classes.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                        Classes ({classes.length})
                    </h4>
                    <div className="grid gap-3">
                        {classes
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((cls) => (
                            <div
                                key={cls.id}
                                className="rounded-lg border bg-card p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                        <span className="font-semibold">Class {cls.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({cls.sections.length} section{cls.sections.length !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteClassMutation.mutate(cls.id)}
                                        disabled={deleteClassMutation.isPending}
                                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Sections */}
                                <div className="flex flex-wrap gap-2 pl-6">
                                    {cls.sections.map((sec) => (
                                        <span
                                            key={sec.id}
                                            className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm group"
                                        >
                                            {sec.name}
                                            <button
                                                onClick={() => deleteSectionMutation.mutate(sec.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive ml-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}

                                    {/* Add section inline */}
                                    {activeSectionClassId === cls.id ? (
                                        <div className="inline-flex items-center gap-1">
                                            <Input
                                                className="h-7 w-16 text-sm"
                                                placeholder="Name"
                                                value={newSectionName}
                                                autoFocus
                                                onChange={(e) => setNewSectionName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && newSectionName.trim()) {
                                                        addSectionMutation.mutate({ classId: cls.id, name: newSectionName.trim() });
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setActiveSectionClassId(null);
                                                        setNewSectionName('');
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2"
                                                onClick={() => {
                                                    if (newSectionName.trim()) {
                                                        addSectionMutation.mutate({ classId: cls.id, name: newSectionName.trim() });
                                                    }
                                                }}
                                            >
                                                ✓
                                            </Button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setActiveSectionClassId(cls.id);
                                                setNewSectionName('');
                                            }}
                                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 px-3 py-1 text-sm text-primary/70 hover:bg-primary/5 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Section
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {classes.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    ✓ Your changes are saved automatically. Click "Continue Next Step" to proceed.
                </p>
            )}
        </div>
    );
}
