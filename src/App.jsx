import { useState, useRef, useEffect, useCallback } from "react";

const FONT_OPTIONS = [
  { label: "Playfair Display", value: "'Playfair Display', serif", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" },
  { label: "DM Sans", value: "'DM Sans', sans-serif", url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif", url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif", url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" },
  { label: "Sora", value: "'Sora', sans-serif", url: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" },
  { label: "Libre Baskerville", value: "'Libre Baskerville', serif", url: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap" },
  { label: "Outfit", value: "'Outfit', sans-serif", url: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" },
  { label: "Fraunces", value: "'Fraunces', serif", url: "https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;500;600;700;800;900&display=swap" },
  { label: "Manrope", value: "'Manrope', sans-serif", url: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" },
  { label: "Lora", value: "'Lora', serif", url: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap" },
];

const LAYOUT_DEFAULTS = { cardRadius: 12, buttonRadius: 6, cardPadding: 28, sectionGap: 32, contentPadding: 10, accentHeight: 3, borderWidth: 1, headingSpacing: 0 };

const PRESETS = {
  luxury: { primary: "#1a1a2e", secondary: "#c9a96e", accent: "#e8d5b7", neutral: "#f5f0e8", text: "#1a1a2e", headingFont: 2, bodyFont: 3, cardRadius: 16, buttonRadius: 8, cardPadding: 36, sectionGap: 40, contentPadding: 12, accentHeight: 2, borderWidth: 1, headingSpacing: 2 },
  modern: { primary: "#0d0d0d", secondary: "#ff4d00", accent: "#ff8a50", neutral: "#fafafa", text: "#0d0d0d", headingFont: 4, bodyFont: 1, cardRadius: 8, buttonRadius: 4, cardPadding: 24, sectionGap: 28, contentPadding: 8, accentHeight: 4, borderWidth: 1, headingSpacing: -1 },
  organic: { primary: "#2d3a2d", secondary: "#8b7355", accent: "#c4a77d", neutral: "#f7f4ef", text: "#2d3a2d", headingFont: 7, bodyFont: 9, cardRadius: 16, buttonRadius: 10, cardPadding: 32, sectionGap: 36, contentPadding: 11, accentHeight: 3, borderWidth: 1, headingSpacing: 0 },
  editorial: { primary: "#1c1c1c", secondary: "#b22222", accent: "#d4a574", neutral: "#fffef5", text: "#1c1c1c", headingFont: 0, bodyFont: 5, cardRadius: 4, buttonRadius: 2, cardPadding: 28, sectionGap: 32, contentPadding: 10, accentHeight: 3, borderWidth: 1, headingSpacing: 1 },
  tech: { primary: "#0a192f", secondary: "#64ffda", accent: "#8892b0", neutral: "#e6f1ff", text: "#0a192f", headingFont: 8, bodyFont: 1, cardRadius: 10, buttonRadius: 6, cardPadding: 24, sectionGap: 28, contentPadding: 9, accentHeight: 3, borderWidth: 1, headingSpacing: -1 },
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function textOn(bg) { return luminance(bg) > 0.55 ? "#1a1a1a" : "#ffffff"; }
function lighten(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return `#${[r, g, b].map(c => Math.min(255, c + Math.round((255 - c) * amt)).toString(16).padStart(2, "0")).join("")}`;
}
function darken(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return `#${[r, g, b].map(c => Math.max(0, Math.round(c * (1 - amt))).toString(16).padStart(2, "0")).join("")}`;
}

const TABS = ["Overview", "Logo", "Colors", "Typography", "Presentations", "Print", "Website", "Social Media", "Stationery"];

// ─── EXPORTABLE WRAPPER ─────────────────────────────────────────
function Exportable({ label, filename, children }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);

  const exportPNG = () => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scale = 3;
    const canvas = document.createElement("canvas");
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext("2d");

    let fontCSS = "";
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.cssText && rule.cssText.startsWith("@font-face")) {
              fontCSS += rule.cssText + "\n";
            }
          }
        } catch (e) {}
      }
    } catch (e) {}

    const clone = el.cloneNode(true);
    clone.style.margin = "0";
    clone.style.position = "static";
    const html = `<div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;">${clone.outerHTML}</div>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <defs><style type="text/css">${fontCSS}</style></defs>
      <foreignObject width="100%" height="100%">${html}</foreignObject>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `bous-${filename}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.onerror = () => { URL.revokeObjectURL(url); alert("Export failed — try Print to PDF instead."); };
    img.src = url;
  };

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {hover && (
        <button onClick={exportPNG} style={{
          position: "absolute", top: 8, right: 8, zIndex: 10,
          background: "rgba(0,0,0,0.75)", color: "#fff", border: "none",
          borderRadius: 6, padding: "5px 12px", fontSize: 10, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          backdropFilter: "blur(4px)",
        }}>↓ Export PNG</button>
      )}
      <div ref={ref}>{children}</div>
    </div>
  );
}

// ─── SECTION COMPONENTS ──────────────────────────────────────────

function Overview({ brand }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap + 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, minHeight: 320 }}>
        <Exportable label="Hero" filename="overview-hero">
          <div style={{ background: brand.primary, borderRadius: brand.cardRadius + 4, padding: brand.cardPadding + 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", boxSizing: "border-box" }}>
            <span style={{ fontFamily: brand.headingFont, fontSize: 56, fontWeight: 800, color: textOn(brand.primary), letterSpacing: brand.headingSpacing - 2, lineHeight: 1 }}>BOUS</span>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 15, color: textOn(brand.primary), opacity: 0.7, marginTop: 12 }}>Brand Identity Guidelines</span>
          </div>
        </Exportable>
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 24 }}>
          <div style={{ background: brand.secondary, borderRadius: brand.cardRadius + 4, padding: brand.cardPadding + 4, display: "flex", alignItems: "flex-end" }}>
            <span style={{ fontFamily: brand.headingFont, fontSize: 28, fontWeight: 700, color: textOn(brand.secondary) }}>Visual System</span>
          </div>
          <div style={{ background: brand.accent, borderRadius: brand.cardRadius + 4, padding: brand.cardPadding + 4, display: "flex", alignItems: "flex-end" }}>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 16, color: textOn(brand.accent) }}>A comprehensive guide to maintaining brand consistency across every touchpoint.</span>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {["Consistency", "Flexibility", "Recognition"].map((t, i) => (
          <div key={t} style={{ background: brand.neutral, border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}`, borderRadius: brand.cardRadius, padding: brand.cardPadding }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: [brand.primary, brand.secondary, brand.accent][i], marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: textOn([brand.primary, brand.secondary, brand.accent][i]), fontSize: 18, fontWeight: 700 }}>{i + 1}</span>
            </div>
            <h3 style={{ fontFamily: brand.headingFont, fontSize: 18, fontWeight: 700, color: brand.text, margin: "0 0 8px" }}>{t}</h3>
            <p style={{ fontFamily: brand.bodyFont, fontSize: 13, color: brand.text, opacity: 0.6, margin: 0, lineHeight: 1.6 }}>
              {["Ensure every touchpoint reflects the brand identity with precision and care.", "Adapt the system across media while preserving core brand attributes.", "Build lasting brand equity through distinctive, memorable visual language."][i]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoSection({ brand }) {
  const LogoMark = ({ size = 80, color = brand.primary }) => (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: brand.headingFont, fontSize: size * 0.45, fontWeight: 900, color, letterSpacing: -1 }}>B</span>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Exportable label="Logo Light" filename="logo-light">
          <div style={{ background: brand.neutral, border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}`, borderRadius: brand.cardRadius + 4, padding: brand.cardPadding + 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <LogoMark size={96} />
            <span style={{ fontFamily: brand.headingFont, fontSize: 36, fontWeight: 800, color: brand.primary, letterSpacing: brand.headingSpacing + 6 }}>BOUS</span>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.5, letterSpacing: 3, textTransform: "uppercase" }}>Primary Lockup — Light</span>
          </div>
        </Exportable>
        <Exportable label="Logo Dark" filename="logo-dark">
          <div style={{ background: brand.primary, borderRadius: brand.cardRadius + 4, padding: brand.cardPadding + 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <LogoMark size={96} color={textOn(brand.primary)} />
            <span style={{ fontFamily: brand.headingFont, fontSize: 36, fontWeight: 800, color: textOn(brand.primary), letterSpacing: brand.headingSpacing + 6 }}>BOUS</span>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: textOn(brand.primary), opacity: 0.5, letterSpacing: 3, textTransform: "uppercase" }}>Primary Lockup — Dark</span>
          </div>
        </Exportable>
      </div>
      <h3 style={{ fontFamily: brand.headingFont, fontSize: 16, fontWeight: 700, color: brand.text, margin: 0 }}>Clear Space & Minimum Size</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {[["Min clear space = 1× height of \"B\"", 56, brand.primary, true], ["Minimum: 28px digital", 28, brand.primary, false], ["Monochrome variant", 56, brand.secondary, false]].map(([label, sz, col, dashed], i) => (
          <div key={i} style={{ background: brand.neutral, borderRadius: brand.cardRadius, padding: brand.cardPadding + 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {dashed ? <div style={{ border: `2px dashed ${brand.secondary}`, padding: 24, borderRadius: 8 }}><LogoMark size={sz} color={col} /></div> : <LogoMark size={sz} color={col} />}
            <span style={{ fontFamily: brand.bodyFont, fontSize: 12, color: brand.text, opacity: 0.5 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorsSection({ brand }) {
  const palette = [
    { name: "Primary", hex: brand.primary }, { name: "Secondary", hex: brand.secondary },
    { name: "Accent", hex: brand.accent }, { name: "Neutral", hex: brand.neutral },
    { name: "Text", hex: brand.text }, { name: "Primary 70%", hex: lighten(brand.primary, 0.3) },
    { name: "Primary 40%", hex: lighten(brand.primary, 0.6) }, { name: "Secondary Light", hex: lighten(brand.secondary, 0.4) },
    { name: "Accent Dark", hex: darken(brand.accent, 0.25) },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap }}>
      <Exportable label="Color Palette" filename="color-palette">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {palette.slice(0, 5).map(c => (
            <div key={c.name} style={{ borderRadius: brand.cardRadius, overflow: "hidden", border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}` }}>
              <div style={{ background: c.hex, height: 100 }} />
              <div style={{ padding: "12px 14px", background: brand.neutral }}>
                <div style={{ fontFamily: brand.headingFont, fontSize: 13, fontWeight: 600, color: brand.text }}>{c.name}</div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: brand.text, opacity: 0.5, marginTop: 4 }}>{c.hex.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </Exportable>
      <h3 style={{ fontFamily: brand.headingFont, fontSize: 16, fontWeight: 700, color: brand.text, margin: 0 }}>Extended Palette</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {palette.slice(5).map(c => (
          <div key={c.name} style={{ borderRadius: brand.cardRadius, overflow: "hidden", border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}` }}>
            <div style={{ background: c.hex, height: 64 }} />
            <div style={{ padding: "10px 14px", background: brand.neutral }}>
              <div style={{ fontFamily: brand.bodyFont, fontSize: 12, color: brand.text }}>{c.name}</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: brand.text, opacity: 0.5, marginTop: 2 }}>{c.hex.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily: brand.headingFont, fontSize: 16, fontWeight: 700, color: brand.text, margin: 0 }}>Gradient Suggestions</h3>
      <Exportable label="Gradients" filename="gradients">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[[brand.primary, brand.secondary], [brand.secondary, brand.accent], [brand.primary, brand.accent]].map(([a, b], i) => (
            <div key={i} style={{ height: 80, borderRadius: brand.cardRadius, background: `linear-gradient(135deg, ${a}, ${b})` }} />
          ))}
        </div>
      </Exportable>
    </div>
  );
}

function TypographySection({ brand }) {
  const hName = FONT_OPTIONS.find(f => f.value === brand.headingFont)?.label || "Heading";
  const bName = FONT_OPTIONS.find(f => f.value === brand.bodyFont)?.label || "Body";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap }}>
      <Exportable label="Type System" filename="typography">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: brand.neutral, borderRadius: brand.cardRadius + 4, padding: brand.cardPadding + 8, border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}` }}>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.5, textTransform: "uppercase", letterSpacing: 2 }}>Display / Headings</span>
            <div style={{ fontFamily: brand.headingFont, fontSize: 48, fontWeight: 800, color: brand.primary, marginTop: 12, lineHeight: 1.1 }}>Aa Bb Cc</div>
            <div style={{ fontFamily: brand.headingFont, fontSize: 14, fontWeight: 400, color: brand.text, opacity: 0.6, marginTop: 8 }}>{hName}</div>
            <div style={{ fontFamily: brand.headingFont, color: brand.text, marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {[{ s: 48, w: 800, l: "H1 — 48px / 800" }, { s: 36, w: 700, l: "H2 — 36px / 700" }, { s: 24, w: 600, l: "H3 — 24px / 600" }, { s: 18, w: 600, l: "H4 — 18px / 600" }].map(t => (
                <div key={t.l} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: t.s * 0.5, fontWeight: t.w, lineHeight: 1.2 }}>Bous</span>
                  <span style={{ fontFamily: brand.bodyFont, fontSize: 10, opacity: 0.4 }}>{t.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: brand.neutral, borderRadius: brand.cardRadius + 4, padding: brand.cardPadding + 8, border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}` }}>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.5, textTransform: "uppercase", letterSpacing: 2 }}>Body / UI</span>
            <div style={{ fontFamily: brand.bodyFont, fontSize: 48, fontWeight: 400, color: brand.primary, marginTop: 12, lineHeight: 1.1 }}>Aa Bb Cc</div>
            <div style={{ fontFamily: brand.bodyFont, fontSize: 14, fontWeight: 400, color: brand.text, opacity: 0.6, marginTop: 8 }}>{bName}</div>
            <div style={{ fontFamily: brand.bodyFont, color: brand.text, marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0, opacity: 0.8 }}>Body Large — 16px. The quick brown fox jumps over the lazy dog.</p>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, opacity: 0.65 }}>Body Regular — 14px. Consistent type builds trust and recognition.</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, opacity: 0.5 }}>Caption — 12px. Annotations, metadata, and supplementary info.</p>
            </div>
          </div>
        </div>
      </Exportable>
    </div>
  );
}

function PresentationsSection({ brand }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap }}>
      <p style={{ fontFamily: brand.bodyFont, fontSize: 14, color: brand.text, opacity: 0.6, margin: 0 }}>Slide decks, keynotes, and pitch presentations. 16:9 aspect ratio.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Exportable label="Title Slide" filename="slide-title">
          <div style={{ aspectRatio: "16/9", background: brand.primary, borderRadius: brand.cardRadius, padding: `${brand.contentPadding}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "8%", right: "8%", fontFamily: brand.headingFont, fontSize: 14, fontWeight: 700, color: textOn(brand.primary), opacity: 0.6 }}>BOUS</div>
            <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: `linear-gradient(180deg, ${brand.secondary}33, transparent)` }} />
            <span style={{ fontFamily: brand.headingFont, fontSize: 22, fontWeight: 800, color: textOn(brand.primary), lineHeight: 1.15 }}>Presentation Title Goes Here</span>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 10, color: textOn(brand.primary), opacity: 0.6, marginTop: 8 }}>Subtitle or date line · March 2026</span>
          </div>
        </Exportable>
        <Exportable label="Content Slide" filename="slide-content">
          <div style={{ aspectRatio: "16/9", background: brand.neutral, borderRadius: brand.cardRadius, padding: `${brand.contentPadding - 2}%`, display: "flex", flexDirection: "column", border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}`, position: "relative" }}>
            <div style={{ width: "100%", height: brand.accentHeight, background: brand.secondary, borderRadius: 2, marginBottom: "6%" }} />
            <span style={{ fontFamily: brand.headingFont, fontSize: 16, fontWeight: 700, color: brand.primary }}>Section Heading</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: "auto" }}>
              {[brand.primary, brand.secondary, brand.accent].map((c, i) => (
                <div key={i} style={{ background: lighten(c, 0.85), borderRadius: brand.buttonRadius, padding: 10, borderLeft: `${brand.accentHeight}px solid ${c}` }}>
                  <div style={{ fontFamily: brand.headingFont, fontSize: 18, fontWeight: 700, color: c }}>0{i + 1}</div>
                  <div style={{ fontFamily: brand.bodyFont, fontSize: 8, color: brand.text, opacity: 0.5, marginTop: 4 }}>Key point description</div>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", bottom: "5%", right: "5%", fontFamily: brand.bodyFont, fontSize: 8, color: brand.text, opacity: 0.3 }}>BOUS · 04</div>
          </div>
        </Exportable>
        <Exportable label="Data Slide" filename="slide-data">
          <div style={{ aspectRatio: "16/9", background: brand.neutral, borderRadius: brand.cardRadius, padding: `${brand.contentPadding - 2}%`, display: "flex", flexDirection: "column", border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}` }}>
            <span style={{ fontFamily: brand.headingFont, fontSize: 14, fontWeight: 700, color: brand.primary }}>Data & Metrics</span>
            <div style={{ display: "flex", gap: 12, marginTop: "auto", alignItems: "flex-end", height: "55%" }}>
              {[65, 85, 45, 90, 70, 55, 80].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i % 2 === 0 ? brand.secondary : lighten(brand.secondary, 0.4), borderRadius: "4px 4px 0 0" }} />
              ))}
            </div>
          </div>
        </Exportable>
        <Exportable label="Closing Slide" filename="slide-closing">
          <div style={{ aspectRatio: "16/9", background: `linear-gradient(135deg, ${brand.primary}, ${darken(brand.primary, 0.3)})`, borderRadius: brand.cardRadius, padding: `${brand.contentPadding}%`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <span style={{ fontFamily: brand.headingFont, fontSize: 28, fontWeight: 800, color: brand.secondary }}>Thank You</span>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 10, color: textOn(brand.primary), opacity: 0.6, marginTop: 10 }}>contact@bous.com · bous.com</span>
          </div>
        </Exportable>
      </div>
    </div>
  );
}

function PrintSection({ brand }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap }}>
      <p style={{ fontFamily: brand.bodyFont, fontSize: 14, color: brand.text, opacity: 0.6, margin: 0 }}>Brochures, flyers, leaflets, and print collateral.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2 }}>Tri-fold Brochure — Front</span>
          <Exportable label="Brochure" filename="brochure-front">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderRadius: brand.cardRadius, overflow: "hidden", height: 240, border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}` }}>
              <div style={{ background: brand.primary, padding: 16, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <span style={{ fontFamily: brand.headingFont, fontSize: 20, fontWeight: 800, color: textOn(brand.primary) }}>BOUS</span>
                <span style={{ fontFamily: brand.bodyFont, fontSize: 7, color: textOn(brand.primary), opacity: 0.5, marginTop: 4 }}>Tagline here</span>
              </div>
              <div style={{ background: brand.neutral, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ width: 24, height: brand.accentHeight - 1 || 1, background: brand.secondary, marginBottom: 8 }} />
                <span style={{ fontFamily: brand.headingFont, fontSize: 10, fontWeight: 600, color: brand.text }}>About Us</span>
                <span style={{ fontFamily: brand.bodyFont, fontSize: 7, color: brand.text, opacity: 0.5, marginTop: 6, lineHeight: 1.6 }}>Brief intro text with key messaging points.</span>
              </div>
              <div style={{ background: brand.secondary, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontFamily: brand.headingFont, fontSize: 10, fontWeight: 600, color: textOn(brand.secondary) }}>Services</span>
                {["Strategy", "Design", "Growth"].map(s => (
                  <span key={s} style={{ fontFamily: brand.bodyFont, fontSize: 7, color: textOn(brand.secondary), opacity: 0.8, marginTop: 4 }}>→ {s}</span>
                ))}
              </div>
            </div>
          </Exportable>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2 }}>Event Flyer — A4</span>
          <Exportable label="Flyer" filename="event-flyer">
            <div style={{ borderRadius: brand.cardRadius, overflow: "hidden", height: 240, background: brand.primary, position: "relative", display: "flex", flexDirection: "column", padding: 24 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: `linear-gradient(180deg, ${brand.secondary}22, transparent)` }} />
              <div style={{ position: "absolute", bottom: 30, right: 24, width: 80, height: 80, borderRadius: "50%", border: `2px solid ${brand.secondary}44` }} />
              <span style={{ fontFamily: brand.headingFont, fontSize: 10, fontWeight: 600, color: brand.secondary, letterSpacing: 3, textTransform: "uppercase", zIndex: 1 }}>Event</span>
              <span style={{ fontFamily: brand.headingFont, fontSize: 26, fontWeight: 800, color: textOn(brand.primary), marginTop: 8, zIndex: 1, lineHeight: 1.1 }}>Annual Summit 2026</span>
              <div style={{ marginTop: "auto", zIndex: 1 }}>
                <span style={{ fontFamily: brand.bodyFont, fontSize: 9, color: textOn(brand.primary), opacity: 0.7 }}>June 15 · Athens · bous.com/events</span>
              </div>
            </div>
          </Exportable>
        </div>
      </div>
    </div>
  );
}

function WebsiteSection({ brand }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap }}>
      <p style={{ fontFamily: brand.bodyFont, fontSize: 14, color: brand.text, opacity: 0.6, margin: 0 }}>Website landing pages, headers, footers, and UI components.</p>
      <Exportable label="Website" filename="website-mockup">
        <div style={{ borderRadius: brand.cardRadius, overflow: "hidden", border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}` }}>
          <div style={{ background: brand.neutral, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${lighten(brand.primary, 0.88)}` }}>
            <span style={{ fontFamily: brand.headingFont, fontSize: 16, fontWeight: 800, color: brand.primary }}>BOUS</span>
            <div style={{ display: "flex", gap: 20 }}>
              {["About", "Services", "Work", "Contact"].map(l => (
                <span key={l} style={{ fontFamily: brand.bodyFont, fontSize: 12, color: brand.text, opacity: 0.6 }}>{l}</span>
              ))}
            </div>
            <div style={{ background: brand.primary, borderRadius: brand.buttonRadius, padding: "6px 14px" }}>
              <span style={{ fontFamily: brand.bodyFont, fontSize: 11, fontWeight: 600, color: textOn(brand.primary) }}>Get Started</span>
            </div>
          </div>
          <div style={{ background: brand.primary, padding: "48px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: brand.secondary, opacity: 0.08 }} />
            <div style={{ maxWidth: "60%", zIndex: 1, position: "relative" }}>
              <span style={{ fontFamily: brand.headingFont, fontSize: 32, fontWeight: 800, color: textOn(brand.primary), lineHeight: 1.15, display: "block" }}>Elevate Your Vision With Purpose</span>
              <span style={{ fontFamily: brand.bodyFont, fontSize: 13, color: textOn(brand.primary), opacity: 0.6, marginTop: 12, display: "block", lineHeight: 1.7 }}>Crafting memorable brand experiences that drive real results.</span>
              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <div style={{ background: brand.secondary, borderRadius: brand.buttonRadius + 2, padding: "10px 20px" }}>
                  <span style={{ fontFamily: brand.bodyFont, fontSize: 12, fontWeight: 600, color: textOn(brand.secondary) }}>Learn More</span>
                </div>
                <div style={{ border: `${brand.borderWidth}px solid ${textOn(brand.primary)}44`, borderRadius: brand.buttonRadius + 2, padding: "10px 20px" }}>
                  <span style={{ fontFamily: brand.bodyFont, fontSize: 12, color: textOn(brand.primary), opacity: 0.8 }}>Contact</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: brand.neutral, padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {["Strategy", "Design", "Growth"].map((t, i) => (
              <div key={t} style={{ background: "#fff", borderRadius: brand.cardRadius, padding: brand.cardPadding - 8, border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.88)}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: lighten([brand.primary, brand.secondary, brand.accent][i], 0.85), display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: [brand.primary, brand.secondary, brand.accent][i] }} />
                </div>
                <span style={{ fontFamily: brand.headingFont, fontSize: 14, fontWeight: 600, color: brand.text, display: "block" }}>{t}</span>
                <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.5, marginTop: 6, display: "block", lineHeight: 1.6 }}>Brief service description with key benefits.</span>
              </div>
            ))}
          </div>
        </div>
      </Exportable>
    </div>
  );
}

function SocialSection({ brand }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap }}>
      <p style={{ fontFamily: brand.bodyFont, fontSize: 14, color: brand.text, opacity: 0.6, margin: 0 }}>Instagram posts, stories, social banners, and profile assets.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <Exportable label="IG Bold" filename="ig-post-bold">
          <div style={{ aspectRatio: "1", background: brand.primary, borderRadius: brand.cardRadius, padding: `${brand.contentPadding + 2}%`, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -20, right: -20, width: 120, height: 120, borderRadius: "50%", border: `3px solid ${brand.secondary}33` }} />
            <span style={{ fontFamily: brand.headingFont, fontSize: 10, fontWeight: 600, color: brand.secondary, letterSpacing: 3 }}>BOUS</span>
            <div>
              <span style={{ fontFamily: brand.headingFont, fontSize: 20, fontWeight: 800, color: textOn(brand.primary), lineHeight: 1.15, display: "block" }}>Bold Statement Post</span>
              <span style={{ fontFamily: brand.bodyFont, fontSize: 9, color: textOn(brand.primary), opacity: 0.5, marginTop: 8, display: "block" }}>bous.com</span>
            </div>
          </div>
        </Exportable>
        <Exportable label="IG Quote" filename="ig-post-quote">
          <div style={{ aspectRatio: "1", background: brand.secondary, borderRadius: brand.cardRadius, padding: `${brand.contentPadding + 2}%`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <span style={{ fontFamily: brand.headingFont, fontSize: 28, fontWeight: 300, color: textOn(brand.secondary), opacity: 0.3, lineHeight: 1 }}>"</span>
            <span style={{ fontFamily: brand.headingFont, fontSize: 14, fontWeight: 600, color: textOn(brand.secondary), lineHeight: 1.5 }}>Design is thinking made visual.</span>
            <div style={{ width: 24, height: 2, background: textOn(brand.secondary), opacity: 0.3, marginTop: 12 }} />
            <span style={{ fontFamily: brand.bodyFont, fontSize: 9, color: textOn(brand.secondary), opacity: 0.6, marginTop: 8 }}>@bous</span>
          </div>
        </Exportable>
        <Exportable label="IG Carousel" filename="ig-post-carousel">
          <div style={{ aspectRatio: "1", background: brand.accent, borderRadius: brand.cardRadius, padding: `${brand.contentPadding + 2}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}>
            <div style={{ position: "absolute", top: "10%", right: "10%", display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: textOn(brand.accent), opacity: i === 0 ? 1 : 0.3 }} />)}
            </div>
            <span style={{ fontFamily: brand.headingFont, fontSize: 11, fontWeight: 600, color: textOn(brand.accent), letterSpacing: 2, textTransform: "uppercase" }}>Tip #01</span>
            <span style={{ fontFamily: brand.headingFont, fontSize: 16, fontWeight: 700, color: textOn(brand.accent), marginTop: 6, lineHeight: 1.3 }}>Carousel Content Format</span>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 9, color: textOn(brand.accent), opacity: 0.7, marginTop: 6 }}>Swipe for more →</span>
          </div>
        </Exportable>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24 }}>
        <Exportable label="Story" filename="ig-story">
          <div style={{ width: 140, aspectRatio: "9/16", background: `linear-gradient(180deg, ${brand.primary}, ${brand.secondary})`, borderRadius: brand.cardRadius + 2, padding: `${brand.contentPadding}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <span style={{ fontFamily: brand.headingFont, fontSize: 12, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Story Template</span>
            <span style={{ fontFamily: brand.bodyFont, fontSize: 7, color: "#fff", opacity: 0.7, marginTop: 4 }}>Swipe up ↑</span>
          </div>
        </Exportable>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          <h3 style={{ fontFamily: brand.headingFont, fontSize: 16, fontWeight: 700, color: brand.text, margin: 0 }}>Stories & Reels</h3>
          <p style={{ fontFamily: brand.bodyFont, fontSize: 13, color: brand.text, opacity: 0.6, margin: 0, lineHeight: 1.7, maxWidth: 380 }}>
            Use the gradient overlay from Primary → Secondary. Keep text minimal. Logo mark in the top-left. 9:16 aspect ratio with safe zones.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {["#bous", "#brand", "#design"].map(h => (
              <span key={h} style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.secondary, background: lighten(brand.secondary, 0.85), padding: "4px 10px", borderRadius: brand.buttonRadius + 14 }}>{h}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StationerySection({ brand }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: brand.sectionGap }}>
      <p style={{ fontFamily: brand.bodyFont, fontSize: 14, color: brand.text, opacity: 0.6, margin: 0 }}>Business cards, letterheads, envelopes, and email signatures.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2 }}>Business Card — Front</span>
          <Exportable label="Card Front" filename="business-card-front">
            <div style={{ aspectRatio: "1.8", background: brand.primary, borderRadius: brand.cardRadius, padding: `${brand.contentPadding - 2}%`, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: brand.secondary, opacity: 0.1 }} />
              <span style={{ fontFamily: brand.headingFont, fontSize: 18, fontWeight: 800, color: textOn(brand.primary) }}>BOUS</span>
              <div>
                <span style={{ fontFamily: brand.headingFont, fontSize: 12, fontWeight: 600, color: textOn(brand.primary), display: "block" }}>Paris Karamanos</span>
                <span style={{ fontFamily: brand.bodyFont, fontSize: 9, color: textOn(brand.primary), opacity: 0.6, marginTop: 2, display: "block" }}>Founder & Director</span>
              </div>
            </div>
          </Exportable>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2 }}>Business Card — Back</span>
          <Exportable label="Card Back" filename="business-card-back">
            <div style={{ aspectRatio: "1.8", background: brand.neutral, borderRadius: brand.cardRadius, padding: `${brand.contentPadding - 2}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end", border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {["hello@bous.com", "+30 210 000 0000", "bous.com", "Athens, Greece"].map(l => (
                  <span key={l} style={{ fontFamily: brand.bodyFont, fontSize: 9, color: brand.text, opacity: 0.6 }}>{l}</span>
                ))}
              </div>
              <div style={{ width: 32, height: brand.accentHeight, background: brand.secondary, borderRadius: 2, marginTop: 12 }} />
            </div>
          </Exportable>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2 }}>Letterhead — A4</span>
        <Exportable label="Letterhead" filename="letterhead">
          <div style={{ background: "#fff", borderRadius: brand.cardRadius, border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}`, padding: brand.cardPadding + 4, minHeight: 220, position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: brand.accentHeight + 1, background: `linear-gradient(90deg, ${brand.primary}, ${brand.secondary})`, borderRadius: "10px 10px 0 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }}>
              <span style={{ fontFamily: brand.headingFont, fontSize: 18, fontWeight: 800, color: brand.primary }}>BOUS</span>
              <div style={{ textAlign: "right" }}>
                {["hello@bous.com", "+30 210 000 0000"].map(l => (
                  <span key={l} style={{ fontFamily: brand.bodyFont, fontSize: 9, color: brand.text, opacity: 0.4, display: "block" }}>{l}</span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 36 }}>
              <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.3 }}>Dear [Recipient],</span>
              <div style={{ width: "70%", marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {[1, 0.8, 0.9, 0.5].map((w, i) => <div key={i} style={{ height: 6, borderRadius: 3, background: lighten(brand.primary, 0.88), width: `${w * 100}%` }} />)}
              </div>
            </div>
          </div>
        </Exportable>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2 }}>Email Signature</span>
        <Exportable label="Signature" filename="email-signature">
          <div style={{ background: "#fff", borderRadius: brand.cardRadius, border: `${brand.borderWidth}px solid ${lighten(brand.primary, 0.85)}`, padding: brand.cardPadding - 8, display: "flex", gap: 16, maxWidth: 420 }}>
            <div style={{ width: brand.accentHeight, background: brand.secondary, borderRadius: 2, flexShrink: 0 }} />
            <div>
              <span style={{ fontFamily: brand.headingFont, fontSize: 13, fontWeight: 700, color: brand.primary, display: "block" }}>Paris Karamanos</span>
              <span style={{ fontFamily: brand.bodyFont, fontSize: 10, color: brand.text, opacity: 0.5, display: "block", marginTop: 2 }}>Founder & Director · BOUS</span>
              <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                {["hello@bous.com", "bous.com"].map(l => (
                  <span key={l} style={{ fontFamily: brand.bodyFont, fontSize: 9, color: brand.secondary }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </Exportable>
      </div>
    </div>
  );
}

// ─── PROFILE MANAGER ─────────────────────────────────────────────
function ProfileManager({ brand, onLoad, onNotify }) {
  const [profiles, setProfiles] = useState({});
  const [saveName, setSaveName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSave, setShowSave] = useState(false);

  const loadProfiles = useCallback(() => {
    try {
      const stored = localStorage.getItem("brand-profiles");
      if (stored) setProfiles(JSON.parse(stored));
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const saveProfile = () => {
    if (!saveName.trim()) return;
    const key = saveName.trim();
    const updated = { ...profiles, [key]: { ...brand, savedAt: new Date().toISOString() } };
    try {
      localStorage.setItem("brand-profiles", JSON.stringify(updated));
      setProfiles(updated);
      setSaveName("");
      setShowSave(false);
      onNotify(`"${key}" saved`);
    } catch (e) { onNotify("Save failed"); }
  };

  const deleteProfile = (key) => {
    const updated = { ...profiles };
    delete updated[key];
    try {
      localStorage.setItem("brand-profiles", JSON.stringify(updated));
      setProfiles(updated);
      onNotify(`"${key}" deleted`);
    } catch (e) { onNotify("Delete failed"); }
  };

  const keys = Object.keys(profiles);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button onClick={() => setShowSave(!showSave)} style={{
        width: "100%", padding: "7px 0", borderRadius: 6, border: "1px solid #ddd",
        background: showSave ? "#333" : "#fff", color: showSave ? "#fff" : "#333",
        fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
      }}>💾 Save Current</button>

      {showSave && (
        <div style={{ display: "flex", gap: 4 }}>
          <input value={saveName} onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveProfile()}
            placeholder="Profile name..." autoFocus
            style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 11 }}
          />
          <button onClick={saveProfile} style={{
            padding: "6px 12px", borderRadius: 6, border: "none",
            background: "#333", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>Save</button>
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: 11, color: "#999", textAlign: "center", padding: 8 }}>Loading...</div>
      ) : keys.length === 0 ? (
        <div style={{ fontSize: 10, color: "#bbb", textAlign: "center", padding: 8, lineHeight: 1.5 }}>No saved profiles yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
          {keys.map(key => {
            const p = profiles[key];
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, border: "1px solid #eee", background: "#fafafa" }}>
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  {[p.primary, p.secondary, p.accent].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: c, border: "1px solid #ddd" }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#333", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{key}</span>
                <button onClick={() => { const { savedAt, ...rest } = p; onLoad(rest); onNotify(`"${key}" loaded`); }}
                  style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", fontSize: 9, cursor: "pointer", fontWeight: 600 }}>Load</button>
                <button onClick={() => deleteProfile(key)}
                  style={{ padding: "2px 6px", borderRadius: 4, border: "1px solid #e8c0c0", background: "#fff5f5", fontSize: 9, cursor: "pointer", color: "#c44" }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
export default function BousBrandGuidelines() {
  const [activeTab, setActiveTab] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [notification, setNotification] = useState(null);
  const [brand, setBrand] = useState({
    primary: "#1a1a2e", secondary: "#c9a96e", accent: "#e8d5b7",
    neutral: "#f5f0e8", text: "#1a1a2e",
    headingFont: FONT_OPTIONS[2].value, bodyFont: FONT_OPTIONS[3].value,
    ...LAYOUT_DEFAULTS,
  });

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 2500); };

  useEffect(() => {
    const existing = document.querySelectorAll("link[data-bous-font]");
    existing.forEach(el => el.remove());
    const urls = new Set();
    FONT_OPTIONS.forEach(f => { if (brand.headingFont === f.value || brand.bodyFont === f.value) urls.add(f.url); });
    urls.forEach(url => {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = url;
      link.setAttribute("data-bous-font", "true");
      document.head.appendChild(link);
    });
  }, [brand.headingFont, brand.bodyFont]);

  const update = (key, val) => setBrand(prev => ({ ...prev, [key]: val }));
  const applyPreset = (name) => {
    const p = PRESETS[name];
    setBrand(prev => ({ ...prev, primary: p.primary, secondary: p.secondary, accent: p.accent, neutral: p.neutral, text: p.text, headingFont: FONT_OPTIONS[p.headingFont].value, bodyFont: FONT_OPTIONS[p.bodyFont].value, cardRadius: p.cardRadius, buttonRadius: p.buttonRadius, cardPadding: p.cardPadding, sectionGap: p.sectionGap, contentPadding: p.contentPadding, accentHeight: p.accentHeight, borderWidth: p.borderWidth, headingSpacing: p.headingSpacing }));
  };

  const exportPDF = () => {
    const hFont = FONT_OPTIONS.find(f => f.value === brand.headingFont);
    const bFont = FONT_OPTIONS.find(f => f.value === brand.bodyFont);
    const fontLinks = [hFont?.url, bFont?.url].filter(Boolean).map(u => `<link rel="stylesheet" href="${u}">`).join("\n");
    const win = window.open("", "_blank");
    if (!win) { notify("Pop-up blocked"); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>BOUS Brand Guidelines</title>${fontLinks}
    <style>
      *{box-sizing:border-box;margin:0;padding:0;
        -webkit-print-color-adjust:exact!important;
        print-color-adjust:exact!important;
        color-adjust:exact!important;
      }
      body{font-family:${brand.bodyFont};color:${brand.text};padding:48px 56px;background:#fff}
      @media print{
        body{padding:24px}
        .no-print{display:none!important}
        .section{page-break-inside:avoid}
        *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
      }
      .print-btn{position:fixed;top:20px;right:20px;z-index:100;padding:12px 28px;border-radius:8px;border:none;background:${brand.primary};color:${textOn(brand.primary)};font-size:14px;font-weight:600;cursor:pointer;font-family:${brand.bodyFont}}
      .color-row{display:flex;gap:16px;flex-wrap:wrap;margin:16px 0}
      .color-chip{width:120px;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0}
      .color-chip .sw{height:72px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      .color-chip .lb{padding:10px;font-size:12px}
      .color-chip .hx{font-family:monospace;font-size:10px;color:#999;margin-top:2px}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      td,th{border:1px solid #eee;padding:12px;text-align:left;font-size:12px}
      th{background:${lighten(brand.primary, 0.92)};font-weight:600;font-family:${brand.headingFont}}
      h2{font-family:${brand.headingFont};font-size:28px;font-weight:800;color:${brand.primary};margin:48px 0 6px}
      h3{font-family:${brand.headingFont};font-size:18px;font-weight:700;color:${brand.primary};margin:28px 0 10px}
      .bar{width:40px;height:3px;background:${brand.secondary};border-radius:2px;margin-bottom:20px}
      .note{font-size:13px;color:${brand.text};opacity:0.6;line-height:1.7;margin:8px 0 0}
      .spacing-demo{border:1px solid #ddd;border-radius:8px;padding:20px;margin:16px 0;position:relative}
      .dim-label{font-family:monospace;font-size:10px;color:${brand.secondary};font-weight:600}
    </style></head><body>
    <button class="print-btn no-print" onclick="window.print()">⬇ Print / Save as PDF</button>

    <!-- COVER -->
    <div style="margin-bottom:56px;border-bottom:3px solid ${brand.primary};padding-bottom:36px">
      <h1 style="font-family:${brand.headingFont};font-size:56px;font-weight:900;color:${brand.primary};letter-spacing:-2px">BOUS</h1>
      <p style="font-family:${brand.bodyFont};font-size:16px;color:${brand.text};opacity:0.5;margin-top:6px">Brand Identity Guidelines · ${new Date().toLocaleDateString()}</p>
    </div>

    <!-- COLORS -->
    <h2>Color Palette</h2><div class="bar"></div>
    <div class="color-row">
      ${[["Primary", brand.primary],["Secondary", brand.secondary],["Accent", brand.accent],["Neutral", brand.neutral],["Text", brand.text]]
        .map(([n,h])=>`<div class="color-chip"><div class="sw" style="background-color:${h}!important;-webkit-print-color-adjust:exact"></div><div class="lb">${n}<div class="hx">${h.toUpperCase()}</div></div></div>`).join("")}
    </div>
    <div class="color-row">
      ${[["Primary 70%", lighten(brand.primary,0.3)],["Primary 40%", lighten(brand.primary,0.6)],["Secondary Light", lighten(brand.secondary,0.4)],["Accent Dark", darken(brand.accent,0.25)]]
        .map(([n,h])=>`<div class="color-chip"><div class="sw" style="background-color:${h}!important;-webkit-print-color-adjust:exact"></div><div class="lb">${n}<div class="hx">${h.toUpperCase()}</div></div></div>`).join("")}
    </div>
    <p class="note">Always reference hex values when specifying colors. For CMYK print conversions, consult your print vendor with these hex references.</p>

    <!-- TYPOGRAPHY -->
    <h2 style="page-break-before:always">Typography</h2><div class="bar"></div>
    <table><tr><th>Role</th><th>Font Family</th><th>Sizes</th><th>Weights</th><th>Line Height</th></tr>
    <tr><td>Display / H1</td><td style="font-family:${brand.headingFont}">${hFont?.label}</td><td>48–56 px</td><td>800–900</td><td>1.1</td></tr>
    <tr><td>Heading / H2</td><td style="font-family:${brand.headingFont}">${hFont?.label}</td><td>28–36 px</td><td>700</td><td>1.2</td></tr>
    <tr><td>Subheading / H3</td><td style="font-family:${brand.headingFont}">${hFont?.label}</td><td>18–24 px</td><td>600</td><td>1.3</td></tr>
    <tr><td>Body Large</td><td style="font-family:${brand.bodyFont}">${bFont?.label}</td><td>16 px</td><td>400</td><td>1.7</td></tr>
    <tr><td>Body Regular</td><td style="font-family:${brand.bodyFont}">${bFont?.label}</td><td>14 px</td><td>400</td><td>1.6</td></tr>
    <tr><td>Caption / Small</td><td style="font-family:${brand.bodyFont}">${bFont?.label}</td><td>11–12 px</td><td>400</td><td>1.5</td></tr>
    <tr><td>Label / Overline</td><td style="font-family:${brand.bodyFont}">${bFont?.label}</td><td>10–11 px uppercase</td><td>600</td><td>1.4</td></tr></table>
    <div style="margin-top:24px;padding:28px;background-color:${brand.neutral}!important;-webkit-print-color-adjust:exact;border-radius:10px">
      <p style="font-family:${brand.headingFont};font-size:40px;font-weight:800;color:${brand.primary};margin-bottom:10px">Aa Bb Cc Dd Ee</p>
      <p style="font-family:${brand.bodyFont};font-size:16px;color:${brand.text};opacity:0.7;line-height:1.7">The quick brown fox jumps over the lazy dog. Typography is the voice of design.</p>
    </div>

    <!-- SPACING & LAYOUT -->
    <h2 style="page-break-before:always">Spacing & Layout System</h2><div class="bar"></div>
    <p class="note" style="margin-bottom:16px">All spacing derives from the configured base values below. These are the active settings for this brand profile.</p>

    <h3>Active Layout Tokens</h3>
    <table>
    <tr><th>Token</th><th>Value</th><th>Description</th></tr>
    <tr><td>Card Radius</td><td>${brand.cardRadius} px</td><td>Border radius on cards, panels, and containers</td></tr>
    <tr><td>Button Radius</td><td>${brand.buttonRadius} px</td><td>Border radius on buttons, tags, and inputs</td></tr>
    <tr><td>Card Padding</td><td>${brand.cardPadding} px</td><td>Inner padding of standard cards and content blocks</td></tr>
    <tr><td>Section Gap</td><td>${brand.sectionGap} px</td><td>Vertical spacing between major sections</td></tr>
    <tr><td>Content Padding</td><td>${brand.contentPadding}%</td><td>Percentage padding inside slides, social posts, and media</td></tr>
    <tr><td>Accent Bar Height</td><td>${brand.accentHeight} px</td><td>Thickness of top bars, dividers, and decorative lines</td></tr>
    <tr><td>Border Width</td><td>${brand.borderWidth} px</td><td>Default border width on cards, inputs, and dividers</td></tr>
    <tr><td>Heading Spacing</td><td>${brand.headingSpacing} px</td><td>Letter-spacing offset for display headings</td></tr>
    </table>

    <h3>Derived Spacing Scale</h3>
    <table>
    <tr><th>Token</th><th>Value</th><th>Usage</th></tr>
    <tr><td>xs</td><td>${Math.round(brand.cardPadding * 0.14)} px</td><td>Inline icon gaps, tight label spacing</td></tr>
    <tr><td>sm</td><td>${Math.round(brand.cardPadding * 0.29)} px</td><td>Between related elements, small component padding</td></tr>
    <tr><td>md</td><td>${Math.round(brand.cardPadding * 0.57)} px</td><td>Standard paragraph gap, card sub-sections</td></tr>
    <tr><td>lg</td><td>${brand.cardPadding} px</td><td>Card inner padding, section padding within cards</td></tr>
    <tr><td>xl</td><td>${brand.sectionGap} px</td><td>Section separation, major content gaps</td></tr>
    <tr><td>2xl</td><td>${brand.sectionGap + brand.cardPadding} px</td><td>Page margins (digital), large section breaks</td></tr>
    <tr><td>3xl</td><td>${brand.cardPadding + brand.sectionGap + 16} px</td><td>Hero padding, major visual breathing room</td></tr>
    </table>

    <h3>Layout Margins & Padding</h3>
    <table>
    <tr><th>Context</th><th>Margin / Padding</th><th>Content Width</th><th>Grid</th></tr>
    <tr><td>Website — Desktop</td><td>${brand.sectionGap + 16}–${brand.sectionGap + 32} px side margins</td><td>Max 1200 px centered</td><td>12-col, ${brand.sectionGap - 8} px gutter</td></tr>
    <tr><td>Website — Tablet</td><td>${brand.sectionGap} px side margins</td><td>Fluid</td><td>8-col, ${Math.round(brand.sectionGap * 0.6)} px gutter</td></tr>
    <tr><td>Website — Mobile</td><td>${Math.round(brand.sectionGap * 0.6)} px side margins</td><td>Fluid</td><td>4-col, ${Math.round(brand.sectionGap * 0.5)} px gutter</td></tr>
    <tr><td>Presentations (16:9)</td><td>${brand.contentPadding}% padding all sides</td><td>—</td><td>—</td></tr>
    <tr><td>Instagram Post (1080²)</td><td>${brand.contentPadding + 2}% padding (≈${Math.round(1080 * (brand.contentPadding + 2) / 100)} px)</td><td>—</td><td>—</td></tr>
    <tr><td>Instagram Story (9:16)</td><td>${brand.contentPadding}% sides, top/bottom safe zone 14%</td><td>—</td><td>—</td></tr>
    <tr><td>Business Card (90×50mm)</td><td>5 mm margins, 3 mm bleed</td><td>—</td><td>—</td></tr>
    <tr><td>Letterhead A4</td><td>25 mm top, 20 mm sides, 15 mm bottom</td><td>—</td><td>—</td></tr>
    <tr><td>Brochure Tri-fold</td><td>10 mm panel margins, 3 mm bleed</td><td>—</td><td>—</td></tr>
    <tr><td>Flyer / Poster A4</td><td>15 mm margins, 3–5 mm bleed</td><td>—</td><td>—</td></tr>
    </table>

    <h3>Component Spacing Rules</h3>
    <table>
    <tr><th>Element</th><th>Spacing Rule</th></tr>
    <tr><td>Heading → Body text</td><td>8–12 px below heading</td></tr>
    <tr><td>Body paragraph → paragraph</td><td>${Math.round(brand.cardPadding * 0.57)} px gap</td></tr>
    <tr><td>Section → Section</td><td>${brand.sectionGap}–${brand.sectionGap + brand.cardPadding} px vertical</td></tr>
    <tr><td>Card inner padding</td><td>${brand.cardPadding} px</td></tr>
    <tr><td>Hero / Large card padding</td><td>${brand.cardPadding + 20} px</td></tr>
    <tr><td>Button padding</td><td>10–12 px vertical, 20–24 px horizontal</td></tr>
    <tr><td>Button border radius</td><td>${brand.buttonRadius} px</td></tr>
    <tr><td>Card border radius</td><td>${brand.cardRadius} px</td></tr>
    <tr><td>Hero block radius</td><td>${brand.cardRadius + 4} px</td></tr>
    <tr><td>Input fields</td><td>10 px padding, ${brand.buttonRadius} px border radius</td></tr>
    <tr><td>Nav link gaps</td><td>20–24 px horizontal</td></tr>
    <tr><td>Icon → Label</td><td>8 px gap</td></tr>
    <tr><td>Accent top bar</td><td>${brand.accentHeight} px height, full-width, Secondary color</td></tr>
    <tr><td>Decorative divider</td><td>40 px width, ${brand.accentHeight} px height, Secondary color</td></tr>
    </table>

    <h3>Border & Shadow Tokens</h3>
    <table>
    <tr><th>Token</th><th>Value</th><th>Usage</th></tr>
    <tr><td>Border default</td><td>${brand.borderWidth} px solid, Primary at 15% opacity</td><td>Cards, inputs, dividers</td></tr>
    <tr><td>Border radius — sm</td><td>${brand.buttonRadius} px</td><td>Buttons, tags, inputs</td></tr>
    <tr><td>Border radius — md</td><td>${brand.cardRadius} px</td><td>Cards, panels</td></tr>
    <tr><td>Border radius — lg</td><td>${brand.cardRadius + 4} px</td><td>Hero blocks, modals</td></tr>
    <tr><td>Border radius — full</td><td>9999 px</td><td>Pills, avatars</td></tr>
    <tr><td>Shadow — subtle</td><td>0 2px 8px rgba(0,0,0,0.06)</td><td>Hover states, floating elements</td></tr>
    <tr><td>Shadow — elevated</td><td>0 4px 20px rgba(0,0,0,0.12)</td><td>Modals, dropdowns, toasts</td></tr>
    </table>

    <!-- ASSET SPECS -->
    <h2 style="page-break-before:always">Asset Specifications</h2><div class="bar"></div>
    <h3>Presentations</h3>
    <table><tr><th>Property</th><th>Specification</th></tr>
    <tr><td>Aspect ratio</td><td>16:9 (1920 × 1080 px)</td></tr>
    <tr><td>Safe zone padding</td><td>8–10% all sides</td></tr>
    <tr><td>Title font</td><td>48–56 px, weight 800</td></tr>
    <tr><td>Slide body font</td><td>18–24 px, weight 400</td></tr>
    <tr><td>Top accent bar</td><td>Full width, ${brand.accentHeight} px, Secondary color</td></tr>
    <tr><td>Slide number</td><td>Bottom-right, caption size (10 px), 30% opacity</td></tr>
    <tr><td>Logo placement</td><td>Top-right, 14 px, 60% opacity</td></tr>
    <tr><td>Column layout</td><td>2 or 3 columns, 12–16 px gap</td></tr>
    </table>
    <h3>Social Media</h3>
    <table><tr><th>Format</th><th>Dimensions</th><th>Padding</th><th>Notes</th></tr>
    <tr><td>Instagram Post</td><td>1080 × 1080 px</td><td>${brand.contentPadding + 2}% (≈${Math.round(1080 * (brand.contentPadding + 2) / 100)} px)</td><td>Primary or Secondary bg</td></tr>
    <tr><td>Instagram Story</td><td>1080 × 1920 px</td><td>${brand.contentPadding}% sides, 14% top/bottom</td><td>Primary→Secondary gradient</td></tr>
    <tr><td>Facebook Cover</td><td>1640 × 624 px</td><td>Safe zone center 60%</td><td>Text in safe zone only</td></tr>
    <tr><td>Twitter/X Post</td><td>1200 × 675 px</td><td>${brand.contentPadding}%</td><td>16:9, logo top-right</td></tr>
    <tr><td>LinkedIn Banner</td><td>1584 × 396 px</td><td>${brand.contentPadding}% sides</td><td>Minimal text, brand gradient</td></tr></table>
    <h3>Print Collateral</h3>
    <table><tr><th>Format</th><th>Size</th><th>Margins</th><th>Bleed</th></tr>
    <tr><td>Business Card</td><td>90 × 50 mm</td><td>5 mm</td><td>3 mm</td></tr>
    <tr><td>Letterhead</td><td>A4 (210 × 297 mm)</td><td>25T / 20L+R / 15B mm</td><td>—</td></tr>
    <tr><td>Tri-fold Brochure</td><td>A4 landscape, 3 panels</td><td>10 mm per panel</td><td>3 mm</td></tr>
    <tr><td>Flyer / Poster</td><td>A4 or A3</td><td>15 mm</td><td>3–5 mm</td></tr>
    <tr><td>Envelope DL</td><td>220 × 110 mm</td><td>15 mm</td><td>—</td></tr></table>
    <h3>Logo Usage</h3>
    <table><tr><th>Rule</th><th>Specification</th></tr>
    <tr><td>Min digital size</td><td>28 px height</td></tr>
    <tr><td>Min print size</td><td>10 mm height</td></tr>
    <tr><td>Clear space</td><td>1× height of the "B" monogram on all sides</td></tr>
    <tr><td>Permitted backgrounds</td><td>Primary (dark), Neutral (light), photography with 60%+ overlay</td></tr>
    <tr><td>Monogram usage</td><td>Favicons, app icons, watermarks — min 16 px</td></tr></table>

    <!-- GRADIENTS -->
    <h2 style="page-break-before:always">Gradient System</h2><div class="bar"></div>
    <div style="display:flex;gap:16px;margin:16px 0">
      ${[[brand.primary,brand.secondary,"Primary → Secondary"],[brand.secondary,brand.accent,"Secondary → Accent"],[brand.primary,brand.accent,"Primary → Accent"]]
        .map(([a,b,label])=>`<div style="flex:1;text-align:center"><div style="height:80px;border-radius:10px;background:linear-gradient(135deg,${a},${b})!important;-webkit-print-color-adjust:exact"></div><p style="font-size:10px;margin-top:6px;color:#999">${label}</p></div>`).join("")}
    </div>
    <p class="note">Use gradients sparingly. The Primary→Secondary gradient is preferred for hero sections and story backgrounds. Always at 135° angle.</p>

    <!-- DO / DON'T -->
    <h2 style="page-break-before:always">Usage Do's & Don'ts</h2><div class="bar"></div>
    <table>
    <tr><th style="color:#2a7d2a">✓ Do</th><th style="color:#c44">✗ Don't</th></tr>
    <tr><td>Use the specified fonts at the given weights</td><td>Substitute fonts not in the brand system</td></tr>
    <tr><td>Maintain minimum logo clear space</td><td>Place the logo on busy or low-contrast backgrounds</td></tr>
    <tr><td>Use the spacing scale consistently</td><td>Use arbitrary spacing values</td></tr>
    <tr><td>Apply gradients at 135° with brand colors only</td><td>Create new gradients with off-brand colors</td></tr>
    <tr><td>Keep text within safe zones on all formats</td><td>Push text to edges or outside safe areas</td></tr>
    <tr><td>Use the Secondary color for accent elements</td><td>Overuse the accent color as a primary</td></tr>
    <tr><td>Maintain consistent border radii per token</td><td>Mix rounded and sharp corners on the same layout</td></tr>
    </table>

    </body></html>`);
    win.document.close();
    notify("PDF opened — click Print/Save");
  };

  const sections = [
    <Overview brand={brand} />, <LogoSection brand={brand} />,
    <ColorsSection brand={brand} />, <TypographySection brand={brand} />,
    <PresentationsSection brand={brand} />, <PrintSection brand={brand} />,
    <WebsiteSection brand={brand} />, <SocialSection brand={brand} />,
    <StationerySection brand={brand} />,
  ];

  const ColorInput = ({ label, propKey }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(brand[propKey]);
    const applyHex = (val) => {
      let hex = val.trim();
      if (!hex.startsWith("#")) hex = "#" + hex;
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) { update(propKey, hex); setDraft(hex); }
      else { setDraft(brand[propKey]); }
      setEditing(false);
    };
    useEffect(() => { setDraft(brand[propKey]); }, [brand[propKey]]);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: brand[propKey], border: "2px solid #e0e0e0" }} />
          <input type="color" value={brand[propKey]} onChange={e => update(propKey, e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#333" }}>{label}</div>
          {editing ? (
            <input value={draft} onChange={e => setDraft(e.target.value)}
              onBlur={() => applyHex(draft)} onKeyDown={e => { if (e.key === "Enter") applyHex(draft); if (e.key === "Escape") { setDraft(brand[propKey]); setEditing(false); } }}
              autoFocus spellCheck={false}
              style={{ fontSize: 10, fontFamily: "monospace", color: "#333", border: "1px solid #ccc", borderRadius: 4, padding: "1px 4px", width: "100%", outline: "none", background: "#f5f5f5", marginTop: 1 }} />
          ) : (
            <div onClick={() => { setDraft(brand[propKey]); setEditing(true); }}
              style={{ fontSize: 10, fontFamily: "monospace", color: "#999", cursor: "text", marginTop: 1 }}
              title="Click to edit hex value">{brand[propKey].toUpperCase()}</div>
          )}
        </div>
      </div>
    );
  };

  const FontSelect = ({ label, propKey }) => (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#333", marginBottom: 4 }}>{label}</div>
      <select value={brand[propKey]} onChange={e => update(propKey, e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 12, background: "#fff", cursor: "pointer" }}>
        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f8f7f4", position: "relative" }}>
      {notification && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "#1a1a1a", color: "#fff", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s ease" }}>✓ {notification}</div>
      )}

      <div style={{ width: panelOpen ? 268 : 0, overflow: "hidden", transition: "width 0.3s ease", background: "#fff", borderRight: "1px solid #e8e6e0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e6e0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", letterSpacing: 1 }}>⚙ BRAND CONTROLS</div>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Saved Profiles</div>
            <ProfileManager brand={brand} onLoad={setBrand} onNotify={notify} />
          </div>
          <div style={{ height: 1, background: "#e8e6e0" }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Quick Presets</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.keys(PRESETS).map(p => (
                <button key={p} onClick={() => applyPreset(p)} style={{ padding: "4px 10px", borderRadius: brand.buttonRadius + 14, border: "1px solid #ddd", background: "#fff", fontSize: 10, cursor: "pointer", textTransform: "capitalize", fontWeight: 500 }}>
                  <span style={{ display: "inline-flex", gap: 2, marginRight: 4, verticalAlign: "middle" }}>
                    {[PRESETS[p].primary, PRESETS[p].secondary].map((c, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 2, background: c, display: "inline-block" }} />)}
                  </span>{p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 1, background: "#e8e6e0" }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Colors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ColorInput label="Primary" propKey="primary" />
              <ColorInput label="Secondary" propKey="secondary" />
              <ColorInput label="Accent" propKey="accent" />
              <ColorInput label="Neutral BG" propKey="neutral" />
              <ColorInput label="Text" propKey="text" />
            </div>
          </div>
          <div style={{ height: 1, background: "#e8e6e0" }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Typography</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FontSelect label="Heading Font" propKey="headingFont" />
              <FontSelect label="Body Font" propKey="bodyFont" />
            </div>
          </div>
          <div style={{ height: 1, background: "#e8e6e0" }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Layout & Spacing</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Card Radius", key: "cardRadius", min: 0, max: 24, unit: "px" },
                { label: "Button Radius", key: "buttonRadius", min: 0, max: 20, unit: "px" },
                { label: "Card Padding", key: "cardPadding", min: 12, max: 48, unit: "px" },
                { label: "Section Gap", key: "sectionGap", min: 12, max: 64, unit: "px" },
                { label: "Content Pad %", key: "contentPadding", min: 4, max: 18, unit: "%" },
                { label: "Accent Bar", key: "accentHeight", min: 1, max: 8, unit: "px" },
                { label: "Border Width", key: "borderWidth", min: 0, max: 3, unit: "px" },
                { label: "Heading Spacing", key: "headingSpacing", min: -3, max: 8, unit: "px" },
              ].map(({ label, key, min, max, unit }) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#555" }}>{label}</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#999", minWidth: 36, textAlign: "right" }}>{brand[key]}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} value={brand[key]}
                    onChange={e => update(key, parseInt(e.target.value))}
                    style={{ width: "100%", height: 4, cursor: "pointer", accentColor: brand.secondary }} />
                </div>
              ))}
              <button onClick={() => setBrand(prev => ({ ...prev, ...LAYOUT_DEFAULTS }))} style={{
                marginTop: 4, padding: "5px 0", borderRadius: 4, border: "1px solid #ddd",
                background: "#fff", fontSize: 10, cursor: "pointer", color: "#888",
              }}>↺ Reset to Defaults</button>
            </div>
          </div>
          <div style={{ height: 1, background: "#e8e6e0" }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Export</div>
            <button onClick={exportPDF} style={{ width: "100%", padding: "9px 0", borderRadius: 6, border: "none", background: brand.primary, color: textOn(brand.primary), fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📄 Export Full PDF</button>
            <p style={{ fontSize: 9, color: "#bbb", marginTop: 6, lineHeight: 1.5 }}>Hover any asset and click "↓ Export PNG" for individual hi-res exports at 3× resolution.</p>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Preview</div>
            <div style={{ borderRadius: brand.cardRadius, overflow: "hidden" }}>
              <div style={{ background: brand.primary, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: brand.headingFont, fontSize: 14, fontWeight: 700, color: textOn(brand.primary) }}>BOUS</span>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: brand.secondary }} />
              </div>
              <div style={{ background: brand.neutral, padding: "10px 12px" }}>
                <span style={{ fontFamily: brand.bodyFont, fontSize: 11, color: brand.text }}>Body text preview.</span>
              </div>
              <div style={{ background: brand.accent, padding: "8px 12px" }}>
                <span style={{ fontFamily: brand.bodyFont, fontSize: 10, color: textOn(brand.accent) }}>Accent strip</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "12px 32px", borderBottom: "1px solid #e8e6e0", background: "#fff", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setPanelOpen(!panelOpen)} style={{ width: 32, height: 32, border: "1px solid #ddd", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            {panelOpen ? "◀" : "▶"}
          </button>
          <div style={{ display: "flex", gap: 0, overflowX: "auto", flex: 1 }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)} style={{
                padding: "8px 14px", border: "none",
                background: activeTab === i ? brand.primary : "transparent",
                color: activeTab === i ? textOn(brand.primary) : "#888",
                borderRadius: 6, fontSize: 12, fontWeight: activeTab === i ? 600 : 400,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
              }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: brand.headingFont, fontSize: 32, fontWeight: 800, color: brand.primary, margin: "0 0 6px", lineHeight: 1.2 }}>{TABS[activeTab]}</h1>
              <div style={{ width: 40, height: brand.accentHeight, background: brand.secondary, borderRadius: 2 }} />
            </div>
            {sections[activeTab]}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}
