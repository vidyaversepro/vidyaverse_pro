import { PrismaClient } from '@prisma/client';
import { createIdCardService } from '../src/modules/id-cards/id-card.service.js';
import { logger } from '../src/utils/logger.js';

const prisma = new PrismaClient();
const service = createIdCardService(prisma);

async function runMemoryProfile() {
    try {
        console.log('Starting Memory Profile for Bulk Generation...');
        logMemory('Initial');

        // 1. Get an institution
        const institution = await prisma.institution.findFirst();
        if (!institution) throw new Error('No institution found. Run seed first.');
        
        // 2. Get a template
        let template = await prisma.template.findFirst({
            where: { institutionId: institution.id, serviceType: 'id_card' }
        });
        
        if (!template) {
            console.log('No template found. Creating a minimal dummy template...');
            // Create a dummy template obeying V2 schema
            template = await prisma.template.create({
                data: {
                    institutionId: institution.id,
                    name: 'Load Test Template',
                    description: 'Generated for memory profiling',
                    serviceType: 'id_card',
                    widthMm: 54,
                    heightMm: 86,
                    content: JSON.stringify({
                        width: 54,
                        height: 86,
                        elements: [
                            {
                                id: 'name-rt',
                                type: 'text',
                                x: 5, y: 10, width: 44, height: 10,
                                text: '{{studentName}}',
                                fontSize: 12,
                                color: '#000000'
                            },
                            {
                                id: 'shape-bg',
                                type: 'shape',
                                shapeType: 'rect',
                                x: 0, y: 0, width: 54, height: 20,
                                fill: '#ff0000',
                                zIndex: -1
                            }
                        ],
                        canvasConfig: { backgroundColor: '#ffffff' }
                    } as any)
                }
            });
        }

        // 3. Get or create 100 students
        const targetStudentCount = 100;
        let students = await prisma.student.findMany({
            where: { institutionId: institution.id },
            take: targetStudentCount,
            select: { id: true }
        });

        if (students.length < targetStudentCount) {
            console.log(`Only found ${students.length} students. Creating ${targetStudentCount - students.length} dummy students...`);
            const remaining = targetStudentCount - students.length;
            
            const classRecord = await prisma.class.findFirst({ where: { institutionId: institution.id } });
            if (!classRecord) throw new Error('No class found to assign to dummy students');
            
            const sectionRecord = await prisma.section.findFirst({ where: { classId: classRecord.id } });
            if (!sectionRecord) throw new Error('No section found to assign to dummy students');

            const newStudents = Array.from({ length: remaining }).map((_, i) => ({
                institutionId: institution.id,
                sectionId: sectionRecord.id,
                name: `LoadTest Student ${Date.now()}_${i}`,
                admissionNumber: `LT-${Date.now()}-${i}`,
                dataStatus: 'approved'
            }));
            
            await prisma.student.createMany({ data: newStudents as any });
            students = await prisma.student.findMany({
                where: { institutionId: institution.id },
                take: targetStudentCount,
                select: { id: true }
            });
        }

        const studentIds = students.map(s => s.id);
        console.log(`\nReady to generate ${studentIds.length} ID cards.`);
        logMemory('Before Generation');

        // Monitor memory every second during generation
        const interval = setInterval(() => logMemory('During Generation'), 1000);

        const startTime = Date.now();
        console.log(`\nTriggering generation via IdCardService (this returns a batch tracking record asynchronously)...`);
        
        // This initiates the background queue. Since we run directly, we need to await the actual queue logic if it's running in background.
        // Wait, generateBulk returns { batchId, message }. But looking at the source, it spawns an async Promise without awaiting it.
        // Let's call the `processBulkGeneration` directly to force it to block and so we can profile it exactly!
        
        // Let's just use service.generateBulk which handles creating the batch
        // and kicks off the background process.
        
        const { batchId } = await service.generateBulk(institution.id, studentIds, template.id);
        
        console.log(`Generation started. Batch ID: ${batchId}. Polling for completion...`);
        
        let completed = false;
        while (!completed) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const currentBatch = await prisma.idCardBatch.findUnique({ where: { id: batchId } });
            if (currentBatch?.status === 'completed' || currentBatch?.status === 'failed') {
                completed = true;
                clearInterval(interval);
                const duration = (Date.now() - startTime) / 1000;
                console.log(`\nBatch Finished! Status: ${currentBatch.status}`);
                console.log(`Duration: ${duration.toFixed(2)} seconds`);
                console.log(`Metrics: ${currentBatch.totalSucceeded} success, ${currentBatch.totalFailed} failed`);
                logMemory('After Generation');
            } else {
                console.log(`Progress: ${(currentBatch?.totalSucceeded || 0) + (currentBatch?.totalFailed || 0)} / ${currentBatch?.totalRequested} processed...`);
            }
        }
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

function logMemory(label: string) {
    const formatMemoryUsage = (data: number) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
    const memoryData = process.memoryUsage();
    console.log(`[Memory | ${label}] RSS: ${formatMemoryUsage(memoryData.rss)}, Heap Total: ${formatMemoryUsage(memoryData.heapTotal)}, Heap Used: ${formatMemoryUsage(memoryData.heapUsed)}, External: ${formatMemoryUsage(memoryData.external)}`);
}

runMemoryProfile();
