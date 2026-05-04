import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/modules', function(filePath) {
    if (!filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/status: status as any/g, "status");
    content = content.replace(/status: params\.status as any/g, "status: params.status");
    
    content = content.replace(/: params\.role as any/g, ": params.role");
    content = content.replace(/: role as any/g, ": role");
    content = content.replace(/: userRole as any/g, ": userRole");
    content = content.replace(/: user\.role as any/g, ": user.role");
    
    content = content.replace(/: reason as any/g, ": reason");
    
    content = content.replace(/: params\.dataStatus as any/g, ": params.dataStatus");
    content = content.replace(/dataStatus as any/g, "dataStatus");
    
    content = content.replace(/: data\.sex as any/g, ": data.sex");
    content = content.replace(/: row\.sex as any/g, ": row.sex");

    content = content.replace(/tabName as any/g, "tabName");
    content = content.replace(/body\.tab as any/g, "body.tab");

    // JSON fields
    content = content.replace(/: results as any,/g, ": results as import('@prisma/client').Prisma.InputJsonValue,");
    content = content.replace(/: metadata as any,/g, ": metadata as import('@prisma/client').Prisma.InputJsonValue,");
    content = content.replace(/: steps as any,/g, ": steps as import('@prisma/client').Prisma.InputJsonValue,");
    content = content.replace(/workflow\.steps as any\[\]/g, "workflow.steps as Record<string, any>[]");
    content = content.replace(/workflow\?\.steps as any\[\]/g, "workflow?.steps as Record<string, any>[]");
    content = content.replace(/: conditions as any,/g, ": conditions as import('@prisma/client').Prisma.InputJsonValue,");
    content = content.replace(/: data\.gradeMapping as any,/g, ": data.gradeMapping as import('@prisma/client').Prisma.InputJsonValue,");
    content = content.replace(/: results\.subjectResults as any,/g, ": results.subjectResults as import('@prisma/client').Prisma.InputJsonValue,");
    content = content.replace(/: tokensData as any/g, ": tokensData as import('@prisma/client').Prisma.InputJsonValue");
    content = content.replace(/: defaultSections as any\[\]/g, ": defaultSections as import('@prisma/client').Prisma.InputJsonValue[]");
    content = content.replace(/portfolio\.themeConfig as any/g, "portfolio.themeConfig as Record<string, any>");
    content = content.replace(/: PORTFOLIO_THEMES\[theme \|\| 'modern'\] as any,/g, ": PORTFOLIO_THEMES[theme || 'modern'],");

    content = content.replace(/bbox = e\.boundingBox as any/g, "bbox = e.boundingBox as Record<string, number>");
    content = content.replace(/extractions as any/g, "extractions as import('@prisma/client').Prisma.InputJsonValue");
    content = content.replace(/\(request\.user as any\)\.studentId/g, "(request.user as import('fastify').FastifyRequest['user'] & { studentId?: string }).studentId");
    content = content.replace(/\(request\.query as any\)\.direction/g, "(request.query as Record<string, unknown>).direction");
    
    content = content.replace(/: data\.relationshipType as any/g, ": data.relationshipType");
    content = content.replace(/: inverseType as any/g, ": inverseType");
    content = content.replace(/: data\.context as any/g, ": data.context as import('@prisma/client').Prisma.InputJsonValue");
    
    content = content.replace(/request\.query as any/g, "request.query as Record<string, unknown>");

    // arrays
    content = content.replace(/\[\] as any\[\],/g, "[] as string[],"); // Usually ID arrays

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
});
