(function(){
'use strict';
if(window.__yayaChargePieceFastViewerV5)return;
window.__yayaChargePieceFastViewerV5=true;

const VIEWER_ID='yayaChargePieceFastViewer';
const STYLE_ID='yaya-charge-piece-fast-viewer-v5';

function txt(v){return String(v==null?'':v).trim();}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function driveId(u){
  const s=txt(u);
  let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if(m)return m[1];
  m=s.match(/[?&]id=([^&#]+)/i);
  return m?decodeURIComponent(m[1]):'';
}

function previewUrl(u){
  const raw=txt(u);
  const id=driveId(raw);
  if(id)return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
  try{
    const x=new URL(raw);
    if(/(?:^|\.)dropbox\.com$/i.test(x.hostname)){
      x.searchParams.delete('dl');
      x.searchParams.set('raw','1');
      return x.toString();
    }
    return x.toString();
  }catch(e){}
  return raw;
}

function downloadUrl(u){
  const raw=txt(u);
  const id=driveId(raw);
  if(id)return 'https://drive.usercontent.google.com/download?id='+encodeURIComponent(id)+'&export=download&confirm=t';
  try{
    const x=new URL(raw);
    if(/(?:^|\.)dropbox\.com$/i.test(x.hostname)){
      x.searchParams.delete('raw');
      x.searchParams.set('dl','1');
      return x.toString();
    }
    if(/(?:1drv\.ms|onedrive\.live\.com|sharepoint\.com)$/i.test(x.hostname)){
      x.searchParams.set('download','1');
      return x.toString();
    }
    return x.toString();
  }catch(e){}
  return raw;
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#${VIEWER_ID}{
  position:fixed!important;inset:0!important;z-index:2147483645!important;
  display:grid!important;grid-template-rows:46px minmax(0,1fr)!important;
  width:100vw!important;height:100dvh!important;background:#fff!important;
}
#${VIEWER_ID} .ycpf-head{
  display:flex!important;align-items:center!important;gap:8px!important;
  padding:5px 10px!important;border-bottom:1px solid #d9e2ec!important;
  background:#fff!important;box-sizing:border-box!important;
}
#${VIEWER_ID} .ycpf-title{
  flex:1 1 auto!important;min-width:0!important;color:#162d49!important;
  font-size:13px!important;font-weight:850!important;white-space:nowrap!important;
  overflow:hidden!important;text-overflow:ellipsis!important;
}
#${VIEWER_ID} .ycpf-btn{
  flex:0 0 auto!important;min-height:34px!important;padding:0 13px!important;
  border:1px solid #c8d4e0!important;border-radius:8px!important;background:#fff!important;
  color:#173b60!important;font:inherit!important;font-size:12px!important;font-weight:800!important;
  cursor:pointer!important;
}
#${VIEWER_ID} .ycpf-download{
  border-color:#b9dfc5!important;background:#eef9f1!important;color:#17653a!important;
}
#${VIEWER_ID} .ycpf-delete{
  border-color:#e5a9a5!important;background:#fff1f0!important;color:#a61b12!important;
}
#${VIEWER_ID} .ycpf-delete:hover{
  border-color:#cf6f68!important;background:#ffe5e2!important;
}
#${VIEWER_ID} .ycpf-confirm{
  position:absolute!important;inset:0!important;z-index:30!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  padding:18px!important;background:rgba(15,23,42,.58)!important;box-sizing:border-box!important;
}
#${VIEWER_ID} .ycpf-confirm-box{
  width:min(420px,calc(100vw - 36px))!important;background:#fff!important;
  border-radius:14px!important;padding:22px!important;box-shadow:0 18px 60px rgba(0,0,0,.35)!important;
}
#${VIEWER_ID} .ycpf-confirm-title{
  font-size:17px!important;font-weight:850!important;color:#162d49!important;margin-bottom:9px!important;
}
#${VIEWER_ID} .ycpf-confirm-text{
  font-size:13px!important;line-height:1.45!important;color:#556579!important;margin-bottom:18px!important;
}
#${VIEWER_ID} .ycpf-confirm-actions{
  display:flex!important;gap:10px!important;justify-content:flex-end!important;
}
#${VIEWER_ID} .ycpf-confirm-ok{
  border-color:#b42318!important;background:#b42318!important;color:#fff!important;
}
#${VIEWER_ID} .ycpf-stage{min-width:0!important;min-height:0!important;background:#1f1f1f!important;overflow:hidden!important}
#${VIEWER_ID} .ycpf-frame{display:block!important;width:100%!important;height:100%!important;border:0!important;background:#fff!important}
#${VIEWER_ID} .ycpf-img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;background:#111!important}
@media(max-width:640px){
  #${VIEWER_ID}{grid-template-rows:42px minmax(0,1fr)!important}
  #${VIEWER_ID} .ycpf-head{padding:4px 6px!important}
  #${VIEWER_ID} .ycpf-btn{min-height:32px!important;padding:0 9px!important;font-size:11px!important}
}
`;
  document.head.appendChild(s);
}

function closeViewer(){
  document.getElementById(VIEWER_ID)?.remove();
}

function persistAchatsCache(){
  try{
    const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
    const cached=raw?JSON.parse(raw):{};
    if(cached&&typeof cached==='object'&&typeof S!=='undefined'&&S&&Array.isArray(S.achats)){
      cached.achats=S.achats.map(function(a){return Object.assign({},a);});
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
    }
  }catch(e){}
}

function toastSafe(message,isError){
  try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
}

function reconcileConfirmedAchatState(achatId,serverRow){
  achatId=txt(achatId);
  if(!achatId||!serverRow)return;

  // 1) État mémoire courant
  try{
    if(typeof S!=='undefined'&&S&&Array.isArray(S.achats)){
      const i=S.achats.findIndex(function(a){return txt(a&&a.id)===achatId;});
      if(i>=0)S.achats[i]=Object.assign({},serverRow);
    }
  }catch(e){}

  // 2) Cache de démarrage
  try{
    const key='YAYA_CACHE_DATA_V2';
    const raw=localStorage.getItem(key);
    const cached=raw?JSON.parse(raw):{};
    if(cached&&Array.isArray(cached.achats)){
      const i=cached.achats.findIndex(function(a){return txt(a&&a.id)===achatId;});
      if(i>=0)cached.achats[i]=Object.assign({},serverRow);
      localStorage.setItem(key,JSON.stringify(cached));
    }
  }catch(e){}

  // 3) File de synchronisation finance : empêcher une ancienne copie
  //    locale de réinjecter le lien supprimé lors d'un prochain flush.
  try{
    const key='YAYA_FINANCE_PENDING_ACHATS_V1';
    const raw=localStorage.getItem(key);
    const pending=raw?JSON.parse(raw):null;
    if(pending&&Array.isArray(pending.achats)){
      const i=pending.achats.findIndex(function(a){return txt(a&&a.id)===achatId;});
      if(i>=0)pending.achats[i]=Object.assign({},serverRow);
      localStorage.setItem(key,JSON.stringify(pending));
    }
  }catch(e){}
}

async function detachAchatPiece(achatId){
  achatId=txt(achatId);
  const achat=achatById(achatId);
  if(!achat)throw new Error('Achat introuvable');

  const ancienLien=txt(achat.lien);
  achat.lien='';
  persistAchatsCache();
  try{if(typeof render==='function')render();}catch(e){}

  try{
    if(typeof window.__yayaFinanceQueueCurrent==='function'){
      window.__yayaFinanceQueueCurrent({upsertIds:[achatId]});
      if(typeof window.__yayaFinanceFlushPending==='function'){
        await window.__yayaFinanceFlushPending();
      }
    }else if(typeof apiPost==='function'){
      const ok=await apiPost('addAchat',achat);
      if(ok===false)throw new Error('Enregistrement refusé');
    }else{
      throw new Error('Synchronisation Yaya indisponible');
    }

    // Relire le serveur avant d'afficher "supprimée" afin d'éviter qu'un
    // rafraîchissement central ne réinjecte temporairement l'ancien lien.
    if(typeof window.apiGet==='function'){
      const fresh=await window.apiGet(true);
      const achats=fresh&&Array.isArray(fresh.achats)?fresh.achats:null;
      if(achats){
        const saved=achats.find(function(a){return txt(a&&a.id)===achatId;});
        if(!saved)throw new Error('Achat absent après synchronisation');
        if(txt(saved.lien))throw new Error('Le lien est encore présent dans le Sheet');

        // Le Sheet fait foi : réconcilier immédiatement tous les états locaux
        // avec cette ligne serveur confirmée.
        reconcileConfirmedAchatState(achatId,saved);

        // Les autres achats issus de la lecture réseau restent également frais,
        // mais on conserve la ligne réconciliée ci-dessus pour cet achat précis.
        try{
          if(typeof S!=='undefined'&&S&&Array.isArray(achats)){
            S.achats=achats.map(function(a){
              return txt(a&&a.id)===achatId?Object.assign({},saved):a;
            });
          }
        }catch(e){}
        persistAchatsCache();
      }
    }

    try{if(typeof render==='function')render();}catch(e){}
    try{
      window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{
        detail:{tabs:['achats'],source:'achat-piece-delete'}
      }));
    }catch(e){}
    return true;
  }catch(err){
    // Si le serveur refuse réellement la suppression, remettre l'état local
    // pour ne pas afficher un faux succès.
    const current=achatById(achatId);
    if(current&&!txt(current.lien))current.lien=ancienLien;
    persistAchatsCache();
    try{if(typeof render==='function')render();}catch(e){}
    throw err;
  }
}

function showDetachConfirm(wrap,achatId){
  if(!wrap||!achatId)return;
  wrap.querySelector('.ycpf-confirm')?.remove();

  const confirm=document.createElement('div');
  confirm.className='ycpf-confirm';
  confirm.innerHTML=
    '<div class="ycpf-confirm-box">'+
      '<div class="ycpf-confirm-title">Supprimer cet achat de Yaya ?</div>'+
      '<div class="ycpf-confirm-text">L’achat et sa pièce jointe seront supprimés ensemble de Yaya. Le fichier Google Drive lié sera mis à la corbeille.</div>'+
      '<div class="ycpf-confirm-actions">'+
        '<button type="button" class="ycpf-btn ycpf-confirm-cancel">Annuler</button>'+
        '<button type="button" class="ycpf-btn ycpf-confirm-ok">Supprimer de Yaya</button>'+
      '</div>'+
    '</div>';
  wrap.appendChild(confirm);

  const cancel=function(){confirm.remove();};
  confirm.querySelector('.ycpf-confirm-cancel').onclick=function(e){
    e.preventDefault();e.stopPropagation();cancel();
  };
  confirm.onclick=function(e){if(e.target===confirm)cancel();};
  confirm.querySelector('.ycpf-confirm-ok').onclick=async function(e){
    e.preventDefault();e.stopPropagation();
    const btn=e.currentTarget;
    if(btn.disabled)return;
    btn.disabled=true;
    btn.textContent='Suppression…';
    try{
      if(typeof window.__yayaFinanceDeleteById!=='function')throw new Error('suppression de l’achat indisponible');
      const removed=await window.__yayaFinanceDeleteById(achatId,true);
      if(removed===false)throw new Error('suppression refusée');
      confirm.remove();
      closeViewer();
      toastSafe('Achat et pièce supprimés — fichier Drive mis à la corbeille ✓');
    }catch(err){
      btn.disabled=false;
      btn.textContent='Supprimer de Yaya';
      toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
    }
  };
}

function openViewer(url,label,achatId){
  url=txt(url);
  achatId=txt(achatId);
  if(!url)return;
  ensureStyle();
  closeViewer();

  const wrap=document.createElement('div');
  wrap.id=VIEWER_ID;
  const purl=previewUrl(url);
  const image=/\.(?:jpe?g|png|webp|gif)(?:[?#].*)?$/i.test(purl);
  const canDelete=!!(achatId&&achatById(achatId));

  wrap.innerHTML=
    '<div class="ycpf-head">'+
      '<div class="ycpf-title">'+esc(label||'Pièce jointe')+'</div>'+
      '<button type="button" class="ycpf-btn ycpf-download">Télécharger</button>'+
      (canDelete?'<button type="button" class="ycpf-btn ycpf-delete">Supprimer la pièce</button>':'')+
      '<button type="button" class="ycpf-btn ycpf-close">Fermer</button>'+
    '</div>'+
    '<div class="ycpf-stage">'+
      (image
        ? '<img class="ycpf-img" alt="Pièce jointe" src="'+esc(purl)+'">'
        : '<iframe class="ycpf-frame" title="Pièce jointe" src="'+esc(purl)+'" loading="eager" allow="autoplay; fullscreen"></iframe>')+
    '</div>';

  document.body.appendChild(wrap);

  wrap.querySelector('.ycpf-close').onclick=function(e){
    e.preventDefault();e.stopPropagation();closeViewer();
  };
  wrap.querySelector('.ycpf-download').onclick=function(e){
    e.preventDefault();e.stopPropagation();
    const a=document.createElement('a');
    a.href=downloadUrl(url);
    a.target='_blank';a.rel='noopener';a.download='';
    document.body.appendChild(a);a.click();a.remove();
  };
  const del=wrap.querySelector('.ycpf-delete');
  if(del)del.onclick=function(e){
    e.preventDefault();e.stopPropagation();
    showDetachConfirm(wrap,achatId);
  };
}

function achatById(id){
  try{
    if(typeof S!=='undefined'&&S&&Array.isArray(S.achats)){
      return S.achats.find(a=>txt(a&&a.id)===txt(id))||null;
    }
  }catch(e){}
  return null;
}

function achatIdFromButton(btn){
  if(!btn)return '';
  let id=txt(btn.dataset&&btn.dataset.achatId||btn.getAttribute&&btn.getAttribute('data-achat-id'));
  if(id)return id;

  const row=btn.closest&&btn.closest('.yaya-detail-charge-row,.charge-row,.achligne,.charge-row-standard,.controle-ligne,.charge-validee-ligne');
  if(!row)return '';

  id=txt(row.dataset&&row.dataset.achatId||row.dataset&&row.dataset.id||row.getAttribute&&row.getAttribute('data-achat-id')||row.getAttribute&&row.getAttribute('data-id'));
  if(id)return id;

  const candidates=Array.from(row.querySelectorAll('button[onclick],[data-achat-id]'));
  for(const el of candidates){
    id=txt(el.dataset&&el.dataset.achatId||el.getAttribute&&el.getAttribute('data-achat-id'));
    if(id)return id;
    const raw=txt(el.getAttribute&&el.getAttribute('onclick'));
    let m=raw.match(/(?:editAchat|saveAchat|validerChargeAuto|classerChargeAuto)\s*\(\s*['"]([^'"]+)['"]/i);
    if(m&&m[1])return txt(m[1]);
  }
  return '';
}

function urlFromButton(btn){
  const direct=txt(
    btn.dataset.lien||btn.dataset.url||btn.dataset.href||
    btn.getAttribute('data-lien')||btn.getAttribute('data-url')
  );
  if(direct)return direct;

  const id=achatIdFromButton(btn);
  if(id){
    const a=achatById(id);
    if(a&&txt(a.lien))return txt(a.lien);
  }

  const raw=txt(btn.getAttribute('onclick'));
  let m=raw.match(/voirPiece\s*\(\s*['"]([^'"]+)['"]/i);
  if(m&&m[1])return m[1].replace(/&amp;/g,'&');

  const row=btn.closest('.yaya-detail-charge-row,.charge-row,.achligne');
  if(row){
    const rid=txt(row.dataset.achatId||row.getAttribute('data-achat-id'));
    if(rid){
      const a=achatById(rid);
      if(a&&txt(a.lien))return txt(a.lien);
    }
  }
  return '';
}

function isChargePieceButton(target){
  if(!target||!target.closest)return null;
  return target.closest(
    '#pane-chantiers .yaya-detail-charge-view,'+
    '#pane-chantiers .charge-open-btn,'+
    '#pane-chantiers .yaya-detail-charges-pane button[onclick*="voirPiece"],'+
    '#pane-achats .charge-open-btn'
  );
}

document.addEventListener('click',function(e){
  const btn=isChargePieceButton(e.target);
  if(!btn)return;
  const url=urlFromButton(btn);
  if(!url)return;

  e.preventDefault();
  e.stopPropagation();
  if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();

  const id=achatIdFromButton(btn);
  const a=id?achatById(id):null;
  const label=a
    ? [txt(a.fournisseur),txt(a.designation)].filter(Boolean).join(' — ')
    : 'Pièce jointe';

  openViewer(url,label,id);
},true);

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&document.getElementById(VIEWER_ID))closeViewer();
},true);

})();
