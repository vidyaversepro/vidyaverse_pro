import { useState } from 'react';
import { Building2, Plus, BedDouble, DoorOpen, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { NeutralPill, StatusPill } from '@/components/shared/Pill';
import {
  useHostelBlocks,
  useOccupancy,
  useMessBills,
  useCreateBlock,
  usePayMessBill,
} from '@/lib/queries/hostel/hostel-queries';

export default function HostelPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'boys', wardenName: '', wardenPhone: '' });

  const { data: blocks, isLoading } = useHostelBlocks();
  const { data: occ } = useOccupancy();
  const { data: bills } = useMessBills();
  const createBlock = useCreateBlock();
  const payBill = usePayMessBill();

  const submit = () => {
    if (!form.name) return toast.error('Block name is required');
    createBlock.mutate(form, {
      onSuccess: () => {
        toast.success('Block created');
        setDialogOpen(false);
        setForm({ name: '', type: 'boys', wardenName: '', wardenPhone: '' });
      },
      onError: () => toast.error('Failed to create block'),
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Operations' }, { label: 'Hostel & Mess' }]}
        title="Hostel & Mess"
        description="Blocks, room allotment, occupancy and mess billing"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Block</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Hostel Block</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Block name (e.g. Block A)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="mixed">Mixed</option>
                </select>
                <Input placeholder="Warden name" value={form.wardenName} onChange={(e) => setForm({ ...form, wardenName: e.target.value })} />
                <Input placeholder="Warden phone" value={form.wardenPhone} onChange={(e) => setForm({ ...form, wardenPhone: e.target.value })} />
                <Button className="w-full" onClick={submit} disabled={createBlock.isPending}>Create Block</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Blocks" value={blocks?.length ?? 0} icon={Building2} tone="teal" />
        <StatCard title="Total Rooms" value={occ?.totalRooms ?? 0} icon={DoorOpen} tone="gold" />
        <StatCard title="Occupied Beds" value={(occ?.occupiedBeds ?? 0) + '/' + (occ?.totalBeds ?? 0)} icon={BedDouble} tone="saffron" />
        <StatCard title="Vacant Beds" value={occ?.vacantBeds ?? 0} icon={BedDouble} tone="indigo" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 font-semibold">Blocks</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !blocks?.length ? (
              <p className="text-sm text-muted-foreground">No blocks yet. Add one to get started.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {blocks.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.wardenName ? 'Warden: ' + b.wardenName : 'No warden'} · {b._count?.rooms ?? 0} rooms</p>
                    </div>
                    <NeutralPill label={b.type} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 font-semibold">Mess Bills</h3>
            {!bills?.length ? (
              <p className="text-sm text-muted-foreground">No mess bills yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {bills.slice(0, 10).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="min-w-0">
                      <p className="flex items-center font-medium"><IndianRupee className="h-3.5 w-3.5" />{bill.amount}</p>
                      <p className="text-xs text-muted-foreground truncate">{bill.billMonth}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusPill status={bill.status} />
                      {bill.status !== 'paid' && (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => payBill.mutate(bill.id, { onSuccess: () => toast.success('Marked paid') })}>
                          Mark Paid
                        </Button>
                      )}
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
