(function(){
'use strict';
if(window.__YAYA_COMMANDES_LINE_V4)return;
window.__YAYA_COMMANDES_LINE_V4=true;

const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
const MODAL_ID='ycnIframePiecesV4';
let currentOrderId='';
let currentPieceIndex=0;
let scheduled=false;

function readState(){
  for(const key of CACHE_KEYS){
    try{const raw=localStorage.getItem(key);if(!raw)continue;const d=JSON.parse(raw);if(Array.isArray(d?.orders))return d;}catch(_){ }
  }
  return {orders:[],documents:[]};
}
function orderById(id){return (readState().orders||[]).find(o=>String(o?.id||'')===String(id||''))||null;}
function docsFor(id){return (readState().documents||[]).filter(d=>String(d?.commande_id||'')===String(id||''));}
function docUrl(d){return String(d?.url_pdf||d?.url||d?.lien||d?.webUrl||d?.oneDriveWebUrl||'').trim();}
function orderUrl(o){return String(o?.lien||o?.url||o?.urlCommande||o?.url_commande||o?.lienUrl||o?.lien_url||o?.webUrl||o?.oneDriveWebUrl||o?.driveUrl||o?.dropboxUrl||'').trim();}
function iframeUrl(url){
  url=String(url||'').trim();if(!url)return '';
  const d=url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if(d)return 'https://drive.google.com/file/d/'+encodeURIComponent(d[1])+'/preview';
  try{const u=new URL(url);if(/(^|\.)dropbox\.com$/i.test(u.hostname)){u.searchParams.delete('dl');u.searchParams.set('raw','1');return u.toString();}}catch(_){ }
  return url;
}
function writeDocuments(next){
  for(const key of CACHE_KEYS){
    try{const raw=localStorage.getItem(key);if(!raw)continue;const d=JSON.parse(raw);if(!Array.isArray(d?.orders))continue;d.documents=Array.isArray(next)?next:[];d.savedAt=Date.now();localStorage.setItem(key,JSON.stringify(d));}catch(_){ }
  }
}
function toast(text,kind=''){
  let el=document.getElementById('ycnToast');
  if(!el){el=document.createElement('div');el.id='ycnToast';el.className='ycn-toast';document.body.appendChild(el);}
  el.textContent=text||'';el.className='ycn-toast show'+(kind?' '+kind:'');clearTimeout(el.__t);el.__t=setTimeout(()=>el.className='ycn-toast',3200);
}
function postDelete(id){
  const body=new URLSearchParams({action:'document_delete',id:String(id||'')});
  return fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body});
}

function injectStyle(){
  if(document.getElementById('ycn-line-v4-style'))return;
  const s=document.createElement('style');s.id='ycn-line-v4-style';s.textContent=`
    .yaya-cmd-native-root .ycn-row{cursor:pointer!important}
    .yaya-cmd-native-root .ycn-row-detail,.yaya-cmd-native-root .ycn-row.open .ycn-row-detail{display:none!important}
    .yaya-cmd-native-root .ycn-row-toggle{display:none!important}
    .yaya-cmd-native-root .ycn-row-top{display:grid!important;grid-template-columns:minmax(220px,1.65fr) minmax(170px,1.15fr) minmax(175px,.9fr) auto auto!important;gap:10px!important;align-items:center!important;padding:8px 12px!important}
    .yaya-cmd-native-root .ycn-row-summary{display:contents!important}
    .yaya-cmd-native-root .ycn-row-summary .ycn-qte,.yaya-cmd-native-root .ycn-row-summary .ycn-resp{display:none!important}
    .yaya-cmd-native-root .ycn-row-summary strong,.yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    .yaya-cmd-native-root .ycn-v4-status{width:100%!important;height:34px!important;border:1px solid #cbd7e4!important;border-radius:8px!important;background:#fff!important;color:#17324f!important;padding:0 9px!important;font:inherit!important;font-size:11.5px!important;font-weight:800!important;cursor:pointer!important}
    .yaya-cmd-native-root .ycn-v4-pieces,.yaya-cmd-native-root .ycn-v4-url{height:34px!important;border:1px solid #cbd7e4!important;border-radius:8px!important;background:#fff!important;padding:0 11px!important;font:inherit!important;font-size:11px!important;font-weight:850!important;white-space:nowrap!important;cursor:pointer!important}
    .yaya-cmd-native-root .ycn-v4-pieces{color:#1f5f9f!important}.yaya-cmd-native-root .ycn-v4-pieces.has{background:#edf7ff!important;border-color:#b9d8f4!important}
    .yaya-cmd-native-root .ycn-v4-url{color:#17653a!important;background:#eef9f1!important;border-color:#b9dfc5!important}
    .yaya-cmd-native-root .ycn-v4-url:disabled{opacity:.35!important;background:#f6f7f9!important;color:#708095!important;border-color:#d6dee7!important;cursor:default!important}
    #${MODAL_ID}{position:fixed;inset:0;z-index:33000;display:none;align-items:center;justify-content:center;padding:12px;background:rgba(12,27,47,.58)}
    #${MODAL_ID}.show{display:flex}
    #${MODAL_ID} .v4-card{width:min(1120px,calc(100vw - 24px));height:min(88dvh,820px);display:grid;grid-template-rows:auto auto minmax(0,1fr);background:#fff;border-radius:14px;box-shadow:0 28px 90px rgba(8,25,46,.34);overflow:hidden}
    #${MODAL_ID} .v4-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;border-bottom:1px solid #dfe6ee;color:#162d49}
    #${MODAL_ID} .v4-head strong{font-size:15px}#${MODAL_ID} .v4-close{border:1px solid #cfd9e6;border-radius:8px;background:#fff;color:#334155;min-height:34px;padding:0 12px;font-weight:800;cursor:pointer}
    #${MODAL_ID} .v4-tabs{display:flex;gap:8px;align-items:center;overflow-x:auto;padding:9px 12px;border-bottom:1px solid #e6ebf1;background:#f8fafc}
    #${MODAL_ID} .v4-piece{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto}
    #${MODAL_ID} .v4-view,#${MODAL_ID} .v4-del{min-height:32px;border-radius:7px;font:inherit;font-size:11px;font-weight:800;cursor:pointer}
    #${MODAL_ID} .v4-view{border:1px solid #c8d8e8;background:#fff;color:#205f9d;padding:0 11px}#${MODAL_ID} .v4-view.on{background:#eaf4ff;border-color:#90bce6}
    #${MODAL_ID} .v4-del{width:32px;border:1px solid #efc3c3;background:#fff5f5;color:#b42318}
    #${MODAL_ID} .v4-stage{min-height:0;background:#eef2f6}#${MODAL_ID} iframe{display:block;width:100%;height:100%;border:0;background:#fff}
    #${MODAL_ID} .v4-empty{height:100%;display:flex;align-items:center;justify-content:center;color:#708095;font-size:13px;font-weight:700}
    @media(max-width:760px){.yaya-cmd-native-root .ycn-row-top{grid-template-columns:minmax(0,1fr) minmax(125px,.9fr) auto!important}.yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:none!important}.yaya-cmd-native-root .ycn-v4-url{display:none!important}#${MODAL_ID}{padding:4px}#${MODAL_ID} .v4-card{width:calc(100vw - 8px);height:calc(100dvh - 8px);border-radius:8px}}
  `;document.head.appendChild(s);
}

function ensureModal(){
  let m=document.getElementById(MODAL_ID);if(m)return m;
  m=document.createElement('div');m.id=MODAL_ID;m.setAttribute('aria-hidden','true');
  m.innerHTML='<div class="v4-card" role="dialog" aria-modal="true"><div class="v4-head"><strong>Visualisation des pièces</strong><button type="button" class="v4-close">Fermer</button></div><div class="v4-tabs"></div><div class="v4-stage"></div></div>';
  document.body.appendChild(m);m.querySelector('.v4-close').onclick=closeModal;m.onclick=e=>{if(e.target===m)closeModal();};return m;
}
function closeModal(){const m=document.getElementById(MODAL_ID);if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');const f=m.querySelector('iframe');if(f)f.src='about:blank';}currentOrderId='';}
function renderModal(){
  const m=ensureModal(),tabs=m.querySelector('.v4-tabs'),stage=m.querySelector('.v4-stage'),list=docsFor(currentOrderId);
  tabs.innerHTML='';stage.innerHTML='';
  if(!list.length){tabs.innerHTML='<span style="font-size:12px;color:#718096">Aucune pièce</span>';stage.innerHTML='<div class="v4-empty">Aucune pièce jointe.</div>';return;}
  currentPieceIndex=Math.max(0,Math.min(currentPieceIndex,list.length-1));
  list.forEach((d,i)=>{
    const wrap=document.createElement('span');wrap.className='v4-piece';
    const view=document.createElement('button');view.type='button';view.className='v4-view'+(i===currentPieceIndex?' on':'');view.textContent='Pièce '+(i+1);view.title=String(d?.nom_fichier||d?.type||('Pièce '+(i+1)));view.onclick=()=>{currentPieceIndex=i;renderModal();};
    const del=document.createElement('button');del.type='button';del.className='v4-del';del.textContent='×';del.title='Supprimer cette pièce';del.onclick=()=>deletePiece(d);
    wrap.append(view,del);tabs.appendChild(wrap);
  });
  const d=list[currentPieceIndex],url=docUrl(d);
  if(!url){stage.innerHTML='<div class="v4-empty">Lien de cette pièce introuvable.</div>';return;}
  const iframe=document.createElement('iframe');iframe.src=iframeUrl(url);iframe.title=String(d?.nom_fichier||('Pièce '+(currentPieceIndex+1)));iframe.loading='eager';stage.appendChild(iframe);
}
function openModal(id){currentOrderId=String(id||'');currentPieceIndex=0;const m=ensureModal();renderModal();m.classList.add('show');m.setAttribute('aria-hidden','false');}
function deletePiece(d){
  if(!d?.id||!confirm('Supprimer cette pièce ?'))return;
  const state=readState(),next=(state.documents||[]).filter(x=>String(x?.id||'')!==String(d.id));writeDocuments(next);renderModal();
  try{window.YayaCommandesNativeEmbed?.render();}catch(_){ }
  schedule();toast('Pièce supprimée localement — serveur en arrière-plan');
  postDelete(d.id).then(()=>toast('Pièce supprimée','ok')).catch(()=>toast('Suppression serveur à contrôler','err'));
}

function sanitize(top){top.querySelectorAll('.ycn-top-status,.ycn-top-docs,.ycn-top-note,.ycn-row-direct-actions,.ycn-v4-status,.ycn-v4-pieces,.ycn-v4-url').forEach(x=>x.remove());}
function enhance(row){
  const id=String(row?.dataset?.ycnRow||'');if(!id)return;
  const top=row.querySelector('.ycn-row-top'),edit=row.querySelector('[data-ycn-edit]'),hiddenStatus=row.querySelector('.ycn-row-detail [data-ycn-status]');if(!top||!edit||!hiddenStatus)return;
  sanitize(top);row.classList.remove('open');
  const status=hiddenStatus.cloneNode(true);status.removeAttribute('data-ycn-status');status.className='ycn-v4-status';status.value=hiddenStatus.value;status.onclick=e=>e.stopPropagation();status.onchange=e=>{e.stopPropagation();hiddenStatus.value=status.value;hiddenStatus.dispatchEvent(new Event('change',{bubbles:true}));};
  const n=docsFor(id).length,pieces=document.createElement('button');pieces.type='button';pieces.className='ycn-v4-pieces'+(n?' has':'');pieces.textContent='Pièces '+n;pieces.onclick=e=>{e.preventDefault();e.stopPropagation();openModal(id);};
  const o=orderById(id),url=orderUrl(o),link=document.createElement('button');link.type='button';link.className='ycn-v4-url';link.textContent='URL ↗';link.disabled=!url;link.onclick=e=>{e.preventDefault();e.stopPropagation();if(url)window.open(url,'_blank','noopener');};
  top.append(status,pieces,link);
  if(!top.dataset.ycnV4Edit){top.dataset.ycnV4Edit='1';top.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea,label'))return;e.preventDefault();e.stopPropagation();edit.click();});}
  row.dataset.ycnLineV4='1';
}
function enhanceAll(){scheduled=false;injectStyle();document.querySelectorAll('.yaya-cmd-native-root .ycn-row[data-ycn-row]').forEach(enhance);}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhanceAll);}

injectStyle();ensureModal();schedule();
const obs=new MutationObserver(records=>{
  for(const r of records){
    const target=r.target?.nodeType===1?r.target:null;
    if(target?.closest?.('#'+MODAL_ID))continue;
    if([...r.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('.ycn-row,.ycn-row-direct-actions,.ycn-top-status,.ycn-top-docs,.ycn-top-note')||n.querySelector?.('.ycn-row,.ycn-row-direct-actions')))){schedule();break;}
  }
});
obs.observe(document.body,{childList:true,subtree:true});
window.addEventListener('yaya:data-refreshed',schedule);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById(MODAL_ID)?.classList.contains('show'))closeModal();});
window.__YAYA_COMMANDES_LINE_V4_VERSION='4.0-product-supplier-status-pieces-iframe-url';
})();