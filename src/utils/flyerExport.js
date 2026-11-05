import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvitationFlyerEngine from "../components/invitation/InvitationFlyerEngine";
import { PALETTES } from "../data/invitationDesignTokens";

// WhatsApp portrait / Instagram Story / Square. The flyer is rendered once
// at its natural (unclipped) composition — the same box the on-screen
// editor shows, which already grows to fit however many fields an occasion
// adds — then contain-fit scaled into each ratio's canvas with the
// template's own background color filling any letterbox space. This is
// deliberate: a fixed-height re-render that just centers content (tried
// first) still clips a template with several occasion-specific fields once
// its content is taller than the target canvas — exactly the "don't simply
// crop" failure the brief calls out. Scale-to-fit can never clip.
const RATIOS = {
  whatsapp: { width: 1080, height: 1350, label: "WhatsApp (1080x1350)" },
  story:    { width: 1080, height: 1920, label: "Instagram Story (1080x1920)" },
  square:   { width: 1080, height: 1080, label: "Square (1080x1080)" },
};

function renderOffscreen(template, data, fieldSchema, styleOverride) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-9999px";
  host.style.top = "0";
  document.body.appendChild(host);
  const root = createRoot(host);
  // createRoot's render is async (commits on a microtask) — flushSync forces
  // the DOM to exist synchronously so host.firstChild is populated below,
  // instead of html2canvas racing an empty off-screen node.
  flushSync(() => {
    root.render(
      React.createElement(InvitationFlyerEngine, { template, data, fieldSchema, styleOverride, editable: false })
    );
  });
  return {
    node: host.firstChild,
    cleanup: () => { root.unmount(); document.body.removeChild(host); },
  };
}

async function waitForAssets(node) {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })));
  // Google Fonts swap-in + layout settle.
  await new Promise(res => setTimeout(res, 150));
}

function resolveBg(template, styleOverride) {
  const id = styleOverride?.paletteId || template.paletteId;
  return (PALETTES[id] || PALETTES["cream-gold"]).bg;
}

async function renderFlyerCanvas(template, data, fieldSchema, styleOverride) {
  const { node, cleanup } = renderOffscreen(template, data, fieldSchema, styleOverride);
  try {
    await waitForAssets(node);
    return await html2canvas(node, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
  } finally {
    cleanup();
  }
}

function compositeContain(sourceCanvas, targetW, targetH, bgColor) {
  const out = document.createElement("canvas");
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext("2d");
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, targetW, targetH);
  const scale = Math.min(targetW / sourceCanvas.width, targetH / sourceCanvas.height);
  const w = sourceCanvas.width * scale;
  const h = sourceCanvas.height * scale;
  ctx.drawImage(sourceCanvas, (targetW - w) / 2, (targetH - h) / 2, w, h);
  return out;
}

function download(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportAllFlyerImages(template, data, fieldSchema, styleOverride, filenameBase) {
  const sourceCanvas = await renderFlyerCanvas(template, data, fieldSchema, styleOverride);
  const bg = resolveBg(template, styleOverride);
  Object.entries(RATIOS).forEach(([key, r]) => {
    const canvas = compositeContain(sourceCanvas, r.width, r.height, bg);
    download(canvas.toDataURL("image/png"), `${filenameBase}-${key}.png`);
  });
}

export async function exportFlyerImage(template, data, fieldSchema, styleOverride, ratioKey, filenameBase) {
  const r = RATIOS[ratioKey];
  const sourceCanvas = await renderFlyerCanvas(template, data, fieldSchema, styleOverride);
  const bg = resolveBg(template, styleOverride);
  const canvas = compositeContain(sourceCanvas, r.width, r.height, bg);
  download(canvas.toDataURL("image/png"), `${filenameBase}-${ratioKey}.png`);
}

export async function exportFlyerPdf(template, data, fieldSchema, styleOverride, filenameBase) {
  const canvas = await renderFlyerCanvas(template, data, fieldSchema, styleOverride);
  const imgData = canvas.toDataURL("image/png");
  const pxToMm = px => (px * 25.4) / 96;
  const w = pxToMm(canvas.width / 3);
  const h = pxToMm(canvas.height / 3);
  const doc = new jsPDF({ unit: "mm", format: [w, h] });
  doc.addImage(imgData, "PNG", 0, 0, w, h);
  doc.save(`${filenameBase}.pdf`);
}

export const FLYER_EXPORT_RATIOS = RATIOS;
