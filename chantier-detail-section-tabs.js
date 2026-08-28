(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-detail-section-tabs-style';
  const STORAGE_PREFIX='yaya.chantier.detail.section.';
  const ORDER=['marche','depenses','charges','documents'];
  const LABELS={marche:'MarchÃ©',depenses:'DÃ©penses',charges:'Charges',documents:'Documents'};
  const EMPTY_LABELS={marche:'Aucun devis',depenses:'Aucune dÃ©pense',charges:'Aucune charge',documents:'Aucun document'};
  const EMPTY_META={marche:'0 â‚¬',depenses:'0 â‚¬',charges:'0 â‚¬',documents:'0'};

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
        touch-action:manipulation!important;
        -webkit-tap-highlight-color:transparent;
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

      .yaya-detail-section-tab[data-section="marche"]{
        background:#eef8f1!important;
        border-color:#acd5b8!important;
        color:#286b3e!important;
      }
      .yaya-detail-section-tab[data-section="marche"] small{background:#dcefe2!important}
      .yaya-detail-section-tab[data-section="marche"].on{background:#dff2e5!important;border-color:#65a878!important}

      .yaya-detail-section-tab[data-section="depenses"]{
        background:#fff0f3!important;
        border-color:#edb9c4!important;
        color:#96384c!important;
      }
      .yaya-detail-section-tab[data-section="depenses"] small{background:#f8dce3!important}
      .yaya-detail-section-tab[data-section="depenses"].on{background:#f9dfe6!important;border-color:#d6788c!important}

      .yaya-detail-section-tab[data-section="charges"]{
        background:#fff5e8!important;
        border-color:#edc58f!important;
        color:#935a08!important;
      }
      .yaya-detail-section-tab[data-section="charges"] small{background:#fde6c5!important}
      .yaya-detail-section-tab[data-section="charges"].on{background:#fde8cb!important;border-color:#d6963d!important}

      .yaya-detail-section-tab[data-section="documents"]{
        background:#eef6ff!important;
        border-color:#acc9eb!important;
        color:#285f96!important;
      }
      .yaya-detail-section-tab[data-section="documents"] small{background:#dcecff!important}
      .yaya-detail-section-tab[data-section="documents"].on{background:#deedff!important;border-color:#6e9fd6!important}

      .yaya-detail-section-tab[data-section] small{
        display:inline-flex!important;
        align-items:center!important;
        min-height:25px!important;
        padding:2px 9px!important;
        border-radius:999px!important;
      }

      .card[data-yaya-detail-section="marche"] > .yaya-detail-section-node:not([data-section="marche"]),
      .card[data-yaya-detail-section="depenses"] > .yaya-detail-section-node:not([data-section="depenses"]),
      .card[data-yaya-detail-section="documents"] > .yaya-detail-section-node:not([data-section="documents"]){
        display:none!important;
      }

      .card[data-yaya-detail-section="charges"] > .yaya-detail-section-node:not([data-section="charges"]){
        display:none!important;
      }

      .yaya-detail-empty-pane{
        display:none!important;
        padding:20px 14px!important;
        margin:0 0 8px!important;
        border:1px dashed #cbd5e1!important;
        border-radius:8px!important;
        background:#fafbfd!important;
        color:#718096!important;
        font-size:12.5px!important;
        text-align:center!important;
      }
      .card[data-yaya-detail-section="marche"] > .yaya-detail-empty-pane[data-section="marche"][data-empty="1"],
      .card[data-yaya-detail-section="depenses"] > .yaya-detail-empty-pane[data-section="depenses"][data-empty="1"],
      .card[data-yaya-detail-section="charges"] > .yaya-detail-empty-pane[data-section="charges"][data-empty="1"],
      .card[data-yaya-detail-section="documents"] > .yaya-detail-empty-pane[data-section="documents"][data-empty="1"]{
        display:block!important;
      }

      .yaya-detail-charges-pane{display:none!important;margin:0 0 8px!important}
      .card[data-yaya-detail-section="charges"] > .yaya-detail-charges-pane[data-empty="0"]{display:block!important}
      .yaya-detail-charge-row{
        display:grid!important;
        grid-template-columns:minmax(120px,1fr) 90px 110px!important;
        align-items:center!important;
        gap:12px!important;
        min-height:38px!important;
        padding:7px 12px!important;
        border-bottom:1px solid #e6ebf1!important;
        font-size:13px!important;
      }
      .yaya-detail-charge-row:last-child{border-bottom:0!important}
      .yaya-detail-charge-row strong{color:#1c2b48!important}
      .yaya-detail-charge-hours{text-align:right!important;color:#596579!important}
      .yaya-detail-charge-cost{text-align:right!important;color:#1c2b48!important;font-weight:700!important}

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
        .yaya-detail-charge-row{grid-template-columns:minmax(90px,1fr) 68px 88px!important;gap:8px!important;padding:7px 9px!important}
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
    if(text.startsWith('HISTORIQUE DES ECHANGES'))return 'documents';
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
    return text.replace(re,'').trim();
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
      if(!(el.classList&&(el.classList.contains('seclabel')||el.classList.contains('section-header'))))return;
      const key=keyForHeader(el);
      headers.push({el,index,key});
    });
    return headers.filter(h=>ORDER.includes(h.key)).map(target=>{
      const next=headers.find(h=>h.index>target.index);
      const end=next?next.index:children.length;
      return {
        key:target.key,
        header:target.el,
        meta:metaForHeader(target.el,target.key),
        nodes:children.slice(target.index+1,end).filter(n=>!n.classList?.contains('yaya-detail-empty-pane')&&!n.classList?.contains('yaya-detail-section-tabs'))
      };
    });
  }

  function loadActive(card){
    const cid=cardId(card);
    let saved='';
    if(cid){
      try{saved=localStorage.getItem(STORAGE_PREFIX+cid)||'';}catch(e){}
    }
    return ORDER.includes(saved)?saved:'marche';
  }

  function saveActive(card,key){
    const cid=cardId(card);
    if(!cid)return;
    try{localStorage.setItem(STORAGE_PREFIX+cid,key);}catch(e){}
  }

  function ensureEmptyPane(card,tabs,key){
    let pane=card.querySelector(':scope > .yaya-detail-empty-pane[data-section="'+key+'"]');
    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-empty-pane';
      pane.dataset.section=key;
      pane.textContent=EMPTY_LABELS[key];
      tabs.insertAdjacentElement('afterend',pane);
    }
    return pane;
  }

  function euro(value){
    return Math.round(Number(value)||0).toLocaleString('fr-FR')+' â‚¬';
  }

  function escapeHtml(value){
    const el=document.createElement('div');
    el.textContent=String(value||'');
    return el.innerHTML;
  }

  function isSubcontractInvoice(achat){
    if(!achat)return false;
    const type=normalise(achat.typeDoc);
    return type==='FACTURE SOUS-TRAITANT'
      || type==='FACTURE SOUS TRAITANT'
      || String(achat.sousTraitant||'').trim()!=='';
  }

  function achatsFor(card){
    const cid=cardId(card);
    if(!cid||typeof S==='undefined'||!Array.isArray(S.achats))return [];
    return S.achats.filter(a=>
      String(a.chantierId)===cid
      && a.statutValidation!=='A_VALIDER'
      && a.statutValidation!=='REJETEE'
      && a.statutValidation!=='DOUBLON'
    );
  }

  function depensesFor(card){
    return achatsFor(card).filter(a=>!isSubcontractInvoice(a));
  }

  function achatIdFromNode(node){
    const action=node&&node.querySelector('[onclick*="editAchat"],[onclick*="editMontantAchat"],[onclick*="delAchat"]');
    const raw=String(action&&action.getAttribute('onclick')||'');
    const match=raw.match(/(?:editAchat|editMontantAchat|delAchat)\(['\"]([^'\"]+)/);
    return match?String(match[1]):'';
  }

  function chargesFor(card){
    const cid=cardId(card);
    if(!cid||typeof S==='undefined')return [];
    const salaries=Array.isArray(S.salaries)?S.salaries:[];
    const heures=Array.isArray(S.heures)?S.heures:[];
    const groups=new Map();

    heures.forEach(h=>{
      if(h.type!=='chantier'||String(h.ref)!==cid)return;
      const salarie=salaries.find(s=>String(s.id)===String(h.salarieId));
      if(!salarie||salarie.type==='Sous-traitant')return;
      const hours=Number(h.heures)||0;
      if(hours<=0)return;
      const rate=(h.taux!==''&&h.taux!=null)?Number(h.taux):(Number(salarie.tauxHoraire)||0);
      const key=String(salarie.id);
      const row=groups.get(key)||{nom:String(salarie.nom||'Ouvrier'),heures:0,cout:0,type:'main-oeuvre'};
      row.heures+=hours;
      row.cout+=hours*(Number(rate)||0);
      groups.set(key,row);
    });

    const mainOeuvre=[...groups.values()].sort((a,b)=>a.nom.localeCompare(b.nom,'fr'));
    const sousTraitance=achatsFor(card).filter(isSubcontractInvoice).map(a=>({
      nom:String(a.sousTraitant||a.fournisseur||'Sous-traitant'),
      heures:null,
      cout:(a.typeDoc==='Avoir'?-1:1)*(Number(a.montantHT)||0),
      type:'sous-traitance',
      detail:String(a.designation||'Facture de sous-traitance')
    }));
    return mainOeuvre.concat(sousTraitance);
  }

  function updateSummaryKpis(card,chargeRows,depenseRows){
    const kpis=card.querySelector(':scope > .kpis');
    if(!kpis)return;
    const stats=[...kpis.querySelectorAll(':scope > .stat')];
    const statByLabel=label=>stats.find(stat=>{
      const small=stat.querySelector('small');
      return normalise(small&&small.textContent)===normalise(label);
    });
    const marketStat=statByLabel('MarchÃ© HT');
    const purchasesStat=statByLabel('Achats');
    const chargesStat=statByLabel('Charges');
    const marginStat=stats.find(stat=>{
      const small=stat.querySelector('small');
      return normalise(small&&small.textContent).startsWith('MARGE');
    });
    if(!marketStat||!purchasesStat||!chargesStat||!marginStat)return;

    const cid=cardId(card);
    let chantier=null;
    try{chantier=S.chantiers.find(c=>String(c.id)===cid)||null;}catch(e){}
    const market=Number(chantier&&chantier.montantMarcheHT)||0;
    const purchases=depenseRows.reduce((total,a)=>
      total+(a.typeDoc==='Avoir'?-1:1)*(Number(a.montantHT)||0),0);
    const charges=chargeRows.reduce((total,row)=>total+(Number(row.cout)||0),0);
    const hours=chargeRows
      .filter(row=>row.type==='main-oeuvre')
      .reduce((total,row)=>total+(Number(row.heures)||0),0);
    const margin=market-purchases-charges;
    const percent=market?Math.round(margin/market*100):0;

    const setValue=(stat,value)=>{
      const node=stat.querySelector('b');
      if(node&&node.textContent!==euro(value))node.textContent=euro(value);
    };
    const setSub=(stat,value)=>{
      let node=stat.querySelector('.sub:not(.yaya-signed-quote-kpi)');
      if(!node){node=document.createElement('span');node.className='sub';stat.appendChild(node);}
      if(node.textContent!==value)node.textContent=value;
    };

    setValue(purchasesStat,purchases);
    setSub(purchasesStat,depenseRows.length+' document'+(depenseRows.length>1?'s':''));
    setValue(chargesStat,charges);
    setSub(chargesStat,hours.toLocaleString('fr-FR')+' h saisies');
    setValue(marginStat,margin);
    setSub(marginStat,percent+' % du marchÃ©');
    marginStat.classList.toggle('marge-pos',margin>=0);
    marginStat.classList.toggle('marge-neg',margin<0);
  }

  function ensureChargesPane(card,tabs,rows){
    let pane=card.querySelector(':scope > .yaya-detail-charges-pane');
    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-section-node yaya-detail-charges-pane';
      pane.dataset.section='charges';
      tabs.insertAdjacentElement('afterend',pane);
    }
    pane.dataset.empty=rows.length?'0':'1';
    const html=rows.map(row=>
      '<div class="yaya-detail-charge-row">'
        +'<strong>'+escapeHtml(row.nom)+(row.type==='sous-traitance'&&row.detail?'<small style="display:block;font-weight:500;color:#718096">'+escapeHtml(row.detail)+'</small>':'')+'</strong>'
        +'<span class="yaya-detail-charge-hours">'+(row.type==='sous-traitance'?'Sous-traitance':row.heures.toLocaleString('fr-FR')+' h')+'</span>'
        +'<span class="yaya-detail-charge-cost">'+euro(row.cout)+'</span>'
      +'</div>'
    ).join('');
    if(pane.innerHTML!==html)pane.innerHTML=html;
    return pane;
  }

  function applySectionFast(card,key){
    if(!ORDER.includes(key))key='marche';
    if(card.dataset.yayaDetailSection!==key)card.dataset.yayaDetailSection=key;

    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(tabs){
      tabs.querySelectorAll('.yaya-detail-section-tab').forEach(btn=>{
        const on=btn.dataset.section===key;
        if(btn.classList.contains('on')!==on)btn.classList.toggle('on',on);
        const wanted=on?'true':'false';
        if(btn.getAttribute('aria-selected')!==wanted)btn.setAttribute('aria-selected',wanted);
      });
    }

    setTimeout(function(){saveActive(card,key);},0);
  }

  function bindInstantButton(btn,card,key){
    if(btn.dataset.instantBound==='1')return;
    btn.dataset.instantBound='1';

    btn.addEventListener('pointerdown',function(e){
      if(e.button!=null&&e.button!==0)return;
      e.preventDefault();
      applySectionFast(card,key);
    });

    btn.addEventListener('click',function(e){
      // Clavier / accessibilitÃ©. Les clics pointeur sont dÃ©jÃ  traitÃ©s au pointerdown.
      if(e.detail===0)applySectionFast(card,key);
    });
  }

  function ensureTabs(card){
    if(!card||card.classList.contains('yaya-docs-only-card'))return;
    const sections=sectionsFor(card);

    // Une carte repliÃ©e n'a aucune section de dÃ©tail : ne pas lui ajouter les boutons.
    if(!sections.length)return;

    const byKey=new Map(sections.map(s=>[s.key,s]));
    const chargeRows=chargesFor(card);
    const depenseRows=depensesFor(card);
    const achats=achatsFor(card);
    sections.forEach(section=>{
      section.header.style.display='none';
      section.nodes.forEach(node=>{
        if(section.key==='depenses'){
          const achatId=achatIdFromNode(node);
          const achat=achats.find(a=>String(a.id)===achatId);
          if(isSubcontractInvoice(achat)){
            node.style.setProperty('display','none','important');
            node.dataset.yayaSubcontractInvoice='1';
            return;
          }
        }
        node.classList.add('yaya-detail-section-node');
        node.dataset.section=section.key;
        // Nettoie les display inline posÃ©s par les anciennes versions du patch.
        if(node.style.display==='none')node.style.removeProperty('display');
      });
    });

    let tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs){
      tabs=document.createElement('div');
      tabs.className='yaya-detail-section-tabs';
      tabs.setAttribute('role','tablist');
      const firstHeader=sections.map(s=>s.header).sort((a,b)=>[...card.children].indexOf(a)-[...card.children].indexOf(b))[0];
      if(firstHeader&&firstHeader.parentNode)firstHeader.parentNode.insertBefore(tabs,firstHeader);
      else card.appendChild(tabs);
    }

    ORDER.forEach(key=>{
      const section=byKey.get(key);
      let btn=tabs.querySelector('[data-section="'+key+'"]');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.className='yaya-detail-section-tab';
        btn.dataset.section=key;
        btn.setAttribute('role','tab');
        btn.innerHTML='<strong></strong><small></small>';
        tabs.appendChild(btn);
      }

      bindInstantButton(btn,card,key);

      const strong=btn.querySelector('strong');
      const small=btn.querySelector('small');
      const label=LABELS[key];
      const meta=key==='charges'
        ? euro(chargeRows.reduce((total,row)=>total+row.cout,0))
        : key==='depenses'
          ? euro(depenseRows.reduce((total,a)=>total+(a.typeDoc==='Avoir'?-1:1)*(Number(a.montantHT)||0),0))
          : ((section&&section.meta)?section.meta:EMPTY_META[key]);
      if(strong&&strong.textContent!==label)strong.textContent=label;
      if(small&&small.textContent!==meta)small.textContent=meta;

      const empty=ensureEmptyPane(card,tabs,key);
      empty.dataset.empty=key==='charges'
        ? (chargeRows.length?'0':'1')
        : key==='depenses'
          ? (depenseRows.length?'0':'1')
          : (section?'0':'1');
      if(empty.textContent!==EMPTY_LABELS[key])empty.textContent=EMPTY_LABELS[key];
    });

    ensureChargesPane(card,tabs,chargeRows);
    updateSummaryKpis(card,chargeRows,depenseRows);

    const active=ORDER.includes(card.dataset.yayaDetailSection)
      ? card.dataset.yayaDetailSection
      : loadActive(card);
    applySectionFast(card,active);
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

    // Surveille uniquement les vrais ajouts/suppressions issus d'un rendu Yaya.
    // Le patch lui-mÃªme ne remplace plus les enfants des boutons Ã  chaque passe,
    // ce qui Ã©vite la boucle MutationObserver de l'ancienne version.
    new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    window.addEventListener('yaya:data-refreshed',schedule);
  }

  install();
})();
