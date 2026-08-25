(function(){
  'use strict';
  const id='yaya-chantier-toolbar-style-v1';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .chantier-fin-toolbar{
      display:flex!important;
      align-items:center!important;
      gap:8px!important;
      flex-wrap:wrap!important;
      width:100%!important;
      margin-top:12px!important;
      padding:10px 0 4px!important;
      border-top:1px solid rgba(22,45,73,.10)!important;
    }
    #pane-chantiers .chantier-fin-toolbar > button{
      height:36px!important;
      min-height:36px!important;
      margin:0!important;
      padding:0 13px!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:6px!important;
      border-radius:8px!important;
      font-size:12.5px!important;
      font-weight:650!important;
      line-height:1!important;
      white-space:nowrap!important;
      box-shadow:none!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .btnp{
      order:1!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .btn2:not(.chantier-archive-btn):not(.yaya-edit-chantier-btn){
      order:2!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .yaya-edit-chantier-btn{
      order:3!important;
      margin-left:auto!important;
      background:#f7f9fc!important;
      border:1px solid rgba(22,45,73,.20)!important;
      color:var(--navy)!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .chantier-archive-btn{
      order:4!important;
      background:#fff8f7!important;
      border:1px solid rgba(179,53,44,.24)!important;
      color:#9b2f28!important;
    }
    #pane-chantiers .chantier-fin-toolbar > button:hover{
      filter:brightness(.98);
    }
    @media(max-width:640px){
      #pane-chantiers .chantier-fin-toolbar{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        gap:7px!important;
      }
      #pane-chantiers .chantier-fin-toolbar > button{
        width:100%!important;
        min-width:0!important;
        margin:0!important;
        padding:0 8px!important;
        font-size:11.5px!important;
      }
      #pane-chantiers .chantier-fin-toolbar > .yaya-edit-chantier-btn{
        margin-left:0!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
