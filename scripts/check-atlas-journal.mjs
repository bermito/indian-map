import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createAtlas } from '../assets/atlas-pages.mjs';
import { journalStories } from '../assets/journal.mjs';
import { allPages, findPage, origin, schemaFor } from '../assets/published-pages.mjs';

const read = key => JSON.parse(fs.readFileSync('data/' + key + '.json', 'utf8'));
const directory = read('directory');
const atlas = createAtlas(directory, read('districts'));
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
for (const story of journalStories) {
  assert.ok(articleIndex.includes('href="/journal/' + story.slug + '/"'));
  const html=fs.readFileSync('dist/journal/' + story.slug + '/index.html','utf8');
  assert.match(html, /<article[\s>]/);
  assert.match(html, /href="https?:\/\//);
}
console.log('PASS: '+directory.length+' place profiles, '+journalStories.length+' journal articles, '+pages.length+' unique district, journal and place URLs. Checked direct HTML, canonical URLs and sitemap.');
