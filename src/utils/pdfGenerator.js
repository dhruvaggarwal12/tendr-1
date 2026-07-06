import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import tendrLogoUrl   from "../assets/logos/tendr.png";
import tendrLogoWhite from "../assets/logos/tendr-logo-secondary.png";

const BRAND_DARK  = "#2C1A0E";
const BRAND_GOLD  = "#C47A2E";
const WEBSITE_URL = "https://tendr.in";

// Pre-load assets at module init so all generator functions can use them synchronously
let _logoDark  = null;
let _logoLight = null;
let _websiteQR = null;

async function _b64(url) {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise(res => {
      const r = new FileReader();
      r.onloadend = () => res(r.result);
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

const _assetsReady = Promise.all([
  _b64(tendrLogoUrl).then(d => { _logoDark = d; }),
  _b64(tendrLogoWhite).then(d => { _logoLight = d; }),
  QRCode.toDataURL(WEBSITE_URL, { width: 80, margin: 1, color: { dark: "#2C1A0E", light: "#FFFCF5" } })
    .then(d => { _websiteQR = d; })
    .catch(() => {}),
]);
_assetsReady.catch(() => {});

// Replace Rs symbol with "Rs." — Helvetica (Latin-1) cannot render the Rupee symbol
function sanitize(val) {
  return String(val ?? "—").replace(/₹/g, "Rs. ");
}

// Drawn ornamental divider — replaces broken unicode ornament chars
function drawOrnamentDivider(doc, cx, y) {
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.4);
  doc.line(cx - 30, y, cx - 11, y);
  doc.line(cx + 11, y, cx + 30, y);
  doc.setFillColor(196, 122, 46);
  [-7.5, 0, 7.5].forEach(dx => doc.circle(cx + dx, y, 1.2, "F"));
}

// Single center-dot divider — replaces broken heart char
function drawCenterDot(doc, cx, y) {
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.3);
  doc.line(cx - 22, y, cx - 3, y);
  doc.line(cx + 3, y, cx + 22, y);
  doc.setFillColor(196, 122, 46);
  doc.circle(cx, y, 1.5, "F");
}

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
  // Middle dot U+00B7 is in Latin-1 (Helvetica supports it)
  doc.text("tendr.in  ·  support@tendr.in  ·  tendr-1.vercel.app", 14, y + 5);
  doc.text(`Page ${pageNum} of ${totalPages}`, 148, y + 5);
  if (_websiteQR) {
    doc.addImage(_websiteQR, "PNG", 185, y + 0.5, 10, 10);
  }
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
  const lines = doc.splitTextToSize(sanitize(value), 196 - valueX);
  doc.text(lines, valueX, y);
  return y + lines.length * 5 + 1;
}

// ── Invoice PDF ──────────────────────────────────────────────────────────────
export async function generateInvoicePDF({ eventSummary, orderId, paymentId, userName }) {
  await _assetsReady;
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

  // "PAID" badge
  doc.setFillColor(21, 128, 61);
  doc.roundedRect(158, y + 5, 28, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("PAID", 172, y + 11.5, { align: "center" });

  y += 36;

  // Service Provider (Tendr)
  y = sectionTitle(doc, "Service Provider", y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(44, 26, 14);
  doc.text("tendr", 14, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(92, 58, 26);
  doc.text("GSTIN: 09AAMCT7747E1ZT", 14, y);
  y += 5;
  doc.text("contact@tendr.co.in  |  tendr.co.in", 14, y);
  y += 10;

  // Billed To
  y = sectionTitle(doc, "Billed To", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(44, 26, 14);
  doc.text(sanitize(userName || "Customer"), 14, y);
  y += 10;

  // Event details
  y = sectionTitle(doc, "Event Details", y);
  if (eventSummary.eventType) y = row(doc, "Event Type:", eventSummary.eventType, y);
  if (eventSummary.date)      y = row(doc, "Event Date:", eventSummary.date, y);
  if (eventSummary.location)  y = row(doc, "Location:",   eventSummary.location, y);
  if (eventSummary.guests)    y = row(doc, "Guests:",     eventSummary.guests, y);
  y += 6;

  // Fee breakdown
  y = sectionTitle(doc, "Fee Breakdown", y);

  // Table header
  doc.setFillColor(255, 250, 240);
  doc.rect(14, y - 4, 182, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(92, 58, 26);
  doc.text("Description", 18, y);
  doc.text("Amount", 190, y, { align: "right" });
  y += 3;
  doc.setDrawColor(204, 171, 74);
  doc.setLineWidth(0.2);
  doc.line(14, y, 196, y);
  y += 5;

  // Platform fee row
  doc.setFillColor(255, 252, 247);
  doc.rect(14, y - 3.5, 182, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(44, 26, 14);
  doc.text("Tendr Platform Fee", 18, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(92, 58, 26);
  doc.text("Event planning & vendor curation service", 18, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(44, 26, 14);
  doc.text("Rs. 169.49", 190, y, { align: "right" });
  y += 14;

  // GST row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(92, 58, 26);
  doc.text("GST @ 18%", 18, y);
  doc.text("Rs. 30.51", 190, y, { align: "right" });
  y += 8;

  // Divider
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
  y += 4;

  // Total bar
  doc.setFillColor(44, 26, 14);
  doc.roundedRect(14, y, 182, 16, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(204, 171, 74);
  doc.text("Total Amount Paid:", 20, y + 10);
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("Rs. 200.00", 190, y + 10, { align: "right" });

  addFooter(doc, 1, 1);
  doc.save("tendr-invoice.pdf");
}

// ── Event Details PDF ────────────────────────────────────────────────────────
export async function generateEventDetailsPDF({ eventSummary, confirmedVendors = [], pinnedMessages = {}, userName, orderId, vendorPricing = {} }) {
  await _assetsReady;
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

  // Hero greeting box — no emoji (Helvetica cannot render them)
  doc.setFillColor(255, 252, 247);
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, 182, 18, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(44, 26, 14);
  doc.text(`Hi ${sanitize(userName || "there")}! Your event is confirmed.`, 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(92, 58, 26);
  doc.text(`Generated on ${date}${orderId ? `  ·  Booking Ref: ${orderId}` : ""}`, 20, y + 14);
  y += 26;

  // Event summary
  y = sectionTitle(doc, "Event Summary", y);
  if (eventSummary.eventType)   y = row(doc, "Event Type:",   eventSummary.eventType, y);
  if (eventSummary.date)        y = row(doc, "Event Date:",   eventSummary.date, y);
  if (eventSummary.location)    y = row(doc, "Location:",     eventSummary.location, y);
  if (eventSummary.guests)      y = row(doc, "Guests:",       eventSummary.guests, y);
  if (eventSummary.bookingType) y = row(doc, "Booking Type:", eventSummary.bookingType === "let-us-do-it" ? "Let Us Do It" : "You Do It", y);
  if (eventSummary.categoryBudgets && Object.keys(eventSummary.categoryBudgets).length > 0) {
    Object.entries(eventSummary.categoryBudgets).forEach(([cat, amt]) => {
      y = row(doc, `${cat} Budget:`, `Rs. ${Number(amt).toLocaleString("en-IN")}`, y);
    });
  } else if (eventSummary.budget && eventSummary.budget !== "See category budgets") {
    y = row(doc, "Budget:", eventSummary.budget, y);
  }
  y += 5;

  // Confirmed vendors
  if (confirmedVendors.length > 0) {
    checkPageBreak(confirmedVendors.length * 8 + 20);
    y = sectionTitle(doc, "Confirmed Vendors", y);

    confirmedVendors.forEach((v, i) => {
      checkPageBreak(10);
      doc.setFillColor(i % 2 === 0 ? 255 : 253, i % 2 === 0 ? 252 : 249, i % 2 === 0 ? 247 : 240);
      doc.roundedRect(14, y - 4, 182, 9, 2, 2, "F");

      doc.setFillColor(196, 122, 46);
      doc.circle(22, y + 0.5, 3.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text((v.name?.[0] || "V").toUpperCase(), 22, y + 1.2, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(44, 26, 14);
      doc.text(sanitize(v.name), 29, y + 1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(92, 58, 26);
      doc.text(sanitize(v.serviceType), 29, y + 5);

      // "Confirmed" badge — no checkmark emoji
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(168, y - 2, 24, 7, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(21, 128, 61);
      doc.text("Confirmed", 180, y + 2.5, { align: "center" });

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
      doc.text(sanitize(name), 18, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(196, 122, 46);
      doc.text(`Rs. ${Number(price).toLocaleString("en-IN")}`, 196, y, { align: "right" });
      totalPrice += Number(price) || 0;
      y += 7;
    });
    doc.setFillColor(44, 26, 14);
    doc.roundedRect(14, y, 182, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(204, 171, 74);
    doc.text("Total Estimated Cost", 18, y + 6.5);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Rs. ${totalPrice.toLocaleString("en-IN")}`, 192, y + 6.5, { align: "right" });
    y += 16;
  }

  // Pinned messages — no emoji in section title
  const vendorsWithPins = confirmedVendors.filter(v => (pinnedMessages[v._id || v.name] || []).length > 0);
  if (vendorsWithPins.length > 0) {
    checkPageBreak(20);
    y = sectionTitle(doc, "Pinned Messages from Vendor Chats", y);

    vendorsWithPins.forEach(v => {
      const msgs = pinnedMessages[v._id || v.name] || [];
      if (!msgs.length) return;
      checkPageBreak(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(196, 122, 46);
      doc.text(`${sanitize(v.name)} - ${sanitize(v.serviceType)}`, 14, y);
      y += 5;

      msgs.forEach(msg => {
        const lines = doc.splitTextToSize(`- ${sanitize(msg)}`, 176);
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
  [
    "Our team will contact you within 24 hours to confirm logistics and vendor timings.",
    "Your confirmed vendors will be notified. Keep your dashboard open for updates.",
    "Just show up and celebrate - we handle the rest.",
  ].forEach(n => {
    const lines = doc.splitTextToSize(`- ${n}`, 175);
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

// ── Timeline Slip (compact 100mm-wide receipt style) ──────────────────────────
export async function generateTimelinePDF({ slots = [], eventSummary = {}, userName = "", preEventNotes = [] }) {
  await _assetsReady;
  const slotH        = 11;
  const headerH      = 42;
  const footerH      = 30;
  const preEventH    = preEventNotes.length > 0 ? 14 + preEventNotes.length * 11 : 0;
  const H = Math.max(170, headerH + slots.length * slotH + preEventH + footerH);
  const W = 100;
  const doc = new jsPDF({ unit: "mm", format: [W, H] });
  const CX = W / 2;

  doc.setFillColor(255, 252, 247);
  doc.rect(0, 0, W, H, "F");

  doc.setFillColor(44, 26, 14);
  doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(204, 171, 74);
  doc.rect(0, 30, W, 1.2, "F");

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

  doc.setDrawColor(204, 171, 74);
  doc.setLineWidth(0.3);
  doc.line(8, y, W - 8, y);
  y += 5;

  if (!slots.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(155, 116, 80);
    doc.text("No slots yet - build your timeline", CX, y + 6, { align: "center" });
  } else {
    slots.forEach((slot, i) => {
      const isDone = !!slot.done;
      if (i % 2 === 0) {
        doc.setFillColor(255, 249, 240);
        doc.rect(5, y - 3, W - 10, slotH - 1, "F");
      }
      doc.setFillColor(isDone ? 21 : 44, isDone ? 128 : 26, isDone ? 61 : 14);
      doc.roundedRect(6, y - 2.5, 17, 6, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(isDone ? 255 : 204, isDone ? 255 : 171, isDone ? 255 : 74);
      doc.text(slot.time || "--:--", 14.5, y + 1.3, { align: "center" });
      doc.setFillColor(isDone ? 21 : 196, isDone ? 128 : 122, isDone ? 61 : 46);
      doc.circle(27, y - 0.2, 1.2, "F");
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

  // Pre-event notes (gift hampers, stationeries)
  if (preEventNotes.length > 0) {
    y += 4;
    doc.setDrawColor(196, 122, 46);
    doc.setLineWidth(0.3);
    doc.line(8, y, W - 8, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(196, 122, 46);
    doc.text("PRE-EVENT", CX, y, { align: "center", charSpace: 0.8 });
    y += 6;
    preEventNotes.forEach(note => {
      doc.setFillColor(255, 249, 240);
      doc.roundedRect(6, y - 3.5, W - 12, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(44, 26, 14);
      const titleLines = doc.splitTextToSize(note.title, W - 22);
      doc.text(titleLines[0], 10, y + 0.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(155, 116, 80);
      doc.text(note.subtitle || "", 10, y + 5);
      y += 11;
    });
  }

  // Footer
  const footerY = H - footerH;
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(0.3);
  doc.line(8, footerY, W - 8, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(155, 116, 80);
  doc.text("tendr.in  ·  contact@tendr.co.in", CX, footerY + 5, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.setTextColor(196, 122, 46);
  doc.text("We Curate, You Celebrate", CX, footerY + 10, { align: "center" });

  if (_websiteQR) {
    doc.addImage(_websiteQR, "PNG", CX - 7, footerY + 13, 14, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(196, 122, 46);
    doc.text("tendr.in", CX, footerY + 29, { align: "center" });
  }

  doc.save("tendr-day-schedule.pdf");
}

// ── Invitation Template PDF ──────────────────────────────────────────────────
function fmt12h(val) {
  if (!val) return "";
  const [h, m] = val.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function fmtDate(d) {
  if (!d) return "";
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${parseInt(m[3])} ${MONTHS[parseInt(m[2]) - 1]} ${m[1]}`;
  return d;
}

export async function generateInvitationPDF({ eventSummary = {}, confirmedVendors = [], userName = "", eventTime = "", personName = "", venueAddress = "" }) {
  await _assetsReady;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, CX = W / 2;

  const resolvedPersonName = personName || eventSummary.personName || "";
  const resolvedTime       = eventTime  || eventSummary.eventTime  || "";
  const resolvedVenue      = venueAddress || eventSummary.venueAddress || eventSummary.location || "";
  const eventType          = eventSummary.eventType || "Celebration";

  // ── HERO (dark top block) ──────────────────────────────────────────
  const heroH = 72;
  doc.setFillColor(44, 26, 14);
  doc.rect(0, 0, W, heroH, "F");

  // Gold stripe
  doc.setFillColor(196, 122, 46);
  doc.rect(0, heroH, W, 1.5, "F");

  // Ivory body background
  doc.setFillColor(250, 246, 239);
  doc.rect(0, heroH + 1.5, W, H - heroH - 1.5, "F");

  // Hero top diamond divider
  drawOrnamentDivider(doc, CX, 16);

  // Event type — italic gold
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.setTextColor(232, 193, 122);
  doc.text(sanitize(eventType), CX, 27, { align: "center" });

  // Person name — large white
  const heroName = resolvedPersonName ? `${sanitize(resolvedPersonName)}'s` : sanitize(eventType);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(255, 255, 255);
  doc.text(heroName, CX, 46, { align: "center" });

  // Event type again — gold italic below name
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(16);
  doc.setTextColor(196, 122, 46);
  doc.text(sanitize(eventType), CX, 58, { align: "center" });

  // Hero bottom diamond divider
  drawOrnamentDivider(doc, CX, 67);

  // ── LOGO STRIP ────────────────────────────────────────────────────
  const bodyStart = heroH + 1.5;
  if (_logoLight) {
    doc.addImage(_logoLight, "PNG", CX - 27, bodyStart + 6, 54, 18);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(196, 122, 46);
    doc.text("tendr", CX, bodyStart + 16, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(155, 116, 80);
    doc.text("WE CURATE YOU CELEBRATE", CX, bodyStart + 22, { align: "center", charSpace: 1 });
  }

  // Hairline below logo
  const lineY = bodyStart + 30;
  doc.setDrawColor(155, 116, 80);
  doc.setLineWidth(0.25);
  doc.line(14, lineY, W - 14, lineY);

  // ── INVITE LINE ───────────────────────────────────────────────────
  let y = lineY + 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(155, 116, 80);
  doc.text("YOU ARE CORDIALLY INVITED TO JOIN THE CELEBRATION", CX, y, { align: "center", charSpace: 1.2 });
  y += 10;

  // ── INFO GRID (Date | Time | Guests) ─────────────────────────────
  const gridH = 22;
  doc.setFillColor(240, 233, 223);
  doc.roundedRect(14, y, 182, gridH, 2, 2, "F");

  // Vertical dividers
  doc.setDrawColor(92, 58, 26);
  doc.setLineWidth(0.15);
  const divX1 = 14 + 60, divX2 = 14 + 120;
  doc.line(divX1, y + 3, divX1, y + gridH - 3);
  doc.line(divX2, y + 3, divX2, y + gridH - 3);

  const c1 = 14 + 30, c2 = 14 + 90, c3 = 14 + 150;
  const lblY = y + 7, valY = y + 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(155, 116, 80);
  doc.text("DATE",   c1, lblY, { align: "center", charSpace: 1 });
  doc.text("TIME",   c2, lblY, { align: "center", charSpace: 1 });
  doc.text("GUESTS", c3, lblY, { align: "center", charSpace: 1 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(44, 26, 14);
  doc.text(fmtDate(eventSummary.date) || "—", c1, valY, { align: "center" });

  if (resolvedTime) {
    doc.setFontSize(13);
    doc.setTextColor(92, 58, 26);
    doc.text(fmt12h(resolvedTime), c2, valY, { align: "center" });
  } else {
    doc.setFontSize(11);
    doc.setTextColor(155, 116, 80);
    doc.text("—", c2, valY, { align: "center" });
  }

  doc.setFontSize(11);
  doc.setTextColor(44, 26, 14);
  doc.text(eventSummary.guests ? `${eventSummary.guests} guests` : "—", c3, valY, { align: "center" });

  y += gridH + 6;

  // ── VENUE ROW ─────────────────────────────────────────────────────
  if (resolvedVenue) {
    const venueLines = doc.splitTextToSize(sanitize(resolvedVenue), 148);
    const venueH = Math.max(16, venueLines.length * 5 + 10);
    doc.setFillColor(240, 233, 223);
    doc.roundedRect(14, y, 182, venueH, 2, 2, "F");

    // Pin icon (dark circle with "V")
    doc.setFillColor(44, 26, 14);
    doc.circle(26, y + venueH / 2, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(196, 122, 46);
    doc.text("V", 26, y + venueH / 2 + 2, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(155, 116, 80);
    doc.text("VENUE", 34, y + venueH / 2 - 3, { charSpace: 1 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(44, 26, 14);
    doc.text(venueLines, 34, y + venueH / 2 + 4);

    y += venueH + 6;
  }

  // ── HOSTED BY + RSVP ─────────────────────────────────────────────
  doc.setDrawColor(196, 122, 46);
  doc.setLineWidth(1.5);
  doc.line(14, y, 101, y);
  doc.line(111, y, 196, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(155, 116, 80);
  doc.text("HOSTED BY", 14, y, { charSpace: 1 });
  doc.text("RSVP", 111, y, { charSpace: 1 });
  y += 6;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(44, 26, 14);
  doc.text(sanitize(userName) || "—", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(92, 58, 26);
  doc.text("contact@tendr.co.in", 111, y);
  doc.text("+91 9211668427", 111, y + 6);

  y += 14;

  // ── CLOSING ───────────────────────────────────────────────────────
  y += 6;
  doc.setDrawColor(155, 116, 80);
  doc.setLineWidth(0.25);
  doc.line(14, y, W - 14, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(155, 116, 80);
  doc.text("We look forward to", CX, y, { align: "center" });
  y += 9;

  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(20);
  doc.setTextColor(44, 26, 14);
  doc.text("Celebrating with you!", CX, y, { align: "center" });

  // ── FOOTER DARK STRIP ─────────────────────────────────────────────
  const footerY = 264;
  doc.setFillColor(44, 26, 14);
  doc.rect(0, footerY, W, 33, "F");

  if (_logoLight) {
    doc.addImage(_logoLight, "PNG", 14, footerY + 7, 40, 16);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(155, 116, 80);
  doc.text("WE CURATE · YOU CELEBRATE", 60, footerY + 12, { charSpace: 0.5 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(196, 122, 46);
  doc.text("contact@tendr.co.in  ·  tendr.co.in  ·  +91 9211668427", 60, footerY + 20);

  if (_websiteQR) {
    doc.addImage(_websiteQR, "PNG", W - 30, footerY + 5, 18, 18);
  }

  doc.save("tendr-invitation.pdf");
}
