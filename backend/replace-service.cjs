const fs = require('fs');

try {
    let code = fs.readFileSync('src/modules/student/service.ts', 'utf8');

    const newFunc = `    /**
     * Accepts a raw CSV stream, stores it in MinIO, and enqueues a background job.
     */
    async enqueueCsvImportJob(data: {
        institutionId: string;
        sectionId: string;
        file: any; // fastify multipart file
        initiatedBy?: string;
    }): Promise<string> {
        const { institutionId, sectionId, file, initiatedBy } = data;

        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: { institution: { select: { code: true, academicYear: true } }, class: { select: { branchId: true } } }
        });

        if (!section || section.institutionId !== institutionId) {
            throw new BadRequestError('Section not found or unauthorized');
        }

        const fileKey = \`csv-imports/\${institutionId}/\${nanoid(10)}-\${file.filename}\`;
        
        const fileBuffer = await file.toBuffer();

        const { getMinioClient } = await import('../../config/minio.js');
        const minio = getMinioClient();
        
        const { env: configEnv } = await import('../../config/env.js');
        await minio.putObject(configEnv.MINIO_BUCKET, fileKey, fileBuffer, fileBuffer.length, {
            'Content-Type': file.mimetype,
        });

        const jobExecution = await prisma.jobExecution.create({
            data: {
                jobId: nanoid(14),
                jobType: 'student_bulk_import',
                institutionId,
                sectionId,
                initiatedBy,
                status: 'queued',
                totalItems: 0,
                progress: 0
            }
        });

        const { csvImportQueue } = await import('../../config/queue.js');

        const jobData = {
            jobExecutionId: jobExecution.id,
            institutionId,
            sectionId,
            fileKey,
            expectedCount: 1,
            initiatedBy: initiatedBy || 'system'
        };

        const job = await csvImportQueue.add(jobExecution.id, jobData);
        
        await prisma.jobExecution.update({
            where: { id: jobExecution.id },
            data: { jobId: String(job.id) }
        });

        return jobExecution.id;
    }`;

    const startIdx = code.indexOf('    /**\n     * Processes a CSV payload by matching');
    const endIdx = code.indexOf('        };\n    }\n};\n', startIdx);

    if (startIdx !== -1) {
        let actualEnd = endIdx !== -1 ? endIdx + 16 : code.lastIndexOf('};\n');

        code = code.substring(0, startIdx) + newFunc + '\n};\n';
        fs.writeFileSync('src/modules/student/service.ts', code);
        console.log("Replaced successfully");
    } else {
        console.log("Indices not found");
    }
} catch (e) {
    console.error(e);
}
