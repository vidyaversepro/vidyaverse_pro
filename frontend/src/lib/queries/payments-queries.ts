import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CreateFeeStructureInput,
  CreateFeeInvoiceInput,
  InvoiceStatus,
} from "@vidyaverse/shared-validation";

// ---------------------------------------------------------------------------
// Response shapes
// Prisma Decimal fields serialize to strings over JSON — typed accordingly.
// ---------------------------------------------------------------------------

export interface FeeStructure {
  id: string;
  institutionId: string;
  academicYear: string;
  classId: string | null;
  name: string;
  category: string;
  amount: string;
  frequency: string;
  dueDayOfMonth: number | null;
  lateFeeAmount: string | null;
  lateFeeAfterDays: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeInvoice {
  id: string;
  institutionId: string;
  studentId: string;
  feeStructureId: string | null;
  invoiceNumber: string;
  amount: string;
  discount: string;
  lateFee: string;
  netAmount: string;
  dueDate: string;
  status: InvoiceStatus;
  paidAmount: string;
  paidAt: string | null;
  notes: string | null;
  paymentLinkUrl: string | null;
  gatewayOrderId: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
  };
}

export interface FeeSummary {
  totalBilled: number;
  totalCollected: number;
  outstanding: number;
  collectionRate: number;
}

// ---------------------------------------------------------------------------
// Fee Structures
// ---------------------------------------------------------------------------

export const useFeeStructures = (institutionId: string) =>
  useQuery({
    queryKey: ["fee-structures", institutionId],
    queryFn: async () => {
      const { data } = await api.get<{ data: FeeStructure[] }>(
        "/payments/structures"
      );
      return data.data;
    },
    enabled: !!institutionId,
  });

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateFeeStructureInput) => {
      const { data } = await api.post<{ data: FeeStructure }>(
        "/payments/structures",
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export const useInvoices = (
  institutionId: string,
  filters?: { status?: InvoiceStatus }
) =>
  useQuery({
    queryKey: ["fee-invoices", institutionId, filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: FeeInvoice[] }>(
        "/payments/invoices",
        { params: filters }
      );
      return data.data;
    },
    enabled: !!institutionId,
  });

export const useStudentInvoices = (institutionId: string, studentId: string) =>
  useQuery({
    queryKey: ["fee-invoices", institutionId, "student", studentId],
    queryFn: async () => {
      const { data } = await api.get<{ data: FeeInvoice[] }>(
        `/payments/student/${studentId}`
      );
      return data.data;
    },
    enabled: !!institutionId && !!studentId,
  });

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateFeeInvoiceInput) => {
      const { data } = await api.post<{ data: FeeInvoice }>(
        "/payments/invoices",
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["fee-summary"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export const useFeeSummary = (institutionId: string) =>
  useQuery({
    queryKey: ["fee-summary", institutionId],
    queryFn: async () => {
      const { data } = await api.get<{ data: FeeSummary }>("/payments/summary");
      return data.data;
    },
    enabled: !!institutionId,
  });

// ---------------------------------------------------------------------------
// Payment Link
// ---------------------------------------------------------------------------

export const useCreatePaymentLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data } = await api.post<{ data: { paymentLinkUrl: string } }>(
        `/payments/invoices/${invoiceId}/payment-link`
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-invoices"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Reminder
// ---------------------------------------------------------------------------

export const useSendFeeReminder = () =>
  useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data } = await api.post(`/payments/invoices/${invoiceId}/remind`);
      return data;
    },
  });
