(function(){
  'use strict';

  const STYLE_ID = 'yaya-chantier-home-white-grey-style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Fond global plus sobre */
      #pane-chantiers{
        background:#f3f4f6 !important;
        padding:10px !important;
        border-radius:12px !important;
      }

      /* Barre de recherche */
      #pane-chantiers #filtreInput{
        background:#ffffff !important;
        border:1px solid #d1d5db !important;
        color:#1f2937 !important;
        box-shadow:none !important;
      }

      /* Lignes chantiers */
      #pane-chantiers .yaya-chantier-home-row{
        border:1px solid #aab2bb !important;
        border-radius:10px !important;
        box-shadow:none !important;
        margin:0 0 10px 0 !important;
        padding:0 !important;
        overflow:hidden !important;
      }

      #pane-chantiers .yaya-chantier-home-row.yaya-row-white{
        background:#ffffff !important;
      }

      #pane-chantiers .yaya-chantier-home-row.yaya-row-grey{
        background:#c1c7ce !important;
      }

      /* Nettoyage des cartes internes éventuelles */
      #pane-chantiers .yaya-chantier-home-row .card{
      /* =========================================================
   SUPPRIMER LE BOUTON OEIL DANS LA LISTE CHANTIERS
   Le nom du chantier reste l'accès d'ouverture.
========================================================= */
(function(){
  'use strict';

  function removeEyes(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    const rows=Array.from(pane.children||[]);
    rows.forEach(function(row){
      const top=row && row.querySelector ? row.querySelector('.top') : null;
      if(!top)return;

      Array.from(top.querySelectorAll('button,[onclick]')).forEach(function(el){
        const code=String(el.getAttribute('onclick')||'');
        const txt=String(el.textContent||'').trim();

        if(/toggleChantier\(/.test(code) || txt==='👁️' || txt==='👁'){
          try{ el.remove(); }catch(_){}
        }
      });
    });
  }

  function install(){
    removeEyes();

    const pane=document.getElementById('pane-chantiers');
    if(!pane){
      setTimeout(install,150);
      return;
    }

    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        removeEyes();
      });
    }).observe(pane,{childList:true,subtree:true});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
        background:transparent !important;
        box-shadow:none !important;
        border:none !important;
        margin:0 !important;
      }

      /* Titres / textes */
      #pane-chantiers .yaya-chantier-home-row b,
      #pane-chantiers .yaya-chantier-home-row strong{
        color:#1f2937 !important;
      }

      #pane-chantiers .yaya-chantier-home-row small,
      #pane-chantiers .yaya-chantier-home-row .note{
        color:#6b7280 !important;
      }

      /* Boutons actions à droite plus sobres */
      #pane-chantiers .yaya-chantier-home-row button{
        background:#ffffff !important;
        border:1px solid #aab2bb !important;
        color:#4b5563 !important;
        box-shadow:none !important;
      }

      #pane-chantiers .yaya-chantier-home-row button:hover{
        background:#e5e7eb !important;
      }

      /* Légère respiration sur les zones internes */
      #pane-chantiers .yaya-chantier-home-row > div{
        padding-left:12px;
        padding-right:12px;
      }
    `;
    document.head.appendChild(style);
  }

  function isChantierRow(el){
    if(!el || !el.textContent) return false;
    const txt = el.textContent.replace(/\s+/g,' ').trim();

    return (
      /Signature\s*:/.test(txt) ||
      /Début\s*:/.test(txt) ||
      /Marché\s*:/.test(txt) ||
      /Marge\s*:/.test(txt)
    );
  }

  function paintRows(){
    const pane = document.getElementById('pane-chantiers');
    if(!pane) return;

    const children = Array.from(pane.children || []);
    let index = 0;

    children.forEach(el=>{
      el.classList.remove('yaya-chantier-home-row','yaya-row-white','yaya-row-grey');

      if(!isChantierRow(el)) return;

      el.classList.add('yaya-chantier-home-row');
      el.classList.add(index % 2 === 0 ? 'yaya-row-white' : 'yaya-row-grey');
      index++;
    });
  }

  function refresh(){
    injectStyle();
    paintRows();
  }

  function install(){
    refresh();

    const paneWatcher = setInterval(()=>{
      const pane = document.getElementById('pane-chantiers');
      if(!pane) return;

      clearInterval(paneWatcher);
      refresh();

      const mo = new MutationObserver(()=>{
        refresh();
      });

      mo.observe(pane, {
        childList: true,
        subtree: true
      });
    }, 200);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();

/* Recharge le correctif d'édition document sans cache. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-doc-edit-save-fix="1"]'))return;
  const s=document.createElement('script');
  s.src='edit-id-compat-fix.js?v=doc-edit-save-'+Date.now();
  s.dataset.yayaDocEditSaveFix='1';
  document.head.appendChild(s);
})();

/* =========================================================
   NOM DU CHANTIER CLIQUABLE
========================================================= */
(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-name-link-style-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-name-link{
        cursor:pointer!important;
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-chantier-name-link:hover,
      #pane-chantiers .yaya-chantier-name-link:focus-visible{
        text-decoration:underline!important;
        text-underline-offset:3px!important;
      }
      #pane-chantiers .yaya-chantier-name-link:focus-visible{
        outline:2px solid rgba(24,95,165,.35)!important;
        outline-offset:3px!important;
        border-radius:3px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function getToggleId(row){
    if(!row || !row.querySelectorAll)return '';
    const elements=row.querySelectorAll('[onclick]');
    for(const el of elements){
      const code=String(el.getAttribute('onclick')||'');
      const m=code.match(/toggleChantier\(\s*['\"]([^'\"]+)['\"]\s*\)/);
      if(m && m[1])return String(m[1]);
    }
    return '';
  }

  function getNameElement(row){
    const top=row && row.querySelector ? row.querySelector('.top') : null;
    if(!top)return null;
    for(const child of Array.from(top.children||[])){
      if(child.tagName==='B')return child;
    }
    return null;
  }

  function apply(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    const rows=Array.from(pane.children||[]);
    rows.forEach(function(row){
      const id=getToggleId(row);
      if(!id)return;

      const name=getNameElement(row);
      if(!name)return;

      name.classList.add('yaya-chantier-name-link');
      name.setAttribute('role','link');
      name.setAttribute('tabindex','0');
      name.setAttribute('title','Ouvrir le chantier');
      name.dataset.yayaChantierId=id;

      if(name.dataset.yayaChantierLinkBound!=='1'){
        name.dataset.yayaChantierLinkBound='1';

        function openChantier(ev){
          if(ev){
            ev.preventDefault();
            ev.stopPropagation();
          }
          const chantierId=String(name.dataset.yayaChantierId||'');
          if(!chantierId)return;

          try{
            if(typeof focusChantier!=='undefined' && String(focusChantier||'')===chantierId){
              return;
            }
          }catch(_){}

          try{
            if(typeof toggleChantier==='function')toggleChantier(chantierId);
          }catch(err){
            console.warn('Ouverture chantier par le nom :',err);
          }
        }

        name.addEventListener('click',openChantier);
        name.addEventListener('keydown',function(ev){
          if(ev.key==='Enter' || ev.key===' '){
            openChantier(ev);
          }
        });
      }

      /* Une fois le nom lié, l'ancien bouton œil devient inutile. */
      const top=row.querySelector('.top');
      if(top){
        Array.from(top.querySelectorAll('[onclick]')).forEach(function(el){
          const code=String(el.getAttribute('onclick')||'');
          const txt=String(el.textContent||'').trim();
          const title=String(el.getAttribute('title')||'').toLowerCase();
          if(/toggleChantier\(/.test(code) && (txt==='👁️' || txt==='👁' || title.includes('voir') || title.includes('ouvrir'))){
            el.remove();
          }
        });
      }
    });
  }

  function install(){
    installStyle();
    apply();

    const pane=document.getElementById('pane-chantiers');
    if(!pane){
      setTimeout(install,150);
      return;
    }

    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        apply();
      });
    }).observe(pane,{childList:true,subtree:true});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
