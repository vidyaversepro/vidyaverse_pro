import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
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

const STATUS_BADGE: Record<
  InvoiceStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  unpaid:    { label: "Unpaid",    variant: "destructive" },
  partial:   { label: "Partial",   variant: "secondary"   },
  paid:      { label: "Paid",      variant: "default"     },
  waived:    { label: "Waived",    variant: "outline"     },
  cancelled: { label: "Cancelled", variant: "outline"     },
};

const STATUS_FILTERS = [
  "all", "unpaid", "partial", "paid", "waived", "cancelled",
] as const;

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fee Management</h1>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              Total Billed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary ? inr(summary.totalBilled) : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {summary ? inr(summary.totalCollected) : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {summary ? inr(summary.outstanding) : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {summary ? `${summary.collectionRate.toFixed(1)}%` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structures">
        <TabsList>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* ── Fee Structures ── */}
        <TabsContent value="structures" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddStructureOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Fee Structure
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
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
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{CATEGORY_LABELS[s.category] ?? s.category}</TableCell>
                      <TableCell>{inr(s.amount)}</TableCell>
                      <TableCell>{FREQUENCY_LABELS[s.frequency] ?? s.frequency}</TableCell>
                      <TableCell>{s.dueDayOfMonth ?? "—"}</TableCell>
                      <TableCell>
                        {s.lateFeeAmount
                          ? `${inr(s.lateFeeAmount)} after ${s.lateFeeAfterDays ?? 0}d`
                          : "—"}
                      </TableCell>
                      <TableCell>{s.academicYear}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? "default" : "outline"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Invoices ── */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "default" : "outline"}
                  onClick={() => setStatusFilter(s)}
                  className="capitalize"
                >
                  {s === "all" ? "All" : STATUS_BADGE[s as InvoiceStatus]?.label ?? s}
                </Button>
              ))}
            </div>
            <Button onClick={() => setCreateInvoiceOpen(true)}>
              <Receipt className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv: FeeInvoice) => {
                    const meta = STATUS_BADGE[inv.status as keyof typeof STATUS_BADGE];
                    const actionable =
                      inv.status === "unpaid" || inv.status === "partial";
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {inv.student?.name ?? inv.studentId.slice(0, 8) + "…"}
                          </span>
                          {inv.student?.admissionNumber && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({inv.student.admissionNumber})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {inr(inv.netAmount)}
                        </TableCell>
                        <TableCell>
                          {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={meta?.variant ?? "outline"}>
                            {meta?.label ?? inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{inr(inv.paidAmount)}</TableCell>
                        <TableCell>
                          {actionable && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePaymentLink(inv)}
                                disabled={createPaymentLink.isPending}
                                title={
                                  inv.paymentLinkUrl
                                    ? "Copy payment link"
                                    : "Generate payment link"
                                }
                              >
                                {inv.paymentLinkUrl ? (
                                  <Copy className="h-3.5 w-3.5" />
                                ) : (
                                  <Link2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemind(inv.id)}
                                disabled={sendReminder.isPending}
                                title="Send WhatsApp reminder"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
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
