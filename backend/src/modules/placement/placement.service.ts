import type { PlacementDriveStatus, PlacementApplicationStatus } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';

export const placementService = {
  async createDrive(institutionId: string, data: { companyName: string; role: string; packageLpa?: number | string; driveDate?: string; eligibilityCriteria?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.placementDrive.create({
      data: {
        institutionId,
        companyName: data.companyName,
        role: data.role,
        packageLpa: data.packageLpa != null ? String(data.packageLpa) : null,
        driveDate: data.driveDate ? new Date(data.driveDate) : null,
        eligibilityCriteria: data.eligibilityCriteria ?? null,
      },
    });
  },

  async listDrives(institutionId: string, status?: PlacementDriveStatus) {
    const db = getTenantPrisma(institutionId);
    return db.placementDrive.findMany({
      where: { ...(status ? { status } : {}) },
      orderBy: { driveDate: 'desc' },
      include: { _count: { select: { applications: true } } },
    });
  },

  async setDriveStatus(institutionId: string, id: string, status: PlacementDriveStatus) {
    const db = getTenantPrisma(institutionId);
    return db.placementDrive.update({ where: { id }, data: { status } });
  },

  async apply(institutionId: string, driveId: string, studentId: string) {
    const db = getTenantPrisma(institutionId);
    return db.placementApplication.upsert({
      where: { driveId_studentId: { driveId, studentId } },
      update: {},
      create: { institutionId, driveId, studentId, status: 'applied' },
    });
  },

  async listApplications(institutionId: string, driveId: string) {
    const db = getTenantPrisma(institutionId);
    return db.placementApplication.findMany({ where: { driveId }, orderBy: { appliedAt: 'asc' } });
  },

  async setApplicationStatus(institutionId: string, applicationId: string, status: PlacementApplicationStatus, notes?: string) {
    const db = getTenantPrisma(institutionId);
    return db.placementApplication.update({ where: { id: applicationId }, data: { status, ...(notes ? { notes } : {}) } });
  },

  async stats(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const [drives, applications, selected] = await Promise.all([
      db.placementDrive.count(),
      db.placementApplication.count(),
      db.placementApplication.count({ where: { status: 'selected' } }),
    ]);
    const topPackage = await db.placementDrive.aggregate({ _max: { packageLpa: true } });
    return { drives, applications, selected, highestPackageLpa: Number(topPackage._max.packageLpa ?? 0) };
  },
};
