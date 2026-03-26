# BOUS Brand Guidelines Workstation

An interactive branding tool for creating, previewing, and exporting complete brand identity guidelines.

## Features

- **9 asset categories**: Overview, Logo, Colors, Typography, Presentations, Print, Website, Social Media, Stationery
- **Live controls**: Adjust colors, fonts, and presets — everything updates in real time
- **Save/Load profiles**: Store multiple brand configurations (persists in your browser)
- **Export Full PDF**: One-click export of all specs as a printable document
- **Export individual assets**: Hover any preview and click "Export PNG" for hi-res (3×) downloads

## Quick Start

### Option 1: Double-click
Just double-click **`start.bat`** — it will install dependencies and launch the app.

### Option 2: Command line
```bash
cd "C:\00 Paris\BrandingApp"
npm install
npm run dev
```

The app opens automatically at **http://localhost:3000**

## Requirements

- [Node.js](https://nodejs.org/) v18 or later (LTS recommended)
- npm (comes with Node.js)

## Build for Production

To create a static build you can host anywhere:

```bash
npm run build
```

Output goes to the `dist/` folder. You can deploy it to Vercel, Netlify, or any static host.
