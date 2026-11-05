export const ACCENTS = {
  mocha: { label: "Mocha Brown", hsl: "23 13% 27%", swatch: "#4E433C" },
  taupe: { label: "Taupe", hsl: "31 17% 59%", swatch: "#A79684" },
  champagne: { label: "Champagne", hsl: "33 34% 66%", swatch: "#C9AE8E" },
  charcoal: { label: "Charcoal", hsl: "24 8% 20%", swatch: "#3A342F" },
};

export const FONTS = {
  italiana: { label: "Italiana", stack: '"Italiana", "Cormorant Garamond", Georgia, serif' },
  cormorant: { label: "Cormorant Garamond", stack: '"Cormorant Garamond", Georgia, serif' },
  marcellus: { label: "Marcellus", stack: '"Marcellus", "Cormorant Garamond", Georgia, serif' },
  jost: { label: "Jost", stack: '"Jost", "Inter", system-ui, sans-serif' },
};

export const SECTION_LABELS = {
  hero: "Hero",
  projects: "Selected Projects",
  services: "Services",
  about: "About",
  contact: "Contact",
};

export const DEFAULT_SECTIONS = [
  { key: "hero", label: "Hero", visible: true, order: 1 },
  { key: "projects", label: "Selected Projects", visible: true, order: 2 },
  { key: "services", label: "Services", visible: true, order: 3 },
  { key: "about", label: "About", visible: true, order: 4 },
  { key: "contact", label: "Contact", visible: true, order: 5 },
];

export const themeVars = (content = {}) => {
  const accent = ACCENTS[content.accent] || ACCENTS.mocha;
  const font = FONTS[content.display_font] || FONTS.italiana;
  return { "--brand-accent": accent.hsl, "--font-display": font.stack };
};