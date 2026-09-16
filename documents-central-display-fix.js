(function(){
  'use strict';
  if(window.__yayaCentralDocumentsDisplayV1)return;
  window.__yayaCentralDocumentsDisplayV1=true;

  function text(v){return String(v==null?'':v).trim();}
  function norm(v){return text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();}
  function canon(v){
    const raw=text(v);
    if(!raw)return '';
    try{return typeof window.yayaCanonicalChantierId==='function'?text(window.yayaCanonicalChantierId(raw)||raw):raw;}catch(e){return raw;}
  }
  function esc(v){
    const el=document.createElement('div');
    el.textContent=String(v==null?'':v);
    return el.innerHTML;
  }
  function cardId(card){
    if(!card)return '';
    const nodes=Array.from(card.querySelectorAll('[onclick]'));
    for(const el of nodes){
      const raw=text(el.getAttribute('onclick'));
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return canon(m[1]);
    }
    try{
      const f=canon(typeof focusChantier!=='undefined'?focusChantier:'');
      if(f)return f;
    }catch(e){}
    if(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers)){
      const cardText=norm(card.textContent);
      const matches=S.chantiers.filter(function(c){
        const n=norm(c&&c.nom);
        return n&&cardText.indexOf(n)>=0;
      });
      if(matches.length===1)return canon(matches[0].id);
    }
    return '';
  }
  function rowsFor(cid){
    if(!cid||typeof S==='undefined'||!S||!Array.isArray(S.documents))return [];
    return S.documents.filter(function(d){
      return canon(d&&d.chantierId)===cid&&norm(d&&d.type)!=='MAIL';
    }).sort(function(a,b){return text(b&&b.date).localeCompare(text(a&&a.date))||text(b&&b.id).localeCompare(text(a&&a.id));});
  }
  function dateFr(v){
    const s=text(v).slice(0,10);
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?m[3]+'/'+m[2]+'/'+m[1]:(s||'—');
  }
  function renderCard(card){
    const tabs=card&&card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    const cid=cardId(card);
    if(!cid)return;
    const rows=rowsFor(cid);
    if(!rows.length)return;

    let pane=card.querySelector(':scope > .yaya-detail-documents-pane');
    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-section-node yaya-detail-documents-pane';
      pane.dataset.section='documents';
      tabs.insertAdjacentElement('afterend',pane);
    }
    pane.dataset.empty='0';
    pane.dataset.yayaCentralDisplay='1';
    pane.innerHTML=rows.map(function(d){
      const lien=text(d&&d.lien);
      const fichier=text(d&&d.sujet)||text(d&&d.titre)||'Document';
      const detail=text(d&&d.titre);
      return '<div class="yaya-detail-document-row" data-yaya-central-doc="1" data-document-id="'+esc(d&&d.id||'')+'">'
        +'<strong>'+esc(fichier)+(detail&&detail!==fichier?'<small>'+esc(detail)+'</small>':'')+'</strong>'
        +'<span class="yaya-detail-charge-hours">'+esc(d&&d.type||'Document')+'</span>'
        +'<span class="yaya-detail-charge-cost">'+esc(dateFr(d&&d.date))+'</span>'
        +'<button type="button" class="yaya-detail-document-view" data-lien="'+esc(lien)+'"'+(lien?'':' disabled')+'>Voir</button>'
      +'</div>';
    }).join('');

    pane.querySelectorAll('.yaya-detail-document-view:not(:disabled)').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        const lien=text(btn.dataset.lien);
        if(!lien)return;
        try{
          if(typeof window.voirPiece==='function')window.voirPiece(lien);
          else if(typeof voirPiece==='function')voirPiece(lien);
          else window.open(lien,'_blank','noopener');
        }catch(err){window.open(lien,'_blank','noopener');}
      });
    });

    const empty=card.querySelector(':scope > .yaya-detail-empty-pane[data-section="documents"]');
    if(empty)empty.dataset.empty='0';
  }
  function renderAll(){
    const root=document.getElementById('pane-chantiers');
    if(!root)return;
    root.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(renderCard);
  }
  let timer=0;
  function schedule(delay){
    clearTimeout(timer);
    timer=setTimeout(function(){timer=0;renderAll();},Math.max(0,Number(delay)||0));
  }

  window.addEventListener('yaya:data-refreshed',function(){schedule(30);setTimeout(renderAll,180);});
  document.addEventListener('click',function(e){
    const t=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-section-tab[data-section="documents"],#pane-chantiers [onclick*="toggleChantier("]'):null;
    if(!t)return;
    schedule(30);
    setTimeout(renderAll,180);
    setTimeout(renderAll,500);
  },true);

  const root=document.getElementById('pane-chantiers');
  if(root){
    new MutationObserver(function(){schedule(60);}).observe(root,{childList:true,subtree:true});
  }

  [0,200,600,1200,2500].forEach(function(ms){setTimeout(renderAll,ms);});
})();
