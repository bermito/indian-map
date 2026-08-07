# Specialty Coffee India

Interactive 3D relief map + directory of India's specialty coffee.

## Files (all must be in the repo root, same folder)
- `index.html` — page, styles, data
- `app.js` — 3D map + directory logic (ES module)
- `three.module.min.js` — Three.js r169, served locally (no CDN)
- `robots.txt`, `sitemap.xml`, `vercel.json`

## Deploy (Vercel / GitHub Pages)
Push all files to the repository root. No build step.
Vercel → New Project → Framework Preset: **Other** → Deploy.

Note: because `app.js` is an ES module, the site must be opened over http(s),
not by double-clicking the file. Any static host works.

## Data
189 displayed records: 51 cafés, 109 roasters, 16 origins, 13 education.
Elevation: ETOPO 2022 (NOAA NCEI) 60 arc-second. Boundaries: government state polygons.
