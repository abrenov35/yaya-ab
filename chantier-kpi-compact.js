(function(){
'use strict';
if(window.__YAYA_CHANTIER_KPI_COMPACT_V1)return;
window.__YAYA_CHANTIER_KPI_COMPACT_V1=true;

const STYLE_ID='yaya-chantier-kpi-compact-v1';

function install(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* Fiche chantier : haut plus compact, sans modifier les données. */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs){
      padding-top:10px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top{
      min-height:38px!important;
      margin-bottom:6px!important;
      padding-top:0!important;
      padding-bottom:0!important;
      gap:7px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top b{
      font-size:17px!important;
      line-height:1.1!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top .num{
      font-size:11.5px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
      gap:8px!important;
      margin-top:0!important;
      margin-bottom:7px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat{
      min-height:64px!important;
      height:64px!important;
      padding:6px 10px!important;
      border-radius:9px!important;
      justify-content:center!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat small{
      margin-bottom:2px!important;
      font-size:9.5px!important;
      line-height:1!important;
      letter-spacing:.055em!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat b{
      font-size:17px!important;
      line-height:1.05!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat .sub{
      margin-top:2px!important;
      font-size:9.5px!important;
      line-height:1!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{
      margin-top:0!important;
      margin-bottom:6px!important;
    }

    @media(max-width:760px){
      #pane-chantiers .card:has(> .yaya-detail-section-tabs){
        padding-top:8px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top{
        min-height:36px!important;
        margin-bottom:5px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
        gap:6px!important;
        margin-bottom:6px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat{
        min-height:58px!important;
        height:58px!important;
        padding:5px 7px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat small{
        font-size:9px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat b{
        font-size:15px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .stat .sub{
        font-size:9px!important;
      }
    }
  `;
  document.head.appendChild(s);
}

install();
window.__YAYA_CHANTIER_KPI_COMPACT_VERSION='1.0';
})();