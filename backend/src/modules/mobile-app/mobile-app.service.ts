import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Parent/Student mobile app configuration. Config-only (no DB tables) — the app
 * is a client of the existing APIs; this just stores per-institution app settings
 * in Institution.moduleConfig['mobile_app'] (same pattern as integrations).
 */
const KEY = 'mobile_app';

export interface MobileAppConfig {
  androidUrl?: string | null;
  iosUrl?: string | null;
  minSupportedVersion?: string | null;
  forceUpdate?: boolean;
  primaryColor?: string | null;
  enabledFeatures?: string[];
}

const DEFAULT_FEATURES = ['attendance', 'fees', 'notices', 'timetable', 'homework'];

export const mobileAppService = {
  async getConfig(institutionId: string): Promise<MobileAppConfig> {
    const inst = await prisma.institution.findUnique({ where: { id: institutionId }, select: { moduleConfig: true } });
    const mc = (inst?.moduleConfig as Record<string, unknown> | null) ?? {};
    const cfg = (mc[KEY] as MobileAppConfig) ?? {};
    return { enabledFeatures: DEFAULT_FEATURES, forceUpdate: false, ...cfg };
  },

  async setConfig(institutionId: string, cfg: MobileAppConfig): Promise<MobileAppConfig> {
    const inst = await prisma.institution.findUnique({ where: { id: institutionId }, select: { moduleConfig: true } });
    const mc = ((inst?.moduleConfig as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;
    const next: MobileAppConfig = {
      androidUrl: cfg.androidUrl?.trim() || null,
      iosUrl: cfg.iosUrl?.trim() || null,
      minSupportedVersion: cfg.minSupportedVersion?.trim() || null,
      forceUpdate: !!cfg.forceUpdate,
      primaryColor: cfg.primaryColor?.trim() || null,
      enabledFeatures: Array.isArray(cfg.enabledFeatures) ? cfg.enabledFeatures : DEFAULT_FEATURES,
    };
    mc[KEY] = next;
    await prisma.institution.update({ where: { id: institutionId }, data: { moduleConfig: mc as Prisma.InputJsonValue } });
    logger.info('[mobile-app] config updated', { institutionId });
    return next;
  },
};
