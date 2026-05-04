import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClasses, useSections, useStudents } from '@/lib/queries';
import { useGenerateLibraryCard, useBulkGenerateLibraryCards, useLibraryCards } from '@/lib/queries/library-cards/library-card-queries';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LibraryCardsPage() {
    const [searchParams] = useSearchParams();
    
    // Derive institutionId from URL like StudentsPage does
    const institutionId = searchParams.get('institutionId');

    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Queries
    const { data: classes, isLoading: loadingClasses } = useClasses(institutionId || undefined);
    const { data: sections, isLoading: loadingSections } = useSections(selectedClassId, institutionId || undefined);
    
    // Fetch students based on selected section
    const { data: studentsData, isLoading: loadingStudents } = useStudents({
        institutionId: institutionId || '',
        classId: selectedClassId,
        sectionId: selectedSectionId,
        limit: '100', // For bulk operations, fetch max
    });
    
    // Also fetch generated library cards to know their status
    const { data: generatedCardsData } = useLibraryCards({
        institutionId: institutionId || '',
        limit: 100
    });

    const isReadyToFetch = !!(institutionId && selectedSectionId);
    const students = studentsData?.data || [];
    const generatedCards = generatedCardsData?.data || [];
    
    // Create a map to easily look up if a student has a card
    const studentsWithCards = new Set(generatedCards.map((c: any) => c.studentId));

    // Filter students by search query
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo?.toString().includes(searchQuery.toLowerCase())
    );

    // Mutations
    const { mutate: generateSingle } = useGenerateLibraryCard();
    const { mutate: generateBulk, isPending: generatingBulk } = useBulkGenerateLibraryCards();

    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const handleGenerateSingle = (studentId: string) => {
        if (!institutionId) return;
        setGeneratingId(studentId);
        
        generateSingle(
            { institutionId, data: { studentId } },
            {
                onSuccess: () => {
                    toast.success('Library card generated successfully');
                    setGeneratingId(null);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'Failed to generate library card');
                    setGeneratingId(null);
                }
            }
        );
    };

    const handleGenerateBulk = () => {
        if (!institutionId || students.length === 0) return;
        
        const studentIds = filteredStudents.map(s => s.id);
        
        generateBulk(
            { institutionId, data: { studentIds } },
            {
                onSuccess: () => toast.success(`Generating library cards for ${studentIds.length} students`),
                onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to generate library cards')
            }
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <PageHeader
                    breadcrumb={[
                        { label: 'Dashboard', href: '/app/dashboard' },
                        { label: 'Library Cards' },
                    ]}
                    title="Generate Library Cards"
                    description="View and download library member cards for students"
                />
                
                {isReadyToFetch && filteredStudents.length > 0 && (
                    <Button 
                        onClick={handleGenerateBulk} 
                        disabled={generatingBulk}
                        className="bg-brand-500 hover:bg-brand-600 font-semibold"
                    >
                        {generatingBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                        Generate All ({filteredStudents.length})
                    </Button>
                )}
            </div>

            <Card className="bg-dark-800/50 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Class</label>
                            <select 
                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                                value={selectedClassId}
                                onChange={(e) => {
                                    setSelectedClassId(e.target.value);
                                    setSelectedSectionId('');
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
                    </div>
                </CardContent>
            </Card>

            {isReadyToFetch ? (
                <Card className="bg-dark-800/50 backdrop-blur-xl border-white/10">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
                        <div>
                            <CardTitle>Students List</CardTitle>
                            <CardDescription>Generate individual or bulk library cards</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                placeholder="Search by name or roll no..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-dark-900/50 border-white/10 text-white w-full h-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingStudents ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
                                <p className="text-gray-400">Loading students...</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No students found in this section.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-medium">
                                            <th className="px-4 py-3 w-16 text-center">Roll No</th>
                                            <th className="px-4 py-3">Student Name</th>
                                            <th className="px-4 py-3">Admission No</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredStudents.map((student) => {
                                            const isGenerating = generatingId === student.id || generatingBulk;
                                            const hasCard = studentsWithCards.has(student.id);
                                            
                                            return (
                                                <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 text-center text-gray-400">
                                                        {student.rollNo || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-white">{student.name}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400">
                                                        {student.admissionNumber || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {hasCard ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                                Generated
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            disabled={isGenerating}
                                                            onClick={() => handleGenerateSingle(student.id)}
                                                            className="border-white/10 hover:bg-white/10 text-white bg-transparent h-8"
                                                        >
                                                            {generatingId === student.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                                            ) : (
                                                                <FileDown className="w-3.5 h-3.5 mr-2" />
                                                            )}
                                                            {hasCard ? 'Re-generate' : 'Generate'}
                                                        </Button>
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
                    <FileDown className="w-12 h-12 text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-gray-300 mb-2">Select Filters</h3>
                    <p className="text-gray-500 max-w-sm">
                        Please select a class and section to view students and generate library cards.
                    </p>
                </div>
            )}
        </div>
    );
}
