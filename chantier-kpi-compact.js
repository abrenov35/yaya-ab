(function(){
'use strict';
if(window.__YAYA_CHANTIER_KPI_COMPACT_V2)return;
window.__YAYA_CHANTIER_KPI_COMPACT_V2=true;

const STYLE_ID='yaya-chantier-kpi-compact-v2';

function install(){
  ['yaya-chantier-kpi-compact-v1'].forEach(function(id){
    const old=document.getElementById(id);if(old)old.remove();
  });
  if(document.getElementById(STYLE_ID))return;

  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* Override final chargé en dernier : KPI volontairement plus compacts. */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs){
      padding-top:8px!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top{
      min-height:32px!important;
      height:auto!important;
      margin-top:0!important;
      margin-bottom:4px!important;
      padding-top:0!important;
      padding-bottom:0!important;
      gap:6px!important;
      box-sizing:border-box!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top b{
      font-size:16px!important;
      line-height:1!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
      gap:7px!important;
      margin-top:0!important;
      margin-bottom:5px!important;
      padding-top:0!important;
      padding-bottom:0!important;
      min-height:0!important;
      box-sizing:border-box!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat{
      min-height:54px!important;
      height:54px!important;
      max-height:54px!important;
      padding:4px 8px!important;
      margin:0!important;
      border-radius:8px!important;
      box-sizing:border-box!important;
      justify-content:center!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat small{
      margin:0 0 1px!important;
      font-size:8.8px!important;
      line-height:1!important;
      letter-spacing:.05em!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat b{
      font-size:15.5px!important;
      line-height:1!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat .sub{
      margin-top:1px!important;
      font-size:8.8px!important;
      line-height:1!important;
    }

    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{
      margin-top:0!important;
      margin-bottom:5px!important;
    }

    @media(max-width:760px){
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top{
        min-height:30px!important;
        margin-bottom:4px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
        gap:5px!important;
        margin-bottom:5px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat{
        min-height:50px!important;
        height:50px!important;
        max-height:50px!important;
        padding:3px 6px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat small,
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat .sub{
        font-size:8.3px!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis > .stat b{
        font-size:14px!important;
      }
    }
  `;
  document.head.appendChild(s);
}

install();
window.__YAYA_CHANTIER_KPI_COMPACT_VERSION='2.0-final-override';
})();