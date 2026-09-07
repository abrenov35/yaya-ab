(function(){
  'use strict';

  const STYLE_ID='yaya-market-view-link-fix-v4';
  const DELETED='__YAYA_DEVIS_INITIAL_SUPPRIME__';

  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-market-row{
        grid-template-columns:minmax(120px,1fr) 90px 110px 28px 28px!important;
      }
      #pane-chantiers .yaya-detail-market-row .yaya-detail-document-view{
        display:none!important;
      }
      #pane-chantiers .yaya-detail-market-row > .yaya-market-title-link{
        color:#174d7d!important;
        cursor:pointer!important;
        text-decoration:none!important;
        border-radius:4px!important;
        outline:none!important;
      }
      #pane-chantiers .yaya-detail-market-row > .yaya-market-title-link:hover{
        text-decoration:underline!important;
      }
      #pane-chantiers .yaya-detail-market-row > .yaya-market-title-link:focus-visible{
        outline:2px solid #8db7df!important;
        outline-offset:2px!important;
      }
      #pane-chantiers .yaya-detail-market-row > .yaya-market-title-link[data-yaya-market-deleted="1"]{
        pointer-events:none!important;
      }
      .yaya-market-no-piece-overlay{
        position:fixed;inset:0;z-index:125000;display:flex;align-items:center;justify-content:center;
        padding:18px;background:rgba(22,45,73,.48);
      }
      .yaya-market-no-piece-box{
        width:min(420px,calc(100vw - 32px));background:#fff;border-radius:15px;
        box-shadow:0 18px 55px rgba(0,0,0,.28);padding:24px;color:#162d49;text-align:center;
      }
      .yaya-market-no-piece-box h3{margin:0 0 8px;font-size:19px}
      .yaya-market-no-piece-box p{margin:0 0 18px;color:#68778a;font-size:13px;line-height:1.45}
      .yaya-market-no-piece-box button{min-width:120px;min-height:40px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:750}
      @media(max-width:640px){
        #pane-chantiers .yaya-detail-market-row{
          grid-template-columns:minmax(90px,1fr) 68px 88px 28px 28px!important;
          gap:8px!important;
          padding:7px 9px!important;
        }
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

  function docsChantier(chantierId){
    try{
      if(typeof S==='undefined'||!Array.isArray(S.documents))return [];
      return S.documents.filter(d=>
        String(d&&d.chantierId||'')===String(chantierId||'')
        && norm(d&&d.type)!=='MAIL'
        && !!firstLink(d)
      );
    }catch(e){return [];}
  }

  function documentFallback(chantierId,rowText){
    const docs=docsChantier(chantierId);
    if(!docs.length)return '';
    const wanted=norm(rowText);
    const candidats=docs.filter(d=>{
      const texte=norm([d.type,d.titre,d.sujet,d.categorie,d.origine,d.designation,d.nom].filter(Boolean).join(' '));
      if(texte.includes('DEVIS')||texte.includes('MARCHE'))return true;
      if(wanted&&texte&&wanted.split(' ').some(x=>x.length>=5&&texte.includes(x)))return true;
      return false;
    });
    const tries=candidats.length?candidats:docs;
    for(const d of tries){
      const lien=firstLink(d);
      if(lien)return lien;
    }
    return '';
  }

  function resolveLink(kind,rowId,current,rowText){
    const direct=http(current);
    if(direct)return direct;
    try{
      if(typeof S==='undefined')return '';
      if(kind==='main'&&Array.isArray(S.chantiers)){
        const c=S.chantiers.find(x=>String(x&&x.id)===String(rowId));
        if(String(c&&c.notes||'')===DELETED)return '';
        return firstLink(c)||documentFallback(rowId,rowText);
      }
      if(kind==='avenant'&&Array.isArray(S.avenants)){
        const v=S.avenants.find(x=>String(x&&x.id)===String(rowId));
        const own=firstLink(v);
        if(own)return own;
        return documentFallback(v&&v.chantierId,rowText||v&&v.libelle);
      }
    }catch(e){}
    return '';
  }

  function noPieceModal(){
    document.querySelector('.yaya-market-no-piece-overlay')?.remove();
    const overlay=document.createElement('div');
    overlay.className='yaya-market-no-piece-overlay';
    overlay.innerHTML='<div class="yaya-market-no-piece-box" role="dialog" aria-modal="true"><div style="font-size:28px;margin-bottom:8px">📄</div><h3>Aucune pièce jointe</h3><p>Le devis existe dans Yaya, mais aucun fichier de devis n’est actuellement lié à cette ligne.</p><button type="button">Fermer</button></div>';
    document.body.appendChild(overlay);
    const close=()=>overlay.remove();
    overlay.querySelector('button').onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  }

  function openRow(row,title,edit,view){
    const kind=String(edit&&edit.dataset.kind||'');
    const id=String(edit&&edit.dataset.rowId||'');
    const current=String((view&&view.dataset&&view.dataset.lien)||title.dataset.yayaMarketLinkUrl||'');
    const url=resolveLink(kind,id,current,row&&row.textContent||'');
    if(url){
      title.dataset.yayaMarketLinkUrl=url;
      if(view&&view.dataset)view.dataset.lien=url;
      if(typeof voirPiece==='function')voirPiece(url);
      else window.open(url,'_blank','noopener');
    }else{
      noPieceModal();
    }
  }

  function fixRow(row){
    const view=row.querySelector('.yaya-detail-document-view');
    const edit=row.querySelector('.yaya-detail-document-edit');
    const title=row.querySelector(':scope > strong');
    if(!edit||!title)return;

    const kind=String(edit.dataset.kind||'');
    const rowId=String(edit.dataset.rowId||'');
    let deleted=false;
    try{
      if(kind==='main'&&typeof S!=='undefined'&&Array.isArray(S.chantiers)){
        const c=S.chantiers.find(x=>String(x&&x.id)===rowId);
        deleted=String(c&&c.notes||'')===DELETED&&!(Number(c&&c.montantDevisHT)||0);
      }
    }catch(e){}

    title.classList.add('yaya-market-title-link');
    title.dataset.yayaMarketDeleted=deleted?'1':'0';
    if(deleted)return;

    const current=String(view&&view.dataset&&view.dataset.lien||title.dataset.yayaMarketLinkUrl||'');
    const lien=resolveLink(kind,rowId,current,row.textContent||'');
    title.dataset.yayaMarketLinkUrl=lien;
    title.dataset.yayaMarketLink=lien?'1':'0';
    title.title='Voir le devis';
    title.setAttribute('role','link');
    title.setAttribute('tabindex','0');
    title.setAttribute('aria-label','Voir le devis');

    if(view){
      view.dataset.yayaMarketDeleted=deleted?'1':'0';
      view.dataset.lien=lien;
      view.dataset.yayaMarketLink=lien?'1':'0';
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
          openRow(row,title,edit,view);
        },true);
      }
    }

    if(!title._yayaMarketTitleLinkBound){
      title._yayaMarketTitleLinkBound=true;
      title.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        const currentRow=title.closest('.yaya-detail-market-row');
        openRow(currentRow,title,currentRow&&currentRow.querySelector('.yaya-detail-document-edit'),currentRow&&currentRow.querySelector('.yaya-detail-document-view'));
      },true);
      title.addEventListener('keydown',function(e){
        if(e.key!=='Enter'&&e.key!==' ')return;
        e.preventDefault();
        e.stopPropagation();
        const currentRow=title.closest('.yaya-detail-market-row');
        openRow(currentRow,title,currentRow&&currentRow.querySelector('.yaya-detail-document-edit'),currentRow&&currentRow.querySelector('.yaya-detail-document-view'));
      },true);
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
