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
        grid-template-columns:110px 140px 150px minmax(0,1fr) 80px 44px!important;
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
        max-height:38px!important;
        overflow:hidden!important;
      }
      #pane-documents .achligne.ligR .badge{
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
        #pane-documents .card{min-width:760px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function compact(){
    const rows=[...document.querySelectorAll('#pane-documents .card .achligne.ligR')];
    rows.forEach((row,index)=>{
      row.style.display=index<10?'grid':'none';
      const title=row.querySelector('.des');
      if(title){
        const full=String(title.textContent||'').replace(/\s+/g,' ').trim();
        if(full)title.title=full;
      }
    });
  }

  function run(){
    installStyle();
    compact();
  }

  run();
  setTimeout(run,50);
  setTimeout(run,250);
  setTimeout(run,1000);

  const root=document.getElementById('pane-documents')||document.body||document.documentElement;
  new MutationObserver(()=>requestAnimationFrame(compact)).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',compact);
})();
