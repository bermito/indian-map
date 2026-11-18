import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createAtlas } from '../assets/atlas-pages.mjs';
import { journalStories } from '../assets/journal.mjs';
import { allPages, findPage, origin, schemaFor } from '../assets/published-pages.mjs';

const read = key => JSON.parse(fs.readFileSync('data/' + key + '.json', 'utf8'));
const directory = read('directory');
const atlas = createAtlas(directory, read('districts'));
const manifest = read('manifest');
const unresolved = directory.filter(record => !atlas.districtNames(record.state).includes(record.district));
assert.equal(manifest.districtsUnresolved, unresolved.length, 'Manifest must count district evidence used by the atlas');
assert.equal(manifest.files.districts, 'districts.json');
const pages = allPages(atlas);
const sitemap = fs.readFileSync('dist/sitemap.xml','utf8');
const articleIndex = fs.readFileSync('dist/journal/index.html','utf8');

assert.equal(new Set(pages.map(page => page.path)).size, pages.length, 'URL collision');
for (const place of directory) {
  const url = atlas.profilePath(place);
  assert.ok(findPage(url, atlas), 'Missing profile for ' + place.name);
}
for (const page of pages) {
  const html = fs.readFileSync(path.join('dist', page.path, 'index.html'), 'utf8');
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(schema,schemaFor(page), page.path);
  assert.ok(html.includes('rel="canonical" href="' + origin + page.path + '"'), page.path);
  assert.equal(sitemap.includes('<loc>' + origin + page.path + '</loc>'), !page.noindex, page.path);
  assert.match(html, /<main [^>]*data-static-page[^>]*>[\s\S]*?<h1[\s>]/);
  assert.equal(findPage(page.path, atlas)?.path, page.path);
}
// A profile should be reachable through ordinary HTML links as well as via the sitemap.
const alphabetical = fs.readFileSync('dist/explore/all/index.html','utf8');
const profileLinks = new Set([...alphabetical.matchAll(/href="(\/places\/[^"]+\/)"/g)].map(match => match[1]));
assert.equal(profileLinks.size, directory.length, 'Every core profile appears in the A–Z index');
for (const state of read('coverage').states.filter(row => !row.directory_entries)) {
  const slug = state.state.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const statePath = '/states/' + slug + '/';
  assert.match(fs.readFileSync(path.join('dist',statePath,'index.html'),'utf8'), /name="robots" content="noindex,follow"/);
  assert.ok(!sitemap.includes('<loc>' + origin + statePath + '</loc>'), statePath);
}
for (const story of journalStories) {
  assert.ok(articleIndex.includes('href="/journal/' + story.slug + '/"'));
  const html=fs.readFileSync('dist/journal/' + story.slug + '/index.html','utf8');
  assert.match(html, /<article[\s>]/);
  assert.match(html, /href="https?:\/\//);
}
console.log('PASS: '+directory.length+' place profiles, '+journalStories.length+' journal articles, '+pages.length+' unique district, journal and place URLs. Checked direct HTML, canonical URLs and sitemap.');

assert.equal(journalStories.length, 17, 'The journal includes seven prior stories and ten new guides');
assert.equal(new Set(journalStories.map(story => story.slug)).size, journalStories.length, 'Duplicate journal slug');
const researchedGuides = journalStories.filter(story => story.intent);
assert.equal(researchedGuides.length, 10, 'Guides with an editorial research record');
const editorialDomains = new Set();
for (const { slug, intent, sources } of researchedGuides) {
  for (const field of ['query', 'signal', 'angle']) assert.ok(intent[field]?.trim(), slug + ' ' + field);
  assert.equal(new URL(intent.signalUrl).protocol, 'https:', slug + ' reader question URL');
  const primary = new URL(intent.reference);
  assert.equal(primary.protocol, 'https:', slug + ' editorial source URL');
  assert.ok(sources.some(([, href]) => href === intent.reference), slug + ' primary source credited');
  editorialDomains.add(primary.hostname.replace(/^www\./, ''));
}
assert.equal(editorialDomains.size, 10, 'The ten guides draw from ten distinct primary domains');

const hrefs = html => Array.from(html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g), match => match[1].replaceAll('&amp;', '&'));
const indexLinks = hrefs(articleIndex);
const diskPage = pathname => path.join('dist', pathname, 'index.html');
const topicIds = new Set(journalStories.map(story => story.topic));
assert.equal(topicIds.size, 4, 'The four journal topics');
for (const topic of topicIds) {
  assert.ok(indexLinks.includes('#' + topic) && articleIndex.includes('id="' + topic + '"'), topic + ' index navigation');
}
for (const story of journalStories) {
  const pathname = '/journal/' + story.slug + '/';
  const page = fs.readFileSync(diskPage(pathname), 'utf8');
  const article = page.match(/<article class="ij-article">[\s\S]*?<\/article>/)?.[0];
  assert.ok(article, story.slug + ' static article');
  const links = hrefs(article);
  assert.ok(links.includes('/journal/#' + story.topic), story.slug + ' links back to its topic');
  for (const [, href] of [...story.atlas, ...story.sources]) {
    assert.ok(links.includes(href), story.slug + ' credited or related link ' + href);
  }
  for (let i = 1; i <= story.sections.length; i++) {
    assert.ok(links.includes('#part-' + i), story.slug + ' table of contents section ' + i);
  }
  for (const href of links) {
    const target = new URL(href, origin + pathname);
    if (target.origin !== origin) continue;
    const targetFile = diskPage(target.pathname);
    assert.ok(fs.existsSync(targetFile), story.slug + ' missing local target ' + href);
    if (target.hash) {
      const targetHtml = target.pathname === pathname ? page : fs.readFileSync(targetFile, 'utf8');
      assert.ok(targetHtml.includes('id="' + target.hash.slice(1) + '"'), story.slug + ' unresolved anchor ' + href);
    }
  }
  const figures = [...article.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/g)];
  assert.equal(figures.length, story.extraPhoto ? 2 : 1, story.slug + ' credited photographs');
  for (const [index, [, figure]] of figures.entries()) {
    const image = figure.match(/<img\b[^>]*>/)?.[0] || '';
    const src = image.match(/\bsrc="([^"]+)"/)?.[1];
    assert.match(src || '', /^\/assets\/journal-images\/[\w-]+\.webp$/, story.slug + ' local photograph');
    if (index === 0) assert.equal(src, story.image, story.slug + ' primary photograph');
    assert.match(image, /\balt="[^"\s][^"]*"/, story.slug + ' image alternative');
    const bytes = fs.readFileSync(path.join('dist', src));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', src);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', src);
    assert.match(figure, /<figcaption>[\s\S]+?<small>/, src + ' caption');
    const credit = figure.match(/Photograph by <a href="([^"]+)">([^<]+)<\/a> · <a href="([^"]+)">([^<]+)<\/a>/);
    assert.ok(credit && credit[2].trim() && credit[4].trim(), src + ' named photographer and licence');
    assert.equal(new URL(credit[1]).protocol, 'https:', src + ' attribution URL');
    assert.equal(new URL(credit[3]).hostname, 'creativecommons.org', src + ' licence URL');
  }
}
console.log('PASS: 17 journal articles, 10 source domains, four topic links, contents anchors, atlas destinations and credited local photographs.');
