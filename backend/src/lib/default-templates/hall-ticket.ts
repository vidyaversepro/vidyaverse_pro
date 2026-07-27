/**
 * Curated default HALL TICKET / ADMIT CARD (HTML/Handlebars), A4 portrait.
 * Tabular: dynamic exam schedule rows.
 *
 * CONTRACT: branding flat (institutionName, institutionAddress, institutionLogo,
 *   principalSignature, principalName, principalTitle) + studentName, studentPhoto(dataURI),
 *   admissionNumber, rollNo, className, examName, academicYear, examCenter,
 *   qrCode(dataURI), schedule[]: { date, day, subject, time }, instructions[] (strings).
 * Fonts/reset injected by document-base.
 */
export const HALL_TICKET_HTML = `<style>
  .ht{padding:12mm 12mm 14mm;font-size:9.5pt;}
  .frame{border:0.6mm solid #b7102a;border-radius:2.5mm;padding:6mm;}
  .hdr{display:flex;align-items:center;gap:5mm;border-bottom:0.8mm solid #b7102a;padding-bottom:4mm;}
  .hdr .logo{width:20mm;height:20mm;object-fit:contain;}
  .hdr .nm{font-size:17pt;font-weight:700;color:#b7102a;line-height:1.05;}
  .hdr .ad{font-size:8.5pt;color:#6b7280;}
  .title{text-align:center;font-weight:700;font-size:13pt;margin:4mm 0 1mm;letter-spacing:.5px;}
  .sub{text-align:center;font-size:9pt;color:#6b7280;margin-bottom:4mm;}
  .row{display:flex;gap:6mm;}
  .info{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:1.4mm 6mm;font-size:9.5pt;align-content:start;}
  .info .k{color:#6b7280;} .info b{color:#111827;}
  .photo{width:28mm;height:34mm;border:0.4mm solid #b7102a;border-radius:1mm;object-fit:cover;background:#f3f4f6;flex:0 0 auto;}
  table{width:100%;border-collapse:collapse;font-size:9.5pt;margin-top:5mm;}
  thead{display:table-header-group;}
  thead th{background:#b7102a;color:#fff;padding:2mm;border:0.3mm solid #b7102a;text-align:left;}
  th.c,td.c{text-align:center;}
  tbody td{padding:1.8mm 2mm;border:0.3mm solid #e5e7eb;}
  tbody tr{break-inside:avoid;}
  tbody tr:nth-child(even){background:#fbfbfc;}
  .instr{margin-top:5mm;font-size:8.5pt;color:#374151;}
  .instr .h{font-weight:700;color:#b7102a;margin-bottom:1.5mm;}
  .instr li{margin:0 0 1mm 5mm;}
  .ftr{margin-top:12mm;display:flex;justify-content:space-between;align-items:flex-end;}
  .ftr .qr{text-align:center;font-size:7pt;color:#6b7280;}
  .ftr .qr img{width:18mm;height:18mm;display:block;}
  .sig{text-align:center;font-size:8.5pt;}
  .sig img{height:12mm;object-fit:contain;display:block;margin:0 auto 1mm;}
  .sig .line{border-top:0.4mm solid #374151;padding-top:1mm;min-width:42mm;font-weight:600;}
</style>
<div class="ht"><div class="frame">
  <div class="hdr">
    {{#if institutionLogo}}<img class="logo" src="{{institutionLogo}}"/>{{/if}}
    <div><div class="nm">{{institutionName}}</div><div class="ad">{{institutionAddress}}</div></div>
  </div>
  <div class="title">ADMIT CARD &middot; प्रवेश पत्र</div>
  <div class="sub">{{examName}} — Academic Year {{academicYear}}</div>
  <div class="row">
    <div class="info">
      <div><span class="k">Name / नाम:</span> <b>{{studentName}}</b></div>
      <div><span class="k">Roll No / अनुक्रमांक:</span> <b>{{rollNo}}</b></div>
      <div><span class="k">Adm. No / प्रवेश सं.:</span> {{admissionNumber}}</div>
      <div><span class="k">Class / कक्षा:</span> {{className}}</div>
      <div><span class="k">Centre / केंद्र:</span> {{examCenter}}</div>
      <div><span class="k">Session / सत्र:</span> {{academicYear}}</div>
    </div>
    {{#if studentPhoto}}<img class="photo" src="{{studentPhoto}}"/>{{else}}<div class="photo"></div>{{/if}}
  </div>
  <table>
    <thead><tr><th class="c" style="width:26mm">Date / दिनांक</th><th style="width:26mm">Day / दिन</th><th>Subject / विषय</th><th class="c" style="width:40mm">Timing / समय</th></tr></thead>
    <tbody>
      {{#each schedule}}<tr><td class="c">{{date}}</td><td>{{day}}</td><td>{{subject}}</td><td class="c">{{time}}</td></tr>{{/each}}
    </tbody>
  </table>
  <div class="instr">
    <div class="h">निर्देश / Instructions</div>
    <ul>
      {{#if instructions}}{{#each instructions}}<li>{{this}}</li>{{/each}}
      {{else}}<li>परीक्षा प्रारंभ होने से 30 मिनट पूर्व उपस्थित हों। / Report 30 minutes before the exam.</li>
      <li>यह प्रवेश पत्र अनिवार्य है। / This admit card is mandatory for entry.</li>
      <li>मोबाइल फोन व अन्य इलेक्ट्रॉनिक उपकरण वर्जित हैं। / Mobile phones & electronic devices are prohibited.</li>{{/if}}
    </ul>
  </div>
  <div class="ftr">
    <div class="qr">{{#if qrCode}}<img src="{{qrCode}}"/>{{/if}}<div>Verify</div></div>
    <div class="sig"><div class="line">Candidate / परीक्षार्थी</div></div>
    <div class="sig">{{#if principalSignature}}<img src="{{principalSignature}}"/>{{/if}}<div class="line">{{#if principalName}}{{principalName}} &middot; {{/if}}{{default principalTitle "Controller of Exams"}}</div></div>
  </div>
</div></div>`;
