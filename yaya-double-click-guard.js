(function(){
'use strict';
if(window.__YAYA_DOUBLE_CLICK_GUARD_V1)return;
window.__YAYA_DOUBLE_CLICK_GUARD_V1=true;

const locks=new Map();

const GUARDED=[
  '#pane-achats button',
  '#pane-chantiers .yaya-detail-charge-edit',
  '#pane-chantiers .yaya-detail-charge-delete',
  '.yaya-charge-delete-actions button',
  '#modalRoot .achat-edit-modal button',
  '#modalRoot .yaya-finance-edit-modal button',

  '[data-yaya-doc-open]',
  '[data-yaya-doc-edit]',
  '[data-yaya-doc-delete]',
  '[data-yaya-mail-edit]',
  '[data-yaya-mail-delete]',
  '#pane-documents .achligne.ligR[data-id]',
  '#pane-chantiers .yaya-detail-document-row',
  '#pane-chantiers .yaya-detail-mail-row',
  '#pane-chantiers .yaya-force-mails-pane .yaya-detail-mail-row',
  '#modalRoot .yaya-read-actions button',

  '.yaya-photo-camera-action',
  '.yaya-photo-import-action',
  '.yaya-photo-delete',
  '.yaya-photo-confirm-actions button',
  '.yaya-photo-overlay button',
  '.yaya-pe[data-date]',
  '.yaya-pic[data-id]'
].join(',');

function guardedElement(target){
  if(!target||!target.closest)return null;
  const el=target.closest(GUARDED);
  if(!el)return null;

  // Commandes a déjà son propre verrou natif.
  if(el.closest&&el.closest('.yaya-cmd-native-root'))return null;

  // Ne jamais bloquer les champs de saisie eux-mêmes.
  if(el.matches&&el.matches('input,select,textarea,label'))return null;
  return el;
}

function dataValue(el,names){
  for(const name of names){
    const v=el.getAttribute&&el.getAttribute(name);
    if(v)return String(v);
  }
  return '';
}

function keyFor(el){
  const row=el.closest&&el.closest('[data-id],[data-achat-id],[data-yaya-row-id]');
  const rowId=row?dataValue(row,['data-id','data-achat-id','data-yaya-row-id']):'';
  const ownId=dataValue(el,[
    'data-id','data-achat-id','data-date',
    'data-yaya-doc-open-id','data-yaya-doc-edit','data-yaya-doc-delete',
    'data-yaya-mail-edit','data-yaya-mail-delete'
  ]);
  const onclick=String(el.getAttribute&&el.getAttribute('onclick')||'').replace(/\s+/g,'').slice(0,140);
  const text=String(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80);
  const cls=String(el.className||'').trim().replace(/\s+/g,'.').slice(0,140);
  return [el.tagName||'',cls,ownId,rowId,onclick||text].join('|');
}

function delayFor(el){
  if(el.matches&&el.matches('.yaya-photo-nav button,.yaya-pic[data-id]'))return 350;
  if(el.matches&&el.matches('.yaya-pe[data-date]'))return 450;
  return 600;
}

function blockRepeat(e,el){
  const key=keyFor(el);
  const now=Date.now();
  const delay=delayFor(el);
  const last=Number(locks.get(key)||0);

  if(last&&now-last<delay){
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    return true;
  }

  locks.set(key,now);
  setTimeout(()=>{
    if(Number(locks.get(key)||0)===now)locks.delete(key);
  },delay+100);
  return false;
}

document.addEventListener('click',function(e){
  const el=guardedElement(e.target);
  if(!el)return;
  blockRepeat(e,el);
},true);

document.addEventListener('dblclick',function(e){
  const el=guardedElement(e.target);
  if(!el)return;
  e.preventDefault();
  e.stopPropagation();
  if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
},true);

})();