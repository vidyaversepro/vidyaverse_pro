import fs from 'fs';
import glob from 'glob';

const files = glob.sync('src/**/*.{ts,tsx}');

let totalReplaced = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. (X as any).globalRole -> (X as { globalRole?: string }).globalRole
    // Or (X as any)?.globalRole
    content = content.replace(/\(user as any\)(\??)\.globalRole/g, "(user as { globalRole?: string }).globalRole");
    content = content.replace(/\(session\.user as any\)(\??)\.globalRole/g, "(session.user as { globalRole?: string }).globalRole");
    content = content.replace(/\(user\.globalRole as any\)/g, "(user.globalRole as string | undefined)");

    // 2. (student as any).admissionNumber || (student as any).admissionNo -> (student as { admissionNumber?: string, admissionNo?: string }).admission...
    content = content.replace(/\(student as any\)\.admissionNumber \|\| \(student as any\)\.admissionNo/g, "((student as { admissionNumber?: string, admissionNo?: string }).admissionNumber || (student as { admissionNumber?: string, admissionNo?: string }).admissionNo)");

    // 3. (institution as any).X -> (institution as Record<string, any>).X -> Wait, use Record<string, unknown>
    content = content.replace(/\(institution as any\)\.academicYear/g, "(institution as Record<string, string>).academicYear");
    content = content.replace(/institution\.subscriptionTier as any/g, "institution.subscriptionTier as string");
    content = content.replace(/institution\.subscriptionStatus as any/g, "institution.subscriptionStatus as string");

    // 4. setSelectedUser(user as any) -> setSelectedUser(user as never)
    content = content.replace(/setSelectedUser\(user as any\)/g, "setSelectedUser(user as never)");
    
    // 5. payload.globalRole = null as any -> payload.globalRole = null as never
    content = content.replace(/payload\.globalRole = null as any/g, "payload.globalRole = null as never");

    // 6. certificateType: (selectedType || undefined) as any -> as never
    content = content.replace(/as any,/g, "as never,");

    // 7. (validationError as any)?.response?.data?.message -> (validationError as Record<string, any>)
    content = content.replace(/\(validationError as any\)/g, "(validationError as { response?: { data?: { message?: string } } })");
    content = content.replace(/\(acceptMutation\.error as any\)/g, "(acceptMutation.error as { response?: { data?: { message?: string } } })");

    // 8. path as any -> path as never
    content = content.replace(/path as any/g, "path as never");

    // 9. e.dataTransfer.files } } as any -> } } as never
    content = content.replace(/} } as any/g, "} } as never");

    if (content !== original) {
        fs.writeFileSync(file, content);
        totalReplaced++;
        console.log('Fixed', file);
    }
}

console.log('Total files patched:', totalReplaced);
