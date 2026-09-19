(function(){
  'use strict';
  if(window.__YAYA_COMMANDES_MOBILE_ACTIONS_FINAL_V1)return;
  window.__YAYA_COMMANDES_MOBILE_ACTIONS_FINAL_V1=true;

  const STYLE_ID='yaya-commandes-mobile-actions-final-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .yaya-cmd-native-root .ycn-mobile-actions-final{display:contents}

      @media(max-width:860px){
        .yaya-cmd-native-root .ycn-row-top{
          grid-template-columns:minmax(0,1fr)!important;
          gap:5px!important;
          padding:7px!important;
        }

        .yaya-cmd-native-root .ycn-row-summary strong{
          grid-column:1!important;
          min-width:0!important;
          width:100%!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
          white-space:nowrap!important;
        }

        .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{
          grid-column:1!important;
          min-width:0!important;
          width:100%!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
          white-space:nowrap!important;
        }

        .yaya-cmd-native-root .ycn-mobile-actions-final{
          grid-column:1!important;
          display:grid!important;
          grid-template-columns:minmax(0,1.2fr) minmax(0,.9fr) minmax(0,.75fr)!important;
          gap:4px!important;
          width:100%!important;
          min-width:0!important;
          align-items:stretch!important;
        }

        .yaya-cmd-native-root .ycn-mobile-actions-final > .ycn-v4-status,
        .yaya-cmd-native-root .ycn-mobile-actions-final > .ycn-v4-pieces,
        .yaya-cmd-native-root .ycn-mobile-actions-final > .ycn-v4-url{
          width:100%!important;
          min-width:0!important;
          max-width:none!important;
          height:30px!important;
          margin:0!important;
          padding:0 4px!important;
          box-sizing:border-box!important;
          align-self:stretch!important;
          justify-self:stretch!important;
          font-size:9.5px!important;
          line-height:1!important;
        }

        .yaya-cmd-native-root .ycn-mobile-actions-final > .ycn-v4-status{
          grid-column:1!important;
        }
        .yaya-cmd-native-root .ycn-mobile-actions-final > .ycn-v4-pieces{
          grid-column:2!important;
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
        }
        .yaya-cmd-native-root .ycn-mobile-actions-final > .ycn-v4-url{
          grid-column:3!important;
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
        }
        .yaya-cmd-native-root .ycn-mobile-actions-final > .ycn-v4-url:disabled{
          display:inline-flex!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function compactPiece(btn){
    if(!btn)return;
    const raw=String(btn.textContent||'');
    const m=raw.match(/\((\d+)\)|\b(\d+)\b/);
    const n=m?Number(m[1]||m[2]||0):0;
    btn.textContent=n>1?('📎 '+n):'📎 Pièce';
  }

  function compactLink(btn){
    if(!btn)return;
    btn.textContent='🔗 Lien';
  }

  function fixRow(top){
    if(!top||top.dataset.yayaMobileActionsFinal==='1')return;
    const status=top.querySelector('.ycn-v4-status');
    const piece=top.querySelector('.ycn-v4-pieces');
    const link=top.querySelector('.ycn-v4-url');
    if(!status||!piece||!link)return;

    let wrap=top.querySelector(':scope > .ycn-mobile-actions-final');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='ycn-mobile-actions-final';
      top.appendChild(wrap);
    }

    compactPiece(piece);
    compactLink(link);

    wrap.appendChild(status);
    wrap.appendChild(piece);
    wrap.appendChild(link);
    top.dataset.yayaMobileActionsFinal='1';
  }

  function refresh(){
    installStyle();
    document.querySelectorAll('.yaya-cmd-native-root .ycn-row-top').forEach(fixRow);
  }

  refresh();
  setTimeout(refresh,80);
  setTimeout(refresh,300);
  setTimeout(refresh,900);

  const mo=new MutationObserver(function(){
    clearTimeout(window.__yayaCmdMobileActionsTimer);
    window.__yayaCmdMobileActionsTimer=setTimeout(refresh,30);
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});

  window.addEventListener('yaya:data-refreshed',()=>setTimeout(refresh,20));
  window.addEventListener('resize',()=>setTimeout(refresh,20));
})();
