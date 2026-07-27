import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'ZSyaa1T7lfPiaPWp4c5ikJ1raO850ndG';
    const institutionId = '0ea3b292-ba4d-4e2e-9103-a13e637dbfc5';
    
    await prisma.userInstitutionRole.update({
        where: { userId_institutionId: { userId, institutionId } },
        data: {
            studentAccessEnabled: true,
        }
    });
    console.log('Enabled student access.');
}

main().finally(() => prisma.$disconnect());
