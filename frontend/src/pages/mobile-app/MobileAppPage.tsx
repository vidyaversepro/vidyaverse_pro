import { useEffect, useState } from 'react';
import { Smartphone, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  useMobileAppConfig,
  useSaveMobileAppConfig,
  type MobileAppConfig,
} from '@/lib/queries/mobile-app/mobile-app-queries';

const ALL_FEATURES = ['attendance', 'fees', 'notices', 'timetable', 'homework', 'results', 'transport'];

export default function MobileAppPage() {
  const { data } = useMobileAppConfig();
  const save = useSaveMobileAppConfig();
  const [cfg, setCfg] = useState<MobileAppConfig>({ enabledFeatures: [] });

  useEffect(() => { if (data) setCfg(data); }, [data]);

  const toggleFeature = (f: string) => {
    const set = new Set(cfg.enabledFeatures ?? []);
    set.has(f) ? set.delete(f) : set.add(f);
    setCfg({ ...cfg, enabledFeatures: [...set] });
  };

  const submit = () => save.mutate(cfg, { onSuccess: () => toast.success('Mobile app settings saved') });

  return (
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Communication' }, { label: 'Mobile App' }]}
        title="Parent / Student Mobile App"
        description="Configure the mobile app: store links, version policy and enabled features"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-4">
            <h3 className="flex items-center gap-2 font-semibold"><Smartphone className="h-4 w-4" /> Store & Version</h3>
            <div><label className="text-xs text-muted-foreground">Android Play Store URL</label><Input value={cfg.androidUrl ?? ''} onChange={(e) => setCfg({ ...cfg, androidUrl: e.target.value })} placeholder="https://play.google.com/…" /></div>
            <div><label className="text-xs text-muted-foreground">iOS App Store URL</label><Input value={cfg.iosUrl ?? ''} onChange={(e) => setCfg({ ...cfg, iosUrl: e.target.value })} placeholder="https://apps.apple.com/…" /></div>
            <div><label className="text-xs text-muted-foreground">Minimum supported version</label><Input value={cfg.minSupportedVersion ?? ''} onChange={(e) => setCfg({ ...cfg, minSupportedVersion: e.target.value })} placeholder="2.1.0" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!cfg.forceUpdate} onChange={(e) => setCfg({ ...cfg, forceUpdate: e.target.checked })} /> Force update below minimum version</label>
            <div><label className="text-xs text-muted-foreground">Primary color (hex)</label><Input value={cfg.primaryColor ?? ''} onChange={(e) => setCfg({ ...cfg, primaryColor: e.target.value })} placeholder="#E63946" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h3 className="font-semibold">Enabled Features</h3>
            <p className="text-xs text-muted-foreground">Modules visible in the parent/student app.</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_FEATURES.map((f) => (
                <label key={f} className="flex items-center gap-2 rounded-lg border p-2 text-sm capitalize">
                  <input type="checkbox" checked={(cfg.enabledFeatures ?? []).includes(f)} onChange={() => toggleFeature(f)} />
                  {f}
                </label>
              ))}
            </div>
            <Button className="w-full" onClick={submit} disabled={save.isPending}><Save className="mr-2 h-4 w-4" /> Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
