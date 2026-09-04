(function(){
  'use strict';

  const BADGE_ID='yayaBuildVersion';
  const STYLE_ID='yaya-build-version-style';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${BADGE_ID}{
        display:inline-flex!important;
        align-items:center!important;
        height:22px!important;
        padding:0 7px!important;
        margin-left:4px!important;
        border:1px solid rgba(201,162,39,.52)!important;
        border-radius:999px!important;
        background:rgba(201,162,39,.10)!important;
        color:#C9A227!important;
        font-size:10px!important;
        font-weight:800!important;
        line-height:1!important;
        letter-spacing:.03em!important;
        text-transform:none!important;
        white-space:nowrap!important;
      }
      @media(max-width:760px){
        .hdr .brand #${BADGE_ID}{display:inline-flex!important;font-size:9.5px!important;height:20px!important;padding:0 6px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function show(version){
    installStyle();
    const title='Yaya v'+version+' — AB RENOV 35';
    document.title=title;
    document.documentElement.setAttribute('data-yaya-version',version);

    const brand=document.querySelector('.hdr .brand');
    if(!brand){setTimeout(function(){show(version);},120);return;}

    let badge=document.getElementById(BADGE_ID);
    if(!badge){
      badge=document.createElement('span');
      badge.id=BADGE_ID;
      badge.title='Version déployée de Yaya';
      brand.appendChild(badge);
    }
    badge.textContent='v'+version;
  }

  fetch('version.txt?_yaya_version='+Date.now(),{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('version '+r.status);return r.text();})
    .then(function(v){v=String(v||'').trim();if(/^\d+\.\d+$/.test(v))show(v);})
    .catch(function(){});
})();
