import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Let's use the exact values from the debug-students output
    const classId = "a0675625-85c4-4366-8d58-6201a212c0d9";
    const streamId = "5cd5bfc2-df22-4ec9-9d82-37096e1a637e";
    // We don't have institutionId in the output, but let's query without it first
    
    const sectionFilter: any = {};
    if (classId) sectionFilter.classId = classId;
    if (streamId) sectionFilter.streamId = streamId;

    const where: any = {
        ...(Object.keys(sectionFilter).length > 0 && { section: sectionFilter })
    };

    console.log("Querying with where:", JSON.stringify(where, null, 2));

    const students = await prisma.student.findMany({
        where,
        take: 5
    });

    console.log(`Found ${students.length} students`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
