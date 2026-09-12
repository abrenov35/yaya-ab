(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-home-white-grey-style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers{
        background:#f3f4f6!important;
        padding:10px!important;
        border-radius:12px!important;
      }
      #pane-chantiers #filtreInput{
        background:#fff!important;
        border:1px solid #d1d5db!important;
        color:#1f2937!important;
        box-shadow:none!important;
      }
      #pane-chantiers .yaya-chantier-home-row{
        border:1px solid #aab2bb!important;
        border-radius:10px!important;
        box-shadow:none!important;
        margin:0 0 10px!important;
        padding:0!important;
        overflow:hidden!important;
      }
      #pane-chantiers .yaya-chantier-home-row.yaya-row-white{background:#fff!important;}
      #pane-chantiers .yaya-chantier-home-row.yaya-row-grey{background:#c1c7ce!important;}
      #pane-chantiers .yaya-chantier-home-row .card{
        background:transparent!important;
        box-shadow:none!important;
        border:none!important;
        margin:0!important;
      }
      #pane-chantiers .yaya-chantier-home-row b,
      #pane-chantiers .yaya-chantier-home-row strong{color:#1f2937!important;}
      #pane-chantiers .yaya-chantier-home-row small,
      #pane-chantiers .yaya-chantier-home-row .note{color:#6b7280!important;}
      #pane-chantiers .yaya-chantier-home-row button{
        background:#fff!important;
        border:1px solid #aab2bb!important;
        color:#4b5563!important;
        box-shadow:none!important;
      }
      #pane-chantiers .yaya-chantier-home-row button:hover{background:#e5e7eb!important;}
      #pane-chantiers .yaya-chantier-home-row>div{
        padding-left:12px;
        padding-right:12px;
      }
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

  function normalise(v){
    return String(v||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toUpperCase()
      .replace(/\s+/g,' ')
      .trim();
  }

  function getNameElement(row){
    const top=row&&row.querySelector?row.querySelector('.top'):null;
    if(!top)return null;
    return Array.from(top.children||[]).find(el=>el.tagName==='B')||null;
  }

  function getToggleId(row){
    if(!row||!row.querySelectorAll)return '';
    for(const el of row.querySelectorAll('[onclick]')){
      const code=String(el.getAttribute('onclick')||'');
      const m=code.match(/toggleChantier\(\s*['\"]([^'\"]+)['\"]\s*\)/);
      if(m&&m[1])return String(m[1]);
    }
    return '';
  }

  function getIdFromData(name){
    const wanted=normalise(name&&name.textContent);
    if(!wanted)return '';
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers)){
        const exact=S.chantiers.find(c=>normalise(c&&c.nom)===wanted);
        if(exact&&exact.id)return String(exact.id);
      }
    }catch(e){}
    return '';
  }

  function isChantierRow(el){
    if(!el||!el.textContent)return false;
    if(getToggleId(el))return true;
    const name=getNameElement(el);
    if(name&&getIdFromData(name))return true;
    const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
    return /Signature\s*:|Début\s*:|Marché\s*:|Marge\s*:/.test(txt);
  }

  function openById(id){
    const chantierId=String(id||'').trim();
    if(!chantierId)return;
    try{
      if(typeof focusChantier!=='undefined'&&String(focusChantier||'')===chantierId)return;
    }catch(e){}
    try{
      if(typeof toggleChantier==='function'){
        toggleChantier(chantierId);
        return;
      }
    }catch(e){
      console.warn('Ouverture chantier :',e);
    }
    try{
      focusChantier=chantierId;
      if(typeof expChantiers!=='undefined'&&expChantiers){
        expChantiers.clear();
        expChantiers.add(chantierId);
      }
      if(typeof render==='function')render();
    }catch(e){
      console.warn('Ouverture chantier secours :',e);
    }
  }

  function bindRow(row){
    const name=getNameElement(row);
    if(!name)return;

    const id=getToggleId(row)||getIdFromData(name);
    if(!id)return;

    name.dataset.yayaChantierId=id;
    name.classList.add('yaya-chantier-name-link');
    name.setAttribute('role','link');
    name.setAttribute('tabindex','0');
    name.setAttribute('title','Ouvrir le chantier');

    if(name.dataset.yayaChantierLinkBound!=='1'){
      name.dataset.yayaChantierLinkBound='1';
      name.addEventListener('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        openById(name.dataset.yayaChantierId);
      });
      name.addEventListener('keydown',function(ev){
        if(ev.key==='Enter'||ev.key===' '){
          ev.preventDefault();
          ev.stopPropagation();
          openById(name.dataset.yayaChantierId);
        }
      });
    }

    const top=row.querySelector('.top');
    if(top){
      Array.from(top.querySelectorAll('[onclick]')).forEach(function(el){
        const code=String(el.getAttribute('onclick')||'');
        const txt=String(el.textContent||'').trim();
        const title=String(el.getAttribute('title')||'').toLowerCase();
        if(/toggleChantier\(/.test(code)&&(txt==='Voir'||txt==='👁️'||txt==='👁'||title.includes('voir')||title.includes('ouvrir'))){
          el.remove();
        }
      });
    }
  }

  function refresh(){
    injectStyle();
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    let index=0;
    Array.from(pane.children||[]).forEach(function(row){
      row.classList.remove('yaya-chantier-home-row','yaya-row-white','yaya-row-grey');
      if(!isChantierRow(row))return;
      row.classList.add('yaya-chantier-home-row');
      row.classList.add(index%2===0?'yaya-row-white':'yaya-row-grey');
      index++;
      bindRow(row);
    });
  }

  function install(){
    refresh();
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,150);return;}

    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        refresh();
      });
    }).observe(pane,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
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
