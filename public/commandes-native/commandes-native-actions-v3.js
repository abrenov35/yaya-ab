(function(){
'use strict';
if(window.__YAYA_COMMANDES_NATIVE_ACTIONS_V3)return;
window.__YAYA_COMMANDES_NATIVE_ACTIONS_V3=true;

const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
let currentOrderId='';
let scheduled=false;

function injectStyle(){
 if(document.getElementById('ycn-actions-v3-style'))return;
 const s=document.createElement('style');
 s.id='ycn-actions-v3-style';
 s.textContent=`
 .ycn-row{cursor:pointer!important}
 .ycn-row-toggle{display:none!important}
 .ycn-row-detail{display:none!important}
 .ycn-row-top{grid-template-columns:minmax(180px,1.5fr) minmax(120px,1fr) 90px 110px auto!important}
 .ycn-row-direct-actions{display:flex!important;gap:7px!important;align-items:center!important;justify-content:flex-end!important;white-space:nowrap!important}
 .ycn-direct-btn{border:1px solid #cfd9e6!important;background:#fff!important;color:#1f5f9f!important;border-radius:8px!important;min-height:34px!important;padding:0 10px!important;font:inherit!important;font-size:11px!important;font-weight:850!important;cursor:pointer!important}
 .ycn-direct-btn.has{background:#edf6ff!important;border-color:#b9d8f4!important}
 .ycn-direct-btn.link{color:#17653a!important;border-color:#b9dfc5!important;background:#eef9f1!important}
 #ycnPiecesModal{position:fixed;inset:0;z-index:32000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(12,27,47,.54)}
 #ycnPiecesModal.show{display:flex}
 #ycnPiecesModal .ycn-pieces-card{width:min(620px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:15px;box-shadow:0 26px 80px rgba(8,25,46,.3);padding:18px}
 #ycnPiecesModal .ycn-pieces-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
 #ycnPiecesModal .ycn-pieces-head h3{margin:0;font-size:19px;color:#14213d}
 #ycnPiecesModal .ycn-pieces-sub{margin-top:4px;color:#718096;font-size:11px;font-weight:700}
 #ycnPiecesModal .ycn-pieces-close{border:0;background:#f3f5f8;color:#32445f;width:34px;height:34px;border-radius:8px;font-size:21px;cursor:pointer}
 #ycnPiecesList{display:grid;gap:8px}
 .ycn-piece-line{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;border:1px solid #e2e8f0;border-radius:9px;padding:9px 10px}
 .ycn-piece-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#24364f;font-size:12px;font-weight:800}
 .ycn-piece-view,.ycn-piece-del{border:1px solid #d5dee9;background:#fff;border-radius:7px;min-height:32px;padding:0 9px;font-size:10.5px;font-weight:800;cursor:pointer}
 .ycn-piece-view{color:#1f5cc6}
 .ycn-piece-del{color:#b52d44;border-color:#efcbd3}
 .ycn-pieces-empty{padding:14px 6px;color:#7a879c;font-size:12px}
 @media(max-width:900px){.ycn-row-top{grid-template-columns:minmax(0,1fr) auto!important}.ycn-row-top .ycn-supplier,.ycn-row-top .ycn-qte,.ycn-row-top .ycn-resp{display:none!important}.ycn-row-direct-actions{justify-content:flex-end}.ycn-direct-btn{padding:0 8px!important}}
 @media(max-width:560px){.ycn-row-top{grid-template-columns:1fr!important;gap:7px!important}.ycn-row-direct-actions{justify-content:flex-start!important;flex-wrap:wrap!important}.ycn-piece-line{grid-template-columns:1fr auto}.ycn-piece-del{grid-column:2}}
 `;
 document.head.appendChild(s);
}

function readState(){
 for(const key of CACHE_KEYS){
  try{const raw=localStorage.getItem(key);if(!raw)continue;const d=JSON.parse(raw);if(Array.isArray(d?.orders))return d;}catch(_){ }
 }
 return {orders:[],documents:[]};
}
function orders(){const a=readState().orders;return Array.isArray(a)?a:[];}
function documents(){const a=readState().documents;return Array.isArray(a)?a:[];}
function orderById(id){return orders().find(o=>String(o?.id||'')===String(id||''))||null;}
function docsFor(id){return documents().filter(d=>String(d?.commande_id||'')===String(id||''));}
function docUrl(d){return String(d?.url_pdf||d?.url||d?.lien||d?.webUrl||d?.oneDriveWebUrl||'').trim();}
function orderUrl(o){return String(o?.lien||o?.url||o?.urlCommande||o?.url_commande||o?.lienUrl||o?.lien_url||o?.webUrl||o?.oneDriveWebUrl||o?.driveUrl||o?.dropboxUrl||'').trim();}

function writeDocuments(next){
 for(const key of CACHE_KEYS){
  try{const raw=localStorage.getItem(key);if(!raw)continue;const d=JSON.parse(raw);if(!Array.isArray(d?.orders))continue;d.documents=Array.isArray(next)?next:[];d.savedAt=Date.now();localStorage.setItem(key,JSON.stringify(d));}catch(_){ }
 }
}
function postDelete(id){
 const body=new URLSearchParams({action:'document_delete',id:String(id||'')});
 return fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body});
}
function toast(text,kind=''){
 let el=document.getElementById('ycnToast');
 if(!el){el=document.createElement('div');el.id='ycnToast';el.className='ycn-toast';document.body.appendChild(el);}
 el.textContent=text||'';el.className='ycn-toast show'+(kind?' '+kind:'');clearTimeout(el.__t);el.__t=setTimeout(()=>el.className='ycn-toast',3500);
}

function ensureModal(){
 let m=document.getElementById('ycnPiecesModal');
 if(m)return m;
 m=document.createElement('div');m.id='ycnPiecesModal';m.setAttribute('aria-hidden','true');
 m.innerHTML='<div class="ycn-pieces-card" role="dialog" aria-modal="true" aria-labelledby="ycnPiecesTitle"><div class="ycn-pieces-head"><div><h3 id="ycnPiecesTitle">Pièces jointes</h3><div id="ycnPiecesSub" class="ycn-pieces-sub"></div></div><button type="button" class="ycn-pieces-close">×</button></div><div id="ycnPiecesList"></div></div>';
 document.body.appendChild(m);
 m.querySelector('.ycn-pieces-close').onclick=closePieces;
 m.onclick=e=>{if(e.target===m)closePieces();};
 return m;
}
function openPieces(id){
 currentOrderId=String(id||'');
 const o=orderById(currentOrderId);if(!o)return;
 const m=ensureModal();
 document.getElementById('ycnPiecesSub').textContent=[o.chantier,o.produit||o.designation].filter(Boolean).join(' · ');
 renderPieces();m.classList.add('show');m.setAttribute('aria-hidden','false');
}
function closePieces(){const m=document.getElementById('ycnPiecesModal');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');}currentOrderId='';}
function renderPieces(){
 const box=document.getElementById('ycnPiecesList');if(!box)return;
 const list=docsFor(currentOrderId);
 if(!list.length){box.innerHTML='<div class="ycn-pieces-empty">Aucune pièce jointe.</div>';return;}
 box.innerHTML='';
 list.forEach((d,i)=>{
  const row=document.createElement('div');row.className='ycn-piece-line';
  const name=document.createElement('div');name.className='ycn-piece-name';name.textContent=(d?.nom_fichier||d?.type||('Pièce '+(i+1)));
  const view=document.createElement('button');view.type='button';view.className='ycn-piece-view';view.textContent='Visualiser '+(i+1);view.onclick=e=>{e.stopPropagation();const url=docUrl(d);if(!url){toast('Lien de la pièce introuvable','err');return;}window.__yayaPreviewCommandeId=String(currentOrderId||'');window.__yayaPreviewCommandePieceId=String(d?.id||'');if(typeof window.voirPiece==='function')window.voirPiece(url);else window.open(url,'_blank','noopener');};
  const del=document.createElement('button');del.type='button';del.className='ycn-piece-del';del.textContent='Supprimer';del.onclick=e=>{e.stopPropagation();deletePiece(d);};
  row.append(name,view,del);box.appendChild(row);
 });
}
function deletePiece(d){
 if(!d?.id||!confirm('Supprimer cette pièce ?'))return;
 const next=documents().filter(x=>String(x?.id||'')!==String(d.id));
 writeDocuments(next);
 renderPieces();
 try{window.YayaCommandesNativeEmbed?.render();}catch(_){ }
 scheduleEnhance();
 toast('Pièce supprimée localement — suppression serveur en arrière-plan');
 postDelete(d.id).then(()=>toast('Pièce supprimée','ok')).catch(()=>toast('Suppression serveur à contrôler','err'));
}

function addActions(row){
 const id=String(row?.dataset?.ycnRow||'');if(!id)return;
 const top=row.querySelector('.ycn-row-top');if(!top)return;
 let actions=top.querySelector('.ycn-row-direct-actions');
 if(!actions){actions=document.createElement('div');actions.className='ycn-row-direct-actions';top.appendChild(actions);}
 const o=orderById(id);if(!o)return;
 const n=docsFor(id).length;
 let pieces=actions.querySelector('[data-ycn-pieces]');
 if(!pieces){pieces=document.createElement('button');pieces.type='button';pieces.className='ycn-direct-btn';pieces.dataset.ycnPieces=id;actions.appendChild(pieces);pieces.onclick=e=>{e.preventDefault();e.stopPropagation();openPieces(id);};}
 pieces.textContent='Pièces'+(n?' '+n:'');pieces.classList.toggle('has',n>0);
 const link=orderUrl(o);
 let linkBtn=actions.querySelector('[data-ycn-url]');
 if(link){
  if(!linkBtn){linkBtn=document.createElement('button');linkBtn.type='button';linkBtn.className='ycn-direct-btn link';linkBtn.dataset.ycnUrl=id;actions.appendChild(linkBtn);}
  linkBtn.textContent='Lien ↗';linkBtn.onclick=e=>{e.preventDefault();e.stopPropagation();window.open(link,'_blank','noopener');};linkBtn.hidden=false;
 }else if(linkBtn){linkBtn.hidden=true;}
 if(!top.dataset.ycnRowEditBound){
  top.dataset.ycnRowEditBound='1';
  top.addEventListener('click',e=>{
   if(e.target.closest('button,a,input,select,textarea,label'))return;
   const edit=row.querySelector('[data-ycn-edit]');if(edit){e.preventDefault();edit.click();}
  });
 }
}
function enhanceAll(){scheduled=false;injectStyle();document.querySelectorAll('.yaya-cmd-native-root .ycn-row[data-ycn-row]').forEach(addActions);}
function scheduleEnhance(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhanceAll);}

injectStyle();ensureModal();scheduleEnhance();
const obs=new MutationObserver(records=>{
 for(const r of records){if([...r.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('.ycn-row,.yaya-cmd-native-root')||n.querySelector?.('.ycn-row')))){scheduleEnhance();break;}}
});
obs.observe(document.body,{childList:true,subtree:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('ycnPiecesModal')?.classList.contains('show'))closePieces();});
window.__YAYA_COMMANDES_NATIVE_ACTIONS_V3_VERSION='3.0-pieces-preview-url';
})();