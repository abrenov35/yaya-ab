(function(){
  'use strict';
  if(window.__YAYA_COMMANDES_MOBILE_ACTIONS_FINAL_V2)return;
  window.__YAYA_COMMANDES_MOBILE_ACTIONS_FINAL_V2=true;

  const STYLE_ID='yaya-commandes-mobile-actions-final-v2';
  const MOBILE_QUERY='(max-width: 860px)';

  function installStyle(){
    let old=document.getElementById('yaya-commandes-mobile-actions-final-v1');
    if(old)old.remove();
    if(document.getElementById(STYLE_ID))return;

    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(max-width:860px){
        .yaya-cmd-native-root .ycn-row > .ycn-mobile-actions-final{
          display:flex!important;
          width:calc(100% - 16px)!important;
          max-width:none!important;
          margin:0 8px 8px 8px!important;
          gap:6px!important;
          box-sizing:border-box!important;
          align-items:stretch!important;
        }

        .yaya-cmd-native-root .ycn-row > .ycn-mobile-actions-final > .ycn-v4-status,
        .yaya-cmd-native-root .ycn-row > .ycn-mobile-actions-final > .ycn-v4-pieces,
        .yaya-cmd-native-root .ycn-row > .ycn-mobile-actions-final > .ycn-v4-url{
          width:0!important;
          min-width:0!important;
          max-width:none!important;
          height:32px!important;
          margin:0!important;
          box-sizing:border-box!important;
        }

        .yaya-cmd-native-root .ycn-row > .ycn-mobile-actions-final > .ycn-v4-status{
          flex:1.4 1 0!important;
        }

        .yaya-cmd-native-root .ycn-row > .ycn-mobile-actions-final > .ycn-v4-pieces{
          flex:1 1 0!important;
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
        }

        .yaya-cmd-native-root .ycn-row > .ycn-mobile-actions-final > .ycn-v4-url{
          flex:.8 1 0!important;
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
        }

        .yaya-cmd-native-root .ycn-row > .ycn-mobile-actions-final > .ycn-v4-url:disabled{
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
    if(btn)btn.textContent='🔗 Lien';
  }

  function forceImportant(el,prop,value){
    if(el)el.style.setProperty(prop,value,'important');
  }

  function applyValidatedLayout(row,wrap,status,piece,link){
    forceImportant(wrap,'display','flex');
    forceImportant(wrap,'width','calc(100% - 16px)');
    forceImportant(wrap,'max-width','none');
    forceImportant(wrap,'margin','0 8px 8px 8px');
    forceImportant(wrap,'gap','6px');
    forceImportant(wrap,'box-sizing','border-box');
    forceImportant(wrap,'align-items','stretch');

    [[status,'1.4 1 0'],[piece,'1 1 0'],[link,'.8 1 0']].forEach(function(pair){
      const el=pair[0],flex=pair[1];
      forceImportant(el,'flex',flex);
      forceImportant(el,'width','0');
      forceImportant(el,'min-width','0');
      forceImportant(el,'max-width','none');
      forceImportant(el,'height','32px');
      forceImportant(el,'margin','0');
      forceImportant(el,'box-sizing','border-box');
    });

    forceImportant(piece,'display','inline-flex');
    forceImportant(piece,'align-items','center');
    forceImportant(piece,'justify-content','center');

    forceImportant(link,'display','inline-flex');
    forceImportant(link,'align-items','center');
    forceImportant(link,'justify-content','center');

    if(link.disabled){
      forceImportant(link,'visibility','hidden');
      forceImportant(link,'pointer-events','none');
    }else{
      link.style.removeProperty('visibility');
      link.style.removeProperty('pointer-events');
    }
  }

  function moveMobile(row){
    if(!row)return;
    const top=row.querySelector(':scope > .ycn-row-top');
    if(!top)return;

    const status=row.querySelector('.ycn-v4-status');
    const piece=row.querySelector('.ycn-v4-pieces');
    const link=row.querySelector('.ycn-v4-url');
    if(!status||!piece||!link)return;

    let wrap=row.querySelector(':scope > .ycn-mobile-actions-final');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='ycn-mobile-actions-final';
      row.appendChild(wrap);
    }

    compactPiece(piece);
    compactLink(link);
    wrap.append(status,piece,link);
    applyValidatedLayout(row,wrap,status,piece,link);
  }

  function restoreDesktop(row){
    if(!row)return;
    const top=row.querySelector(':scope > .ycn-row-top');
    const wrap=row.querySelector(':scope > .ycn-mobile-actions-final');
    if(!top||!wrap)return;

    const status=wrap.querySelector('.ycn-v4-status');
    const piece=wrap.querySelector('.ycn-v4-pieces');
    const link=wrap.querySelector('.ycn-v4-url');

    [status,piece,link].forEach(function(el){
      if(!el)return;
      ['flex','width','min-width','max-width','height','margin','box-sizing','display','align-items','justify-content','visibility','pointer-events'].forEach(function(prop){
        el.style.removeProperty(prop);
      });
    });

    if(status)top.appendChild(status);
    if(piece)top.appendChild(piece);
    if(link)top.appendChild(link);
    wrap.remove();
  }

  function refresh(){
    installStyle();
    const mobile=window.matchMedia(MOBILE_QUERY).matches;
    document.querySelectorAll('.yaya-cmd-native-root .ycn-row').forEach(function(row){
      if(mobile)moveMobile(row);
      else restoreDesktop(row);
    });
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
