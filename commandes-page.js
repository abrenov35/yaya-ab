(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-commandes-style';

  function esc(value){
    const el=document.createElement('div');
    el.textContent=String(value==null?'':value);
    return el.innerHTML;
  }

  function euro(value){
    return (Number(value)||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
  }

  function dateFr(value){
    const raw=String(value||'').trim();
    const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[3]+'/'+m[2]+'/'+m[1] : (raw||'—');
  }

  function cardId(card){
    try{
      if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);
    }catch(e){}
    if(!card)return '';
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
    }
    return '';
  }

  function commandesFor(card){
    const cid=cardId(card);
    if(!cid||typeof S==='undefined'||!Array.isArray(S.commandes))return [];
    return S.commandes
      .filter(c=>String(c.chantierId||'')===cid)
      .filter(c=>String(c.statutValidation||'')!=='REJETEE'&&String(c.statutValidation||'')!=='DOUBLON')
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.id||'').localeCompare(String(a.id||'')));
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-detail-section-tab[data-section="commandes"]{background:#f5f1e5!important;border-color:#d7c690!important;color:#745e18!important}
      .yaya-detail-section-tab[data-section="commandes"] small{display:inline-flex!important;background:#ebe1bd!important}
      .yaya-detail-section-tab[data-section="commandes"].on{background:#eadfae!important;border-color:#b99b35!important;color:#59470f!important;box-shadow:inset 0 0 0 1px #b99b35!important}
      .yaya-detail-commandes-pane{display:none!important;margin:0 0 8px!important}
      .yaya-detail-commandes-pane.yaya-commandes-visible{display:block!important}
      .yaya-detail-commandes-empty{display:none!important;padding:20px 14px!important;margin:0 0 8px!important;border:1px dashed #cbd5e1!important;border-radius:8px!important;background:#fafbfd!important;color:#718096!important;font-size:12.5px!important;text-align:center!important}
      .yaya-detail-commandes-empty.yaya-commandes-visible{display:block!important}
      .yaya-detail-commande-row{display:grid!important;grid-template-columns:minmax(130px,1fr) minmax(180px,2fr) 95px 82px 32px!important;align-items:center!important;gap:10px!important;min-height:38px!important;padding:7px 12px!important;border-bottom:1px solid #e6ebf1!important;font-size:13px!important}
      .yaya-detail-commande-row:last-child{border-bottom:0!important}
      .yaya-detail-commande-row strong{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#1c2b48!important}
      .yaya-detail-commande-desc{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#596579!important}
      .yaya-detail-commande-montant{text-align:right!important;font-weight:700!important;white-space:nowrap!important;color:#1c2b48!important}
      .yaya-detail-commande-date{text-align:right!important;font-size:10.5px!important;color:#7a8798!important;white-space:nowrap!important}
      .yaya-detail-commande-view{width:28px!important;height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a9c8e8!important;border-radius:7px!important;background:#f3f8fd!important;color:#174d7d!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important}
      .yaya-detail-commande-view::before{content:"👁︎"!important;font-family:"Segoe UI Symbol","Arial Unicode MS",sans-serif!important;font-size:15px!important;line-height:1!important;color:#174d7d!important}
      @media(max-width:640px){.yaya-detail-commande-row{grid-template-columns:minmax(95px,1fr) minmax(130px,1.6fr) 82px 72px 28px!important;gap:7px!important;padding:7px 9px!important}}
    `;
    document.head.appendChild(style);
  }

  function removeGlobalCommandes(){
    document.querySelectorAll('.hdr .tabs .tab[data-tab="commandes"]').forEach(el=>el.remove());
    document.querySelectorAll('.hdr .tabs button,.hdr .tabs a').forEach(el=>{
      if(String(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()==='commandes')el.remove();
    });
    const globalPane=document.getElementById('pane-commandes');
    if(globalPane)globalPane.remove();
  }

  function renderPane(pane,rows){
    const signature=JSON.stringify(rows.map(c=>[c.id||'',c.fournisseur||'',c.designation||'',c.pieceNom||'',c.date||'',c.montantHT||0,c.lien||'',c.oneDriveWebUrl||'']));
    if(pane._yayaRowsSignature===signature)return;
    pane.innerHTML=rows.map(c=>{
      const lien=String(c.lien||c.oneDriveWebUrl||'').trim();
      return '<div class="yaya-detail-commande-row">'
        +'<strong title="'+esc(c.fournisseur||'')+'">'+esc(c.fournisseur||'Fournisseur non renseigné')+'</strong>'
        +'<span class="yaya-detail-commande-desc" title="'+esc(c.designation||c.pieceNom||'')+'">'+esc(c.designation||c.pieceNom||'Bon de commande')+'</span>'
        +'<span class="yaya-detail-commande-montant">'+euro(c.montantHT)+'</span>'
        +'<span class="yaya-detail-commande-date">'+esc(dateFr(c.date))+'</span>'
        +'<button type="button" class="yaya-detail-commande-view" title="Voir" aria-label="Voir" data-lien="'+esc(lien)+'"'+(lien?'':' disabled')+'>Voir</button>'
        +'</div>';
    }).join('');
    pane._yayaRowsSignature=signature;
    pane.querySelectorAll('.yaya-detail-commande-view:not(:disabled)').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const lien=String(btn.dataset.lien||'');
        if(!lien)return;
        try{if(typeof voirPiece==='function')voirPiece(lien);else window.open(lien,'_blank','noopener,noreferrer');}
        catch(err){window.open(lien,'_blank','noopener,noreferrer');}
      });
    });
  }

  function ensureCard(card){
    if(!card||card.classList.contains('yaya-docs-only-card'))return;
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    const depenses=tabs.querySelector('.yaya-detail-section-tab[data-section="depenses"]');
    const marche=tabs.querySelector('.yaya-detail-section-tab[data-section="marche"]');
    if(!depenses||!marche)return;

    let btn=tabs.querySelector('.yaya-commande-tab-placeholder,[data-section="commandes"]');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='yaya-detail-section-tab yaya-commande-tab-placeholder';
      tabs.insertBefore(btn,depenses);
    }
    btn.dataset.section='commandes';
    btn.removeAttribute('data-yaya-placeholder');
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-label','Commande');

    const rows=commandesFor(card);
    const total=rows.reduce((sum,c)=>sum+(Number(c.montantHT)||0),0);
    const btnSig=rows.length+'|'+total;
    if(btn._yayaCommandeSignature!==btnSig){
      btn.innerHTML='<strong>Commande</strong><small>'+euro(total)+'</small>';
      btn._yayaCommandeSignature=btnSig;
    }

    let pane=card.querySelector(':scope > .yaya-detail-commandes-pane');
    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-commandes-pane';
      tabs.insertAdjacentElement('afterend',pane);
    }
    renderPane(pane,rows);

    let empty=card.querySelector(':scope > .yaya-detail-commandes-empty');
    if(!empty){
      empty=document.createElement('div');
      empty.className='yaya-detail-commandes-empty';
      empty.textContent='Aucune commande';
      pane.insertAdjacentElement('afterend',empty);
    }
    empty.dataset.empty=rows.length?'0':'1';
  }

  function hideCommandes(card){
    if(!card)return;
    const pane=card.querySelector(':scope > .yaya-detail-commandes-pane');
    const empty=card.querySelector(':scope > .yaya-detail-commandes-empty');
    if(pane)pane.classList.remove('yaya-commandes-visible');
    if(empty)empty.classList.remove('yaya-commandes-visible');
  }

  function activate(card){
    if(!card)return;
    ensureCard(card);
    const rows=commandesFor(card);
    const pane=card.querySelector(':scope > .yaya-detail-commandes-pane');
    const empty=card.querySelector(':scope > .yaya-detail-commandes-empty');

    card.querySelectorAll(':scope > .yaya-detail-section-node').forEach(node=>node.style.setProperty('display','none','important'));
    card.querySelectorAll(':scope > .yaya-detail-empty-pane').forEach(node=>node.style.setProperty('display','none','important'));
    card.querySelectorAll(':scope > .yaya-detail-section-tabs .yaya-detail-section-tab').forEach(btn=>{
      const on=btn.dataset.section==='commandes';
      btn.classList.toggle('on',on);
      btn.setAttribute('aria-selected',on?'true':'false');
    });

    if(pane){
      renderPane(pane,rows);
      pane.classList.toggle('yaya-commandes-visible',rows.length>0);
    }
    if(empty)empty.classList.toggle('yaya-commandes-visible',rows.length===0);
  }

  let scheduled=false;
  function decorate(){
    scheduled=false;
    removeGlobalCommandes();
    installStyle();
    const root=document.getElementById('pane-chantiers');
    if(!root)return;
    root.querySelectorAll('.card').forEach(ensureCard);
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(decorate);
  }

  document.addEventListener('click',e=>{
    const cmd=e.target&&e.target.closest?e.target.closest('.yaya-detail-section-tab[data-section="commandes"],.yaya-commande-tab-placeholder'):null;
    if(cmd){
      e.preventDefault();
      e.stopPropagation();
      if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
      activate(cmd.closest('.card'));
      return;
    }
    const native=e.target&&e.target.closest?e.target.closest('.yaya-detail-section-tab[data-section]:not([data-section="commandes"])'):null;
    if(native)hideCommandes(native.closest('.card'));
  },true);

  installStyle();
  removeGlobalCommandes();
  schedule();
  const root=document.getElementById('pane-chantiers')||document.documentElement;
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
  setTimeout(schedule,100);
  setTimeout(schedule,500);
  setTimeout(schedule,1200);
})();
