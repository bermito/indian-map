# Specialty Coffee India — website audit

Checked on 15 November 2026. This audit covers the public website, the current GitHub deployment structure, the prepared website, its datasets, navigation, search metadata and mobile behavior.

## Main finding

The India update was not properly deployed, and the prepared directory did not yet fulfil the original nationwide district-by-district brief. Passing the earlier technical checks did not establish either a successful public deployment or complete research coverage.

## Why the public website still looks old

The public homepage at https://www.specialtycoffeeindia.blog/ still matches the original root `index.html` exactly. The new directory, coffee, events, community, learning, equipment, sources and Kerala routes returned HTTP 404 during this audit.

GitHub's current `main` was `e0c30c7da7bedee8227bad49b60577db161e0bc0`. Two uploads added wrapper directories: `website/` at 2:54 PM IST and `source/` at 3:56 PM IST. The original root HTML and Vercel configuration remained in place. A successful Vercel deployment therefore still served the old root website.

The two uploaded folders also differ. `website/data/manifest.json` has the older 1,034-entry / 76-Kerala snapshot. `source/data/manifest.json` has the corrected 991-entry / 33-Kerala snapshot, but that source upload lacks essential JavaScript, CSS and map assets. Merely changing Vercel's root directory to that incomplete folder would not repair the website.

This revised ZIP contains a single complete project at its root. Its extracted `index.html`, `vercel.json`, `package.json`, `assets/`, `data/` and `scripts/` belong directly at the repository root. No remote write or deployment was performed during this audit.

## Repairs included in this package

| Area | Repair |
| --- | --- |
| Catalogue classification | Moved 34 equipment records, three non-coffee products and 19 explicit subscriptions out of ordinary coffee listings. Stable IDs and original observations are preserved. |
| Missing prices | Withheld 170 zero-price placeholders. Cards now tell visitors to check the seller rather than presenting missing data as free products. |
| Price comparisons | Removed inappropriate per-250 g comparisons for subscriptions and non-coffee items. |
| Verified price conflicts | Corrected two exact Été products using their official pages. Original imported values remain in raw fields. |
| Imported metadata | Withheld contaminated roast/process/variety fields on 91 records, preserving raw values and review notes. |
| Possible duplicates | Flagged 30 same-name roaster groups for review. Branches and identities were not merged without evidence. |
| Navigation and SEO | Client navigation now refreshes canonical URLs, descriptions, social metadata, structured data and indexing instructions. A visit to a noindex archive no longer leaves later public pages marked noindex. |
| Saved lists | Removing a saved item immediately updates Saved-only results. Saved loads only the required datasets and can retain available results after a partial failure. |
| Events | Dates with several events open a chooser. Six expired third-party events now appear in Past, without gaining calendar-confirmed status. |
| Learning and community | Available summaries and national scope are visible. Coffee labels distinguish roasters from sellers. |
| Coverage filters | Empty district/state filters are hidden where no usable assignments exist, with a clear coverage explanation. Kerala retains all 14 districts and the corrected 33-place selection. |

The official price checks were:

- NR-37: ₹750 for 200 g, replacing an imported ₹8.95 / 250 g observation: https://etecoffeeroasters.com/products/nr-37-coffee
- Premium 137: ₹2,500; weight not stated; seller says Coming soon. The imported ₹27.95 / 250 g observation is retained as raw data: https://etecoffeeroasters.com/products/nr-37-meluri-copy-copy

These checks apply to those exact fields and products on the audit date. They do not verify the whole catalogue or guarantee availability.

## Nationwide content still unfinished

| Requirement | Current position |
| --- | --- |
| State and union-territory navigation | All 36 have navigation pages; 28 have core directory entries. |
| District-level coverage | All 958 non-Kerala directory records still lack district assignments. Meaningful district browsing is currently available only for Kerala. |
| Directory geography | 129 of 991 records lack state; 192 lack city. These are unresolved observations, not invented locations. |
| Coffee geography | 3,476 of 5,163 coffee observations lack business state. A seller's location remains separate from bean origin. |
| Equipment geography | All 1,641 equipment observations lack state, so a state filter would produce misleading empty results. |
| Events | The 21 main event records cover four states. Only two schedules qualify as confirmed upcoming events at this snapshot. |
| People, community and learning | Coverage is uneven. There are 19 community records and 33 learning resources, many without a state assignment; this is not a nationwide census. |
| Farm visits | Only two experience records are collected, both without a state assignment. |
| Duplicate review | 30 potential roaster-name duplicate groups need identity and branch checks. |
| Searchable detail pages | Listings use dialogs. Individual listing URLs, dedicated district pages and an India-hosted journal remain to be developed. |
| Ongoing maintenance | There is no automatic refresh, contributor account system or moderation dashboard. Suggestions use the existing email-form service. |

The eight state/UT pages without core entries are Arunachal Pradesh, Assam, Manipur, Mizoram, Tripura, Andaman and Nicobar Islands, Dadra and Nagar Haveli and Daman and Diu, and Lakshadweep. An empty page is a research gap, not proof of no coffee activity.

Some requested sources remain only partly collected: Saptabeeja 12 of an indicated 150 estates, Spill The Beans 25 of 39 public directory records, Homegrounds with no full shopping catalogue extracted, and CoffeeIndustry with no bulk extraction. These limits are recorded in the source register.

## Collection after the repairs

991 directory records; 5,163 coffee observations; 1,641 equipment observations; 546 subscriptions and other products; 21 events; 19 communities; 33 learning resources; 1,416 research leads; and 412 entries in Arpan's original list. All 7,350 original catalogue observations are retained across the corrected collections. Counts represent source observations and can include overlap.

## Verification and limits

Automated checks cover data IDs and provenance, exact Kerala corrections, reviewed catalogue moves, missing-price handling, all 50 generated routes, local assets, saved-ID lookup, metadata transitions, event archives and safe rendering. Browser checks covered catalogue prices, Saved-only removal, same-day event selection, stale noindex removal, state coverage notices and a 390 px mobile event dialog without horizontal overflow.

The final ZIP is also extracted into a clean directory and built there to check that it contains all required source files. The original India terrain renderer and fallback are retained. This browser's earlier WebGL limitation prevents a full visual assurance of 3D rendering. No form was submitted, so inbox delivery remains untested.

The next work is to apply the complete project at the correct repository level, verify the public deployment, then finish verified geography and content coverage state by state. This package fixes observed defects; it is not a claim that every Indian district or coffee business has been researched.
