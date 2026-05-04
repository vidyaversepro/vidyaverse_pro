import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    useExamSchedules,
    useClasses,
    useSections,
    useSubjects,
    useMarksEntryGrid,
    useBulkMarkEntryMutation,
} from '@/lib/queries';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, AlertCircle, FileSpreadsheet, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function MarksEntryPage() {
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    
    // Derive institutionId from URL like StudentsPage does
    const institutionId = searchParams.get('institutionId') || undefined;

    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

    // Local state for the editable grid
    const [marksData, setMarksData] = useState<Record<string, { theory: string; practical: string }>>({});
    const [searchQuery, setSearchQuery] = useState('');

    // Queries
    const { data: examData, isLoading: loadingExams } = useExamSchedules(
        institutionId ? { institutionId } : undefined
    );
    const { data: classes, isLoading: loadingClasses } = useClasses(institutionId);
    const { data: sections, isLoading: loadingSections } = useSections(selectedClassId, institutionId);
    const { data: subjects, isLoading: loadingSubjects } = useSubjects(selectedClassId, institutionId);

    const isReadyToFetch = !!(institutionId && selectedExamId && selectedSectionId && selectedSubjectId);
    const { data: gridData, isLoading: loadingGrid, isFetching } = useMarksEntryGrid(
        institutionId || '',
        selectedExamId,
        selectedSectionId,
        selectedSubjectId
    );

    const { mutate: submitMarks, isPending: subittingMarks } = useBulkMarkEntryMutation(institutionId || '');

    // Initialize local state when grid data loads
    useEffect(() => {
        if (gridData) {
            const initialMarks: Record<string, { theory: string; practical: string }> = {};
            gridData.forEach((row) => {
                initialMarks[row.studentId] = {
                    theory: row.theoryMarks !== null ? String(row.theoryMarks) : '',
                    practical: row.practicalMarks !== null ? String(row.practicalMarks) : '',
                };
            });
            setMarksData(initialMarks);
        }
    }, [gridData]);

    // Handle input change
    const handleMarkChange = (studentId: string, field: 'theory' | 'practical', value: string) => {
        // Only allow numbers and empty string
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;

        setMarksData((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
            },
        }));
    };

    const handleSaveMarks = () => {
        if (!gridData || !selectedExamId || !selectedSubjectId) return;

        const entries = gridData.map((row) => {
            const localData = marksData[row.studentId] || { theory: '', practical: '' };
            const theory = localData.theory ? Number(localData.theory) : 0;
            const practical = localData.practical ? Number(localData.practical) : 0;
            // The schema expects marksObtained which is usually total. Let's send theory as marksObtained too for fallback, or total them.
            // Based on service: marksObtained maps to theoryObtainedMarks, practicalMarks to practical, theoryMarks to max.
            // Oh wait, bulk schema expects marksObtained, practicalMarks, theoryMarks.
            // Service says: marksObtained implies theoryObtainedMarks.
            return {
                studentId: row.studentId,
                marksObtained: theory, // theory marks
                practicalMarks: practical,
            };
        });

        submitMarks(
            {
                examScheduleId: selectedExamId,
                subjectId: selectedSubjectId,
                entries,
            },
            {
                onSuccess: () => {
                    toast({ title: 'Success', description: 'Marks updated successfully' });
                },
                onError: (error: any) => {
                    toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to save marks', variant: 'destructive' });
                },
            }
        );
    };

    if (!institutionId) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">No Institution Selected</h2>
                <p className="text-gray-400 max-w-md">
                    Please select or create an institution from the dashboard to manage marks.
                </p>
            </div>
        );
    }

    const filteredGridData = gridData?.filter(row => 
        row.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.enrollmentNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-brand-400" />
                        Marks Entry
                    </h1>
                    <p className="text-gray-400 mt-1">Bulk enter marks for students by subject</p>
                </div>
                {isReadyToFetch && gridData && gridData.length > 0 && (
                    <Button 
                        onClick={handleSaveMarks} 
                        disabled={subittingMarks || isFetching}
                        className="bg-brand-500 hover:bg-brand-600 font-semibold"
                    >
                        {subittingMarks ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save All Marks
                    </Button>
                )}
            </div>

            {/* Filters Section */}
            <Card className="bg-dark-800/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Exam Schedule</label>
                            <select
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                disabled={loadingExams}
                            >
                                <option value="">Select Exam...</option>
                                {(Array.isArray(examData) ? examData : (examData as any)?.data)?.map((exam: any) => (
                                    <option key={exam.id} value={exam.id}>
                                        {exam.examName} ({exam.academicYear})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Class</label>
                            <select
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                                value={selectedClassId}
                                onChange={(e) => {
                                    setSelectedClassId(e.target.value);
                                    setSelectedSectionId(''); // Reset section
                                    setSelectedSubjectId(''); // Reset subject
                                }}
                                disabled={loadingClasses}
                            >
                                <option value="">Select Class...</option>
                                {classes?.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Section</label>
                            <select
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                                value={selectedSectionId}
                                onChange={(e) => setSelectedSectionId(e.target.value)}
                                disabled={!selectedClassId || loadingSections}
                            >
                                <option value="">Select Section...</option>
                                {sections?.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Subject</label>
                            <select
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                disabled={!selectedClassId || loadingSubjects}
                            >
                                <option value="">Select Subject...</option>
                                {subjects?.map((sub: any) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.subjectName} {sub.subjectCode ? `(${sub.subjectCode})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Grid Section */}
            {isReadyToFetch ? (
                <Card className="bg-dark-800/50 backdrop-blur-xl border-white/10">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
                        <div>
                            <CardTitle>Students List</CardTitle>
                            <CardDescription>Enter marks for each student in the grid below</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-dark-900/50 border-white/10"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingGrid ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
                                <p className="text-gray-400">Loading student marks...</p>
                            </div>
                        ) : !gridData || gridData.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No students found in the selected section.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px] text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-medium">
                                            <th className="px-4 py-3 w-16 text-center">Roll No</th>
                                            <th className="px-4 py-3">Student Name</th>
                                            <th className="px-4 py-3 w-32">Theory Marks</th>
                                            <th className="px-4 py-3 w-32">Practical Marks</th>
                                            <th className="px-4 py-3 w-32">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredGridData?.map((row) => {
                                            const localData = marksData[row.studentId] || { theory: '', practical: '' };
                                            const theoryNum = parseFloat(localData.theory) || 0;
                                            const practicalNum = parseFloat(localData.practical) || 0;
                                            const hasUnsavedChanges = (row.theoryMarks !== theoryNum && localData.theory !== '') || (row.practicalMarks !== practicalNum && localData.practical !== '');

                                            return (
                                                <tr key={row.studentId} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 text-center text-gray-400">
                                                        {row.rollNumber || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-white">{row.studentName}</div>
                                                        <div className="text-xs text-gray-500">{row.enrollmentNumber}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="text"
                                                            value={localData.theory}
                                                            onChange={(e) => handleMarkChange(row.studentId, 'theory', e.target.value)}
                                                            className={`w-full bg-dark-900/50 h-9 text-center border-white/10 ${hasUnsavedChanges ? 'border-brand-500/50' : ''}`}
                                                            placeholder="-"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="text"
                                                            value={localData.practical}
                                                            onChange={(e) => handleMarkChange(row.studentId, 'practical', e.target.value)}
                                                            className={`w-full bg-dark-900/50 h-9 text-center border-white/10 ${hasUnsavedChanges ? 'border-brand-500/50' : ''}`}
                                                            placeholder="-"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-medium text-white">
                                                        {theoryNum + practicalNum}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl bg-dark-800/30">
                    <FileSpreadsheet className="w-12 h-12 text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-gray-300 mb-2">Select Filters</h3>
                    <p className="text-gray-500 max-w-sm">
                        Please select an exam schedule, class, section, and subject to begin entering marks.
                    </p>
                </div>
            )}
        </div>
    );
};
