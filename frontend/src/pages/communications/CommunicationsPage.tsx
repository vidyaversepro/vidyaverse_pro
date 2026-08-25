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
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { NeutralPill, Pill, StatusPill, TONE } from '@/components/shared/Pill';
import {
  useFeeSummary,
  usePaymentClaims,
  useMessageLog,
  useConversations,
  useReviewClaim,
} from '@/lib/queries/messaging/messaging-queries';

const inr = (v: number) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

/** Local tile — these KPI values carry their own semantic colour, which StatCard has no slot for. */
function Kpi({ label, value, icon: Icon, tone, loading }: { label: string; value: string; icon: typeof IndianRupee; tone: string; loading?: boolean }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg sm:text-xl font-bold mt-1 truncate" style={{ color: tone }}>{loading ? '…' : value}</p>
          </div>
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" style={{ color: tone }} />
        </div>
      </CardContent>
    </Card>
  );
}

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

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Communication' }, { label: 'Communications' }]}
        title="Communications"
        description="WhatsApp parent engagement — fees, payment claims & conversations"
        action={summary ? <Pill label={'Collection rate: ' + summary.collectionRate.toFixed(1) + '%'} tone={TONE.peacock} /> : undefined}
      />

      {/* Fee KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total Billed" value={summary ? inr(summary.totalBilled) : '—'} icon={ReceiptText} tone={TONE.indigo} loading={summaryLoading} />
        <Kpi label="Collected" value={summary ? inr(summary.totalCollected) : '—'} icon={TrendingUp} tone={TONE.green} loading={summaryLoading} />
        <Kpi label="Outstanding" value={summary ? inr(summary.totalOutstanding) : '—'} icon={IndianRupee} tone={TONE.temple} loading={summaryLoading} />
        <Kpi label="Pending Invoices" value={summary ? String(summary.pendingInvoices) : '—'} icon={AlertCircle} tone={TONE.red} loading={summaryLoading} />
      </div>

      {/* Pending payment claims */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ReceiptText className="w-5 h-5" /> Pending Payment Claims
          </h2>
          {claimsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !claims || claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment claims awaiting review.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border bg-card p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {claim.claimAmount ? inr(Number(claim.claimAmount)) : 'Amount not stated'} · {claim.mediaType}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Invoice {claim.invoiceId.slice(0, 8)} · {new Date(claim.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none rounded-full"
                      disabled={reviewClaim.isPending}
                      onClick={() => handleReview(claim.id, 'approved')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" style={{ color: TONE.green }} /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none rounded-full"
                      disabled={reviewClaim.isPending}
                      onClick={() => handleReview(claim.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-1" style={{ color: TONE.red }} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-column: recent messages + conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Recent Messages
            </h2>
            {!messages || messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {messages.slice(0, 8).map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-sm">
                    <span className="min-w-0 truncate">
                      {m.direction === 'inbound' ? '⬅ ' : '➡ '}
                      {m.templateCode ?? '(session message)'}
                    </span>
                    <StatusPill status={m.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h2 className="text-lg font-semibold mb-4">Active Conversations</h2>
            {!conversations || conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {conversations.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-sm">
                    <span className="min-w-0 truncate">
                      {c.lastIntent ?? 'conversation'} · {c.messageCount} msgs
                    </span>
                    <NeutralPill label={c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString('en-IN') : '—'} />
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
