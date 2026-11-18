#!/usr/bin/env python3
"""Rebuild Kerala from the checked editorial snapshot, preserving research separately.

Run with Python 3 from any directory. The checked-in source snapshot was extracted
from assets/content.js and generated pages at the commit recorded in its metadata.
Never use the upstream October content/*.json inputs to overwrite the current bundle.
"""
import collections
import json
import pathlib
import re
from urllib.parse import urljoin

ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/'data'
def read(n):return json.loads((DATA/(n+'.json')).read_text())
def write(n,v):(DATA/(n+'.json')).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def norm(v):return re.sub('[^a-z0-9]','',v.lower().replace('é','e'))
source=read('kerala-authority-source')
baseline=read('kerala-research-archive')
meta=source['meta']; site=meta['canonicalUrl']; checked=meta['extractedDate']
LABEL='Specialty Coffee Keralam'
CATEGORIES={'cafes':'Specialty cafés','roasters':'Specialty roasters','buyroasted':'Buy roasted coffee','farms':'Farms & producers','education':'Coffee education','baristas':'Baristas & home brewers','equipment':'Coffee equipment'}
city={'Ernakulam':'Kochi','Kozhikode':'Kozhikode','Kannur':'Kannur','Thiruvananthapuram':'Thiruvananthapuram'}
by_name={norm(p['n']):p['id'] for p in source['places']}
by_name.update({norm('Cafficana'):'cafficana-kochi',norm('Underblu Coffee'):'underblu-specialty-coffee'})
matched=collections.defaultdict(list)
unmatched=[]
for r in baseline['directory']:
 aid=by_name.get(norm(r['name']))
 if aid:matched[aid].append(r)
 else:unmatched.append(r)

directory=[]
for p in source['places']:
 cats=p['categories'];primary=next(c for c in cats if c!='buyroasted')
 r={'id':p['id'],'authorityId':p['id'],'name':p['n'],'name_ml':p['n_ml'],'nameMl':p['n_ml'],
 'kind':'people' if primary=='baristas' else primary,'category':CATEGORIES[primary],
 'categories':cats,'authorityCategoryLabels':[CATEGORIES[c] for c in cats],
 'state':'Kerala','stateAliases':['Keralam','കേരളം'],'district':p['district'],'country':'India',
 'districtAliases':source['districtAliases'].get(p['district'],[]),'description':p['m'],'notes':p['m'],'description_ml':p['m_ml'],'descriptionMl':p['m_ml'],
 'url':p.get('w') or (p.get('mapUrl') or site+'/places/'+p['id']+'/'),
 'authorityUrl':site+'/places/'+p['id']+'/',
 'sourceNames':[LABEL],'sourceUrls':[site+'/places/'+p['id']+'/'],
 'sourceIds':[p['id']],'status':'kerala_editorial_selection','evidenceLabel':'Kerala editorial source',
 'specialtyStatus':'Editorial selection in the user-approved Kerala directory; not a quality certification.',
 'checkedDate':p.get('checked',checked),'authorityImportedDate':checked,
 'hasPin':False,'geographyNote':'District and visiting details follow the corrected Kerala source. No coordinates inferred.',
 'sourceAuthority':{'name':LABEL,'url':site,'commit':meta['commit'],'checkedDate':checked},
 'previousResearchIds':[x['id'] for x in matched[p['id']]]}
 if p.get('contactChecked'):
  r['sourceAuthority']['contactUpdate']=p['contactChecked']
  r['authorityImportedDate']=p['contactChecked']
 if p['district'] in city:r['city']=city[p['district']]
 for k in ['address','address_ml','mapUrl','phone','phoneDisplay','email','contactChecked','hours','hours_ml','visitNote','visitNote_ml','editorNote','shopUrl','instagram','role','role_ml','locationSourceUrl']:
  if p.get(k):r[k]=p[k]
 for old,new in [('address_ml','addressMl'),('hours_ml','hoursMl'),('visitNote_ml','visitNoteMl')]:
  if p.get(old):r[new]=p[old]
 for s in p.get('sources',[]):
  if s.get('url') and s['url'] not in r['sourceUrls']:r['sourceUrls'].append(s['url'])
 if p.get('locationSourceUrl') and p['locationSourceUrl'] not in r['sourceUrls']:r['sourceUrls'].append(p['locationSourceUrl'])
 r['sourceCount']=len(r['sourceUrls']);r['relationships']=[rel for rel in source['relationships'] if p['id'] in [rel['from'],rel['to']]]
 directory.append(r)
write('directory',[r for r in read('directory') if r.get('state')!='Kerala']+directory)

events=[]
for e in source['events']:
 slug=e['slug'];url=site+'/events/'+slug+'/'
 r={'id':slug,'authorityId':slug,'name':e['title'],'name_ml':e.get('title_ml',''),'kind':'event','category':'Event archive','state':'Kerala',
 'district':e.get('district',''),'date':e['date'],'status':'past_editorial_archive','archived':True,'historicalStatus':'Source-listed past event; archived by the Kerala editor','verification':'kerala_editorial_source','evidenceLabel':'Kerala editorial source',
 'url':url,'sourceUrls':[url],'sourceNames':[LABEL],'checkedDate':e.get('checked',checked),'calendarEligible':False,
 'registrationClosed':True,'timezone':'Asia/Kolkata','notes':e.get('blurb',''),'venue':e.get('venue',''),'sourceNote':e.get('sourceNote',''),
 'sourceAuthority':{'name':LABEL,'url':site,'commit':meta['commit']}}
 for k in ['endDate','startTime','endTime','timeNote','mapUrl','organizerName','organizerUrl','entry','profileIds','profileConnectionLabel']:
  if e.get(k):r[k]=e[k]
 for k in ['url','posterSourceUrl']:
  if e.get(k):r['sourceUrls'].append(urljoin(site,e[k]))
 if e.get('startTime'):r['time']=e['startTime']+('–'+e['endTime'] if e.get('endTime') else '')
 if e.get('district') in city:r['city']=city[e['district']]
 events.append(r)
write('events',[r for r in read('events') if r.get('state')!='Kerala']+events)

education=[]
for p in directory:
 if 'education' in p['categories']:
  education.append({**p,'id':'kerala-education-'+p['authorityId'],'kind':'education_provider','category':'Education provider','calendarEligible':False,'status':'resource_available'})
write('learn',[r for r in read('learn') if r.get('state')!='Kerala']+education+source['guides'])
community={'id':'kerala-origins','authorityId':'kerala-origins','name':'Kerala Origins','kind':'community','category':'Producer & roaster community','state':'Kerala',
 'url':'https://www.keralaoriginscoffee.com/','sourceUrls':[site+'/blog/kerala-coffee-producers/','https://www.keralaoriginscoffee.com/our-story.html'],
 'sourceNames':[LABEL],'status':'kerala_editorial_source','evidenceLabel':'Kerala editorial source','checkedDate':checked,'calendarEligible':False,
 'notes':'A producer and roaster initiative formed in June 2026, with coffee showcases in Kozhikode and Kochi. Its members include Bermito, Terra Vagamon, Silent Valley and On Ground Farm.',
 'founders':['Vajid Kaitha Valappil','Ephrem Joseph','Moideen Kalladi','Nihal Parambath'],
 'sourceAuthority':{'name':LABEL,'url':site,'commit':meta['commit']}}
write('communities',[r for r in read('communities') if r.get('state')!='Kerala']+[community])

# Every original record remains byte-for-byte recoverable in the source archive.
# Entries outside the approved directory are visible only as clearly labelled leads.
leads=[r for r in read('leads') if r.get('reconciliationBatch')!='kerala-authority-2026-11-15']
def lead(r,origin):
 return {**r,'id':'kerala-review-'+r['id'],'originalResearchId':r['id'],'kind':'lead','originalKind':r.get('kind'),
 'category':'Kerala research lead','status':'needs_kerala_editorial_review','evidenceLabel':'Needs Kerala review',
 'sourceStatus':r.get('status'),'sourceEvidenceLabel':r.get('evidenceLabel'),
 'calendarEligible':False,'hasPin':False,'reconciliationBatch':'kerala-authority-2026-11-15','researchOrigin':origin,
 'reviewNeeded':'Preserved research record outside the approved Kerala directory. Not a confirmed directory listing.',
 'authorityDisposition':'Research lead; not promoted by absence or third-party inclusion.'}
for r in unmatched:leads.append(lead(r,'directory'))
event_alias={norm(e['title']) for e in source['events']}
for r in baseline['events']:
 if norm(r['name']) not in event_alias and not r['name'].startswith('Hario V60'):
  leads.append({**lead(r,'events'),'archived':True,'historicalStatus':r.get('status'),'reviewNeeded':'Historical source record preserved; outside the corrected Kerala calendar. Original date evidence and provenance remain available.'})
for r in baseline['learn']:
 if norm(r['name']) not in by_name:leads.append(lead(r,'learn'))
for r in baseline['communities']:leads.append(lead(r,'communities'))
# Source-supported narrative producer leads are not automatically map venues.
story_links={'Devi Estate':'devi-estate','Pampadumpara Estate':'pampadumpara-estate','Thumpassery Estate':'thumpassery-estate','Rosegarden Group of Farming Community':'rose-garden','On Ground Farm':'on-ground','Kuruvinakunnel Estate':'kuruvinakunnel'}
stories={r['id']:r for r in source['producerStories']}
for r in leads:
 if r.get('reconciliationBatch')=='kerala-authority-2026-11-15' and r.get('name') in story_links:
  story=stories.get(story_links[r['name']])
  if story:r['authorityNarrativeUrl']=story['authorityUrl']
devi=stories.get('devi-estate')
if devi:
 leads.append({'id':'kerala-narrative-devi-estate','name':'Devi Estate / Devi Plantations','kind':'lead','category':'Producer story lead','state':'Kerala','district':'Wayanad',
 'url':devi['authorityUrl'],'sourceUrls':[devi['authorityUrl']],'sourceNames':[LABEL],'evidenceLabel':'Needs Kerala review','status':'narrative_reference_not_directory_listing',
 'hasPin':False,'checkedDate':checked,'reconciliationBatch':'kerala-authority-2026-11-15',
 'notes':'The Kerala producer guide includes a historical Wayanad coffee sourcing reference. Current coffee range and sourcing relationship are unconfirmed.',
 'reviewNeeded':'Narrative source only; current operation and visiting details need confirmation.'})
write('leads',leads)

districts=[]
for name,ds in source['districtData'].items():
 rows=[r for r in directory if r['district']==name];counts={c:sum(c in r['categories'] for r in rows) for c in CATEGORIES}
 districts.append({'name':name,'district':name,'displayName':source['districtLabels'].get(name,name),'nameMl':ds['name_ml'],
 'aliases':source['districtAliases'].get(name,[]),'description':ds['sub'],'descriptionMl':ds['sub_ml'],'count':len(rows),'counts':counts,
 'coverageNote':'No approved listing yet; suggest a place for review.' if not rows else 'Editorial listings from Specialty Coffee Keralam.'})
redirects={r['id']:aid for aid,rows in matched.items() for r in rows}
reconciliation={'originalKeralaRecords':len(baseline['directory']),'matchedResearchRecords':sum(map(len,matched.values())),'uniqueApprovedPlaces':len(directory),'unmatchedDirectoryLeads':len(unmatched),'researchArchive':'kerala-research-archive.json',
 'oldIdToNewId':redirects,'matchedRecords':[{'previousId':r['id'],'previousName':r['name'],'authorityId':aid} for aid,rows in matched.items() for r in rows],
 'researchLeads':[{'previousId':r['id'],'name':r['name'],'leadId':'kerala-review-'+r['id']} for r in unmatched]}
write('kerala-reconciliation',reconciliation)
authority={'meta':meta,'districts':districts,'categories':CATEGORIES,'relationships':source['relationships'],'guides':source['guides'],
 'places':source['places'],'oldIdToNewId':redirects,
 'counts':{'places':len(directory),'events':len(events),'guides':len(source['guides']),'districts':len(districts),'categories':dict(collections.Counter(c for r in directory for c in r['categories']))},
 'faq':source['faq'],'peopleReferences':[{'name':'Lex Hamood','role':'Home brewer, content creator and journal reviewer','url':site+'/about/lex-hamood/'}],
 'communityIds':['kerala-origins'],'eventIds':[r['id'] for r in events],
 'reconciliation':reconciliation,
 'methods':{'deduplication':'One place, one authority ID; multiple categories do not increase total places.','sourcePriority':'User-approved Kerala source overrides third-party descriptions, categories and visiting details.','relationships':'Stockist, roasted-lot and event collaboration connections stay separate.','emptyDistricts':'No approved listing yet; not evidence that coffee businesses do not exist.','events':'Asia/Kolkata calendar dates; all current Kerala records are past archives.'}}
write('kerala-authority',authority)
coverage=read('coverage')
for row in coverage['states']:
 if row['state']=='Kerala':row.update({'directory_entries':len(directory),'cafes':17,'roasters':3,'farms':9,'broad_leads':sum(r.get('state')=='Kerala' for r in leads),'notes':'33 unique places from the corrected Kerala editorial source; other research preserved separately as leads.'})
coverage['keralaDistricts']=[{'district':d['name'],'displayName':d['displayName'],'aliases':d['aliases'],'entries':d['count'],**d['counts'],'notes':d['coverageNote']} for d in districts]
write('coverage',coverage)
sources=[r for r in read('sources') if r.get('source_id')!='S24-KERALA']
sources.append({'source_id':'S24-KERALA','name':LABEL+' — corrected authoritative source','url':site,'expected':33,'collected':33,'status':'User-approved editorial authority for Kerala','checked_date':meta['editorialUpdate']['date'],'editorialUpdateDate':meta['editorialUpdate']['date'],
 'notes':f"Kerala editorial directory with {len(directory)} places across {len(districts)} district pages, {len(events)} archived events and {len(source['guides'])} journal guides. Five Kozhikode contacts and visiting notes were updated in the 18 November editorial export.",'commit':meta['commit']})
write('sources',sources)
manifest=read('manifest')
for key in ['directory','events','learn','communities','leads','sources']:manifest['counts'][key]=len(read(key))
all_dir=read('directory')
district_data=read('districts')
district_names={state: {district['name'] for district in rows} for state, rows in district_data['states'].items()}
def has_district(record):
 district=record.get('district') or district_data['evidence'].get(record['id'],{}).get('district')
 return district in district_names.get(record.get('state'),set())

manifest.update({'keralaCount':33,'keralaIds':[r['id'] for r in directory],'researchDirectoryCount':1034,'researchKeralaCount':76,
 'statesWithEntries':len({r['state'] for r in all_dir if r.get('state')}),'districtsUnresolved':sum(not has_district(r) for r in all_dir),
 'keralaAuthority':{'file':'kerala-authority.json','source':site,'commit':meta['commit'],'approvedPlaces':33,'preservedDirectoryLeads':39,'editorialUpdateDate':meta['editorialUpdate']['date']}})
schedule_date=manifest.get('eventScheduleCheckedDate',manifest['checkedDate'])
manifest['upcomingConfirmedEventsAtSnapshot']=sum(
 bool(r.get('calendarEligible') and r.get('status')!='completed' and (r.get('endDate') or r.get('date') or '')>=schedule_date)
 for r in read('events')
)
manifest['files'].update({'districts':'districts.json','kerala-authority':'kerala-authority.json','kerala-research-archive':'kerala-research-archive.json','kerala-reconciliation':'kerala-reconciliation.json'})
notice='Kerala follows the corrected Specialty Coffee Keralam directory: 33 unique editorial listings. Other Kerala research is preserved as leads, with former records retained in the source archive.'
manifest['notices']=[n for n in manifest['notices'] if not n.startswith('Kerala follows')]+[notice]
write('manifest',manifest)
print(json.dumps({'directory':len(all_dir),'kerala':len(directory),'matchedResearchRecords':sum(map(len,matched.values())),'directoryLeads':len(unmatched),'events':len(read('events')),'learn':len(read('learn')),'communities':len(read('communities')),'leads':len(leads)},indent=2))
