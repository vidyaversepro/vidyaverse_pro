import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ReceiptText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  useFeeSummary,
  usePaymentClaims,
  useMessageLog,
  useConversations,
  useReviewClaim,
} from '@/lib/queries/messaging/messaging-queries';

const inr = (v: number) => `₹${Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function CommunicationsPage() {
  const { toast } = useToast();
  const { data: summary, isLoading: summaryLoading } = useFeeSummary();
  const { data: claims, isLoading: claimsLoading } = usePaymentClaims('pending_review');
  const { data: messages } = useMessageLog();
  const { data: conversations } = useConversations();
  const reviewClaim = useReviewClaim();

  const handleReview = (id: string, decision: 'approved' | 'rejected') => {
    reviewClaim.mutate(
      { id, decision },
      {
        onSuccess: () => toast({ title: decision === 'approved' ? 'Claim approved' : 'Claim rejected' }),
        onError: () => toast({ title: 'Action failed', variant: 'destructive' }),
      },
    );
  };

  const stats = [
    { label: 'Total Billed', value: summary ? inr(summary.totalBilled) : '—', icon: ReceiptText, color: 'text-blue-600' },
    { label: 'Collected', value: summary ? inr(summary.totalCollected) : '—', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Outstanding', value: summary ? inr(summary.totalOutstanding) : '—', icon: IndianRupee, color: 'text-amber-600' },
    { label: 'Pending Invoices', value: summary ? String(summary.pendingInvoices) : '—', icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communications</h1>
          <p className="text-gray-500 dark:text-gray-400">
            WhatsApp parent engagement — fees, payment claims & conversations
          </p>
        </div>
        {summary && (
          <Badge variant="outline" className="text-sm">
            Collection rate: {summary.collectionRate.toFixed(1)}%
          </Badge>
        )}
      </div>

      {/* Fee KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {summaryLoading ? '…' : s.value}
                  </p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending payment claims */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ReceiptText className="w-5 h-5" /> Pending Payment Claims
          </h2>
          {claimsLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : !claims || claims.length === 0 ? (
            <p className="text-sm text-gray-500">No payment claims awaiting review. ✅</p>
          ) : (
            <div className="space-y-2">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-800 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {claim.claimAmount ? inr(Number(claim.claimAmount)) : 'Amount not stated'} · {claim.mediaType}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      Invoice {claim.invoiceId.slice(0, 8)} · {new Date(claim.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reviewClaim.isPending}
                      onClick={() => handleReview(claim.id, 'approved')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reviewClaim.isPending}
                      onClick={() => handleReview(claim.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-1 text-red-600" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-column: recent messages + conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Recent Messages
            </h2>
            {!messages || messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet.</p>
            ) : (
              <div className="space-y-2">
                {messages.slice(0, 8).map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {m.direction === 'inbound' ? '⬅ ' : '➡ '}
                      {m.templateCode ?? '(session message)'}
                    </span>
                    <Badge variant="outline" className="text-xs">{m.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Conversations</h2>
            {!conversations || conversations.length === 0 ? (
              <p className="text-sm text-gray-500">No conversations yet.</p>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {c.lastIntent ?? 'conversation'} · {c.messageCount} msgs
                    </span>
                    <span className="text-xs text-gray-400">
                      {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString('en-IN') : '—'}
                    </span>
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
