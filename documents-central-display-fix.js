(function(){
  'use strict';
  if(window.__yayaCentralDocumentsDisplayV2)return;
  window.__yayaCentralDocumentsDisplayV2=true;
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
  function buildIndex(){
    const map=new Map();
    if(typeof S==='undefined'||!S||!Array.isArray(S.documents))return map;
    S.documents.forEach(function(d){
      if(norm(d&&d.type)==='MAIL')return;
      const cid=canon(d&&d.chantierId);
      if(!cid)return;
      if(!map.has(cid))map.set(cid,[]);
      map.get(cid).push(d);
    });
    map.forEach(function(list){
      list.sort(function(a,b){
        return text(b&&b.date).localeCompare(text(a&&a.date))||text(b&&b.id).localeCompare(text(a&&a.id));
      });
    });
    return map;
  }
  function rowsFor(cid,index){
    if(!cid)return [];
    if(index&&index.has(cid))return index.get(cid);
    const map=buildIndex();
    return map.get(cid)||[];
  }
  function rowsSignature(rows){
    return rows.map(function(d){
      return [
        text(d&&d.id),text(d&&d.lien),text(d&&d.type),text(d&&d.date),
        text(d&&d.sujet),text(d&&d.titre)
      ].join('|');
    }).join('||');
  }
  function dateFr(v){
    const s=text(v).slice(0,10);
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?m[3]+'/'+m[2]+'/'+m[1]:(s||'—');
  }
  function renderCard(card,index){
    const tabs=card&&card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    const cid=cardId(card);
    if(!cid)return;
    const rows=rowsFor(cid,index);

    let pane=card.querySelector(':scope > .yaya-detail-documents-pane');
    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-section-node yaya-detail-documents-pane';
      pane.dataset.section='documents';
      tabs.insertAdjacentElement('afterend',pane);
    }

    const empty=card.querySelector(':scope > .yaya-detail-empty-pane[data-section="documents"]');
    if(!rows.length){
      pane.dataset.empty='1';
      pane.dataset.yayaCentralDisplay='1';
      if(pane.dataset.yayaCentralSignature!==''){
        pane.dataset.yayaCentralSignature='';
        if(pane.childNodes.length)pane.replaceChildren();
      }
      if(empty)empty.dataset.empty='1';
      return;
    }

    const signature=rowsSignature(rows);
    pane.dataset.empty='0';
    pane.dataset.yayaCentralDisplay='1';
    if(pane.dataset.yayaCentralSignature===signature){
      if(empty)empty.dataset.empty='0';
      return;
    }
    pane.dataset.yayaCentralSignature=signature;
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

    if(empty)empty.dataset.empty='0';
  }
  function renderAll(){
    const root=document.getElementById('pane-chantiers');
    if(!root||root.offsetParent===null)return;
    const index=buildIndex();
    root.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(function(card){renderCard(card,index);});
  }
  let timer=0;
  function schedule(delay){
    clearTimeout(timer);
    timer=setTimeout(function(){timer=0;renderAll();},Math.max(0,Number(delay)||0));
  }

  window.addEventListener('yaya:data-refreshed',function(e){
    const tabs=e&&e.detail&&Array.isArray(e.detail.tabs)?e.detail.tabs:null;
    if(tabs&&tabs.length&&!tabs.includes('documents')&&!tabs.includes('chantiers'))return;
    schedule(60);
  });

  document.addEventListener('click',function(e){
    const t=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-section-tab[data-section="documents"],#pane-chantiers [onclick*="toggleChantier("]'):null;
    if(!t)return;
    const card=t.closest&&t.closest('.card');
    setTimeout(function(){
      if(card&&card.isConnected)renderCard(card,buildIndex());
    },40);
  },true);

  const root=document.getElementById('pane-chantiers');
  if(root){
    new MutationObserver(function(records){
      let external=false;
      for(const record of records){
        const target=record.target&&record.target.nodeType===1?record.target:null;
        // Ignorer les mutations générées par notre propre rendu Documents.
        if(target&&target.closest&&target.closest('.yaya-detail-documents-pane[data-yaya-central-display="1"]'))continue;
        if(record.addedNodes&&record.addedNodes.length){
          for(const node of record.addedNodes){
            if(node&&node.nodeType===1&&(
              node.matches?.('.card,.yaya-detail-section-tabs')||
              node.querySelector?.('.card,.yaya-detail-section-tabs')
            )){external=true;break;}
          }
        }
        if(external)break;
      }
      if(external)schedule(70);
    }).observe(root,{childList:true,subtree:true});
  }

  setTimeout(renderAll,80);
  setTimeout(renderAll,500);
})();
