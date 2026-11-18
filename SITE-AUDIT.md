# Specialty Coffee India site audit

18 November 2026 IST. The public site was serving the Kerala-style national map and seven journal stories during this check. This report distinguishes the publicly observed version from the changes in this source package.

## Public site

| What was checked | Result |
| --- | --- |
| Homepage, directory, beans, equipment, subscriptions, estate visits, events, community, learning, sources, saved, research leads, Arpan’s list and historical records | Each of the 14 routes returned HTTP 200. |
| Kerala and Assam state pages, Wayanad and Kohima district pages, Tsiese Coffee Estate profile | All five returned 200. |
| Journal index and first V60 story | Both returned 200. The index linked seven stories in delivered HTML, without needing JavaScript. Journal was present in the main navigation. |
| Search discovery | The public robots.txt returned 200 and pointed to a working sitemap with 1,102 URLs. The map iframe was excluded from crawling. Saved and unverified research collections provided a noindex directive. |
| Missing address | A deliberately nonexistent page returned HTTP 404. |
| Source citations in the seven original articles | All 15 distinct sources listed in those articles returned HTTP 200 on request. One government release added language and region parameters through a redirect. This checks reachability. |

The checks cover 24 requested public addresses, including the two discovery files and the deliberately missing address. No live suggestion or newsletter was submitted.

## Directory discovery and editorial search

| Finding in the previous build | Change in this package | Verification |
| --- | --- | --- |
| Only 488 of 993 profiles could be found by following links in the static main content of **non-profile pages**. Profiles could also appear through search and interactive filters. | The full [A–Z directory](/explore/all/) links to each profile. It is linked from the directory and footer. Each entry shows its type and available location. | The generated A–Z HTML contains exactly 993 distinct profile URLs, each of which resolves to an actual page. |
| Eight state or territory pages contained no core listings yet but were offered to search engines as directory landing pages. | Empty state guides are retained in navigation and marked noindex. They automatically return to the sitemap when core listings are added. Empty district pages already followed this rule. | Build checks cover every empty state against its HTML directive and the sitemap. |
| 78 exact profile-name groups shared a page title, including branches in different cities. District names could also repeat across states. | Search titles distinguish matching profile names with their available locality and type. District titles now include the state or territory. A profile’s published name, saved ID and URL are preserved. | Only 21 exact duplicate profile-title groups remain in this snapshot. They often have sparse evidence or the same type and city. Overlapping source observations still need manual identity checks. |
| Static structured data on directory and state previews identified external source pages as the listing URLs, even though visible cards opened an internal profile. | Matching entries now use their internal canonical profile URL in structured data. | The A–Z, state and district routes use the same profile URL builder. |
| Journal schema identified the publisher but omitted authorship. None of the article sitemap entries had editorial date information. | Journal stories now credit Specialty Coffee India as the organization responsible for the article. Article metadata identifies the parent journal, and sitemap entries use the supplied editorial date. | Article canonical addresses, structured data and per-story source pages are checked against generated HTML. New builds leave the dates of unchanged stories alone. |

The atlas contains 993 core profiles. Available evidence places 363 in 54 districts. Another 630 await district verification. All 790 district pages remain accessible. These are observed directory records, not a national census of operating businesses. If two entries share a name, verify their official address and role before merging them. The remaining repeated titles include Jayanthi Coffee, Coffeeverse in Ahmedabad and Corridor Seven Coffee Roasters in Nagpur.

## Ten new journal guides

The ten guides include 31 source citations across 30 unique external addresses. All 30 returned HTTP 200, including three PDFs. A Consumer Reports page that returned 403 during review was replaced with IndianCoffeeBeans’ India-specific storage guide. All 30 links within the guides to atlas profiles, related articles, catalogues and other sections have a matching page in the build. They cover 24 distinct addresses.

Nine links apply a search or filter when a reader opens the catalogue. Running the site’s filtering code against the packaged records returned results for each one, including 29 French press listings, 16 South Indian filter matches, 14 cold brew matches and 27 moka matches. These counts describe the catalogue snapshot and can include overlapping listings.

Examples checked against publishers include Blue Tokai’s coarse setting for a channi, Navees Farm’s refrigerated cold brew ratio, Bialetti’s Moka Express instructions, the coffee and chicory shares on Namma’s Classic Blend, the varieties and processes in Hoysala’s named lots, and ARAKU’s four 250 g packs in its kilo option. Reddit’s public embed service confirmed a thread title for each of the ten recorded reader questions. The [editorial research notes](EDITORIAL-RESEARCH.md) identify the reference article and discussion behind each guide.

## Using the directory on a phone

- Typing “cafe kochi” now finds five records, and “cafe bengaluru” finds 73. Both previously returned zero. Accents and word order work across matching fields. Selecting a district narrows the city selector to cities represented there.
- The homepage now requests approximately 60 KB of uncompressed JSON. With the same event records, the previous loading pattern needed approximately 1.43 MB. Typing a directory query previously downloaded another 1.62 MB for the two secondary collections. Search links now carry the words and state into Arpan’s list or business leads when opened.
- The map opens as an interactive outline on data-saving connections or browsers without WebGL. On supported browsers it defers approximately 1.49 MB of detailed terrain until a state is selected. These measurements are raw file sizes. Real network transfer and time to display depend on compression, connection and the visitor’s device.
- In browser checks, selecting Nagaland opened its state directory. A Kochi search returned five results. The French press link in the grind guide returned 29 equipment records. The A–Z navigation opened the complete profile index.
- At a 390-pixel frame width, the journal and grind article fitted without sideways scrolling. The four topic links, story contents, author and photographer credits were present. The same-build browser calendar displayed the Shillong workshop and 14 upcoming records.

## Calendar and catalogue corrections

Blue Tokai’s organiser schedule and event pages supplied 12 missing sessions. The 20 November event is a cupping at Kynjai Winery in Shillong. Sessions on 21 November, 5 December and 6 December cover cupping, manual brewing and roastery visits in other cities. The calendar now contains 33 records, including 14 upcoming, 17 past and two awaiting confirmation on 18 November 2026. Ticket availability remains with the organisers. [Blue Tokai calendar](https://bluetokaicoffee.com/pages/coffee-workshop-events)

All twelve new entries have a confirmed 11:00–13:00 IST slot and export a timed calendar appointment. An event with two possible showings or unpublished hours offers a date reminder. Links to the organiser and individual venue remain attached to each listing.

Removed stock annotations from the display names of two equipment entries. Both the Benki stainless steel French press and the white CAFEC Abaca Cup 4 filters retain their original merchant wording and source history. Also corrected the Wayanad journal article’s links into the farm and café filters. [Benki French press](https://www.benkibrewingtools.com/products/benki-stainless-steel-french-press-300-ml-350-ml) · [CAFEC filters](https://www.benkibrewingtools.com/products/copy-of-cafec-abaca-cone-shaped-paper-filter-cup-1)

## Geographic coverage

| Measure | Result |
| --- | --- |
| Core listing IDs | 993 records, all IDs unique |
| State and UT pages | 36, with listings in 28 |
| District pages | 790, with listings in 54 across 19 states and UTs |
| Profiles with a district | 363, comprising 35 districts written directly into profiles and 328 assigned from the district evidence file |
| Profiles awaiting a district | 630 |
| Profiles without a state / without a city | 129 / 198 |
| Profiles with coordinates | 387. Every coordinate pair has a pin flag and every pin flag has a coordinate pair. |
| Approved Kerala places | 33 across eight of 14 districts |
| National primary categories | 605 cafés, 301 roasters, 33 producer leads, 23 farms, 22 brands, five trade entries, three education entries and one person |

Every district assignment resolves to a named district in that record’s state. Every auxiliary district evidence ID resolves to an existing profile. Of the 328 additional district references, 266 point to Esri India boundaries and 62 to public administration websites. Each state’s core listing, café, roaster, farm and lead totals agree with the current records under the directory’s category rules.

Arunachal Pradesh, Assam, Manipur, Mizoram, Tripura, Andaman and Nicobar Islands, Dadra and Nagar Haveli and Daman and Diu, and Lakshadweep each have zero core records. Kerala’s six empty district pages are Alappuzha, Kasaragod, Kollam, Kottayam, Pathanamthitta and Thrissur. These are gaps in the atlas.

The published data manifest formerly reported 958 unresolved districts by counting blank fields in the base records. It now counts the records after valid district evidence is applied, publishes the path to that evidence, and reports 630. The reconciliation script and automated check use the same criterion.

## Duplicates and weak geography

Matching trimmed, case-folded name, exact category, city and state finds 26 pairs involving 52 profiles. Five example pairs are Coffeeverse in Ahmedabad, Corridor Seven Coffee Roasters in Nagpur, ALTRY in Gurugram, Vinyl & Brew in Chennai and Ground Zero Coffee Roasters in Nashik. Compare official addresses, branch names and roles before consolidating. The older catalogue audit separately flags 30 roaster-name groups using a different rule.

Thirteen city fields previously contained the state name Goa or Nagaland, or the country name India. Nine now use a documented café or roastery locality, including Assagao for Coffee Culture's roastery. Four are left unassigned. Caliber Cafe has conflicting locality descriptions on Colva–Benaulim Road. Latin Quarter names only its state, Nagaland Coffee needs a branch match, and Bean Song publishes a Bengaluru office address without a confirmed roasting location. Each record retains the imported city label. These changes preserve the original state, district and coordinates. [Coffee Culture roastery](https://coffeeculture.co.in/pages/contact-us) · [Latin Quarter](https://latinquarter.in/faq) · [Bean Song office](https://beansongcoffee.in/pages/contact-us)

## Breadth of research

The source register has a 412-entry snapshot of Arpan’s original map, of which 397 carry India address/state evidence, three are identified as overseas and 12 require location verification. Other source snapshots include 122 Indian Coffee Beans roasters, 1,698 product observations and 18 Caffeine Letter index entries. Homegrounds is represented by its landing page. Saptabeeja contributed 12 of an indicated 150 estate records and Spill The Beans 25 of an indicated 39. CoffeeIndustry.in has no bulk extraction. The separate 1,416 research leads can overlap the main directory and Arpan’s map.

Of 5,163 coffee catalogue observations, 3,476 lack a business state. All 1,641 equipment observations and both experience offerings lack a state. Nineteen community records include 11 without a state. Of 34 learning resources, 15 have no state. A national or online resource can legitimately lack a geographic assignment.

## Search data and follow-up

A 200 response, an accessible sitemap and correct markup establish that a page can be reached. Google indexing, competitor traffic, search volume and field Core Web Vitals require their own evidence. After release, inspect the journal index, one new article and the A–Z page in the property’s Search Console. Review impressions for India, the queries that surfaced each article, and any indexing exclusions. Check actual mobile field metrics once enough traffic is available.

Reference URLs checked include [the public site](https://www.specialtycoffeeindia.blog/), [Journal](https://www.specialtycoffeeindia.blog/journal/), [events](https://www.specialtycoffeeindia.blog/events/), [Wayanad](https://www.specialtycoffeeindia.blog/states/kerala/districts/wayanad/), [one producer](https://www.specialtycoffeeindia.blog/places/tsiese-coffee-estate/), [robots.txt](https://www.specialtycoffeeindia.blog/robots.txt) and [sitemap.xml](https://www.specialtycoffeeindia.blog/sitemap.xml).

The final build produced 1,852 routes and 1,105 indexable sitemap entries. Automated checks passed for local links, district and profile paths, author and source metadata, calendar downloads and journal navigation. The edition-specific validation summary is included in `validation.json`.
