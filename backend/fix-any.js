const fs = require('fs');
const path = require('path');

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

    // Pattern 1: userId extraction in controllers
    content = content.replace(
        /const userId = \(request as any\)\.userId \|\| request.user\?\.id;/g,
        "const userId = request.user?.userId;\n        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });"
    );

    // Pattern 2: request.body as any
    content = content.replace(
        /const body = request\.body as any;/g,
        "const body = request.body as Record<string, unknown>;"
    );

    // Pattern 3: (request as any).file()
    content = content.replace(
        /await \(request as any\)\.file\(\)/g,
        "await (request as import('fastify').FastifyRequest & { file: () => Promise<any> }).file()"
    );

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
});
