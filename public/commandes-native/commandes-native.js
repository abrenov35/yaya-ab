(()=>{
  'use strict';

  const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
  const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
  const PENDING_KEY='YAYA_COMMANDES_NATIVE_PENDING_V1';
  const NOTE_KEY='YAYA_COMMANDES_NATIVE_CHANTIER_NOTES_V1';
  const GROUP_STATE='YAYA_COMMANDES_NATIVE_GROUPS_V1';
  const ROW_STATE='YAYA_COMMANDES_NATIVE_ROWS_V1';
  const STATUSES={choice:'Choix client à faire',todo:'À commander',ordered:'Commandé',received:'Reçu',problem:'Problème'};
  const STATUS_SECTIONS=[
    {key:'choice',kpi:'Choix client',label:'Attente choix client',tone:'purple'},
    {key:'todo',kpi:'À commander',label:'À commander',tone:'orange'},
    {key:'ordered',kpi:'Commandé',label:'Commandé',tone:'blue'},
    {key:'received',kpi:'Reçu',label:'Reçu',tone:'green'}
  ];

  let orders=[];
  let documents=[];
  let yayaChantiers=[];
  let yayaData={};
  let editId='';
  let pending=readPending();
  let currentChantierId='';
  let currentChantierName='';
  let cachedAtBoot=false;

  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const uid=()=>globalThis.crypto?.randomUUID?.()||(Date.now()+'-'+Math.random().toString(36).slice(2));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function normalize(o){
    return {...o,
      id:String(o?.id||''),
      chantierId:String(o?.chantierId||o?.chantier_id||''),
      chantier:String(o?.chantier||''),
      produit:String(o?.produit||o?.designation||''),
      qte:String(o?.qte||''),
      fournisseur:String(o?.fournisseur||''),
      responsable:String(o?.responsable||''),
      notes:String(o?.notes||''),
      status:STATUSES[o?.status]?o.status:'choice'
    };
  }

  function readLatestDocuments(){
    for(const key of CACHE_KEYS){
      try{
        const raw=localStorage.getItem(key);if(!raw)continue;
        const data=JSON.parse(raw);
        if(Array.isArray(data?.documents))return data.documents;
      }catch(_){ }
    }
    return null;
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
    const latest=readLatestDocuments();
    if(Array.isArray(latest))documents=latest;
    const payload={savedAt:Date.now(),orders,documents};
    try{localStorage.setItem('AB_COMMANDES_LOCAL_STATE_V1',JSON.stringify(payload));}catch(_){ }
    try{localStorage.setItem('AB_COMMANDES_EMBED_CACHE_V2',JSON.stringify({version:7,...payload}));}catch(_){ }
  }

  function readYayaContext(){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const data=raw?JSON.parse(raw):null;
      yayaData=data&&typeof data==='object'?data:{};
      yayaChantiers=Array.isArray(yayaData.chantiers)?yayaData.chantiers:[];
    }catch(_){yayaData={};yayaChantiers=[];}
  }

  function activeChantiers(){
    return yayaChantiers.filter(c=>{
      const st=String(c?.statut||'');
      const n=norm(c?.nom);
      return st!=='Terminé'&&st!=='Archivé'&&n!=='AB RENOV35'&&n!=='AB RENOV 35';
    }).sort((a,b)=>String(a?.nom||'').localeCompare(String(b?.nom||''),'fr',{sensitivity:'base'}));
  }

  function readPending(){
    try{const p=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');return Array.isArray(p)?p:[];}catch(_){return [];}
  }
  function savePending(){try{localStorage.setItem(PENDING_KEY,JSON.stringify(pending));}catch(_){ }}
  function queueUpsert(order){pending=pending.filter(x=>String(x?.id||'')!==String(order.id));pending.push(normalize(order));savePending();}
  function dequeue(id){pending=pending.filter(x=>String(x?.id||'')!==String(id));savePending();}

  function post(data){
    const body=new URLSearchParams();
    Object.entries(data).forEach(([k,v])=>body.append(k,v==null?'':String(v)));
    return fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body});
  }

  function sendBackground(order){
    queueUpsert(order);
    Promise.resolve().then(()=>post({action:'upsert',...order})).then(()=>{
      dequeue(order.id);
      toast('Enregistré en arrière-plan','ok');
    }).catch(err=>{
      console.warn('Yaya Commandes native · envoi différé',err);
      toast('Envoi en attente — utiliser Actualiser','err');
    });
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
      s.onerror=()=>{cleanup();reject(new Error('Connexion impossible'));};
      s.src=GAS+'?action='+encodeURIComponent(action)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
      document.head.appendChild(s);
    });
  }

  function toast(text,kind=''){
    const el=$('#cmdToast');if(!el)return;
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
    else if(legacyName){const hit=list.find(c=>norm(c.nom)===norm(legacyName));if(hit)sel.value=String(hit.id);}
  }

  function parseRoute(){
    const p=new URL(location.href).searchParams;
    currentChantierId=String(p.get('chantierId')||'').trim();
    currentChantierName=String(p.get('chantierName')||'').trim();
    if(currentChantierId&&!currentChantierName){
      const c=yayaChantiers.find(x=>String(x.id||'')===currentChantierId);
      if(c?.nom)currentChantierName=String(c.nom);
      else{const o=orders.find(x=>String(x.chantierId||'')===currentChantierId);if(o?.chantier)currentChantierName=o.chantier;}
    }
    if(!currentChantierId&&currentChantierName){
      const c=yayaChantiers.find(x=>norm(x.nom)===norm(currentChantierName));
      if(c?.id)currentChantierId=String(c.id);
    }
  }

  function routeKey(){return currentChantierId||norm(currentChantierName)||'GENERAL';}

  function openChantier(id,name){
    const url=new URL(location.href);
    if(id)url.searchParams.set('chantierId',String(id));else url.searchParams.delete('chantierId');
    if(name)url.searchParams.set('chantierName',String(name));else url.searchParams.delete('chantierName');
    history.pushState({},'',url);
    parseRoute();
    render();
    window.scrollTo({top:0,behavior:'instant'});
  }

  function backOverview(){
    const url=new URL(location.href);
    url.searchParams.delete('chantierId');
    url.searchParams.delete('chantierName');
    history.pushState({},'',url);
    parseRoute();
    render();
    window.scrollTo({top:0,behavior:'instant'});
  }

  function matchesChantier(o,id=currentChantierId,name=currentChantierName){
    if(!o)return false;
    if(id&&String(o.chantierId||'')===String(id))return true;
    return !!(name&&norm(o.chantier)===norm(name));
  }

  function chantierOrders(){return orders.filter(o=>matchesChantier(o));}

  function overviewFiltered(){
    const q=$('#cmdSearch').value.trim().toLowerCase();
    const st=$('#cmdStatus').value;
    return orders.filter(o=>(!st||o.status===st)&&(!q||[o.chantier,o.produit,o.fournisseur,o.responsable].join(' ').toLowerCase().includes(q)));
  }

  function docCount(orderId){
    const latest=readLatestDocuments();
    const docs=Array.isArray(latest)?latest:documents;
    return docs.filter(d=>String(d?.commande_id||'')===String(orderId||'')).length;
  }

  function statusOptions(selected){
    return Object.entries(STATUSES).map(([k,v])=>`<option value="${k}" ${selected===k?'selected':''}>${esc(v)}</option>`).join('');
  }

  function renderOverview(){
    $('#cmdBack').hidden=true;
    $('#cmdTitle').textContent='Commandes';
    $('#cmdSubtitle').textContent='Version native Yaya — test isolé';
    $('#cmdFilters').hidden=false;
    const box=$('#cmdList');
    box.className='cmd-list';
    const list=overviewFiltered();
    box.innerHTML=list.length?list.map(o=>`<article class="cmd-row" data-id="${esc(o.id)}">
      <div><button type="button" class="cmd-open-chantier" data-open-chantier-id="${esc(o.chantierId)}" data-open-chantier-name="${esc(o.chantier)}">${esc(o.chantier||'—')}</button><span class="cmd-small">${esc(o.produit||'—')}</span></div>
      <div>${esc(o.fournisseur||'—')}</div>
      <div>${esc(o.qte||'—')}</div>
      <div>${esc(o.responsable||'—')}</div>
      <div><select class="cmd-status-select" data-status-id="${esc(o.id)}">${statusOptions(o.status)}</select></div>
      <div class="cmd-overview-actions"><button class="cmd-edit" type="button" data-edit-id="${esc(o.id)}">Modifier</button></div>
    </article>`).join(''):'<div class="cmd-empty">Aucune commande à afficher.</div>';

    box.querySelectorAll('[data-open-chantier-name]').forEach(btn=>btn.addEventListener('click',()=>openChantier(btn.dataset.openChantierId,btn.dataset.openChantierName)));
    bindCommandControls(box);
  }

  function getStoredMap(base){
    try{const all=JSON.parse(sessionStorage.getItem(base)||'{}');return all&&typeof all==='object'?all:{};}catch(_){return {};}
  }
  function setStoredValue(base,key,value){const all=getStoredMap(base);all[routeKey()+':'+key]=!!value;try{sessionStorage.setItem(base,JSON.stringify(all));}catch(_){ }}
  function getStoredValue(base,key){return !!getStoredMap(base)[routeKey()+':'+key];}

  function readNotes(){try{const x=JSON.parse(localStorage.getItem(NOTE_KEY)||'{}');return x&&typeof x==='object'?x:{};}catch(_){return {};}}
  function currentNote(){return String(readNotes()[routeKey()]||'');}
  function saveCurrentNote(value){const all=readNotes();all[routeKey()]=String(value||'');try{localStorage.setItem(NOTE_KEY,JSON.stringify(all));}catch(_){ }}

  function recordMatchesCurrent(r){
    if(!r)return false;
    const id=String(r.chantierId||r.chantier_id||r.idChantier||'');
    const name=String(r.chantier||r.chantierNom||r.nomChantier||'');
    if(currentChantierId&&id===currentChantierId)return true;
    return !!(currentChantierName&&name&&norm(name)===norm(currentChantierName));
  }

  function countYaya(key){
    const arr=Array.isArray(yayaData?.[key])?yayaData[key]:[];
    return arr.filter(recordMatchesCurrent).length;
  }

  function renderTabs(commandCount){
    const marche=countYaya('avenants');
    const achats=countYaya('achats');
    const charges=countYaya('charges');
    return `<nav class="cmd-ch-tabs" aria-label="Sections chantier">
      <button type="button" class="cmd-ch-tab marche" data-passive-tab="Marché">Marché <span class="count">${marche}</span></button>
      <button type="button" class="cmd-ch-tab commande" aria-current="page">Commande <span class="count">${commandCount}</span></button>
      <button type="button" class="cmd-ch-tab achats" data-passive-tab="Achats">Achats <span class="count">${achats}</span></button>
      <button type="button" class="cmd-ch-tab charges" data-passive-tab="Charges">Charges <span class="count">${charges}</span></button>
      <button type="button" class="cmd-ch-tab docs" data-passive-tab="Documents & mails">Documents & mails</button>
    </nav>`;
  }

  function renderKpis(list){
    return `<div class="cmd-ch-kpis">${STATUS_SECTIONS.map(s=>{
      const n=list.filter(o=>o.status===s.key).length;
      return `<div class="cmd-ch-kpi ${s.tone}"><span class="cmd-ch-kpi-num">${n}</span><strong>${esc(s.kpi)}</strong></div>`;
    }).join('')}</div>`;
  }

  function renderChantierRow(o){
    const open=getStoredValue(ROW_STATE,o.id);
    return `<article class="cmd-row cmd-ch-row${open?' open':''}" data-id="${esc(o.id)}">
      <button type="button" class="cmd-ch-summary" data-toggle-row="${esc(o.id)}" aria-expanded="${open?'true':'false'}">
        <strong>${esc(o.produit||'—')}</strong>
        <span>${esc(o.fournisseur||'—')}</span>
        <span class="cmd-summary-qte">${esc(o.qte||'—')}</span>
        <span class="cmd-summary-resp">${esc(o.responsable||'—')}</span>
      </button>
      <div class="cmd-ch-details">
        <div class="cmd-ch-detail-grid">
          <div class="cmd-ch-detail-box"><small>Fournisseur</small><strong>${esc(o.fournisseur||'—')}</strong></div>
          <div class="cmd-ch-detail-box"><small>Quantité</small><strong>${esc(o.qte||'—')}</strong></div>
          <div class="cmd-ch-detail-box"><small>Responsable</small><strong>${esc(o.responsable||'—')}</strong></div>
          <div class="cmd-ch-detail-box cmd-ch-detail-status"><small>Statut</small><select data-status-id="${esc(o.id)}">${statusOptions(o.status)}</select></div>
          <div class="cmd-ch-detail-box"><small>Pièces jointes</small><strong>${docCount(o.id)}</strong></div>
          <div class="cmd-ch-detail-box cmd-ch-detail-note"><small>Note commande</small><span class="note-text">${esc(o.notes||'—')}</span></div>
        </div>
      </div>
      <div class="cmd-ch-actions"><span class="cmd-row-toggle-indicator">${open?'▴':'▾'}</span><button class="cmd-edit" type="button" data-edit-id="${esc(o.id)}">Modifier</button></div>
    </article>`;
  }

  function renderStatusSection(def,list){
    const rows=list.filter(o=>o.status===def.key);
    const open=getStoredValue(GROUP_STATE,def.key);
    return `<section class="cmd-status-group${open?' open':''}" data-status-group="${def.key}">
      <button type="button" class="cmd-status-header" data-toggle-group="${def.key}" aria-expanded="${open?'true':'false'}">
        <span class="cmd-status-header-left"><span class="cmd-status-dot ${def.tone}"></span><span>${esc(def.label)}</span></span>
        <span class="cmd-status-header-right"><span class="cmd-status-count">${rows.length}</span><span class="cmd-chevron">⌄</span></span>
      </button>
      <div class="cmd-status-body">${rows.length?rows.map(renderChantierRow).join(''):'<div class="cmd-status-empty">Aucune commande.</div>'}</div>
    </section>`;
  }

  function renderNotePanel(){
    return `<section class="cmd-note-panel">
      <div class="cmd-note-head">📝 NOTE COMMANDES</div>
      <div class="cmd-note-body">
        <textarea id="cmdChantierNote" placeholder="Note commandes du chantier…">${esc(currentNote())}</textarea>
        <div class="cmd-note-actions"><button type="button" class="cmd-note-cancel" id="cmdNoteCancel">Annuler</button><button type="button" class="cmd-note-save" id="cmdNoteSave">Enregistrer</button></div>
      </div>
    </section>`;
  }

  function renderChantier(){
    const list=chantierOrders();
    const name=currentChantierName||'Chantier';
    $('#cmdBack').hidden=false;
    $('#cmdTitle').textContent=name;
    $('#cmdSubtitle').textContent='Commande — version native Yaya';
    $('#cmdFilters').hidden=true;
    const box=$('#cmdList');
    box.className='cmd-list chantier-mode';
    const problem=list.filter(o=>o.status==='problem');
    box.innerHTML=renderTabs(list.length)+renderKpis(list)+STATUS_SECTIONS.map(s=>renderStatusSection(s,list)).join('')+(problem.length?renderStatusSection({key:'problem',label:'Problème',tone:'red'},list):'')+renderNotePanel();

    box.querySelectorAll('[data-toggle-group]').forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.dataset.toggleGroup;
      const section=btn.closest('.cmd-status-group');
      const next=!section.classList.contains('open');
      section.classList.toggle('open',next);
      btn.setAttribute('aria-expanded',String(next));
      setStoredValue(GROUP_STATE,key,next);
    }));

    box.querySelectorAll('[data-toggle-row]').forEach(btn=>btn.addEventListener('click',()=>{
      const id=btn.dataset.toggleRow;
      const row=btn.closest('.cmd-ch-row');
      const next=!row.classList.contains('open');
      row.classList.toggle('open',next);
      btn.setAttribute('aria-expanded',String(next));
      const indicator=row.querySelector('.cmd-row-toggle-indicator');if(indicator)indicator.textContent=next?'▴':'▾';
      setStoredValue(ROW_STATE,id,next);
    }));

    box.querySelectorAll('[data-passive-tab]').forEach(btn=>btn.addEventListener('click',()=>toast(btn.dataset.passiveTab+' reste géré par la fiche Yaya.')));
    bindCommandControls(box);

    const note=$('#cmdChantierNote');
    $('#cmdNoteCancel')?.addEventListener('click',()=>{note.value=currentNote();});
    $('#cmdNoteSave')?.addEventListener('click',()=>{saveCurrentNote(note.value);toast('Note commandes enregistrée','ok');});
  }

  function bindCommandControls(root){
    root.querySelectorAll('[data-edit-id]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();openModal(btn.dataset.editId);}));
    root.querySelectorAll('[data-status-id]').forEach(sel=>sel.addEventListener('click',e=>e.stopPropagation()));
    root.querySelectorAll('[data-status-id]').forEach(sel=>sel.addEventListener('change',()=>changeStatus(sel)));
  }

  function render(){
    readYayaContext();
    if(currentChantierId||currentChantierName)renderChantier();else renderOverview();
  }

  function openModal(id=''){
    editId=String(id||'');
    const o=editId?orders.find(x=>String(x.id)===editId):null;
    readYayaContext();
    let selectedId=o?.chantierId||currentChantierId||'';
    let selectedName=o?.chantier||currentChantierName||'';
    if(!selectedId&&selectedName){const hit=yayaChantiers.find(c=>norm(c.nom)===norm(selectedName));if(hit)selectedId=String(hit.id||'');}
    fillChantiers(selectedId,selectedName);
    $('#cmdFChantier').disabled=!!(currentChantierId||currentChantierName);
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
    $('#cmdFChantier').disabled=false;
    editId='';
  }

  function formOrder(){
    const old=editId?orders.find(x=>String(x.id)===editId):null;
    const chantierId=String($('#cmdFChantier').value||currentChantierId||'');
    const chantierObj=yayaChantiers.find(c=>String(c.id)===chantierId);
    const chantierName=String(chantierObj?.nom||currentChantierName||old?.chantier||'');
    return normalize({
      ...(old||{}),
      id:editId||uid(),
      chantierId,
      chantier:chantierName,
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
    if(!order.chantier||!order.produit){alert('Choisis un chantier et indique le produit.');return;}
    if((order.status==='ordered'||order.status==='received')&&!order.fournisseur){alert('Le fournisseur est nécessaire pour une commande commandée ou reçue.');return;}
    saveLocal(order);
    closeModal();
    toast('Commande enregistrée — envoi en arrière-plan','ok');
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
      await wait(250);
      const [a,b]=await Promise.all([jsonp('list'),jsonp('documents')]);
      if(!a?.ok)throw new Error(a?.error||'Lecture commandes impossible');
      if(!b?.ok)throw new Error(b?.error||'Lecture documents impossible');
      orders=(a.commandes||[]).map(normalize);
      documents=Array.isArray(b.documents)?b.documents:[];
      saveCache();
      render();
      $('#cmdState').textContent='Actualisé à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+' — uniquement sur demande.';
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
  readYayaContext();
  cachedAtBoot=readCache();
  parseRoute();
  render();
  $('#cmdState').textContent=cachedAtBoot
    ?(pending.length?'Affichage immédiat — modifications en attente. Actualiser pour contrôler.':'Affichage immédiat depuis le cache — Actualiser uniquement sur demande.')
    :'Aucun cache local — cliquer Actualiser.';

  $('#cmdAdd').addEventListener('click',()=>openModal(''));
  $('#cmdRefresh').addEventListener('click',manualRefresh);
  $('#cmdBack').addEventListener('click',backOverview);
  $('#cmdSearch').addEventListener('input',()=>{if(!currentChantierId&&!currentChantierName)renderOverview();});
  $('#cmdStatus').addEventListener('change',()=>{if(!currentChantierId&&!currentChantierName)renderOverview();});
  $('#cmdForm').addEventListener('submit',submitForm);
  $('#cmdCancel').addEventListener('click',closeModal);
  $('#cmdModalClose').addEventListener('click',closeModal);
  $('#cmdModal').addEventListener('click',e=>{if(e.target===$('#cmdModal'))closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#cmdModal').classList.contains('show'))closeModal();});
  window.addEventListener('popstate',()=>{parseRoute();render();});

  window.__YAYA_COMMANDES_NATIVE_VERSION='0.4-chantier-accordions-local-first';
})();
