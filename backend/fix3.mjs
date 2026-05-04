import fs from 'fs';

// 1. social/service.ts
let content = fs.readFileSync('src/modules/social/service.ts', 'utf8');
content = content.replace(/context as import\('@prisma\/client'\)\.Prisma\.InputJsonValue/g, "context as never"); // line 86
content = content.replace(/status: status/g, "status: status as never"); // line 122
fs.writeFileSync('src/modules/social/service.ts', content);

// 2. social/controller.ts
content = fs.readFileSync('src/modules/social/controller.ts', 'utf8');
content = content.replace(/request\.body as never/g, "request.body as any");
fs.writeFileSync('src/modules/social/controller.ts', content);

// 3. student/service.ts
content = fs.readFileSync('src/modules/student/service.ts', 'utf8');
content = content.replace(/dataStatus: params\.dataStatus as import\('@prisma\/client'\)\.DataStatus,/g, "dataStatus: params.dataStatus as any,");
content = content.replace(/type: data\.type/g, "type: data.type as any"); // 650
content = content.replace(/tokens as never/g, "tokens as any"); // 782
fs.writeFileSync('src/modules/student/service.ts', content);

// 4. student/controller.ts
content = fs.readFileSync('src/modules/student/controller.ts', 'utf8');
content = content.replace(/request\.body as never/g, "request.body as any");
fs.writeFileSync('src/modules/student/controller.ts', content);

// 5. transfer-certificates
content = fs.readFileSync('src/modules/transfer-certificates/transfer-certificate.service.ts', 'utf8');
content = content.replace(/status: 'generated'/g, "status: 'generated' as any");
content = content.replace(/status: "generated"/g, "status: 'generated' as any");
fs.writeFileSync('src/modules/transfer-certificates/transfer-certificate.service.ts', content);

// 6. visionarium/controller.ts
content = fs.readFileSync('src/modules/visionarium/controller.ts', 'utf8');
content = content.replace(/request\.body as never/g, "request.body as any");
fs.writeFileSync('src/modules/visionarium/controller.ts', content);

// 7. workers/index.ts
content = fs.readFileSync('src/workers/index.ts', 'utf8');
content = content.replace(/metadata: data\.metadata as never,/g, "metadata: data.metadata as any,");
content = content.replace(/result: data\.result as never,/g, "result: data.result as any,");
fs.writeFileSync('src/workers/index.ts', content);

console.log("Fixed part 3!");
