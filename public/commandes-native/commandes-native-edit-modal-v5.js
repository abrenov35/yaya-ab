(function(){
'use strict';
if(window.__YAYA_COMMANDES_EDIT_MODAL_V5)return;
window.__YAYA_COMMANDES_EDIT_MODAL_V5=true;

const CACHE_KEYS=['YAYA_COMMANDES_EMBED_CACHE_V3'];
const PENDING_KEY='YAYA_COMMANDES_NATIVE_PENDING_V1';
const TOMBSTONE_KEY='YAYA_COMMANDES_NATIVE_DELETED_SESSION_V1';
let activeId='';
let scheduled=false;

function txt(v){return String(v==null?'':v).trim();}
function toast(message,kind=''){
  let el=document.getElementById('ycnToast');
  if(!el){el=document.createElement('div');el.id='ycnToast';el.className='ycn-toast';document.body.appendChild(el);}
  el.textContent=message;el.className='ycn-toast show'+(kind?' '+kind:'');
  clearTimeout(el.__modalV5T);el.__modalV5T=setTimeout(()=>{el.className='ycn-toast';},3200);
}
function readState(){
  try{
    if(typeof S!=='undefined'&&S&&Array.isArray(S.commandes)){
      let docs=[];
      try{const d=JSON.parse(localStorage.getItem(CACHE_KEYS[0])||'{}');docs=Array.isArray(d?.documents)?d.documents:[];}catch(_){}
      return {orders:S.commandes.slice(),documents:docs};
    }
  }catch(_){}
  try{const d=JSON.parse(localStorage.getItem(CACHE_KEYS[0])||'null');if(Array.isArray(d?.orders))return d;}catch(_){}
  return {orders:[],documents:[]};
}
function findOrder(id){return (readState().orders||[]).find(o=>String(o?.id||'')===String(id||''))||null;}
function orderUrl(o){const piece=txt(o?.pieceNom||o?.piece_nom);return txt(o?.lienUrl||o?.lien_url||o?.urlCommande||o?.url_commande||o?.url||o?.webUrl||o?.oneDriveWebUrl||o?.driveUrl||o?.dropboxUrl||(!piece?o?.lien:'')||'');}
function writeOrders(next){
  try{if(typeof S!=='undefined'&&S)S.commandes=Array.isArray(next)?next.slice():[];}catch(_){}
  try{
    const raw=localStorage.getItem(CACHE_KEYS[0]);
    const d=raw?JSON.parse(raw):{};
    d.orders=Array.isArray(next)?next.slice():[];d.documents=Array.isArray(d.documents)?d.documents:[];d.savedAt=Date.now();
    localStorage.setItem(CACHE_KEYS[0],JSON.stringify(d));
  }catch(_){}
  try{
    const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
    if(raw){const d=JSON.parse(raw);if(d&&typeof d==='object'){d.commandes=Array.isArray(next)?next.slice():[];localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(d));}}
  }catch(_){}
}
function updateOrderInCaches(order){
  if(!order?.id)return;
  const state=readState(),rows=Array.isArray(state.orders)?state.orders.slice():[];
  const i=rows.findIndex(o=>String(o?.id||'')===String(order.id));
  if(i>=0)rows[i]={...rows[i],...order};else rows.push(order);
  writeOrders(rows);
}
function encodeWorkflowValidation(current,status){
  const allowed=['choice','todo','ordered','received'];
  const workflow=allowed.includes(String(status||''))?String(status):'choice';
  const clean=String(current||'VALIDEE')
    .replace(/\|YAYA_STATUS=(choice|todo|ordered|received)/ig,'')
    .replace(/\|+$/,'')||'VALIDEE';
  return clean+'|YAYA_STATUS='+workflow;
}
function removePending(id){
  try{const p=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');if(Array.isArray(p))localStorage.setItem(PENDING_KEY,JSON.stringify(p.filter(x=>String(x?.id||'')!==String(id))));}catch(_){ }
}
function tombstones(){try{const a=JSON.parse(sessionStorage.getItem(TOMBSTONE_KEY)||'[]');return Array.isArray(a)?a:[];}catch(_){return [];}}
function addTombstone(id){const a=tombstones().filter(x=>String(x)!==String(id));a.push(String(id));try{sessionStorage.setItem(TOMBSTONE_KEY,JSON.stringify(a));}catch(_){}}
function isTombstone(id){return tombstones().some(x=>String(x)===String(id));}
async function post(data){
  const action=String(data?.action||'');
  let rows=[];
  try{rows=Array.isArray(S?.commandes)?S.commandes.slice():(readState().orders||[]).slice();}catch(_){rows=(readState().orders||[]).slice();}
  if(action==='delete'){
    const id=String(data?.id||'');
    rows=rows.filter(o=>String(o?.id||'')!==id);
    writeOrders(rows);
  }else if(action==='upsert'){
    const order={...data};delete order.action;
    const i=rows.findIndex(o=>String(o?.id||'')===String(order.id||''));
    const previous=i>=0?rows[i]:{};
    const persistedStatus=txt(order.statut||previous.statut);
    const validation=txt(order.statutValidation||previous.statutValidation);
    const vm=validation.match(/(?:^|\|)YAYA_STATUS=(choice|todo|ordered|received)(?:\||$)/i);
    const workflow=txt(order.status)||persistedStatus||(vm&&vm[1])||'choice';
    const produit=txt(order.produit||order.designation||previous.designation||previous.produit);
    order.designation=produit;
    order.statut=workflow;
    order.statutValidation=encodeWorkflowValidation(order.statutValidation||previous.statutValidation,workflow);
    delete order.status;
    delete order.produit;
    if(i>=0)rows[i]={...previous,...order};else rows.push(order);
    writeOrders(rows);
  }else return {ok:true};
  if(typeof apiPost!=='function')throw new Error('API Yaya indisponible');
  const ok=await apiPost('setCommandes',rows);
  if(!ok)throw new Error('Écriture Yaya refusée');
  return {ok:true};
}

function injectStyle(){
  let s=document.getElementById('ycn-edit-modal-v5-style');
  if(!s){s=document.createElement('style');s.id='ycn-edit-modal-v5-style';document.head.appendChild(s);}
  s.textContent=`
    #ycnCreateFollowupV6{display:none!important}
    body #ycnEditModal{background:rgba(14,29,48,.62)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:8px!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
    body #ycnEditModal .ycn-dialog{position:relative!important;width:min(720px,calc(100vw - 28px))!important;max-height:calc(100dvh - 16px)!important;padding:0!important;overflow:hidden!important;border:1px solid rgba(194,209,224,.9)!important;border-radius:20px!important;background:#f7f9fc!important;box-shadow:0 34px 100px rgba(10,28,50,.38)!important}
    body #ycnEditModal .ycn-dialog::before{content:''!important;position:absolute!important;top:0!important;left:0!important;right:0!important;height:4px!important;background:linear-gradient(90deg,#173a60 0%,#276fa8 55%,#71a8cf 100%)!important;z-index:4!important}
    body #ycnEditModal .ycn-dialog-head{position:sticky!important;top:0!important;z-index:3!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:14px!important;margin:0!important;padding:14px 18px 12px!important;border-bottom:1px solid #dfe7ef!important;background:#fff!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    body #ycnEditModal .ycn-dialog-head h3{margin:0!important;color:#162d49!important;font-size:22px!important;line-height:1.2!important;font-weight:900!important;letter-spacing:-.02em!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    body #ycnEditModal .ycn-close{width:40px!important;height:40px!important;flex:0 0 40px!important;border:1px solid #bccbda!important;border-radius:11px!important;background:#f8fbfe!important;color:#203b59!important;font-size:23px!important;line-height:1!important;box-shadow:0 2px 5px rgba(16,24,40,.08)!important;cursor:pointer!important;transition:.15s ease!important}
    body #ycnEditModal .ycn-close:hover{transform:translateY(-1px)!important;background:#eef4fa!important;border-color:#9eb5ca!important}
    body #ycnEditModal #ycnEditForm{padding:12px 18px 14px!important}
    body #ycnEditModal .ycn-form-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px 14px!important;padding:12px!important;border:1px solid #e0e8f0!important;border-radius:15px!important;background:#fff!important;box-shadow:0 3px 10px rgba(22,45,73,.035)!important}
    body #ycnEditModal .ycn-field{display:grid!important;gap:4px!important;min-width:0!important}
    body #ycnEditModal .ycn-field.full{grid-column:1/-1!important}
    body #ycnEditModal .ycn-field>span{color:#5a6e84!important;font-size:11px!important;font-weight:900!important;letter-spacing:.015em!important;text-transform:none!important}
    body #ycnEditModal .ycn-field input,body #ycnEditModal .ycn-field select,body #ycnEditModal .ycn-field textarea{width:100%!important;border:1px solid #c8d5e3!important;border-radius:10px!important;background:#fbfcfe!important;color:#20364f!important;font:inherit!important;font-size:14px!important;outline:none!important;box-shadow:inset 0 1px 1px rgba(16,24,40,.02)!important;transition:border-color .15s,box-shadow .15s,background .15s!important}
    body #ycnEditModal .ycn-field input,body #ycnEditModal .ycn-field select{height:40px!important;padding:0 12px!important}
    body #ycnEditModal .ycn-field textarea{min-height:42px!important;height:42px!important;padding:8px 11px!important;resize:none!important}
    body #ycnEditModal .ycn-field input:hover,body #ycnEditModal .ycn-field select:hover,body #ycnEditModal .ycn-field textarea:hover{border-color:#aebfd1!important;background:#fff!important}
    body #ycnEditModal .ycn-field input:focus,body #ycnEditModal .ycn-field select:focus,body #ycnEditModal .ycn-field textarea:focus{border-color:#3978ad!important;box-shadow:0 0 0 3px rgba(57,120,173,.12)!important;background:#fff!important}
    body #ycnEditModal #ycnProduit{font-weight:750!important;color:#173a60!important;background:#fff!important}
    body #ycnEditModal .ycn-url-v5{display:grid!important;position:relative!important;grid-column:1/-1!important}
    body #ycnEditModal .ycn-url-v5 input{width:100%!important;background:#f8fbff!important;color:#175b91!important}
    body #ycnEditModal .ycn-url-v5 input::placeholder{color:#9aabba!important}
    body #ycnEditModal .ycn-dialog-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;flex-wrap:nowrap!important;margin-top:9px!important;padding:9px 2px 0!important;border-top:1px solid #dce5ee!important}
    body #ycnEditModal .ycn-dialog-actions .ycn-btn{min-height:36px!important;height:36px!important;padding:0 13px!important;border-radius:10px!important;font-size:12px!important;font-weight:900!important;box-shadow:0 2px 4px rgba(16,24,40,.06)!important;transition:.15s ease!important}
    body #ycnEditModal .ycn-dialog-actions .ycn-btn:hover{transform:translateY(-1px)!important}
    body #ycnEditModal .ycn-save-v5{background:#155f99!important;border:1px solid #155f99!important;color:#fff!important;opacity:1!important;box-shadow:0 5px 12px rgba(21,95,153,.22)!important}
    body #ycnEditModal .ycn-save-v5:hover{background:#104f81!important;border-color:#104f81!important}
    body #ycnEditModal .ycn-save-v5:disabled{background:#93b4d1!important;border-color:#93b4d1!important;color:#fff!important;opacity:1!important;transform:none!important}
    body #ycnEditModal .ycn-doc-v5{background:#eaf4ff!important;border:1px solid #a9c9e8!important;color:#145c96!important;font-weight:900!important}
    body #ycnEditModal .ycn-doc-v5::before{content:'＋ '!important}
    body #ycnEditModal .ycn-doc-v5:hover{background:#dfefff!important;border-color:#88b4dd!important}
    body #ycnEditModal .ycn-pieces-v5{background:#eff9f2!important;border:1px solid #a8cfb5!important;color:#17653a!important;font-weight:900!important}
    body #ycnEditModal .ycn-pieces-v5:hover{background:#e4f5e9!important;border-color:#8cbe9d!important}
    body #ycnEditModal .ycn-delete-v5{margin-right:auto!important;background:#fff5f4!important;border:1px solid #efb8b2!important;color:#b42318!important;font-weight:900!important}
    body #ycnEditModal .ycn-delete-v5:hover{background:#ffe9e7!important;border-color:#e99c94!important}
    body #ycnEditModal [data-ycn-close="edit"].ycn-btn{background:#fff!important;border:1px solid #c8d4e0!important;color:#38506a!important}
    @media(max-width:620px){
      body #ycnEditModal{padding:7px!important}
      body #ycnEditModal .ycn-dialog{width:100%!important;border-radius:15px!important;max-height:calc(100dvh - 10px)!important}
      body #ycnEditModal .ycn-dialog-head{padding:11px 13px 9px!important}
      body #ycnEditModal .ycn-dialog-head h3{font-size:19px!important}
      body #ycnEditModal #ycnEditForm{padding:9px 11px 10px!important}
      body #ycnEditModal .ycn-form-grid{grid-template-columns:1fr 1fr!important;gap:7px 9px!important;padding:9px!important}
      body #ycnEditModal .ycn-field.full,body #ycnEditModal .ycn-url-v5{grid-column:1/-1!important}
      body #ycnEditModal .ycn-dialog-actions{display:flex!important;flex-wrap:nowrap!important}
      body #ycnEditModal .ycn-dialog-actions .ycn-btn{width:auto!important;min-width:0!important}
      body #ycnEditModal .ycn-delete-v5{margin-right:0!important}
    }
  `;
}

function captureRow(e){
  const add=e.target?.closest?.('[data-ycn-add]');if(add){activeId='';return;}
  const row=e.target?.closest?.('.ycn-row[data-ycn-row]');if(row)activeId=String(row.dataset.ycnRow||'');
}
document.addEventListener('pointerdown',captureRow,true);

function matchNewOrder(snapshot,beforeIds){
  const list=readState().orders||[];
  if(snapshot.id){const exact=list.find(o=>String(o?.id||'')===String(snapshot.id));if(exact)return exact;}
  const candidates=list.filter(o=>
    (!beforeIds||!beforeIds.has(String(o?.id||''))) &&
    txt(o?.produit||o?.designation)===snapshot.produit &&
    txt(o?.fournisseur)===snapshot.fournisseur &&
    txt(o?.qte)===snapshot.qte &&
    txt(o?.responsable)===snapshot.responsable
  );
  return candidates.length?candidates[candidates.length-1]:null;
}
function persistUrlAfterCore(snapshot,url){
  setTimeout(()=>{
    const current=matchNewOrder(snapshot);if(!current)return;
    const patched={...current,url:url,urlCommande:url,lienUrl:url};
    updateOrderInCaches(patched);
    post({action:'upsert',...patched}).then(()=>toast('Commande enregistrée','ok')).catch(()=>toast('URL en attente d’envoi','err'));
    window.dispatchEvent(new Event('yaya:data-refreshed'));
  },40);
}

function updateTitle(modal){
  const title=modal.querySelector('#ycnEditTitle'),product=modal.querySelector('#ycnProduit');
  if(!title||!product)return;
  title.textContent=txt(product.value)||(activeId?'Commande':'Nouvelle commande');
}
function ensureUrlField(modal){
  let field=modal.querySelector('.ycn-url-v5');
  if(field)return field.querySelector('#ycnUrlV5');
  const notes=modal.querySelector('#ycnNotes');if(!notes)return null;
  const noteLabel=notes.closest('.ycn-field');if(!noteLabel)return null;
  field=document.createElement('label');field.className='ycn-field full ycn-url-v5';
  field.innerHTML='<span>URL</span><input id="ycnUrlV5" type="url" inputmode="url" placeholder="https://…" autocomplete="url">';
  noteLabel.parentNode.insertBefore(field,noteLabel);
  return field.querySelector('#ycnUrlV5');
}
function currentSnapshot(modal){
  return {
    id:activeId,
    produit:txt(modal.querySelector('#ycnProduit')?.value),
    qte:txt(modal.querySelector('#ycnQte')?.value),
    fournisseur:txt(modal.querySelector('#ycnFournisseur')?.value),
    responsable:txt(modal.querySelector('#ycnResponsable')?.value),
    status:txt(modal.querySelector('#ycnStatus')?.value),
    notes:txt(modal.querySelector('#ycnNotes')?.value)
  };
}
function removeRowVisual(id){
  const row=document.querySelector('.yaya-cmd-native-root .ycn-row[data-ycn-row="'+CSS.escape(String(id))+'"]');
  if(!row)return;
  const group=row.closest('.ycn-group');
  row.remove();
  if(group){
    const count=group.querySelector('.ycn-count');if(count)count.textContent=String(Math.max(0,(Number(count.textContent)||1)-1));
    const keys=['choice','todo','ordered','received'];const key=String(group.dataset.ycnGroup||'');const idx=keys.indexOf(key);
    if(idx>=0){const kpis=document.querySelectorAll('.yaya-cmd-native-root .ycn-kpi .ycn-kpi-num');const n=kpis[idx];if(n)n.textContent=String(Math.max(0,(Number(n.textContent)||1)-1));}
  }
}
function deleteOrder(modal){
  const id=String(activeId||'');if(!id)return;
  const o=findOrder(id);const label=txt(o?.produit)||txt(modal.querySelector('#ycnProduit')?.value)||'cette commande';
  if(!confirm('Supprimer « '+label+' » ?'))return;
  const state=readState();writeOrders((state.orders||[]).filter(x=>String(x?.id||'')!==id));removePending(id);addTombstone(id);
  removeRowVisual(id);modal.classList.remove('show');activeId='';
  toast('Commande supprimée — serveur en arrière-plan');
  post({action:'delete',id}).then(()=>toast('Commande supprimée','ok')).catch(()=>toast('Suppression serveur à contrôler','err'));
}
function addPieces(idOverride){
  const id=String(idOverride||activeId||'');
  if(!id){toast('Commande non enregistrée','err');return;}
  if(typeof window.yayaCommandeAddPieces==='function'){window.yayaCommandeAddPieces(id);return;}
  toast('Ajout de pièce indisponible — recharge Yaya','err');
}
function openPieces(idOverride){
  const id=String(idOverride||activeId||'');
  if(!id){toast('Commande non enregistrée','err');return;}
  if(typeof window.yayaCommandeOpenPieces==='function'){window.yayaCommandeOpenPieces(id);return;}
  toast('Visualisation des pièces indisponible — recharge Yaya','err');
}
function saveThenAddPieces(modal){
  const form=modal.querySelector('#ycnEditForm');if(!form)return;
  if(activeId){addPieces(activeId);return;}
  const snapshot=currentSnapshot(modal);
  if(!snapshot.produit){modal.querySelector('#ycnProduit')?.focus();return;}
  const beforeIds=new Set((readState().orders||[]).map(o=>String(o?.id||'')));
  form.requestSubmit();
  let attempt=0;
  const waitCreated=()=>{
    const created=matchNewOrder(snapshot,beforeIds);
    if(created?.id){activeId=String(created.id);setTimeout(()=>addPieces(activeId),30);return;}
    if(attempt++<20)setTimeout(waitCreated,50);else toast('Commande enregistrée — ouvre-la pour ajouter les pièces','err');
  };
  setTimeout(waitCreated,30);
}

function enhanceModal(){
  scheduled=false;injectStyle();
  const modal=document.getElementById('ycnEditModal');if(!modal||!modal.classList.contains('show'))return;
  const product=modal.querySelector('#ycnProduit'),form=modal.querySelector('#ycnEditForm');if(!product||!form)return;
  const urlInput=ensureUrlField(modal);const o=activeId?findOrder(activeId):null;
  const modeKey=String(activeId||'NEW');
  const urlField=modal.querySelector('.ycn-url-v5');if(urlField)urlField.style.removeProperty('display');
  if(urlInput && urlInput.dataset.loadedFor!==modeKey){
    urlInput.value=o?orderUrl(o):'';urlInput.dataset.loadedFor=modeKey;
  }
  updateTitle(modal);
  if(!product.dataset.ycnTitleV5){product.addEventListener('input',()=>updateTitle(modal));product.dataset.ycnTitleV5='1';}
  const actions=modal.querySelector('.ycn-dialog-actions');if(!actions)return;
  const save=actions.querySelector('button[type="submit"]');if(save){save.classList.add('ycn-save-v5');save.textContent='Enregistrer';}
  let del=actions.querySelector('.ycn-delete-v5');
  if(!del){del=document.createElement('button');del.type='button';del.className='ycn-btn ycn-delete-v5';del.textContent='Supprimer';actions.insertBefore(del,actions.firstChild);del.onclick=()=>deleteOrder(modal);}
  del.style.display=activeId?'inline-flex':'none';
  let pieces=actions.querySelector('.ycn-pieces-v5');
  if(!pieces){pieces=document.createElement('button');pieces.type='button';pieces.className='ycn-btn ycn-pieces-v5';pieces.textContent='Gérer les pièces';const cancel=actions.querySelector('[data-ycn-close="edit"]');actions.insertBefore(pieces,cancel||save);pieces.onclick=()=>openPieces(activeId);}
  pieces.style.display=activeId?'inline-flex':'none';

  let doc=actions.querySelector('.ycn-doc-v5');
  if(!doc){doc=document.createElement('button');doc.type='button';doc.className='ycn-btn ycn-doc-v5';doc.textContent='Ajouter une pièce';const cancel=actions.querySelector('[data-ycn-close="edit"]');actions.insertBefore(doc,cancel||save);doc.onclick=()=>saveThenAddPieces(modal);}
  doc.style.display='inline-flex';
  doc.textContent='Ajouter une pièce';
  if(!form.dataset.ycnUrlSubmitV5){
    form.addEventListener('submit',()=>{
      const snapshot=currentSnapshot(modal),url=txt(modal.querySelector('#ycnUrlV5')?.value);
      persistUrlAfterCore(snapshot,url);
    },true);
    form.dataset.ycnUrlSubmitV5='1';
  }
}
function hideTombstones(){
  document.querySelectorAll('.yaya-cmd-native-root .ycn-row[data-ycn-row]').forEach(row=>{if(isTombstone(row.dataset.ycnRow))row.style.display='none';});
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{enhanceModal();hideTombstones();});}

injectStyle();schedule();
const obs=new MutationObserver(records=>{
  for(const r of records){
    const target=r.target?.nodeType===1?r.target:null;
    if(target?.id==='ycnEditModal'||target?.closest?.('#ycnEditModal')||[...r.addedNodes].some(n=>n?.nodeType===1&&(n.id==='ycnEditModal'||n.matches?.('.ycn-row')||n.querySelector?.('#ycnEditModal,.ycn-row')))){schedule();break;}
  }
});
obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('yaya:data-refreshed',schedule);
window.__YAYA_COMMANDES_EDIT_MODAL_V5_VERSION='5.9-fast-typing';
})();
