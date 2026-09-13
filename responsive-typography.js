(function(){
  'use strict';

  const STYLE_ID='yaya-responsive-typography-v205651';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    :root{
      --yaya-font-base:clamp(13.5px,calc(11.5px + .20vw),15.5px);
      --yaya-font-ui:clamp(13.2px,calc(11.4px + .17vw),14.8px);
      --yaya-font-small:clamp(11px,calc(9.7px + .12vw),12.4px);
      --yaya-font-title:clamp(16px,calc(13.5px + .23vw),18.5px);
      --yaya-font-kpi:clamp(16.5px,calc(13.7px + .25vw),19px);
    }

    html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
    body{
      font-size:var(--yaya-font-base)!important;
      line-height:1.34;
      -webkit-font-smoothing:antialiased;
      text-rendering:optimizeLegibility;
    }

    .hdr .brand b{font-size:clamp(21px,calc(18px + .28vw),24px)!important}
    .hdr .brand span,.hdr .sync{font-size:var(--yaya-font-small)!important}

    .tab,
    .fiche-inter-tab,
    .btn2,
    .btnp,
    .btn-valid,
    .inp,
    .msel,
    .mnum,
    input,
    select,
    textarea{
      font-size:var(--yaya-font-ui)!important;
    }

    table{font-size:var(--yaya-font-ui)!important}
    th{font-size:var(--yaya-font-small)!important}
    td{line-height:1.3}

    .weekbar b,
    .tot,
    .card .top b,
    .modal h5{
      font-size:var(--yaya-font-title)!important;
    }

    .stat b{font-size:var(--yaya-font-kpi)!important}

    .chip,
    .achligne,
    .note,
    .hint,
    .okmsg,
    .badge,
    .seclabel,
    .section-header,
    .ligD .des,
    .ligR .des,
    .card .top .num,
    .stat .sub,
    .stat small,
    .who small,
    .tot small{
      font-size:var(--yaya-font-small)!important;
      line-height:1.3;
    }

    #toast,.tooltip-avoir,.scan-zone,.scan-ok{
      font-size:var(--yaya-font-ui)!important;
    }

    @media (min-width:1600px){
      :root{
        --yaya-font-base:15.5px;
        --yaya-font-ui:14.8px;
        --yaya-font-small:12.3px;
      }
    }

    @media (max-width:1100px){
      :root{
        --yaya-font-base:14px;
        --yaya-font-ui:13.5px;
        --yaya-font-small:11.2px;
        --yaya-font-title:16px;
        --yaya-font-kpi:17px;
      }
    }

    @media (max-width:760px){
      :root{
        --yaya-font-base:14.5px;
        --yaya-font-ui:14px;
        --yaya-font-small:11.5px;
        --yaya-font-title:16.5px;
      }
      input,select,textarea{font-size:16px!important}
      .tab,.fiche-inter-tab{font-size:13.5px!important}
    }
  `;

  document.head.appendChild(style);
  window.__YAYA_RESPONSIVE_TYPOGRAPHY_VERSION='205.651';
})();
