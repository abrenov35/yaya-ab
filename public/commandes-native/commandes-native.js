(()=>{
  'use strict';

  const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
  const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
  const STATUSES={choice:'Choix client à faire',todo:'À commander',ordered:'Commandé',received:'Reçu',problem:'Problème'};
  let orders=[];
  let documents=[];

  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function normalize(o){return {...o,id:String(o?.id||''),chantierId:String(o?.chantierId||o?.chantier_id||''),chantier:String(o?.chantier||''),produit:String(o?.produit||''),qte:String(o?.qte||''),fournisseur:String(o?.fournisseur||''),responsable:String(o?.responsable||''),status:STATUSES[o?.status]?o.status:'choice'};}

  function readCache(){
    for(const key of CACHE_KEYS){
      try{
        const raw=localStorage.getItem(key);if(!raw)continue;
        const data=JSON.parse(raw);
        if(Array.isArray(data?.orders)){
          orders=data.orders.map(normalize);documents=Array.isArray(data.documents)?data.documents:[];
          return true;
        }
      }catch(_){ }
    }
    return false;
  }

  function saveCache(){
    const payload={savedAt:Date.now(),orders,documents};
    try{localStorage.setItem('AB_COMMANDES_LOCAL_STATE_V1',JSON.stringify(payload));}catch(_){ }
    try{localStorage.setItem('AB_COMMANDES_EMBED_CACHE_V2',JSON.stringify({version:5,...payload}));}catch(_){ }
  }

  function jsonp(action){
    return new Promise((resolve,reject)=>{
      const cb='__yayaCmdNative_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const s=document.createElement('script');
      const timer=setTimeout(()=>{cleanup();reject(new Error('Délai dépassé'));},12000);
      function cleanup(){clearTimeout(timer);try{delete window[cb];}catch(_){window[cb]=undefined;}s.remove();}
      window[cb]=data=>{cleanup();resolve(data)};
      s.onerror=()=>{cleanup();reject(new Error('Connexion impossible'))};
      s.src=GAS+'?action='+encodeURIComponent(action)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
      document.head.appendChild(s);
    });
  }

  function fillStatuses(){
    $('#cmdStatus').innerHTML='<option value="">Tous les statuts</option>'+Object.entries(STATUSES).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('');
  }

  function filtered(){
    const q=$('#cmdSearch').value.trim().toLowerCase();
    const st=$('#cmdStatus').value;
    return orders.filter(o=>(!st||o.status===st)&&(!q||[o.chantier,o.produit,o.fournisseur,o.responsable].join(' ').toLowerCase().includes(q)));
  }

  function render(){
    const list=filtered();
    const box=$('#cmdList');
    box.innerHTML=list.length?list.map(o=>`<article class="cmd-row" data-id="${esc(o.id)}">
      <div><b>${esc(o.chantier||'—')}</b><span class="cmd-small">${esc(o.produit||'—')}</span></div>
      <div>${esc(o.fournisseur||'—')}</div>
      <div>${esc(o.qte||'—')}</div>
      <div>${esc(o.responsable||'—')}</div>
      <div><span class="cmd-pill">${esc(STATUSES[o.status]||o.status)}</span></div>
    </article>`).join(''):'<div class="cmd-empty">Aucune commande à afficher.</div>';
  }

  async function manualRefresh(){
    const btn=$('#cmdRefresh');btn.disabled=true;btn.textContent='Actualisation…';
    $('#cmdState').textContent='Lecture volontaire des commandes…';
    try{
      const [a,b]=await Promise.all([jsonp('list'),jsonp('documents')]);
      if(!a?.ok)throw new Error(a?.error||'Lecture commandes impossible');
      if(!b?.ok)throw new Error(b?.error||'Lecture documents impossible');
      orders=(a.commandes||[]).map(normalize);documents=Array.isArray(b.documents)?b.documents:[];
      saveCache();render();
      $('#cmdState').textContent='Actualisé à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+' — aucune synchronisation automatique.';
    }catch(err){
      $('#cmdState').textContent='Actualisation impossible — affichage conservé.';
      console.error('Yaya Commandes native',err);
    }finally{
      btn.disabled=false;btn.textContent='Actualiser';
    }
  }

  fillStatuses();
  const cached=readCache();
  render();
  $('#cmdState').textContent=cached?'Affichage immédiat depuis le cache — Actualiser uniquement sur demande.':'Aucun cache local — cliquer Actualiser.';
  $('#cmdRefresh').addEventListener('click',manualRefresh);
  $('#cmdSearch').addEventListener('input',render);
  $('#cmdStatus').addEventListener('change',render);

  window.__YAYA_COMMANDES_NATIVE_VERSION='0.1-readonly-manual-sync';
})();
