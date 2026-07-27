import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileSpreadsheet, Download, Award, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useExamSchedules, useMarksheets, useBulkGenerateMarksheets } from '@/lib/queries';
import { usePageInstitution } from '@/hooks/usePageInstitution';
import { GenerateDocsModal } from '@/components/printables/GenerateDocsModal';

export default function MarksheetsPage() {
    const navigate = useNavigate();
    const institutionId = usePageInstitution();
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState('');

    const { data: listRaw, isLoading } = useMarksheets({ page: 1, limit: 60 });
    const marksheets: any[] = (listRaw as any)?.marksheets ?? (listRaw as any)?.data ?? [];

    const examRaw = useExamSchedules(institutionId ? { institutionId } : undefined).data;
    const exams: any[] = Array.isArray(examRaw) ? examRaw : (examRaw as any)?.data || [];

    const generateBulk = useBulkGenerateMarksheets();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marksheets</h1>
                    <p className="text-gray-500 dark:text-gray-400">Generate and manage student marksheets</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/app/marksheets/entry')}>
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Enter Marks
                    </Button>
                    <Button className="bg-gradient-to-r from-[#E63946] to-[#C41E3A]" onClick={() => setIsGenerateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Generate New
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-40 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    ))
                ) : marksheets.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <FileSpreadsheet className="w-8 h-8 text-[#b7102a]" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Marksheets Yet</h3>
                        <p className="text-gray-500 max-w-sm mt-1 mb-6">
                            Enter marks for an exam, then generate marksheets for a class or section.
                        </p>
                        <Button className="bg-gradient-to-r from-[#E63946] to-[#C41E3A]" onClick={() => setIsGenerateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Generate New
                        </Button>
                    </div>
                ) : (
                    marksheets.map((m: any) => (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {m.student?.name || m.student?.admissionNumber || 'Student'}
                                            </h3>
                                            <p className="text-sm text-gray-500 truncate">
                                                {m.examSchedule?.examName || 'Examination'}
                                                {m.student?.section?.class?.name ? ` · ${m.student.section.class.name}` : ''}
                                            </p>
                                        </div>
                                        {m.grade && (
                                            <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                <Award className="w-3 h-3" /> {m.grade}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {m.totalPercentage != null ? `${Number(m.totalPercentage)}%` : '—'}
                                            <span className="ml-2 text-xs text-gray-400">{m.status}</span>
                                        </div>
                                        {m.pdfUrl && (
                                            <Button size="sm" variant="outline" onClick={() => window.open(m.pdfUrl, '_blank')}>
                                                <Download className="w-4 h-4 mr-1.5" /> PDF
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            <GenerateDocsModal
                isOpen={isGenerateOpen}
                onClose={() => setIsGenerateOpen(false)}
                title="Generate Marksheets"
                description="Generate marksheets for everyone in the selected scope. Marks must already be entered for the chosen exam."
                serviceType="marksheet"
                institutionId={institutionId}
                canSubmit={!!selectedExamId}
                submitLabel="Generate Marksheets"
                onGenerate={async ({ studentIds, institutionId: inst, templateId }) => {
                    const res: any = await generateBulk.mutateAsync({
                        institutionId: inst,
                        data: { studentIds: studentIds || [], examScheduleId: selectedExamId, templateId },
                    });
                    const body = res?.data ?? res;
                    return {
                        successful: body?.successful?.length ?? 0,
                        failed: body?.failed?.length ?? 0,
                    };
                }}
            >
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Exam <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#b7102a]/20"
                        value={selectedExamId}
                        onChange={(e) => setSelectedExamId(e.target.value)}
                    >
                        <option value="">Select an exam...</option>
                        {exams.map((ex: any) => (
                            <option key={ex.id} value={ex.id}>
                                {ex.examName}{ex.academicYear ? ` (${ex.academicYear})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </GenerateDocsModal>
        </div>
    );
}
