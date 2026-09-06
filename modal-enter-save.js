(function(){
  'use strict';

  if(window.__yayaModalEnterSaveInstalled)return;
  window.__yayaModalEnterSaveInstalled=true;

  function visible(el){
    if(!el || !el.isConnected)return false;
    const s=getComputedStyle(el);
    return s.display!=='none' && s.visibility!=='hidden' && s.opacity!=='0';
  }

  function topModal(){
    const candidates=[...document.querySelectorAll('.overlay .modal,[role="dialog"],.yaya-devis-fast-modal')]
      .filter(visible);
    return candidates.length?candidates[candidates.length-1]:null;
  }

  function saveButton(modal){
    if(!modal)return null;
    const buttons=[...modal.querySelectorAll('button,input[type="submit"],input[type="button"]')]
      .filter(function(btn){
        return visible(btn) && !btn.disabled && btn.getAttribute('aria-disabled')!=='true';
      });

    // Priorité au bouton explicitement marqué, puis à « Enregistrer ».
    let btn=buttons.find(b=>b.matches('[data-yaya-enter-save="1"]'));
    if(btn)return btn;

    btn=buttons.find(function(b){
      return /^\s*Enregistrer(?:\s*…|\.\.\.)?\s*$/i.test(String(b.textContent||b.value||''));
    });
    if(btn)return btn;

    // Compatibilité avec les anciennes modales dont l'action est dans onclick.
    btn=buttons.find(function(b){
      const oc=String(b.getAttribute('onclick')||'');
      return /\b(save|enregistr|sauvegard)\w*\s*\(/i.test(oc);
    });
    if(btn)return btn;

    // Dernier recours : submit natif, sans jamais sélectionner une action de suppression.
    return buttons.find(function(b){
      const txt=String(b.textContent||b.value||'').trim();
      return b.matches('input[type="submit"],button[type="submit"]') && !/supprim|effac|archiv/i.test(txt);
    })||null;
  }

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter' || e.defaultPrevented || e.repeat || e.isComposing)return;
    if(e.ctrlKey || e.altKey || e.metaKey)return;

    const target=e.target;
    const modal=topModal();
    if(!modal)return;

    // Bloc-note chantier : Entrée = Enregistrer. Maj+Entrée conserve un retour à la ligne.
    if(target && target.closest && target.closest('.yaya-note-modal-textarea')){
      if(e.shiftKey)return;
      const btn=saveButton(modal);
      if(!btn)return;
      const label=String(btn.textContent||btn.value||'').trim();
      if(/supprim|effac|archiv/i.test(label))return;
      e.preventDefault();
      e.stopPropagation();
      btn.click();
      return;
    }

    if(e.shiftKey)return;

    // Conserver les retours à la ligne et le comportement natif des autres listes/boutons.
    if(target && target.closest){
      if(target.closest('textarea,[contenteditable="true"],select,button,a,[role="button"]'))return;
    }

    // Ne jamais lancer une action destructive par Enter.
    const btn=saveButton(modal);
    if(!btn)return;
    const label=String(btn.textContent||btn.value||'').trim();
    if(/supprim|effac|archiv/i.test(label))return;

    e.preventDefault();
    e.stopPropagation();
    btn.click();
  },true);
})();

/* Centre uniquement la modale du bloc-note chantier. */
(function(){
  'use strict';

  const STYLE_ID='yaya-note-modal-center-style';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .overlay.yaya-note-overlay-centered{
        align-items:center!important;
        justify-content:center!important;
        padding:18px!important;
      }
      .overlay.yaya-note-overlay-centered .modal{
        margin:auto!important;
      }
      @media(max-width:640px){
        .overlay.yaya-note-overlay-centered{
          align-items:center!important;
          padding:14px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function centerNoteModal(){
    const textarea=document.querySelector('.yaya-note-modal-textarea');
    if(!textarea)return;
    const overlay=textarea.closest('.overlay');
    if(overlay)overlay.classList.add('yaya-note-overlay-centered');
  }

  installStyle();
  centerNoteModal();

  new MutationObserver(function(){
    centerNoteModal();
  }).observe(document.documentElement,{childList:true,subtree:true});
})();

/* Charge le centrage dédié de la modale de lecture des mails. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-mail-read-center="1"]'))return;
  const s=document.createElement('script');
  s.src='mail-read-modal-center.js?v=mailcenter-'+Date.now();
  s.dataset.yayaMailReadCenter='1';
  document.head.appendChild(s);
})();

/* Garde le bouton Fermer visible sur les aperçus devis / pièces. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-piece-toolbar-safe="1"]'))return;
  const s=document.createElement('script');
  s.src='piece-preview-toolbar-safe.js?v=piecetoolbar-'+Date.now();
  s.dataset.yayaPieceToolbarSafe='1';
  document.head.appendChild(s);
})();

/* Stabilise la suppression du devis principal après les refresh automatiques. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-main-quote-delete-fix="1"]'))return;
  const s=document.createElement('script');
  s.src='devis-main-delete-persist-fix.js?v=maindelete-'+Date.now();
  s.dataset.yayaMainQuoteDeleteFix='1';
  document.head.appendChild(s);
})();

/* Ajuste les documents dans les modales et rend le premier clic = agrandissement. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-piece-display-fix="1"]'))return;
  const s=document.createElement('script');
  s.src='piece-preview-display-fix.js?v=displayfix-'+Date.now();
  s.dataset.yayaPieceDisplayFix='1';
  document.head.appendChild(s);
})();
