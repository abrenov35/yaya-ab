(function(){
  'use strict';

  const STYLE_ID='yaya-documents-page-compact-fix';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-documents .card{overflow:hidden!important}
      #pane-documents .achligne.ligR{
        display:grid!important;
        grid-template-columns:128px 140px 150px minmax(0,1fr) 90px 44px!important;
        gap:8px!important;
        align-items:center!important;
        width:100%!important;
        height:50px!important;
        min-height:50px!important;
        max-height:50px!important;
        padding:6px 0!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      #pane-documents .achligne.ligR>*{
        min-width:0!important;
        max-width:100%!important;
        max-height:38px!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      #pane-documents .achligne.ligR .badge{
        display:block!important;
        width:100%!important;
        min-width:0!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      #pane-documents .achligne.ligR .des{
        display:block!important;
        min-width:0!important;
        width:100%!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        line-height:1.2!important;
        font-size:11.5px!important;
      }
      #pane-documents .achligne.ligR>small:nth-last-child(2){
        white-space:nowrap!important;
        text-align:center!important;
      }
      #pane-documents .achligne.ligR>span:last-child{
        display:flex!important;
        justify-content:center!important;
        align-items:center!important;
        overflow:visible!important;
        max-height:none!important;
      }
      @media(max-width:760px){
        #pane-documents{overflow-x:auto!important}
        #pane-documents .card{min-width:780px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function docByRow(row){
    const id=String(row.dataset.id||'');
    try{
      if(window.S&&Array.isArray(S.documents))return S.documents.find(d=>String(d.id)===id)||null;
    }catch(e){}
    return null;
  }

  function formatDate(v){
    const s=String(v||'').slice(0,10);
    if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s.split('-').reverse().join('/');
    return s||'—';
  }

  function compact(){
    const rows=[...document.querySelectorAll('#pane-documents .card .achligne.ligR')];
    rows.forEach((row,index)=>{
      row.style.display=index<10?'grid':'none';
      const cells=[...row.children];
      if(cells.length>=6){
        const d=docByRow(row);
        const first=cells[0];
        const dateCell=cells[4];
        const typeText=String((d&&d.type)||'Document').trim()||'Document';
        const dateText=formatDate(d&&d.date);
        first.textContent=typeText.toUpperCase();
        first.title=typeText;
        dateCell.textContent=dateText;
        dateCell.title=dateText;
      }
      const title=row.querySelector('.des');
      if(title){
        const full=String(title.textContent||'').replace(/\s+/g,' ').trim();
        if(full)title.title=full;
      }
    });
  }

  function run(){installStyle();compact();}
  run();
  setTimeout(run,50);
  setTimeout(run,250);
  setTimeout(run,1000);

  const root=document.getElementById('pane-documents')||document.body||document.documentElement;
  new MutationObserver(()=>requestAnimationFrame(compact)).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',compact);
})();
