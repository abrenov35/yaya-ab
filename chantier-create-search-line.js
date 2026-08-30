(function(){
  'use strict';

  const brand=document.querySelector('.hdr .brand span');
  if(brand)brand.textContent='AB RENOV 35';

  const STYLE_ID='yaya-create-chantier-search-line-main-v4';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .hdr .tab[data-tab="heures"]{display:none!important;}
      #pane-chantiers .yaya-chantier-search-line{display:flex!important;align-items:center!important;gap:10px!important;margin:10px 0 14px!important;width:100%!important;max-width:100%!important;overflow:visible!important;}
      #pane-chantiers .yaya-chantier-search-line[hidden]{display:none!important;}
      #pane-chantiers .yaya-chantier-search-line .yaya-search-wrap{position:relative!important;flex:1 1 0!important;width:auto!important;max-width:none!important;min-width:0!important;margin:0!important;}
      #pane-chantiers .yaya-chantier-search-line #filtreInput{display:block!important;width:100%!important;max-width:none!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0 14px!important;box-sizing:border-box!important;}
      #pane-chantiers .yaya-search-icon{display:none!important;}
      #pane-chantiers .yaya-chantier-search-line #yayaHeuresChantierBtn,
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{display:inline-flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;width:auto!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0 15px!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important;border-radius:8px!important;font-size:13px!important;font-weight:700!important;}
      #pane-chantiers .yaya-chantier-search-line #yayaHeuresChantierBtn{background:#3151a5!important;color:#fff!important;border:1px solid #6f87c5!important;}
      #pane-chantiers .yaya-chantier-search-line #yayaHeuresChantierBtn:hover{background:#29478f!important;}
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{background:#24436B!important;color:#fff!important;border:1px solid #24436B!important;}
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn:hover{background:#1c3657!important;border-color:#1c3657!important;}
      #pane-chantiers #yayaCreateChantierWrap:empty{display:none!important;}
      #pane-chantiers .card .top button[onclick*="toggleChantier"].yaya-chantier-view-eye{width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a9c8e8!important;border-radius:7px!important;background:#f3f8fd!important;color:#174d7d!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:14px!important;line-height:1!important;}
      @media(max-width:640px){
        #pane-chantiers .yaya-chantier-search-line{gap:7px!important;flex-wrap:nowrap!important;}
        #pane-chantiers .yaya-chantier-search-line .yaya-search-wrap{flex:1 1 105px!important;width:105px!important;min-width:72px!important;max-width:none!important;}
        #pane-chantiers .yaya-chantier-search-line #yayaHeuresChantierBtn,
        #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{padding:0 8px!important;font-size:11px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function isMainChantiersPage(){try{if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.size==='number')return expChantiers.size===0;}catch(e){}return true;}
  function removeOrphanSearchIcons(pane){pane.querySelectorAll('.yaya-search-icon').forEach(el=>el.remove());[...pane.querySelectorAll('span')].forEach(el=>{const t=String(el.textContent||'').trim();if(t==='🔍'||t==='🔎'||t==='⌕')el.remove();});}

  function ensureCreateButton(pane){
    const buttons=[...pane.querySelectorAll('#yayaCreateChantierBtn')];buttons.slice(1).forEach(el=>el.remove());
    let btn=buttons[0]||null;
    if(!btn){btn=document.createElement('button');btn.id='yayaCreateChantierBtn';btn.type='button';btn.className='btnp';btn.addEventListener('click',()=>{if(typeof window.openChantierModal==='function')window.openChantierModal();});}
    btn.textContent='➕ Ajouter un chantier';return btn;
  }

  function ensureHoursButton(pane){
    let btn=pane.querySelector('#yayaHeuresChantierBtn');
    if(!btn){
      btn=document.createElement('button');btn.id='yayaHeuresChantierBtn';btn.type='button';btn.className='btn2';btn.textContent='⏱️ Heures';
      btn.addEventListener('click',()=>{
        try{tab='heures';location.hash='heures';if(typeof window.render==='function')window.render();}
        catch(e){const native=document.querySelector('.hdr .tab[data-tab="heures"]');if(native)native.click();}
      });
    }
    return btn;
  }

  function normalizeChantierViewButtons(pane){
    pane.querySelectorAll('.card .top button[onclick*="toggleChantier"]').forEach(btn=>{
      if(String(btn.textContent||'').trim()!=='Voir')return;
      btn.textContent='👁️';
      btn.title='Voir le chantier';
      btn.setAttribute('aria-label','Voir le chantier');
      btn.classList.add('yaya-chantier-view-eye');
    });
  }

  function bindSyntheticSearch(input){if(!input||input.dataset.yayaSearchBound==='1')return;input.dataset.yayaSearchBound='1';input.addEventListener('input',()=>{try{filtreChantier=input.value;}catch(e){}try{if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.clear==='function')expChantiers.clear();}catch(e){}if(typeof window.renderChantiers==='function')window.renderChantiers();});}
  function ensureSingleSearch(pane){
    const inputs=[...pane.querySelectorAll('#filtreInput')];let input=inputs[0]||null;inputs.slice(1).forEach(el=>{const parent=el.parentElement;el.remove();if(parent&&parent.classList&&parent.classList.contains('yaya-search-wrap')&&!parent.querySelector('#filtreInput'))parent.remove();});
    if(!input){input=document.createElement('input');input.id='filtreInput';input.className='inp';input.type='search';input.autocomplete='off';input.placeholder='Rechercher un chantier...';try{input.value=String(filtreChantier||'');}catch(e){input.value='';}bindSyntheticSearch(input);}
    let wrap=input.closest('.yaya-search-wrap');if(!wrap){const previousParent=input.parentElement;wrap=document.createElement('div');wrap.className='yaya-search-wrap';if(previousParent)previousParent.insertBefore(wrap,input);wrap.appendChild(input);if(previousParent&&previousParent!==pane){[...previousParent.querySelectorAll(':scope > span')].forEach(el=>{const t=String(el.textContent||'').trim();if(t==='🔍'||t==='🔎'||t==='⌕')el.remove();});if(previousParent.children.length===0&&!String(previousParent.textContent||'').trim())previousParent.remove();}}
    wrap.querySelectorAll('.yaya-search-icon').forEach(el=>el.remove());return wrap;
  }

  function syncMainLine(){
    const pane=document.getElementById('pane-chantiers');if(!pane)return;removeOrphanSearchIcons(pane);
    const rows=[...pane.querySelectorAll('.yaya-chantier-search-line')];rows.slice(1).forEach(el=>el.remove());let row=rows[0]||null;
    const searchWrap=ensureSingleSearch(pane);if(!row){row=document.createElement('div');row.className='yaya-chantier-search-line';pane.insertBefore(row,pane.firstChild);}if(searchWrap.parentNode!==row)row.appendChild(searchWrap);
    const hours=ensureHoursButton(pane);if(hours.parentNode!==row)row.appendChild(hours);
    const create=ensureCreateButton(pane);if(create.parentNode!==row)row.appendChild(create);
    const oldWrap=document.getElementById('yayaCreateChantierWrap');if(oldWrap&&oldWrap!==row)oldWrap.remove();row.hidden=!isMainChantiersPage();
    normalizeChantierViewButtons(pane);
  }

  function wrapAfterRender(name){const fn=window[name];if(typeof fn!=='function'||fn.__yayaMainLineWrapped)return true;const wrapped=function(){const result=fn.apply(this,arguments);setTimeout(syncMainLine,0);return result;};wrapped.__yayaMainLineWrapped=true;window[name]=wrapped;return true;}
  function install(){syncMainLine();const ok1=wrapAfterRender('renderChantiers');const ok2=wrapAfterRender('toggleChantier');if(!ok1||!ok2)setTimeout(install,180);}
  install();
})();
