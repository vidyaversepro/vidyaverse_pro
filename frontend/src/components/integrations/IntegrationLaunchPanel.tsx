import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, AlertTriangle, Link2Off } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { TONE } from '@/components/shared/Pill';
import { useIntegration, useSaveIntegration } from '@/lib/queries/integrations/integrations-queries';

interface Props {
  integrationKey: string;
  label: string;
  description: string;
}

export function IntegrationLaunchPanel({ integrationKey, label, description }: Props) {
  const { data, isLoading } = useIntegration(integrationKey);
  const save = useSaveIntegration(integrationKey);
  const [form, setForm] = useState({ baseUrl: '', healthUrl: '', tenantRef: '' });

  useEffect(() => {
    if (data?.config) setForm({ baseUrl: data.config.baseUrl ?? '', healthUrl: data.config.healthUrl ?? '', tenantRef: data.config.tenantRef ?? '' });
  }, [data]);

  const health = data?.health;
  const status = !health?.configured
    ? { text: 'Not configured', tone: 'hsl(var(--muted-foreground))', Icon: Link2Off }
    : health.reachable
      ? { text: 'Connected', tone: TONE.green, Icon: CheckCircle2 }
      : { text: 'Unreachable', tone: TONE.temple, Icon: AlertTriangle };

  const launchUrl = data?.config.baseUrl || '';

  const saveConfig = () => {
    if (!form.baseUrl) return toast.error('Base URL is required');
    save.mutate(form, { onSuccess: () => toast.success('Connection saved'), onError: () => toast.error('Failed to save') });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label }]} title={label} description={description} />

      {/* Status + launch */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <status.Icon className="w-8 h-8 shrink-0" style={{ color: status.tone }} />
            <div className="min-w-0">
              <p className="font-semibold">{isLoading ? 'Checking…' : status.text}</p>
              <p className="text-sm text-muted-foreground truncate">{launchUrl || 'No URL configured yet'}</p>
            </div>
          </div>
          <Button className="w-full sm:w-auto" disabled={!launchUrl} onClick={() => launchUrl && window.open(launchUrl, '_blank', 'noopener')}>
            <ExternalLink className="w-4 h-4 mr-2" /> Open {label}
          </Button>
        </CardContent>
      </Card>

      {/* Connection settings (admin) */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <h2 className="text-lg font-semibold">Connection settings</h2>
          <p className="text-sm text-muted-foreground">
            Vidyaverse links to this app — it does not modify it. Users sign in to {label} directly. The health URL is pinged
            server-side to show the connection status.
          </p>
          <Input placeholder="App URL (e.g. https://library.yourschool.in) *" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
          <Input placeholder="Health URL (optional, e.g. https://api.../health)" value={form.healthUrl} onChange={(e) => setForm({ ...form, healthUrl: e.target.value })} />
          <Input placeholder="Tenant reference in that app (optional)" value={form.tenantRef} onChange={(e) => setForm({ ...form, tenantRef: e.target.value })} />
          <Button className="w-full sm:w-auto" onClick={saveConfig} disabled={save.isPending}>Save Connection</Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Note: deep-link integration only — no data is pulled from {label} (it exposes no service API), so nothing in that app
        can be affected.
      </p>
    </div>
  );
}
