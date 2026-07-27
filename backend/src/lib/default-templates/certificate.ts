/**
 * Curated default CERTIFICATE template (HTML/Handlebars), A4 LANDSCAPE, ornamental.
 * Works for character / merit / participation / provisional certificates.
 *
 * CONTRACT: branding flat (institutionName, institutionAddress, institutionLogo,
 *   principalSignature, principalName, principalTitle, schoolSeal) +
 *   certificateTitle, bodyHtml (safe), studentName, className, academicYear,
 *   place, issueDate, certificateNumber.
 * Fonts/reset injected by document-base.
 */
export const CERTIFICATE_HTML = `<style>
  .cert{width:297mm;height:210mm;padding:8mm;}
  .edge{height:100%;border:1.2mm solid #b7102a;border-radius:3mm;padding:3mm;}
  .inner{height:100%;border:0.4mm solid #c79a3a;border-radius:2mm;padding:10mm 16mm;position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;}
  .corner{position:absolute;width:14mm;height:14mm;border:1mm solid #c79a3a;}
  .corner.tl{top:3mm;left:3mm;border-right:0;border-bottom:0;}
  .corner.tr{top:3mm;right:3mm;border-left:0;border-bottom:0;}
  .corner.bl{bottom:3mm;left:3mm;border-right:0;border-top:0;}
  .corner.br{bottom:3mm;right:3mm;border-left:0;border-top:0;}
  .wm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.06;pointer-events:none;}
  .wm img{width:120mm;height:120mm;object-fit:contain;}
  .top{display:flex;align-items:center;gap:4mm;}
  .top img{width:18mm;height:18mm;object-fit:contain;}
  .top .nm{font-size:18pt;font-weight:700;color:#b7102a;line-height:1.05;}
  .top .ad{font-size:8.5pt;color:#6b7280;}
  .ttl{font-size:30pt;font-weight:700;letter-spacing:1px;color:#1f2937;margin-top:8mm;}
  .ttl span{color:#b7102a;}
  .rule{width:55mm;height:0.8mm;background:#c79a3a;margin:3mm auto 6mm;}
  .body{font-size:13pt;line-height:2;max-width:210mm;color:#374151;}
  .body .who{font-size:18pt;font-weight:700;color:#b7102a;border-bottom:0.3mm dashed #c79a3a;padding:0 4mm 1mm;}
  .ftr{margin-top:auto;width:100%;display:flex;justify-content:space-between;align-items:flex-end;padding-top:8mm;}
  .meta{font-size:9.5pt;color:#374151;text-align:left;}
  .sig{text-align:center;font-size:9.5pt;}
  .sig img{height:14mm;object-fit:contain;display:block;margin:0 auto 1mm;}
  .sig .line{border-top:0.4mm solid #374151;padding-top:1mm;min-width:55mm;font-weight:600;}
</style>
<div class="cert"><div class="edge"><div class="inner">
  <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
  {{#if schoolSeal}}<div class="wm"><img src="{{schoolSeal}}"/></div>{{/if}}
  <div class="top">
    {{#if institutionLogo}}<img src="{{institutionLogo}}"/>{{/if}}
    <div><div class="nm">{{institutionName}}</div><div class="ad">{{institutionAddress}}</div></div>
  </div>
  <div class="ttl">CERTIFICATE OF <span>{{default certificateTitle "ACHIEVEMENT"}}</span></div>
  <div class="rule"></div>
  <div class="body">
    This is to certify that <span class="who">{{studentName}}</span><br/>
    {{#if bodyHtml}}{{{bodyHtml}}}{{else}}of Class {{className}} has displayed exemplary conduct and performance during the academic year {{academicYear}}, and is hereby awarded this certificate in recognition of the same.{{/if}}
  </div>
  <div class="ftr">
    <div class="meta">दिनांक / Date: <b>{{issueDate}}</b><br/>स्थान / Place: <b>{{place}}</b>{{#if certificateNumber}}<br/>Cert. No: {{certificateNumber}}{{/if}}</div>
    <div class="sig">{{#if principalSignature}}<img src="{{principalSignature}}"/>{{/if}}<div class="line">{{#if principalName}}{{principalName}} &middot; {{/if}}{{default principalTitle "Principal"}} / प्रधानाचार्य</div></div>
  </div>
</div></div></div>`;
