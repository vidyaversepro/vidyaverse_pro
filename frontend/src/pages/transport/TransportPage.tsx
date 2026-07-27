import { useState } from 'react';
import { Bus, Plus, Play, CheckCircle2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
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
        onSuccess: (res) => toast.success(`Trip started — ${res?.data?.data?.notified ?? 0} parents alerted`),
        onError: () => toast.error('Failed to start trip'),
      },
    );
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Transport' }]}
        title="Transport"
        description="Routes, vehicles & live trips — parents on a route get WhatsApp alerts on departure"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Route</Button>
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
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Live Trips
            </h2>
            <div className="space-y-2">
              {trips.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.route?.name ?? 'Route'}</p>
                    <p className="text-xs text-gray-400">
                      {t.route?.vehicleNumber ?? '—'} ·{' '}
                      {t.lastLatitude != null ? `📍 ${t.lastLatitude.toFixed(4)}, ${t.lastLongitude?.toFixed(4)}` : 'awaiting GPS'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => completeTrip.mutate(t.id, { onSuccess: () => toast.success('Trip completed') })}>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Complete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : !routes || routes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <Bus className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Routes Yet</h3>
            <p className="text-gray-500 mt-1">Create a transport route to get started.</p>
          </div>
        ) : (
          routes.map((r) => (
            <Card key={r.id} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{r.name}</h3>
                    <p className="text-xs text-gray-400">{r.code}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{r._count?.assignments ?? 0} students</Badge>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>🚌 {r.vehicleNumber || '—'} · {r.driverName || 'No driver'}</p>
                  <p>{r.stops.length} stops {r.feeAmount ? `· ₹${r.feeAmount}/mo` : ''}</p>
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
