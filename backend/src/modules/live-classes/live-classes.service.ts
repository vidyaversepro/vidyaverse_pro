import type { LiveClassPlatform, LiveClassStatus } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';

export const liveClassesService = {
  async schedule(institutionId: string, data: { sectionId: string; subjectName: string; title: string; platform?: LiveClassPlatform; joinUrl?: string; scheduledAt: string; durationMins?: number; hostId?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.liveClass.create({
      data: {
        institutionId,
        sectionId: data.sectionId,
        subjectName: data.subjectName,
        title: data.title,
        platform: data.platform ?? 'meet',
        joinUrl: data.joinUrl ?? null,
        scheduledAt: new Date(data.scheduledAt),
        durationMins: data.durationMins ?? 45,
        hostId: data.hostId ?? null,
      },
    });
  },

  async list(institutionId: string, filters: { sectionId?: string; status?: LiveClassStatus; upcoming?: boolean } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.liveClass.findMany({
      where: {
        ...(filters.sectionId ? { sectionId: filters.sectionId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.upcoming ? { scheduledAt: { gte: new Date() }, status: { in: ['scheduled', 'live'] } } : {}),
      },
      orderBy: { scheduledAt: filters.upcoming ? 'asc' : 'desc' },
      take: 200,
    });
  },

  async setStatus(institutionId: string, id: string, status: LiveClassStatus) {
    const db = getTenantPrisma(institutionId);
    return db.liveClass.update({ where: { id }, data: { status } });
  },

  async attachRecording(institutionId: string, id: string, recordingUrl: string) {
    const db = getTenantPrisma(institutionId);
    return db.liveClass.update({ where: { id }, data: { recordingUrl, status: 'ended' } });
  },
};
