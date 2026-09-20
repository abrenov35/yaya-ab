(function(){
'use strict';
if(window.__YAYA_DOUBLE_CLICK_GUARD_V2)return;
window.__YAYA_DOUBLE_CLICK_GUARD_V2=true;
window.__YAYA_DOUBLE_CLICK_GUARD_V1=true;

const locks=new Map();
const ACTION_RE=/^(?:Enregistrer|Ajouter|Importer|Valider|Confirmer|Supprimer|Archiver|Créer|Modifier|Envoyer|Télécharger|Remplacer|Sauvegarder|OK)\b/i;
const SAFE_RE=/^(?:Fermer|Annuler|Retour|Précédent|Suivant)$/i;

function textOf(el){
  return String(
    (el&&el.textContent)||
    (el&&el.getAttribute&&el.getAttribute('aria-label'))||
    (el&&el.getAttribute&&el.getAttribute('title'))||
    ''
  ).replace(/\s+/g,' ').trim();
}

function isActionButton(target){
  if(!target||!target.closest)return null;
  const el=target.closest('button,[role="button"],input[type="button"],input[type="submit"]');
  if(!el)return null;

  if(el.matches('input,select,textarea,label'))return null;
  if(el.closest('.yaya-photo-nav'))return null;

  const text=textOf(el);
  if(SAFE_RE.test(text))return null;

  const cls=String(el.className||'');
  const raw=String(el.getAttribute&&el.getAttribute('onclick')||'');

  if(
    ACTION_RE.test(text)||
    /save|submit|delete|remove|import|upload|archive|create|add|confirm/i.test(cls)||
    /save|add|del|delete|remove|import|upload|archive|create|confirm/i.test(raw)||
    el.type==='submit'
  ) return el;

  // Modules critiques déjà connus.
  if(el.closest(
    '#pane-achats,'+
    '#modalRoot .achat-edit-modal,'+
    '#modalRoot .yaya-finance-edit-modal,'+
    '.yaya-commande-create-overlay,'+
    '.yaya-cmd-native-root,'+
    '#yayaDevisAdd,'+
    '.yaya-devis-fast-modal,'+
    '#pane-documents,'+
    '.yaya-photo-confirm-actions'
  )) return el;

  return null;
}

function keyFor(el){
  const row=el.closest&&el.closest('[data-id],[data-achat-id],[data-yaya-row-id],[data-ycn-row]');
  const rowId=row?String(
    row.getAttribute('data-id')||
    row.getAttribute('data-achat-id')||
    row.getAttribute('data-yaya-row-id')||
    row.getAttribute('data-ycn-row')||''
  ):'';
  const ownId=String(
    el.getAttribute('data-id')||
    el.getAttribute('data-achat-id')||
    el.getAttribute('data-row-id')||
    ''
  );
  const raw=String(el.getAttribute('onclick')||'').replace(/\s+/g,'').slice(0,160);
  return [
    el.tagName||'',
    String(el.className||'').replace(/\s+/g,'.').slice(0,140),
    ownId,rowId,raw||textOf(el).slice(0,90)
  ].join('|');
}

function durationFor(el){
  const text=textOf(el);
  if(/Enregistrer|Importer|Supprimer|Archiver|Valider|Confirmer|Créer|Ajouter|Remplacer|Envoyer/i.test(text))return 1400;
  if(el.type==='submit')return 1200;
  return 850;
}

function applyVisualLock(el,duration,key,stamp){
  // Important : le verrou est appliqué après le dispatch du clic n°1.
  // On ne met pas disabled=true pour ne pas casser les handlers asynchrones
  // qui gèrent eux-mêmes l'état disabled.
  setTimeout(function(){
    if(!el||!el.isConnected)return;
    if(Number(locks.get(key)||0)!==stamp)return;

    el.dataset.yayaClickLocked='1';
    el.setAttribute('aria-disabled','true');
    el.style.setProperty('pointer-events','none','important');
    el.style.setProperty('cursor','wait','important');

    setTimeout(function(){
      if(Number(locks.get(key)||0)!==stamp)return;
      locks.delete(key);
      if(!el||!el.isConnected)return;
      delete el.dataset.yayaClickLocked;
      if(el.getAttribute('aria-busy')!=='true')el.removeAttribute('aria-disabled');
      el.style.removeProperty('pointer-events');
      el.style.removeProperty('cursor');
    },duration);
  },0);
}

function guard(e,el){
  const key=keyFor(el);
  const now=Date.now();
  const previous=Number(locks.get(key)||0);
  const duration=durationFor(el);

  if(previous&&now-previous<duration+80){
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    return true;
  }

  locks.set(key,now);
  applyVisualLock(el,duration,key,now);
  return false;
}

document.addEventListener('click',function(e){
  const el=isActionButton(e.target);
  if(!el)return;
  guard(e,el);
},true);

document.addEventListener('dblclick',function(e){
  const el=isActionButton(e.target);
  if(!el)return;
  e.preventDefault();
  e.stopPropagation();
  if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
},true);

// Nettoyage à la navigation interne : aucun ancien verrou ne doit survivre
// au retour sur une nouvelle modale.
window.addEventListener('pageshow',function(){
  document.querySelectorAll('[data-yaya-click-locked="1"]').forEach(function(el){
    delete el.dataset.yayaClickLocked;
    if(el.getAttribute('aria-busy')!=='true')el.removeAttribute('aria-disabled');
    el.style.removeProperty('pointer-events');
    el.style.removeProperty('cursor');
  });
  locks.clear();
},{passive:true});

})();