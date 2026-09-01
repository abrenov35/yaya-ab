(function(){
  'use strict';

  const STYLE_ID='yaya-market-view-link-fix-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-market-row .yaya-detail-document-view[data-yaya-market-link="1"]{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:28px!important;
        min-width:28px!important;
        max-width:28px!important;
        height:28px!important;
        min-height:28px!important;
        padding:0!important;
        border:1px solid #a9c8e8!important;
        border-radius:7px!important;
        background:#f3f8fd!important;
        color:#174d7d!important;
        font-size:15px!important;
        line-height:1!important;
        opacity:1!important;
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-market-row .yaya-detail-document-view[data-yaya-market-link="1"]::before,
      #pane-chantiers .yaya-detail-market-row .yaya-detail-document-view[data-yaya-market-link="1"]::after{
        content:none!important;
        display:none!important;
      }
      #pane-chantiers .yaya-detail-market-row .yaya-detail-document-view[data-yaya-market-link="0"]{
        visibility:hidden!important;
        pointer-events:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function norm(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
  }

  function http(v){
    const s=String(v||'').trim();
    return /^https?:\/\//i.test(s)?s:'';
  }

  function firstLink(obj){
    if(!obj)return '';
    const keys=[
      'lien','notes','lienDrive','oneDriveWebUrl','webUrl','url','fileUrl','pieceUrl','documentUrl',
      'devisLien','lienDevis','urlDevis','devisUrl','pjUrl','pieceJointe','pieceJointeUrl','attachmentUrl'
    ];
    for(const key of keys){
      const found=http(obj[key]);
      if(found)return found;
    }
    return '';
  }

  function documentFallback(chantierId){
    try{
      if(typeof S==='undefined'||!Array.isArray(S.documents))return '';
      const docs=S.documents.filter(d=>String(d&&d.chantierId||'')===String(chantierId||''));
      const candidats=docs.filter(d=>{
        const texte=norm([d.type,d.titre,d.sujet,d.categorie,d.origine].filter(Boolean).join(' '));
        return texte.includes('DEVIS')||texte.includes('MARCHE');
      });
      const tries=candidats.concat(docs);
      for(const d of tries){
        const lien=firstLink(d);
        if(lien)return lien;
      }
    }catch(e){}
    return '';
  }

  function resolveLink(kind,rowId,current){
    const direct=http(current);
    if(direct)return direct;
    try{
      if(typeof S==='undefined')return '';
      if(kind==='main'&&Array.isArray(S.chantiers)){
        const c=S.chantiers.find(x=>String(x&&x.id)===String(rowId));
        return firstLink(c)||documentFallback(rowId);
      }
      if(kind==='avenant'&&Array.isArray(S.avenants)){
        const v=S.avenants.find(x=>String(x&&x.id)===String(rowId));
        const own=firstLink(v);
        if(own)return own;
        return documentFallback(v&&v.chantierId);
      }
    }catch(e){}
    return '';
  }

  function fixRow(row){
    const view=row.querySelector('.yaya-detail-document-view');
    const edit=row.querySelector('.yaya-detail-document-edit');
    if(!view||!edit)return;
    const kind=String(edit.dataset.kind||'');
    const rowId=String(edit.dataset.rowId||'');
    const lien=resolveLink(kind,rowId,view.dataset.lien||'');

    if(lien){
      view.dataset.lien=lien;
      view.dataset.yayaMarketLink='1';
      view.disabled=false;
      view.removeAttribute('disabled');
      view.textContent='👁';
      view.title='Voir le devis';
      view.setAttribute('aria-label','Voir le devis');
      if(!view._yayaMarketLinkFixBound){
        view._yayaMarketLinkFixBound=true;
        view.addEventListener('click',function(e){
          e.preventDefault();
          e.stopPropagation();
          const url=http(view.dataset.lien||'');
          if(url&&typeof voirPiece==='function')voirPiece(url);
          else if(url)window.open(url,'_blank','noopener');
        },true);
      }
    }else{
      view.dataset.yayaMarketLink='0';
      view.disabled=true;
      view.textContent='';
      view.title='Aucun devis lié';
      view.setAttribute('aria-label','Aucun devis lié');
    }
  }

  let scheduled=false;
  function run(){
    scheduled=false;
    document.querySelectorAll('#pane-chantiers .yaya-detail-market-row').forEach(fixRow);
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(run);
  }

  run();
  const pane=document.getElementById('pane-chantiers');
  if(pane)new MutationObserver(schedule).observe(pane,{childList:true,subtree:true,attributes:true,attributeFilter:['data-lien','disabled']});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
