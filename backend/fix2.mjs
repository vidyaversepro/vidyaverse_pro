import fs from 'fs';

// 1. group-photo/controller.ts
if (fs.existsSync('src/modules/group-photo/controller.ts')) {
    let content = fs.readFileSync('src/modules/group-photo/controller.ts', 'utf8');
    content = content.replace(/request\.body as Record<string, unknown>/g, "request.body as never");
    fs.writeFileSync('src/modules/group-photo/controller.ts', content);
}

// 2. hall-ticket.service.ts
if (fs.existsSync('src/modules/hall-tickets/hall-ticket.service.ts')) {
    let content = fs.readFileSync('src/modules/hall-tickets/hall-ticket.service.ts', 'utf8');
    content = content.replace(/status: params\.status,/g, "status: params.status as import('@prisma/client').ExamScheduleStatus,");
    content = content.replace(/status: 'issued'/g, "status: 'issued' as never");
    content = content.replace(/status: 'draft' \| 'issued' \| 'generated'/g, "status: ('draft' | 'issued' | 'generated') as never");
    fs.writeFileSync('src/modules/hall-tickets/hall-ticket.service.ts', content);
}

// 3. id-card/controller.ts
if (fs.existsSync('src/modules/id-card/controller.ts')) {
    let content = fs.readFileSync('src/modules/id-card/controller.ts', 'utf8');
    content = content.replace(/request\.body as Record<string, unknown>/g, "request.body as never");
    fs.writeFileSync('src/modules/id-card/controller.ts', content);
}

// 4. institution/controller.ts
if (fs.existsSync('src/modules/institution/controller.ts')) {
    let content = fs.readFileSync('src/modules/institution/controller.ts', 'utf8');
    content = content.replace(/request\.body as Record<string, unknown>/g, "request.body as never");
    fs.writeFileSync('src/modules/institution/controller.ts', content);
}

// 5. social/controller.ts
if (fs.existsSync('src/modules/social/controller.ts')) {
    let content = fs.readFileSync('src/modules/social/controller.ts', 'utf8');
    content = content.replace(/request\.body as Record<string, unknown>/g, "request.body as never");
    fs.writeFileSync('src/modules/social/controller.ts', content);
}

// 6. student/controller.ts
if (fs.existsSync('src/modules/student/controller.ts')) {
    let content = fs.readFileSync('src/modules/student/controller.ts', 'utf8');
    content = content.replace(/request\.body as Record<string, unknown>/g, "request.body as never");
    content = content.replace(/const data = request\.body as Record<string, unknown>;/g, "const data = request.body as never;");
    fs.writeFileSync('src/modules/student/controller.ts', content);
}

// 7. student/service.ts
if (fs.existsSync('src/modules/student/service.ts')) {
    let content = fs.readFileSync('src/modules/student/service.ts', 'utf8');
    content = content.replace(/dataStatus: params\.dataStatus,/g, "dataStatus: params.dataStatus as import('@prisma/client').DataStatus,");
    content = content.replace(/tokens as Record<string, any>\[\]/g, "tokens as never");
    fs.writeFileSync('src/modules/student/service.ts', content);
}

// 8. transfer-certificates
if (fs.existsSync('src/modules/transfer-certificates/transfer-certificate.service.ts')) {
    let content = fs.readFileSync('src/modules/transfer-certificates/transfer-certificate.service.ts', 'utf8');
    content = content.replace(/status: 'generated'/g, "status: 'generated' as never");
    fs.writeFileSync('src/modules/transfer-certificates/transfer-certificate.service.ts', content);
}

// 9. visionarium/controller.ts
if (fs.existsSync('src/modules/visionarium/controller.ts')) {
    let content = fs.readFileSync('src/modules/visionarium/controller.ts', 'utf8');
    content = content.replace(/request\.body as Record<string, unknown>/g, "request.body as never");
    fs.writeFileSync('src/modules/visionarium/controller.ts', content);
}

// 10. workers/index.ts
if (fs.existsSync('src/workers/index.ts')) {
    let content = fs.readFileSync('src/workers/index.ts', 'utf8');
    content = content.replace(/metadata: data\.metadata,/g, "metadata: data.metadata as never,");
    content = content.replace(/result: data\.result,/g, "result: data.result as never,");
    fs.writeFileSync('src/workers/index.ts', content);
}

console.log("Fixed part 2!");
