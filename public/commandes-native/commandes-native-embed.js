(function(){
'use strict';
if(window.YayaCommandesNativeEmbed)return;

const CACHE_KEYS=['YAYA_COMMANDES_EMBED_CACHE_V3'];
const PENDING_KEY='YAYA_COMMANDES_NATIVE_PENDING_V1';
const STATUS_PENDING_KEY='YAYA_COMMANDES_STATUS_PENDING_V1';
const NOTE_KEY='YAYA_COMMANDES_NATIVE_CHANTIER_NOTES_V1';
const GROUP_KEY='YAYA_COMMANDES_NATIVE_GROUPS_V2';
const ROW_KEY='YAYA_COMMANDES_NATIVE_ROWS_V2';
const STATUSES={choice:'Attente choix',todo:'À commander',ordered:'Commandé',received:'Reçu'};
const GROUPS=[{key:'choice',kpi:'Choix client',label:'Attente choix',tone:'purple'},{key:'todo',kpi:'À commander',label:'À commander',tone:'orange'},{key:'ordered',kpi:'Commandé',label:'Commandé',tone:'blue'},{key:'received',kpi:'Reçu',label:'Reçu',tone:'green'}];
let root=null, chantierId='', chantierName='', orders=[], documents=[], pending=readPending(), statusPending=readStatusPending(), statusSyncTimer=0, statusSyncBusy=false, editId='', currentDocOrderId='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
const uid=()=>globalThis.crypto?.randomUUID?.()||(Date.now()+'-'+Math.random().toString(36).slice(2));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const actionLocks=new Map();
function allowAction(key,delay=550){
  const k=String(key||'global'),now=Date.now(),until=Number(actionLocks.get(k)||0);
  if(now<until)return false;
  actionLocks.set(k,now+Math.max(250,Number(delay)||550));
  setTimeout(()=>{if(Number(actionLocks.get(k)||0)<=Date.now())actionLocks.delete(k);},Math.max(300,Number(delay)||550)+80);
  return true;
}
function normalizeStatus(v){
 const raw=String(v||'').trim();
 if(STATUSES[raw])return raw;
 const n=norm(raw);
 if(n==='ATTENTE CHOIX CLIENT'||n==='ATTENTE CHOIX'||n==='CHOIX CLIENT')return 'choice';
 if(n==='A COMMANDER'||n==='À COMMANDER')return 'todo';
 if(n==='COMMANDE'||n==='COMMANDÉ')return 'ordered';
 if(n==='RECU'||n==='REÇU')return 'received';
 if(n==='PROBLEME'||n==='PROBLÈME')return 'todo';
 return 'choice';
}
function workflowStatus(o){
 const persisted=String(o?.statut||'').trim();
 if(persisted)return normalizeStatus(persisted);
 const validation=String(o?.statutValidation||'');
 const m=validation.match(/(?:^|\|)YAYA_STATUS=(choice|todo|ordered|received)(?:\||$)/i);
 if(m)return normalizeStatus(m[1]);
 const transient=String(o?.status||'').trim();
 return transient?normalizeStatus(transient):normalizeStatus('');
}
function workflowValidation(current,status){
 const clean=String(current||'VALIDEE')
   .replace(/\|YAYA_STATUS=(choice|todo|ordered|received)/ig,'')
   .replace(/\|+$/,'')||'VALIDEE';
 return clean+'|YAYA_STATUS='+normalizeStatus(status);
}
function normalize(o){
 const produit=String(o?.produit||o?.designation||'');
 return {...o,id:String(o?.id||''),chantierId:String(o?.chantierId||o?.chantier_id||''),chantier:String(o?.chantier||''),produit,designation:String(o?.designation||produit),qte:String(o?.qte||''),fournisseur:String(o?.fournisseur||''),responsable:String(o?.responsable||''),notes:String(o?.notes||''),status:workflowStatus(o)};
}
function applyPendingStatuses(rows){
 const list=(Array.isArray(rows)?rows:[]).map(normalize);
 if(!statusPending.length)return list;
 const byId=new Map(statusPending.map(m=>[String(m.id||''),m]));
 return list.map(row=>{
   const m=byId.get(String(row.id||''));
   return m?normalize({...row,status:m.status,statut:m.status,statutValidation:workflowValidation(row.statutValidation,m.status)}):row;
 });
}
function yayaStateOrders(){
 try{
   if(typeof S!=='undefined'&&S&&Array.isArray(S.commandes))return applyPendingStatuses(S.commandes);
 }catch(_){}
 try{
   const cached=JSON.parse(localStorage.getItem('YAYA_CACHE_DATA_V2')||'{}')||{};
   if(Array.isArray(cached.commandes))return applyPendingStatuses(cached.commandes);
 }catch(_){}
 return [];
}
function mergeOrderSources(legacyRows,yayaRows){
 const map=new Map();
 (Array.isArray(legacyRows)?legacyRows:[]).map(normalize).forEach(o=>{if(o.id)map.set(String(o.id),o);});
 (Array.isArray(yayaRows)?yayaRows:[]).map(normalize).forEach(o=>{if(o.id)map.set(String(o.id),o);});
 return Array.from(map.values());
}
function readCache(){try{const d=JSON.parse(localStorage.getItem(CACHE_KEYS[0])||'null');if(Array.isArray(d?.orders)){orders=d.orders.map(normalize);documents=Array.isArray(d.documents)?d.documents:[];return true;}}catch(_){}orders=yayaStateOrders();documents=[];return !!orders.length;}
function saveCache(){const p={version:9,savedAt:Date.now(),orders,documents};try{localStorage.setItem(CACHE_KEYS[0],JSON.stringify(p));}catch(_){}}
function readPending(){try{const p=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');return Array.isArray(p)?p:[];}catch(_){return [];}}
function savePending(){try{localStorage.setItem(PENDING_KEY,JSON.stringify(pending));}catch(_){}}
function queue(order){pending=pending.filter(x=>String(x?.id||'')!==String(order.id));pending.push(normalize(order));savePending();}
function dequeue(id){pending=pending.filter(x=>String(x?.id||'')!==String(id));savePending();}
function readStatusPending(){
 try{
   const p=JSON.parse(localStorage.getItem(STATUS_PENDING_KEY)||'[]');
   return Array.isArray(p)?p.filter(x=>x&&x.id&&x.status):[];
 }catch(_){return [];}
}
function saveStatusPending(){
 try{
   if(statusPending.length)localStorage.setItem(STATUS_PENDING_KEY,JSON.stringify(statusPending));
   else localStorage.removeItem(STATUS_PENDING_KEY);
 }catch(_){}
}
function queueStatus(id,status){
 const key=String(id||''),workflow=normalizeStatus(status);
 if(!key)return;
 statusPending=statusPending.filter(x=>String(x?.id||'')!==key);
 statusPending.push({id:key,status:workflow,at:Date.now()});
 saveStatusPending();
 scheduleStatusSync(650);
}
function removeStatusMutation(mutation){
 const id=String(mutation?.id||''),at=Number(mutation?.at||0);
 statusPending=statusPending.filter(x=>!(String(x?.id||'')===id&&Number(x?.at||0)===at));
 saveStatusPending();
}
function apiUrl(){
 try{return (typeof API==='string'&&API)?API:'';}catch(_){return '';}
}
async function fetchLatestCommandes(){
 const api=apiUrl();if(!api)throw new Error('API Yaya indisponible');
 const sep=api.includes('?')?'&':'?';
 const ctrl=new AbortController();
 const timer=setTimeout(()=>ctrl.abort(),7000);
 try{
   const r=await fetch(api+sep+'tabs=commandes&_yaya_status_sync='+Date.now(),{method:'GET',cache:'no-store',signal:ctrl.signal});
   const txt=await r.text();
   const j=JSON.parse(txt);
   if(!j||!j.ok)throw new Error(j&&j.error||'Lecture commandes impossible');
   const rows=j.data&&Array.isArray(j.data.commandes)?j.data.commandes:null;
   if(!rows)throw new Error('Commandes serveur absentes');
   return rows;
 }finally{clearTimeout(timer);}
}
function applyStatusToRows(rows,mutation){
 const id=String(mutation?.id||''),workflow=normalizeStatus(mutation?.status);
 return (Array.isArray(rows)?rows:[]).map(row=>{
   if(String(row?.id||'')!==id)return row;
   return {
     ...row,
     statut:workflow,
     statutValidation:workflowValidation(row?.statutValidation,workflow)
   };
 });
}
async function syncStatusQueue(){
 if(statusSyncBusy||!statusPending.length)return !statusPending.length;
 if(typeof apiPost!=='function')return false;
 statusSyncBusy=true;
 const snapshot=statusPending.slice();
 window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;
 try{
   let rows=await fetchLatestCommandes();
   for(const mutation of snapshot)rows=applyStatusToRows(rows,mutation);
   const ok=await apiPost('setCommandes',rows);
   if(!ok)throw new Error('Écriture statuts refusée');
   snapshot.forEach(removeStatusMutation);
   try{
     if(typeof S!=='undefined'&&S)S.commandes=rows;
     updateYayaCache();
   }catch(_){}
   return true;
 }catch(err){
   console.warn('Yaya Commandes : statuts conservés en local, synchronisation différée',err);
   return false;
 }finally{
   window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
   window.__yayaLastWriteAt=Date.now();
   statusSyncBusy=false;
 }
}
function scheduleStatusSync(delay){
 clearTimeout(statusSyncTimer);
 statusSyncTimer=setTimeout(()=>{syncStatusQueue();},Math.max(0,Number(delay)||0));
}
async function post(data){
 const action=String(data?.action||'');
 if(action==='upsert'){
   const order={...data};delete order.action;
   const ok=await persistToYaya(order);
   if(!ok)throw new Error('Écriture Yaya refusée');
   return {ok:true};
 }
 if(action==='delete'){
   const id=String(data?.id||'');
   let rows=[];
   try{rows=Array.isArray(S?.commandes)?S.commandes.filter(x=>String(x?.id||'')!==id):[];S.commandes=rows;updateYayaCache();}catch(_){}
   if(typeof apiPost!=='function')throw new Error('API Yaya indisponible');
   const ok=await apiPost('setCommandes',rows);
   if(!ok)throw new Error('Suppression Yaya refusée');
   return {ok:true};
 }
 return {ok:true};
}
function updateYayaCache(){
 try{
   const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
   const data=raw?JSON.parse(raw):{};
   if(data&&typeof data==='object'){
     data.commandes=(typeof S!=='undefined'&&S&&Array.isArray(S.commandes))?S.commandes:[];
     localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(data));
   }
 }catch(_){}
}
function persistToYaya(order){
 try{
   if(typeof S==='undefined'||!S)return Promise.resolve(false);
   const rows=Array.isArray(S.commandes)?S.commandes.slice():[];
   const id=String(order?.id||'');
   const idx=rows.findIndex(x=>String(x?.id||'')===id);
   const prev=idx>=0?rows[idx]:{};
   const workflow=normalizeStatus(order?.status||order?.statut||workflowStatus(prev));
   const produit=String(order?.produit||order?.designation||prev?.designation||'').trim();
   const nextRow={
     ...prev,
     ...order,
     designation:produit,
     statut:workflow,
     statutValidation:workflowValidation(order?.statutValidation||prev?.statutValidation,workflow)
   };
   delete nextRow.status;
   delete nextRow.produit;
   if(idx>=0)rows[idx]=nextRow;else rows.push(nextRow);
   S.commandes=rows;
   updateYayaCache();
   if(typeof apiPost!=='function')return Promise.resolve(false);
   return Promise.resolve(apiPost('setCommandes',rows)).then(ok=>{
     if(!ok)throw new Error('Écriture Yaya refusée');
     return true;
   }).catch(err=>{
     console.warn('Yaya Commandes : statut central non enregistré',err);
     return false;
   });
 }catch(err){
   console.warn('Yaya Commandes : synchronisation centrale impossible',err);
   return Promise.resolve(false);
 }
}
function sendBackground(order){
 queue(order);
 Promise.resolve().then(()=>post({action:'upsert',...order}))
   .then(()=>{dequeue(order.id);toast('Enregistré ✓','ok');})
   .catch(()=>toast('Enregistrement en attente — utiliser Actualiser','err'));
}
async function flushPending(){for(const order of [...pending]){try{await post({action:'upsert',...order});dequeue(order.id);}catch(_){}}}
function jsonp(action,extra={}){if(action==='list')return Promise.resolve({ok:true,commandes:yayaStateOrders()});if(action==='documents')return Promise.resolve({ok:true,documents:Array.isArray(documents)?documents:[]});if(action==='document'){const d=(Array.isArray(documents)?documents:[]).find(x=>String(x?.id||'')===String(extra?.id||''));return Promise.resolve({ok:true,document:d||null});}return Promise.resolve({ok:true});}
function toast(text,kind=''){let el=document.getElementById('ycnToast');if(!el){el=document.createElement('div');el.id='ycnToast';el.className='ycn-toast';document.body.appendChild(el);}el.textContent=text;el.className='ycn-toast show'+(kind?' '+kind:'');clearTimeout(el._t);el._t=setTimeout(()=>el.className='ycn-toast',3500);}
function key(){return chantierId||norm(chantierName)||'GENERAL';}
function readMap(k){try{return JSON.parse(sessionStorage.getItem(k)||'{}')||{};}catch(_){return {};}}
function stateGet(k,id){return !!readMap(k)[key()+':'+id];}
function stateSet(k,id,v){const m=readMap(k);m[key()+':'+id]=!!v;try{sessionStorage.setItem(k,JSON.stringify(m));}catch(_){}}
function noteGet(){try{return String((JSON.parse(localStorage.getItem(NOTE_KEY)||'{}')||{})[key()]||'');}catch(_){return '';}}
function noteSet(v){let x={};try{x=JSON.parse(localStorage.getItem(NOTE_KEY)||'{}')||{};}catch(_){}x[key()]=String(v||'');try{localStorage.setItem(NOTE_KEY,JSON.stringify(x));}catch(_){}}
function matches(o){if(chantierId&&String(o.chantierId||'')===String(chantierId))return true;return !!(chantierName&&norm(o.chantier)===norm(chantierName));}
function list(){return orders.filter(matches);}
function docCount(id){return documents.filter(d=>String(d?.commande_id||'')===String(id)).length;}
function statusOptions(selected){return Object.entries(STATUSES).map(([k,v])=>`<option value="${k}" ${k===selected?'selected':''}>${esc(v)}</option>`).join('');}
function ensureModals(){if(!document.getElementById('ycnEditModal')){const m=document.createElement('div');m.id='ycnEditModal';m.className='ycn-modal';m.innerHTML=`<div class="ycn-dialog"><div class="ycn-dialog-head"><h3 id="ycnEditTitle">Commande</h3><button class="ycn-close" data-ycn-close="edit">×</button></div><form id="ycnEditForm"><div class="ycn-form-grid"><label class="ycn-field full"><span>Produit / besoin</span><input id="ycnProduit" required></label><label class="ycn-field"><span>Quantité</span><input id="ycnQte"></label><label class="ycn-field"><span>Fournisseur</span><input id="ycnFournisseur"></label><label class="ycn-field"><span>Responsable</span><select id="ycnResponsable"><option value="">—</option><option>Solenn</option><option>Mathieu</option><option>Morvan</option><option>Younès</option></select></label><label class="ycn-field"><span>Statut</span><select id="ycnStatus"></select></label><label class="ycn-field full"><span>Note</span><textarea id="ycnNotes" rows="3"></textarea></label></div><div class="ycn-dialog-actions"><button type="button" class="ycn-btn" data-ycn-close="edit">Annuler</button><button type="submit" class="ycn-btn primary">Enregistrer</button></div></form></div>`;document.body.appendChild(m);m.querySelectorAll('[data-ycn-close="edit"]').forEach(b=>b.onclick=()=>closeEdit());m.onclick=e=>{if(e.target===m)closeEdit()};document.getElementById('ycnEditForm').onsubmit=saveEdit;}if(!document.getElementById('ycnDocModal')){const m=document.createElement('div');m.id='ycnDocModal';m.className='ycn-modal';m.innerHTML=`<div class="ycn-dialog"><div class="ycn-dialog-head"><h3>Documents commande</h3><button class="ycn-close" data-ycn-close="doc">×</button></div><input id="ycnDocFile" type="file"><div class="ycn-dialog-actions"><button type="button" class="ycn-btn" data-ycn-close="doc">Fermer</button><button type="button" class="ycn-btn primary" id="ycnDocSend">Envoyer en arrière-plan</button></div><div id="ycnDocList" class="ycn-doc-list"></div></div>`;document.body.appendChild(m);m.querySelectorAll('[data-ycn-close="doc"]').forEach(b=>b.onclick=()=>closeDocs());m.onclick=e=>{if(e.target===m)closeDocs()};document.getElementById('ycnDocSend').onclick=startDocUpload;}}
function openEdit(id=''){ensureModals();editId=String(id||'');const o=editId?orders.find(x=>String(x.id)===editId):null;document.getElementById('ycnEditTitle').textContent=o?'Modifier la commande':'Ajouter une commande';document.getElementById('ycnProduit').value=o?.produit||'';document.getElementById('ycnQte').value=o?.qte||'';document.getElementById('ycnFournisseur').value=o?.fournisseur||'';document.getElementById('ycnResponsable').value=o?.responsable||'';document.getElementById('ycnStatus').innerHTML=statusOptions(o?.status||'choice');document.getElementById('ycnNotes').value=o?.notes||'';document.getElementById('ycnEditModal').classList.add('show');}
function closeEdit(){document.getElementById('ycnEditModal')?.classList.remove('show');editId='';}
function saveEdit(e){e.preventDefault();const old=editId?orders.find(x=>String(x.id)===editId):null;const o=normalize({...old,id:editId||uid(),chantierId,chantier:chantierName,produit:document.getElementById('ycnProduit').value.trim(),qte:document.getElementById('ycnQte').value.trim(),fournisseur:document.getElementById('ycnFournisseur').value.trim(),responsable:document.getElementById('ycnResponsable').value,status:document.getElementById('ycnStatus').value,notes:document.getElementById('ycnNotes').value.trim()});if(!o.produit)return;if((o.status==='ordered'||o.status==='received')&&!o.fournisseur){alert('Renseigne d’abord le fournisseur.');return;}const i=orders.findIndex(x=>String(x.id)===String(o.id));if(i>=0)orders[i]=o;else orders.push(o);saveCache();closeEdit();render();sendBackground(o);}
function changeStatus(id,value){
 const key=String(id||''),workflow=normalizeStatus(value);
 const i=orders.findIndex(x=>String(x.id)===key),o=i>=0?orders[i]:null;
 if(!o)return false;
 if((workflow==='ordered'||workflow==='received')&&!o.fournisseur){alert('Renseigne d’abord le fournisseur.');render();return false;}
 // Keep the persisted workflow field aligned before normalizing. Otherwise
 // workflowStatus() gives the old `statut` priority over the freshly selected
 // transient `status`, and the card is rendered back in its previous column.
 const u=normalize({...o,statut:workflow,status:workflow,statutValidation:workflowValidation(o.statutValidation,workflow)});
 orders[i]=u;
 try{
   if(typeof S!=='undefined'&&S&&Array.isArray(S.commandes)){
     const si=S.commandes.findIndex(x=>String(x?.id||'')===key);
     if(si>=0){
       const prev=S.commandes[si]||{};
       S.commandes[si]={...prev,statut:workflow,statutValidation:workflowValidation(prev.statutValidation,workflow)};
     }
     updateYayaCache();
   }
 }catch(_){}
 saveCache();
 queueStatus(key,workflow);
 render();
 toast('Statut modifié — synchronisation…');
 return true;
}
function renderRow(o){const open=stateGet(ROW_KEY,o.id);return `<article class="ycn-row${open?' open':''}" data-ycn-row="${esc(o.id)}"><div class="ycn-row-top"><div class="ycn-row-summary"><strong>${esc(o.produit||'—')}</strong><span class="ycn-supplier">${esc(o.fournisseur||'—')}</span><span class="ycn-qte">${esc(o.qte||'—')}</span><span class="ycn-resp">${esc(o.responsable||'—')}</span></div><button class="ycn-row-toggle" type="button" data-ycn-toggle-row="${esc(o.id)}">${open?'▴':'▾'}</button></div><div class="ycn-row-detail"><div class="ycn-detail-grid"><div class="ycn-box"><small>Produit</small><strong>${esc(o.produit||'—')}</strong></div><div class="ycn-box"><small>Fournisseur</small><span>${esc(o.fournisseur||'—')}</span></div><div class="ycn-box"><small>Quantité</small><span>${esc(o.qte||'—')}</span></div><div class="ycn-box"><small>Responsable</small><span>${esc(o.responsable||'—')}</span></div><div class="ycn-box"><small>Statut</small><select class="ycn-status" data-ycn-status="${esc(o.id)}">${statusOptions(o.status)}</select></div><div class="ycn-box"><small>Pièces jointes</small><span>${docCount(o.id)}</span></div><div class="ycn-box note"><small>Note</small><span>${esc(o.notes||'—')}</span></div></div><div class="ycn-actions"><button type="button" class="ycn-doc" data-ycn-doc="${esc(o.id)}">📎 Documents${docCount(o.id)?' ('+docCount(o.id)+')':''}</button><button type="button" class="ycn-edit" data-ycn-edit="${esc(o.id)}">Modifier</button></div></div></article>`;}
function renderGroup(g,all){const rows=all.filter(o=>o.status===g.key);return `<section class="ycn-group open" data-ycn-group="${g.key}"><div class="ycn-group-head"><span class="ycn-group-left"><span class="ycn-dot ${g.tone}"></span><span>${esc(g.label)}</span></span><span class="ycn-group-right"><span class="ycn-count">${rows.length}</span></span></div><div class="ycn-group-body">${rows.length?rows.map(renderRow).join(''):'<div class="ycn-empty">Aucune commande.</div>'}</div></section>`;}
function bind(){
 const add=root.querySelector('[data-ycn-add]');
 if(add)add.onclick=()=>{if(!allowAction('add',650))return;openEdit('');};

 root.querySelectorAll('[data-ycn-toggle-row]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.ycnToggleRow;
   if(!allowAction('toggle:'+String(id||''),450))return;
   const v=!stateGet(ROW_KEY,id);stateSet(ROW_KEY,id,v);render();
 });

 root.querySelectorAll('[data-ycn-status]').forEach(s=>{
   s.onclick=e=>e.stopPropagation();
   s.onchange=()=>changeStatus(s.dataset.ycnStatus,s.value);
 });

 root.querySelectorAll('[data-ycn-edit]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.ycnEdit;
   if(!allowAction('edit:'+String(id||''),650))return;
   openEdit(id);
 });

 root.querySelectorAll('[data-ycn-doc]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.ycnDoc;
   if(!allowAction('docs:'+String(id||''),650))return;
   openDocs(id);
 });

 const n=root.querySelector('#ycnNote');
 root.querySelector('[data-ycn-note-cancel]')?.addEventListener('click',()=>{if(!allowAction('note-cancel',400))return;n.value=noteGet();});
 root.querySelector('[data-ycn-note-save]')?.addEventListener('click',()=>{if(!allowAction('note-save',700))return;noteSet(n.value);toast('Note commandes enregistrée','ok');});
}
function render(){if(!root||!root.isConnected)return;const all=list();root.innerHTML=`<div class="ycn-toolbar"><button type="button" class="ycn-btn primary" data-ycn-add>+ Ajouter</button></div><div class="ycn-statusline">Données Yaya — Actualiser uniquement sur demande.</div><div class="ycn-kpis">${GROUPS.map(g=>`<div class="ycn-kpi ${g.tone}"><span class="ycn-kpi-num">${all.filter(o=>o.status===g.key).length}</span><strong>${esc(g.kpi)}</strong></div>`).join('')}</div><div class="ycn-groups">${GROUPS.map(g=>renderGroup(g,all)).join('')}</div><section class="ycn-note-panel"><div class="ycn-note-head">NOTE COMMANDES</div><div class="ycn-note-body"><textarea id="ycnNote">${esc(noteGet())}</textarea><div class="ycn-note-actions"><button type="button" class="ycn-btn" data-ycn-note-cancel>Annuler</button><button type="button" class="ycn-btn primary" data-ycn-note-save>Enregistrer</button></div></div></section>`;bind();}
function openDocs(id){ensureModals();currentDocOrderId=String(id||'');document.getElementById('ycnDocFile').value='';renderDocs();document.getElementById('ycnDocModal').classList.add('show');}
function closeDocs(){document.getElementById('ycnDocModal')?.classList.remove('show');currentDocOrderId='';}
function renderDocs(){const box=document.getElementById('ycnDocList');if(!box)return;const a=documents.filter(d=>String(d?.commande_id||'')===currentDocOrderId);box.innerHTML=a.length?a.map(d=>`<div class="ycn-doc-item"><a href="${esc(d.url_pdf||'#')}" target="_blank" rel="noopener">${esc(d.nom_fichier||d.type||'Fichier')}</a><a href="${esc(d.url_pdf||'#')}" target="_blank" rel="noopener">Voir</a><button type="button" class="ycn-btn" data-ycn-doc-del="${esc(d.id||'')}">×</button></div>`).join(''):'<div class="ycn-empty">Aucun document lié.</div>';box.querySelectorAll('[data-ycn-doc-del]').forEach(b=>b.onclick=()=>deleteDoc(b.dataset.ycnDocDel));}
function fileBase64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result||'').split(',').pop()||'');r.onerror=()=>rej(new Error('Lecture impossible'));r.readAsDataURL(file);});}
async function startDocUpload(){
 const file=document.getElementById('ycnDocFile')?.files?.[0];
 if(!file){toast('Choisis un fichier.','err');return;}
 const order=orders.find(o=>String(o.id)===currentDocOrderId);if(!order)return;
 const name=file.name;closeDocs();toast('Envoi de la pièce : '+name);
 setTimeout(async()=>{
   try{
     const base64=await fileBase64(file);
     let api='';try{api=String(typeof API!=='undefined'&&API?API:'');}catch(_){}
     if(!api)api='https://script.google.com/macros/s/AKfycbxXBpXjWXEF-7p6vvOE3blSBc8_5e62AtQb2stHjnrGE025cOxQGy-zAguYmN2u9O4K/exec';
     const r=await fetch(api,{method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'archiverDevis',data:{filename:name,mimeType:file.type||'application/octet-stream',base64}})});
     const j=await r.json();if(!j||j.ok!==true)throw new Error(j?.error||'Import impossible');
     const link=String(j?.data?.lienDrive||j?.data?.lien||'').trim();if(!link)throw new Error('Pièce non archivée');
     const patched=normalize({...order,lien:link,pieceNom:name});
     const idx=orders.findIndex(o=>String(o.id)===String(order.id));if(idx>=0)orders[idx]=patched;
     saveCache();render();
     const ok=await persistToYaya(patched);if(!ok)throw new Error('Pièce non synchronisée dans Yaya');
     toast('Pièce enregistrée : '+name,'ok');
   }catch(e){toast('Échec document : '+String(e?.message||e),'err');}
 },0);
}
function deleteDoc(id){if(!allowAction('doc-delete:'+String(id||''),700))return;if(!confirm('Supprimer ce document ?'))return;documents=documents.filter(d=>String(d?.id||'')!==String(id));saveCache();renderDocs();render();}
async function refresh(){if(!root)return;const line=root.querySelector('.ycn-statusline');if(line)line.textContent='Actualisation volontaire…';try{await flushPending();await syncStatusQueue();const a=await jsonp('list');if(!a?.ok)throw new Error(a?.error||'Lecture commandes impossible');orders=yayaStateOrders();saveCache();render();toast('Commandes actualisées','ok');return true;}catch(e){orders=yayaStateOrders();saveCache();render();if(line)line.textContent='Actualisation impossible — affichage conservé.';toast(e?.message||'Actualisation impossible','err');return false;}}
function mount(el,id,name){root=el;chantierId=String(id||'');chantierName=String(name||'');root.classList.add('yaya-cmd-native-root');readCache();orders=yayaStateOrders();ensureModals();saveCache();render();scheduleStatusSync(250);}
function unmount(el){if(root===el)root=null;if(el)el.innerHTML='';}
function setChantier(id,name){chantierId=String(id||'');chantierName=String(name||'');orders=yayaStateOrders();saveCache();render();}
window.addEventListener('online',()=>scheduleStatusSync(150),{passive:true});
window.addEventListener('focus',()=>scheduleStatusSync(350),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleStatusSync(350);});
window.addEventListener('pagehide',()=>{saveStatusPending();},{passive:true});
window.YayaCommandesNativeEmbed={mount,unmount,setChantier,refresh,render,changeStatus,version:'1.5-direct-status-action'};
})();
