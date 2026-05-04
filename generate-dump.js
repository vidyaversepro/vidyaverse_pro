const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const outputFilePath = path.join(rootDir, 'vidyaverse-pro-dump.md');

// Directories and files to completely ignore
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.husky', 'coverage', '.next'];
// Binary and auto-generated files to skip content but note
const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.tar', '.gz'];

// Helper to generate tree
function generateTree(dir, prefix = '') {
    let treeStr = '';
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    // Sort directories first, then files
    items.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (ignoreDirs.includes(item.name)) continue;

        const isLast = i === items.length - 1;
        const pointer = isLast ? '└── ' : '├── ';
        treeStr += `${prefix}${pointer}${item.name}\n`;

        if (item.isDirectory()) {
            treeStr += generateTree(path.join(dir, item.name), prefix + (isLast ? '    ' : '│   '));
        }
    }
    return treeStr;
}

// Helper to collect all file paths
function getAllFiles(dir, fileList = []) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        if (ignoreDirs.includes(item.name)) continue;
        
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            getAllFiles(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

function generateDump() {
    console.log('Generating codebase dump...');
    let md = '# Vidyaverse Pro - Full Codebase Export\n\n';

    // STEP 1 - Full Directory Tree
    md += '## STEP 1 — Full Directory Tree\n\n```\n';
    md += 'vidyaverse-pro/\n';
    md += generateTree(rootDir);
    md += '```\n\n';

    // STEP 2 - File-by-File Source Code Dump
    md += '## STEP 2 — File-by-File Source Code Dump\n\n';
    const allFiles = getAllFiles(rootDir);
    
    for (const file of allFiles) {
        const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
        const ext = path.extname(file).toLowerCase();
        
        md += `=== FILE: ${relativePath} ===\n`;
        
        if (binaryExtensions.includes(ext) || relativePath.includes('package-lock.json') || relativePath.includes('pnpm-lock.yaml') || relativePath.includes('ts_errors.log')) {
            md += `[Binary or Lock file - Content Skipped]\n`;
        } else if (relativePath.includes('generated') && relativePath.includes('prisma')) {
            md += `[Auto-generated Prisma Client - Content Skipped]\n`;
        } else {
            try {
                const content = fs.readFileSync(file, 'utf8');
                md += content;
                if (!content.endsWith('\n')) md += '\n';
            } catch (err) {
                md += `[Error reading file: ${err.message}]\n`;
            }
        }
        md += `=== END FILE ===\n\n`;
    }

    // STEP 3 - Environment & Config Checklist
    md += `## STEP 3 — Environment & Config Checklist

### 1. Complete \`.env\` variable list
(Extracting keys from .env.example)
\`\`\`env
`;
    try {
        const envContent = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf8');
        md += envContent;
    } catch(e) {
        md += "No .env.example found\n";
    }
    md += `\`\`\`

### 2. Docker Compose service map
Services typically include:
- \`mysql\` / \`postgres\`: Database on port 3306/5432
- \`redis\`: Cache/Queue on port 6379
- \`minio\`: Object storage on port 9000 & 9001
Check \`docker-compose.yml\` contents above for exact ports and health checks.

### 3. Database seed summary
Please refer to \`backend/prisma/seed.ts\` in the dump above for exact seed details. Typically includes Super Admin user and basic roles.

### 4. Known issues or TODOs
Files marked as incomplete:
`;
    const stubs = allFiles.filter(f => {
        try {
            return fs.readFileSync(f, 'utf8').includes('TODO: INCOMPLETE');
        } catch { return false; }
    });
    if (stubs.length > 0) {
        stubs.forEach(s => {
            md += `- ${path.relative(rootDir, s).replace(/\\/g, '/')}\n`;
        });
    } else {
        md += "No files explicitly marked with `// TODO: INCOMPLETE` found.\n";
    }

    md += `\n## STEP 4 — Deployment Readiness Checklist

- [ ] All environment variables set
- [ ] Docker containers running and healthy
- [ ] Prisma schema pushed / migrations run
- [ ] MinIO buckets created
- [ ] Seed data loaded
- [ ] SMTP credentials configured
- [ ] CORS origins correct (FRONTEND_URL)
- [ ] Auth secrets generated (JWT_SECRET, BETTER_AUTH_SECRET)
- [ ] Frontend API base URL pointing to backend
- [ ] Production docker-compose configured

## STEP 5 — Test Coverage Summary
Please review \`package.json\` and \`vitest.config.ts\` in the frontend and backend for testing setup. Typical command to run tests:
\`npm run test\` or \`pnpm test\`
`;

    fs.writeFileSync(outputFilePath, md);
    console.log(`Dump generated successfully at: ${outputFilePath}`);
}

generateDump();
