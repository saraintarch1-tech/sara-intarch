/**
 * Copyright watermark.
 *
 * The mark is painted into the pixels of a derivative image — never applied as
 * a CSS overlay — so every screenshot, download or re-share keeps it.
 */

export const WATERMARK_TEXT = "ARCH SARA HAMAMI";

export const WATERMARK_DEFAULTS = {
  enabled: true,
  opacity: 12,
  scale: 3,
  pattern: "diagonal",
};

export const WATERMARK_PATTERNS = [
  { value: "diagonal", label: "Diagonal" },
  { value: "cross", label: "Cross-hatch" },
  { value: "rows", label: "Rows" },
];

const PATTERN_ANGLES = { diagonal: [-38], cross: [-38, 38], rows: [0] };

// Soft white reads on a dark photograph, muted taupe on a bright one.
const TONE_COLOURS = { light: "#FFFFFF", dark: "#5C4A3A" };

const MAX_SIDE = 3200;
const TEXT_FONT = 'Italiana, "Cormorant Garamond", Georgia, serif';

export function watermarkSettings(settings) {
  return { ...WATERMARK_DEFAULTS, ...(settings || {}) };
}

/** Identifies the look a baked file was made with, so re-runs stay idempotent. */
export function watermarkStamp(settings) {
  const s = watermarkSettings(settings);
  return [s.opacity, s.scale, s.pattern].join("|");
}

function measureTracked(ctx, text, tracking) {
  let width = 0;
  for (const char of text) width += ctx.measureText(char).width + tracking;
  return width - tracking;
}

function drawTracked(ctx, text, x, y, tracking) {
  let cursor = x;
  for (const char of text) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + tracking;
  }
}

/**
 * Paints the repeating mark over an already drawn canvas.
 * Shared by the baking pass and the dashboard preview.
 */
export function paintWatermark(ctx, width, height, settings, tone = "light") {
  const { opacity: rawOpacity, scale, pattern } = watermarkSettings(settings);
  const opacity = Math.min(0.2, Math.max(0.02, rawOpacity / 100));
  const fontSize = Math.max(13, (width * scale) / 100);
  const tracking = fontSize * 0.3;
  const pitchY = fontSize * 5.6;
  const span = Math.hypot(width, height);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = TONE_COLOURS[tone] || TONE_COLOURS.light;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `300 ${fontSize}px ${TEXT_FONT}`;

  const pitchX = measureTracked(ctx, WATERMARK_TEXT, tracking) + fontSize * 3.6;

  for (const degrees of PATTERN_ANGLES[pattern] || PATTERN_ANGLES.diagonal) {
    ctx.save();
    ctx.rotate((degrees * Math.PI) / 180);
    let row = 0;
    for (let y = -span; y <= span; y += pitchY) {
      const shift = row % 2 ? pitchX / 2 : 0;
      for (let x = -span; x <= span; x += pitchX) {
        drawTracked(ctx, WATERMARK_TEXT, x + shift, y, tracking);
      }
      row += 1;
    }
    ctx.restore();
  }
  ctx.restore();
}

/** Reads the average brightness of a drawing to pick the mark's colour. */
export function toneFor(source) {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, 24, 24);
  const { data } = ctx.getImageData(0, 0, 24, 24);
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  const luminance = total / (255 * (data.length / 4));
  return luminance > 0.55 ? "dark" : "light";
}

function loadSource(source) {
  return new Promise((resolve, reject) => {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const image = new window.Image();
    if (typeof source === "string") image.crossOrigin = "anonymous";
    image.onload = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      reject(new Error("The image could not be read."));
    };
    image.src = url;
  });
}

/**
 * Bakes the mark into a JPEG derivative of `source` (a File/Blob or a URL that
 * allows cross-origin reads). The source itself is never modified, so repeated
 * runs can never stack two watermarks — every pass starts from the original.
 */
export async function bakeWatermark(source, settings) {
  const image = await loadSource(source);
  const ratio = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);

  const tone = toneFor(image);
  paintWatermark(ctx, width, height, settings, tone);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.94));
  return { blob, tone };
}