import { useState } from 'react';
import { Plus, FileText, Award } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionPicker } from '@/components/shared/SectionPicker';
import { StudentPicker } from '@/components/shared/StudentPicker';
import {
  useAssessments,
  useReportCard,
  useCreateAssessment,
  useEnterMark,
  type CceTermType,
} from '@/lib/queries/gradebook/gradebook-queries';

const TERMS: CceTermType[] = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];

export default function GradebookPage() {
  const [sectionId, setSectionId] = useState('');
  const [reportStudent, setReportStudent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ subjectName: '', name: '', termType: 'FA1' as CceTermType, maxMarks: '100', weightage: '100' });
  const [markEntry, setMarkEntry] = useState<{ assessmentId: string; studentId: string; marks: string } | null>(null);

  const { data: assessments, isLoading } = useAssessments(sectionId || undefined);
  const { data: report } = useReportCard(sectionId || undefined, reportStudent || undefined);
  const createAssessment = useCreateAssessment();
  const enterMark = useEnterMark();

  const submit = () => {
    if (!sectionId) return toast.error('Enter a Section ID first');
    if (!form.subjectName || !form.name) return toast.error('Subject and assessment name required');
    createAssessment.mutate(
      { sectionId, subjectName: form.subjectName, name: form.name, termType: form.termType, maxMarks: Number(form.maxMarks), weightage: Number(form.weightage) },
      { onSuccess: () => { toast.success('Assessment created'); setDialogOpen(false); setForm({ subjectName: '', name: '', termType: 'FA1', maxMarks: '100', weightage: '100' }); } },
    );
  };

  const saveMark = () => {
    if (!markEntry || !markEntry.studentId || !markEntry.marks) return toast.error('Student ID and marks required');
    enterMark.mutate(
      { assessmentId: markEntry.assessmentId, studentId: markEntry.studentId, marksObtained: Number(markEntry.marks) },
      { onSuccess: () => { toast.success('Mark saved'); setMarkEntry(null); } },
    );
  };

  return (
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Academics' }, { label: 'Continuous Assessment (CCE)' }]}
        title="Continuous Assessment (CCE)"
        description="FA/SA assessments, CBSE auto-grading and report cards"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Assessment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New CCE Assessment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Subject (e.g. Mathematics)" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} />
                <Input placeholder="Assessment name (e.g. FA1 Unit Test)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.termType} onChange={(e) => setForm({ ...form, termType: e.target.value as CceTermType })}>
                    {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Input placeholder="Max marks" type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
                  <Input placeholder="Weight %" type="number" value={form.weightage} onChange={(e) => setForm({ ...form, weightage: e.target.value })} />
                </div>
                <Button className="w-full" onClick={submit}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1 min-w-[260px]">
            <label className="text-xs text-muted-foreground">Section</label>
            <SectionPicker value={sectionId} onChange={setSectionId} />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs text-muted-foreground">Report card — Student</label>
            <StudentPicker value={reportStudent} onChange={(id) => setReportStudent(id)} sectionId={sectionId || undefined} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" /> Assessments</h3>
            {!sectionId ? (
              <p className="text-sm text-muted-foreground">Enter a Section ID above to load assessments.</p>
            ) : isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !assessments?.length ? (
              <p className="text-sm text-muted-foreground">No assessments for this section yet.</p>
            ) : (
              <div className="space-y-2">
                {assessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{a.subjectName} — {a.name}</p>
                      <p className="text-xs text-muted-foreground"><Badge variant="secondary" className="mr-1">{a.termType}</Badge> max {a.maxMarks} · weight {a.weightage}% · {a._count?.marks ?? 0} marks</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setMarkEntry({ assessmentId: a.id, studentId: '', marks: '' })}>Enter mark</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Award className="h-4 w-4" /> Report Card</h3>
            {!report ? (
              <p className="text-sm text-muted-foreground">Enter Section ID + Student ID to view a report card.</p>
            ) : !report.subjects?.length ? (
              <p className="text-sm text-muted-foreground">No marks recorded for this student.</p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-sm">Overall: <span className="font-bold">{report.overallPercent}%</span> <Badge>{report.overallGrade}</Badge></p>
                </div>
                {report.subjects.map((s) => (
                  <div key={s.subjectName} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{s.subjectName}</p>
                      <Badge variant="secondary">{s.percent}% · {s.grade}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.entries.map((e) => `${e.term}: ${e.marks}/${e.max}`).join(' · ')}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!markEntry} onOpenChange={(o) => !o && setMarkEntry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enter Mark</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <StudentPicker value={markEntry?.studentId} onChange={(id) => setMarkEntry((m) => m && { ...m, studentId: id })} sectionId={sectionId || undefined} />
            <Input placeholder="Marks obtained" type="number" value={markEntry?.marks ?? ''} onChange={(e) => setMarkEntry((m) => m && { ...m, marks: e.target.value })} />
            <Button className="w-full" onClick={saveMark}>Save (auto-grades)</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
