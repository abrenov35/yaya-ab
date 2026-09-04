(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-detail-search-style';
  const WRAP_CLASS='yaya-detail-search-wrap';
  const INPUT_CLASS='yaya-detail-search-input';
  const ROW_SELECTORS=[
    '.yaya-detail-markets-pane > .yaya-detail-market-row',
    '.yaya-detail-commandes-pane > .yaya-detail-commande-row',
    '.yaya-detail-expenses-pane > .yaya-detail-expense-row',
    '.yaya-detail-charges-pane > .yaya-detail-charge-row',
    '.yaya-detail-documents-pane > .yaya-detail-document-row',
    '.yaya-detail-mails-pane > .yaya-detail-mail-row'
  ].join(',');

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){
      style=document.createElement('style');
      style.id=STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent=`
      #pane-chantiers .${WRAP_CLASS}{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        margin:8px 0 10px!important;
        width:100%!important;
      }
      #pane-chantiers .${WRAP_CLASS} .${INPUT_CLASS}{
        flex:1 1 auto!important;
        width:100%!important;
        min-width:0!important;
        height:38px!important;
        padding:0 38px 0 12px!important;
        border:1px solid #cbd7e5!important;
        border-radius:9px!important;
        background:#fff!important;
        color:#17263c!important;
        font:500 13px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
        outline:none!important;
        box-sizing:border-box!important;
      }
      #pane-chantiers .${WRAP_CLASS} .${INPUT_CLASS}:focus{
        border-color:#6f9fce!important;
        box-shadow:0 0 0 3px rgba(74,124,174,.12)!important;
      }
      #pane-chantiers .${WRAP_CLASS} .yaya-detail-search-clear{
        flex:0 0 32px!important;
        width:32px!important;
        height:32px!important;
        min-width:32px!important;
        padding:0!important;
        margin-left:-40px!important;
        border:0!important;
        border-radius:7px!important;
        background:transparent!important;
        color:#6d7d90!important;
        font-size:18px!important;
        line-height:1!important;
        box-shadow:none!important;
      }
      #pane-chantiers .${WRAP_CLASS} .yaya-detail-search-clear:hover{
        background:#eef3f8!important;
        color:#27384f!important;
      }
      @media(max-width:760px){
        #pane-chantiers .${WRAP_CLASS}{margin:7px 0 9px!important}
        #pane-chantiers .${WRAP_CLASS} .${INPUT_CLASS}{height:40px!important;font-size:14px!important}
      }
    `;
  }

  function normalise(value){
    return String(value||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .replace(/\s+/g,' ')
      .trim();
  }

  function rowText(row){
    return normalise([
      row.textContent||'',
      row.getAttribute('title')||'',
      row.getAttribute('aria-label')||'',
      ...Array.from(row.querySelectorAll('[title],[aria-label]')).map(el=>
        (el.getAttribute('title')||'')+' '+(el.getAttribute('aria-label')||'')
      )
    ].join(' '));
  }

  function apply(card){
    if(!card)return;
    const input=card.querySelector(':scope > .'+WRAP_CLASS+' .'+INPUT_CLASS);
    if(!input)return;
    const q=normalise(input.value);

    card.querySelectorAll(ROW_SELECTORS).forEach(row=>{
      if(!q || rowText(row).includes(q)){
        row.style.removeProperty('display');
      }else{
        row.style.setProperty('display','none','important');
      }
    });
  }

  function ensure(card){
    if(!card)return;
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;

    let wrap=card.querySelector(':scope > .'+WRAP_CLASS);
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className=WRAP_CLASS;

      const input=document.createElement('input');
      input.type='search';
      input.className=INPUT_CLASS;
      input.placeholder='Rechercher…';
      input.autocomplete='off';
      input.spellcheck=false;
      input.setAttribute('aria-label','Rechercher dans la fiche chantier');

      const clear=document.createElement('button');
      clear.type='button';
      clear.className='yaya-detail-search-clear';
      clear.textContent='×';
      clear.title='Effacer la recherche';
      clear.setAttribute('aria-label','Effacer la recherche');

      wrap.append(input,clear);

      input.addEventListener('input',()=>apply(card));
      input.addEventListener('search',()=>apply(card));
      clear.addEventListener('click',()=>{
        input.value='';
        apply(card);
        input.focus();
      });
    }

    if(tabs.nextElementSibling!==wrap){
      tabs.insertAdjacentElement('afterend',wrap);
    }

    apply(card);
  }

  function scan(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    pane.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(card=>{
      ensure(card);
      apply(card);
    });
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      scan();
    });
  }

  function install(){
    installStyle();
    const pane=document.getElementById('pane-chantiers');
    if(!pane){
      setTimeout(install,150);
      return;
    }
    scan();
    new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    window.addEventListener('yaya:data-refreshed',schedule);
  }

  install();
})();
