import fs from 'node:fs';
const h=fs.readFileSync('vaudreuil-soulanges/o1a11/index.html','utf8');
const errors=[];
const json=h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
try{JSON.parse(json)}catch{errors.push('structured data')}
if((h.match(/<h1>/g)||[]).length!==1)errors.push('H1');
for(const token of ['index,follow','https://www.courtierducoin.ca/vaudreuil-soulanges/o1a11/','>Options</span>','hero-vaudreuil-soulanges-options.webp','name="municipality"','name="page_type"','name="campaign_type"','name="campaign_code"','name="notice_type"','name="document_date"','name="registration_date_known"','name="property_type"','name="situation_stage"','name="consent_request"','name="consent_marketing"','Ressources officielles à consulter','514 216-4013'])if(!h.includes(token))errors.push(token);
if(/Rosemont|Ville de Montréal|noindex/.test(h))errors.push('residual/blocked content');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log('Options Vaudreuil V4 QA passed.');
