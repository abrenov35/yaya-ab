(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-detail-section-tabs-style';
  const STORAGE_PREFIX='yaya.chantier.detail.section.';
  const ORDER=['marche','depenses','documents'];
  const LABELS={marche:'Marché',depenses:'Dépenses',documents:'Documents'};

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-detail-section-tabs{
        display:flex!important;
        align-items:stretch!important;
        gap:8px!important;
        margin:12px 0 8px!important;
        padding:0!important;
      }
      .yaya-detail-section-tab{
        flex:1 1 0!important;
        min-width:0!important;
        min-height:42px!important;
        padding:7px 12px!important;
        border:1px solid #c8d3e1!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#183b68!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:8px!important;
        font-size:12px!important;
        font-weight:700!important;
        line-height:1.15!important;
        white-space:nowrap!important;
      }
      .yaya-detail-section-tab small{
        font-size:11px!important;
        font-weight:700!important;
        opacity:.72!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .yaya-detail-section-tab.on{
        background:#294796!important;
        border-color:#294796!important;
        color:#fff!important;
      }
      .yaya-detail-section-tab.on small{opacity:.9!important}
      @media(max-width:640px){
        .yaya-detail-section-tabs{
          gap:6px!important;
          overflow-x:auto!important;
          -webkit-overflow-scrolling:touch!important;
          scrollbar-width:none!important;
        }
        .yaya-detail-section-tabs::-webkit-scrollbar{display:none!important}
        .yaya-detail-section-tab{
          flex:0 0 auto!important;
          min-width:112px!important;
          padding:7px 9px!important;
          font-size:11px!important;
        }
        .yaya-detail-section-tab small{font-size:10px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function normalise(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toUpperCase().replace(/\s+/g,' ').trim();
  }

  function keyForHeader(el){
    const text=normalise(el&&el.textContent);
    if(text.startsWith('MARCHE'))return 'marche';
    if(text.startsWith('DEPENSES')||text.startsWith('DEPENSE'))return 'depenses';
    if(text.startsWith('DOCUMENTS')||text.startsWith('DOCUMENT'))return 'documents';
    return '';
  }

  function metaForHeader(el,key){
    if(!el)return '';
    const children=[...el.children].map(x=>String(x.textContent||'').trim()).filter(Boolean);
    if(children.length>1)return children.slice(1).join(' ');
    let text=String(el.textContent||'').replace(/\s+/g,' ').trim();
    const label=LABELS[key]||'';
    const re=new RegExp('^'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');
    text=text.replace(re,'').trim();
    return text;
  }

  function cardId(card){
    if(!card)return '';
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
    }
    try{
      if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);
    }catch(e){}
    return '';
  }

  function sectionsFor(card){
    const children=[...card.children];
    const headers=[];
    children.forEach((el,index)=>{
      if(!(el.classList&& (el.classList.contains('seclabel')||el.classList.contains('section-header'))))return;
      const key=keyForHeader(el);
      headers.push({el,index,key});
    });

    const targets=headers.filter(h=>ORDER.includes(h.key));
    return targets.map(target=>{
      const next=headers.find(h=>h.index>target.index);
      const end=next?next.index:children.length;
      return {
        key:target.key,
        header:target.el,
        meta:metaForHeader(target.el,target.key),
        nodes:children.slice(target.index+1,end)
      };
    });
  }

  function loadActive(card,available){
    const cid=cardId(card);
    let saved='';
    if(cid){
      try{saved=localStorage.getItem(STORAGE_PREFIX+cid)||'';}catch(e){}
    }
    if(available.includes(saved))return saved;
    return available.includes('marche')?'marche':available[0];
  }

  function saveActive(card,key){
    const cid=cardId(card);
    if(!cid)return;
    try{localStorage.setItem(STORAGE_PREFIX+cid,key);}catch(e){}
  }

  function applySection(card,key){
    const sections=sectionsFor(card);
    const available=sections.map(s=>s.key);
    if(!available.includes(key))key=available[0];
    if(!key)return;

    sections.forEach(section=>{
      section.header.style.display='none';
      const show=section.key===key;
      section.nodes.forEach(node=>{
        node.style.display=show?'':'none';
      });
    });

    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(tabs){
      tabs.querySelectorAll('.yaya-detail-section-tab').forEach(btn=>{
        btn.classList.toggle('on',btn.dataset.section===key);
        btn.setAttribute('aria-selected',btn.dataset.section===key?'true':'false');
      });
    }
    card.dataset.yayaDetailSection=key;
    saveActive(card,key);
  }

  function ensureTabs(card){
    if(!card||card.classList.contains('yaya-docs-only-card'))return;
    const sections=sectionsFor(card);
    const byKey=new Map(sections.map(s=>[s.key,s]));
    const available=ORDER.filter(k=>byKey.has(k));
    if(available.length<2)return;

    sections.forEach(s=>{s.header.style.display='none';});

    let tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs){
      tabs=document.createElement('div');
      tabs.className='yaya-detail-section-tabs';
      tabs.setAttribute('role','tablist');
      const firstHeader=sections.map(s=>s.header).sort((a,b)=>[...card.children].indexOf(a)-[...card.children].indexOf(b))[0];
      if(firstHeader&&firstHeader.parentNode)firstHeader.parentNode.insertBefore(tabs,firstHeader);
      else card.appendChild(tabs);
    }

    available.forEach(key=>{
      const section=byKey.get(key);
      let btn=tabs.querySelector('[data-section="'+key+'"]');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.className='yaya-detail-section-tab';
        btn.dataset.section=key;
        btn.setAttribute('role','tab');
        btn.addEventListener('click',function(){applySection(card,key);});
        tabs.appendChild(btn);
      }
      btn.replaceChildren();
      const strong=document.createElement('strong');
      strong.textContent=LABELS[key];
      btn.appendChild(strong);
      if(section.meta){
        const small=document.createElement('small');
        small.textContent=section.meta;
        btn.appendChild(small);
      }
    });

    [...tabs.querySelectorAll('.yaya-detail-section-tab')].forEach(btn=>{
      if(!available.includes(btn.dataset.section))btn.remove();
    });

    const active=available.includes(card.dataset.yayaDetailSection)
      ? card.dataset.yayaDetailSection
      : loadActive(card,available);
    applySection(card,active);
  }

  let scheduled=false;
  function decorate(){
    scheduled=false;
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    pane.querySelectorAll('.card').forEach(ensureTabs);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(decorate);
  }

  function install(){
    installStyle();
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,150);return;}
    decorate();
    new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    window.addEventListener('yaya:data-refreshed',schedule);
  }

  install();
})();
