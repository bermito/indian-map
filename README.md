# Specialty Coffee India

Interactive 3D relief map + directory of India's specialty coffee.
Single-file build on the Kerala engine: three.js r128 and all map data
are inlined in index.html. No build step.

## Deploy
Upload the repo files to the root, commit to main. Vercel redeploys.
IMPORTANT after switching to this build: DELETE the old app.js,
terrain.png and three.module.min.js from the repo — index.html no longer
uses them, and stale copies only confuse future edits.

## Editing content
All listings live in the last <script> block of index.html:
- DATA — keyed by state name; each state has sub + cafes/roasters/farms/education.
  Entries are {n:"Name", m:"City · note"}, optional v:"probable", optional u:"https://link".
- EVENTS — {date:"YYYY-MM-DD", title, venue, blurb}. Past dates drop off automatically.
- FORM_ENDPOINT — Formspree; posts carry a hidden site=india field.

Empty states show "None listed yet" by design — do not invent entries.
