# Specialty Coffee India

A national edition of the Specialty Coffee Keralam map. Visitors can select a state or union territory on the terrain map, browse districts, open source-linked place profiles, and read the Indian Coffee Journal. Coffee, equipment, events, education, communities, experiences, saved listings and contributed research each have their own directory.

## Build

Use Node.js 22 or newer. No installation step is required. At the project root run:

```sh
node scripts/build.mjs
node scripts/check.mjs
node scripts/check-related-search.mjs
node scripts/check-atlas-journal.mjs
python3 -m http.server 8000 --directory dist
```

Vercel builds from the repository root and serves `dist`. All paths are relative to the domain root. Opening `index.html` from disk bypasses the build and HTTP routing.

## Editing the guide

- `index.html`, `assets/site.css`, `map.html` and `assets/map/` define the shared layout and map. The state selector includes islands. If WebGL is unavailable, the page displays an interactive outline.
- `assets/journal.mjs` groups stories by topic. The ten new guides are in the three `stories-*.mjs` modules. Article sources and related atlas links travel with each story. New photo credits are in `assets/guide-photos.mjs`. Photos are served locally from `assets/journal-images/`. Each credit links to the original and the licence.
- `assets/atlas-pages.mjs` builds district and profile pages. `data/districts.json` holds the administrative district snapshot, its source and checksum, and the evidence attached to individual listings. Preserve stable listing IDs when editing.
- `assets/app.js` supports filters, search, downloads, saved entries, calendars and corrections. The build also generates readable HTML for journal articles, district pages and profiles.
- `data/directory.json` holds the core profiles. Source collections, including Arpan’s map and additional unconfirmed leads, retain their original provenance in separate files. Evidence in `districts.json` supplements the baseline location fields at build and run time. The downloadable research archive is the original collection snapshot.
- `scripts/reconcile-kerala.py` applies the Kerala editorial fixture. It preserves links to the original Kerala profiles, corrected visiting details, dated events and retired IDs.

## Coverage on 18 November 2026

The guide contains 993 core listings. 363 can be placed in 54 of the 790 districts in this edition. The remaining 630 are searchable at their known level of geography. An empty district is open for contributions. It makes no claim about the number of coffee businesses operating there.

The catalogue contains 5,163 coffee observations and 1,641 equipment observations. The site also includes 33 event records, 34 education resources, 19 community records and 17 original journal articles. Confirm opening times, visits, product availability and future event details with their sources.

See `SITE-AUDIT.md` for the current audit and `EDITORIAL-RESEARCH.md` for the ten reference articles and reader questions.

`INDIA-WEBSITE-AUDIT.md` and `AUDIT-17-NOV-2026.txt` document earlier versions. `validation.json` records the current build checks.
