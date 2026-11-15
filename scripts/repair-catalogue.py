#!/usr/bin/env python3
"""Apply reviewed catalogue fixes without guessing missing geography or identity."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
read = lambda name: json.loads((DATA / (name + '.json')).read_text())

def write(name, value):
    (DATA / (name + '.json')).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')))

def note(record, field, text):
    previous = record.get(field, '')
    if text not in previous:
        record[field] = (previous + ' ' + text).strip()

def preserve(record, fields):
    for field in fields:
        if field in record:
            record.setdefault('raw' + field[0].upper() + field[1:], record[field])

rules = read('catalogue-audit')
date = rules['checkedDate']
collections = {name: read(name) for name in ['products', 'equipment', 'other-products']}
for change in rules['classificationMoves']:
    source, target = collections[change['from']], collections[change['to']]
    item = next((r for r in source if r['id'] == change['id']), None)
    if item is None:
        assert any(r['id'] == change['id'] for r in target), 'Missing reviewed record: ' + change['id']
        continue
    assert not any(r['id'] == item['id'] for r in target), 'Duplicate destination ID: ' + item['id']
    preserve(item, ['kind', 'category', 'priceUnit', 'weightGrams', 'availableWeights', 'normalized250gINR'])
    item.update(kind=change['kind'], category=change['category'], classificationNote=change['reason'], classificationCheckedDate=date)
    item['normalized250gINR'] = None
    if change['to'] == 'equipment':
        imported = item.setdefault('rawMetadata', {})
        for field in ['roast', 'process', 'variety', 'estate', 'origin', 'altitude', 'flavourNotes', 'weightGrams', 'availableWeights']:
            if field in item:
                imported.setdefault(field, item.pop(field))
        item['locationKind'] = 'Seller location when explicitly supplied; not a farm origin'
        item['priceUnit'] = 'per source-listed equipment item or option; confirm seller details'
    elif change['category'] == 'Subscriptions':
        item.pop('weightGrams', None)
        item.pop('availableWeights', None)
        item['priceUnit'] = 'source-listed subscription price; confirm delivery count and pack options with seller'
        note(item, 'priceNote', 'Subscription price; not comparable to a single 250 g coffee pack.')
    else:
        item['priceUnit'] = 'per source-listed product or option; confirm seller details'
    source.remove(item)
    target.append(item)

all_rows = [r for rows in collections.values() for r in rows]
for item in all_rows:
    if item.get('price') == 0:
        preserve(item, ['price', 'priceUnit', 'normalized250gINR'])
        item['price'] = None
        item['normalized250gINR'] = None
        item['priceStatus'] = 'unconfirmed_zero_placeholder'
        note(item, 'priceNote', 'Price not confirmed. The source snapshot listed zero; this is not a confirmed free price. Check the seller for the current price.')
    if item.get('brand', '').casefold() == 'total coffee':
        item['brandRole'] = 'Retailer / seller'
        item['seller'] = item['brand']
        note(item, 'reviewNeeded', 'The source names a retailer. The actual coffee roaster is not independently established by this field.')

by_id = {r['id']: r for r in all_rows}
for correction in rules['priceCorrections']:
    item = by_id[correction['id']]
    if item.get('priceStatus') != 'official_seller_price_checked' or item.get('priceSourceUrl') != correction['url']:
        preserve(item, ['price', 'currency', 'priceUnit', 'weightGrams', 'availableWeights', 'normalized250gINR', 'snapshotDate'])
    for field in ['price', 'currency', 'weightGrams', 'normalized250gINR', 'priceUnit']:
        item[field] = correction[field]
    item['availableWeights'] = str(correction['weightGrams']) if correction['weightGrams'] else None
    item['priceNote'] = correction['note']
    item['priceStatus'] = 'official_seller_price_checked'
    item['priceCheckedDate'] = date
    item['priceSourceUrl'] = correction['url']
    item['snapshotDate'] = date
    item['verifiedPriceFields'] = correction['verifiedFields']
    item['evidenceLabel'] = 'Seller price checked'
    if correction.get('availabilityNote'):
        item['availabilityNote'] = correction['availabilityNote']
    if correction['url'] not in item.get('sourceUrls', []):
        item.setdefault('sourceUrls', []).append(correction['url'])
        item.setdefault('sourceNames', []).append('Été Coffee Roasters — official price')

for review in rules['metadataQuarantine']:
    item = by_id[review['id']]
    raw = item.setdefault('rawMetadata', {})
    for field, value in review['bad'].items():
        if item.get(field) == value:
            raw.setdefault(field, item.pop(field))
    item['metadataReviewFields'] = list(review['bad'])
    note(item, 'reviewNeeded', 'Imported ' + ', '.join(review['bad']) + ' metadata includes page-label text and has been withheld pending review. Original values are retained in the data.')

directory, review_rows = read('directory'), read('review')
for group in rules['duplicateNameGroups']:
    for item in directory:
        if item['id'] in group['recordIds']:
            item['duplicateReviewIds'] = [other for other in group['recordIds'] if other != item['id']]
            note(item, 'reviewNeeded', group['issue'])
    key = 'duplicate-name-' + group['recordIds'][0]
    if not any(r.get('auditKey') == key for r in review_rows):
        review_rows.append({'auditKey': key, 'type': 'Potential duplicate roaster', 'name': group['name'], 'record_id': group['recordIds'][0], 'record_ids': group['recordIds'], 'issue': group['issue'], 'source_urls': ' | '.join(group['sourceUrls']), 'action': 'Confirm business identity and branch scope; preserve source observations before merging.'})

manifest = read('manifest')
for name, rows in collections.items():
    assert len({r['id'] for r in rows}) == len(rows)
    write(name, rows)
    manifest['counts'][name] = len(rows)
write('directory', directory)
write('review', review_rows)
manifest['counts']['review'] = len(review_rows)
manifest['files']['catalogue-audit'] = 'catalogue-audit.json'
manifest['catalogueAudit'] = {'checkedDate': date, 'classificationMoves': len(rules['classificationMoves']), 'equipmentMovedFromCoffee': 34, 'otherProductsMovedFromCoffee': 3, 'subscriptionsMovedFromCoffee': 19, 'zeroPricesWithheld': sum(r.get('priceStatus') == 'unconfirmed_zero_placeholder' for r in all_rows), 'officialPriceCorrections': len(rules['priceCorrections']), 'metadataRecordsQuarantined': len(rules['metadataQuarantine']), 'duplicateNameGroupsForReview': len(rules['duplicateNameGroups'])}
notice = 'Catalogue audit separates equipment, non-coffee products and subscription totals from coffee packs. Unconfirmed zero prices and contaminated metadata are withheld, with raw source values retained.'
if notice not in manifest['notices']:
    manifest['notices'].append(notice)
write('manifest', manifest)
print(json.dumps({'counts': {name: len(rows) for name, rows in collections.items()}, 'audit': manifest['catalogueAudit']}, indent=2))
