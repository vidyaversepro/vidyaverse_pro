import { Prisma } from '@prisma/client';
import type { InstitutionType, SubscriptionTier } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { SUBSCRIPTION_LIMITS } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';
import { CORE_MODULE_KEYS, getTierModules, isApplicable } from '../../config/module-registry.js';

export interface FeatureOverrides {
  grants: string[];
  revokes: string[];
}

export type QuotaResource = 'whatsapp' | 'pdf' | 'email' | 'ai';

function parseOverrides(raw: unknown): FeatureOverrides {
  if (raw && typeof raw === 'object') {
    const o = raw as { grants?: unknown; revokes?: unknown };
    return {
      grants: Array.isArray(o.grants) ? (o.grants as string[]) : [],
      revokes: Array.isArray(o.revokes) ? (o.revokes as string[]) : [],
    };
  }
  return { grants: [], revokes: [] };
}

export const entitlementsService = {
  /** Pure resolution: (tier defaults ∪ grants) − revokes, filtered by institution type. */
  resolve(args: { tier: SubscriptionTier; institutionType: InstitutionType; overrides: FeatureOverrides }): string[] {
    const set = new Set<string>(getTierModules(args.tier));
    for (const g of args.overrides.grants) set.add(g);
    for (const r of args.overrides.revokes) set.delete(r);
    return [...set].filter((k) => isApplicable(k, args.institutionType));
  },

  /** Live entitlement check — always resolves from source of truth (tier + overrides + type). */
  async isModuleEnabled(institutionId: string, key: string): Promise<boolean> {
    if (CORE_MODULE_KEYS.includes(key)) return true;
    const inst = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { institutionType: true, subscriptionTier: true, featureOverrides: true },
    });
    if (!inst) return false;
    const enabled = this.resolve({
      tier: inst.subscriptionTier,
      institutionType: inst.institutionType,
      overrides: parseOverrides(inst.featureOverrides),
    });
    return enabled.includes(key);
  },

  /** Read-only quota check for a metered resource (limit < 0 means unlimited). */
  async checkQuota(institutionId: string, resource: QuotaResource, amount = 1): Promise<{ ok: boolean; used: number; limit: number }> {
    const inst = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: {
        subscriptionTier: true,
        monthlyWhatsappSent: true,
        monthlyPdfPages: true,
        monthlyEmailSent: true,
        monthlyAiUsage: true,
      },
    });
    if (!inst) return { ok: false, used: 0, limit: 0 };

    const used =
      resource === 'whatsapp' ? inst.monthlyWhatsappSent
      : resource === 'pdf' ? inst.monthlyPdfPages
      : resource === 'email' ? inst.monthlyEmailSent
      : inst.monthlyAiUsage;

    const limits = SUBSCRIPTION_LIMITS[inst.subscriptionTier] as unknown as Record<string, number>;
    const limit =
      resource === 'whatsapp' ? limits.whatsappPerMonth
      : resource === 'pdf' ? limits.pdfPagesPerMonth
      : resource === 'email' ? limits.emailNotifications
      : limits.aiEnhancementsPerMonth;

    if (limit < 0) return { ok: true, used, limit };
    return { ok: used + amount <= limit, used, limit };
  },

  /** Increment a tenant's monthly usage counter for a metered resource. */
  async incrementUsage(institutionId: string, resource: QuotaResource, amount = 1): Promise<void> {
    const data =
      resource === 'whatsapp' ? { monthlyWhatsappSent: { increment: amount } }
      : resource === 'pdf' ? { monthlyPdfPages: { increment: amount } }
      : resource === 'email' ? { monthlyEmailSent: { increment: amount } }
      : { monthlyAiUsage: { increment: amount } };
    await prisma.institution.update({ where: { id: institutionId }, data });
  },

  /** Full entitlement picture for the super-admin dashboard. */
  async getEntitlements(institutionId: string) {
    const inst = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: {
        id: true, name: true, code: true, institutionType: true,
        subscriptionTier: true, subscriptionStatus: true, trialEndsAt: true,
        featureOverrides: true, moduleConfig: true,
        monthlyAiUsage: true, monthlyPdfPages: true, monthlyEmailSent: true,
        monthlyWhatsappSent: true, storageUsedMb: true,
      },
    });
    if (!inst) throw new NotFoundError('Institution not found');

    const overrides = parseOverrides(inst.featureOverrides);
    const enabledModules = this.resolve({
      tier: inst.subscriptionTier,
      institutionType: inst.institutionType,
      overrides,
    });

    return {
      institutionId: inst.id,
      name: inst.name,
      code: inst.code,
      institutionType: inst.institutionType,
      tier: inst.subscriptionTier,
      subscriptionStatus: inst.subscriptionStatus,
      trialEndsAt: inst.trialEndsAt,
      coreModules: CORE_MODULE_KEYS,
      enabledModules,
      overrides,
      moduleConfig: (inst.moduleConfig as Record<string, unknown>) ?? {},
      usage: {
        ai: inst.monthlyAiUsage,
        pdf: inst.monthlyPdfPages,
        email: inst.monthlyEmailSent,
        whatsapp: inst.monthlyWhatsappSent,
        storageMb: Number(inst.storageUsedMb),
      },
      limits: SUBSCRIPTION_LIMITS[inst.subscriptionTier],
    };
  },

  /** Super-admin update: change tier and/or per-institution grants/revokes/config. */
  async setEntitlements(
    institutionId: string,
    actorUserId: string | undefined,
    input: { tier?: SubscriptionTier; grants?: string[]; revokes?: string[]; moduleConfig?: Record<string, unknown> },
  ) {
    const inst = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { institutionType: true, subscriptionTier: true, featureOverrides: true },
    });
    if (!inst) throw new NotFoundError('Institution not found');

    const tier = input.tier ?? inst.subscriptionTier;
    const current = parseOverrides(inst.featureOverrides);
    const overrides: FeatureOverrides = {
      grants: input.grants ?? current.grants,
      revokes: input.revokes ?? current.revokes,
    };

    const enabledModules = this.resolve({ tier, institutionType: inst.institutionType, overrides });

    await prisma.institution.update({
      where: { id: institutionId },
      data: {
        subscriptionTier: tier,
        featureOverrides: overrides as unknown as Prisma.InputJsonValue,
        // Denormalised cache of the resolved set for fast reads / UI.
        enabledServices: enabledModules as unknown as Prisma.InputJsonValue,
        ...(input.moduleConfig !== undefined
          ? { moduleConfig: input.moduleConfig as Prisma.InputJsonValue }
          : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'entitlements.update',
        userId: actorUserId ?? null,
        institutionId,
        entityType: 'institution',
        entityId: institutionId,
        changes: { tier, overrides } as unknown as Prisma.InputJsonValue,
      },
    });

    logger.info('[entitlements] updated', { institutionId, tier, grants: overrides.grants.length, revokes: overrides.revokes.length });
    return this.getEntitlements(institutionId);
  },
};
