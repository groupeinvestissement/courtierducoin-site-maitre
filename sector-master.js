(() => {
  const body = document.body;
  const sectorKey = body.dataset.region || '';
  const entryPrefix = body.dataset.entryPrefix || sectorKey;
  const regionName = body.dataset.regionName || sectorKey;
  const marketingHost = body.dataset.marketingHost || location.host;
  const marketData = body.dataset.marketData || '';
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const t = {
    contactRequired: isEnglish ? 'Add at least a phone number or an email address.' : 'Ajoutez au moins un téléphone ou un courriel.',
    sending: isEnglish ? 'Sending…' : 'Envoi en cours…',
    success: isEnglish ? 'Thank you. Your request has been sent.' : 'Merci. Votre demande a bien été transmise.',
    error: isEnglish ? 'Your request could not be sent. Please try again, or call or text Pierre at 514 216-4013.' : 'Votre demande n’a pas pu être envoyée. Vous pouvez réessayer ou appeler ou texter Pierre au 514 216-4013.',
    unavailable: isEnglish ? 'Not published' : 'Non publié', days: isEnglish ? 'days' : 'jours', dataUnavailable: isEnglish ? 'Data temporarily unavailable' : 'Donnée temporairement indisponible'
  };
  const forms = [...document.querySelectorAll('form[action="/api/contact.php"]')];
  const params = new URLSearchParams(location.search);
  const campaignKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href || `${location.origin}${location.pathname}`;
  const now = () => new Date().toISOString(); const store = sessionStorage;
  const setOnce = (key,value) => { if (value && !store.getItem(key)) store.setItem(key,value); };
  const pageEntry = params.get('entry');
  setOnce('cdc_first_touch_url',location.href); setOnce('cdc_first_touch_timestamp',now());
  setOnce('cdc_entry_host',pageEntry?.startsWith(`${entryPrefix}-`) ? marketingHost : location.host);
  setOnce('cdc_entry_path',pageEntry?.startsWith(`${entryPrefix}-`) ? `/${pageEntry.slice(entryPrefix.length+1).replace('universal','')}` : location.pathname);
  campaignKeys.forEach((key) => setOnce(`cdc_first_${key}`,params.get(key)||''));
  campaignKeys.forEach((key) => { if (params.get(key)) store.setItem(`cdc_last_${key}`,params.get(key)); });
  window.cdcEventLog = window.cdcEventLog || [];
  const track = (event,form) => window.cdcEventLog.push({event,region:regionName,page:body.dataset.publicPage||'',campaign_code:body.dataset.campaignCode||'',form_id:form?.dataset.sourceKey||''});
  const hidden = (form,name,value) => { let input=form.elements[name]; if(!input){input=document.createElement('input');input.type='hidden';input.name=name;form.append(input);} input.value=value||''; };
  const enrich = (form) => { const sourceKey=form.dataset.sourceKey;if(!sourceKey)return false; hidden(form,'source_key',sourceKey);hidden(form,'form_id',sourceKey);hidden(form,'submission_id',crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`);hidden(form,'landing_url',location.href.split('#')[0]);hidden(form,'canonical_url',canonicalUrl);hidden(form,'entry_host',store.getItem('cdc_entry_host')||location.host);hidden(form,'entry_path',store.getItem('cdc_entry_path')||location.pathname);hidden(form,'first_touch_url',store.getItem('cdc_first_touch_url')||location.href);hidden(form,'first_touch_timestamp',store.getItem('cdc_first_touch_timestamp')||now());hidden(form,'last_touch_url',location.href);hidden(form,'last_touch_timestamp',now());hidden(form,'referrer',document.referrer);campaignKeys.forEach((key)=>{hidden(form,key,params.get(key)||store.getItem(`cdc_last_${key}`)||'');hidden(form,`first_${key}`,store.getItem(`cdc_first_${key}`)||'');});return true; };
  forms.forEach((form)=>{if(!enrich(form)){form.addEventListener('submit',(e)=>e.preventDefault());return;}let started=false;form.addEventListener('input',()=>{if(!started){started=true;track('form_start',form);}});form.querySelectorAll('[data-next]').forEach((button,index)=>button.addEventListener('click',()=>{const section=button.closest('section');if(![...section.querySelectorAll('[required]')].every((field)=>field.reportValidity()))return;section.hidden=true;const next=form.querySelector(`[data-step="${index+2}"]`);if(next)next.hidden=false;track('form_step_complete',form);}));form.addEventListener('submit',async(e)=>{e.preventDefault();const combined=form.elements.contact?.value?.trim();if(combined){const email=combined.includes('@');if(form.elements.courriel)form.elements.courriel.value=email?combined:'';if(form.elements.telephone)form.elements.telephone.value=email?'':combined;}enrich(form);const status=form.querySelector('.form-status');if(!form.elements.telephone?.value?.trim()&&!form.elements.courriel?.value?.trim()){status.textContent=t.contactRequired;status.className='form-status error';return;}const button=form.querySelector('button[type="submit"]');button.disabled=true;button.setAttribute('aria-busy','true');status.textContent=t.sending;try{const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||'Error');status.textContent=t.success;status.className='form-status success';track(form.classList.contains('rm-mini-form')?'guide_request_success':'form_submit_success',form);}catch{status.textContent=t.error;status.className='form-status error';button.disabled=false;button.removeAttribute('aria-busy');track('form_submit_error',form);}});});
  document.querySelectorAll('a[href^="tel:"]').forEach((link)=>link.addEventListener('click',()=>track('phone_click')));document.querySelectorAll('a[href^="sms:"]').forEach((link)=>link.addEventListener('click',()=>track('sms_click')));document.querySelectorAll('[data-video]').forEach((video)=>video.addEventListener('click',()=>track('video_start')));document.querySelector('.rm-menu')?.addEventListener('click',(event)=>{const nav=document.querySelector('.rm-header nav');const open=nav?.classList.toggle('is-open');event.currentTarget.setAttribute('aria-expanded',String(Boolean(open)));});
  const getPath=(object,path)=>path.split('.').reduce((value,key)=>value?.[key],object);const renderStat=(element,value)=>{if(value===null||value===undefined){element.textContent=t.unavailable;return;}const formatted=new Intl.NumberFormat(isEnglish?'en-CA':'fr-CA').format(value).replace(/\u00a0/g,' ');element.textContent=element.dataset.format==='currency'?(isEnglish?`$${formatted}`:`${formatted} $`):element.dataset.format==='days'?`${formatted} ${t.days}`:formatted;};
  if(marketData&&document.querySelector('[data-market-stat]'))fetch(marketData,{credentials:'same-origin'}).then((response)=>{if(!response.ok)throw new Error('market');return response.json();}).then((market)=>document.querySelectorAll('[data-market-stat]').forEach((element)=>renderStat(element,getPath(market,element.dataset.marketStat)))).catch(()=>document.querySelectorAll('[data-market-stat]').forEach((element)=>{element.textContent=t.dataUnavailable;}));
})();
