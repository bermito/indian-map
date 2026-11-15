# Specialty Coffee India

A static, source-linked coffee field guide. The original India terrain map is retained, with a clickable fallback and a selector covering all 36 states and union territories. The expanded directory covers cafés, roasters, farms, products, equipment, events, communities, education and experiences.

## Apply this update

This ZIP contains one project at its top level. Put its extracted files and folders directly at the `bermito/indian-map` repository root, replacing the old root `index.html` and `vercel.json`. Essential folders are `assets`, `data` and `scripts`. The upload must contain every file. Vercel runs `node scripts/build.mjs` and publishes `dist`.

The previously uploaded `website/` and `source/` folders are not the deployment root. They can remain for review; the new build uses the complete root files and does not copy those folders. Read `INDIA-WEBSITE-AUDIT.md` for the deployment diagnosis, corrected catalogue issues and unfinished national coverage.

## Build and validation

Node.js 22 or newer is sufficient. No package installation is required.

```sh
node scripts/build.mjs
node scripts/check.mjs
```

The build writes `dist/`, including 50 page routes, route-specific metadata, a sitemap and source-linked static previews. The browser application replaces each preview with the full searchable collection. Serve `dist/` with a static HTTP server; opening HTML directly with `file://` will not support JSON loading. `vercel.json` selects the build command and `dist` output.

Checks validate source counts and IDs, price units, provenance URLs, geography, all state/district coverage rows, event eligibility, local route/asset references, JavaScript syntax and escaping of untrusted query/listing text. Browser checks are still needed after UI changes, especially mobile navigation, filters, map selection, dialogs, saved lists and calendar downloads. Form validation can be checked without sending a test message.

## Source structure

- `index.html`: shared page shell, navigation, dialogs and initial homepage.
- `assets/site.css`: responsive presentation.
- `assets/app.js`: client-side routing, search, filters, pagination, detail dialogs, saved lists, CSV downloads, event calendar and suggestion form.
- `map.html`, `assets/map/`: original Three.js terrain, map data, parent-page bridge and fallback geometry. `assets/map/kerala-districts.svg` reuses the approved Kerala district shapes, with accessible district navigation. Elevation attribution: ETOPO 2022, NOAA NCEI. The terrain omits some island geometry; the state selector and directory cover every current state/UT.
- `data/*.json`: checked research snapshots, maintained independently of UI code. The complete original research is also supplied as `data/research.json.gz` for download.
- `scripts/build.mjs`: static page previews and metadata generation.
- `scripts/check.mjs`, `scripts/check-rendering.mjs`: repeatable validation.

## Data maintenance

The initial collection was checked on 15 November 2026. It contains 991 directory entries, including 33 corrected Kerala places; 5,163 coffee-product observations; 1,641 equipment observations; 21 event records; 19 communities; 33 learning/publication records; 1,416 additional business leads; and all 412 original Arpan list entries. These are collection counts, not counts of verified operating businesses or unique coffees.

Kerala follows the corrected Specialty Coffee Keralam runtime bundle from repository commit `63889f1ace9b987bf2f4b2251f40276a13fde001` (15 November 2026), which matches the latest corrected website export. The older source JSON/generator and cached public HTML are not used to override these corrections. All 14 districts remain accessible; 33 unique places cover 17 cafés, 3 roasters, 9 farms/producers, 3 education venues and 1 coffee professional. Three of those places also sell roasted beans and are not counted again. Eight guides and eleven historical events retain their original source links. English and Malayalam source fields remain in the data; the India interface is English.

Run `python3 scripts/reconcile-kerala.py` to reproduce the reconciliation from the bundled `data/kerala-authority-source.json` fixture. The original 76 Kerala directory observations are retained in `kerala-research-archive.json`. Thirty-seven old records map to the 33 corrected places; 39 unmatched records remain in the public research leads section. Saved IDs migrate through `kerala-authority.json`. Additional event and producer leads retain their evidence without being promoted into the corrected selection. `kerala-reconciliation.json` records the mapping and source provenance. Do not restore the withdrawn Underblu map link, Sukoru's old exact hours, or duplicate Bermito as a café.

Update the relevant section JSON while preserving stable IDs, source URLs, evidence labels and checked/snapshot dates. Update `manifest.json`, state/district totals in `coverage.json`, and source coverage in `sources.json` together. When a refreshed collection legitimately changes the baseline counts, update the explicit expectations in `scripts/check.mjs` after reviewing the new data. Run build and checks before release.

Do not infer districts, coordinates, specialty quality or current operation from a brand name. A roastery location is not a coffee’s farm origin. Keep estate-linked retail brands separate from physical farms. Preserve pack/price units and snapshot dates; product catalogues overlap and prices are not live.

Original website records remain in `legacy.json` and related archives, with unverified labels; they are not merged into the main directory. Broad leads remain separate. Three overseas venues remain in Arpan’s original list but are excluded from the India directory. Empty districts are research gaps.

For events, set `calendarEligible` only when an organiser-supported schedule exists, retaining verification and conflict notes. The client computes upcoming/past status against India’s current date. Kerala editorial archives appear under Past with registration closed, without calendar downloads or implied organiser confirmation. Calendar downloads are all-day date reminders, with supplied session times in the description; they do not invent start times or confirm ticket availability. Static event previews refresh when the site is rebuilt.

## Catalogue repairs and coverage

`data/catalogue-audit.json` records reviewed catalogue corrections. `python3 scripts/repair-catalogue.py` reapplies those corrections without guessing unknown geography or merging possible duplicate businesses. The national district brief remains unfinished: all 958 non-Kerala directory records lack district assignments; eight state/UT pages have no core records. The website must not be described as a complete India-wide district census.

`data/record-index.json` is regenerated by the build and resolves saved IDs to the required collection. It avoids downloading every product catalogue for a saved directory place.

## Suggestions, saved lists and privacy

Suggestions use the original public Formspree endpoint `https://formspree.io/f/xrpzgeky`, carrying `site=india`. Submission sends the entered name, category, location, public link, email and notes to Formspree. The site shows success only after a successful response and keeps entered details after a failure. Endpoint ownership, inbox access and delivery must be maintained by the site owner; sending/receipt was not tested by submitting a message. There is no moderation dashboard or automatic insertion into the published data: review suggestions and update the JSON before rebuilding.

Saved IDs are stored only in the visitor’s browser `localStorage`. They do not require an account and do not sync between devices. Clearing browser storage removes them. CSV and calendar exports are created in the visitor’s browser. Public catalogue/source links open the original websites; community links may open third-party services. Fonts are requested from Google Fonts. No account system, analytics or payment flow has been added.

## Publication

Keep existing repository/hosting configuration. The repository’s existing Git integration can deploy reviewed changes using the configured Vercel build. Confirm the intended branch and hosting target before publishing, then verify the deployed pages. `dist/`, local preview settings and QA screenshots are ignored by Git; do not publish credentials, raw browser captures or private contributor metadata.
