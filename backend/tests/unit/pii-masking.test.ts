import { describe, it, expect } from 'vitest';
import { maskAadhaar, maskPhone, maskEmail, applyPiiMasking } from '../../src/utils/pii-masking.js';
import { ServiceType } from '@prisma/client';

describe('PII Masking Utils', () => {
    describe('maskAadhaar', () => {
        it('should mask standard Aadhaar format', () => {
            expect(maskAadhaar('1234-5678-9012')).toBe('XXXX-XXXX-9012');
        });
        it('should mask Aadhaar without hyphens', () => {
            expect(maskAadhaar('123456789012')).toBe('XXXX-XXXX-9012');
        });
        it('should handle short inputs', () => {
            expect(maskAadhaar('12')).toBe('12');
        });
        it('should handle null/undefined', () => {
            expect(maskAadhaar(null)).toBe('');
            expect(maskAadhaar(undefined)).toBe('');
        });
    });

    describe('maskPhone', () => {
        it('should mask phone numbers', () => {
            expect(maskPhone('+91 9876543210')).toBe('XXXXXX3210');
            expect(maskPhone('9876543210')).toBe('XXXXXX3210');
        });
        it('should handle short inputs', () => {
            expect(maskPhone('123')).toBe('123');
        });
    });

    describe('maskEmail', () => {
        it('should mask standard emails', () => {
            expect(maskEmail('john.doe@example.com')).toBe('jo******@example.com');
            expect(maskEmail('test@test.com')).toBe('te***@test.com');
        });
        it('should handle short emails', () => {
            expect(maskEmail('ab@example.com')).toBe('ab@***.com');
        });
        it('should handle invalid emails', () => {
            expect(maskEmail('invalid-email')).toBe('invalid-email');
        });
    });

    describe('applyPiiMasking', () => {
        it('should mask data based on service type registry', () => {
            const data = {
                student: {
                    name: 'John Doe',
                    contactNumber: '+91 9876543210',
                    email: 'john.doe@example.com',
                    aadhaarNumber: '1234-5678-9012'
                },
                institution: {
                    name: 'Springfield High'
                }
            };

            const masked = applyPiiMasking(data, ServiceType.id_card);

            expect(masked.student.name).toBe('John Doe');
            expect(masked.student.contactNumber).toBe('XXXXXX3210');
            expect(masked.student.email).toBe('jo******@example.com');
            expect(masked.student.aadhaarNumber).toBe('XXXX-XXXX-9012');
            expect(masked.institution.name).toBe('Springfield High');
        });

        it('should not mask data if service type has no mask rules for it', () => {
            const data = {
                student: {
                    name: 'John Doe',
                    contactNumber: '+91 9876543210'
                }
            };
            // visiting_card does not include student variables in its registry by default
            const masked = applyPiiMasking(data, ServiceType.visiting_card);
            expect(masked.student.contactNumber).toBe('+91 9876543210');
        });
    });
});
