(function(){
  'use strict';

  const STYLE_ID='yaya-colored-view-eyes-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-detail-document-view,
      .yaya-detail-charge-view,
      .yaya-detail-commande-view{
        font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif!important;
        font-size:18px!important;
        line-height:1!important;
      }
    `;
    document.head.appendChild(style);
  }

  function apply(root){
    const scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll('.yaya-detail-document-view,.yaya-detail-charge-view,.yaya-detail-commande-view').forEach(function(button){
      if(String(button.textContent||'').trim()!=='👁️')button.textContent='👁️';
    });
  }

  function install(){
    installStyle();
    apply(document);

    const root=document.getElementById('pane-chantiers')||document.body;
    if(!root)return;

    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        apply(root);
      });
    }).observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
