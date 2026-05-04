import fs from 'fs';

// user/service.ts
let content = fs.readFileSync('src/modules/user/service.ts', 'utf8');
content = content.replace(/role: params\.role/g, "role: params.role as import('@prisma/client').InstitutionRole");
content = content.replace(/role: role\b/g, "role: role as import('@prisma/client').InstitutionRole");
fs.writeFileSync('src/modules/user/service.ts', content);

// social/service.ts
content = fs.readFileSync('src/modules/social/service.ts', 'utf8');
content = content.replace(/relationshipType: data\.relationshipType/g, "relationshipType: data.relationshipType as import('@prisma/client').SocialRelationshipType");
content = content.replace(/relationshipType: inverseType/g, "relationshipType: inverseType as import('@prisma/client').SocialRelationshipType");
content = content.replace(/status: status/g, "status: status as import('@prisma/client').SaathiLinkStatus");
fs.writeFileSync('src/modules/social/service.ts', content);

// student/service.ts
content = fs.readFileSync('src/modules/student/service.ts', 'utf8');
content = content.replace(/status: params\.status/g, "status: params.status as import('@prisma/client').StudentStatus");
content = content.replace(/sex: data\.sex/g, "sex: data.sex as import('@prisma/client').Sex");
content = content.replace(/sex: row\.sex/g, "sex: row.sex as import('@prisma/client').Sex");
fs.writeFileSync('src/modules/student/service.ts', content);

// transfer-certificates
content = fs.readFileSync('src/modules/transfer-certificates/transfer-certificate.service.ts', 'utf8');
content = content.replace(/status: status/g, "status: status as import('@prisma/client').TransferCertificateStatus");
fs.writeFileSync('src/modules/transfer-certificates/transfer-certificate.service.ts', content);

// hall-tickets
content = fs.readFileSync('src/modules/hall-tickets/hall-ticket.service.ts', 'utf8');
content = content.replace(/status: status/g, "status: status as import('@prisma/client').HallTicketStatus");
fs.writeFileSync('src/modules/hall-tickets/hall-ticket.service.ts', content);

// marksheets
if (fs.existsSync('src/modules/marksheets/marksheet.service.ts')) {
    content = fs.readFileSync('src/modules/marksheets/marksheet.service.ts', 'utf8');
    content = content.replace(/status: status/g, "status: status as import('@prisma/client').MarksheetStatus");
    fs.writeFileSync('src/modules/marksheets/marksheet.service.ts', content);
}

// library-cards
if (fs.existsSync('src/modules/library-cards/library-card.service.ts')) {
    content = fs.readFileSync('src/modules/library-cards/library-card.service.ts', 'utf8');
    content = content.replace(/status: status/g, "status: status as import('@prisma/client').LibraryCardStatus");
    fs.writeFileSync('src/modules/library-cards/library-card.service.ts', content);
}

// id-cards
if (fs.existsSync('src/modules/id-card/service.ts')) {
    content = fs.readFileSync('src/modules/id-card/service.ts', 'utf8');
    content = content.replace(/status: params\.status/g, "status: params.status as import('@prisma/client').IdCardStatus");
    fs.writeFileSync('src/modules/id-card/service.ts', content);
}

// attendance
if (fs.existsSync('src/modules/attendance/attendance.service.ts')) {
    content = fs.readFileSync('src/modules/attendance/attendance.service.ts', 'utf8');
    content = content.replace(/status: params\.status/g, "status: params.status as import('@prisma/client').AttendanceStatus");
    fs.writeFileSync('src/modules/attendance/attendance.service.ts', content);
}

// portfolios
if (fs.existsSync('src/modules/portfolios/portfolio.service.ts')) {
    content = fs.readFileSync('src/modules/portfolios/portfolio.service.ts', 'utf8');
    content = content.replace(/defaultSections as import\('@prisma\/client'\)\.Prisma\.InputJsonValue\[\]/g, "defaultSections as Record<string, any>[]");
    fs.writeFileSync('src/modules/portfolios/portfolio.service.ts', content);
}

// group-photos
if (fs.existsSync('src/modules/group-photo/service.ts')) {
    content = fs.readFileSync('src/modules/group-photo/service.ts', 'utf8');
    content = content.replace(/extractions as import\('@prisma\/client'\)\.Prisma\.InputJsonValue/g, "extractions as any[]");
    fs.writeFileSync('src/modules/group-photo/service.ts', content);
}

console.log("Fixed manually!");
