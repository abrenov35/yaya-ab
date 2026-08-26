(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-topline-v3';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-topline{
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        width:100%!important;
        margin:8px 0 14px!important;
        flex-wrap:nowrap!important;
      }
      #pane-chantiers .yaya-chantier-topline > .yaya-suivi-tabs{
        flex:0 0 auto!important;
        margin:0!important;
        padding:0!important;
        gap:7px!important;
        flex-wrap:nowrap!important;
      }
      #pane-chantiers .yaya-chantier-topline > .yaya-chantier-search-line{
        flex:1 1 0!important;
        width:auto!important;
        min-width:0!important;
        margin:0!important;
        gap:9px!important;
      }
      #pane-chantiers .yaya-chantier-topline .yaya-search-wrap{
        flex:1 1 auto!important;
        min-width:150px!important;
      }

      /* Style unique de la barre Chantiers : plus de bleu foncé */
      #pane-chantiers .yaya-chantier-topline .yaya-suivi-tab,
      #pane-chantiers .yaya-chantier-topline #yayaCreateChantierBtn{
        height:40px!important;
        min-height:40px!important;
        padding:0 13px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:5px!important;
        border-radius:9px!important;
        border:1px solid #cbd6e3!important;
        background:#f7f9fc!important;
        color:#31567d!important;
        box-shadow:none!important;
        font-size:12px!important;
        font-weight:700!important;
        line-height:1!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-chantier-topline .yaya-suivi-tab:hover,
      #pane-chantiers .yaya-chantier-topline #yayaCreateChantierBtn:hover{
        background:#edf3f9!important;
        border-color:#b8c8da!important;
        color:#294f78!important;
      }
      #pane-chantiers .yaya-chantier-topline .yaya-suivi-tab.on{
        background:#e8f0fa!important;
        border-color:#b8cbe0!important;
        color:#294f78!important;
      }
      #pane-chantiers .yaya-chantier-topline .yaya-suivi-count,
      #pane-chantiers .yaya-chantier-topline .yaya-suivi-tab.on .yaya-suivi-count{
        min-width:20px!important;
        height:20px!important;
        padding:0 5px!important;
        border-radius:10px!important;
        background:#dbe7f3!important;
        color:#31567d!important;
      }
      #pane-chantiers .yaya-chantier-topline #yayaCreateChantierBtn{
        background:#eef4fb!important;
        border-color:#bfd0e4!important;
        color:#294f78!important;
      }
      #pane-chantiers .yaya-chantier-topline #filtreInput{
        height:40px!important;
        min-height:40px!important;
        border-radius:9px!important;
        border:1px solid #cbd6e3!important;
        background:#fff!important;
        color:#294766!important;
        box-shadow:none!important;
      }
      #pane-chantiers .yaya-chantier-topline #filtreInput:focus{
        border-color:#aebfd2!important;
        box-shadow:0 0 0 3px rgba(49,86,125,.08)!important;
        outline:none!important;
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
