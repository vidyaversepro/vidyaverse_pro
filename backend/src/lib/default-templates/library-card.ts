/**
 * Curated default LIBRARY CARD (HTML/Handlebars), CR80 landscape (85.6×54mm).
 *
 * CONTRACT: branding flat (institutionName, institutionLogo) + studentName,
 *   studentPhoto(dataURI), libraryId, admissionNumber, className, validUntil, qrCode(dataURI).
 * Fonts/reset injected by document-base.
 */
export const LIBRARY_CARD_HTML = `<style>
  .card{width:85.6mm;height:53.98mm;background:#fff;position:relative;overflow:hidden;font-family:'NotoLatin','NotoDeva',sans-serif;}
  .accent{position:absolute;top:0;left:0;right:0;height:1.2mm;background:#0e7490;}
  .hdr{display:flex;align-items:center;gap:2.2mm;padding:2.4mm 3mm 1.6mm;background:linear-gradient(90deg,#0e7490,#0891b2);color:#fff;}
  .hdr .logo{height:9mm;width:9mm;object-fit:contain;background:#fff;border-radius:1mm;padding:0.4mm;flex:0 0 auto;}
  .hdr .logo-ph{height:9mm;width:9mm;background:rgba(255,255,255,.18);border-radius:1mm;flex:0 0 auto;}
  .hdr .it{min-width:0;line-height:1.08;}
  .hdr .nm{font-size:8.5pt;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .tag{position:absolute;top:3mm;right:3mm;font-size:4.6pt;font-weight:700;background:rgba(0,0,0,.18);padding:0.4mm 1mm;border-radius:.8mm;letter-spacing:.5px;}
  .body{display:flex;gap:3mm;padding:2.4mm 3mm 0;}
  .photo{width:16mm;height:20mm;border:0.5mm solid #0e7490;border-radius:1mm;object-fit:cover;background:#f3f4f6;flex:0 0 auto;}
  .fields{flex:1;min-width:0;font-size:6pt;line-height:1.5;}
  .sname{font-size:8.5pt;font-weight:700;color:#0e7490;text-transform:uppercase;line-height:1.1;margin-bottom:1mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .r{display:flex;} .r .k{width:14mm;color:#6b7280;font-weight:600;flex:0 0 auto;} .r .v{flex:1;font-weight:700;color:#111827;}
  .ftr{position:absolute;left:3mm;right:3mm;bottom:1.6mm;display:flex;align-items:flex-end;justify-content:space-between;}
  .ftr .valid{font-size:4.6pt;color:#6b7280;}
  .qr{width:12mm;height:12mm;}
</style>
<div class="card">
  <div class="accent"></div>
  <div class="hdr">
    {{#if institutionLogo}}<img class="logo" src="{{institutionLogo}}"/>{{else}}<div class="logo-ph"></div>{{/if}}
    <div class="it"><div class="nm">{{institutionName}}</div></div>
    <div class="tag">LIBRARY</div>
  </div>
  <div class="body">
    {{#if studentPhoto}}<img class="photo" src="{{studentPhoto}}"/>{{else}}<div class="photo"></div>{{/if}}
    <div class="fields">
      <div class="sname">{{studentName}}</div>
      <div class="r"><div class="k">Lib ID</div><div class="v">{{libraryId}}</div></div>
      <div class="r"><div class="k">Adm No</div><div class="v">{{admissionNumber}}</div></div>
      <div class="r"><div class="k">Class</div><div class="v">{{className}}</div></div>
    </div>
  </div>
  <div class="ftr">
    <div class="valid">सदस्यता मान्य / Valid till<br/><b>{{validUntil}}</b></div>
    {{#if qrCode}}<img class="qr" src="{{qrCode}}"/>{{/if}}
  </div>
</div>`;
