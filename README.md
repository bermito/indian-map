# Specialty Coffee India

An independent editorial map + directory of India's specialty coffee roasters and growing origins.
Single static page — no build step.

## Files
- `index.html` — the whole site (map, directory, origins, events, about)
- `robots.txt`, `sitemap.xml` — SEO
- `vercel.json` — clean URLs + basic headers

## Deploy on Vercel (from GitHub)
1. Push these files to the repository root (no subfolder).
2. Vercel → New Project → import the repo.
3. Framework Preset: **Other** · Root Directory: `/` · no build command.
4. Deploy, then open the Vercel URL in a browser.

## Notes
- The map (3D terrain) loads from public CDNs and needs a live browser + internet.
  It will NOT render inside code-preview sandboxes — only on the deployed URL.
- Terrain uses MapLibre's keyless demo terrain tiles. For heavy traffic, swap the
  `dem` tile source in index.html for AWS terrarium tiles or a MapTiler key.
- Data: 109 roasters + 16 origins, compiled from Indian Coffee Beans & Kaapi Brewing,
  normalized and deduplicated. Boundaries use current Indian state data.
