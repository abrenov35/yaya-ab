(function(){
'use strict';
if(window.__YAYA_VIEWPORT_DENSITY_V1)return;
window.__YAYA_VIEWPORT_DENSITY_V1=true;

const STYLE_ID='yaya-viewport-density-v1';

function install(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* =========================================================
       YAYA — DENSITÉ ÉCRAN
       Objectif : montrer davantage d'information sans ajouter
       de scroll interne ni réduire excessivement la lisibilité.
       ========================================================= */

    body > .body{
      padding-top:6px!important;
      padding-bottom:12px!important;
    }

    body > .body > [id^="pane-"]{
      margin-top:0!important;
      margin-bottom:0!important;
    }

    /* Cartes et panneaux généraux : moins de vide vertical. */
    #pane-chantiers > .card,
    #pane-achats > .card,
    #pane-documents > .card,
    #pane-heures > .card{
      margin-bottom:6px!important;
    }

    /* Fiche chantier ouverte */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs){
      padding-bottom:10px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{
      min-height:32px!important;
      margin-bottom:0!important;
      padding-top:2px!important;
      padding-bottom:8px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab{
      min-height:32px!important;
      height:32px!important;
      padding-left:9px!important;
      padding-right:9px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-action-row{
      min-height:38px!important;
      margin:0 0 6px!important;
      padding:4px 7px 4px 9px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-empty-pane{
      padding:10px 10px!important;
      margin-top:0!important;
    }

    /* Achats / charges / documents / mails dans la fiche */
    #pane-chantiers .yaya-detail-expense-row,
    #pane-chantiers .yaya-detail-charge-row,
    #pane-chantiers .yaya-detail-document-row,
    #pane-chantiers .yaya-detail-mail-row{
      min-height:44px!important;
      padding-top:6px!important;
      padding-bottom:6px!important;
    }

    /* Commandes : réduire surtout le vide entre les groupes. */
    #pane-chantiers .yaya-cmd-native-root .ycn-toolbar{
      min-height:42px!important;
      margin-bottom:8px!important;
      padding-top:5px!important;
      padding-bottom:5px!important;
    }

    #pane-chantiers .yaya-cmd-native-root .ycn-groups{
      gap:8px!important;
    }

    #pane-chantiers .yaya-cmd-native-root .ycn-group-head{
      min-height:31px!important;
    }

    #pane-chantiers .yaya-cmd-native-root .ycn-group-body,
    #pane-chantiers .yaya-cmd-native-root .ycn-group.open .ycn-group-body{
      padding:4px!important;
      gap:4px!important;
    }

    #pane-chantiers .yaya-cmd-native-root .ycn-empty{
      min-height:18px!important;
      padding:3px 6px!important;
      line-height:1.2!important;
    }

    /* Pages finances/documents : lignes lisibles mais moins hautes. */
    #pane-achats .controle-ligne,
    #pane-achats .charge-validee-ligne{
      min-height:46px!important;
    }

    #pane-documents .docligne,
    #pane-documents .doc-row-standard,
    #pane-docs .docligne,
    #pane-docs .doc-row-standard{
      min-height:38px!important;
    }

    /* Barres et titres secondaires */
    #pane-chantiers .seclabel,
    #pane-achats .section-title,
    #pane-documents .section-title,
    #pane-docs .section-title{
      margin-top:8px!important;
      margin-bottom:4px!important;
    }

    @media(max-width:760px){
      body > .body{
        padding-top:4px!important;
        padding-bottom:8px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs){
        padding-bottom:8px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-action-row{
        min-height:36px!important;
        margin:3px 0 5px!important;
      }

      #pane-chantiers .yaya-cmd-native-root .ycn-groups{
        gap:7px!important;
      }

      #pane-chantiers .yaya-detail-expense-row,
      #pane-chantiers .yaya-detail-charge-row,
      #pane-chantiers .yaya-detail-document-row,
      #pane-chantiers .yaya-detail-mail-row{
        min-height:42px!important;
      }
    }
  `;
  document.head.appendChild(s);
}

install();
window.__YAYA_VIEWPORT_DENSITY_VERSION='1.0';
})();