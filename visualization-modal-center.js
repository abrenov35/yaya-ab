(function(){
  'use strict';

  if(window.__yayaVisualizationModalCenterV1)return;
  window.__yayaVisualizationModalCenterV1=true;

  const ROOT_ID='modalRoot';
  const STYLE_ID='yaya-visualization-modal-center-v1';
  let raf=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID} .overlay.yaya-view-overlay-centered{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        box-sizing:border-box!important;
        overflow:auto!important;
        overscroll-behavior:contain!important;
      }
      #${ROOT_ID} .yaya-view-modal-centered{
        box-sizing:border-box!important;
        margin:auto!important;
      }
      #${ROOT_ID} .yaya-view-modal-centered > h5,
      #${ROOT_ID} .yaya-view-modal-centered .piece-preview-head{
        position:sticky!important;
        top:0!important;
        z-index:50!important;
      }
    `;
    document.head.appendChild(style);
  }

  function viewport(){
    const vv=window.visualViewport;
    return {
      width:Math.max(320,Math.round((vv&&vv.width)||window.innerWidth||document.documentElement.clientWidth||0)),
      height:Math.max(320,Math.round((vv&&vv.height)||window.innerHeight||document.documentElement.clientHeight||0))
    };
  }

  function safeTop(){
    let bottom=0;
    const seen=new Set();
    ['.hdr','.toolbar','.topbar','header','[data-yaya-toolbar]'].forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        if(!el||seen.has(el))return;
        seen.add(el);
        const cs=getComputedStyle(el);
        if(cs.display==='none'||cs.visibility==='hidden')return;
        const r=el.getBoundingClientRect();
        if(r.width<=0||r.height<=0||r.bottom<=0||r.top>24)return;
        if(selector!=='.hdr'&&cs.position!=='fixed'&&cs.position!=='sticky')return;
        bottom=Math.max(bottom,Math.ceil(r.bottom));
      });
    });
    return Math.max(0,bottom);
  }

  function isVisualizationModal(modal){
    if(!modal)return false;
    if(
      modal.classList.contains('piece-preview-modal')||
      modal.classList.contains('yaya-mail-body-modal')||
      modal.classList.contains('yaya-document-read-modal')
    )return true;

    if(modal.querySelector('.piece-preview-stage,.piece-pdf-pages,.piece-image-stage,.piece-drive-pages-stage'))return true;

    const hasViewer=!!modal.querySelector('iframe,embed,object,video,img');
    const hasEditor=!!modal.querySelector('input:not([type="hidden"]),textarea,select');
    if(hasViewer&&!hasEditor)return true;

    const title=String(modal.querySelector('h5,h4,h3')?.textContent||'').trim();
    return /^(aperçu|visualisation|lecture|pi[eè]ce jointe|document|[ée]change chantier)/i.test(title)&&!hasEditor;
  }

  function applyModal(modal){
    if(!isVisualizationModal(modal))return;
    const overlay=modal.closest('.overlay');
    if(!overlay)return;

    const vp=viewport();
    const top=safeTop();
    const mobile=vp.width<=640;
    const gap=mobile?6:12;
    const side=mobile?5:12;
    const available=Math.max(260,vp.height-top-(gap*2));

    overlay.classList.add('yaya-view-overlay-centered');
    modal.classList.add('yaya-view-modal-centered');

    overlay.style.setProperty('align-items','center','important');
    overlay.style.setProperty('justify-content','center','important');
    overlay.style.setProperty('padding',(top+gap)+'px '+side+'px '+gap+'px','important');
    overlay.style.setProperty('box-sizing','border-box','important');
    overlay.style.setProperty('overflow','auto','important');

    modal.style.setProperty('margin','auto','important');
    modal.style.setProperty('max-height',available+'px','important');

    if(modal.classList.contains('piece-preview-modal')){
      const h=Math.max(260,available-(mobile?4:8));
      modal.style.setProperty('height',h+'px','important');
      modal.style.setProperty('max-height',h+'px','important');
    }else{
      modal.style.setProperty('overflow-y','auto','important');
    }
  }

  function apply(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    root.querySelectorAll('.overlay .modal').forEach(applyModal);
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;apply();});
  }

  function install(){
    installStyle();
    const root=document.getElementById(ROOT_ID);
    if(!root){setTimeout(install,120);return;}

    new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});
    if(window.visualViewport)window.visualViewport.addEventListener('resize',schedule,{passive:true});
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
