import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const totalStudents = await prisma.student.count();
    console.log(`Total students in DB: ${totalStudents}`);

    const students = await prisma.student.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            section: {
                select: {
                    name: true,
                    classId: true,
                    streamId: true,
                    class: { select: { name: true } },
                    stream: { select: { name: true } }
                }
            }
        }
    });

    console.log('Recent 10 students:', JSON.stringify(students.map(s => ({
        id: s.id,
        name: s.name,
        admissionNumber: s.admissionNumber,
        status: s.status,
        dataStatus: s.dataStatus,
        section: s.section
    })), null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
