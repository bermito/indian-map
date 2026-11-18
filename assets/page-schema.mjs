export const origin = 'https://www.specialtycoffeeindia.blog';
const site = { '@type': 'WebSite', name: 'Specialty Coffee India', url: origin + '/' };

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
    if (page.dateModified) schema.dateModified = page.dateModified;
    schema.author = { '@type': 'Organization', name: site.name, url: site.url };
    schema.isPartOf = { '@type': 'Blog', name: 'The Indian coffee journal', url: origin + '/journal/' };
    schema.mainEntityOfPage = url;
    schema.publisher = { '@type': 'Organization', name: site.name, url: site.url };
  }
  return schema;
}
