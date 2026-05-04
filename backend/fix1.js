const fs = require('fs');
let content = fs.readFileSync('src/modules/user/service.ts', 'utf8');
content = content.replace(/role: params\.role/g, "role: params.role as import('@prisma/client').InstitutionRole");
content = content.replace(/role: role\b/g, "role: role as import('@prisma/client').InstitutionRole");
fs.writeFileSync('src/modules/user/service.ts', content);
