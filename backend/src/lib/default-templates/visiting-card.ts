/**
 * Curated default VISITING CARD (HTML/Handlebars), CR80 landscape (85.6×54mm).
 * Staff/teacher business card.
 *
 * CONTRACT: branding flat (institutionName, institutionAddress, institutionLogo) +
 *   name, designation, phone, email, website.
 * Fonts/reset injected by document-base.
 */
export const VISITING_CARD_HTML = `<style>
  .vc{width:85.6mm;height:53.98mm;background:#fff;position:relative;overflow:hidden;display:flex;}
  .bar{width:4mm;background:linear-gradient(180deg,#b7102a,#e63946);flex:0 0 auto;}
  .main{flex:1;padding:5mm 5mm 4mm;display:flex;flex-direction:column;}
  .top{display:flex;align-items:center;gap:2.5mm;}
  .top .logo{height:11mm;width:11mm;object-fit:contain;flex:0 0 auto;}
  .top .inm{font-size:9.5pt;font-weight:700;color:#b7102a;line-height:1.1;}
  .top .iad{font-size:5.5pt;color:#6b7280;}
  .person{margin-top:auto;}
  .person .nm{font-size:13pt;font-weight:700;color:#111827;line-height:1.05;}
  .person .desg{font-size:8pt;color:#b7102a;font-weight:600;margin-top:0.5mm;}
  .contact{margin-top:3mm;font-size:6.8pt;color:#374151;line-height:1.7;border-top:0.3mm solid #eee;padding-top:2mm;}
  .contact span{display:inline-block;min-width:3mm;color:#b7102a;font-weight:700;}
</style>
<div class="vc">
  <div class="bar"></div>
  <div class="main">
    <div class="top">
      {{#if institutionLogo}}<img class="logo" src="{{institutionLogo}}"/>{{/if}}
      <div><div class="inm">{{institutionName}}</div><div class="iad">{{institutionAddress}}</div></div>
    </div>
    <div class="person">
      <div class="nm">{{name}}</div>
      <div class="desg">{{designation}}</div>
    </div>
    <div class="contact">
      {{#if phone}}<span>☎</span> {{phone}}&nbsp;&nbsp;{{/if}}{{#if email}}<span>✉</span> {{email}}<br/>{{/if}}
      {{#if website}}<span>🌐</span> {{website}}{{/if}}
    </div>
  </div>
</div>`;
