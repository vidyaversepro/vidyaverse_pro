import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';

/**
 * Hash password matching Better Auth's internal format exactly.
 * Better Auth uses @noble/hashes/scrypt with N:16384, r:16, p:1, dkLen:64.
 * The salt is a hex-encoded string passed directly to scrypt (not as bytes).
 */
function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    // Match Better Auth: N=16384, r=16, p=1, dkLen=64, maxmem = 128*N*r*2
    const hash = scryptSync(password.normalize('NFKC'), salt, 64, {
        N: 16384,
        r: 16,
        p: 1,
        maxmem: 128 * 16384 * 16 * 2,
    }).toString('hex');
    return `${salt}:${hash}`;
}
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default system config
    const systemConfigs = [
        { configKey: 'maintenance_mode', configValue: 'false', dataType: 'boolean' as const, description: 'Enable maintenance mode', isPublic: true },
        { configKey: 'ai_enabled', configValue: 'true', dataType: 'boolean' as const, description: 'Enable AI photo enhancement', isPublic: false },
        { configKey: 'max_upload_size_mb', configValue: '10', dataType: 'number' as const, description: 'Maximum photo upload size', isPublic: true },
        { configKey: 'default_trial_days', configValue: '7', dataType: 'number' as const, description: 'Default trial period', isPublic: false },
        { configKey: 'opencv_threshold', configValue: '0.5', dataType: 'number' as const, description: 'OpenCV confidence threshold', isPublic: false },
        { configKey: 'gemini_fallback_enabled', configValue: 'true', dataType: 'boolean' as const, description: 'Enable Gemini API fallback', isPublic: false },
    ];

    for (const config of systemConfigs) {
        await prisma.systemConfig.upsert({
            where: { configKey: config.configKey },
            update: config,
            create: config,
        });
    }
    console.log('✅ System config created');

    // Create super admin user
    // Create super admin user
    const superAdminEmail = 'thevinstitution@gmail.com';
    // Use Better Auth's native password hashing (scrypt) so login works correctly
    const superAdminPassword = await hashPassword('Admin@123');

    const superAdmin = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: {
            globalRole: 'super_admin',
            isActive: true,
            isVerified: true,
        },
        create: {
            email: superAdminEmail,
            name: 'Super Administrator',
            globalRole: 'super_admin',
            isActive: true,
            isVerified: true,
            emailVerified: true
        },
    });

    // Create the Better-Auth credential account
    await prisma.account.upsert({
        where: {
            accountId_providerId: {
                accountId: superAdminEmail,
                providerId: 'credential'
            }
        },
        update: {
            password: superAdminPassword
        },
        create: {
            id: crypto.randomUUID(),
            accountId: superAdminEmail,
            providerId: 'credential',
            userId: superAdmin.id,
            password: superAdminPassword
        }
    });
    console.log(`✅ Super admin created: ${superAdmin.email}`);

    // Create demo institution
    const demoInstitution = await prisma.institution.upsert({
        where: { code: 'demo-school' },
        update: {},
        create: {
            name: 'Demo School',
            code: 'demo-school',
            address: '123 Education Street, Learning City',
            contactEmail: 'info@demo-school.edu',
            contactPhone: '+1234567890',
            academicYear: '2025-2026',
            subscriptionTier: 'professional',
            subscriptionStatus: 'active',
            enabledFields: [],
            customFields: [],
            enabledServices: [],
        },
    });
    console.log(`✅ Demo institution created: ${demoInstitution.name}`);

    // Assign super admin to demo institution
    await prisma.userInstitutionRole.upsert({
        where: {
            userId_institutionId: {
                userId: superAdmin.id,
                institutionId: demoInstitution.id,
            },
        },
        update: {},
        create: {
            userId: superAdmin.id,
            institutionId: demoInstitution.id,
            role: 'main_admin',
        },
    });
    console.log('✅ Super admin assigned to demo institution');

    // Create demo classes
    const classes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

    for (let i = 0; i < classes.length; i++) {
        const className = classes[i];
        const demoClass = await prisma.class.upsert({
            where: {
                institutionId_name: {
                    institutionId: demoInstitution.id,
                    name: className,
                },
            },
            update: {},
            create: {
                institutionId: demoInstitution.id,
                name: className,
                displayOrder: i + 1,
            },
        });

        // Create sections A, B for each class
        for (const sectionName of ['A', 'B']) {
            const existingSection = await prisma.section.findFirst({
                where: {
                    classId: demoClass.id,
                    streamId: null,
                    name: sectionName,
                }
            });

            if (!existingSection) {
                await prisma.section.create({
                    data: {
                        institutionId: demoInstitution.id,
                        classId: demoClass.id,
                        name: sectionName,
                        expectedStudentCount: 40,
                    }
                });
            }
        }
    }
    console.log('✅ Demo classes and sections created');

    // Create default calculation engine
    await prisma.calculationEngine.upsert({
        where: {
            institutionId_academicYear: {
                institutionId: demoInstitution.id,
                academicYear: '2025-2026',
            },
        },
        update: {},
        create: {
            institutionId: demoInstitution.id,
            academicYear: '2025-2026',
            cgpaFormula: '(total_obtained_marks / total_max_marks) * 10',
            percentageFormula: '(total_obtained_marks / total_max_marks) * 100',
            percentileFormula: '(students_below_score / total_students) * 100',
            gradeScale: [
                { min: 90, max: 100, grade: 'A+', points: 10 },
                { min: 80, max: 89, grade: 'A', points: 9 },
                { min: 70, max: 79, grade: 'B+', points: 8 },
                { min: 60, max: 69, grade: 'B', points: 7 },
                { min: 50, max: 59, grade: 'C+', points: 6 },
                { min: 40, max: 49, grade: 'C', points: 5 },
                { min: 0, max: 39, grade: 'F', points: 0 },
            ],
            theoryWeightage: 70,
            practicalWeightage: 30,
            internalWeightage: 20,
            rankCalculationScope: 'class_all_sections',
            isActive: true,
        },
    });
    console.log('✅ Default calculation engine created');

    // Create default templates
    console.log('📄 Seeding default templates...');
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const templatesDir = path.join(__dirname, 'templates');
    const defaultTemplates = [
        { type: 'id_card', name: 'Standard ID Card', file: 'id_card.html', templateType: 'html' },
        { type: 'certificate', name: 'Certificate of Achievement', file: 'certificate.html', templateType: 'html' },
        { type: 'hall_ticket', name: 'Standard Hall Ticket', file: 'hall_ticket.html', templateType: 'html' },
        { type: 'marksheet', name: 'Standard Marksheet', file: 'marksheet.html', templateType: 'html' },
        { type: 'library_card', name: 'Library Member Card', file: 'library_card.html', templateType: 'html' },
        { type: 'transfer_certificate', name: 'Standard Transfer Certificate', file: 'transfer_certificate.html', templateType: 'html' },
        { type: 'visiting_card', name: 'Standard Visiting Card', file: 'visiting_card.json', templateType: 'json' },
    ];

    for (const tpl of defaultTemplates) {
        try {
            const filePath = path.join(templatesDir, tpl.file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                
                const existingTemplate = await prisma.template.findFirst({
                    where: {
                        institutionId: demoInstitution.id,
                        serviceType: tpl.type as any,
                        name: tpl.name,
                    }
                });

                if (existingTemplate) {
                    await prisma.template.update({
                        where: { id: existingTemplate.id },
                        data: {
                            content,
                            templateType: tpl.templateType as any,
                            isDefault: true,
                        }
                    });
                } else {
                    await prisma.template.create({
                        data: {
                            institutionId: demoInstitution.id,
                            serviceType: tpl.type as any,
                            name: tpl.name,
                            content,
                            templateType: tpl.templateType as any,
                            isDefault: true,
                            isActive: true,
                        }
                    });
                }
            }
        } catch (err: any) {
            console.warn(`⚠️ Failed to seed template ${tpl.name}:`, err.message);
        }
    }
    console.log('✅ Default templates seeded');

    console.log('');
    console.log('🎉 Database seeding completed!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${superAdminEmail}`);
    console.log('   Password: Admin@123');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
