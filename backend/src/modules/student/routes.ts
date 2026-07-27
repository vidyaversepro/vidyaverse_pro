import { FastifyInstance } from 'fastify';
import { controller } from './controller.js';
import { linkStudentUserSchema } from '@vidyaverse/shared-validation';

export async function routes(app: FastifyInstance) {
    // PUBLIC ONBOARDING ROUTES
    const publicLimiter = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

    app.get('/onboard/:token', publicLimiter, controller.getByToken);

    app.patch('/onboard/:token/save-tab', {
        ...publicLimiter,
        bodyLimit: 10485760 // 10MB
    }, controller.saveTabByToken);

    app.post('/onboard/:token/photo', {
        ...publicLimiter,
        bodyLimit: 10485760 // 10MB
    }, controller.uploadPhotoByToken);

    // List students (admins and teachers)
    app.get('/', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.list);

    // Export students CSV
    app.get('/export', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.exportCsv);

    // ID Card / Product Approval Queue
    app.get('/approval-queue', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.getApprovalQueue);

    // Student counts by section (for onboarding UI)
    app.get('/counts-by-section', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.countsBySection);

    // Get admission slots by section
    app.get('/sections/:sectionId/slots', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.getAdmissionSlots);

    // Get student by ID
    app.get('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'], requireInstitution: false })],
    }, controller.getOne);

    // Bulk create students (school_admin and main_admin)
    app.post('/bulk', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'main_admin'] })],
    }, controller.createBulk);

    // Generate section placeholder forms (school_admin, main_admin)
    app.post('/sections/:sectionId/generate-forms', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'main_admin'] })],
    }, controller.generateForms);

    // CSV Bulk upload to fill placeholder forms
    app.post('/bulk-csv', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'main_admin'] })],
    }, controller.uploadCsvBulk);

    // ZIP Bulk photo upload
    app.post('/bulk-photo-zip', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'main_admin'] })],
    }, controller.uploadPhotoZipBulk);

    app.get('/import-job/:jobExecutionId', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'main_admin'] })],
    }, controller.getImportProgress);

    // Create student (school_admin only)
    app.post('/', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin'] })],
    }, controller.create);

    // Update student
    app.patch('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin'] })],
    }, controller.update);


    // Transition data status (school_admin, main_admin)
    app.patch('/:id/data-status', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'main_admin'] })],
    }, controller.updateDataStatus);

    // Save partial tab progress
    app.patch('/:id/save-tab', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin', 'teacher'] })],
    }, controller.saveTab);

    // Upload student photo
    app.post('/:id/photo', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'teacher'] })],
    }, controller.uploadPhoto);

    // Bulk request photos (school_admin)
    app.post('/bulk-request-photos', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin'] })],
    }, controller.bulkRequestPhotos);

    // Get student audit trail
    app.get('/:id/audit', {
        preHandler: [app.authenticate, app.rbac({ roles: ['main_admin', 'school_admin'] })],
    }, controller.getAuditLog);

    // Bulk delete students (school_admin, main_admin)
    app.post('/bulk-delete', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'main_admin'] })],
    }, controller.bulkDelete);

    // Delete student (school_admin, main_admin)
    app.delete('/:id', {
        preHandler: [app.authenticate, app.rbac({ roles: ['school_admin', 'main_admin'] })],
    }, controller.delete);

    // Link a User account to this Student record (main_admin, school_admin only)
    app.patch('/:id/link-user', {
        preHandler: [
            app.authenticate,
            app.rbac({ roles: ['main_admin', 'school_admin'] }),
        ],
        schema: { body: linkStudentUserSchema },
    }, controller.linkUser);

}
