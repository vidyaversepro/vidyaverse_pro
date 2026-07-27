/**
 * Curated default MARKSHEET template (HTML/Handlebars), A4 portrait.
 *
 * DATA CONTRACT (provided by marksheets/marksheet.service.ts templateData):
 *   student: { name, admissionNumber, fatherName, motherName, dob }
 *   class:   { name }            section: { name }    stream: { name }
 *   examName, academicYear
 *   subjects[]: { subjectName, maxMarks, marksObtained, percentage, grade }
 *   results: { totalMarks, maxMarks, percentage, grade, result, marksheetNumber, qrCode(dataURI) }
 *   branding (flat, unified across all docs): institutionName, institutionAddress,
 *            institutionLogo(dataURI), principalSignature(dataURI), principalName,
 *            principalTitle, schoolSeal(dataURI)
 *
 * Fonts + reset are injected by lib/document-base.ts — do not embed fonts here.
 */
export const MARKSHEET_HTML = `<style>
  .ms{padding:12mm 12mm 14mm;font-size:9.5pt;}
  .frame{border:0.6mm solid #b7102a;border-radius:2.5mm;padding:6mm;position:relative;overflow:hidden;}
  .wm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.05;pointer-events:none;}
  .wm img{width:95mm;height:95mm;object-fit:contain;}
  .hdr{display:flex;align-items:center;gap:5mm;border-bottom:0.8mm solid #b7102a;padding-bottom:4mm;position:relative;}
  .hdr .logo{width:20mm;height:20mm;object-fit:contain;}
  .hdr .nm{font-size:17pt;font-weight:700;color:#b7102a;line-height:1.05;}
  .hdr .ad{font-size:8.5pt;color:#6b7280;}
  .title{text-align:center;font-weight:700;font-size:12pt;margin:4mm 0 1mm;letter-spacing:.3px;}
  .sub{text-align:center;font-size:9pt;color:#6b7280;margin-bottom:4mm;}
  .info{display:grid;grid-template-columns:1.3fr 1fr;gap:1.2mm 8mm;font-size:9.5pt;margin-bottom:4mm;position:relative;}
  .info .k{color:#6b7280;} .info b{color:#111827;}
  table{width:100%;border-collapse:collapse;font-size:9.5pt;position:relative;}
  thead{display:table-header-group;}
  thead th{background:#b7102a;color:#fff;padding:2mm;border:0.3mm solid #b7102a;text-align:left;font-weight:700;}
  th.c,td.c{text-align:center;}
  tbody td{padding:1.7mm 2mm;border:0.3mm solid #e5e7eb;}
  tbody tr{break-inside:avoid;}
  tbody tr:nth-child(even){background:#fbfbfc;}
  tr.tot td{font-weight:700;background:#fde68a;border-color:#f59e0b;}
  .summary{display:flex;gap:3mm;margin-top:5mm;}
  .summary .box{flex:1;border:0.3mm solid #e5e7eb;border-radius:1.5mm;padding:2.5mm 3mm;text-align:center;}
  .summary .box .lab{font-size:7.5pt;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;}
  .summary .box .val{font-size:13pt;font-weight:700;color:#b7102a;}
  .summary .box.pass .val{color:#16a34a;}
  .ftr{margin-top:14mm;display:flex;justify-content:space-between;align-items:flex-end;}
  .ftr .qr{text-align:center;font-size:7pt;color:#6b7280;}
  .ftr .qr img{width:18mm;height:18mm;display:block;}
  .sig{text-align:center;font-size:8.5pt;}
  .sig img{height:12mm;object-fit:contain;display:block;margin:0 auto 1mm;}
  .sig .line{border-top:0.4mm solid #374151;padding-top:1mm;min-width:42mm;font-weight:600;}
  .verify{text-align:center;font-size:7pt;color:#9ca3af;margin-top:6mm;}
</style>
<div class="ms"><div class="frame">
  {{#if schoolSeal}}<div class="wm"><img src="{{schoolSeal}}"/></div>{{/if}}
  <div class="hdr">
    {{#if institutionLogo}}<img class="logo" src="{{institutionLogo}}"/>{{/if}}
    <div><div class="nm">{{institutionName}}</div><div class="ad">{{institutionAddress}}</div></div>
  </div>
  <div class="title">STATEMENT OF MARKS &middot; अंक-पत्र</div>
  <div class="sub">{{examName}} — Academic Year {{academicYear}}</div>
  <div class="info">
    <div><span class="k">Name / नाम:</span> <b>{{student.name}}</b></div>
    <div><span class="k">Roll / Adm. No:</span> <b>{{student.admissionNumber}}</b></div>
    <div><span class="k">Father / पिता:</span> {{student.fatherName}}</div>
    <div><span class="k">Class / कक्षा:</span> {{class.name}}{{#if section.name}} - {{section.name}}{{/if}}</div>
    <div><span class="k">Mother / माता:</span> {{student.motherName}}</div>
    <div><span class="k">DOB / जन्म तिथि:</span> {{formatDate student.dob "dd/MM/yyyy"}}</div>
  </div>
  <table>
    <thead><tr>
      <th class="c" style="width:8mm">#</th><th>Subject / विषय</th>
      <th class="c" style="width:18mm">Max</th><th class="c" style="width:22mm">Obtained</th>
      <th class="c" style="width:14mm">%</th><th class="c" style="width:16mm">Grade</th>
    </tr></thead>
    <tbody>
      {{#each subjects}}
      <tr><td class="c">{{inc @index}}</td><td>{{subjectName}}</td><td class="c">{{maxMarks}}</td><td class="c">{{marksObtained}}</td><td class="c">{{percentage}}</td><td class="c">{{grade}}</td></tr>
      {{/each}}
      <tr class="tot"><td></td><td>Total / कुल योग</td><td class="c">{{results.maxMarks}}</td><td class="c">{{results.totalMarks}}</td><td class="c">{{results.percentage}}</td><td class="c">{{results.grade}}</td></tr>
    </tbody>
  </table>
  <div class="summary">
    <div class="box"><div class="lab">Percentage</div><div class="val">{{results.percentage}}%</div></div>
    <div class="box"><div class="lab">Grade</div><div class="val">{{results.grade}}</div></div>
    <div class="box pass"><div class="lab">Result</div><div class="val">{{default results.result "PASS"}}</div></div>
  </div>
  <div class="ftr">
    <div class="qr">{{#if results.qrCode}}<img src="{{results.qrCode}}"/>{{/if}}<div>Scan to verify</div></div>
    <div class="sig"><div class="line">Class Teacher / कक्षाध्यापक</div></div>
    <div class="sig">{{#if principalSignature}}<img src="{{principalSignature}}"/>{{/if}}<div class="line">{{#if principalName}}{{principalName}} &middot; {{/if}}{{default principalTitle "Principal"}} / प्रधानाचार्य</div></div>
  </div>
  <div class="verify">Marksheet No: {{results.marksheetNumber}} &middot; This is a computer-generated document.</div>
</div></div>`;
