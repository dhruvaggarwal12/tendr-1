import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import tendrLogoUrl     from "../assets/logos/tendr.png";         // dark/gold — for light backgrounds
import tendrLogoWhite   from "../assets/logos/tendr-logo-secondary.png"; // light — for dark backgrounds

const BRAND_DARK   = "#2C1A0E";
const BRAND_GOLD   = "#C47A2E";
const BRAND_LIGHT  = "#F8F4EF";
const BRAND_TAN    = "#9B7450";

// Pre-load logos as base64 at module init so sync PDF functions can use them
let _logoDark  = null;
let _logoLight = null;

async function _b64(url) {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise(res => { const r = new FileReader(); r.onloadend = () => res(r.result); r.readAsDataURL(blob); });
  } catch { return null; }
}
const _logoReady = Promise.all([_b64(tendrLogoUrl), _b64(tendrLogoWhite)]).then(([d, l]) => { _logoDark = d; _logoLight = l; });
// Kick off immediately on module load so logos are ready before first click
_logoReady.catch(() => {});

function addHeader(doc, title) {
  doc.setFillColor(44, 26, 14);
  doc.rect(0, 0, 210, 28, "F");
  doc.setFillColor(204, 171, 74);
  doc.rect(0, 28, 210, 1.5, "F");

  if (_logoLight) {
    doc.addImage(_logoLight, "PNG", 10, 4, 42, 18);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(204, 171, 74);
    doc.text("tendr", 14, 18);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(204, 171, 74);
  doc.text(title, 196, 20, { align: "right" });
}

function addFooter(doc, pageNum, totalPages) {
  const y = 285;
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(155, 116, 80);
  doc.text("tendr.in  ·  support@tendr.in", 14, y + 5);
  doc.text(`Page ${pageNum} of ${totalPages}`, 196, y + 5, { align: "right" });
}

function sectionTitle(doc, label, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(196, 122, 46);
  doc.text(label.toUpperCase(), 14, y);
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.3);
  doc.line(14, y + 1.5, 196, y + 1.5);
  return y + 7;
}

function row(doc, label, value, y, labelX = 14, valueX = 70) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(92, 58, 26);
  doc.text(label, labelX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 26, 14);
  const lines = doc.splitTextToSize(String(value || "—"), 196 - valueX);
  doc.text(lines, valueX, y);
  return y + lines.length * 5 + 1;
}

// ── Invoice PDF ──────────────────────────────────────────────────────────────
// serviceAmounts (optional): [{ category, amount }] — per-service breakdown
// confirmedVendors: used only to extract unique service categories when serviceAmounts not provided
export function generateInvoicePDF({ eventSummary, confirmedVendors = [], amount, orderId, paymentId, userName, serviceAmounts = null }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  addHeader(doc, "Payment Invoice");

  let y = 38;

  // Invoice meta box
  doc.setFillColor(255, 252, 247);
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, 182, 28, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(44, 26, 14);
  doc.text("INVOICE", 20, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(92, 58, 26);
  doc.text(`Invoice Date: ${date}`, 20, y + 16);
  if (orderId)   doc.text(`Order ID: ${orderId}`, 20, y + 21);
  if (paymentId) doc.text(`Payment ID: ${paymentId}`, 20, y + 26);

  // Status badge
  doc.setFillColor(21, 128, 61);
  doc.roundedRect(158, y + 5, 28, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("✓  PAID", 172, y + 11.5, { align: "center" });

  y += 36;

  // Bill to
  y = sectionTitle(doc, "Billed To", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(44, 26, 14);
  doc.text(userName || "Customer", 14, y);
  y += 10;

  // Event details
  y = sectionTitle(doc, "Event Details", y);
  if (eventSummary.eventType) y = row(doc, "Event Type:", eventSummary.eventType, y);
  if (eventSummary.date)      y = row(doc, "Event Date:", eventSummary.date, y);
  if (eventSummary.location)  y = row(doc, "Location:",   eventSummary.location, y);
  if (eventSummary.guests)    y = row(doc, "Guests:",     eventSummary.guests, y);
  y += 4;

  // Build service rows — no vendor names
  // Prefer serviceAmounts if provided; otherwise dedupe service types from confirmedVendors
  const hasAmounts = serviceAmounts && serviceAmounts.length > 0;
  const serviceRows = hasAmounts
    ? serviceAmounts
    : [...new Map(confirmedVendors.map(v => [v.serviceType, { category: v.serviceType }])).values()];

  if (serviceRows.length > 0) {
    y = sectionTitle(doc, "Services Booked", y);

    // Table header
    doc.setFillColor(255, 250, 240);
    doc.rect(14, y - 4, 182, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(92, 58, 26);
    doc.text("Service Category", 18, y);
    if (hasAmounts) doc.text("Amount", 178, y, { align: "right" });
    y += 3;
    doc.setDrawColor(204, 171, 74);
    doc.setLineWidth(0.2);
    doc.line(14, y, 196, y);
    y += 4;

    serviceRows.forEach((s, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(255, 252, 247);
        doc.rect(14, y - 3.5, 182, 6.5, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(44, 26, 14);
      doc.text(s.category || s.serviceType || "", 18, y);
      if (hasAmounts && s.amount) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(196, 122, 46);
        doc.text(`₹${Number(s.amount).toLocaleString("en-IN")}`, 192, y, { align: "right" });
      }
      y += 7;
    });
    y += 4;
  }

  // Total amount
  doc.setFillColor(44, 26, 14);
  doc.roundedRect(14, y, 182, 16, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(204, 171, 74);
  doc.text("Total Amount Paid:", 20, y + 10);
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`₹${Number(amount || 0).toLocaleString("en-IN")}`, 190, y + 10, { align: "right" });

  addFooter(doc, 1, 1);
  doc.save("tendr-invoice.pdf");
}

// ── Event Details PDF ────────────────────────────────────────────────────────
export async function generateEventDetailsPDF({ eventSummary, confirmedVendors, pinnedMessages, userName, orderId, vendorPricing = {} }) {
  await _logoReady;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  addHeader(doc, "Event Details");

  let y = 38;
  let pageNum = 1;

  const checkPageBreak = (needed = 15) => {
    if (y + needed > 275) {
      addFooter(doc, pageNum, "?");
      doc.addPage();
      pageNum++;
      addHeader(doc, "Event Details (cont'd)");
      y = 38;
    }
  };

  // Hero greeting box
  doc.setFillColor(255, 252, 247);
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, 182, 18, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(44, 26, 14);
  doc.text(`Hi ${userName || "there"}! Your event is confirmed 🎉`, 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(92, 58, 26);
  doc.text(`Generated on ${date}${orderId ? `  ·  Booking Ref: ${orderId}` : ""}`, 20, y + 14);
  y += 26;

  // Event summary
  y = sectionTitle(doc, "Event Summary", y);
  if (eventSummary.eventType)   y = row(doc, "Event Type:",    eventSummary.eventType, y);
  if (eventSummary.date)        y = row(doc, "Event Date:",    eventSummary.date, y);
  if (eventSummary.location)    y = row(doc, "Location:",      eventSummary.location, y);
  if (eventSummary.guests)      y = row(doc, "Guests:",        eventSummary.guests, y);
  if (eventSummary.budget)      y = row(doc, "Budget:",        eventSummary.budget, y);
  if (eventSummary.bookingType) y = row(doc, "Booking Type:",  eventSummary.bookingType === "let-us-do-it" ? "Let Us Do It" : "You Do It", y);
  y += 5;

  // Confirmed vendors
  if (confirmedVendors.length > 0) {
    checkPageBreak(confirmedVendors.length * 8 + 20);
    y = sectionTitle(doc, "Confirmed Vendors", y);

    confirmedVendors.forEach((v, i) => {
      checkPageBreak(10);
      // Vendor pill card
      doc.setFillColor(i % 2 === 0 ? 255 : 253, i % 2 === 0 ? 252 : 249, i % 2 === 0 ? 247 : 240);
      doc.roundedRect(14, y - 4, 182, 9, 2, 2, "F");

      // Initials circle
      doc.setFillColor(196, 122, 46);
      doc.circle(22, y + 0.5, 3.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(v.name[0].toUpperCase(), 22, y + 1.2, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(44, 26, 14);
      doc.text(v.name, 29, y + 1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(92, 58, 26);
      doc.text(v.serviceType, 29, y + 5);

      // Confirmed badge
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(168, y - 2, 24, 7, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(21, 128, 61);
      doc.text("✓ Confirmed", 180, y + 2.5, { align: "center" });

      y += 11;
    });
    y += 4;
  }

  // Pricing per vendor
  const pricingEntries = Object.entries(vendorPricing || {}).filter(([, v]) => v);
  if (pricingEntries.length > 0) {
    checkPageBreak(pricingEntries.length * 8 + 20);
    y = sectionTitle(doc, "Vendor Pricing", y);
    let totalPrice = 0;
    pricingEntries.forEach(([name, price], i) => {
      checkPageBreak(10);
      if (i % 2 === 0) { doc.setFillColor(255, 252, 247); doc.rect(14, y - 3.5, 182, 7, "F"); }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(44, 26, 14);
      doc.text(name, 18, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(196, 122, 46);
      doc.text(`₹${Number(price).toLocaleString("en-IN")}`, 196, y, { align: "right" });
      totalPrice += Number(price) || 0;
      y += 7;
    });
    // Total row
    doc.setFillColor(44, 26, 14);
    doc.roundedRect(14, y, 182, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(204, 171, 74);
    doc.text("Total Estimated Cost", 18, y + 6.5);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`₹${totalPrice.toLocaleString("en-IN")}`, 192, y + 6.5, { align: "right" });
    y += 16;
  }

  // Pinned messages per vendor
  const vendorsWithPins = confirmedVendors.filter(v => (pinnedMessages[v._id || v.name] || []).length > 0);
  if (vendorsWithPins.length > 0) {
    checkPageBreak(20);
    y = sectionTitle(doc, "📌 Pinned Messages from Vendor Chats", y);

    vendorsWithPins.forEach(v => {
      const pins = pinnedMessages[v._id || v.name] || [];
      if (!pins.length) return;

      checkPageBreak(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(196, 122, 46);
      doc.text(`${v.name} — ${v.serviceType}`, 14, y);
      y += 5;

      pins.forEach(msg => {
        const lines = doc.splitTextToSize(`• ${msg}`, 176);
        checkPageBreak(lines.length * 5 + 3);
        doc.setFillColor(255, 250, 240);
        doc.setDrawColor(196, 122, 46);
        doc.setLineWidth(0.2);
        doc.roundedRect(16, y - 3.5, 178, lines.length * 5 + 2, 2, 2, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(90, 58, 26);
        doc.text(lines, 20, y);
        y += lines.length * 5 + 4;
      });
      y += 3;
    });
  }

  // What happens next
  checkPageBreak(30);
  y += 2;
  y = sectionTitle(doc, "What Happens Next", y);
  const nexts = [
    "Our team will contact you within 24 hours to confirm logistics and vendor timings.",
    "Your confirmed vendors will be notified. Keep your dashboard open for updates.",
    "Just show up and celebrate — we handle the rest.",
  ];
  nexts.forEach(n => {
    const lines = doc.splitTextToSize(`• ${n}`, 175);
    checkPageBreak(lines.length * 5 + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(44, 26, 14);
    doc.text(lines, 18, y);
    y += lines.length * 5 + 2;
  });

  addFooter(doc, pageNum, pageNum);
  doc.save("tendr-event-details.pdf");
}

// ── Timeline Slip (compact 100×200mm receipt-style) ──────────────────────────
export async function generateTimelinePDF({ slots = [], eventSummary = {}, userName = "" }) {
  await _logoReady;
  // Dynamic height — enough for all slots, minimum 160mm
  const slotH = 11;
  const headerH = 42;
  const footerH = 18;
  const H = Math.max(160, headerH + slots.length * slotH + footerH);
  const W = 100;
  const doc = new jsPDF({ unit: "mm", format: [W, H] });
  const CX = W / 2;

  // ── Background
  doc.setFillColor(255, 252, 247);
  doc.rect(0, 0, W, H, "F");

  // ── Dark header band
  doc.setFillColor(44, 26, 14);
  doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(204, 171, 74);
  doc.rect(0, 30, W, 1.2, "F");

  // Logo or text in header
  if (_logoLight) {
    doc.addImage(_logoLight, "PNG", CX - 18, 5, 36, 13);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(204, 171, 74);
    doc.text("tendr", CX, 15, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(155, 116, 80);
    doc.text("WE CURATE YOU CELEBRATE", CX, 21, { align: "center", charSpace: 0.8 });
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(204, 171, 74);
  doc.text("DAY-OF SCHEDULE", CX, 27, { align: "center", charSpace: 1 });

  let y = 38;

  // Event title + date line
  const title = eventSummary.eventType ? eventSummary.eventType.toUpperCase() : "YOUR EVENT";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(44, 26, 14);
  doc.text(title, CX, y, { align: "center" });
  y += 5;
  const meta = [eventSummary.date, eventSummary.location].filter(Boolean).join("  ·  ");
  if (meta) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(155, 116, 80);
    doc.text(meta, CX, y, { align: "center" });
    y += 5;
  }

  // Divider
  doc.setDrawColor(204, 171, 74);
  doc.setLineWidth(0.3);
  doc.line(8, y, W - 8, y);
  y += 5;

  if (!slots.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(155, 116, 80);
    doc.text("No slots yet — build your timeline", CX, y + 6, { align: "center" });
  } else {
    slots.forEach((slot, i) => {
      const isDone = !!slot.done;
      // Alternate row tint
      if (i % 2 === 0) {
        doc.setFillColor(255, 249, 240);
        doc.rect(5, y - 3, W - 10, slotH - 1, "F");
      }
      // Time pill
      doc.setFillColor(isDone ? 21 : 44, isDone ? 128 : 26, isDone ? 61 : 14);
      doc.roundedRect(6, y - 2.5, 17, 6, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(isDone ? 255 : 204, isDone ? 255 : 171, isDone ? 255 : 74);
      doc.text(slot.time || "--:--", 14.5, y + 1.3, { align: "center" });
      // Status dot
      doc.setFillColor(isDone ? 21 : 196, isDone ? 128 : 122, isDone ? 61 : 46);
      doc.circle(27, y - 0.2, 1.2, "F");
      // Title
      doc.setFont("helvetica", isDone ? "normal" : "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(isDone ? 155 : 44, isDone ? 116 : 26, isDone ? 80 : 14);
      const titleLines = doc.splitTextToSize(slot.title || "", W - 36);
      doc.text(titleLines[0] || "", 30, y + 1);
      if (slot.who) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(155, 116, 80);
        doc.text(slot.who, 30, y + 5.5);
      }
      y += slotH;
    });
  }

  // ── Footer
  const footerY = H - footerH;
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.3);
  doc.line(8, footerY, W - 8, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(155, 116, 80);
  doc.text("tendr.in  ·  contacttendr@gmail.com  ·  +91 9211668427", CX, footerY + 5, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.setTextColor(196, 122, 46);
  doc.text("We Curate, You Celebrate", CX, footerY + 10, { align: "center" });

  doc.save("tendr-day-schedule.pdf");
}

// ── Invitation Template PDF ──────────────────────────────────────────────────
export async function generateInvitationPDF({ eventSummary = {}, confirmedVendors = [], userName = "", giftHamperUrl = "" }) {
  await _logoReady;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, CX = W / 2;

  // Cream background
  doc.setFillColor(245, 240, 232);
  doc.rect(0, 0, W, H, "F");

  // Double gold border frame
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, W - 24, H - 24);

  let y = 24;

  // Tendr logo (dark/gold — reads on cream)
  if (_logoDark) {
    doc.addImage(_logoDark, "PNG", CX - 22, y, 44, 17);
    y += 25;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(196, 122, 46);
    doc.text("tendr", CX, y + 12, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(155, 116, 80);
    doc.text("WE CURATE YOU CELEBRATE", CX, y + 18, { align: "center", charSpace: 1 });
    y += 26;
  }

  // "YOU ARE CORDIALLY INVITED TO"
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(155, 116, 80);
  doc.text("YOU ARE CORDIALLY INVITED TO", CX, y, { align: "center", charSpace: 1.5 });
  y += 9;

  // Gold ornamental divider
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(196, 122, 46);
  doc.text("─── ✦ ✦ ✦ ───", CX, y, { align: "center" });
  y += 13;

  // "YOU'RE" — large bold dark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(44, 26, 14);
  doc.text("YOU'RE", CX, y, { align: "center" });
  y += 13;

  // "Invited!" — bold italic gold
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(36);
  doc.setTextColor(196, 122, 46);
  doc.text("Invited!", CX, y, { align: "center" });
  y += 15;

  // Heart divider
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(196, 122, 46);
  doc.text("── ♥ ──", CX, y, { align: "center" });
  y += 13;

  // "YOU ARE INVITED TO THE [EVENT TYPE]"
  const eventTypeUpper = (eventSummary.eventType || "SPECIAL CELEBRATION").toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(44, 26, 14);
  const eventLine = `YOU ARE INVITED TO THE ${eventTypeUpper}`;
  const eventLineWrapped = doc.splitTextToSize(eventLine, W - 56);
  doc.text(eventLineWrapped, CX, y, { align: "center", charSpace: 0.3 });
  y += eventLineWrapped.length * 6.5 + 4;

  // Hosted by
  if (userName) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(155, 116, 80);
    doc.text(`Hosted by ${userName}`, CX, y, { align: "center" });
    y += 9;
  }

  // Thin divider
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.4);
  doc.line(45, y, W - 45, y);
  y += 12;

  // Info rows with circle icon: DATE, VENUE, RSVP
  const infoRows = [
    eventSummary.date     && { label: "DATE",  val: eventSummary.date },
    eventSummary.location && { label: "VENUE", val: eventSummary.location },
    { label: "RSVP", val: "contacttendr@gmail.com  ·  +91 9211668427" },
  ].filter(Boolean);

  const circleX = CX - 42;
  infoRows.forEach(({ label, val }) => {
    doc.setFillColor(196, 122, 46);
    doc.circle(circleX, y, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text(label[0], circleX, y + 1.2, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(155, 116, 80);
    doc.text(label, circleX + 8, y - 3, { charSpace: 0.5 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(44, 26, 14);
    const valLines = doc.splitTextToSize(val, W - (circleX + 8) - 20);
    doc.text(valLines, circleX + 8, y + 3);
    y += Math.max(14, valLines.length * 5 + 8);
  });

  // Thin divider
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.4);
  doc.line(45, y, W - 45, y);
  y += 12;

  // "We look forward to" italic
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(155, 116, 80);
  doc.text("We look forward to", CX, y, { align: "center" });
  y += 9;

  // "CELEBRATING WITH YOU!" bold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(44, 26, 14);
  doc.text("CELEBRATING WITH YOU!", CX, y, { align: "center", charSpace: 0.5 });
  y += 14;

  // Bottom ornament
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(196, 122, 46);
  doc.text("─── ✦ ✦ ✦ ───", CX, y, { align: "center" });
  y += 10;

  // Gift hampers box (only if URL provided)
  if (giftHamperUrl) {
    const ghTop = Math.max(y + 6, 224);
    doc.setFillColor(255, 248, 235);
    doc.setDrawColor(196, 122, 46);
    doc.setLineWidth(0.8);
    doc.roundedRect(20, ghTop, W - 40, 38, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(44, 26, 14);
    doc.text(`🛍  BOOK GIFT HAMPERS FOR ${eventTypeUpper}`, 28, ghTop + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(196, 122, 46);
    doc.text(giftHamperUrl, 28, ghTop + 16);

    try {
      const qrDataUrl = await QRCode.toDataURL(giftHamperUrl, { width: 120, margin: 1, color: { dark: "#2C1A0E", light: "#FFF8EB" } });
      doc.addImage(qrDataUrl, "PNG", W - 52, ghTop + 3, 28, 28);
    } catch {}

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(155, 116, 80);
    doc.text("Scan QR to browse & book →", 28, ghTop + 23);
    doc.text("Surprise your guests with curated gift hampers!", 28, ghTop + 30);
  }

  // Footer dark strip
  doc.setFillColor(44, 26, 14);
  doc.rect(12, H - 22, W - 24, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(196, 122, 46);
  doc.text("contacttendr@gmail.com  ·  +91 9211668427  ·  tendr.in", CX, H - 22 + 6.5, { align: "center" });

  doc.save("tendr-invitation.pdf");
}
