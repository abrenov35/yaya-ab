(()=>{
  'use strict';

  const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
  const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
  const PENDING_KEY='YAYA_COMMANDES_NATIVE_PENDING_V1';
  const STATUSES={choice:'Choix client à faire',todo:'À commander',ordered:'Commandé',received:'Reçu',problem:'Problème'};

  let orders=[];
  let documents=[];
  let yayaChantiers=[];
  let editId='';
  let pending=readPending();

  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  const uid=()=>globalThis.crypto?.randomUUID?.()||(Date.now()+'-'+Math.random().toString(36).slice(2));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function normalize(o){
    return {...o,
      id:String(o?.id||''),
      chantierId:String(o?.chantierId||o?.chantier_id||''),
      chantier:String(o?.chantier||''),
      produit:String(o?.produit||''),
      qte:String(o?.qte||''),
      fournisseur:String(o?.fournisseur||''),
      responsable:String(o?.responsable||''),
      notes:String(o?.notes||''),
      status:STATUSES[o?.status]?o.status:'choice'
    };
  }

  function readCache(){
    for(const key of CACHE_KEYS){
      try{
        const raw=localStorage.getItem(key);if(!raw)continue;
        const data=JSON.parse(raw);
        if(Array.isArray(data?.orders)){
          orders=data.orders.map(normalize);
          documents=Array.isArray(data.documents)?data.documents:[];
          return true;
        }
      }catch(_){ }
    }
    return false;
  }

  function saveCache(){
    const payload={savedAt:Date.now(),orders,documents};
    try{localStorage.setItem('AB_COMMANDES_LOCAL_STATE_V1',JSON.stringify(payload));}catch(_){ }
    try{localStorage.setItem('AB_COMMANDES_EMBED_CACHE_V2',JSON.stringify({version:6,...payload}));}catch(_){ }
  }

  function readYayaChantiers(){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const data=raw?JSON.parse(raw):null;
      yayaChantiers=Array.isArray(data?.chantiers)?data.chantiers:[];
    }catch(_){yayaChantiers=[];}
  }

  function activeChantiers(){
    return yayaChantiers.filter(c=>{
      const st=String(c?.statut||'');
      const n=norm(c?.nom);
      return st!=='Terminé'&&st!=='Archivé'&&n!=='AB RENOV35'&&n!=='AB RENOV 35';
    }).sort((a,b)=>String(a?.nom||'').localeCompare(String(b?.nom||''),'fr',{sensitivity:'base'}));
  }

  function readPending(){
    try{
      const p=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');
      return Array.isArray(p)?p:[];
    }catch(_){return [];}
  }

  function savePending(){try{localStorage.setItem(PENDING_KEY,JSON.stringify(pending));}catch(_){ }}

  function queueUpsert(order){
    pending=pending.filter(x=>String(x?.id||'')!==String(order.id));
    pending.push(normalize(order));
    savePending();
  }

  function dequeue(id){
    pending=pending.filter(x=>String(x?.id||'')!==String(id));
    savePending();
  }

  function post(data){
    const body=new URLSearchParams();
    Object.entries(data).forEach(([k,v])=>body.append(k,v==null?'':String(v)));
    return fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body});
  }

  function sendBackground(order){
    queueUpsert(order);
    Promise.resolve()
      .then(()=>post({action:'upsert',...order}))
      .then(()=>{dequeue(order.id);toast('Enregistré en arrière-plan','ok');})
      .catch(err=>{console.warn('Yaya Commandes native · envoi différé',err);toast('Envoi en attente — utiliser Actualiser','err');});
  }

  async function flushPending(){
    if(!pending.length)return;
    const batch=[...pending];
    for(const order of batch){
      try{await post({action:'upsert',...order});dequeue(order.id);}catch(err){console.warn('Yaya Commandes native · file en attente',err);}
    }
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

  function toast(text,kind=''){
    const el=$('#cmdToast');
    el.textContent=text||'';
    el.className='cmd-toast show'+(kind?' '+kind:'');
    clearTimeout(el.__timer);
    el.__timer=setTimeout(()=>{el.className='cmd-toast';},3500);
  }

  function fillStatuses(){
    $('#cmdStatus').innerHTML='<option value="">Tous les statuts</option>'+Object.entries(STATUSES).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('');
    $('#cmdFStatus').innerHTML=Object.entries(STATUSES).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('');
  }

  function fillChantiers(selectedId='',legacyName=''){
    const sel=$('#cmdFChantier');
    const list=activeChantiers();
    sel.innerHTML='<option value="">— Choisir un chantier —</option>'+list.map(c=>`<option value="${esc(c.id)}">${esc(c.nom||'')}</option>`).join('');
    if(selectedId&&list.some(c=>String(c.id)===String(selectedId)))sel.value=String(selectedId);
    else if(legacyName){
      const hit=list.find(c=>norm(c.nom)===norm(legacyName));
      if(hit)sel.value=String(hit.id);
    }
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
      <div><select class="cmd-status-select" data-status-id="${esc(o.id)}">${Object.entries(STATUSES).map(([k,v])=>`<option value="${k}" ${o.status===k?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
      <div><button class="cmd-edit" type="button" data-edit-id="${esc(o.id)}">Modifier</button></div>
    </article>`).join(''):'<div class="cmd-empty">Aucune commande à afficher.</div>';

    box.querySelectorAll('[data-edit-id]').forEach(btn=>btn.addEventListener('click',()=>openModal(btn.dataset.editId)));
    box.querySelectorAll('[data-status-id]').forEach(sel=>sel.addEventListener('change',()=>changeStatus(sel)));
  }

  function openModal(id=''){
    editId=String(id||'');
    const o=editId?orders.find(x=>String(x.id)===editId):null;
    readYayaChantiers();
    fillChantiers(o?.chantierId||'',o?.chantier||'');
    $('#cmdModalTitle').textContent=o?'Modifier la commande':'Ajouter une commande';
    $('#cmdFProduit').value=o?.produit||'';
    $('#cmdFQte').value=o?.qte||'';
    $('#cmdFFournisseur').value=o?.fournisseur||'';
    $('#cmdFResponsable').value=o?.responsable||'';
    $('#cmdFStatus').value=o?.status||'choice';
    $('#cmdFNotes').value=o?.notes||'';
    $('#cmdModal').classList.add('show');
    $('#cmdModal').setAttribute('aria-hidden','false');
    setTimeout(()=>$('#cmdFProduit').focus(),20);
  }

  function closeModal(){
    $('#cmdModal').classList.remove('show');
    $('#cmdModal').setAttribute('aria-hidden','true');
    editId='';
  }

  function formOrder(){
    const old=editId?orders.find(x=>String(x.id)===editId):null;
    const chantierId=String($('#cmdFChantier').value||'');
    const chantierObj=yayaChantiers.find(c=>String(c.id)===chantierId);
    return normalize({
      ...(old||{}),
      id:editId||uid(),
      chantierId,
      chantier:String(chantierObj?.nom||old?.chantier||''),
      produit:$('#cmdFProduit').value.trim(),
      qte:$('#cmdFQte').value.trim(),
      fournisseur:$('#cmdFFournisseur').value.trim(),
      responsable:$('#cmdFResponsable').value,
      status:$('#cmdFStatus').value,
      notes:$('#cmdFNotes').value.trim()
    });
  }

  function saveLocal(order){
    const i=orders.findIndex(o=>String(o.id)===String(order.id));
    if(i>=0)orders[i]=order;else orders.push(order);
    saveCache();
    render();
  }

  function submitForm(e){
    e.preventDefault();
    const order=formOrder();
    if(!order.chantierId||!order.chantier||!order.produit){alert('Choisis un chantier et indique le produit.');return;}
    if((order.status==='ordered'||order.status==='received')&&!order.fournisseur){alert('Le fournisseur est nécessaire pour une commande commandée ou reçue.');return;}
    saveLocal(order);
    closeModal();
    toast('Commande enregistrée localement — envoi en arrière-plan','ok');
    sendBackground(order);
  }

  function changeStatus(sel){
    const order=orders.find(o=>String(o.id)===String(sel.dataset.statusId));
    if(!order)return;
    const next=sel.value;
    if((next==='ordered'||next==='received')&&!String(order.fournisseur||'').trim()){
      alert('Renseigne d’abord le fournisseur.');
      sel.value=order.status;
      return;
    }
    const updated=normalize({...order,status:next});
    saveLocal(updated);
    toast('Statut enregistré — envoi en arrière-plan','ok');
    sendBackground(updated);
  }

  async function manualRefresh(){
    const btn=$('#cmdRefresh');
    if($('#cmdModal').classList.contains('show')){toast('Ferme la commande avant d’actualiser','err');return;}
    btn.disabled=true;btn.textContent='Actualisation…';
    $('#cmdState').textContent='Actualisation volontaire…';
    try{
      await flushPending();
      if(pending.length)throw new Error('Des modifications restent en attente');
      await wait(350);
      const [a,b]=await Promise.all([jsonp('list'),jsonp('documents')]);
      if(!a?.ok)throw new Error(a?.error||'Lecture commandes impossible');
      if(!b?.ok)throw new Error(b?.error||'Lecture documents impossible');
      orders=(a.commandes||[]).map(normalize);
      documents=Array.isArray(b.documents)?b.documents:[];
      saveCache();
      render();
      $('#cmdState').textContent='Actualisé à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+' — synchronisation uniquement sur demande.';
      toast('Commandes actualisées','ok');
    }catch(err){
      $('#cmdState').textContent='Actualisation impossible — affichage conservé.';
      toast(err?.message||'Actualisation impossible','err');
      console.error('Yaya Commandes native',err);
    }finally{
      btn.disabled=false;btn.textContent='Actualiser';
    }
  }

  fillStatuses();
  readYayaChantiers();
  const cached=readCache();
  render();
  $('#cmdState').textContent=cached
    ?(pending.length?'Affichage immédiat — modifications en attente. Actualiser pour contrôler.':'Affichage immédiat depuis le cache — Actualiser uniquement sur demande.')
    :'Aucun cache local — cliquer Actualiser.';

  $('#cmdAdd').addEventListener('click',()=>openModal(''));
  $('#cmdRefresh').addEventListener('click',manualRefresh);
  $('#cmdSearch').addEventListener('input',render);
  $('#cmdStatus').addEventListener('change',render);
  $('#cmdForm').addEventListener('submit',submitForm);
  $('#cmdCancel').addEventListener('click',closeModal);
  $('#cmdModalClose').addEventListener('click',closeModal);
  $('#cmdModal').addEventListener('click',e=>{if(e.target===$('#cmdModal'))closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#cmdModal').classList.contains('show'))closeModal();});

  window.__YAYA_COMMANDES_NATIVE_VERSION='0.2-edit-local-first-manual-sync';
})();
