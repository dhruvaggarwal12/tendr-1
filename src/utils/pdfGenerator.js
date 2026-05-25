import { jsPDF } from "jspdf";

const BRAND_DARK   = "#2C1A0E";
const BRAND_GOLD   = "#C47A2E";
const BRAND_LIGHT  = "#F8F4EF";
const BRAND_TAN    = "#9B7450";

function addHeader(doc, title) {
  doc.setFillColor(44, 26, 14);
  doc.rect(0, 0, 210, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(204, 171, 74);
  doc.text("Tendr", 14, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 24);
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
export function generateInvoicePDF({ eventSummary, confirmedVendors, amount, orderId, paymentId, userName }) {
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
  if (orderId) doc.text(`Order ID: ${orderId}`, 20, y + 21);
  if (paymentId) doc.text(`Payment ID: ${paymentId}`, 20, y + 26);

  // Status badge (paid)
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
  if (eventSummary.location)  y = row(doc, "Location:", eventSummary.location, y);
  if (eventSummary.guests)    y = row(doc, "Guests:", eventSummary.guests, y);
  y += 4;

  // Services table
  if (confirmedVendors.length > 0) {
    y = sectionTitle(doc, "Services Booked", y);
    // Table header
    doc.setFillColor(255, 250, 240);
    doc.rect(14, y - 4, 182, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(92, 58, 26);
    doc.text("Vendor Name", 18, y);
    doc.text("Service", 110, y);
    y += 3;
    doc.setDrawColor(204, 171, 74);
    doc.setLineWidth(0.2);
    doc.line(14, y, 196, y);
    y += 4;

    confirmedVendors.forEach((v, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(255, 252, 247);
        doc.rect(14, y - 3.5, 182, 6.5, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(44, 26, 14);
      doc.text(v.name, 18, y);
      doc.text(v.serviceType, 110, y);
      y += 7;
    });
    y += 4;
  }

  // Amount due
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
export function generateEventDetailsPDF({ eventSummary, confirmedVendors, pinnedMessages, userName, orderId }) {
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
  if (eventSummary.eventType) y = row(doc, "Event Type:",  eventSummary.eventType, y);
  if (eventSummary.date)      y = row(doc, "Event Date:",  eventSummary.date, y);
  if (eventSummary.location)  y = row(doc, "Location:",    eventSummary.location, y);
  if (eventSummary.guests)    y = row(doc, "Guests:",      eventSummary.guests, y);
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
