import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Purge test accounts (keep only thevinstitution@gmail.com)
const myEmail = 'thevinstitution@gmail.com';

const testUsers = await prisma.user.findMany({
    where: { email: { not: myEmail } },
    select: { id: true, email: true }
});

console.log(`Found ${testUsers.length} test accounts to delete.\n`);

for (const u of testUsers) {
    // Delete related records first
    await prisma.account.deleteMany({ where: { userId: u.id } });
    await prisma.session.deleteMany({ where: { userId: u.id } });
    await prisma.userInstitutionRole.deleteMany({ where: { userId: u.id } });
    await prisma.auditLog.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
    console.log(`  Deleted: ${u.email}`);
}

console.log(`\n✅ Purged ${testUsers.length} test accounts.`);

// 2. Check for existing institutions
const institutions = await prisma.institution.findMany({
    select: { id: true, name: true, code: true, institutionType: true, createdAt: true }
});

console.log(`\n--- Institutions in DB: ${institutions.length} ---`);
for (const inst of institutions) {
    console.log(`  ${inst.name} (${inst.code}) | Type: ${inst.institutionType} | Created: ${inst.createdAt.toISOString().split('T')[0]}`);
}

if (institutions.length === 0) {
    console.log('  (none found)');
}

await prisma.$disconnect();
