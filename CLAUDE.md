# BOUS Brand Guidelines Workstation

## Project Overview
A single-page React application (Vite) that lets users build, preview, and export complete brand identity guidelines. Deployed on Vercel at: https://bous-branding-tool.vercel.app

## Tech Stack
- **Framework**: React 18 + Vite 5
- **Styling**: Inline styles / CSS-in-JS (no external CSS framework)
- **Fonts**: Google Fonts (loaded dynamically based on selection)
- **Persistence**: Browser `localStorage` for saved brand profiles
- **Export**: PDF via `window.open()` + print; PNG via `html2canvas` pattern (hover-to-export)

## Architecture
All logic lives in two files:
- `src/main.jsx` — React entry point
- `src/App.jsx` — Entire application (~1100 lines), single component file

### Key Constants in App.jsx
- `FONT_OPTIONS` — 10 Google Fonts available for heading/body selection
- `LAYOUT_DEFAULTS` — Default spacing/radius values
- `PRESETS` — 5 built-in themes: `luxury`, `modern`, `organic`, `editorial`, `tech`

### Main Component: `BousBrandGuidelines`
State-driven: all brand config (colors, fonts, layout) lives in a single state object. Sections:
1. Overview, Logo, Colors, Typography, Presentations, Print, Website, Social Media, Stationery

### Helper Functions
- `hexToRgb()`, `luminance()`, `textOn()` — accessibility/contrast utilities
- `lighten()`, `darken()` — color manipulation for UI variants

## Development
```bash
npm install
npm run dev       # localhost:3000
npm run build     # outputs to /dist
npm run preview   # preview production build
```

## Deployment
- **Platform**: Vercel (connected to GitHub repo: ParisB81/bous-branding-tool)
- **Auto-deploy**: Push to `main` branch triggers a new Vercel deployment
- Vercel auto-detects Vite — no `vercel.json` needed
- Build command: `npm run build` | Output dir: `dist/`

## Related Skills
- `brand-asset-generator` skill: Applies exported brand guidelines PDF to create branded `.pptx` and `.docx` documents
- `brand-guidelines` skill: Applies Anthropic brand style

## Notes
- No backend or API — fully static, deployable anywhere
- `start.bat` is a Windows convenience script for local dev only
- Profiles saved to localStorage are browser-local (not cloud-synced)
