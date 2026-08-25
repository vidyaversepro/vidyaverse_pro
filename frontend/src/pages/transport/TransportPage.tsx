import { useState } from 'react';
import { Bus, Plus, Play, CheckCircle2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { NeutralPill, Pill, TONE } from '@/components/shared/Pill';
import {
  useTransportRoutes,
  useActiveTrips,
  useCreateRoute,
  useStartTrip,
  useCompleteTrip,
} from '@/lib/queries/transport/transport-queries';

export default function TransportPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', vehicleNumber: '', driverName: '', driverPhone: '', feeAmount: '' });

  const { data: routes, isLoading } = useTransportRoutes();
  const { data: trips } = useActiveTrips();
  const createRoute = useCreateRoute();
  const startTrip = useStartTrip();
  const completeTrip = useCompleteTrip();

  const submit = () => {
    if (!form.name) {
      toast.error('Route name is required');
      return;
    }
    createRoute.mutate(
      { ...form, feeAmount: form.feeAmount ? Number(form.feeAmount) : undefined },
      {
        onSuccess: () => {
          toast.success('Route created');
          setDialogOpen(false);
          setForm({ name: '', vehicleNumber: '', driverName: '', driverPhone: '', feeAmount: '' });
        },
        onError: () => toast.error('Failed to create route'),
      },
    );
  };

  const start = (routeId: string) => {
    startTrip.mutate(
      { routeId, direction: 'pickup' },
      {
        onSuccess: (res) => toast.success('Trip started — ' + (res?.data?.data?.notified ?? 0) + ' parents alerted'),
        onError: () => toast.error('Failed to start trip'),
      },
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Transport' }]}
        title="Transport"
        description="Routes, vehicles & live trips — parents on a route get WhatsApp alerts on departure"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> New Route</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Transport Route</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Route name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Vehicle number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
                <Input placeholder="Driver name" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} />
                <Input placeholder="Driver phone" value={form.driverPhone} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} />
                <Input placeholder="Transport fee (₹)" type="number" value={form.feeAmount} onChange={(e) => setForm({ ...form, feeAmount: e.target.value })} />
                <Button className="w-full" onClick={submit} disabled={createRoute.isPending}>Create Route</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Active trips */}
      {trips && trips.length > 0 && (
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: TONE.green }} /> Live Trips
            </h2>
            <div className="flex flex-col gap-2.5">
              {trips.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border bg-card p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.route?.name ?? 'Route'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.route?.vehicleNumber ?? '—'} ·{' '}
                      {t.lastLatitude != null ? '📍 ' + t.lastLatitude.toFixed(4) + ', ' + t.lastLongitude?.toFixed(4) : 'awaiting GPS'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full shrink-0" onClick={() => completeTrip.mutate(t.id, { onSuccess: () => toast.success('Trip completed') })}>
                    <CheckCircle2 className="w-4 h-4 mr-1" style={{ color: TONE.green }} /> Complete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !routes || routes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${TONE.saffron}1f` }}>
              <Bus className="w-8 h-8" style={{ color: TONE.saffron }} />
            </div>
            <h3 className="text-lg font-medium">No Routes Yet</h3>
            <p className="text-muted-foreground mt-1">Create a transport route to get started.</p>
          </div>
        ) : (
          routes.map((r) => (
            <Card key={r.id} className="rounded-2xl">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{r.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{r.code}</p>
                  </div>
                  <Pill label={(r._count?.assignments ?? 0) + ' students'} tone={TONE.indigo} />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="truncate">🚌 {r.vehicleNumber || '—'} · {r.driverName || 'No driver'}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <NeutralPill label={r.stops.length + ' stops'} />
                    {r.feeAmount ? <NeutralPill label={'₹' + r.feeAmount + '/mo'} /> : null}
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => start(r.id)} disabled={startTrip.isPending}>
                  <Play className="w-4 h-4 mr-1" /> Start Trip
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
