import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const cutoffDate = new Date('2026-03-20T00:00:00.000Z');
    
    const result = await prisma.template.deleteMany({
        where: {
            createdAt: {
                lt: cutoffDate
            }
        }
    });
    
    console.log(`Deleted ${result.count} mock templates.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
