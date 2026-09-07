(function(){
  'use strict';

  const STYLE_ID='yaya-charge-layout-inline-v1';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row{
      min-height:54px!important;
      padding:9px 12px!important;
      column-gap:14px!important;
      align-items:center!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong{
      min-width:0!important;
      display:flex!important;
      align-items:center!important;
      gap:5px 12px!important;
      flex-wrap:wrap!important;
      line-height:1.3!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong > small:not(.yaya-history-date){
      display:inline!important;
      margin:0!important;
      color:#596579!important;
      font-size:12px!important;
      font-weight:500!important;
      line-height:1.3!important;
      white-space:normal!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong > .yaya-history-date{
      display:inline!important;
      margin:0 0 0 auto!important;
      padding-left:14px!important;
      color:#7a8798!important;
      font-size:10.5px!important;
      font-weight:500!important;
      line-height:1.3!important;
      white-space:nowrap!important;
    }

    @media(max-width:640px){
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row{
        min-height:52px!important;
        padding:8px 9px!important;
        column-gap:8px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong{
        gap:4px 8px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong > .yaya-history-date{
        padding-left:8px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
