import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'ZSyaa1T7lfPiaPWp4c5ikJ1raO850ndG';
    const institutionId = '0ea3b292-ba4d-4e2e-9103-a13e637dbfc5';
    
    // Check if role already exists
    const existing = await prisma.userInstitutionRole.findUnique({
        where: { userId_institutionId: { userId, institutionId } }
    });

    if (!existing) {
        await prisma.userInstitutionRole.create({
            data: {
                id: Math.random().toString(36).substring(7),
                userId,
                institutionId,
                role: 'student',
            }
        });
        console.log('Created UserInstitutionRole for student.');
    } else {
        console.log('Role already exists.');
    }
}

main().finally(() => prisma.$disconnect());
