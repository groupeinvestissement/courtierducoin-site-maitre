const analytics=(event,detail={})=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...detail});};
const qs=new URLSearchParams(location.search);
document.querySelectorAll('.conversion-form').forEach(form=>{
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(key=>{const el=form.elements[key];if(el)el.value=qs.get(key)||sessionStorage.getItem(key)||'';if(qs.get(key))sessionStorage.setItem(key,qs.get(key));});
  form.elements.page_canonique&&(form.elements.page_canonique.value=document.querySelector('link[rel=canonical]')?.href||location.href);
  form.elements.url_entree&&(form.elements.url_entree.value=document.referrer||location.href);
  let started=false;form.addEventListener('input',()=>{if(started)return;started=true;analytics(form.dataset.trackForm==='guide'?'guide_form_start':'form_start',{region:form.elements.region?.value,campaign:form.elements.campaign?.value});},{once:true});
  form.addEventListener('submit',async e=>{e.preventDefault();const status=form.querySelector('.form-status');status.textContent='Envoi en cours…';try{const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!response.ok)throw new Error();status.textContent='Merci. Pierre communiquera avec vous sous peu.';status.className='form-status success';analytics(form.dataset.trackForm==='guide'?'guide_submit':'lead_submit',{region:form.elements.region?.value,campaign:form.elements.campaign?.value});form.reset();}catch{status.textContent='L’envoi n’a pas fonctionné. Appelez Pierre au 514 216-4013.';status.className='form-status error';}});
});
document.querySelectorAll('[data-guide-view]').forEach(el=>analytics('guide_view',{sector:el.querySelector('[name=region]')?.value,campaign:el.querySelector('[name=campaign]')?.value}));
document.querySelectorAll('[data-campaign-video]').forEach(video=>video.querySelector('button')?.addEventListener('click',()=>{analytics('video_start',{video_sector:video.dataset.sector,video_type:video.dataset.campaign});video.querySelector('small').textContent='La vidéo sera ajoutée ici sans modifier la page.';}));
