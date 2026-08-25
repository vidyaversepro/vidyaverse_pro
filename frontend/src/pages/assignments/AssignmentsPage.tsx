import { useState } from 'react';
import { ClipboardList, Plus, Send, Lock, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionPicker } from '@/components/shared/SectionPicker';
import { StatusPill } from '@/components/shared/Pill';
import {
  useAssignments,
  useSubmissions,
  useCreateAssignment,
  usePublishAssignment,
  useCloseAssignment,
  useGradeSubmission,
} from '@/lib/queries/assignments/assignments-queries';

export default function AssignmentsPage() {
  const [sectionId, setSectionId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ subjectName: '', title: '', description: '', dueDate: '', maxMarks: '' });
  const [viewing, setViewing] = useState<string | null>(null);

  const { data: assignments, isLoading } = useAssignments(sectionId || undefined);
  const { data: submissions } = useSubmissions(viewing || undefined);
  const createAssignment = useCreateAssignment();
  const publish = usePublishAssignment();
  const closeIt = useCloseAssignment();
  const grade = useGradeSubmission();

  const submit = () => {
    if (!sectionId) return toast.error('Enter a Section ID first');
    if (!form.subjectName || !form.title) return toast.error('Subject and title required');
    createAssignment.mutate(
      { sectionId, subjectName: form.subjectName, title: form.title, description: form.description, dueDate: form.dueDate || undefined, maxMarks: form.maxMarks ? Number(form.maxMarks) : undefined, publish: true },
      { onSuccess: () => { toast.success('Assignment published'); setDialogOpen(false); setForm({ subjectName: '', title: '', description: '', dueDate: '', maxMarks: '' }); } },
    );
  };

  const gradeSubmission = (submissionId: string) => {
    const marks = window.prompt('Marks obtained:');
    if (!marks) return;
    grade.mutate({ submissionId, marksObtained: Number(marks) }, { onSuccess: () => toast.success('Graded') });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Academics' }, { label: 'Assignments & Homework' }]}
        title="Assignments & Homework"
        description="Publish work, collect submissions and grade"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> New Assignment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Subject" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} />
                <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <label className="text-xs text-muted-foreground">Due date</label>
                <Input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                <Input placeholder="Max marks" type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
                <Button className="w-full" onClick={submit}>Publish</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <label className="text-xs text-muted-foreground">Section</label>
          <SectionPicker value={sectionId} onChange={setSectionId} className="w-full sm:max-w-md" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><ClipboardList className="h-4 w-4" /> Assignments</h3>
            {!sectionId ? (
              <p className="text-sm text-muted-foreground">Choose a section above to load assignments.</p>
            ) : isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !assignments?.length ? (
              <p className="text-sm text-muted-foreground">No assignments for this section.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {assignments.map((a) => (
                  <div key={a.id} className="rounded-xl border bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium min-w-0 truncate">{a.title}</p>
                      <StatusPill status={a.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.subjectName}{a.dueDate ? ' · due ' + new Date(a.dueDate).toLocaleString('en-IN') : ''} · {a._count?.submissions ?? 0} submissions</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setViewing(a.id)}>View submissions</Button>
                      {a.status === 'draft' && <Button size="sm" variant="outline" className="rounded-full" onClick={() => publish.mutate(a.id, { onSuccess: () => toast.success('Published') })}><Send className="mr-1 h-3 w-3" /> Publish</Button>}
                      {a.status === 'published' && <Button size="sm" variant="outline" className="rounded-full" onClick={() => closeIt.mutate(a.id, { onSuccess: () => toast.success('Closed') })}><Lock className="mr-1 h-3 w-3" /> Close</Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><CheckSquare className="h-4 w-4" /> Submissions {viewing ? '' : '(select an assignment)'}</h3>
            {!viewing ? (
              <p className="text-sm text-muted-foreground">Tap “View submissions” on an assignment.</p>
            ) : !submissions?.length ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {submissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{s.studentId.slice(0, 8)}…</p>
                      <p className="text-xs text-muted-foreground truncate">{new Date(s.submittedAt).toLocaleString('en-IN')}{s.marksObtained != null ? ' · ' + s.marksObtained + ' marks' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusPill status={s.status} />
                      {s.status !== 'graded' && <Button size="sm" variant="outline" className="rounded-full" onClick={() => gradeSubmission(s.id)}>Grade</Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
