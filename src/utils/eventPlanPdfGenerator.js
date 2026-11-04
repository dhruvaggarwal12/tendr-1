import { jsPDF } from "jspdf";
import { addHeader, addFooter, sectionTitle, sanitize as sanitizeRupee, pdfAssetsReady } from "./pdfGenerator";

// Itinerary/timeline builders embed emoji in titles for the interactive UI
// (e.g. "🎂 Cake Cutting", "🎉 Party day") — Helvetica (Latin-1) can't render
// them, and leaving them in doesn't just show a missing-glyph box, it corrupts
// the rest of that text run's spacing. Strip emoji before the ₹→"Rs." pass.
function sanitize(val) {
  const stripped = String(val ?? "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/️/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return sanitizeRupee(stripped);
}

// ── Dedicated, real (non-screenshot) PDF for the generated event plan ──────
// Draws real text/lines with jsPDF's own primitives — reuses pdfGenerator.js's
// branding helpers (header/footer/section titles) so this looks like the same
// family of document as the Invoice/Timeline/Invitation PDFs, but lays itself
// out from the plan's own real data instead of capturing the webpage. Pages
// break intelligently (a heading is never left alone at the bottom of a page,
// a table row is never split across pages) and the actual page count is
// whatever the real content needs — never forced to a fixed number.

const PAGE_LEFT = 14;
const PAGE_RIGHT = 196;
const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT;
const TOP_Y = 38;
const BOTTOM_Y = 278; // leaves room for the footer rule at 285

const INK = [44, 26, 14];
const MUTED = [120, 95, 70];
const GOLD = [196, 122, 46];

// Ensures `needed` mm of room remains before the footer; starts a new page
// (with the header redrawn) first if it doesn't. Every section heading is
// measured together with at least its first line via this, so a heading can
// never end up alone at the bottom of a page.
function ensureSpace(doc, y, needed, pageTitle) {
  if (y + needed <= BOTTOM_Y) return y;
  doc.addPage();
  addHeader(doc, pageTitle);
  return TOP_Y;
}

function heading(doc, label, y, pageTitle) {
  y = ensureSpace(doc, y, 14, pageTitle);
  return sectionTitle(doc, label, y);
}

function paragraph(doc, text, y, pageTitle, { width = CONTENT_WIDTH, x = PAGE_LEFT, size = 9.5, color = INK, lineHeight = 4.6 } = {}) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(sanitize(text), width);
  y = ensureSpace(doc, y, lines.length * lineHeight + 2, pageTitle);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight + 2;
}

function subhead(doc, text, y, pageTitle) {
  y = ensureSpace(doc, y, 8, pageTitle);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(sanitize(text), PAGE_LEFT, y);
  return y + 6;
}

// Simple two-column item/quantity table — item name left, quantity + tier
// label right, a thin divider between rows. Each row is page-break-checked
// on its own so a row is never split across pages.
function drawItemTable(doc, items, y, pageTitle, { x = PAGE_LEFT, width = CONTENT_WIDTH } = {}) {
  items.forEach((it) => {
    y = ensureSpace(doc, y, 7, pageTitle);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const nameLines = doc.splitTextToSize(sanitize(it.name), width * 0.62);
    doc.text(nameLines, x, y);
    const qtyLabel = it.qty != null ? `x${it.qty}` : "";
    const tierLabel = it.tier || "";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...(it.tier === "To be decided" ? MUTED : GOLD));
    doc.text(sanitize(`${qtyLabel}${qtyLabel && tierLabel ? "  " : ""}${tierLabel}`), x + width, y, { align: "right" });
    const rowH = Math.max(nameLines.length * 4.6, 6);
    y += rowH;
    doc.setDrawColor(230, 220, 205);
    doc.setLineWidth(0.2);
    doc.line(x, y - 1.5, x + width, y - 1.5);
    y += 1.5;
  });
  return y + 2;
}

// Plain bulleted list for services whose own item strings already carry
// their real quantity in prose ("400+ edited photos", "5-hour coverage") —
// forcing these into a numeric column would duplicate or fabricate.
function drawBulletList(doc, items, y, pageTitle, { x = PAGE_LEFT, width = CONTENT_WIDTH } = {}) {
  items.forEach((text) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(sanitize(text), width - 5);
    y = ensureSpace(doc, y, lines.length * 4.6 + 1, pageTitle);
    doc.setTextColor(...GOLD);
    doc.text("-", x, y);
    doc.setTextColor(...INK);
    doc.text(lines, x + 4, y);
    y += lines.length * 4.6 + 1;
  });
  return y + 2;
}

function keyValueRow(doc, label, value, y, pageTitle) {
  y = ensureSpace(doc, y, 6, pageTitle);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(sanitize(label), PAGE_LEFT, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...INK);
  doc.text(sanitize(value), PAGE_LEFT + 38, y);
  return y + 6;
}

/**
 * Builds the full event-plan PDF from already-assembled plan data (see
 * OccasionDetail.jsx's buildPlanDataForPdf()) — no DOM, no screenshot.
 */
export async function generateEventPlanPDF(planData) {
  await pdfAssetsReady;
  const {
    occasionName, celebrantName, guests, budgetText, date, city, venueType,
    groups = [], journey = [], itinerary = [], itineraryLate = false,
    prep = [], timeline = null, equipment = [], checklist = [], budgetSplit = null,
  } = planData;

  const pageTitle = `${occasionName} Plan`;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, pageTitle);
  let y = TOP_Y;

  // ── Page 1 — Event Overview ──────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(sanitize(celebrantName ? `${celebrantName}'s ${occasionName}` : occasionName), PAGE_LEFT, y);
  y += 10;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(PAGE_LEFT, y, PAGE_RIGHT, y);
  y += 8;

  y = keyValueRow(doc, "Guests", `${guests} people`, y, pageTitle);
  y = keyValueRow(doc, "Budget", budgetText || "Not set", y, pageTitle);
  y = keyValueRow(doc, "Date", date || "TBD", y, pageTitle);
  y = keyValueRow(doc, "Location", [city, venueType].filter(Boolean).join(" · ") || "TBD", y, pageTitle);
  y += 4;

  if (budgetSplit?.length) {
    y = heading(doc, "Budget Split", y, pageTitle);
    budgetSplit.forEach((c) => {
      y = keyValueRow(doc, c.label, `${c.pct}% · Rs. ${Number(c.amt).toLocaleString("en-IN")}`, y, pageTitle);
    });
    y += 4;
  }

  // ── Selected Services (one card per vendor + entrance/fun/gifts groups) ──
  if (groups.length) {
    y = heading(doc, "Selected Services & Experiences", y, pageTitle);
    y = paragraph(doc, "All quantities below are initial recommendations based on your event requirements. Final quantities, deliverables and pricing will be discussed and confirmed with vendors during the booking process.", y, pageTitle, { size: 8.5, color: MUTED });
    y += 2;

    groups.forEach((g) => {
      y = ensureSpace(doc, y, 10, pageTitle);
      y = subhead(doc, g.label, y, pageTitle);
      if (g.paragraph) y = paragraph(doc, g.paragraph, y, pageTitle, { size: 9, color: MUTED });

      g.rows.forEach((r) => {
        y = ensureSpace(doc, y, 10, pageTitle);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        doc.text(sanitize(r.title), PAGE_LEFT, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...(r.status === "Quote required" ? MUTED : GOLD));
        doc.text(sanitize(r.status), PAGE_RIGHT, y, { align: "right" });
        y += 5;
        const subLine = [r.sub, r.price].filter(Boolean).join(" · ");
        if (subLine) y = paragraph(doc, subLine, y, pageTitle, { size: 9, color: MUTED, lineHeight: 4.2 });
        if (r.meta) y = paragraph(doc, r.meta, y, pageTitle, { size: 9, color: MUTED, lineHeight: 4.2 });

        if (r.locationGroups?.length) {
          r.locationGroups.forEach((grp) => {
            y = ensureSpace(doc, y, 8, pageTitle);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...GOLD);
            doc.text(sanitize(grp.location), PAGE_LEFT + 3, y);
            y += 5;
            y = drawItemTable(doc, grp.items, y, pageTitle, { x: PAGE_LEFT + 3, width: CONTENT_WIDTH - 3 });
          });
        } else if (r.items?.length) {
          y = drawBulletList(doc, r.items, y, pageTitle);
        } else if (r.note) {
          y = paragraph(doc, r.note, y, pageTitle, { size: 9, color: MUTED });
        }
        y += 3;
      });
      y += 3;
    });
  }

  // ── Celebration Experience — the 4 journey beats + day-of itinerary ──────
  if (journey.length) {
    y = heading(doc, "Celebration Experience", y, pageTitle);
    journey.forEach((beat, i) => {
      y = ensureSpace(doc, y, 12, pageTitle);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...GOLD);
      doc.text(`0${i + 1}`, PAGE_LEFT, y);
      doc.setTextColor(...INK);
      doc.text(sanitize(beat.title), PAGE_LEFT + 10, y);
      y += 5;
      y = paragraph(doc, beat.text, y, pageTitle, { x: PAGE_LEFT + 10, width: CONTENT_WIDTH - 10, size: 9, color: MUTED });
      y += 2;
    });
    y += 2;
  }

  if (itinerary.length) {
    y = heading(doc, "Event-Day Itinerary", y, pageTitle);
    if (itineraryLate) {
      y = paragraph(doc, "This schedule runs past midnight based on the start time you chose — consider an earlier start time if that's not intentional.", y, pageTitle, { size: 8.5, color: [153, 27, 27] });
    }
    itinerary.forEach((slot) => {
      y = ensureSpace(doc, y, 10, pageTitle);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...(slot.type === "highlight" ? GOLD : MUTED));
      doc.text(sanitize(slot.time), PAGE_LEFT, y);
      doc.setTextColor(...INK);
      doc.text(sanitize(slot.title), PAGE_LEFT + 24, y);
      y += 4.6;
      if (slot.desc) y = paragraph(doc, slot.desc, y, pageTitle, { x: PAGE_LEFT + 24, width: CONTENT_WIDTH - 24, size: 8.5, color: MUTED, lineHeight: 4 });
      y += 1.5;
    });
    y += 3;
  }

  // ── Preparation Plan — what Tendr handles, what's on you, the lead-up ───
  if (prep.length) {
    y = heading(doc, "Preparation Plan", y, pageTitle);
    prep.forEach((beat) => {
      y = ensureSpace(doc, y, 10, pageTitle);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(sanitize(`${beat.num}. ${beat.title}`), PAGE_LEFT, y);
      y += 5;
      y = paragraph(doc, beat.text, y, pageTitle, { size: 9, color: MUTED });
      y += 1;
    });
    y += 2;
  }

  if (timeline?.phases?.length) {
    y = heading(doc, `Preparation Timeline (${timeline.days} days to go)`, y, pageTitle);
    timeline.phases.forEach((p) => {
      y = ensureSpace(doc, y, 9, pageTitle);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...GOLD);
      doc.text(sanitize(p.date ? `${p.when} (${p.date})` : p.when), PAGE_LEFT, y);
      y += 5;
      y = drawBulletList(doc, p.tasks, y, pageTitle, { x: PAGE_LEFT + 3, width: CONTENT_WIDTH - 3 });
      y += 1;
    });
    y += 2;
  }

  // ── What to Arrange — itemised inventory with real quantities ───────────
  if (equipment.length) {
    y = heading(doc, "What to Arrange", y, pageTitle);
    equipment.forEach((cat) => {
      y = ensureSpace(doc, y, 8, pageTitle);
      y = subhead(doc, cat.cat, y, pageTitle);
      y = drawItemTable(doc, cat.items.map((it) => ({ name: it.name, qty: it.qty, tier: null })), y, pageTitle);
    });
    y += 2;
  }

  // ── Checklist ─────────────────────────────────────────────────────────
  if (checklist.length) {
    y = heading(doc, "Checklist", y, pageTitle);
    checklist.forEach((item) => {
      y = ensureSpace(doc, y, 6, pageTitle);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.3);
      doc.rect(PAGE_LEFT, y - 3.2, 3.2, 3.2);
      const lines = doc.splitTextToSize(sanitize(item), CONTENT_WIDTH - 8);
      doc.text(lines, PAGE_LEFT + 6, y);
      y += lines.length * 4.6 + 1;
    });
  }

  // Stamp every page's footer now that the real final page count is known.
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  return doc;
}
