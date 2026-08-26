import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileSpreadsheet, Download, Award, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamSchedules, useMarksheets, useBulkGenerateMarksheets } from '@/lib/queries';
import { usePageInstitution } from '@/hooks/usePageInstitution';
import { GenerateDocsModal } from '@/components/printables/GenerateDocsModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

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
        <div className="p-4 sm:p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Marksheets' },
                ]}
                title="Marksheets"
                description="Generate and manage student marksheets"
                action={
                    <>
                        <Button variant="outline" onClick={() => navigate('/app/marksheets/entry')}>
                            <ClipboardList className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Enter Marks</span>
                        </Button>
                        <Button onClick={() => setIsGenerateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Generate New</span>
                            <span className="sm:hidden">Generate</span>
                        </Button>
                    </>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : marksheets.length === 0 ? (
                <EmptyState
                    icon={FileSpreadsheet}
                    title="No marksheets yet"
                    description="Enter marks for an exam, then generate marksheets for a class or section."
                    action={{ label: 'Generate New', onClick: () => setIsGenerateOpen(true) }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {marksheets.map((m: any) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="indic-card rounded-2xl p-5"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-base truncate">
                                        {m.student?.name || m.student?.admissionNumber || 'Student'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {m.examSchedule?.examName || 'Examination'}
                                        {m.student?.section?.class?.name ? ` · ${m.student.section.class.name}` : ''}
                                    </p>
                                </div>
                                {m.grade && (
                                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-accent text-accent-foreground border border-primary/20">
                                        <Award className="w-3 h-3" /> {m.grade}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-foreground">
                                    {m.totalPercentage != null ? `${Number(m.totalPercentage)}%` : '—'}
                                    <span className="ml-2 text-xs text-muted-foreground capitalize">{m.status}</span>
                                </div>
                                {m.pdfUrl && (
                                    <Button size="sm" variant="outline" onClick={() => window.open(m.pdfUrl, '_blank')}>
                                        <Download className="w-4 h-4 mr-1.5" /> PDF
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

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
                    <label className="text-sm font-medium text-foreground">
                        Exam <span className="text-destructive">*</span>
                    </label>
                    <select
                        className="w-full bg-muted/40 border border-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-primary"
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
