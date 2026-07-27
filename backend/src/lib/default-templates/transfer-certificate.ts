/**
 * Curated default TRANSFER CERTIFICATE (HTML/Handlebars), A4 portrait, formal.
 *
 * CONTRACT: branding flat (institutionName, institutionAddress, institutionLogo,
 *   principalSignature, principalName, principalTitle, schoolSeal) + studentName,
 *   fatherName, motherName, dob, dobWords, admissionNumber, admissionDate,
 *   leavingDate, className, lastClassStudied, conduct, reason, remarks,
 *   tcNumber, place, issueDate, academicYear.
 * Fonts/reset injected by document-base.
 */
export const TRANSFER_CERTIFICATE_HTML = `<style>
  .tc{padding:12mm 14mm 14mm;font-size:10pt;}
  .frame{border:0.6mm solid #b7102a;border-radius:2.5mm;padding:7mm;position:relative;overflow:hidden;}
  .wm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.05;pointer-events:none;}
  .wm img{width:90mm;height:90mm;object-fit:contain;}
  .hdr{display:flex;align-items:center;gap:5mm;border-bottom:0.8mm solid #b7102a;padding-bottom:4mm;position:relative;}
  .hdr .logo{width:20mm;height:20mm;object-fit:contain;}
  .hdr .nm{font-size:18pt;font-weight:700;color:#b7102a;line-height:1.05;}
  .hdr .ad{font-size:8.5pt;color:#6b7280;}
  .meta{display:flex;justify-content:space-between;font-size:9pt;color:#374151;margin:3mm 0;}
  .title{text-align:center;font-weight:700;font-size:13pt;letter-spacing:.5px;margin:2mm 0 6mm;text-decoration:underline;text-underline-offset:3px;}
  ol.fields{list-style:none;counter-reset:f;position:relative;}
  ol.fields li{counter-increment:f;display:flex;padding:1.6mm 0;border-bottom:0.2mm dotted #d1d5db;font-size:10pt;}
  ol.fields li::before{content:counter(f) ".";width:7mm;color:#6b7280;flex:0 0 auto;}
  ol.fields .k{flex:0 0 62mm;color:#374151;}
  ol.fields .v{flex:1;font-weight:600;color:#111827;}
  .ftr{margin-top:14mm;display:flex;justify-content:space-between;align-items:flex-end;}
  .ftr .meta2{font-size:9.5pt;color:#374151;}
  .sig{text-align:center;font-size:9pt;}
  .sig img{height:13mm;object-fit:contain;display:block;margin:0 auto 1mm;}
  .sig .line{border-top:0.4mm solid #374151;padding-top:1mm;min-width:48mm;font-weight:600;}
  .note{text-align:center;font-size:7.5pt;color:#9ca3af;margin-top:6mm;}
</style>
<div class="tc"><div class="frame">
  {{#if schoolSeal}}<div class="wm"><img src="{{schoolSeal}}"/></div>{{/if}}
  <div class="hdr">
    {{#if institutionLogo}}<img class="logo" src="{{institutionLogo}}"/>{{/if}}
    <div><div class="nm">{{institutionName}}</div><div class="ad">{{institutionAddress}}</div></div>
  </div>
  <div class="meta"><span>T.C. No / क्र.सं.: <b>{{tcNumber}}</b></span><span>प्रवेश सं. / Adm. No: <b>{{admissionNumber}}</b></span></div>
  <div class="title">TRANSFER CERTIFICATE &middot; स्थानांतरण प्रमाण-पत्र</div>
  <ol class="fields">
    <li><span class="k">छात्र का नाम / Name of Student</span><span class="v">{{studentName}}</span></li>
    <li><span class="k">पिता का नाम / Father's Name</span><span class="v">{{fatherName}}</span></li>
    <li><span class="k">माता का नाम / Mother's Name</span><span class="v">{{motherName}}</span></li>
    <li><span class="k">जन्म तिथि / Date of Birth</span><span class="v">{{dob}}{{#if dobWords}} ({{dobWords}}){{/if}}</span></li>
    <li><span class="k">प्रवेश तिथि / Date of Admission</span><span class="v">{{admissionDate}}</span></li>
    <li><span class="k">अध्ययनरत कक्षा / Class Studied</span><span class="v">{{lastClassStudied}}{{#unless lastClassStudied}}{{className}}{{/unless}}</span></li>
    <li><span class="k">विद्यालय छोड़ने की तिथि / Date of Leaving</span><span class="v">{{leavingDate}}</span></li>
    <li><span class="k">छोड़ने का कारण / Reason for Leaving</span><span class="v">{{reason}}</span></li>
    <li><span class="k">आचरण / Conduct</span><span class="v">{{default conduct "Good"}}</span></li>
    <li><span class="k">सत्र / Academic Session</span><span class="v">{{academicYear}}</span></li>
    <li><span class="k">टिप्पणी / Remarks</span><span class="v">{{default remarks "—"}}</span></li>
  </ol>
  <div class="ftr">
    <div class="meta2">दिनांक / Date: <b>{{issueDate}}</b><br/>स्थान / Place: <b>{{place}}</b></div>
    <div class="sig">{{#if principalSignature}}<img src="{{principalSignature}}"/>{{/if}}<div class="line">{{#if principalName}}{{principalName}} &middot; {{/if}}{{default principalTitle "Principal"}} / प्रधानाचार्य</div></div>
  </div>
  <div class="note">This is a computer-generated transfer certificate. T.C. No: {{tcNumber}}</div>
</div></div>`;
