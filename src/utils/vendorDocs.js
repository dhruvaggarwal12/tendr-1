// Shared Quote/Invoice/Contract PDF generation — used by the vendor dashboard's Tools tab
// and by the in-chat "Quote/Invoice/Contract" composer, so both reuse the same 5 themes and
// the same html2canvas+jsPDF rendering instead of duplicating it.
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logo from '../assets/logos/tendr-logo-secondary.png';

export function escapeHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}

// ── Document template themes — 5 selectable looks, shared by Quote/Invoice/Contract PDFs ──
export const DOC_THEMES = [
  { id:'classic', name:'Classic Gold',  swatch:'#C47A2E', pageBg:'#ffffff', accent:'#C47A2E', ink:'#2C1A0E', muted:'#9B7450', font:"'Outfit',Arial,sans-serif", rule:'2px solid #C47A2E', totalBox:'outline', cards:false, frame:false },
  { id:'mono',    name:'Minimal Mono',  swatch:'#111111', pageBg:'#ffffff', accent:'#111111', ink:'#111111', muted:'#6B6B6B', font:"'Outfit',Arial,sans-serif", rule:'1px solid #111111', totalBox:'plain',   cards:false, frame:false },
  { id:'bold',    name:'Midnight Bold', swatch:'#1E293B', pageBg:'#ffffff', accent:'#1E293B', ink:'#1E293B', muted:'#64748B', font:"'Outfit',Arial,sans-serif", rule:'3px solid #1E293B', totalBox:'solid',   cards:false, frame:false },
  { id:'elegant', name:'Elegant Ivory', swatch:'#8B6F3E', pageBg:'#FBF7EE', accent:'#8B6F3E', ink:'#3A2E1A', muted:'#8B6F3E', font:"Georgia,'Times New Roman',serif", rule:'4px double #8B6F3E', totalBox:'outline', cards:false, frame:true },
  { id:'modern',  name:'Modern Card',   swatch:'#0EA5E9', pageBg:'#F1F5F9', accent:'#0EA5E9', ink:'#0F172A', muted:'#64748B', font:"'Outfit',Arial,sans-serif", rule:'2px solid #0EA5E9', totalBox:'card',    cards:true,  frame:false },
];
export const docTheme = (id) => DOC_THEMES.find(t => t.id === id) || DOC_THEMES[0];

function docPageCSS(theme) {
  return `
  body{font-family:${theme.font};max-width:680px;margin:0 auto;padding:0 24px;color:${theme.ink};background:${theme.pageBg}}
  .frame{${theme.frame ? `border:1.5px solid ${theme.accent}55;padding:32px 26px;margin:24px 0` : 'padding:24px 0'}}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:${theme.rule};margin-bottom:24px}
  .brand-name{font-size:13.5px;font-weight:700;color:${theme.ink};margin-top:8px}
  .doc-label{font-size:17px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:${theme.ink}}
  .meta{font-size:13px;color:${theme.muted};margin-top:4px;line-height:1.6}
  h3{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${theme.muted};margin:20px 0 8px;${theme.cards?'':`border-bottom:1px solid ${theme.accent}22;padding-bottom:4px`}}
  .section{${theme.cards?`background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 1px 4px rgba(15,23,42,0.08);margin-bottom:14px`:''}}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid ${theme.accent}14;font-size:13px}
  .row.bold{font-weight:700;font-size:15px;border-bottom:2px solid ${theme.accent}}
  .pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;font-size:11px;font-weight:700;color:${theme.muted};text-transform:uppercase;letter-spacing:.08em;padding:6px 0;border-bottom:1.5px solid ${theme.accent}33}
  td{padding:9px 0;border-bottom:1px solid ${theme.accent}14;vertical-align:top}
  .total-box{margin-top:16px;padding:14px 18px;border-radius:${theme.cards?'12px':'10px'};
    ${theme.totalBox==='solid' ? `background:${theme.ink};color:#fff;` :
      theme.totalBox==='card'  ? `background:#fff;box-shadow:0 2px 10px rgba(15,23,42,0.1);` :
      theme.totalBox==='plain' ? `` :
      `background:${theme.accent}0d;border:1.5px solid ${theme.accent};`}}
  .total-box .row{border-bottom:1px solid ${theme.totalBox==='solid'?'rgba(255,255,255,0.15)':theme.accent+'1a'}}
  .total-box .row.bold{color:${theme.totalBox==='solid'?'#fff':theme.accent};border-bottom:none}
  footer{margin-top:40px;font-size:11px;color:${theme.muted};opacity:0.7;text-align:center;border-top:1px solid ${theme.accent}22;padding-top:16px}
  `;
}

function docHeaderHTML(theme, vendorName, docLabel, metaHtml, pillsHtml) {
  return `<div class="hdr">
    <div><img src="${logo}" alt="Tendr" style="height:28px;display:block"/><div class="brand-name">${escapeHtml(vendorName)}</div></div>
    <div style="text-align:right">
      <div class="doc-label">${docLabel}</div>
      <div class="meta">${metaHtml}</div>
      ${pillsHtml ? `<div style="margin-top:6px;display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap">${pillsHtml}</div>` : ''}
    </div>
  </div>`;
}

function docWrap(theme, title, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title>
<style>${docPageCSS(theme)}@media print{body{margin:0}}</style></head><body><div class="frame">${bodyHtml}</div></body></html>`;
}

// Renders a themed document off-screen and rasterizes it into a real PDF — the single
// mechanism behind "Download PDF" / "Share" in the Tools tab and "Send in Chat" in the
// vendor-direct chat composer.
export async function exportDocPdf(html, filename) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '728px';
  container.innerHTML = html;
  document.body.appendChild(container);
  const imgs = Array.from(container.querySelectorAll('img'));
  await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })));
  await new Promise(r => setTimeout(r, 50));
  let canvas;
  try {
    canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  } finally {
    document.body.removeChild(container);
  }
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
  return {
    download: () => pdf.save(filename),
    blob: () => pdf.output('blob'),
    dataUri: () => pdf.output('datauristring'),
  };
}

// share:true tries the native share sheet (file attaches directly in WhatsApp/Mail/etc on
// mobile); otherwise — or if sharing isn't supported/cancelled — it downloads the PDF and,
// when a client phone is known, opens WhatsApp with a text nudge to attach the downloaded file.
export async function downloadOrShareDoc(html, filename, { share, shareText, clientPhone } = {}, onDone) {
  try {
    const doc = await exportDocPdf(html, filename);
    if (share) {
      try {
        const file = new File([doc.blob()], filename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: shareText || '' });
          onDone?.(true);
          return;
        }
      } catch { /* cancelled or unsupported — fall through to download+WA nudge */ }
      doc.download();
      if (clientPhone) window.open(`https://wa.me/91${clientPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`${shareText || ''} PDF downloaded — attaching it here.`)}`, '_blank');
      onDone?.(true, true);
    } else {
      doc.download();
      onDone?.(true);
    }
  } catch (e) {
    console.error('PDF export failed', e);
    onDone?.(false);
  }
}

// ── Quote / Estimate ───────────────────────────────────────────────────────────
export function buildQuoteHTML(quote, vendorName, serviceType, theme) {
  const items = (quote.items || []).filter(i => i.desc || Number(i.rate));
  const subtotal = items.reduce((s, i) => s + (Number(i.qty)||1) * (Number(i.rate)||0), 0);
  const discount = Number(quote.discount) || 0;
  const total = subtotal - discount;
  const validUntil = new Date(); validUntil.setDate(validUntil.getDate() + 7);
  const pills = `<span class="pill" style="background:${theme.accent}18;color:${theme.accent}">QUOTE</span>${serviceType ? `<span class="pill" style="background:${theme.accent}18;color:${theme.accent}">${escapeHtml(serviceType)}</span>` : ''}`;
  const meta = `Date: ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}`;
  const body = `
${docHeaderHTML(theme, vendorName, 'ESTIMATE', meta, pills)}
<div class="section"><h3>Prepared For</h3>
  <div style="font-size:14px;font-weight:700">${escapeHtml(quote.clientName)}</div>
  ${quote.clientPhone ? `<div style="font-size:13px;color:${theme.muted}">📞 ${escapeHtml(quote.clientPhone)}</div>` : ''}
</div>
${(quote.eventType||quote.eventDate) ? `<div class="section"><h3>Event Details</h3>
  ${quote.eventType?`<div class="row"><span>Event Type</span><span>${escapeHtml(quote.eventType)}</span></div>`:''}
  ${quote.eventDate?`<div class="row"><span>Event Date</span><span>${new Date(quote.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span></div>`:''}
</div>` : ''}
<div class="section"><h3>Services & Pricing</h3>
  <table><thead><tr><th>Description</th><th style="text-align:center;width:60px">Qty</th><th style="text-align:right;width:100px">Rate (₹)</th><th style="text-align:right;width:110px">Amount (₹)</th></tr></thead><tbody>
  ${items.map(i=>`<tr><td>${escapeHtml(i.desc||'—')}</td><td style="text-align:center">${Number(i.qty)||1}</td><td style="text-align:right">${(Number(i.rate)||0).toLocaleString('en-IN')}</td><td style="text-align:right;font-weight:700">${((Number(i.qty)||1)*(Number(i.rate)||0)).toLocaleString('en-IN')}</td></tr>`).join('')}
  </tbody></table>
</div>
<div class="total-box">
  <div class="row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
  ${discount>0?`<div class="row" style="color:#16A34A"><span>Discount</span><span>−₹${discount.toLocaleString('en-IN')}</span></div>`:''}
  <div class="row bold"><span>Total Estimate</span><span>₹${total.toLocaleString('en-IN')}</span></div>
</div>
<div style="font-size:12px;color:${theme.muted};text-align:right;margin-top:6px">Valid until: ${validUntil.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
${quote.notes?`<div class="section"><h3>Notes</h3><div style="font-size:13px;color:${theme.ink};line-height:1.6">${escapeHtml(quote.notes)}</div></div>`:''}
<footer>${serviceType ? `${escapeHtml(serviceType)} Services · ` : ''}This is an estimate only · Final pricing may vary · Generated by Tendr · tendr.in</footer>`;
  return docWrap(theme, `Quote — ${quote.clientName}`, body);
}

export function generateQuote(quote, vendorName, serviceType = '', themeId = 'classic', opts = {}) {
  const theme = docTheme(themeId);
  const html = buildQuoteHTML(quote, vendorName, serviceType, theme);
  const filename = `Quote-${(quote.clientName||'Client').replace(/[^a-z0-9]+/gi,'-')}.pdf`;
  return downloadOrShareDoc(html, filename, { share: opts.share, shareText: `Here's your quote${quote.eventType?` for your ${quote.eventType}`:''} from ${vendorName}.`, clientPhone: quote.clientPhone }, opts.onDone);
}

// ── Standalone Invoice ──────────────────────────────────────────────────────────
export function buildStandaloneInvoiceHTML(inv, vendorName, theme) {
  const items = (inv.items||[]).filter(i => i.desc || Number(i.rate));
  const subtotal = items.reduce((s,i) => s + (Number(i.qty)||1)*(Number(i.rate)||0), 0);
  const discount = Number(inv.discount) || 0;
  const total = subtotal - discount;
  const meta = `No: INV-${Date.now().toString().slice(-6)}<br/>Date: ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}`;
  const body = `
${docHeaderHTML(theme, vendorName, 'TAX INVOICE', meta, '')}
<div class="section"><h3>Bill To</h3>
  <div style="font-size:14px;font-weight:700">${escapeHtml(inv.clientName)}</div>
  ${inv.clientPhone?`<div style="font-size:13px;color:${theme.muted}">📞 ${escapeHtml(inv.clientPhone)}</div>`:''}
  ${inv.clientEmail?`<div style="font-size:13px;color:${theme.muted}">✉ ${escapeHtml(inv.clientEmail)}</div>`:''}
</div>
${(inv.eventType||inv.eventDate)?`<div class="section"><h3>Event</h3>
  ${inv.eventType?`<div class="row"><span>Type</span><span>${escapeHtml(inv.eventType)}</span></div>`:''}
  ${inv.eventDate?`<div class="row"><span>Date</span><span>${new Date(inv.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span></div>`:''}
</div>`:''}
<div class="section"><h3>Services</h3>
  <table><thead><tr><th>Description</th><th style="text-align:center;width:60px">Qty</th><th style="text-align:right;width:100px">Rate (₹)</th><th style="text-align:right;width:110px">Amount (₹)</th></tr></thead><tbody>
  ${items.map(i=>`<tr><td>${escapeHtml(i.desc||'—')}</td><td style="text-align:center">${Number(i.qty)||1}</td><td style="text-align:right">${(Number(i.rate)||0).toLocaleString('en-IN')}</td><td style="text-align:right;font-weight:700">${((Number(i.qty)||1)*(Number(i.rate)||0)).toLocaleString('en-IN')}</td></tr>`).join('')}
  </tbody></table>
</div>
<div class="total-box">
  <div class="row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
  ${discount>0?`<div class="row" style="color:#DC2626"><span>Discount</span><span>−₹${discount.toLocaleString('en-IN')}</span></div>`:''}
  <div class="row bold"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
</div>
${inv.notes?`<div class="section"><h3>Notes</h3><div style="font-size:13px;color:${theme.ink};line-height:1.6">${escapeHtml(inv.notes).replace(/\n/g,'<br/>')}</div></div>`:''}
<footer>Generated by Tendr · tendr.in · Event Planning Platform</footer>`;
  return docWrap(theme, `Invoice — ${inv.clientName}`, body);
}

export function generateStandaloneInvoicePDF(inv, vendorName, themeId = 'classic', opts = {}) {
  const theme = docTheme(themeId);
  const html = buildStandaloneInvoiceHTML(inv, vendorName, theme);
  const filename = `Invoice-${(inv.clientName||'Client').replace(/[^a-z0-9]+/gi,'-')}.pdf`;
  return downloadOrShareDoc(html, filename, { share: opts.share, shareText: `Here's your invoice from ${vendorName}.`, clientPhone: inv.clientPhone }, opts.onDone);
}

// ── Contract ─────────────────────────────────────────────────────────────────
export function buildContractHTML(c, vendorName, serviceType, theme) {
  const today = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const advance = Number(c.advance||0);
  const amount  = Number(c.amount||0);
  const balance = Math.max(0, amount - advance);
  const defaultTerms = [
    `1. PAYMENT: ${advance>0?`Advance of ₹${advance.toLocaleString('en-IN')} is due on signing. Remaining ₹${balance.toLocaleString('en-IN')} is due on or before the event date.`:'50% advance is required to confirm the booking. Balance is due on the event date before services begin.'}`,
    `2. CANCELLATION: Cancellation >15 days before event — 50% of advance refunded. Within 15 days — advance non-refundable.`,
    `3. RESCHEDULING: One free reschedule with ≥10 days notice, subject to availability. Subsequent reschedules: ₹500 fee per change.`,
    `4. SERVICES: As described in this agreement. Additional services on the day will be charged separately at mutually agreed rates.`,
    `5. SETUP ACCESS: Client to ensure venue access and power supply at least 2 hours before event start time.`,
    `6. LIABILITY: ${escapeHtml(vendorName)} is not liable for delays due to force majeure, power failures, or venue access issues beyond their control.`,
    `7. PORTFOLIO: Unless agreed otherwise in writing, ${escapeHtml(vendorName)} may use event media for portfolio and promotional purposes.`,
    `8. GOVERNING LAW: This agreement is governed by Indian law. Disputes to be resolved amicably first; jurisdiction: Delhi courts.`,
  ].join('\n\n');
  const terms = c.customTerms || defaultTerms;
  const totalBoxBg = theme.totalBox==='solid' ? theme.ink : theme.cards ? '#fff' : `${theme.accent}0d`;
  const advanceColor = theme.totalBox==='solid' ? '#CCAB4A' : theme.accent;
  const body = `
<div style="text-align:center;padding-bottom:24px;border-bottom:${theme.rule};margin-bottom:28px">
  <img src="${logo}" alt="Tendr" style="height:26px;margin-bottom:10px"/>
  <div style="font-size:21px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:${theme.ink}">Service Agreement</div>
  <div style="font-size:13px;color:${theme.muted};margin-top:4px">${escapeHtml(vendorName)} · ${escapeHtml(serviceType||'Event Services')} · ${today}</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;${theme.cards?'background:#fff;box-shadow:0 1px 4px rgba(15,23,42,0.08);':`background:${theme.accent}0a;`}border-radius:12px;padding:18px;margin:20px 0">
  <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${theme.muted};margin-bottom:6px">Service Provider</div><div style="font-size:15px;font-weight:800;color:${theme.ink}">${escapeHtml(vendorName)}</div><div style="font-size:13px;color:${theme.muted};margin-top:2px">${escapeHtml(serviceType||'')} · via Tendr</div></div>
  <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${theme.muted};margin-bottom:6px">Client</div><div style="font-size:15px;font-weight:800;color:${theme.ink}">${escapeHtml(c.clientName)}</div>${c.clientPhone?`<div style="font-size:13px;color:${theme.muted};margin-top:2px">📞 ${escapeHtml(c.clientPhone)}</div>`:''}</div>
</div>
<h3>Event Details</h3>
<div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:10px">
  <div style="flex:1;min-width:100px"><div style="font-size:10px;font-weight:700;color:${theme.muted};text-transform:uppercase">Event Type</div><div style="font-size:14px;font-weight:700;color:${theme.ink}">${escapeHtml(c.eventType||'—')}</div></div>
  <div style="flex:1;min-width:100px"><div style="font-size:10px;font-weight:700;color:${theme.muted};text-transform:uppercase">Event Date</div><div style="font-size:14px;font-weight:700;color:${theme.ink}">${c.eventDate?new Date(c.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):'—'}</div></div>
  <div style="flex:1;min-width:100px"><div style="font-size:10px;font-weight:700;color:${theme.muted};text-transform:uppercase">Location</div><div style="font-size:14px;font-weight:700;color:${theme.ink}">${escapeHtml(c.location||'—')}</div></div>
</div>
<div style="border-radius:14px;padding:18px 22px;margin:18px 0;display:flex;justify-content:space-between;align-items:center;background:${totalBoxBg};${theme.totalBox==='solid'?'color:#fff;':theme.cards?'box-shadow:0 2px 10px rgba(15,23,42,0.1);':`border:1.5px solid ${theme.accent};`}">
  <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:0.7;margin-bottom:4px">Contract Value</div><div style="font-size:26px;font-weight:900;${theme.totalBox!=='solid'?`color:${theme.ink}`:''}">₹${amount.toLocaleString('en-IN')}</div></div>
  ${advance>0?`<div style="text-align:right"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;opacity:0.7;margin-bottom:4px">Advance Due</div><div style="font-size:19px;font-weight:800;color:${advanceColor}">₹${advance.toLocaleString('en-IN')}</div></div>`:''}
</div>
<h3>Terms & Conditions</h3>
<div style="font-size:13px;color:${theme.ink};line-height:2;white-space:pre-wrap">${escapeHtml(terms)}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:56px">
  <div><div style="height:48px"></div><div style="border-top:1.5px solid ${theme.ink};padding-top:8px;font-size:13px;font-weight:700;color:${theme.ink}">${escapeHtml(vendorName)}</div><div style="font-size:11px;color:${theme.muted};margin-top:3px">Service Provider · Signature & Date</div></div>
  <div><div style="height:48px"></div><div style="border-top:1.5px solid ${theme.ink};padding-top:8px;font-size:13px;font-weight:700;color:${theme.ink}">${escapeHtml(c.clientName)}</div><div style="font-size:11px;color:${theme.muted};margin-top:3px">Client · Signature & Date</div></div>
</div>
<footer>This agreement is binding once signed by both parties · Generated via Tendr · tendr.in</footer>`;
  return docWrap(theme, `Contract — ${c.clientName}`, body);
}

export function generateContractPDF(c, vendorName, serviceType, themeId = 'classic', opts = {}) {
  const theme = docTheme(themeId);
  const html = buildContractHTML(c, vendorName, serviceType, theme);
  const filename = `Contract-${(c.clientName||'Client').replace(/[^a-z0-9]+/gi,'-')}.pdf`;
  return downloadOrShareDoc(html, filename, { share: opts.share, shareText: `Here's your service agreement from ${vendorName}.`, clientPhone: c.clientPhone }, opts.onDone);
}
