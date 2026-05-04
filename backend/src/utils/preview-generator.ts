import { ServiceType } from '@prisma/client';
import { TEMPLATE_VARIABLE_REGISTRY } from './pii-masking.js';
import { StudentRenderData } from './template-engine.js';

export function generateDummyRenderData(serviceType: ServiceType, overrides?: Record<string, any>): StudentRenderData {
    const registry = TEMPLATE_VARIABLE_REGISTRY[serviceType] || [];
    const dummyData: Record<string, any> = {};

    for (const v of registry) {
        const parts = v.key.split('.');
        if (parts.length === 2) {
            const [obj, prop] = parts;
            if (!dummyData[obj]) dummyData[obj] = {};
            dummyData[obj][prop] = v.sampleValue;
        } else {
            dummyData[v.key] = v.sampleValue;
        }
    }

    const studentName = dummyData.student?.name || dummyData.student?.fullName || '';

    return {
        ...dummyData,
        ...overrides,
        id: 'preview-id',
        firstName: studentName.split(' ')[0] || '',
        lastName: studentName.split(' ')[1] || '',
        fullName: studentName,
        dob: dummyData.student?.dob || dummyData.student?.dateOfBirth || '',
        gender: dummyData.student?.gender || '',
        profilePhotoUrl: dummyData.student?.photoUrl || '',
        rollNumber: dummyData.student?.rollNumber || '',
        admissionNumber: dummyData.student?.admissionNo || dummyData.student?.admissionNumber || '',
        class: {
            className: dummyData.class?.name || '',
            section: dummyData.class?.section || '',
            academicYear: dummyData.academicYear || '',
        },
        institution: {
            name: dummyData.institution?.name || '',
            logoUrl: dummyData.institution?.logo || '',
            address: dummyData.institution?.address || '',
            city: dummyData.institution?.city || '',
            state: dummyData.institution?.state || '',
            phone: dummyData.institution?.phone || '',
            email: dummyData.institution?.email || '',
            code: dummyData.institution?.code || '',
        },
        qrData: dummyData.qrCode || '',
        barcodeValue: dummyData.barcodeValue || '',
        serialNumber: dummyData.serialNumber || '',
    };
}
