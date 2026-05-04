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

    // Pattern: request.body as any -> request.body as Record<string, unknown>
    content = content.replace(/request\.body as any;/g, "request.body as Record<string, unknown>;");
    content = content.replace(/request\.body as any\b(?!\s*\[)(?!\s*\])/g, "request.body as Record<string, unknown>"); // matches "request.body as any" not followed by [ or ]  (but the previous regex caught some)
    
    // Pattern: request.body as any[] -> request.body as Record<string, unknown>[]
    content = content.replace(/request\.body as any\[\];/g, "request.body as Record<string, unknown>[];");
    
    // Pattern: { status: status as any } -> { status: status as any } -> actually we can replace "status as any" with "status as any" - wait, we should replace it with the specific Prisma extension.
    // Wait, replacing Prisma Enums is tricky without knowing the exact enum name. Let's just do type un-casting. 
    // If it's update: { role: role as any }, it can just be update: { role: role as any }. No wait, we need to eliminate "as any".
    // Is it possible to use update: { role: __filename_enum }?
    
    // Pattern: (error as any).status
    content = content.replace(/\(error as any\)\.status/g, "(error as Error & { status?: number }).status");
    content = content.replace(/\(error as any\)\.validationErrors/g, "(error as Error & { validationErrors?: any }).validationErrors");
    content = content.replace(/\(customError as any\)\.status/g, "(customError as Error & { status?: number }).status");
    content = content.replace(/\(customError as any\)\.validationErrors/g, "(customError as Error & { validationErrors?: any }).validationErrors");

    // Pattern: (updatePayload as any)[key] = value;
    content = content.replace(/\(updatePayload as any\)\[key\] = value;/g, "(updatePayload as Record<string, any>)[key] = value;");

    // Pattern: as any[], used for building success arrays
    content = content.replace(/\[\] as any\[\],/g, "[] as Record<string, unknown>[],");
    
    // Pattern: status as any -> status as never (temporary hack just to remove any, but let's see if we can use a generic Prisma lookup)
    // Actually, s any on Prisma Where object properties like status as any is used because the local variable status is typed as string, but Prisma expects "Active" | "Inactive".
    // Let's use status as never? No, that causes a type error. status as any is a type bypass. 
    // What if we just bypass TS using // @ts-expect-error? No, the roadmap specifically says "eliminate s any bypasses". 

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
});
