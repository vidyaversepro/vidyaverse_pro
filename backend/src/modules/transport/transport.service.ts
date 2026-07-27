import type { TransportAssignmentType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';
import { messagingService } from '../messaging/messaging.service.js';

export interface CreateRouteInput {
  name: string;
  code?: string;
  description?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  capacity?: number;
  feeAmount?: number | string;
}

export const transportService = {
  async createRoute(institutionId: string, data: CreateRouteInput) {
    const db = getTenantPrisma(institutionId);
    return db.transportRoute.create({
      data: {
        institutionId,
        name: data.name,
        code: data.code ?? `RT-${Date.now()}`,
        description: data.description ?? null,
        vehicleNumber: data.vehicleNumber ?? null,
        driverName: data.driverName ?? null,
        driverPhone: data.driverPhone ?? null,
        capacity: data.capacity ?? null,
        feeAmount: data.feeAmount != null ? String(data.feeAmount) : null,
      },
    });
  },

  async listRoutes(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.transportRoute.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { stops: { orderBy: { sequence: 'asc' } }, _count: { select: { assignments: true } } },
    });
  },

  async updateRoute(institutionId: string, id: string, data: Partial<CreateRouteInput> & { isActive?: boolean }) {
    const db = getTenantPrisma(institutionId);
    return db.transportRoute.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.vehicleNumber !== undefined ? { vehicleNumber: data.vehicleNumber } : {}),
        ...(data.driverName !== undefined ? { driverName: data.driverName } : {}),
        ...(data.driverPhone !== undefined ? { driverPhone: data.driverPhone } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.feeAmount !== undefined ? { feeAmount: data.feeAmount != null ? String(data.feeAmount) : null } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  },

  async addStop(institutionId: string, routeId: string, data: { name: string; sequence?: number; pickupTime?: string; dropTime?: string; latitude?: number; longitude?: number }) {
    const db = getTenantPrisma(institutionId);
    return db.transportStop.create({
      data: {
        institutionId,
        routeId,
        name: data.name,
        sequence: data.sequence ?? 0,
        pickupTime: data.pickupTime ?? null,
        dropTime: data.dropTime ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      },
    });
  },

  async assignStudent(institutionId: string, data: { studentId: string; routeId: string; stopId?: string; type?: TransportAssignmentType }) {
    const db = getTenantPrisma(institutionId);
    return db.studentTransport.create({
      data: {
        institutionId,
        studentId: data.studentId,
        routeId: data.routeId,
        stopId: data.stopId ?? null,
        type: data.type ?? 'both',
      },
    });
  },

  async listAssignments(institutionId: string, filters: { routeId?: string; studentId?: string } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.studentTransport.findMany({
      where: {
        isActive: true,
        ...(filters.routeId ? { routeId: filters.routeId } : {}),
        ...(filters.studentId ? { studentId: filters.studentId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Notify guardians of students on a route — respects the notifyTransport edge flag. */
  async notifyRouteGuardians(institutionId: string, routeId: string, message: string): Promise<{ notified: number }> {
    if (!(await messagingService.isMessagingEnabled(institutionId))) return { notified: 0 };
    const db = getTenantPrisma(institutionId);

    const assignments = await db.studentTransport.findMany({ where: { routeId, isActive: true }, select: { studentId: true } });
    const studentIds = [...new Set(assignments.map((a) => a.studentId))];
    if (studentIds.length === 0) return { notified: 0 };

    const links = await db.guardianStudentLink.findMany({
      where: { studentId: { in: studentIds }, notifyTransport: true },
      select: { guardianId: true },
    });

    let notified = 0;
    const seen = new Set<string>();
    const stamp = Date.now();
    for (const link of links) {
      if (seen.has(link.guardianId)) continue;
      seen.add(link.guardianId);
      const g = await db.guardian.findFirst({ where: { id: link.guardianId }, select: { id: true, firstName: true } });
      if (!g) continue;
      await messagingService.enqueueMessage({
        institutionId,
        recipientType: 'guardian',
        recipientId: g.id,
        templateCode: 'transport_alert',
        variables: { guardian_name: g.firstName, message },
        category: 'utility',
        priority: 'high',
        idempotencyKey: `transport:${routeId}:${g.id}:${stamp}`,
      });
      notified += 1;
    }
    logger.info('[transport] route guardians notified', { routeId, notified });
    return { notified };
  },

  async startTrip(institutionId: string, data: { routeId: string; direction?: TransportAssignmentType; tripDate?: string }) {
    const db = getTenantPrisma(institutionId);
    const route = await db.transportRoute.findFirst({ where: { id: data.routeId }, select: { id: true, name: true } });
    if (!route) throw new NotFoundError('Route not found');

    const trip = await db.transportTrip.create({
      data: {
        institutionId,
        routeId: data.routeId,
        tripDate: data.tripDate ? new Date(data.tripDate) : new Date(),
        direction: data.direction ?? 'pickup',
        status: 'started',
        startedAt: new Date(),
      },
    });

    const notify = await this.notifyRouteGuardians(institutionId, data.routeId, `${route.name} रूट की बस रवाना हो गई है। 🚌`);
    return { trip, notified: notify.notified };
  },

  /** GPS position ingest (gated by transport_gps at the route layer). */
  async recordGpsPing(institutionId: string, tripId: string, data: { latitude: number; longitude: number }) {
    const db = getTenantPrisma(institutionId);
    return db.transportTrip.update({
      where: { id: tripId },
      data: { lastLatitude: data.latitude, lastLongitude: data.longitude, lastPingAt: new Date() },
    });
  },

  async completeTrip(institutionId: string, tripId: string) {
    const db = getTenantPrisma(institutionId);
    return db.transportTrip.update({
      where: { id: tripId },
      data: { status: 'completed', completedAt: new Date() },
    });
  },

  async getActiveTrips(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.transportTrip.findMany({
      where: { status: 'started' },
      orderBy: { startedAt: 'desc' },
      include: { route: { select: { name: true, code: true, vehicleNumber: true } } },
    });
  },
};
