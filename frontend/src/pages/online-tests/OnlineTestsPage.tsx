import { useState } from 'react';
import { FileQuestion, Plus, ClipboardCheck, Radio, Lock, CheckSquare, Users2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  useQuestionBank,
  useOnlineTests,
  useTestAttempts,
  useCreateQuestion,
  useCreateTest,
  useSetTestStatus,
} from '@/lib/queries/online-tests/online-tests-queries';

export default function OnlineTestsPage() {
  const [qOpen, setQOpen] = useState(false);
  const [tOpen, setTOpen] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [q, setQ] = useState({ subject: '', questionText: '', type: 'mcq', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: '1' });
  const [t, setT] = useState({ title: '', subject: '', durationMins: '30', selected: [] as string[] });

  const { data: questions } = useQuestionBank();
  const { data: tests, isLoading } = useOnlineTests();
  const { data: attempts } = useTestAttempts(viewing || undefined);
  const createQuestion = useCreateQuestion();
  const createTest = useCreateTest();
  const setStatus = useSetTestStatus();

  const submitQuestion = () => {
    if (!q.subject || !q.questionText) return toast.error('Subject and question text required');
    const body: Record<string, unknown> = { subject: q.subject, questionText: q.questionText, type: q.type, marks: Number(q.marks) || 1 };
    if (q.type === 'mcq') {
      body.options = [
        { key: 'A', text: q.optionA }, { key: 'B', text: q.optionB },
        ...(q.optionC ? [{ key: 'C', text: q.optionC }] : []), ...(q.optionD ? [{ key: 'D', text: q.optionD }] : []),
      ];
      body.correctOption = q.correctOption;
    } else if (q.type === 'true_false') {
      body.correctOption = q.correctOption === 'A' ? 'true' : q.correctOption;
    }
    createQuestion.mutate(body as never, { onSuccess: () => { toast.success('Question added'); setQOpen(false); setQ({ subject: '', questionText: '', type: 'mcq', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: '1' }); } });
  };

  const toggleQ = (id: string) => setT((s) => ({ ...s, selected: s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id] }));

  const submitTest = () => {
    if (!t.title || t.selected.length === 0) return toast.error('Title and at least one question required');
    createTest.mutate(
      { title: t.title, subject: t.subject || undefined, questionIds: t.selected, durationMins: Number(t.durationMins) || 30 },
      { onSuccess: () => { toast.success('Test created'); setTOpen(false); setT({ title: '', subject: '', durationMins: '30', selected: [] }); } },
    );
  };

  return (
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Academics' }, { label: 'Online Tests' }]}
        title="Online Tests & Question Bank"
        description="Build a question bank and auto-graded online tests"
        action={
          <div className="flex gap-2">
            <Dialog open={qOpen} onOpenChange={setQOpen}>
              <DialogTrigger asChild><Button variant="outline"><FileQuestion className="mr-2 h-4 w-4" /> Question</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Question</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Subject" value={q.subject} onChange={(e) => setQ({ ...q, subject: e.target.value })} />
                    <select className="rounded-md border bg-background px-3 py-2 text-sm" value={q.type} onChange={(e) => setQ({ ...q, type: e.target.value })}>
                      <option value="mcq">MCQ</option><option value="true_false">True/False</option><option value="short_answer">Short Answer</option>
                    </select>
                  </div>
                  <textarea className="flex w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[60px]" placeholder="Question text" value={q.questionText} onChange={(e) => setQ({ ...q, questionText: e.target.value })} />
                  {q.type === 'mcq' && (
                    <div className="space-y-2">
                      <Input placeholder="Option A" value={q.optionA} onChange={(e) => setQ({ ...q, optionA: e.target.value })} />
                      <Input placeholder="Option B" value={q.optionB} onChange={(e) => setQ({ ...q, optionB: e.target.value })} />
                      <Input placeholder="Option C (optional)" value={q.optionC} onChange={(e) => setQ({ ...q, optionC: e.target.value })} />
                      <Input placeholder="Option D (optional)" value={q.optionD} onChange={(e) => setQ({ ...q, optionD: e.target.value })} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {q.type !== 'short_answer' && (
                      <select className="rounded-md border bg-background px-3 py-2 text-sm" value={q.correctOption} onChange={(e) => setQ({ ...q, correctOption: e.target.value })}>
                        {q.type === 'mcq' ? <>
                          <option value="A">Correct: A</option><option value="B">Correct: B</option><option value="C">Correct: C</option><option value="D">Correct: D</option>
                        </> : <>
                          <option value="true">Correct: True</option><option value="false">Correct: False</option>
                        </>}
                      </select>
                    )}
                    <Input placeholder="Marks" type="number" value={q.marks} onChange={(e) => setQ({ ...q, marks: e.target.value })} />
                  </div>
                  <Button className="w-full" onClick={submitQuestion}>Add to bank</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={tOpen} onOpenChange={setTOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Test</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Online Test</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Title" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} />
                    <Input placeholder="Duration (min)" type="number" value={t.durationMins} onChange={(e) => setT({ ...t, durationMins: e.target.value })} />
                  </div>
                  <Input placeholder="Subject (optional)" value={t.subject} onChange={(e) => setT({ ...t, subject: e.target.value })} />
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Pick questions ({t.selected.length} selected · {questions?.filter((x) => t.selected.includes(x.id)).reduce((s, x) => s + x.marks, 0) ?? 0} marks)</p>
                    <div className="max-h-48 space-y-1 overflow-auto rounded-md border p-2">
                      {!questions?.length ? <p className="p-2 text-sm text-muted-foreground">Add questions first.</p> : questions.map((qq) => (
                        <label key={qq.id} className="flex items-start gap-2 rounded p-1 text-sm hover:bg-accent">
                          <input type="checkbox" className="mt-1" checked={t.selected.includes(qq.id)} onChange={() => toggleQ(qq.id)} />
                          <span><Badge variant="outline" className="mr-1 text-[10px]">{qq.type}</Badge>{qq.questionText.slice(0, 60)} <span className="text-muted-foreground">({qq.marks}m)</span></span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={submitTest}>Create test</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><FileQuestion className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{questions?.length ?? 0}</p><p className="text-xs text-muted-foreground">Questions in bank</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><ClipboardCheck className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{tests?.length ?? 0}</p><p className="text-xs text-muted-foreground">Tests</p></div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><ClipboardCheck className="h-4 w-4" /> Tests</h3>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !tests?.length ? <p className="text-sm text-muted-foreground">No tests yet.</p> : (
              <div className="space-y-2">
                {tests.map((test) => (
                  <div key={test.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{test.title}</p>
                      <Badge variant={test.status === 'published' ? 'default' : test.status === 'closed' ? 'secondary' : 'outline'}>{test.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{test.questionIds.length} questions · {test.totalMarks} marks · {test.durationMins} min · {test._count?.attempts ?? 0} attempts</p>
                    <div className="mt-2 flex gap-1.5">
                      {test.status === 'draft' && <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: test.id, status: 'published' }, { onSuccess: () => toast.success('Published') })}><Radio className="mr-1 h-3.5 w-3.5" /> Publish</Button>}
                      {test.status === 'published' && <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: test.id, status: 'closed' }, { onSuccess: () => toast.success('Closed') })}><Lock className="mr-1 h-3.5 w-3.5" /> Close</Button>}
                      <Button size="sm" variant="ghost" onClick={() => setViewing(test.id)}><Users2 className="mr-1 h-3.5 w-3.5" /> Results</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><CheckSquare className="h-4 w-4" /> Results {viewing ? '' : '(select a test)'}</h3>
            {!viewing ? <p className="text-sm text-muted-foreground">Click "Results" on a test.</p> : !attempts?.length ? <p className="text-sm text-muted-foreground">No attempts yet.</p> : (
              <div className="space-y-2">
                {attempts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span className="font-mono text-xs">{a.studentId.slice(0, 8)}…</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.status === 'graded' ? 'default' : 'secondary'}>{a.status}</Badge>
                      <span className="font-medium">{a.score ?? '—'}/{a.maxScore}</span>
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
