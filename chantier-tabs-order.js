(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-topline-v2';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-topline{
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        width:100%!important;
        margin:8px 0 14px!important;
        flex-wrap:nowrap!important;
      }
      #pane-chantiers .yaya-chantier-topline > .yaya-suivi-tabs{
        flex:0 0 auto!important;
        margin:0!important;
        padding:0!important;
        flex-wrap:nowrap!important;
      }
      #pane-chantiers .yaya-chantier-topline > .yaya-chantier-search-line{
        flex:1 1 0!important;
        width:auto!important;
        min-width:0!important;
        margin:0!important;
        gap:10px!important;
      }
      #pane-chantiers .yaya-chantier-topline .yaya-search-wrap{
        flex:1 1 auto!important;
        min-width:150px!important;
      }
      #pane-chantiers .yaya-chantier-topline #filtreInput,
      #pane-chantiers .yaya-chantier-topline #yayaCreateChantierBtn{
        height:40px!important;
        min-height:40px!important;
      }
      @media(max-width:860px){
        #pane-chantiers .yaya-chantier-topline{
          flex-wrap:wrap!important;
          gap:8px!important;
        }
        #pane-chantiers .yaya-chantier-topline > .yaya-suivi-tabs,
        #pane-chantiers .yaya-chantier-topline > .yaya-chantier-search-line{
          flex:1 1 100%!important;
          width:100%!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function alignTopLine(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    const tabs=pane.querySelector('.yaya-suivi-tabs');
    const searchLine=pane.querySelector('.yaya-chantier-search-line');
    if(!tabs||!searchLine)return;

    let row=pane.querySelector('.yaya-chantier-topline');
    if(!row){
      row=document.createElement('div');
      row.className='yaya-chantier-topline';
      const anchor=tabs.parentNode===pane?tabs:(searchLine.parentNode===pane?searchLine:pane.firstChild);
      if(anchor&&anchor.parentNode===pane)pane.insertBefore(row,anchor);
      else pane.insertBefore(row,pane.firstChild);
    }

    if(tabs.parentNode!==row)row.appendChild(tabs);
    if(searchLine.parentNode!==row)row.appendChild(searchLine);
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      alignTopLine();
    });
  }

  const obs=new MutationObserver(schedule);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(alignTopLine,50);
  setTimeout(alignTopLine,250);
})();
