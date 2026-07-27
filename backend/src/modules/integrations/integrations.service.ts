import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/** External-app connectors (loose coupling — Vidyaverse never modifies the other apps). */
export const INTEGRATION_KEYS = ['library', 'ai_tutor'] as const;
export type IntegrationKey = (typeof INTEGRATION_KEYS)[number];

export interface IntegrationConfig {
  baseUrl?: string | null;
  healthUrl?: string | null;
  tenantRef?: string | null;
}

export interface IntegrationHealth {
  configured: boolean;
  reachable: boolean;
  status?: number;
}

export const integrationsService = {
  isValidKey(key: string): key is IntegrationKey {
    return (INTEGRATION_KEYS as readonly string[]).includes(key);
  },

  async getConfig(institutionId: string, key: IntegrationKey): Promise<IntegrationConfig> {
    const inst = await prisma.institution.findUnique({ where: { id: institutionId }, select: { moduleConfig: true } });
    const mc = (inst?.moduleConfig as Record<string, unknown> | null) ?? {};
    return (mc[key] as IntegrationConfig) ?? {};
  },

  async setConfig(institutionId: string, key: IntegrationKey, cfg: IntegrationConfig): Promise<IntegrationConfig> {
    const inst = await prisma.institution.findUnique({ where: { id: institutionId }, select: { moduleConfig: true } });
    const mc = ((inst?.moduleConfig as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;
    const next: IntegrationConfig = {
      baseUrl: cfg.baseUrl?.trim() || null,
      healthUrl: cfg.healthUrl?.trim() || null,
      tenantRef: cfg.tenantRef?.trim() || null,
    };
    mc[key] = next;
    await prisma.institution.update({ where: { id: institutionId }, data: { moduleConfig: mc as Prisma.InputJsonValue } });
    logger.info('[integrations] config updated', { institutionId, key });
    return next;
  },

  /**
   * Server-side reachability check of the external app's (unauthenticated) health
   * endpoint. Server-to-server, so CORS does not apply. Never throws.
   */
  async checkHealth(institutionId: string, key: IntegrationKey): Promise<IntegrationHealth> {
    const cfg = await this.getConfig(institutionId, key);
    const url = cfg.healthUrl || cfg.baseUrl;
    if (!url) return { configured: false, reachable: false };
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000), redirect: 'manual' });
      return { configured: true, reachable: true, status: res.status };
    } catch (err) {
      logger.debug({ err, key }, '[integrations] health check failed');
      return { configured: true, reachable: false };
    }
  },
};
