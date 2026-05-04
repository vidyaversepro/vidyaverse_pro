import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

/**
 * Hash password matching Better Auth's internal format exactly.
 * Uses scrypt with N:16384, r:16, p:1, dkLen:64 and NFKC normalization.
 */
function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password.normalize('NFKC'), salt, 64, {
        N: 16384,
        r: 16,
        p: 1,
        maxmem: 128 * 16384 * 16 * 2,
    }).toString('hex');
    return `${salt}:${hash}`;
}

async function main() {
    console.log('🗑️  Clearing all user accounts...');

    // Delete in dependency order
    await prisma.session.deleteMany({});
    console.log('  ✅ Sessions cleared');

    await prisma.account.deleteMany({});
    console.log('  ✅ Accounts cleared');

    await prisma.verification.deleteMany({}).catch(() => {});
    console.log('  ✅ Verifications cleared');

    // Remove institution memberships
    await prisma.institutionMember.deleteMany({});
    console.log('  ✅ Institution memberships cleared');

    // Delete all users
    await prisma.user.deleteMany({});
    console.log('  ✅ All users deleted');

    console.log('\n🆕 Creating new super admin...');

    const superAdminEmail = 'thevinstitution@gmail.com';
    const superAdminPasswordHash = hashPassword('Vevgvpsm@2026vpdmns.');

    const superAdmin = await prisma.user.create({
        data: {
            email: superAdminEmail,
            name: 'Super Administrator',
            globalRole: 'super_admin',
            isActive: true,
            isVerified: true,
            emailVerified: true,
        },
    });

    await prisma.account.create({
        data: {
            id: crypto.randomUUID(),
            accountId: superAdminEmail,
            providerId: 'credential',
            userId: superAdmin.id,
            password: superAdminPasswordHash,
        },
    });

    // Re-assign super admin to demo institution if it exists
    const demoInstitution = await prisma.institution.findFirst({
        where: { name: 'Demo School' },
    });

    if (demoInstitution) {
        await prisma.institutionMember.create({
            data: {
                userId: superAdmin.id,
                institutionId: demoInstitution.id,
                role: 'admin',
                isActive: true,
            },
        });
        console.log('  ✅ Super admin assigned to Demo School');
    }

    console.log(`\n🎉 Done! Super admin created successfully.`);
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Password: Vevgvpsm@2026vpdmns.`);
}

main()
    .catch((err) => {
        console.error('❌ Error:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
