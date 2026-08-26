(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-mode-suivi-v1';
  const VIEW_KEY='yaya.chantiers.view';

  function ready(){
    try{
      return typeof S!=='undefined' && Array.isArray(S.chantiers) && typeof render==='function' && typeof apiPost==='function';
    }catch(e){return false;}
  }

  function modeOf(c){
    return c && c.modeSuivi==='documents' ? 'documents' : 'complet';
  }

  function chantierByAnyId(cid){
    try{return S.chantiers.find(c=>String(c.id)===String(cid))||null;}catch(e){return null;}
  }

  function normalizeExisting(){
    if(!ready())return;
    S.chantiers.forEach(c=>{
      if(c && c.modeSuivi!=='documents' && c.modeSuivi!=='complet') c.modeSuivi='complet';
    });
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-suivi-tabs{
        display:flex!important;
        align-items:center!important;
        gap:7px!important;
        flex-wrap:wrap!important;
        margin:-2px 0 14px!important;
      }
      #pane-chantiers .yaya-suivi-tab{
        min-height:34px!important;
        padding:0 12px!important;
        border:1px solid #cbd5e1!important;
        border-radius:18px!important;
        background:#fff!important;
        color:#38516d!important;
        font-size:12px!important;
        font-weight:700!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-suivi-tab.on{
        background:#24436B!important;
        border-color:#24436B!important;
        color:#fff!important;
      }
      #pane-chantiers .yaya-suivi-count{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-width:20px!important;
        height:20px!important;
        margin-left:5px!important;
        padding:0 5px!important;
        border-radius:10px!important;
        background:rgba(36,67,107,.10)!important;
        font-size:10.5px!important;
      }
      #pane-chantiers .yaya-suivi-tab.on .yaya-suivi-count{
        background:rgba(255,255,255,.18)!important;
      }
      #pane-chantiers .yaya-docs-only-badge{
        display:inline-flex!important;
        align-items:center!important;
        height:24px!important;
        padding:0 8px!important;
        border-radius:12px!important;
        background:#eef1f4!important;
        border:1px solid #cfd5dc!important;
        color:#596674!important;
        font-size:10.5px!important;
        font-weight:700!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-docs-only-card .chantier-expense-btn,
      #pane-chantiers .yaya-docs-only-card .yaya-docs-hide{
        display:none!important;
      }
      #modalRoot .yaya-mode-suivi-box{
        display:grid!important;
        gap:6px!important;
        padding:10px!important;
        border:1px solid rgba(22,45,73,.14)!important;
        border-radius:8px!important;
        background:#fafbfd!important;
      }
      #modalRoot .yaya-mode-suivi-box small{
        opacity:.66!important;
        line-height:1.35!important;
      }
      @media(max-width:640px){
        #pane-chantiers .yaya-suivi-tabs{
          flex-wrap:nowrap!important;
          overflow-x:auto!important;
          padding-bottom:2px!important;
          scrollbar-width:none!important;
        }
        #pane-chantiers .yaya-suivi-tabs::-webkit-scrollbar{display:none!important}
        #pane-chantiers .yaya-suivi-tab{flex:0 0 auto!important;font-size:11px!important;padding:0 10px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function currentView(){
    let v='all';
    try{v=localStorage.getItem(VIEW_KEY)||'all';}catch(e){}
    return ['complet','documents','all'].includes(v)?v:'all';
  }

  function setCurrentView(v){
    if(!['complet','documents','all'].includes(v))v='all';
    try{localStorage.setItem(VIEW_KEY,v);}catch(e){}
    applyView();
  }

  function cardCid(card){
    if(!card)return '';
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const s=String(el.getAttribute('onclick')||'');
      const m=s.match(/(?:toggleChantier|delChantier|openAvenant|openDocumentModal|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return m[1];
    }
    return '';
  }

  function decorateDocsOnly(card,c){
    if(!card||!c)return;
    const docsOnly=modeOf(c)==='documents';
    card.classList.toggle('yaya-docs-only-card',docsOnly);

    const top=card.querySelector('.top');
    if(top){
      let badge=top.querySelector('.yaya-docs-only-badge');
      if(docsOnly && !badge){
        badge=document.createElement('span');
        badge.className='yaya-docs-only-badge';
        badge.textContent='Documents uniquement';
        const num=top.querySelector('.num');
        if(num&&num.nextSibling)top.insertBefore(badge,num.nextSibling);
        else top.appendChild(badge);
      }else if(!docsOnly && badge){
        badge.remove();
      }

      [...top.children].forEach(el=>{
        if(el.classList&&el.classList.contains('yaya-docs-only-badge'))return;
        const txt=String(el.textContent||'').trim().toLowerCase();
        const isMarge=txt.startsWith('marge');
        const isPct=/^-?\d+[\s\u202f]*%$/.test(txt.replace(/\s+/g,' '));
        if(isMarge||isPct)el.classList.toggle('yaya-docs-hide',docsOnly);
      });
    }

    if(!docsOnly){
      card.querySelectorAll('.yaya-docs-hide').forEach(el=>el.classList.remove('yaya-docs-hide'));
      return;
    }

    const kpis=card.querySelector('.kpis');
    if(kpis)kpis.classList.add('yaya-docs-hide');

    const toolbar=card.querySelector('.chantier-fin-toolbar');
    if(toolbar){
      [...toolbar.querySelectorAll('button')].forEach(btn=>{
        const txt=String(btn.textContent||'').toLowerCase();
        const oc=String(btn.getAttribute('onclick')||'');
        if(txt.includes('devis')||txt.includes('dépense')||txt.includes('depense')||oc.includes('openAvenant')||oc.includes('openAchat')){
          btn.classList.add('yaya-docs-hide');
        }
      });
    }

    const direct=[...card.children];
    let keep=true;
    for(const el of direct){
      if(el===top || el===toolbar)continue;
      const isHeader=el.classList && (el.classList.contains('seclabel')||el.classList.contains('section-header'));
      if(isHeader){
        const label=String(el.textContent||'').trim().toLowerCase();
        keep=label.includes('document');
        if(!keep)el.classList.add('yaya-docs-hide');
        continue;
      }
      if(!keep)el.classList.add('yaya-docs-hide');
    }
  }

  function ensureTabs(){
    if(!ready())return;
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    let tabs=pane.querySelector('.yaya-suivi-tabs');
    if(!tabs){
      tabs=document.createElement('div');
      tabs.className='yaya-suivi-tabs';
      tabs.innerHTML=`
        <button type="button" class="yaya-suivi-tab" data-view="complet">Chantiers suivis <span class="yaya-suivi-count" data-count="complet">0</span></button>
        <button type="button" class="yaya-suivi-tab" data-view="documents">Chantiers documents <span class="yaya-suivi-count" data-count="documents">0</span></button>
        <button type="button" class="yaya-suivi-tab" data-view="all">Tous les chantiers <span class="yaya-suivi-count" data-count="all">0</span></button>`;
      tabs.addEventListener('click',e=>{
        const btn=e.target.closest('.yaya-suivi-tab');
        if(btn)setCurrentView(btn.dataset.view||'all');
      });

      const searchLine=pane.querySelector('.yaya-chantier-search-line');
      const filtre=pane.querySelector('#filtreInput');
      const anchor=searchLine || (filtre&&filtre.parentElement);
      if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(tabs,anchor.nextSibling);
      else pane.insertBefore(tabs,pane.firstChild);
    }

    const full=S.chantiers.filter(c=>modeOf(c)==='complet').length;
    const docs=S.chantiers.filter(c=>modeOf(c)==='documents').length;
    const counts={complet:full,documents:docs,all:S.chantiers.length};
    tabs.querySelectorAll('[data-count]').forEach(el=>{const v=String(counts[el.dataset.count]||0);if(el.textContent!==v)el.textContent=v;});
    const view=currentView();
    tabs.querySelectorAll('.yaya-suivi-tab').forEach(btn=>btn.classList.toggle('on',btn.dataset.view===view));
  }

  function applyView(){
    if(!ready())return;
    normalizeExisting();
    ensureTabs();
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    const view=currentView();
    pane.querySelectorAll(':scope > .card').forEach(card=>{
      const cid=cardCid(card);
      const c=chantierByAnyId(cid);
      if(!c)return;
      decorateDocsOnly(card,c);
      const visible=view==='all'||modeOf(c)===view;
      const targetDisplay=visible?'':'none';
      if(card.style.display!==targetDisplay)card.style.display=targetDisplay;
    });
  }

  function insertCreateMode(){
    const mt=document.getElementById('chMarcheHT');
    if(!mt||document.getElementById('chModeSuivi'))return;
    const label=mt.closest('label');
    if(!label||!label.parentNode)return;
    const box=document.createElement('div');
    box.className='yaya-mode-suivi-box';
    box.innerHTML='<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Type de suivi<select class="inp" id="chModeSuivi"><option value="complet">Suivi complet — charges + documents + rentabilité</option><option value="documents">Documents uniquement — sans charges ni rentabilité</option></select></label><small>Le Marché HT reste utilisé dans Évolution CA dans les deux cas.</small>';
    label.insertAdjacentElement('afterend',box);
  }

  function insertEditMode(cid){
    const mt=document.getElementById('editChMarcheHT');
    if(!mt||document.getElementById('editChModeSuivi'))return;
    const c=chantierByAnyId(cid);if(!c)return;
    const label=mt.closest('label');
    if(!label||!label.parentNode)return;
    const box=document.createElement('div');
    box.className='yaya-mode-suivi-box';
    box.innerHTML='<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Type de suivi<select class="inp" id="editChModeSuivi"><option value="complet">Suivi complet — charges + documents + rentabilité</option><option value="documents">Documents uniquement — sans charges ni rentabilité</option></select></label><small>Le Marché HT reste utilisé dans Évolution CA dans les deux cas.</small>';
    label.insertAdjacentElement('afterend',box);
    const sel=document.getElementById('editChModeSuivi');
    if(sel)sel.value=modeOf(c);
  }

  function captureEditMode(cid){
    const c=chantierByAnyId(cid);if(!c)return;
    const sel=document.getElementById('editChModeSuivi');
    if(sel)c.modeSuivi=sel.value==='documents'?'documents':'complet';
  }

  function wrapFunctions(){
    if(typeof window.openChantierModal==='function' && !window.openChantierModal.__yayaModeWrapped){
      const original=window.openChantierModal;
      const wrapped=function(){
        const r=original.apply(this,arguments);
        setTimeout(insertCreateMode,0);
        return r;
      };
      wrapped.__yayaModeWrapped=true;
      window.openChantierModal=wrapped;
    }

    if(typeof window.addChantier==='function' && !window.addChantier.__yayaModeWrapped){
      const original=window.addChantier;
      const wrapped=async function(){
        const sel=document.getElementById('chModeSuivi');
        const mode=sel&&sel.value==='documents'?'documents':'complet';
        const arr=S.chantiers;
        const originalPush=arr.push;
        arr.push=function(){
          const items=[...arguments];
          items.forEach(x=>{if(x&&typeof x==='object')x.modeSuivi=mode;});
          return originalPush.apply(this,items);
        };
        try{return await original.apply(this,arguments);}
        finally{
          if(arr.push!==originalPush)arr.push=originalPush;
          setTimeout(applyView,0);
        }
      };
      wrapped.__yayaModeWrapped=true;
      window.addChantier=wrapped;
    }

    if(typeof window.openExistingChantierModal==='function' && !window.openExistingChantierModal.__yayaModeWrapped){
      const original=window.openExistingChantierModal;
      const wrapped=function(cid){
        const r=original.apply(this,arguments);
        setTimeout(()=>insertEditMode(cid),0);
        return r;
      };
      wrapped.__yayaModeWrapped=true;
      window.openExistingChantierModal=wrapped;
    }

    if(typeof window.saveExistingChantier==='function' && !window.saveExistingChantier.__yayaModeWrapped){
      const original=window.saveExistingChantier;
      const wrapped=async function(cid){
        captureEditMode(cid);
        const r=await original.apply(this,arguments);
        setTimeout(applyView,0);
        return r;
      };
      wrapped.__yayaModeWrapped=true;
      window.saveExistingChantier=wrapped;
    }

    if(typeof window.sendExistingChantierToPlanning==='function' && !window.sendExistingChantierToPlanning.__yayaModeWrapped){
      const original=window.sendExistingChantierToPlanning;
      const wrapped=async function(cid){
        captureEditMode(cid);
        return await original.apply(this,arguments);
      };
      wrapped.__yayaModeWrapped=true;
      window.sendExistingChantierToPlanning=wrapped;
    }
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      wrapFunctions();
      applyView();
    });
  }

  function install(){
    if(!ready())return setTimeout(install,150);
    installStyle();
    normalizeExisting();
    wrapFunctions();
    applyView();
    const obs=new MutationObserver(schedule);
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(schedule,250);
  }

  install();
})();
