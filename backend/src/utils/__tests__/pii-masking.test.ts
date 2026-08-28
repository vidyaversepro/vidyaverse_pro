import { describe, it, expect } from 'vitest';
import { maskAadhaar, defaultPhotoUrl, maskPhone, maskEmail, applyMasking, TEMPLATE_VARIABLE_REGISTRY } from '../pii-masking.js';

describe('PII Masking Utils', () => {
    describe('maskAadhaar', () => {
        it('masks a standard Aadhaar number correctly', () => {
            expect(maskAadhaar('1234 5678 9012')).toBe('XXXX XXXX 9012');
            expect(maskAadhaar('123456789012')).toBe('XXXX XXXX 9012');
        });

        it('handles empty or short strings', () => {
            expect(maskAadhaar(null)).toBe('');
            expect(maskAadhaar(undefined)).toBe('');
            expect(maskAadhaar('')).toBe('');
            expect(maskAadhaar('123')).toBe('123'); // Less than 4 digits
        });
    });

    describe('defaultPhotoUrl', () => {
        it('returns original URL if present', () => {
            expect(defaultPhotoUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
        });

        it('returns placeholder for missing photo', () => {
            expect(defaultPhotoUrl(null)).toBe('/placeholder-photo.png');
            expect(defaultPhotoUrl(undefined)).toBe('/placeholder-photo.png');
            expect(defaultPhotoUrl('')).toBe('/placeholder-photo.png');
        });
    });

    describe('maskPhone', () => {
        it('masks a standard phone number correctly', () => {
            expect(maskPhone('9876543210')).toBe('******3210');
            expect(maskPhone('+91 9876543210')).toBe('*********3210');
        });

        it('handles short strings gracefully', () => {
            expect(maskPhone('123')).toBe('123');
            expect(maskPhone('')).toBe('');
            expect(maskPhone(null)).toBe('');
        });
    });

    describe('maskEmail', () => {
        it('masks the local part and keeps the domain', () => {
            expect(maskEmail('john.doe@example.com')).toBe('jo***@example.com');
            expect(maskEmail('jane@school.edu.in')).toBe('ja***@school.edu.in');
            expect(maskEmail('test@test.com')).toBe('te***@test.com');
        });

        it('uses a fixed-width mask, so the address length does not leak', () => {
            expect(maskEmail('alexandra.hamilton@example.com')).toBe('al***@example.com');
            expect(maskEmail('abc@example.com')).toBe('ab***@example.com');
        });

        it('hides the domain instead when the local part is too short to mask', () => {
            // Revealing the first two characters of a two-character local part
            // would reveal all of it, so there is nothing to gain by masking it.
            expect(maskEmail('ab@example.com')).toBe('ab@***.com');
            expect(maskEmail('a@example.com')).toBe('a@***.com');
        });

        it('handles invalid or empty input gracefully', () => {
            expect(maskEmail('notanemail')).toBe('notanemail');
            expect(maskEmail(null)).toBe('');
            expect(maskEmail(undefined)).toBe('');
            expect(maskEmail('')).toBe('');
        });
    });

    describe('applyMasking', () => {
        it('deep copies and masks sensitive fields', () => {
            const data = {
                student: {
                    name: 'John Doe',
                    aadharNumber: '987654321098',
                    phone: '9876543210',
                    email: 'parent@example.com',
                    photoUrl: '',
                    class: { name: 'X' }
                },
                academicYear: '2025'
            };

            const masked = applyMasking(data);

            expect(masked.student.aadharNumber).toBe('XXXX XXXX 1098');
            expect(masked.student.phone).toBe('******3210');
            expect(masked.student.email).toBe('pa***@example.com');
            expect(masked.student.photoUrl).toBe('/placeholder-photo.png');
            expect(masked.student.name).toBe('John Doe'); // Unchanged
            expect(masked.academicYear).toBe('2025'); // Unchanged

            // Original data should NOT be mutated
            expect(data.student.aadharNumber).toBe('987654321098');
        });

        it('handles data without student object gracefully', () => {
            const data = { institution: { name: 'School' } };
            const masked = applyMasking(data);
            expect(masked).toEqual(data);
            expect(masked).not.toBe(data); // Should be a deep copy
        });
    });

    describe('TEMPLATE_VARIABLE_REGISTRY', () => {
        it('contains expected fields for each entry', () => {
            const idCardVars = TEMPLATE_VARIABLE_REGISTRY['id_card'] || [];
            idCardVars.forEach(variable => {
                expect(variable).toHaveProperty('key');
                expect(variable).toHaveProperty('label');
                expect(variable).toHaveProperty('category');
                expect(variable).toHaveProperty('handlebarsExpression');
                expect(variable).toHaveProperty('isMasked');
                expect(variable).toHaveProperty('sampleValue');
            });
        });

        it('never claims isMasked for a field applyMasking does not actually mask', () => {
            // A registry entry that advertises isMasked but that applyMasking never
            // reaches is metadata that lies — to the template editor, which is served
            // this via GET /templates/variables, and to preview-generator.ts, which
            // builds preview data from sampleValue. visiting_card's phone and email
            // did exactly that until 2026-08-28: they were declared masked, but
            // applyMasking only walks data.student.* and the visiting-card service
            // supplies those two as flat top-level keys.
            const probeFor = (key: string): string => {
                if (key.includes('aadhar')) return '123456789012';
                if (key.includes('phone')) return '9876543210';
                if (key.includes('email')) return 'someone@example.com';
                if (key.includes('photo')) return '';
                return 'UNMASKED-PROBE';
            };

            const lying: string[] = [];

            for (const [serviceType, vars] of Object.entries(TEMPLATE_VARIABLE_REGISTRY)) {
                for (const v of vars) {
                    if (!v.isMasked) continue;

                    const parts = v.key.split('.');
                    const probe = probeFor(v.key);
                    const data: Record<string, any> = parts.length === 2
                        ? { [parts[0]]: { [parts[1]]: probe } }
                        : { [parts[0]]: probe };

                    const masked = applyMasking(data);
                    const got = parts.length === 2 ? masked[parts[0]][parts[1]] : masked[parts[0]];

                    if (got === probe) lying.push(`${serviceType}.${v.key}`);
                }
            }

            expect(lying).toEqual([]);
        });
    });
});
