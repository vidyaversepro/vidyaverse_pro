/**
 * Install a professional default ID-card template (HTML, CR80 landscape) for an
 * institution and mark it default. Idempotent — updates the existing id_card
 * STUDENT template if present, else creates one.
 * Run from backend/: npx tsx src/scripts/install-idcard-template.ts [institutionCode]
 */
import { prisma } from '../config/database.js';

const CODE = process.argv[2] || 'VG-010426';

const HTML = `<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  .card { width:85.6mm; height:53.98mm; font-family:'Segoe UI',Arial,Helvetica,sans-serif; color:#1f2937; background:#fff; position:relative; overflow:hidden; }
  .accent { position:absolute; top:0; left:0; right:0; height:1.2mm; background:#b7102a; }
  .hdr { display:flex; align-items:center; gap:2.2mm; padding:2.2mm 3mm 1.6mm; background:linear-gradient(90deg,#b7102a,#e63946); color:#fff; }
  .hdr .logo { height:9mm; width:9mm; object-fit:contain; background:#fff; border-radius:1mm; padding:0.4mm; flex:0 0 auto; }
  .hdr .logo-ph { height:9mm; width:9mm; background:rgba(255,255,255,.18); border-radius:1mm; flex:0 0 auto; }
  .hdr .it { line-height:1.08; min-width:0; }
  .hdr .it .nm { font-size:8.5pt; font-weight:800; letter-spacing:.2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .hdr .it .ad { font-size:4.6pt; opacity:.92; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .tag { position:absolute; top:3mm; right:3mm; font-size:4.4pt; font-weight:700; background:rgba(0,0,0,.18); padding:0.4mm 1mm; border-radius:0.8mm; letter-spacing:.5px; }
  .body { display:flex; gap:3mm; padding:2.4mm 3mm 0; }
  .photo { width:18mm; height:22mm; border:0.5mm solid #b7102a; border-radius:1mm; object-fit:cover; background:#f3f4f6; flex:0 0 auto; }
  .fields { flex:1; min-width:0; }
  .sname { font-size:8.5pt; font-weight:800; color:#b7102a; text-transform:uppercase; line-height:1.1; margin-bottom:1mm; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row { display:flex; font-size:5.6pt; line-height:1.5; }
  .row .k { width:13mm; color:#6b7280; font-weight:600; flex:0 0 auto; }
  .row .v { flex:1; color:#111827; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ftr { position:absolute; left:3mm; right:3mm; bottom:1.6mm; display:flex; align-items:flex-end; justify-content:space-between; }
  .valid { font-size:4.6pt; color:#6b7280; line-height:1.35; }
  .qr { width:12mm; height:12mm; }
  .sig { text-align:center; width:22mm; }
  .sig img { height:6mm; object-fit:contain; display:block; margin:0 auto 0.2mm; }
  .sig .ttl { font-size:4.8pt; color:#374151; font-weight:700; border-top:0.3mm solid #9ca3af; padding-top:0.4mm; }
</style>
<div class="card">
  <div class="accent"></div>
  <div class="hdr">
    {{#if institutionLogo}}<img class="logo" src="{{institutionLogo}}"/>{{else}}<div class="logo-ph"></div>{{/if}}
    <div class="it">
      <div class="nm">{{institutionName}}</div>
      <div class="ad">{{institutionAddress}}</div>
    </div>
    <div class="tag">STUDENT</div>
  </div>
  <div class="body">
    {{#if photoUrl}}<img class="photo" src="{{photoUrl}}"/>{{else}}<div class="photo"></div>{{/if}}
    <div class="fields">
      <div class="sname">{{studentName}}</div>
      <div class="row"><div class="k">Class</div><div class="v">{{className}}</div></div>
      <div class="row"><div class="k">Adm No</div><div class="v">{{admissionNo}}</div></div>
      <div class="row"><div class="k">DOB</div><div class="v">{{dob}}</div></div>
      <div class="row"><div class="k">Blood</div><div class="v">{{bloodGroup}}</div></div>
      <div class="row"><div class="k">Father</div><div class="v">{{fatherName}}</div></div>
      <div class="row"><div class="k">Phone</div><div class="v">{{phone}}</div></div>
    </div>
  </div>
  <div class="ftr">
    <div class="valid">Session {{academicYear}}<br/>Valid till {{validUntil}}</div>
    {{#if qrCode}}<img class="qr" src="{{qrCode}}"/>{{/if}}
    <div class="sig">
      {{#if principalSignature}}<img src="{{principalSignature}}"/>{{/if}}
      <div class="ttl">{{#if principalName}}{{principalName}} &middot; {{/if}}{{principalTitle}}</div>
    </div>
  </div>
</div>`;

async function main() {
    const inst = await prisma.institution.findFirst({ where: { code: CODE }, select: { id: true, name: true } });
    if (!inst) throw new Error(`Institution ${CODE} not found`);

    const existing = await prisma.template.findFirst({
        where: { institutionId: inst.id, serviceType: 'id_card', targetAudience: 'STUDENT' },
        orderBy: { updatedAt: 'desc' },
    });

    const data = {
        name: 'Student ID Card — Standard',
        serviceType: 'id_card' as const,
        templateType: 'html' as const,
        content: HTML,
        targetAudience: 'STUDENT' as const,
        widthMm: 85.6,
        heightMm: 53.98,
        orientation: 'landscape' as const,
        isDefault: true,
        isActive: true,
    };

    // Make sure no other STUDENT id_card template stays default.
    await prisma.template.updateMany({
        where: { institutionId: inst.id, serviceType: 'id_card', targetAudience: 'STUDENT', isDefault: true },
        data: { isDefault: false },
    });

    let tpl;
    if (existing) {
        tpl = await prisma.template.update({ where: { id: existing.id }, data });
    } else {
        tpl = await prisma.template.create({ data: { ...data, institutionId: inst.id } });
    }
    console.log(`✅ Installed template "${tpl.name}" (${tpl.id}) for ${inst.name} — default=${tpl.isDefault}, type=${tpl.templateType}`);
}

main()
    .then(async () => { await prisma.$disconnect(); process.exit(0); })
    .catch(async (e) => { console.error('❌ FAILED:', e); await prisma.$disconnect(); process.exit(1); });
