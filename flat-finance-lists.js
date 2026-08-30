(function(){
  'use strict';

  function install(){
    if(document.getElementById('yaya-flat-finance-lists-v1'))return;
    const style=document.createElement('style');
    style.id='yaya-flat-finance-lists-v1';
    style.textContent=`
      /* Listes plates et contrastées : Documents, Dépenses et Sous-traitants. */
      #pane-documents > .card,
      #pane-achats .controle-card,
      #pane-achats .validees-card,
      #pane-sous-traitant .st-list{
        margin:0!important;
        padding:0!important;
        overflow:visible!important;
        border:0!important;
        border-left:0!important;
        border-radius:0!important;
        background:transparent!important;
        box-shadow:none!important;
      }

      #pane-documents > .card > .achligne.ligR,
      #pane-achats .controle-ligne,
      #pane-achats .charge-validee-ligne,
      #pane-sous-traitant .st-row{
        border:0!important;
        border-top:0!important;
        border-bottom:0!important;
        border-left:0!important;
        border-radius:0!important;
        box-shadow:none!important;
      }

      #pane-documents > .card > .achligne.ligR:nth-child(odd),
      #pane-achats .controle-card > .controle-ligne:nth-child(odd),
      #pane-achats .validees-card > .charge-validee-ligne:nth-child(odd),
      #pane-sous-traitant .st-row:nth-child(odd){
        background:#ffffff!important;
      }
      #pane-documents > .card > .achligne.ligR:nth-child(even),
      #pane-achats .controle-card > .controle-ligne:nth-child(even),
      #pane-achats .validees-card > .charge-validee-ligne:nth-child(even),
      #pane-sous-traitant .st-row:nth-child(even){
        background:#edf3f8!important;
      }

      #pane-documents > .card > .achligne.ligR{
        min-height:58px!important;
        padding:11px 12px!important;
      }
      #pane-achats .controle-ligne,
      #pane-achats .charge-validee-ligne,
      #pane-sous-traitant .st-row{
        min-height:54px!important;
        padding:10px 12px!important;
      }

      /* Le type reste une colonne de la liste, sans capsule. */
      #pane-documents .achligne.ligR > span:first-child,
      #pane-documents .achligne.ligR > .badge:nth-child(1),
      #pane-achats .charge-row-standard > .badge:first-child,
      #pane-sous-traitant .st-type{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        width:auto!important;
        min-width:0!important;
        max-width:100%!important;
        height:auto!important;
        min-height:0!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        color:#153654!important;
        box-shadow:none!important;
        font-weight:800!important;
        text-align:left!important;
      }

      #pane-documents .achligne.ligR:hover,
      #pane-achats .controle-ligne:hover,
      #pane-achats .charge-validee-ligne:hover,
      #pane-sous-traitant .st-row:hover{
        background:#e3edf6!important;
      }

      @media(max-width:760px){
        #pane-documents > .card > .achligne.ligR,
        #pane-achats .controle-ligne,
        #pane-achats .charge-validee-ligne,
        #pane-sous-traitant .st-row{
          padding:10px 8px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,200);
})();
