(function(){
'use strict';
if(window.__yayaChargePieceFastViewerV1)return;
window.__yayaChargePieceFastViewerV1=true;

const VIEWER_ID='yayaChargePieceFastViewer';
const STYLE_ID='yaya-charge-piece-fast-viewer-v1';

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

function openViewer(url,label){
  url=txt(url);
  if(!url)return;
  ensureStyle();
  closeViewer();

  const wrap=document.createElement('div');
  wrap.id=VIEWER_ID;
  const purl=previewUrl(url);
  const image=/\.(?:jpe?g|png|webp|gif)(?:[?#].*)?$/i.test(purl);

  wrap.innerHTML=
    '<div class="ycpf-head">'+
      '<div class="ycpf-title">'+esc(label||'Pièce jointe')+'</div>'+
      '<button type="button" class="ycpf-btn ycpf-download">Télécharger</button>'+
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
}

function achatById(id){
  try{
    if(typeof S!=='undefined'&&S&&Array.isArray(S.achats)){
      return S.achats.find(a=>txt(a&&a.id)===txt(id))||null;
    }
  }catch(e){}
  return null;
}

function urlFromButton(btn){
  const direct=txt(
    btn.dataset.lien||btn.dataset.url||btn.dataset.href||
    btn.getAttribute('data-lien')||btn.getAttribute('data-url')
  );
  if(direct)return direct;

  const id=txt(btn.dataset.achatId||btn.getAttribute('data-achat-id'));
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

  const id=txt(btn.dataset.achatId||btn.getAttribute('data-achat-id'));
  const a=id?achatById(id):null;
  const label=a
    ? [txt(a.fournisseur),txt(a.designation)].filter(Boolean).join(' — ')
    : 'Pièce jointe';

  openViewer(url,label);
},true);

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&document.getElementById(VIEWER_ID))closeViewer();
},true);

})();