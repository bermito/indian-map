// The browser and static site builder use the same editorial copy and links.
import brewingStories from './stories-brewing.mjs';
import buyingStories from './stories-buying.mjs';
import fieldStories from './stories-field.mjs';
import guidePhotos from './guide-photos.mjs';

const editionDate = '2026-11-18';
const regions = ['Coffee Board of India · Coffee-growing regions', 'https://coffeeboard.gov.in/coffee-regions-india.html'];
const gi = ['Ministry of Commerce & Industry · Regional coffee names', 'https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1569831&lang=2&reg=48'];
const bySa = 'https://creativecommons.org/licenses/by-sa/4.0/';
const ccZero = 'https://creativecommons.org/publicdomain/zero/1.0/';

const photos = {
  ...guidePhotos,
  kohima: {
    file: 'kohima.webp', width: 1200, height: 800,
    alt: 'Clusters of houses spread over the green hills of Kohima beneath clouds.',
    caption: 'Kohima city seen from above in 2017. Tsiese Coffee Estate lies in Tsiesema village nearby.',
    author: 'Chinmayisk', source: 'https://commons.wikimedia.org/wiki/File:Top_view_of_Kohima.jpg',
    license: 'CC BY-SA 4.0', licenseUrl: bySa
  },
  karnataka: {
    file: 'bababudangiri.webp', width: 1200, height: 800,
    alt: 'Steep green ridge and exposed rock on the way to Baba Budangiri.',
    caption: 'On the road to Baba Budangiri in Karnataka, 2003.',
    author: 'Likhith N.P', source: 'https://commons.wikimedia.org/wiki/File:Scenic_view_of_a_hill_en_route_to_Bababudangiri_-_panoramio.jpg',
    license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/'
  },
  bengaluru: {
    file: 'ulsoor.webp', width: 1200, height: 900,
    alt: 'Trees reflected in the water at Ulsoor Lake in Bengaluru.',
    caption: 'Ulsoor Lake, Bengaluru, photographed in 2009.',
    author: 'Abhishek Kumar', source: 'https://commons.wikimedia.org/wiki/File:Ulsoor_Lake,_Bangalore.jpg',
    license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
  },
  araku: {
    file: 'araku.webp', width: 1200, height: 900,
    alt: 'Roadside trees, a small vehicle and stalls at a coffee plantation in Araku Valley.',
    caption: 'A roadside view in the Araku Valley plantation area, Andhra Pradesh, 2019.',
    author: 'Tarunsamanta', source: 'https://commons.wikimedia.org/wiki/File:Araku_Valley_coffee_plantations.jpg',
    license: 'CC BY-SA 4.0', licenseUrl: bySa
  },
  wayanad: {
    file: 'wayanad-coffee.webp', width: 1400, height: 933,
    alt: 'Coffee cherries on a branch in Wayanad, Kerala.',
    caption: 'Coffee growing in Wayanad, photographed in November 2020.',
    author: 'Nrr1729', source: 'https://commons.wikimedia.org/wiki/File:Wayanad_coffee.jpg',
    license: 'CC BY-SA 4.0', licenseUrl: bySa
  },
  cherries: {
    file: 'wayanad-cherries.webp', width: 1280, height: 960,
    alt: 'Unripe coffee cherries growing along a branch in Vaduvanchal.',
    caption: 'Unripe coffee in Vaduvanchal, Wayanad, in July 2025.',
    author: 'CocoPhotographer008', source: 'https://commons.wikimedia.org/wiki/File:Unripe_Coffee_Cherry_Wayand.jpg',
    license: 'CC BY-SA 4.0', licenseUrl: bySa
  },
  brew: {
    file: 'manual-brewing.webp', width: 1400, height: 932, alt: 'Pouring water by hand over ground coffee in a paper filter.',
    caption: 'Pouring by hand gives you control over how quickly the water reaches the coffee.',
    author: 'Kim Sanso', source: 'https://commons.wikimedia.org/wiki/File:Manual_drip_(pour-over)_coffee.jpg',
    license: 'CC0 1.0', licenseUrl: ccZero
  },
  kochi: {
    file: 'fort-kochi.webp', width: 1400, height: 788, alt: 'The Fort Kochi waterfront in Kerala.',
    caption: 'Fort Kochi, where Cochin Club hosted the October gathering. Waterfront photograph from 2016.',
    author: 'Jayabilla', source: 'https://commons.wikimedia.org/wiki/File:Fort_Kochi_beach_ഫോർട്ട്_കൊച്ചി_ബീച്ച്.jpg',
    license: 'CC0 1.0', licenseUrl: ccZero
  }
};

const originalStories = [
  {
    slug: 'wayanad-beyond-the-bag', title: 'Whose coffee is in a bag of Wayanad Robusta?',
    category: 'At origin · Wayanad', description: 'An estate in Thirunelly and a smallholder processing initiative offer two ways to follow a Wayanad coffee back to its source.',
    photo: 'wayanad', extraPhoto: 'cherries',
    sections: [
      ['Start with a name', 'Turn a bag of Wayanad Robusta around and look for the next name after Wayanad. It might belong to an estate, a processor or a group of growers. Each tells you something different about the coffee. Wayanad Robusta has its own geographical indication. An individual lot can tell a much more detailed story.'],
      ['Two entries in the same district', 'Brahmagiri Estate gives you one place to begin. Kelachandra identifies Thirunelly as its village and lists Robusta and pepper as commercial crops. On a bag carrying the estate name, the useful follow-up is which harvest and process you are tasting.', 'Komban Kampini, also known as Vernacular, offers a different starting point. The Kerala guide records an initiative working with smallholders on fine Robusta. A processor can be the name people recognise even when the cherry comes from growers working separate plots. Ask which grower or village contributed to the particular lot.'],
      ['Take the question to the counter', 'Ask the barista to show you the bag for the coffee in your cup. Write down the grower or group, process and roaster. If the producer is missing, the roaster may still have the detail in its lot notes. Keeping those three names together makes it much easier to find that coffee again.', 'Use the Wayanad district guide to look up the names afterward. Brahmagiri is a private working estate. Contact the producer first if you are hoping to visit.']
    ],
    sources: [gi, ['Kelachandra Coffee · Brahmagiri Estate', 'https://kelachandracoffee.com/brahmagiri/'], ['Specialty Coffee Keralam · Komban Kampini', 'https://www.specialtycoffeekerala.com/places/komban-kampini/']],
    atlas: [['Brahmagiri Estate', '/places/kelachandra-coffee-brahmagiri-estate/'], ['Komban Kampini', '/places/komban-kampini/'], ['Wayanad farms and producers', '/states/kerala/?district=Wayanad&kind=farms'], ['Wayanad cafés', '/states/kerala/?district=Wayanad&kind=cafes']]
  },
  {
    slug: 'chikmagalur-and-bababudangiris', title: 'Two names on a Karnataka coffee bag',
    category: 'Field guide · Karnataka', description: 'Chikkamagaluru and the Bababudangiri hills appear side by side on coffee labels. Here is what each name tells you.',
    photo: 'karnataka',
    sections: [
      ['A district and a range of hills', 'A search for Chikkamagaluru can turn up the spelling Chikmagalur. You will see the shorter spelling on older labels and on the Coffee Board’s region guide. Bababudangiris is more precise geographically. The Ministry of Commerce places this growing region in the central part of Chikkamagaluru district.', 'The two names also appear separately among India’s geographical indications for Arabica. If a menu simply says “Karnataka”, look for the growing region or estate name on the roaster’s label.'],
      ['Meet a named estate', 'Take Garigekhan in Sugudvani village. Kelachandra’s estate profile places it beside the Muthodi range of the Bhadra Tiger Reserve. The estate lists both Arabica and Robusta alongside pepper, turmeric and citrus. Even with the estate identified, you still need to know which coffee plant and which lot supplied the bag.'],
      ['Compare two coffees from the hills', 'Ask a roaster for two Karnataka lots with the same processing method and a similar roast. Brew them at the same coffee-to-water ratio, then taste them again as they cool. Jot down which has the longer finish or the heavier feel. Keep those observations next to the estate names so they remain useful when the next harvest appears.']
    ],
    sources: [regions, gi, ['Kelachandra Coffee · Garigekhan Estate', 'https://kelachandracoffee.com/garigekhan/']],
    atlas: [['Garigekhan Estate', '/places/garigekhan-estate/'], ['Chikkamagaluru district', '/states/karnataka/districts/chikkamagaluru/'], ['Browse coffees by roaster and process', '/coffee/']]
  },
  {
    slug: 'bengaluru-coffee-by-neighbourhood', title: 'A two-stop coffee visit in Bengaluru',
    category: 'City notes · Bengaluru', description: 'Start in Indiranagar or Ulsoor. Two cafés offer quite different ways to talk about where a coffee comes from.',
    photo: 'bengaluru',
    sections: [
      ['Indiranagar for an Eastern Ghats connection', 'ARAKU lists its Bengaluru café in Indiranagar. Begin by asking which Araku Valley lot is available that day and whether the menu names a village or a producer. Its coffee cooperative describes collecting cherries at village centres. That gives you something specific to ask about while the coffee brews.', 'If you would like to brew the coffee at home, check whether the retail bag matches the one served at the bar. The name of a café can cover several different coffees.'],
      ['Ulsoor for an estate roaster', 'Maverick & Farmer lists its Ulsoor café at Gate 3 on Gangadhar Chetty Road, in Halasuru. Ulsoor and Halasuru are both useful search terms for this stop. The company says it grows and roasts the coffees it serves. Ask for the process behind one of the day’s coffees and how the bar is brewing it.'],
      ['Plan around one question', 'Choose the café nearest your starting point, then open the other operator’s map before setting off. If time is short, one careful comparison at a single counter can tell you more than a hurried second stop. Two people could split the same coffee brewed two ways and compare what they notice as it cools.', 'The directory groups multiple venues from across Bengaluru. Use the branch name on the operator’s page for directions and check the day’s opening hours there.']
    ],
    sources: [['ARAKU · Café locations', 'https://www.arakucoffee.in/pages/locations'], ['ARAKU · Village collection and the cooperative', 'https://www.arakucoffee.in/pages/19-91'], ['Maverick & Farmer · Addresses and opening hours', 'https://www.maverickandfarmer.com/pages/our-community']],
    atlas: [['Bengaluru cafés', '/states/karnataka/?city=Bengaluru&kind=cafes'], ['Bengaluru roasters', '/states/karnataka/?city=Bengaluru&kind=roasters']]
  },
  {
    slug: 'araku-and-koraput', title: 'Araku and Koraput, two origins in the Eastern Ghats',
    category: 'At origin · Andhra Pradesh and Odisha', description: 'Follow coffee cherry to a village collection point in Araku, then look north to the way Koraput’s coffee reaches buyers.',
    photo: 'araku',
    sections: [
      ['Where the cherry is weighed', 'ARAKU describes a collection day that begins before a truck reaches the village. Farmers sort their cherries into grades, bring them to the centre and have them weighed under a cooperative representative’s supervision. The weight and grade go into the grower’s passbook as well as the village record.', 'When several growers contribute to a bag, a village or cooperative name can be the most useful clue to its origin. Look for that detail alongside the roaster’s name.'],
      ['Follow the Odisha label', 'Across the state boundary in Koraput, Odisha’s Tribal Development Co-operative Corporation buys coffee from growers and markets the Koraput Coffee brand. The central government’s account traces its procurement work to the 2019–20 season. Koraput Coffee received separate awards for washed and natural coffees in the Coffee Board’s 2024 Know Your Kaapi programme.', 'Those two awards make a good case for looking one line further down the bag. Koraput gives you a place to begin, while washed or natural tells you something about how the fruit was handled.'],
      ['Choose the right point on the map', 'For the growing landscape, open Andhra Pradesh for Araku or Odisha for Koraput. If you bought an Araku coffee in Bengaluru, its café entry belongs under Karnataka. Save the café for a return visit and keep the origin with your tasting notes.']
    ],
    sources: [regions, ['ARAKU · Farmer collection and grading', 'https://www.arakucoffee.in/pages/19-91'], ['Press Information Bureau · Koraput procurement and cup awards', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2196210']],
    atlas: [['Araku listings in Andhra Pradesh', '/states/andhra-pradesh/?q=Araku'], ['Explore Odisha', '/states/odisha/']]
  },
  {
    slug: 'a-first-v60', title: 'One cup, 15 grams, a first V60 brew',
    category: 'Brew guide · At home', description: 'A repeatable pour-over for tasting a new bag, with one small change to try on the second cup.',
    photo: 'brew',
    sections: [
      ['Weigh coffee and water separately', 'For one mug, start with 15 g of filter-ground coffee and 250 g of water. Set a paper filter into the V60, wet the paper with hot water and empty the mug. Add the ground coffee. Put the mug and brewer together on a scale, and reset the scale to zero before pouring.'],
      ['Wet the bed, then pour', 'Start a timer as you pour enough hot water to wet all the grounds. Wait about 30 seconds. Add the remaining water slowly in small circles until the scale reads 250 g in total. Let the coffee drain before lifting the brewer off the mug. Hario gives about two and a half minutes as a guide to the brew time.', 'Stir the mug gently. Take a small sip when it is comfortable to drink, then another a minute later. Is the sweetness easier to pick out? Is there a dry finish? Write down what you taste in your own words.'],
      ['Try one change tomorrow', 'Keep the same coffee, water and amount of each. If the first brew ran quickly and tasted thin, try a slightly finer grind. If it drained very slowly and tasted dry, try a little coarser. Keeping the other variables steady makes the second cup a useful comparison. With pre-ground coffee, repeat your first brew and practise making the pour more even.']
    ],
    sources: [['Hario UK · Basic V60 brew guide', 'https://www.hario.co.uk/pages/brew-guides-v60-basic'], ['Hario UK · Brewing with a scale', 'https://www.hario.co.uk/pages/brew-guides-v60-intermediate']],
    atlas: [['Find a filter coffee', '/coffee/'], ['Explore brewing equipment', '/equipment/']]
  },
  {
    slug: 'kerala-origins-two-tables', title: 'From Sukoru to Cochin Club',
    category: 'Event archive · Kerala', description: 'What the Kerala Origins programmes in Kozhikode and Fort Kochi tell us about the growers and coffees at the table in 2026.',
    photo: 'kochi',
    sections: [
      ['Kozhikode, 11 July', 'Kerala Origins held its first gathering at Sukoru Specialty Coffee in Kozhikode. The programme combined a brew bar and cupping with conversations about the farms. Its producer list included Gayathri M S of Krishnagiri Estate, alongside Windermere, On Ground Farm, Silent Valley and others. The organiser records Arabica, Robusta and Excelsa at the gathering.'],
      ['Fort Kochi, 10 October', 'At Cochin Club, the programme gave readers a way to compare how different producers handled their harvests. Windermere contributed natural Arabica. Rose Garden’s entry paired washed and honey-processed Robusta. The programme listed Vernacular with anaerobic Robusta and KoffyKraft as a coffee collaborator.', 'Read those descriptions next to the names. The process belongs to the coffee shown that afternoon. An estate can make different choices for another lot or season.'],
      ['Revisit the tables', 'Both gatherings have ended. Kerala Origins keeps a separate photo gallery and programme for each one. Open the Kozhikode archive for the Sukoru gathering and the Kochi archive for the Cochin Club event. To find another cupping, visit the events calendar and look for an organiser-confirmed date.']
    ],
    sources: [['Kerala Origins · Kozhikode programme and photographs', 'https://www.keralaoriginscoffee.com/kozhikode-2026'], ['Kerala Origins · Kochi programme and photographs', 'https://www.keralaoriginscoffee.com/kochi-2026']],
    atlas: [['Past gatherings in Kerala', '/events/?state=Kerala&view=past'], ['Find a coffee event', '/events/']]
  },
  {
    slug: 'tsiesema-nagaland', title: 'A grower’s name to look for in Nagaland',
    category: 'Producer notes · Nagaland', description: 'At Tsiese Coffee Estate, Lhouvilie Yhor grows two Arabica selections in the hills near Kohima.',
    photo: 'kohima',
    sections: [
      ['Find Tsiesema on the label', 'Tsiese Coffee Estate takes its name from Tsiesema village near Kohima. In the estate’s account, Lhouvilie Yhor trained as an architect and began planting coffee there in 2015 with support from the Coffee Board. The estate describes its site at about 1,500 metres, with coffee growing beneath a forest canopy.'],
      ['Two selections, one estate', 'Tsiese identifies SL9 and SL13 as Arabica selections it grows. If a roaster names one of them, check the rest of the label for the harvest and process. Those details belong to an individual lot. Two coffees from Tsiesema can share a grower and still have different stories by the time they reach a brewer.'],
      ['Find the coffee again', 'At a coffee bar, ask whether the staff can show you the roaster’s lot sheet. Photograph the estate name with the roast date or save the roaster in the directory. If you contact the estate itself, include the lot or harvest in your message so the grower can identify the coffee you tasted.']
    ],
    sources: [['Tsiese Coffee Estate · Estate and grower profile', 'https://www.tsiesecoffee.com/estate'], ['Tsiese Coffee · Producer contact', 'https://www.tsiesecoffee.com/contact']],
    atlas: [['Tsiese Coffee Estate', '/places/tsiese-coffee-estate/'], ['Kohima district', '/states/nagaland/districts/kohima/'], ['Cafés in Kohima', '/states/nagaland/?city=Kohima&kind=cafes']]
  }
];

const storiesBySlug = new Map(
  [...originalStories, ...brewingStories, ...buyingStories, ...fieldStories].map(story => [story.slug, story])
);

const topics = [
  { id: 'brewing', label: 'Brew at home', slugs: [
    'channi-french-press-filter-coffee-grind',
    'south-indian-filter-coffee-decoction',
    'cold-brew-or-iced-coffee-with-milk',
    'moka-pot-sputtering-bitter-coffee',
    'a-first-v60'
  ] },
  { id: 'buying', label: 'Buying coffee', slugs: [
    'choosing-coffee-for-milk-or-black',
    'coffee-tasting-notes-or-added-flavour',
    'storing-coffee-beans-and-ground-coffee-in-india',
    'arabica-robusta-south-indian-filter-coffee'
  ] },
  { id: 'origins', label: 'Farms & origins', slugs: [
    'wayanad-beyond-the-bag',
    'washed-natural-honey-indian-coffee',
    'chikmagalur-and-bababudangiris',
    'araku-and-koraput',
    'tsiesema-nagaland'
  ] },
  { id: 'community', label: 'Cafés & community', slugs: [
    'first-coffee-cupping-india',
    'bengaluru-coffee-by-neighbourhood',
    'kerala-origins-two-tables'
  ] }
];

export const journalStories = topics.flatMap(topic => topic.slugs.map(slug => {
  const story = storiesBySlug.get(slug);
  if (!story) throw new Error('Unknown journal story in ' + topic.id + ': ' + slug);
  const photo = photos[story.photo];
  return {
    ...story,
    topic: topic.id,
    date: story.date || editionDate,
    image: '/assets/journal-images/' + photo.file,
    imageAlt: photo.alt
  };
}));

const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => (
  {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]
));
const storyPath = story => '/journal/' + story.slug + '/';
const sectionId = index => 'part-' + (index + 1);
const formatDate = value => new Intl.DateTimeFormat('en-IN', {
  timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric'
}).format(new Date(value + 'T12:00:00Z'));

function photoImage(photo, lazy = true) {
  return `<img src="/assets/journal-images/${escapeHtml(photo.file)}" width="${photo.width}" height="${photo.height}" alt="${escapeHtml(photo.alt)}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
}

function photoFigure(photo) {
  return `<figure class="ij-photo">${photoImage(photo)}<figcaption>${escapeHtml(photo.caption)} <small>Photograph by <a href="${escapeHtml(photo.source)}">${escapeHtml(photo.author)}</a> · <a href="${escapeHtml(photo.licenseUrl)}">${escapeHtml(photo.license)}</a>. Resized and converted to WebP.</small></figcaption></figure>`;
}

function storyCard(story, heading = 'h2') {
  const photo = photos[story.photo];
  return `<article class="ij-card"><a href="${storyPath(story)}" class="ij-card-link"><div class="ij-image">${photoImage(photo)}</div><span class="ij-kicker">${escapeHtml(story.category)}</span><${heading}>${escapeHtml(story.title)}</${heading}><p class="ij-date"><time datetime="${story.date}">${formatDate(story.date)}</time></p><p>${escapeHtml(story.description)}</p><span class="ij-read">Read the story <span aria-hidden="true">→</span></span></a></article>`;
}

function linkList(links) {
  return links.map(([label, href]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`).join('');
}

export function renderJournalIndex() {
  const contents = topics.map(topic => `<a href="#${topic.id}">${escapeHtml(topic.label)}</a>`).join('');
  const shelves = topics.map(topic => {
    const cards = journalStories.filter(story => story.topic === topic.id).map(story => storyCard(story, 'h3')).join('');
    return `<section class="ij-shelf" aria-labelledby="${topic.id}"><h2 id="${topic.id}">${escapeHtml(topic.label)}</h2><div class="ij-grid">${cards}</div></section>`;
  }).join('');
  return `<section class="ij-index"><header class="ij-heading"><p class="ij-kicker">Journal</p><h1>The Indian coffee journal.</h1><p>Choose a grind for your channi, trace a Wayanad coffee to its grower, or find out what happens at your first cupping.</p></header><nav class="ij-topics" aria-label="Journal topics">${contents}</nav>${shelves}</section>`;
}

export function renderJournalTeasers(limit = 3) {
  const coverStories = ['south-indian-filter-coffee-decoction', 'wayanad-beyond-the-bag', 'first-coffee-cupping-india'];
  const selected = coverStories.map(slug => journalStories.find(story => story.slug === slug));
  const homepageStories = [...selected, ...journalStories.filter(story => !selected.includes(story))];
  return `<section class="ij-index ij-home" aria-labelledby="ij-home-title"><header class="ij-home-heading"><div><p class="ij-kicker">Journal</p><h2 id="ij-home-title">From the coffee journal.</h2></div><a href="/journal/">All stories →</a></header><div class="ij-grid">${homepageStories.slice(0, limit).map(story => storyCard(story, 'h3')).join('')}</div></section>`;
}

export function renderJournalArticle(slug) {
  const story = journalStories.find(item => item.slug === slug);
  if (!story) return '';
  const topic = topics.find(item => item.id === story.topic);
  const contents = story.sections.map(([title], index) => `<li><a href="#${sectionId(index)}">${escapeHtml(title)}</a></li>`).join('');
  const body = story.sections.map(([title, ...paragraphs], index) => {
    const picture = index === 0 ? photos[story.photo] : index === 1 ? photos[story.extraPhoto] : undefined;
    return `<section id="${sectionId(index)}"><h2>${escapeHtml(title)}</h2>${paragraphs.map(p => '<p>' + escapeHtml(p) + '</p>').join('')}${picture ? photoFigure(picture) : ''}</section>`;
  }).join('');
  return `<article class="ij-article"><nav class="ij-breadcrumbs" aria-label="Breadcrumb"><a href="/">Map</a><span aria-hidden="true">/</span><a href="/journal/">Journal</a><span aria-hidden="true">/</span><a href="/journal/#${topic.id}">${escapeHtml(topic.label)}</a></nav><header class="ij-heading"><p class="ij-kicker">${escapeHtml(story.category)}</p><h1>${escapeHtml(story.title)}</h1><p>${escapeHtml(story.description)}</p><div class="ij-date">By Specialty Coffee India · Published <time datetime="${story.date}">${formatDate(story.date)}</time></div></header><nav class="ij-toc" aria-label="In this story"><h2 class="ij-kicker">In this story</h2><ol>${contents}</ol></nav><div class="ij-body">${body}<aside class="ij-atlas"><h2>Explore the atlas</h2><ul>${linkList(story.atlas)}</ul></aside><section class="ij-sources"><h2>Sources and further reading</h2><ul>${linkList(story.sources)}</ul></section><a class="ij-back" href="/journal/">← All journal stories</a></div></article>`;
}
