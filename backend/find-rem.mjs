import fs from 'fs';
const lines = fs.readFileSync('ts_errors_rem_utf8.txt', 'utf8').split('\n');
const touched = ['auth.plugin', 'user/service', 'social/', 'student/', 'transfer-certificate', 'group-photo', 'hall-ticket.service', 'id-card/', 'attendance.service', 'institution/', 'visionarium/', 'workers/index'];
const remaining = lines.filter(l => touched.some(t => l.includes(t)) && l.includes('error TS'));
console.log(remaining.join('\n'));
