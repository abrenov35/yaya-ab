(function(){
'use strict';
if(window.__YAYA_COMMANDES_CREATE_FOLLOWUP_V6)return;
window.__YAYA_COMMANDES_CREATE_FOLLOWUP_V6=true;

const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
const MODAL_ID='ycnCreateFollowupV6';
let creating=false;
let pendingSnapshot=null;
let beforeIds=new Set();
let createdId='';
let scheduled=false;

const txt=v=>String(v==null?'':v).trim();

function readState(){
  for(const key of CACHE_KEYS){
    try{const d=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(d?.orders))return d;}catch(_){ }
  }
  return {orders:[],documents:[]};
}
function writeOrder(order){
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
function post(data){
  const b=new URLSearchParams();Object.entries(data||{}).forEach(([k,v])=>b.append(k,v==null?'':String(v)));
  return fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:b});
}
function toast(message,kind=''){
  let el=document.getElementById('ycnToast');
  if(!el){el=document.createElement('div');el.id='ycnToast';el.className='ycn-toast';document.body.appendChild(el);}
  el.textContent=message;el.className='ycn-toast show'+(kind?' '+kind:'');clearTimeout(el.__v6t);el.__v6t=setTimeout(()=>el.className='ycn-toast',3000);
}
function orderUrl(o){return txt(o?.url||o?.urlCommande||o?.url_commande||o?.lienUrl||o?.lien_url||o?.lien||'');}

function injectStyle(){
  if(document.getElementById('ycn-create-followup-v6-style'))return;
  const s=document.createElement('style');s.id='ycn-create-followup-v6-style';s.textContent=`
    #${MODAL_ID}{position:fixed;inset:0;z-index:32500;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(12,27,47,.55)}
    #${MODAL_ID}.show{display:flex}
    #${MODAL_ID} .v6-card{width:min(560px,100%);background:#fff;border-radius:16px;box-shadow:0 28px 85px rgba(8,25,46,.32);padding:20px}
    #${MODAL_ID} .v6-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
    #${MODAL_ID} .v6-head h3{margin:0;color:#24364f;font-size:20px;line-height:1.2}
    #${MODAL_ID} .v6-close{width:36px;height:36px;border:1px solid #9fb3c8;border-radius:9px;background:#fff;color:#263d59;font-size:22px;cursor:pointer}
    #${MODAL_ID} .v6-label{display:grid;gap:7px;color:#65758b;font-size:12px;font-weight:850}
    #${MODAL_ID} .v6-url{width:100%;height:44px;border:1px solid #c4d1df;border-radius:9px;background:#fff;padding:0 12px;color:#26384f;font:inherit;font-size:14px}
    #${MODAL_ID} .v6-help{margin:8px 0 0;color:#8491a3;font-size:11px}
    #${MODAL_ID} .v6-actions{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-wrap:wrap;margin-top:20px}
    #${MODAL_ID} .v6-btn{min-height:38px;border:1px solid #c7d4e2;border-radius:9px;background:#fff;color:#29445f;padding:0 13px;font:inherit;font-size:12px;font-weight:850;cursor:pointer}
    #${MODAL_ID} .v6-doc{background:#eef6ff;border-color:#b8d3ef;color:#0f4f8d}
    #${MODAL_ID} .v6-save{background:#0f4f8d;border-color:#0f4f8d;color:#fff}
    @media(max-width:560px){#${MODAL_ID}{padding:8px}#${MODAL_ID} .v6-card{padding:16px;border-radius:12px}#${MODAL_ID} .v6-actions .v6-btn{flex:1}}
  `;document.head.appendChild(s);
}
function ensureModal(){
  let m=document.getElementById(MODAL_ID);if(m)return m;
  m=document.createElement('div');m.id=MODAL_ID;m.innerHTML=`
    <div class="v6-card" role="dialog" aria-modal="true">
      <div class="v6-head"><h3 id="ycnFollowTitle">Commande enregistrée</h3><button type="button" class="v6-close">×</button></div>
      <label class="v6-label">URL<input id="ycnFollowUrl" class="v6-url" type="url" inputmode="url" placeholder="https://…" autocomplete="url"></label>
      <div class="v6-help">Tu peux ajouter une URL, une pièce jointe, ou terminer directement.</div>
      <div class="v6-actions">
        <button type="button" class="v6-btn v6-later">Plus tard</button>
        <button type="button" class="v6-btn v6-doc">Ajouter document</button>
        <button type="button" class="v6-btn v6-save">Enregistrer URL</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.querySelector('.v6-close').onclick=closeFollowup;
  m.querySelector('.v6-later').onclick=closeFollowup;
  m.querySelector('.v6-save').onclick=()=>{saveUrl();closeFollowup();};
  m.querySelector('.v6-doc').onclick=()=>{saveUrl();closeFollowup();setTimeout(openDocuments,20);};
  m.onclick=e=>{if(e.target===m)closeFollowup();};
  return m;
}
function closeFollowup(){document.getElementById(MODAL_ID)?.classList.remove('show');createdId='';}
function showFollowup(order){
  createdId=String(order?.id||'');if(!createdId)return;
  const m=ensureModal();m.querySelector('#ycnFollowTitle').textContent=txt(order?.produit||order?.designation)||'Commande enregistrée';
  m.querySelector('#ycnFollowUrl').value=orderUrl(order);m.classList.add('show');
  setTimeout(()=>m.querySelector('#ycnFollowUrl')?.focus(),20);
}
function saveUrl(){
  if(!createdId)return;
  const state=readState(),order=(state.orders||[]).find(o=>String(o?.id||'')===createdId);if(!order)return;
  const url=txt(document.getElementById('ycnFollowUrl')?.value),patched={...order,url,urlCommande:url,lienUrl:url};
  writeOrder(patched);
  try{window.YayaCommandesNativeEmbed?.render();}catch(_){ }
  post({action:'upsert',...patched}).then(()=>toast('URL enregistrée','ok')).catch(()=>toast('URL en attente d’envoi','err'));
}
function openDocuments(){
  if(!createdId)return;
  let row=document.querySelector('.yaya-cmd-native-root .ycn-row[data-ycn-row="'+CSS.escape(createdId)+'"]');
  let btn=row?.querySelector('[data-ycn-doc]');
  if(!btn){try{window.YayaCommandesNativeEmbed?.render();}catch(_){ }row=document.querySelector('.yaya-cmd-native-root .ycn-row[data-ycn-row="'+CSS.escape(createdId)+'"]');btn=row?.querySelector('[data-ycn-doc]');}
  if(btn){btn.click();return;}
  toast('Commande créée, mais module document indisponible','err');
}

function snapshotFrom(modal){return {
  produit:txt(modal.querySelector('#ycnProduit')?.value),
  qte:txt(modal.querySelector('#ycnQte')?.value),
  fournisseur:txt(modal.querySelector('#ycnFournisseur')?.value),
  responsable:txt(modal.querySelector('#ycnResponsable')?.value),
  status:txt(modal.querySelector('#ycnStatus')?.value),
  notes:txt(modal.querySelector('#ycnNotes')?.value)
};}
function sameSnapshot(o,s){return txt(o?.produit||o?.designation)===s.produit&&txt(o?.qte)===s.qte&&txt(o?.fournisseur)===s.fournisseur&&txt(o?.responsable)===s.responsable;}
function findCreated(){
  const list=readState().orders||[];
  const fresh=list.filter(o=>o?.id&&!beforeIds.has(String(o.id)));
  return fresh.find(o=>sameSnapshot(o,pendingSnapshot))||fresh[fresh.length-1]||null;
}
function waitCreated(attempt=0){
  const found=findCreated();
  if(found){creating=false;pendingSnapshot=null;showFollowup(found);return;}
  if(attempt<14)setTimeout(()=>waitCreated(attempt+1),45);
  else{creating=false;pendingSnapshot=null;toast('Commande créée — ajoute le document depuis la ligne','err');}
}

function applyCreateMode(){
  scheduled=false;
  const modal=document.getElementById('ycnEditModal');if(!modal||!modal.classList.contains('show'))return;
  const urlField=modal.querySelector('.ycn-url-v5');
  if(urlField)urlField.style.display=creating?'none':'grid';
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(applyCreateMode);}

document.addEventListener('pointerdown',e=>{
  if(e.target?.closest?.('[data-ycn-add]')){creating=true;createdId='';schedule();return;}
  if(e.target?.closest?.('.ycn-row[data-ycn-row]')){creating=false;schedule();}
},true);

document.addEventListener('submit',e=>{
  if(e.target?.id!=='ycnEditForm'||!creating)return;
  const modal=document.getElementById('ycnEditModal');if(!modal)return;
  pendingSnapshot=snapshotFrom(modal);
  beforeIds=new Set((readState().orders||[]).map(o=>String(o?.id||'')));
  setTimeout(()=>waitCreated(0),25);
},true);

injectStyle();ensureModal();schedule();
const obs=new MutationObserver(records=>{
  for(const r of records){
    const t=r.target?.nodeType===1?r.target:null;
    if(t?.id==='ycnEditModal'||t?.closest?.('#ycnEditModal')||[...r.addedNodes].some(n=>n?.nodeType===1&&(n.id==='ycnEditModal'||n.querySelector?.('#ycnEditModal')))){schedule();break;}
  }
});
obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.__YAYA_COMMANDES_CREATE_FOLLOWUP_V6_VERSION='6.0-create-then-url-doc';
})();