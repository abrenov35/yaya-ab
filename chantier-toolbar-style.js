(function(){
  'use strict';
  const id='yaya-chantier-toolbar-style-v4';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .chantier-fin-toolbar{
      display:flex!important;
      align-items:center!important;
      gap:9px!important;
      flex-wrap:wrap!important;
      width:100%!important;
      margin-top:12px!important;
      padding:10px 0 4px!important;
      border-top:1px solid rgba(22,45,73,.09)!important;
    }
    #pane-chantiers .chantier-fin-toolbar > button{
      height:38px!important;
      min-height:38px!important;
      margin:0!important;
      padding:0 15px!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:7px!important;
      border-radius:9px!important;
      font-size:12.5px!important;
      font-weight:650!important;
      line-height:1!important;
      white-space:nowrap!important;
      box-shadow:0 1px 2px rgba(22,45,73,.05)!important;
      transition:background .16s ease,border-color .16s ease,transform .16s ease!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .btnp{
      order:1!important;
      background:#e8f0fa!important;
      border:1px solid #bfd0e4!important;
      color:#294f78!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .btnp:hover{
      background:#dce8f5!important;
      border-color:#adc3dc!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .btn2:not(.chantier-archive-btn):not(.yaya-edit-chantier-btn):not(.chantier-delete-btn){
      order:2!important;
      background:#fbfaf7!important;
      border:1px solid #d8dde4!important;
      color:#294766!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .btn2:not(.chantier-archive-btn):not(.yaya-edit-chantier-btn):not(.chantier-delete-btn):hover{
      background:#f3f0e9!important;
      border-color:#c6ced8!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .yaya-edit-chantier-btn{
      order:3!important;
      margin-left:auto!important;
      background:#f4f7fb!important;
      border:1px solid #cbd6e3!important;
      color:#31567d!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .yaya-edit-chantier-btn:hover{
      background:#eaf0f7!important;
      border-color:#b7c7d9!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .chantier-archive-btn{
      order:4!important;
      background:#fff9f7!important;
      border:1px solid #e8d1cb!important;
      color:#9c554d!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .chantier-archive-btn:hover{
      background:#faefec!important;
      border-color:#ddbdb5!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .btn2.chantier-delete-btn,
    #pane-chantiers .chantier-fin-toolbar > .chantier-delete-btn{
      order:999!important;
      margin-left:0!important;
      background:#fff!important;
      border:1px solid #e6c4c1!important;
      color:#a64b43!important;
    }
    #pane-chantiers .chantier-fin-toolbar > button:active{
      transform:translateY(1px)!important;
    }
    @media(max-width:640px){
      #pane-chantiers .chantier-fin-toolbar{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        gap:8px!important;
      }
      #pane-chantiers .chantier-fin-toolbar > button{
        width:100%!important;
        min-width:0!important;
        margin:0!important;
        padding:0 9px!important;
        font-size:11.5px!important;
      }
      #pane-chantiers .chantier-fin-toolbar > .yaya-edit-chantier-btn{
        margin-left:0!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
