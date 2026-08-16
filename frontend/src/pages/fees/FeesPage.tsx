import { useState, type ComponentType } from "react";
import { usePageInstitution } from "@/hooks/usePageInstitution";
import {
  useFeeStructures,
  useInvoices,
  useFeeSummary,
  useCreateFeeStructure,
  useCreateInvoice,
  useCreatePaymentLink,
  useSendFeeReminder,
  type FeeStructure,
  type FeeInvoice,
} from "@/lib/queries/payments-queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentPicker } from '@/components/shared/StudentPicker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  PlusCircle,
  IndianRupee,
  Send,
  Link2,
  TrendingUp,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Copy,
} from "lucide-react";
import type {
  CreateFeeStructureInput,
  CreateFeeInvoiceInput,
  InvoiceStatus,
} from "@vidyaverse/shared-validation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const inr = (val: string | number) =>
  `₹${parseFloat(String(val)).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const CATEGORY_LABELS: Record<string, string> = {
  tuition: "Tuition",
  transport: "Transport",
  exam: "Exam",
  misc: "Miscellaneous",
  lab: "Lab",
  library: "Library",
};

const FREQUENCY_LABELS: Record<string, string> = {
  one_time: "One-time",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const TONE = {
  green: '#15803d',
  temple: '#B8860B',
  red: '#C0392B',
  peacock: '#006A6E',
  indigo: '#1A237E',
  lotus: '#AD1457',
};

const STATUS_TONE: Record<InvoiceStatus, string> = {
  unpaid: TONE.red,
  partial: TONE.temple,
  paid: TONE.green,
  waived: TONE.indigo,
  cancelled: TONE.lotus,
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
  waived: "Waived",
  cancelled: "Cancelled",
};

const STATUS_FILTERS = [
  "all", "unpaid", "partial", "paid", "waived", "cancelled",
] as const;

function Pill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ color: tone, background: `${tone}1f` }}
    >
      {label}
    </span>
  );
}

function NeutralPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border whitespace-nowrap">
      {label}
    </span>
  );
}

function StatTile({ label, value, icon: Icon, tone, valueColor }: { label: string; value: string; icon: ComponentType<{ className?: string }>; tone: string; valueColor?: string }) {
  return (
    <div className="bg-card border rounded-2xl p-[15px] flex items-center gap-[13px]">
      <span className="w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${tone}1f`, color: tone }}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[21px] leading-none" style={{ fontFamily: 'var(--font-display)', color: valueColor }}>{value}</div>
        <div className="text-xs text-muted-foreground font-semibold mt-1">{label}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Fee Structure Dialog
// ---------------------------------------------------------------------------

const EMPTY_STRUCTURE: CreateFeeStructureInput = {
  name: "",
  category: "tuition",
  amount: 0,
  frequency: "monthly",
  academicYear: "",
  isActive: true,
};

function AddFeeStructureDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateFeeStructureInput>(EMPTY_STRUCTURE);
  const mutation = useCreateFeeStructure();

  const set = <K extends keyof CreateFeeStructureInput>(
    key: K,
    value: CreateFeeStructureInput[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const canSubmit =
    !!form.name.trim() && form.amount > 0 && !!form.academicYear.trim();

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync(form);
      toast.success("Fee structure created");
      setForm(EMPTY_STRUCTURE);
      onClose();
    } catch {
      toast.error("Failed to create fee structure");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Fee Structure</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2 space-y-1">
            <Label>Name *</Label>
            <Input
              placeholder="e.g. Tuition Fee Q1"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) =>
                set("category", v as CreateFeeStructureInput["category"])
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Frequency *</Label>
            <Select
              value={form.frequency}
              onValueChange={(v) =>
                set("frequency", v as CreateFeeStructureInput["frequency"])
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Amount (₹) *</Label>
            <Input
              type="number"
              min={0}
              placeholder="5000"
              value={form.amount || ""}
              onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Academic Year *</Label>
            <Input
              placeholder="2024-25"
              value={form.academicYear}
              onChange={(e) => set("academicYear", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Due Day of Month</Label>
            <Input
              type="number"
              min={1}
              max={31}
              placeholder="10"
              value={form.dueDayOfMonth ?? ""}
              onChange={(e) =>
                set(
                  "dueDayOfMonth",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Late Fee (₹)</Label>
            <Input
              type="number"
              min={0}
              placeholder="200"
              value={form.lateFeeAmount ?? ""}
              onChange={(e) =>
                set(
                  "lateFeeAmount",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Late After (days)</Label>
            <Input
              type="number"
              min={0}
              placeholder="5"
              value={form.lateFeeAfterDays ?? ""}
              onChange={(e) =>
                set(
                  "lateFeeAfterDays",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create Structure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Create Invoice Dialog
// ---------------------------------------------------------------------------

const EMPTY_INVOICE: CreateFeeInvoiceInput = {
  studentId: "",
  amount: 0,
  discount: 0,
  lateFee: 0,
  dueDate: new Date().toISOString().slice(0, 10),
};

function CreateInvoiceDialog({
  open,
  onClose,
  structures,
}: {
  open: boolean;
  onClose: () => void;
  structures: FeeStructure[];
}) {
  const [form, setForm] = useState<CreateFeeInvoiceInput>(EMPTY_INVOICE);
  const mutation = useCreateInvoice();

  const set = <K extends keyof CreateFeeInvoiceInput>(
    key: K,
    value: CreateFeeInvoiceInput[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleStructureSelect = (structureId: string) => {
    const s = structures.find((st) => st.id === structureId);
    if (s) {
      setForm((prev) => ({
        ...prev,
        feeStructureId: structureId,
        amount: parseFloat(s.amount),
      }));
    }
  };

  const netAmount = Math.max(
    0,
    (form.amount ?? 0) - (form.discount ?? 0) + (form.lateFee ?? 0)
  );

  const canSubmit = !!form.studentId.trim() && form.amount > 0 && !!form.dueDate;

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync(form);
      toast.success("Invoice created");
      setForm(EMPTY_INVOICE);
      onClose();
    } catch {
      toast.error("Failed to create invoice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2 space-y-1">
            <Label>Student *</Label>
            <StudentPicker
              value={form.studentId}
              onChange={(id) => set("studentId", id)}
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Fee Structure (optional — auto-fills amount)</Label>
            <Select onValueChange={handleStructureSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select fee structure" />
              </SelectTrigger>
              <SelectContent>
                {structures.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {inr(s.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Amount (₹) *</Label>
            <Input
              type="number"
              min={0}
              value={form.amount || ""}
              onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Discount (₹)</Label>
            <Input
              type="number"
              min={0}
              value={form.discount ?? 0}
              onChange={(e) => set("discount", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Late Fee (₹)</Label>
            <Input
              type="number"
              min={0}
              value={form.lateFee ?? 0}
              onChange={(e) => set("lateFee", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Due Date *</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              placeholder="Optional"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <div className="col-span-2 rounded-md bg-muted px-3 py-2 text-sm">
            Net Amount:{" "}
            <span className="font-semibold">{inr(netAmount)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FeesPage() {
  const institutionId = usePageInstitution() ?? '';

  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [addStructureOpen, setAddStructureOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  const summaryQuery   = useFeeSummary(institutionId);
  const structuresQuery = useFeeStructures(institutionId);
  const invoicesQuery  = useInvoices(
    institutionId,
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const createPaymentLink = useCreatePaymentLink();
  const sendReminder      = useSendFeeReminder();

  const handlePaymentLink = async (inv: FeeInvoice) => {
    if (inv.paymentLinkUrl) {
      await navigator.clipboard.writeText(inv.paymentLinkUrl);
      toast.success("Payment link copied");
      return;
    }
    try {
      const result = await createPaymentLink.mutateAsync(inv.id);
      await navigator.clipboard.writeText(result.paymentLinkUrl);
      toast.success("Payment link generated and copied");
    } catch {
      toast.error("Failed to generate payment link");
    }
  };

  const handleRemind = async (invoiceId: string) => {
    try {
      await sendReminder.mutateAsync(invoiceId);
      toast.success("WhatsApp reminder sent");
    } catch {
      toast.error("Failed to send reminder");
    }
  };

  const summary    = summaryQuery.data;
  const structures = structuresQuery.data ?? [];
  const invoices   = invoicesQuery.data ?? [];

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <PageHeader
        breadcrumb={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Fees' },
        ]}
        title="Fee Management"
        description="Structures, invoices and collections"
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total billed" value={summary ? inr(summary.totalBilled) : "—"} icon={IndianRupee} tone={TONE.peacock} />
        <StatTile label="Collected" value={summary ? inr(summary.totalCollected) : "—"} icon={CheckCircle2} tone={TONE.green} valueColor={TONE.green} />
        <StatTile label="Outstanding" value={summary ? inr(summary.outstanding) : "—"} icon={AlertCircle} tone={TONE.red} valueColor={TONE.red} />
        <StatTile label="Collection rate" value={summary ? `${summary.collectionRate.toFixed(1)}%` : "—"} icon={TrendingUp} tone={TONE.indigo} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structures">
        <TabsList>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* ── Fee Structures ── */}
        <TabsContent value="structures" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddStructureOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Fee Structure
            </Button>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block rounded-2xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Due Day</TableHead>
                  <TableHead>Late Fee</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structuresQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : structures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No fee structures yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  structures.map((s: FeeStructure) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-bold">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{CATEGORY_LABELS[s.category] ?? s.category}</TableCell>
                      <TableCell className="text-right font-semibold">{inr(s.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">{FREQUENCY_LABELS[s.frequency] ?? s.frequency}</TableCell>
                      <TableCell className="text-muted-foreground">{s.dueDayOfMonth ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.lateFeeAmount
                          ? `${inr(s.lateFeeAmount)} after ${s.lateFeeAfterDays ?? 0}d`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.academicYear}</TableCell>
                      <TableCell>
                        {s.isActive ? <Pill label="Active" tone={TONE.green} /> : <NeutralPill label="Inactive" />}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="lg:hidden flex flex-col gap-2.5">
            {structuresQuery.isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
            ) : structures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No fee structures yet.</div>
            ) : (
              structures.map((s: FeeStructure) => (
                <div key={s.id} className="bg-card border rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[14.5px]">{s.name}</span>
                    {s.isActive ? <Pill label="Active" tone={TONE.green} /> : <NeutralPill label="Inactive" />}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[12.5px] text-muted-foreground font-semibold">
                    {CATEGORY_LABELS[s.category] ?? s.category} · {FREQUENCY_LABELS[s.frequency] ?? s.frequency}
                    <span className="ml-auto text-base text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{inr(s.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── Invoices ── */}
        <TabsContent value="invoices" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-[9px] border transition-colors"
                  style={statusFilter === s
                    ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderColor: 'transparent' }
                    : { background: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' }}
                >
                  {s === "all" ? "All" : STATUS_LABEL[s as InvoiceStatus]}
                </button>
              ))}
            </div>
            <Button onClick={() => setCreateInvoiceOpen(true)}>
              <Receipt className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>

          <div className="flex flex-col gap-2.5">
            {invoicesQuery.isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No invoices found.</div>
            ) : (
              invoices.map((inv: FeeInvoice) => {
                const tone = STATUS_TONE[inv.status as InvoiceStatus];
                const label = STATUS_LABEL[inv.status as InvoiceStatus] ?? inv.status;
                const actionable = inv.status === "unpaid" || inv.status === "partial";
                return (
                  <div key={inv.id} className="bg-card border rounded-2xl p-3.5 flex items-center gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate">
                          {inv.student?.name ?? inv.studentId.slice(0, 8) + "…"}
                        </span>
                        <Pill label={label} tone={tone} />
                      </div>
                      <div className="font-mono text-[11.5px] text-muted-foreground mt-0.5">
                        {inv.invoiceNumber} · due {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[17px]" style={{ fontFamily: 'var(--font-display)' }}>{inr(inv.netAmount)}</div>
                      <div className="text-[11px] text-muted-foreground">paid {inr(inv.paidAmount)}</div>
                    </div>
                    {actionable && (
                      <div className="flex gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 rounded-[10px]"
                          onClick={() => handlePaymentLink(inv)}
                          disabled={createPaymentLink.isPending}
                          title={inv.paymentLinkUrl ? "Copy payment link" : "Generate payment link"}
                        >
                          {inv.paymentLinkUrl ? <Copy className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 rounded-[10px]"
                          style={{ color: TONE.green }}
                          onClick={() => handleRemind(inv.id)}
                          disabled={sendReminder.isPending}
                          title="Send WhatsApp reminder"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddFeeStructureDialog
        open={addStructureOpen}
        onClose={() => setAddStructureOpen(false)}
      />
      <CreateInvoiceDialog
        open={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        structures={structures}
      />
    </div>
  );
}
