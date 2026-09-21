(function(){
  'use strict';
  if(window.__yayaChantierDropboxAbdbV2)return;
  window.__yayaChantierDropboxAbdbV2=true;

  const WRAP_ID='yayaChantierDropboxSearch';
  const API_URL='https://script.google.com/macros/s/AKfycbx3WxWC-GuwmYUaB99Wi3LQ3-DAUZtG6CJcTLp2entOd8PN5vz-251Lh20TEE_uA40O/exec';
  const CACHE_PREFIX='YAYA_ABDB_SEARCH_V1_';
  let pending=false,observed=false,timer=0,requestNumber=0;

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function readCache(query){try{const data=JSON.parse(localStorage.getItem(CACHE_PREFIX+query.toUpperCase())||'null');return data&&Array.isArray(data.items)?data.items:null;}catch(e){return null;}}
  function writeCache(query,items){try{localStorage.setItem(CACHE_PREFIX+query.toUpperCase(),JSON.stringify({items:items,savedAt:Date.now()}));}catch(e){}}
  function jsonp(query){
    return new Promise(function(resolve,reject){
      const callback='yaya_abdb_'+Date.now()+'_'+Math.floor(Math.random()*100000),script=document.createElement('script');
      const timeout=setTimeout(function(){cleanup();reject(new Error('Délai dépassé'));},30000);
      function cleanup(){clearTimeout(timeout);delete window[callback];script.remove();}
      window[callback]=function(data){cleanup();resolve(data);};
      script.onerror=function(){cleanup();reject(new Error('Recherche indisponible'));};
      const url=new URL(API_URL);url.searchParams.set('action','search');url.searchParams.set('q',query);url.searchParams.set('callback',callback);
      script.src=url.toString();document.body.appendChild(script);
    });
  }
  function showResults(wrap,items,message){
    const box=wrap.querySelector('.yaya-abdb-results');if(!box)return;
    if(message){box.innerHTML='<div class="yaya-abdb-message">'+esc(message)+'</div>';box.hidden=false;return;}
    if(!items.length){box.innerHTML='<div class="yaya-abdb-message">Aucun dossier trouvé</div>';box.hidden=false;return;}
    box.innerHTML=items.map(function(item){
      return '<a class="yaya-abdb-result" href="'+esc(item.dropbox_url||'#')+'" target="_blank" rel="noopener"><span>📁</span><span><strong>'+esc(item.name||'Dossier')+'</strong><small>'+esc(item.path_display||item.path_lower||'')+'</small></span></a>';
    }).join('');box.hidden=false;
  }
  async function search(wrap){
    const input=wrap.querySelector('input'),query=String(input&&input.value||'').trim(),box=wrap.querySelector('.yaya-abdb-results');
    if(query.length<2){if(box){box.hidden=true;box.innerHTML='';}return;}
    const ownRequest=++requestNumber,cached=readCache(query);
    if(cached)showResults(wrap,cached,'');
    else showResults(wrap,[],'Recherche Dropbox en cours… Patientez quelques secondes.');
    try{
      const data=await jsonp(query);if(ownRequest!==requestNumber)return;if(!data||!data.ok)throw new Error('Recherche indisponible');
      const items=Array.isArray(data.items)?data.items:[];writeCache(query,items);showResults(wrap,items,'');
    }catch(e){if(ownRequest===requestNumber&&!cached)showResults(wrap,[],'Recherche Dropbox indisponible. Réessayez dans quelques secondes.');}
  }
  function createSearch(){
    const wrap=document.createElement('div');wrap.id=WRAP_ID;
    wrap.innerHTML='<input type="search" autocomplete="off" placeholder="Rechercher un dossier sur Dropbox" aria-label="Rechercher un dossier sur Dropbox"><div class="yaya-abdb-results" hidden></div>';
    const input=wrap.querySelector('input');
    input.addEventListener('click',function(event){event.stopPropagation();});
    input.addEventListener('keydown',function(event){event.stopPropagation();if(event.key==='Enter'){event.preventDefault();clearTimeout(timer);search(wrap);}if(event.key==='Escape'){wrap.querySelector('.yaya-abdb-results').hidden=true;input.blur();}});
    input.addEventListener('input',function(){clearTimeout(timer);timer=setTimeout(function(){search(wrap);},350);});
    wrap.addEventListener('click',function(event){event.stopPropagation();});return wrap;
  }
  function ensureStyle(){
    if(document.getElementById('yaya-chantier-dropbox-abdb-style'))return;
    const style=document.createElement('style');style.id='yaya-chantier-dropbox-abdb-style';
    style.textContent=`
      #${WRAP_ID}{position:relative!important;margin-left:auto!important;width:min(300px,30vw)!important;min-width:220px!important;z-index:80!important}
      #${WRAP_ID} input{width:100%!important;height:34px!important;box-sizing:border-box!important;padding:0 12px!important;border:1px solid #b9c9dc!important;border-radius:8px!important;background:#fff!important;color:#193451!important;font-size:11.5px!important;outline:none!important}
      #${WRAP_ID} input:focus{border-color:#4d83bd!important;box-shadow:0 0 0 3px rgba(77,131,189,.14)!important}
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top{overflow:visible!important}
      #${WRAP_ID} .yaya-abdb-results{position:absolute!important;top:39px!important;left:0!important;right:0!important;display:block!important;max-height:310px!important;overflow:auto!important;padding:5px!important;border:1px solid #c3d0df!important;border-radius:9px!important;background:#fff!important;box-shadow:0 12px 28px rgba(19,45,73,.2)!important;z-index:99999!important}
      #${WRAP_ID} .yaya-abdb-results[hidden]{display:none!important}
      #${WRAP_ID} .yaya-abdb-result{display:grid!important;grid-template-columns:22px minmax(0,1fr)!important;gap:7px!important;align-items:center!important;padding:8px!important;border-radius:7px!important;color:#183d63!important;text-decoration:none!important}
      #${WRAP_ID} .yaya-abdb-result:hover{background:#edf5fd!important}#${WRAP_ID} .yaya-abdb-result strong,#${WRAP_ID} .yaya-abdb-result small{display:block!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      #${WRAP_ID} .yaya-abdb-result strong{font-size:11.5px!important}#${WRAP_ID} .yaya-abdb-result small{margin-top:2px!important;color:#75859a!important;font-size:9.5px!important}#${WRAP_ID} .yaya-abdb-message{padding:10px!important;color:#66778b!important;font-size:11px!important;text-align:center!important}
      @media(max-width:760px){#${WRAP_ID}{order:20!important;width:100%!important;min-width:100%!important;margin:7px 0 0!important}#${WRAP_ID} input{height:36px!important}#${WRAP_ID} .yaya-abdb-results{top:41px!important}}
    `;document.head.appendChild(style);
  }
  function sync(){
    pending=false;const card=document.querySelector('#pane-chantiers .card:has(> .yaya-detail-section-tabs)');let wrap=document.getElementById(WRAP_ID);
    if(!card){if(wrap)wrap.remove();return;}const top=card.querySelector(':scope > .top');if(!top)return;if(!wrap)wrap=createSearch();
    const manage=top.querySelector('#yayaManageChantierCardBtn');if(manage){if(wrap.parentNode!==top||wrap.nextElementSibling!==manage)top.insertBefore(wrap,manage);}else if(wrap.parentNode!==top)top.appendChild(wrap);
  }
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(sync);}
  function observePane(){if(observed)return;const pane=document.getElementById('pane-chantiers');if(!pane){setTimeout(observePane,120);return;}observed=true;new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});schedule();}
  document.addEventListener('click',function(event){const wrap=document.getElementById(WRAP_ID);if(!wrap||wrap.contains(event.target))return;const box=wrap.querySelector('.yaya-abdb-results');if(box)box.hidden=true;});
  ensureStyle();observePane();window.addEventListener('yaya:data-refreshed',schedule);[250,800,1600].forEach(function(ms){setTimeout(schedule,ms);});
})();
