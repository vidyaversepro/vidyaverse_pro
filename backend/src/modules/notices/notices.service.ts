import type { NoticeAudience, NoticeCategory, NoticeStatus, EventType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';

export const noticesService = {
  // ── Notices ──────────────────────────────────────────────────────────────────
  async createNotice(institutionId: string, data: { title: string; body: string; audience?: NoticeAudience; category?: NoticeCategory; isPinned?: boolean; expiresAt?: string; publish?: boolean }) {
    const db = getTenantPrisma(institutionId);
    return db.notice.create({
      data: {
        institutionId,
        title: data.title,
        body: data.body,
        audience: data.audience ?? 'all',
        category: data.category ?? 'circular',
        isPinned: data.isPinned ?? false,
        status: data.publish === false ? 'draft' : 'published',
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  },

  async listNotices(institutionId: string, filters: { audience?: NoticeAudience; status?: NoticeStatus; activeOnly?: boolean } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.notice.findMany({
      where: {
        ...(filters.audience ? { audience: filters.audience } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.activeOnly ? { status: 'published', OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] } : {}),
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 100,
    });
  },

  async setNoticeStatus(institutionId: string, id: string, status: NoticeStatus) {
    const db = getTenantPrisma(institutionId);
    return db.notice.update({ where: { id }, data: { status } });
  },

  async togglePin(institutionId: string, id: string, isPinned: boolean) {
    const db = getTenantPrisma(institutionId);
    return db.notice.update({ where: { id }, data: { isPinned } });
  },

  // ── Calendar events ──────────────────────────────────────────────────────────
  async createEvent(institutionId: string, data: { title: string; description?: string; eventType?: EventType; eventDate: string; endDate?: string; allDay?: boolean }) {
    const db = getTenantPrisma(institutionId);
    return db.calendarEvent.create({
      data: {
        institutionId,
        title: data.title,
        description: data.description ?? null,
        eventType: data.eventType ?? 'event',
        eventDate: new Date(data.eventDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        allDay: data.allDay ?? true,
      },
    });
  },

  async listEvents(institutionId: string, filters: { from?: string; to?: string } = {}) {
    const db = getTenantPrisma(institutionId);
    let dateFilter = {};
    if (filters.from || filters.to) {
      dateFilter = { eventDate: { ...(filters.from ? { gte: new Date(filters.from) } : {}), ...(filters.to ? { lte: new Date(filters.to) } : {}) } };
    }
    return db.calendarEvent.findMany({ where: dateFilter, orderBy: { eventDate: 'asc' }, take: 200 });
  },

  async upcomingEvents(institutionId: string, days = 30) {
    const db = getTenantPrisma(institutionId);
    const to = new Date();
    to.setDate(to.getDate() + days);
    return db.calendarEvent.findMany({ where: { eventDate: { gte: new Date(), lte: to } }, orderBy: { eventDate: 'asc' } });
  },
};
