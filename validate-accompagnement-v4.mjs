import fs from 'node:fs';
const h=fs.readFileSync('vaudreuil-soulanges/02a22/index.html','utf8');
const errors=[];try{JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1])}catch{errors.push('structured data')}
for(const token of ['index,follow','https://www.courtierducoin.ca/vaudreuil-soulanges/02a22/','<span>Accompagnement</span>','hero-vaudreuil-soulanges-succession.webp','name="succession_role"','name="succession_stage"','name="people_to_update"','name="remote_coordination_needed"','name="lead_context" value="succession"','name="campaign_type" value="accompagnement"','name="page_type" value="specialized"','name="consent_request"','name="consent_marketing"','Québec.ca — liquidation d’une succession','OACIQ — formulaires obligatoires'])if(!h.includes(token))errors.push(token);
if((h.match(/<h1>/g)||[]).length!==1)errors.push('H1');if(/Rosemont|noindex|Expert succession|Spécialiste succession/.test(h))errors.push('residual/forbidden');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log('Accompagnement Vaudreuil V4 QA passed.');
