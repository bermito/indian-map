import { journalStories, renderJournalIndex, renderJournalArticle } from './journal.mjs';

export const origin = 'https://www.specialtycoffeeindia.blog';
const site = { '@type': 'WebSite', name: 'Specialty Coffee India', url: origin + '/' };
const journalPages = [
  {
    path: '/journal/',
    title: 'The Indian coffee journal',
    description: 'Field guides to Indian coffee regions, cafés, producers, brewing and community events.',
    html: renderJournalIndex,
    type: 'CollectionPage'
  },
  ...journalStories.map(story => ({
    path: '/journal/' + story.slug + '/',
    title: story.title,
    description: story.description,
    html: () => renderJournalArticle(story.slug),
    date: story.date,
    image: story.image,
    imageAlt: story.imageAlt,
    type: 'BlogPosting'
  }))
];

const journalByPath = new Map(journalPages.map(page => [page.path, page]));

export function findPage(pathname, atlas) {
  const path = pathname.replace(/\/+$/, '') + '/';
  return journalByPath.get(path) || atlas?.resolve(path);
}

export function allPages(atlas) {
  return [...journalPages, ...atlas.pages];
}

export function schemaFor(page) {
  const url = origin + page.path;
  const schema = {
    '@context': 'https://schema.org',
    '@type': page.type === 'BlogPosting' ? 'BlogPosting' : page.path.startsWith('/places/') ? 'WebPage' : 'CollectionPage',
    name: page.title,
    description: page.description,
    url,
    inLanguage: 'en-IN',
    isPartOf: site
  };
  if (schema['@type'] === 'BlogPosting') {
    schema.headline = page.title;
    if (page.image) schema.image = origin + page.image;
    schema.datePublished = page.date;
    schema.mainEntityOfPage = url;
    schema.publisher = { '@type': 'Organization', name: site.name, url: site.url };
  }
  return schema;
}
