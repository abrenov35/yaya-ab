(function(){
  'use strict';

  if(window.__yayaMailFullscreenFastViewV1)return;
  window.__yayaMailFullscreenFastViewV1=true;

  const STYLE_ID='yaya-mail-fullscreen-fast-view-v1';

  function preconnect(href){
    if(document.querySelector('link[rel="preconnect"][href="'+href+'"]'))return;
    const link=document.createElement('link');
    link.rel='preconnect';
    link.href=href;
    link.crossOrigin='anonymous';
    document.head.appendChild(link);
  }

  function install(){
    if(!document.getElementById(STYLE_ID)){
      const style=document.createElement('style');
      style.id=STYLE_ID;
      style.textContent=`
        /* Lecture des mails : toute la surface utile de l'onglet. */
        #modalRoot .overlay:has(> .yaya-mail-body-modal),
        #modalRoot .overlay:has(> .message-modal),
        #modalRoot .overlay:has(> .yaya-mail-fullscreen-modal),
        #modalRoot .piece-preview-overlay{
          box-sizing:border-box!important;
          padding:6px!important;
          align-items:stretch!important;
          justify-content:stretch!important;
          overflow:hidden!important;
        }

        #modalRoot .yaya-mail-body-modal,
        #modalRoot .message-modal,
        #modalRoot .yaya-mail-fullscreen-modal,
        #modalRoot .piece-preview-modal{
          box-sizing:border-box!important;
          width:calc(100vw - 12px)!important;
          height:calc(100dvh - 12px)!important;
          max-width:none!important;
          max-height:none!important;
          min-height:0!important;
          margin:0!important;
          display:flex!important;
          flex-direction:column!important;
          overflow:hidden!important;
        }

        #modalRoot .yaya-mail-body-modal .yaya-mail-body-meta{
          flex:0 0 auto!important;
          margin-bottom:8px!important;
          padding:8px 12px!important;
        }

        #modalRoot .yaya-mail-body-modal .yaya-mail-body-content,
        #modalRoot .message-modal .yaya-mail-body-content,
        #modalRoot .yaya-mail-fullscreen-modal .yaya-mail-body-content{
          flex:1 1 auto!important;
          min-height:0!important;
          max-height:none!important;
          overflow:auto!important;
          overscroll-behavior:contain!important;
        }

        #modalRoot .yaya-mail-body-modal .yaya-read-actions,
        #modalRoot .message-modal .yaya-read-actions,
        #modalRoot .yaya-mail-fullscreen-modal .yaya-read-actions{
          flex:0 0 auto!important;
          margin-top:8px!important;
          padding-top:8px!important;
        }

        #modalRoot .piece-preview-modal{
          border-radius:8px!important;
          padding:6px!important;
        }

        #modalRoot .piece-preview-stage{
          flex:1 1 auto!important;
          min-height:0!important;
          width:100%!important;
        }

        @media(max-width:640px){
          #modalRoot .overlay:has(> .yaya-mail-body-modal),
          #modalRoot .overlay:has(> .message-modal),
          #modalRoot .overlay:has(> .yaya-mail-fullscreen-modal),
          #modalRoot .piece-preview-overlay{
            padding:3px!important;
          }
          #modalRoot .yaya-mail-body-modal,
          #modalRoot .message-modal,
          #modalRoot .yaya-mail-fullscreen-modal,
          #modalRoot .piece-preview-modal{
            width:calc(100vw - 6px)!important;
            height:calc(100dvh - 6px)!important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    /* Réduit le délai DNS/TLS avant la première pièce Drive ou API Yaya. */
    preconnect('https://drive.google.com');
    preconnect('https://drive.usercontent.google.com');
    preconnect('https://script.google.com');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
