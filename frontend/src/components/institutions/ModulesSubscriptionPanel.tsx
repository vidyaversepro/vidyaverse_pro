import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useModuleCatalog,
  useInstitutionEntitlements,
  useUpdateEntitlements,
  type ModuleDef,
  type Entitlements,
} from '@/lib/queries/admin/entitlements-queries';

const TIER_RANK: Record<string, number> = { starter: 1, professional: 2, enterprise: 3, addon: 99 };

const CATEGORY_ORDER: Array<{ key: string; label: string }> = [
  { key: 'core', label: 'Core (always on)' },
  { key: 'academics', label: 'Academics' },
  { key: 'learning', label: 'Learning' },
  { key: 'admissions_finance', label: 'Admissions & Finance' },
  { key: 'operations', label: 'Operations & Facilities' },
  { key: 'documents', label: 'Documents & Identity' },
  { key: 'communication', label: 'Communication & Engagement' },
  { key: 'insights', label: 'Insights & Governance' },
];

function isTierDefault(mod: ModuleDef, tier: string): boolean {
  return !mod.addOn && !mod.core && TIER_RANK[mod.defaultTier] <= TIER_RANK[tier];
}

export default function ModulesSubscriptionPanel({ institutionId }: { institutionId: string }) {
  const { data: catalog, isLoading: loadingCatalog } = useModuleCatalog();
  const { data: ent, isLoading: loadingEnt } = useInstitutionEntitlements(institutionId);
  const update = useUpdateEntitlements(institutionId);

  const grouped = useMemo(() => {
    const map = new Map<string, ModuleDef[]>();
    for (const m of catalog ?? []) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return map;
  }, [catalog]);

  if (loadingCatalog || loadingEnt || !ent || !catalog) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const enabled = new Set(ent.enabledModules);

  const handleTierChange = (tier: string) => {
    update.mutate(
      { tier: tier as Entitlements['tier'] },
      { onSuccess: () => toast.success(`Subscription set to ${tier}`), onError: () => toast.error('Failed to change tier') },
    );
  };

  const handleToggle = (mod: ModuleDef, turnOn: boolean) => {
    const grants = new Set(ent.overrides.grants);
    const revokes = new Set(ent.overrides.revokes);
    const tierDefault = isTierDefault(mod, ent.tier);
    if (turnOn) {
      revokes.delete(mod.key);
      if (!tierDefault) grants.add(mod.key);
    } else {
      grants.delete(mod.key);
      if (tierDefault) revokes.add(mod.key);
    }
    update.mutate(
      { grants: [...grants], revokes: [...revokes] },
      { onSuccess: () => toast.success(`${mod.name} ${turnOn ? 'enabled' : 'disabled'}`), onError: () => toast.error('Update failed') },
    );
  };

  const usageRows: Array<{ label: string; used: number; limitKey: string }> = [
    { label: 'Students', used: 0, limitKey: 'maxStudents' },
    { label: 'WhatsApp / mo', used: ent.usage.whatsapp, limitKey: 'smsNotifications' },
    { label: 'PDF pages / mo', used: ent.usage.pdf, limitKey: 'pdfPagesPerMonth' },
    { label: 'Emails / mo', used: ent.usage.email, limitKey: 'emailNotifications' },
    { label: 'AI / mo', used: ent.usage.ai, limitKey: 'aiEnhancementsPerMonth' },
  ];

  return (
    <div className="space-y-6">
      {/* Tier + usage */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Subscription tier</p>
              <div className="flex items-center gap-3 mt-1">
                <Select value={ent.tier} onValueChange={handleTierChange} disabled={update.isPending}>
                  <SelectTrigger className="w-44 capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="capitalize">{ent.subscriptionStatus}</Badge>
                <Badge variant="secondary">{ent.institutionType.replace('_', ' ').toLowerCase()}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {usageRows.map((u) => {
                const limit = ent.limits?.[u.limitKey];
                const limitText = typeof limit === 'number' ? (limit < 0 ? '∞' : String(limit)) : '—';
                return (
                  <div key={u.label} className="text-center">
                    <p className="text-xs text-muted-foreground">{u.label}</p>
                    <p className="text-sm font-semibold text-foreground">{u.used} / {limitText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module toggles by category */}
      {CATEGORY_ORDER.map(({ key, label }) => {
        const mods = grouped.get(key);
        if (!mods || mods.length === 0) return null;
        return (
          <Card key={key} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm text-foreground mb-4">{label}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mods.map((mod) => {
                  const applicable = mod.appliesTo.includes(ent.institutionType);
                  const on = mod.core || enabled.has(mod.key);
                  const overridden = ent.overrides.grants.includes(mod.key) || ent.overrides.revokes.includes(mod.key);
                  return (
                    <div
                      key={mod.key}
                      className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${applicable ? 'border-border' : 'border-dashed border-border opacity-50'}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{mod.name}</span>
                          {mod.core && <Badge variant="secondary" className="text-[10px]">core</Badge>}
                          {mod.addOn && <Badge variant="outline" className="text-[10px]">add-on</Badge>}
                          {!mod.core && !mod.addOn && <Badge variant="outline" className="text-[10px] capitalize">{mod.defaultTier}</Badge>}
                          {overridden && <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">override</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{mod.description}</p>
                        {!applicable && <p className="text-[10px] text-muted-foreground mt-0.5">Not applicable to this institution type</p>}
                      </div>
                      <Switch
                        checked={on}
                        disabled={mod.core || !applicable || update.isPending}
                        onCheckedChange={(v) => handleToggle(mod, v)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
