(function(){
'use strict';
if(window.__YAYA_COMMANDES_EDIT_MODAL_V5)return;
window.__YAYA_COMMANDES_EDIT_MODAL_V5=true;

const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
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
  for(const key of CACHE_KEYS){
    try{const d=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(d?.orders))return d;}catch(_){ }
  }
  return {orders:[],documents:[]};
}
function findOrder(id){return (readState().orders||[]).find(o=>String(o?.id||'')===String(id||''))||null;}
function orderUrl(o){return txt(o?.url||o?.urlCommande||o?.url_commande||o?.lienUrl||o?.lien_url||o?.lien||o?.webUrl||o?.oneDriveWebUrl||o?.driveUrl||o?.dropboxUrl||'');}
function writeOrders(next){
  for(const key of CACHE_KEYS){
    try{
      const raw=localStorage.getItem(key);if(!raw)continue;
      const d=JSON.parse(raw);if(!Array.isArray(d?.orders))continue;
      d.orders=next;d.savedAt=Date.now();localStorage.setItem(key,JSON.stringify(d));
    }catch(_){ }
  }
}
function updateOrderInCaches(order){
  if(!order?.id)return;
  for(const key of CACHE_KEYS){
    try{
      const raw=localStorage.getItem(key);if(!raw)continue;
      const d=JSON.parse(raw);if(!Array.isArray(d?.orders))continue;
      const i=d.orders.findIndex(o=>String(o?.id||'')===String(order.id));
      if(i>=0)d.orders[i]={...d.orders[i],...order};else d.orders.push(order);
      d.savedAt=Date.now();localStorage.setItem(key,JSON.stringify(d));
    }catch(_){ }
  }
}
function removePending(id){
  try{const p=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');if(Array.isArray(p))localStorage.setItem(PENDING_KEY,JSON.stringify(p.filter(x=>String(x?.id||'')!==String(id))));}catch(_){ }
}
function tombstones(){try{const a=JSON.parse(sessionStorage.getItem(TOMBSTONE_KEY)||'[]');return Array.isArray(a)?a:[];}catch(_){return [];}}
function addTombstone(id){const a=tombstones().filter(x=>String(x)!==String(id));a.push(String(id));try{sessionStorage.setItem(TOMBSTONE_KEY,JSON.stringify(a));}catch(_){}}
function isTombstone(id){return tombstones().some(x=>String(x)===String(id));}
function post(data){const b=new URLSearchParams();Object.entries(data||{}).forEach(([k,v])=>b.append(k,v==null?'':String(v)));return fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:b});}

function injectStyle(){
  if(document.getElementById('ycn-edit-modal-v5-style'))return;
  const s=document.createElement('style');s.id='ycn-edit-modal-v5-style';s.textContent=`
    #ycnEditModal .ycn-dialog-actions{display:flex!important;gap:10px!important;align-items:center!important}
    #ycnEditModal .ycn-save-v5{background:#0f4f8d!important;border:1px solid #0f4f8d!important;color:#fff!important;opacity:1!important;box-shadow:0 1px 3px rgba(15,79,141,.25)!important;font-weight:850!important}
    #ycnEditModal .ycn-save-v5:disabled{background:#8eb2d6!important;border-color:#8eb2d6!important;color:#fff!important;opacity:1!important}
    #ycnEditModal .ycn-delete-v5{margin-right:auto!important;background:#fff2f1!important;border:1px solid #e9a39e!important;color:#b42318!important;font-weight:850!important}
    #ycnEditModal .ycn-url-v5 input{width:100%!important}
  `;document.head.appendChild(s);
}

function captureRow(e){
  const add=e.target?.closest?.('[data-ycn-add]');if(add){activeId='';return;}
  const row=e.target?.closest?.('.ycn-row[data-ycn-row]');if(row)activeId=String(row.dataset.ycnRow||'');
}
document.addEventListener('pointerdown',captureRow,true);

function matchNewOrder(snapshot){
  const list=readState().orders||[];
  if(snapshot.id){const exact=list.find(o=>String(o?.id||'')===String(snapshot.id));if(exact)return exact;}
  const candidates=list.filter(o=>
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
  title.textContent=txt(product.value)||'Nouvelle commande';
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

function enhanceModal(){
  scheduled=false;injectStyle();
  const modal=document.getElementById('ycnEditModal');if(!modal||!modal.classList.contains('show'))return;
  const product=modal.querySelector('#ycnProduit'),form=modal.querySelector('#ycnEditForm');if(!product||!form)return;
  const urlInput=ensureUrlField(modal);const o=activeId?findOrder(activeId):null;
  if(urlInput && urlInput.dataset.loadedFor!==String(activeId||'NEW')){
    urlInput.value=o?orderUrl(o):'';urlInput.dataset.loadedFor=String(activeId||'NEW');
  }
  updateTitle(modal);
  if(!product.dataset.ycnTitleV5){product.addEventListener('input',()=>updateTitle(modal));product.dataset.ycnTitleV5='1';}
  const actions=modal.querySelector('.ycn-dialog-actions');if(!actions)return;
  const save=actions.querySelector('button[type="submit"]');if(save)save.classList.add('ycn-save-v5');
  let del=actions.querySelector('.ycn-delete-v5');
  if(!del){del=document.createElement('button');del.type='button';del.className='ycn-btn ycn-delete-v5';del.textContent='Supprimer';actions.insertBefore(del,actions.firstChild);del.onclick=()=>deleteOrder(modal);}
  del.style.display=activeId?'inline-flex':'none';
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
window.__YAYA_COMMANDES_EDIT_MODAL_V5_VERSION='5.0-product-url-save-delete';
})();