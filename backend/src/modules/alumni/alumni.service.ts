import { getTenantPrisma } from '../../lib/prisma-tenant.js';

export const alumniService = {
  async create(institutionId: string, data: { name: string; email?: string; phone?: string; graduationYear?: number; currentOrganization?: string; designation?: string; location?: string; linkedinUrl?: string; willingToMentor?: boolean }) {
    const db = getTenantPrisma(institutionId);
    return db.alumni.create({
      data: {
        institutionId,
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        graduationYear: data.graduationYear ?? null,
        currentOrganization: data.currentOrganization ?? null,
        designation: data.designation ?? null,
        location: data.location ?? null,
        linkedinUrl: data.linkedinUrl ?? null,
        willingToMentor: data.willingToMentor ?? false,
      },
    });
  },

  async list(institutionId: string, filters: { graduationYear?: number; mentorsOnly?: boolean } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.alumni.findMany({
      where: { ...(filters.graduationYear ? { graduationYear: filters.graduationYear } : {}), ...(filters.mentorsOnly ? { willingToMentor: true } : {}) },
      orderBy: [{ graduationYear: 'desc' }, { name: 'asc' }],
      take: 500,
    });
  },

  async update(institutionId: string, id: string, data: Record<string, unknown>) {
    const db = getTenantPrisma(institutionId);
    return db.alumni.update({ where: { id }, data });
  },

  async stats(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const [total, mentors, byYear] = await Promise.all([
      db.alumni.count(),
      db.alumni.count({ where: { willingToMentor: true } }),
      db.alumni.groupBy({ by: ['graduationYear'], _count: { _all: true }, orderBy: { graduationYear: 'desc' }, take: 10 }),
    ]);
    return { total, mentors, byYear: byYear.map((r) => ({ year: r.graduationYear, count: r._count._all })) };
  },

  // ── Alumni events ─────────────────────────────────────────────────────────────
  async createEvent(institutionId: string, data: { title: string; description?: string; eventDate: string; venue?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.alumniEvent.create({
      data: { institutionId, title: data.title, description: data.description ?? null, eventDate: new Date(data.eventDate), venue: data.venue ?? null },
    });
  },

  async listEvents(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.alumniEvent.findMany({ orderBy: { eventDate: 'desc' }, take: 100 });
  },

  async rsvp(institutionId: string, eventId: string) {
    const db = getTenantPrisma(institutionId);
    return db.alumniEvent.update({ where: { id: eventId }, data: { rsvpCount: { increment: 1 } } });
  },
};
