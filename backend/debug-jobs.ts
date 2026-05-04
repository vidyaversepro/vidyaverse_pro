import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const jobs = await prisma.jobExecution.findMany({
        where: { type: 'csv_import' },
        orderBy: { createdAt: 'desc' },
        take: 3
    });
    console.log(JSON.stringify(jobs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
